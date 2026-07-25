#!/usr/bin/env node
/** Validate FateQuest v3 system tables (M0). Exit 1 on failure. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../assets/data');
const EFFECT_OPS = new Set([
  'coins','days','goods','item','reputation','faith','language','etiquette',
  'fate','unlockRoute','revealMap','learnDivination','recruit','retainerMood',
  'sticker','codex','flag','goto'
]);

const errors = [];
const warn = [];

function load(name) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) { errors.push(`missing ${name}`); return null; }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function biOk(obj, label) {
  if (!obj || typeof obj.zh !== 'string' || typeof obj.en !== 'string') {
    errors.push(`${label}: need {zh,en}`);
  }
}

function checkEffects(effects, label) {
  if (!Array.isArray(effects)) return;
  for (const e of effects) {
    if (!e.op || !EFFECT_OPS.has(e.op)) errors.push(`${label}: bad op ${e?.op}`);
  }
}

function walkChoices(choices, label) {
  if (!Array.isArray(choices)) return;
  for (const c of choices) {
    biOk(c.label, `${label}.label`);
    checkEffects(c.effects, `${label}.effects`);
    if (c.pass) checkEffects(c.pass.effects, `${label}.pass`);
    if (c.fail) checkEffects(c.fail.effects, `${label}.fail`);
  }
}

const cities = load('cities.json') || [];
const routes = load('routes.json') || [];
const transports = load('transports.json') || [];
const events = load('events.json') || [];
const goods = load('goods.json') || [];
const divinations = load('divinations.json') || [];
const retainers = load('retainers.json') || [];
const archetypes = load('archetypes.json') || [];
const endings = load('endings.json') || [];

const cityIds = new Set(cities.map(c => c.id));
const routeIds = new Set(routes.map(r => r.id));
const eventIds = new Set(events.map(e => e.id));
const goodIds = new Set(goods.map(g => g.id));
const divIds = new Set(divinations.map(d => d.id));
const retIds = new Set(retainers.map(r => r.id));

const FULL = ['tabriz','baghdad','hormuz','balkh','samarkand','kashgar','khotan','lop','shangdu','khanbaliq','hangzhou','quanzhou'];
for (const id of FULL) {
  if (!cityIds.has(id)) errors.push(`missing full city ${id}`);
  else {
    const c = cities.find(x => x.id === id);
    if (!c.entryEvent || !eventIds.has(c.entryEvent)) errors.push(`${id}: bad entryEvent`);
    if (!Array.isArray(c.sites) || c.sites.length !== 3) errors.push(`${id}: need 3 sites`);
    else c.sites.forEach(s => { if (!eventIds.has(s)) errors.push(`${id}: missing site event ${s}`); });
    if (!c.market?.goods?.length) errors.push(`${id}: market.goods`);
    if (!c.shrine?.faith) errors.push(`${id}: shrine`);
    if (!c.mentor || !retIds.has(c.mentor)) errors.push(`${id}: mentor ${c.mentor}`);
    if (!Array.isArray(c.exits)) errors.push(`${id}: exits`);
    biOk(c.name, `city ${id}.name`);
  }
}
for (const id of ['venice','acre']) {
  if (!cityIds.has(id)) errors.push(`missing prologue city ${id}`);
}

const seen = new Set();
for (const c of cities) {
  if (seen.has(c.id)) errors.push(`dup city ${c.id}`);
  seen.add(c.id);
}

for (const r of routes) {
  if (!cityIds.has(r.from) || !cityIds.has(r.to)) errors.push(`route ${r.id}: bad endpoints`);
  for (const m of r.modes || []) {
    if (!transports.find(t => t.id === m)) errors.push(`route ${r.id}: unknown mode ${m}`);
  }
  for (const eid of r.encounters || []) {
    if (!eventIds.has(eid)) warn.push(`route ${r.id}: encounter ${eid} missing`);
  }
}

if (goods.length < 60) errors.push(`goods ${goods.length} < 60`);
for (const g of goods) biOk(g.name, `good ${g.id}`);

if (divinations.length < 3) errors.push('need ≥3 divinations');
for (const d of divinations) {
  biOk(d.name, `div ${d.id}`);
  if (!Array.isArray(d.effects) || !d.effects.length) errors.push(`div ${d.id}: empty effects`);
  if (d.teacher && !retIds.has(d.teacher)) errors.push(`div ${d.id}: teacher ${d.teacher}`);
}

if (retainers.length < 12) errors.push(`retainers ${retainers.length} < 12`);
if (archetypes.length < 3) errors.push('need 3 archetypes');
for (const a of archetypes) {
  biOk(a.name, `arch ${a.id}`);
  if (!cityIds.has(a.start)) errors.push(`arch ${a.id}: start ${a.start}`);
}

if (endings.length < 8) errors.push(`endings ${endings.length} < 8`);
const layers = endings.map(e => e.layer);
if (!layers.includes(1)) errors.push('need layer-1 stop ending');

for (const e of events) {
  biOk(e.title, `event ${e.id}`);
  biOk(e.body, `event ${e.id}.body`);
  walkChoices(e.choices, `event ${e.id}`);
  for (const ch of e.choices || []) {
    if (ch.divination && !divIds.has(ch.divination)) errors.push(`${e.id}: unknown divination ${ch.divination}`);
    for (const fx of [...(ch.effects||[]), ...(ch.pass?.effects||[]), ...(ch.fail?.effects||[])]) {
      if (fx.op === 'goods' && fx.id && !goodIds.has(fx.id)) errors.push(`${e.id}: unknown good ${fx.id}`);
      if (fx.op === 'unlockRoute' && fx.value && !routeIds.has(fx.value)) errors.push(`${e.id}: unknown route ${fx.value}`);
      if (fx.op === 'learnDivination' && fx.value && !divIds.has(fx.value)) errors.push(`${e.id}: unknown learn ${fx.value}`);
      if (fx.op === 'recruit' && fx.value && !retIds.has(fx.value)) errors.push(`${e.id}: unknown retainer ${fx.value}`);
    }
  }
}

console.log('validate-tables:', { cities: cities.length, routes: routes.length, events: events.length, goods: goods.length, retainers: retainers.length });
if (warn.length) console.warn('warnings:\n' + warn.slice(0, 20).join('\n'));
if (errors.length) {
  console.error('ERRORS:\n' + errors.join('\n'));
  process.exit(1);
}
console.log('OK');
