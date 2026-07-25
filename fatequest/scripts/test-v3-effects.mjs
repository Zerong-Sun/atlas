#!/usr/bin/env node
/** Unit tests for v3 effects / fog unlock / endings / lot alias */
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
let failed = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    failed++;
  } else {
    console.log('ok:', msg);
  }
}

function loadEngine() {
  const ctx = {
    window: { FQ: {} },
    FQ: {},
    console,
    navigator: { language: 'zh' },
    localStorage: { _d: {}, getItem(k) { return this._d[k] || null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } }
  };
  ctx.window.FQ = ctx.FQ;
  ctx.FQ.dayKey = () => '2026-07-26';
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/state.js'), 'utf8'), ctx, { filename: 'state.js' });
  vm.runInNewContext(fs.readFileSync(path.join(root, 'js/effects.js'), 'utf8'), ctx, { filename: 'effects.js' });
  ctx.FQ.load();
  const loadJson = name => JSON.parse(fs.readFileSync(path.join(root, 'assets/data', name), 'utf8'));
  const pack = {
    cities: loadJson('cities.json'),
    routes: loadJson('routes.json'),
    goods: loadJson('goods.json'),
    endings: loadJson('endings.json'),
    divinations: loadJson('divinations.json'),
    archetypes: loadJson('archetypes.json')
  };
  const index = arr => Object.fromEntries(arr.map(r => [r.id, r]));
  ctx.FQ.DB = {
    ...pack,
    city: index(pack.cities),
    route: index(pack.routes),
    good: index(pack.goods),
    ending: index(pack.endings),
    divination: index(pack.divinations),
    archetype: index(pack.archetypes),
    routes: pack.routes,
    endings: pack.endings,
    cities: pack.cities
  };
  ctx.FQ.lang = 'zh';
  return ctx.FQ;
}

const FQ = loadEngine();
const w = FQ.ensureWorld();
w.at = 'venice';
w.archetype = 'marco';
w.visited = ['venice'];
w.unlockedCities = ['venice'];
w.unlockedRoutes = ['rt-venice-acre'];
w.coins = 40;
w.bag = [];
w.bagSlots = 2;
w.learned = [];
w.flags = {};
w.languages = ['italian'];

/* fog: revealMap should not flood all cities */
FQ.applyEffects([{ op: 'revealMap', value: 'acre' }]);
assert(w.unlockedCities.includes('acre') && w.unlockedCities.length === 2, 'revealMap only adds target city (no flood)');

FQ.applyEffects([{ op: 'unlockRoute', value: 'rt-acre-tabriz' }]);
assert(w.unlockedRoutes.includes('rt-acre-tabriz'), 'unlockRoute adds route');
assert(w.unlockedCities.includes('tabriz'), 'unlockRoute reveals endpoints');
assert(w.unlockedCities.length <= 4, 'still no corridor flood after one unlock');

/* bag full blocks coin spend */
w.bag = [{ kind: 'goods', id: 'silk', n: 1 }, { kind: 'goods', id: 'spice', n: 1 }];
w.coins = 40;
const blocked = FQ.applyEffects([{ op: 'coins', value: -6 }, { op: 'goods', id: 'glass', value: 1 }]);
assert(!blocked.ok && blocked.blocked === 'bag_full', 'bag full blocks purchase effects');
assert(w.coins === 40, 'coins unchanged when bag blocks');

/* stack into existing slot ok */
w.bag = [{ kind: 'goods', id: 'silk', n: 1 }];
const stacked = FQ.applyEffects([{ op: 'goods', id: 'silk', value: 1 }]);
assert(stacked.ok && w.bag[0].n === 2, 'stacking goods ignores bagSlots length');

/* lot ↔ jiaobei alias */
FQ.applyEffects([{ op: 'learnDivination', value: 'lot' }]);
assert(w.learned.includes('lot') && w.learned.includes('jiaobei'), 'lot aliases to jiaobei');

/* faith ending path */
FQ.applyEffects([{ op: 'faith', value: 'islam' }]);
assert(w.flags.faithChanges >= 1 && w.faith === 'islam', 'faith change increments flag');

/* epilogue */
const stop = FQ.DB.endings.find(e => e.layer === 1);
const epi = FQ.renderEpilogue(stop);
assert(epi.includes('威尼斯') || epi.includes('Venice'), 'epilogue interpolates city');

/* paiza good exists */
assert(!!FQ.DB.good.paiza, 'paiza good registered');

/* travel direction helper: dest opposite endpoint */
const r = FQ.DB.route['rt-venice-acre'];
const dest = r.from === 'venice' ? r.to : r.from;
assert(dest === 'acre', 'travel dest from venice is acre');

/* M2: divination table effects lower route risk + may unlock side route */
w.at = 'tabriz';
w.unlockedRoutes = ['rt-acre-tabriz'];
w.unlockedCities = ['tabriz', 'acre'];
w.routeMods = {};
w.omen = { route_risk: 0, info_clarity: 0, weather_forecast: 0, omen_clarity: 0, temple_favor: 0 };
const beforeRoutes = w.unlockedRoutes.length;
const beforeRisk = FQ.effectiveRouteRisk(FQ.DB.route['rt-acre-tabriz']);
FQ.applyDivinationTableEffects('iching', true, 'rt-acre-tabriz');
assert((w.routeMods['rt-acre-tabriz'] || {}).route_risk === -2, 'pass applies route_risk delta as authored');
const afterRisk = FQ.effectiveRouteRisk(FQ.DB.route['rt-acre-tabriz']);
assert(afterRisk < beforeRisk, 'effective route risk falls on pass');
assert(w.unlockedRoutes.length >= beforeRoutes, 'side route unlock possible after reading');

/* fail inverts delta (risk rises) */
w.routeMods = {};
w.omen = { route_risk: 0, info_clarity: 0, weather_forecast: 0, omen_clarity: 0, temple_favor: 0 };
FQ.applyDivinationTableEffects('iching', false, 'rt-acre-tabriz');
assert((w.routeMods['rt-acre-tabriz'] || {}).route_risk === 2, 'fail inverts route_risk delta');
assert((w.omen.info_clarity || 0) === -1, 'fail inverts positive omen stats');

/* M3: battuta tables present */
assert(!!FQ.DB.city.tangier && !!FQ.DB.city.mecca, 'battuta cities present');
assert(!!FQ.DB.archetype.battuta, 'battuta archetype present');
assert(!!FQ.DB.ending['end-battuta-witness'] || FQ.DB.endings.some(e => e.id === 'end-battuta-witness'), 'battuta ending present');
assert(!!FQ.DB.route['rt-battuta-tangier-cairo'], 'battuta spine route present');
assert((FQ.DB.city.baghdad.exits || []).includes('rt-baghdad-damascus'), 'baghdad lists bridge exit');

/* codex unlock */
FQ.applyEffects([{ op: 'codex', value: 'cx-venice' }]);
assert(w.codex.includes('cx-venice'), 'codex unlock stores id');

/* goto event opcode stored in ctx */
const ctx = {};
FQ.applyEffects([{ op: 'goto', value: 'event:ev-cairo-tree-2' }], ctx);
assert(ctx.goto === 'event:ev-cairo-tree-2', 'goto event id preserved in ctx');

if (failed) {
  console.error(`\n${failed} test(s) failed`);
  process.exit(1);
}
console.log('\nALL TESTS PASSED');
