#!/usr/bin/env node
/**
 * Build M2–M3 content: Battuta spine, codex.json, deepen Polo bodies,
 * Cairo/Mecca dialogue trees, battuta lore runtime stubs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'assets/data');
const booksDir = path.join(root, 'assets/books');

const read = n => JSON.parse(fs.readFileSync(path.join(dataDir, n), 'utf8'));
const write = (n, obj) => fs.writeFileSync(path.join(dataDir, n), JSON.stringify(obj, null, 2) + '\n');

const bi = (zh, en) => ({ zh, en });
const loreBattuta = (placeId, chapterId) => ({
  placeId,
  origin: 'ibn-battuta',
  ref: { book: 'ibn-battuta', chapterId: chapterId || placeId }
});

const battutaLore = JSON.parse(fs.readFileSync(path.join(booksDir, 'ibn-battuta-lore.json'), 'utf8'));
const placeBody = id => {
  const p = (battutaLore.places || []).find(x => x.id === id);
  const en = (p && p.body) ? String(p.body).replace(/\s+/g, ' ').trim().slice(0, 420) : '';
  return en || `Ibn Battuta records the roads and rites of ${id}.`;
};
const placeTitle = id => {
  const p = (battutaLore.places || []).find(x => x.id === id);
  return (p && p.title) || id;
};

/* ---------- Battuta cities ---------- */
const BATTUTA_CITIES = [
  { id: 'tangier', zh: '丹吉尔', en: 'Tangier', band: 'north_africa', culture: 'islamic', faith: 'islam',
    coord: [-5.8, 35.78], goods: ['wool', 'leather', 'dates'], specialty: 'leather',
    mentor: 'npc-tangier-faqih', next: 'cairo' },
  { id: 'cairo', zh: '开罗', en: 'Cairo', band: 'egypt', culture: 'islamic', faith: 'islam',
    coord: [31.24, 30.04], goods: ['linen', 'papyrus', 'spice'], specialty: 'linen',
    mentor: 'npc-cairo-qadi', next: 'damascus' },
  { id: 'damascus', zh: '大马士革', en: 'Damascus', band: 'levant', culture: 'islamic', faith: 'islam',
    coord: [36.28, 33.51], goods: ['damask', 'steel', 'rosewater'], specialty: 'damask',
    mentor: 'npc-damascus-imam', next: 'mecca' },
  { id: 'mecca', zh: '麦加', en: 'Mecca', band: 'arabia', culture: 'islamic', faith: 'islam',
    coord: [39.83, 21.42], goods: ['incense', 'dates', 'water-skin'], specialty: 'incense',
    mentor: 'npc-mecca-guide', next: 'delhi' },
  { id: 'delhi', zh: '德里', en: 'Delhi', band: 'india', culture: 'islamic', faith: 'islam',
    coord: [77.21, 28.61], goods: ['cotton', 'indigo', 'pepper'], specialty: 'indigo',
    mentor: 'npc-delhi-munshi', next: 'calicut' },
  { id: 'calicut', zh: '卡利卡特', en: 'Calicut', band: 'india', culture: 'indianocean', faith: 'islam',
    coord: [75.78, 11.25], goods: ['pepper', 'ginger', 'teak'], specialty: 'pepper',
    mentor: 'npc-calicut-nakhuda', next: null }
];

function ensureGoods(goods, ids) {
  const have = new Set(goods.map(g => g.id));
  const extras = [
    { id: 'leather', name: bi('皮革', 'Leather'), tier: 'regional', origin: ['isl'] },
    { id: 'dates', name: bi('椰枣', 'Dates'), tier: 'regional', origin: ['isl'] },
    { id: 'linen', name: bi('亚麻', 'Linen'), tier: 'regional', origin: ['isl'] },
    { id: 'papyrus', name: bi('纸草', 'Papyrus'), tier: 'regional', origin: ['isl'] },
    { id: 'damask', name: bi('大马士革绸', 'Damask'), tier: 'regional', origin: ['isl'] },
    { id: 'steel', name: bi('精钢', 'Damascus Steel'), tier: 'rare', origin: ['isl'] },
    { id: 'rosewater', name: bi('玫瑰水', 'Rosewater'), tier: 'regional', origin: ['isl'] },
    { id: 'incense', name: bi('乳香', 'Incense'), tier: 'regional', origin: ['isl'] },
    { id: 'water-skin', name: bi('水囊', 'Water Skin'), tier: 'common', origin: ['isl'] },
    { id: 'indigo', name: bi('靛青', 'Indigo'), tier: 'regional', origin: ['india'] },
    { id: 'ginger', name: bi('生姜', 'Ginger'), tier: 'regional', origin: ['india'] },
    { id: 'teak', name: bi('柚木', 'Teak'), tier: 'regional', origin: ['india'] }
  ];
  for (const g of extras) {
    if (!have.has(g.id)) {
      goods.push({
        id: g.id,
        name: g.name,
        tier: g.tier,
        origin: g.origin,
        weight: 1,
        lore: { origin: 'hybrid' }
      });
      have.add(g.id);
    }
  }
  for (const id of ids) if (!have.has(id)) {
    goods.push({ id, name: bi(id, id), tier: 'regional', origin: ['isl'], weight: 1 });
    have.add(id);
  }
  return goods;
}

function retainer(id, city, zh, en, omenZh, omenEn) {
  return {
    id,
    name: bi(zh, en),
    roles: ['guide', 'interpreter'],
    origin: { city, culture: 'islamic', faith: 'islam' },
    languages: ['arabic', 'persian'],
    recruitAt: [{ cityId: city, venue: 'inn' }],
    hireMode: ['open'],
    wage: { amount: 2, currency: 'dinar', period: 'month' },
    contract: { months: 6, renewable: true },
    abilities: { travel: 14, guard: 10, trade: 10, language: 14, medicine: 6, cartography: 8, faith: 14, divination: 6, cargo: 2 },
    traits: { loyalty: 16, courage: 12, greed: 8, curiosity: 14, piety: 16, ambition: 10, adaptability: 14, honesty: 15 },
    fate: { company: 14, road: 14, success: 14 },
    birth: { internalDate: '1300-01-01', sealLevel: 1 },
    sealReason: 'calendar',
    revealPaths: ['trust'],
    cargo: { kind: 'documents', slots: 1, condition: 'always' },
    omen: bi(omenZh, omenEn)
  };
}

function mkEvent(id, kind, city, title, body, choices, extra = {}) {
  return {
    id,
    kind,
    at: city ? [city] : undefined,
    title,
    body,
    choices,
    lore: loreBattuta(city || 'road', extra.chapterId),
    ...extra
  };
}

function siteChoices(cityId, siteKind, unlockRoute) {
  const unlock = unlockRoute
    ? [{ op: 'unlockRoute', value: unlockRoute }, { op: 'revealMap', value: unlockRoute }]
    : [];
  return [
    {
      label: bi('细听本地 rumours', 'Listen to local talk'),
      effects: [
        { op: 'codex', value: `cx-${cityId}-${siteKind}` },
        { op: 'fate', stat: 'rapport', value: 1 },
        ...unlock
      ]
    },
    {
      label: bi('留下银两求安', 'Leave coin for safe passage'),
      effects: [
        { op: 'coins', value: -2 },
        { op: 'flag', value: `good-${siteKind}-${cityId}` },
        ...unlock
      ]
    },
    {
      label: bi('匆匆路过', 'Pass through'),
      effects: [{ op: 'days', value: 1 }, ...unlock.slice(0, 1)]
    }
  ];
}

/* Load tables */
let cities = read('cities.json');
let routes = read('routes.json');
let events = read('events.json');
let goods = read('goods.json');
let retainers = read('retainers.json');
let archetypes = read('archetypes.json');
let endings = read('endings.json');
let glossary = read('glossary.json');

const allGoodIds = new Set();
BATTUTA_CITIES.forEach(c => c.goods.forEach(g => allGoodIds.add(g)));
goods = ensureGoods(goods, [...allGoodIds]);

/* Remove prior battuta rows if re-run */
const battutaIds = new Set(BATTUTA_CITIES.map(c => c.id));
cities = cities.filter(c => !battutaIds.has(c.id));
routes = routes.filter(r => !String(r.id).startsWith('rt-battuta-') && r.id !== 'rt-baghdad-damascus');
events = events.filter(e => !String(e.id).startsWith('ev-tangier') && !String(e.id).startsWith('ev-cairo') &&
  !String(e.id).startsWith('ev-damascus') && !String(e.id).startsWith('ev-mecca') &&
  !String(e.id).startsWith('ev-delhi') && !String(e.id).startsWith('ev-calicut') &&
  !String(e.id).startsWith('ev-road-battuta') && !String(e.id).startsWith('ev-cairo-tree') &&
  !String(e.id).startsWith('ev-mecca-tree'));
retainers = retainers.filter(r => !String(r.id).startsWith('npc-tangier') && !String(r.id).startsWith('npc-cairo') &&
  !String(r.id).startsWith('npc-damascus') && !String(r.id).startsWith('npc-mecca') &&
  !String(r.id).startsWith('npc-delhi') && !String(r.id).startsWith('npc-calicut'));
archetypes = archetypes.filter(a => a.id !== 'battuta');
endings = endings.filter(e => e.id !== 'end-battuta-witness');

const routeSpine = [
  ['tangier', 'cairo', 40, 3],
  ['cairo', 'damascus', 25, 2],
  ['damascus', 'mecca', 35, 3],
  ['mecca', 'delhi', 55, 4],
  ['delhi', 'calicut', 20, 2]
];

const newRoutes = [];
const newEvents = [];
const newCities = [];
const newRetainers = [];

BATTUTA_CITIES.forEach((c, i) => {
  const nextRoute = c.next ? `rt-battuta-${c.id}-${c.next}` : null;
  const exits = [];
  if (i > 0) {
    const prev = BATTUTA_CITIES[i - 1];
    exits.push(`rt-battuta-${prev.id}-${c.id}`);
  }
  if (nextRoute) exits.push(nextRoute);
  if (c.id === 'damascus') exits.push('rt-baghdad-damascus');

  const entryId = `ev-${c.id}-entry`;
  const sites = [`ev-${c.id}-market`, `ev-${c.id}-faith`, `ev-${c.id}-craft`];

  newCities.push({
    id: c.id,
    name: bi(c.zh, c.en),
    band: c.band,
    culture: c.culture,
    faiths: [c.faith],
    coord: c.coord,
    view: [100 + i * 40, 120 + i * 20],
    tier: 'station',
    entryEvent: entryId,
    sites,
    mentor: c.mentor,
    market: { goods: c.goods, currency: 'dinar', spread: 0.2 },
    shrine: { faith: c.faith, services: ['bless'] },
    exits,
    specialty: c.specialty,
    calendars: ['hijri'],
    lore: loreBattuta(c.id)
  });

  newRetainers.push(retainer(
    c.mentor, c.id,
    `${c.zh}向导`, `${placeTitle(c.id)} Guide`,
    `此人识得${c.zh}的巷与礼。`, `Knows the lanes and rites of ${c.en}.`
  ));

  const enBody = placeBody(c.id);
  const zhBody = `${c.zh}：白图泰记下的城门、市声与礼拜。${enBody.slice(0, 180)}`;
  newEvents.push(mkEvent(entryId, 'entry', c.id,
    bi(`入${c.zh}`, `Entering ${c.en}`),
    bi(zhBody, enBody),
    [
      {
        label: bi('按礼入城', 'Enter with proper greeting'),
        effects: [
          { op: 'flag', value: `good-entry-${c.id}` },
          { op: 'codex', value: `cx-${c.id}` },
          { op: 'revealMap', value: c.id },
          ...(nextRoute ? [{ op: 'unlockRoute', value: nextRoute }] : []),
          ...(c.id === 'damascus' ? [{ op: 'unlockRoute', value: 'rt-baghdad-damascus' }] : [])
        ]
      },
      {
        label: bi('先寻客栈', 'Seek an inn first'),
        effects: [
          { op: 'coins', value: -1 },
          { op: 'codex', value: `cx-${c.id}` },
          ...(nextRoute ? [{ op: 'unlockRoute', value: nextRoute }] : [])
        ]
      }
    ]
  ));

  ['market', 'faith', 'craft'].forEach(kind => {
    const titles = {
      market: bi(`${c.zh}·市集`, `${c.en} Market`),
      faith: bi(`${c.zh}·信仰场所`, `${c.en} Shrine`),
      craft: bi(`${c.zh}·工匠巷`, `${c.en} Craft Lane`)
    };
    const bodies = {
      market: bi(`香料与织物在${c.zh}市集上叠成气味的墙。`, `Spice and cloth stack into walls of scent in ${c.en}.`),
      faith: bi(`礼拜的呼声从${c.zh}的宣礼塔落下。`, `The call to prayer falls from the minarets of ${c.en}.`),
      craft: bi(`${c.zh}工匠用本地的手艺换远路来的银。`, `Craftsmen of ${c.en} trade local skill for distant silver.`)
    };
    newEvents.push(mkEvent(`ev-${c.id}-${kind}`, 'site', c.id, titles[kind], bodies[kind],
      siteChoices(c.id, kind, nextRoute)));
  });
});

routeSpine.forEach(([from, to, days, risk]) => {
  const id = `rt-battuta-${from}-${to}`;
  const encId = `ev-road-battuta-${from}-${to}`;
  newRoutes.push({
    id,
    from,
    to,
    days,
    risk,
    modes: ['caravan', 'foot'],
    cost: 4,
    encounters: [encId],
    unlock: { when: 'explore' }
  });
  newEvents.push(mkEvent(encId, 'road', null,
    bi(`${from}→${to} 路上`, `Road ${from} → ${to}`),
    bi('沙与商队之间，有人低声问你是否会礼。', 'Between sand and caravans, someone asks if you know the rites.'),
    [
      {
        label: bi('以占法问途', 'Ask the road by divination'),
        divination: 'astrodice',
        pass: {
          text: bi('吉象：旁路显形。', 'Good omen: a side path appears.'),
          effects: [{ op: 'fate', stat: 'travel', value: 1 }, { op: 'codex', value: `cx-rt-${from}-${to}` }]
        },
        fail: {
          text: bi('凶象：多耗一日。', 'Ill omen: one day lost.'),
          effects: [{ op: 'days', value: 1 }]
        }
      },
      {
        label: bi('随队而行', 'Follow the caravan'),
        effects: [{ op: 'coins', value: -1 }, { op: 'codex', value: `cx-rt-${from}-${to}` }]
      }
    ],
    { at: undefined }
  ));
});

/* Bridge Baghdad → Damascus */
newRoutes.push({
  id: 'rt-baghdad-damascus',
  from: 'baghdad',
  to: 'damascus',
  days: 18,
  risk: 2,
  modes: ['caravan', 'foot'],
  cost: 5,
  encounters: ['ev-road-battuta-bridge'],
  unlock: { when: 'explore' }
});
newEvents.push(mkEvent('ev-road-battuta-bridge', 'road', null,
  bi('两河向西', 'West from the Two Rivers'),
  bi('巴格达的余晖把大马士革的尖塔提前画在眼底。', 'Baghdad’s afterglow paints Damascus minarets onto the eye.'),
  [
    { label: bi('继续向西', 'Continue west'), effects: [{ op: 'codex', value: 'cx-bridge-baghdad-damascus' }] },
    {
      label: bi('星骰问季', 'Ask the season with astral dice'),
      divination: 'astrodice',
      pass: { text: bi('宜行。', 'Go.'), effects: [{ op: 'fate', stat: 'travel', value: 1 }] },
      fail: { text: bi('宜缓。', 'Wait.'), effects: [{ op: 'days', value: 2 }] }
    }
  ]
));

/* Cairo 3-beat dialogue tree */
newEvents.push(mkEvent('ev-cairo-tree-1', 'site', 'cairo',
  bi('开罗断案·一', 'Cairo Judgment · I'),
  bi('尼罗河边，一名法官请你旁听：商队是否隐瞒了关税。', 'By the Nile a qadi asks you to witness: did the caravan hide the duty?'),
  [
    {
      label: bi('细听证词', 'Hear the testimony'),
      effects: [
        { op: 'flag', value: 'cairo-tree-1' },
        { op: 'codex', value: 'cx-cairo-tree' },
        { op: 'goto', value: 'event:ev-cairo-tree-2' }
      ]
    },
    { label: bi('婉拒离开', 'Decline and leave'), effects: [{ op: 'days', value: 1 }] }
  ]
));
newEvents.push(mkEvent('ev-cairo-tree-2', 'site', 'cairo',
  bi('开罗断案·二', 'Cairo Judgment · II'),
  bi('账册上的墨迹新旧不一。译员看你一眼，等人开口。', 'Ink on the ledger is uneven. The interpreter waits for you to speak.'),
  [
    {
      label: bi('指出矛盾', 'Point out the contradiction'),
      effects: [
        { op: 'flag', value: 'cairo-tree-2' },
        { op: 'reputation', scope: 'city', id: 'cairo', value: 2 },
        { op: 'goto', value: 'event:ev-cairo-tree-3' }
      ]
    },
    {
      label: bi('以易占决疑', 'Settle doubt by I Ching'),
      divination: 'iching',
      pass: {
        text: bi('阳爻：账册有伪。', 'Yang: the ledger lies.'),
        effects: [{ op: 'flag', value: 'cairo-tree-2' }, { op: 'goto', value: 'event:ev-cairo-tree-3' }]
      },
      fail: {
        text: bi('阴爻：且勿妄断。', 'Yin: do not rush judgment.'),
        effects: [{ op: 'days', value: 1 }]
      }
    }
  ]
));
newEvents.push(mkEvent('ev-cairo-tree-3', 'site', 'cairo',
  bi('开罗断案·三', 'Cairo Judgment · III'),
  bi('法官宣判完毕。尼罗的风把你的名字写进这座城的传闻。', 'The qadi finishes. Nile wind writes your name into the city’s talk.'),
  [
    {
      label: bi('接受谢礼', 'Accept thanks'),
      effects: [
        { op: 'flag', value: 'cairo-tree-done' },
        { op: 'coins', value: 5 },
        { op: 'codex', value: 'cx-cairo-judgment' },
        { op: 'fate', stat: 'rapport', value: 2 }
      ]
    }
  ]
));

/* Mecca 3-beat */
newEvents.push(mkEvent('ev-mecca-tree-1', 'site', 'mecca',
  bi('朝觐仪轨·一', 'Hajj Rites · I'),
  bi('麦加城外，向导问你是否已洁净、是否知绕行的方向。', 'Outside Mecca a guide asks if you are purified and know the circuit.'),
  [
    {
      label: bi('跟从仪轨', 'Follow the rites'),
      effects: [
        { op: 'flag', value: 'mecca-tree-1' },
        { op: 'faith', value: 'islam' },
        { op: 'goto', value: 'event:ev-mecca-tree-2' }
      ]
    },
    { label: bi('只作旁观记录', 'Only record as witness'), effects: [{ op: 'codex', value: 'cx-mecca-witness' }, { op: 'goto', value: 'event:ev-mecca-tree-2' }] }
  ]
));
newEvents.push(mkEvent('ev-mecca-tree-2', 'site', 'mecca',
  bi('朝觐仪轨·二', 'Hajj Rites · II'),
  bi('人潮如河。你须在拥挤中保持方向，也保持记录的手不抖。', 'The crowd is a river. Keep direction — and a steady hand for the pen.'),
  [
    {
      label: bi('完成绕行', 'Complete the circuit'),
      effects: [
        { op: 'flag', value: 'mecca-tree-2' },
        { op: 'fate', stat: 'rapport', value: 1 },
        { op: 'goto', value: 'event:ev-mecca-tree-3' }
      ]
    },
    {
      label: bi('求签问安', 'Draw a lot for safety'),
      divination: 'lot',
      pass: {
        text: bi('上签。', 'High lot.'),
        effects: [{ op: 'flag', value: 'mecca-tree-2' }, { op: 'goto', value: 'event:ev-mecca-tree-3' }]
      },
      fail: {
        text: bi('下签：暂歇。', 'Low lot: rest.'),
        effects: [{ op: 'days', value: 1 }]
      }
    }
  ]
));
newEvents.push(mkEvent('ev-mecca-tree-3', 'site', 'mecca',
  bi('朝觐仪轨·三', 'Hajj Rites · III'),
  bi('仪成。你可把麦加写成归途的圆心，而非终点。', 'Rites done. Mecca can be written as the center of returns — not an end.'),
  [
    {
      label: bi('记下见证', 'Record the witness'),
      effects: [
        { op: 'flag', value: 'mecca-tree-done' },
        { op: 'codex', value: 'cx-mecca-hajj' },
        { op: 'sticker', value: 'st-battuta' },
        { op: 'fate', stat: 'travel', value: 2 }
      ]
    }
  ]
));

/* Wire trees into cairo/mecca sites (replace craft with tree-1 start, keep 3 sites) */
for (const c of newCities) {
  if (c.id === 'cairo') c.sites = ['ev-cairo-market', 'ev-cairo-faith', 'ev-cairo-tree-1'];
  if (c.id === 'mecca') c.sites = ['ev-mecca-market', 'ev-mecca-faith', 'ev-mecca-tree-1'];
}

cities = cities.concat(newCities);
routes = routes.concat(newRoutes);
events = events.concat(newEvents);
retainers = retainers.concat(newRetainers);

archetypes.push({
  id: 'battuta',
  name: bi('白图泰式朝圣旅人', 'A Traveler in Battuta’s Manner'),
  start: 'tangier',
  obsession: bi('把朝觐与诸城见闻写成可回麦加的圆。', 'Write the hajj and cities as a circle that can return to Mecca.'),
  goal: { type: 'reach', target: 'mecca' },
  faith: 'islam',
  culture: 'islamic',
  bonus: { rapport: 3, travel: 1 },
  malus: { wealth_luck: -1 },
  startKit: {
    coins: 45,
    currency: 'dinar',
    goods: ['dates'],
    items: ['letter-of-introduction'],
    languages: ['arabic', 'persian']
  },
  endings: ['end-stop-write', 'end-battuta-witness', 'end-convert-translator']
});

endings.push({
  id: 'end-battuta-witness',
  layer: 2,
  name: bi('朝觐见证者', 'Witness of the Hajj'),
  conditions: {
    visitedCities: ['tangier', 'cairo', 'mecca'],
    flags: ['mecca-tree-done']
  },
  epilogue: bi(
    '你从丹吉尔走到麦加，把仪轨与城门写成可回望的圆。走过{cities}座城，用了{years}年。',
    'From Tangier to Mecca you wrote rites and gates as a circle of return. {cities} cities, {years} years.'
  ),
  variables: ['cities', 'years', 'lastCity'],
  sticker: 'st-battuta'
});

/* Glossary additions */
const glossTerms = glossary.terms || glossary;
const glossArr = Array.isArray(glossTerms) ? glossTerms : [];
const glossExtra = [
  { id: 'hajj', kind: 'rite', en: 'Hajj', zh: '朝觐' },
  { id: 'qadi', kind: 'role', en: 'Qadi', zh: '卡迪（法官）' },
  { id: 'caravanserai', kind: 'place', en: 'Caravanserai', zh: '商队客栈' },
  { id: 'minaret', kind: 'place', en: 'Minaret', zh: '宣礼塔' },
  { id: 'haram', kind: 'place', en: 'Haram', zh: '禁寺' },
  { id: 'zamzam', kind: 'place', en: 'Zamzam', zh: '渗渗泉' },
  { id: 'rihla', kind: 'genre', en: 'Rihla', zh: '游记（里赫拉）' },
  { id: 'madrasah', kind: 'place', en: 'Madrasah', zh: '经学院' },
  { id: 'suq', kind: 'place', en: 'Suq', zh: '集市' },
  { id: 'dinar', kind: 'coin', en: 'Dinar', zh: '第纳尔' },
  { id: 'ihram', kind: 'rite', en: 'Ihram', zh: '受戒' },
  { id: 'tawaf', kind: 'rite', en: 'Tawaf', zh: '绕行' },
  { id: 'nakhuda', kind: 'role', en: 'Nakhuda', zh: '船长' },
  { id: 'munshi', kind: 'role', en: 'Munshi', zh: '书记' },
  { id: 'faqih', kind: 'role', en: 'Faqih', zh: '法学家' },
  { id: 'imam', kind: 'role', en: 'Imam', zh: '伊玛目' },
  { id: 'nile', kind: 'place', en: 'Nile', zh: '尼罗河' },
  { id: 'hejaz', kind: 'place', en: 'Hejaz', zh: '汉志' },
  { id: 'malabar', kind: 'place', en: 'Malabar', zh: '马拉巴尔' },
  { id: 'delhi-sultanate', kind: 'place', en: 'Delhi Sultanate', zh: '德里苏丹国' }
];
const haveG = new Set(glossArr.map(t => t.id));
for (const t of glossExtra) if (!haveG.has(t.id)) glossArr.push(t);
if (Array.isArray(glossary)) glossary = glossArr;
else glossary.terms = glossArr;

/* Deepen Polo entry/site bodies */
const FULL = ['tabriz','baghdad','hormuz','balkh','samarkand','kashgar','khotan','lop','shangdu','khanbaliq','hangzhou','quanzhou'];
for (const e of events) {
  if (!e.id || !e.body) continue;
  const m = e.id.match(/^ev-([a-z]+)-(entry|market|faith|craft)$/);
  if (!m) continue;
  const city = m[1];
  if (!FULL.includes(city) && city !== 'venice' && city !== 'acre') continue;
  const zhLen = (e.body.zh || '').length;
  if (zhLen >= 120) continue;
  const kind = m[2];
  const cityName = (cities.find(c => c.id === city) || {}).name || { zh: city, en: city };
  const padZh = {
    entry: `入${cityName.zh}时，城门、市声与外来人的礼先落在纸上。你记下税吏的口气、货栈的气味，以及哪一条街通向信仰场所。马可一路上所写的，正是这些可被带回西方的句子。`,
    market: `${cityName.zh}市集里，织物、香料与金属声叠在一起。议价不只是银两，也是口音与信誉。你在摊位之间走出一条可写进游记的小路。`,
    faith: `${cityName.zh}的信仰场所以钟、香或呼礼标识边界。你以旅客之礼站在门外，把所见写成不冒犯本地的句子。`,
    craft: `${cityName.zh}工匠巷里，手艺比货物更难定价。学徒的眼神与师傅的规矩，都是远路人应当抄下的注脚。`
  };
  const padEn = {
    entry: `Entering ${cityName.en}, gates, market noise, and the manners of strangers land on the page first. You note the taxman’s tone, the warehouse smell, and which street leads to a shrine — the sort of sentence Marco’s road could carry west.`,
    market: `In the ${cityName.en} market, cloth, spice, and metal stack together. Bargaining is coin, accent, and credit. Between stalls you walk a path fit for a travel book.`,
    faith: `A place of faith in ${cityName.en} marks its edge with bell, incense, or the call to prayer. You stand as a guest and write without offense.`,
    craft: `In the craft lanes of ${cityName.en}, skill is harder to price than goods. Apprentice eyes and master rules are footnotes a far-road writer should copy.`
  };
  e.body = {
    zh: ((e.body.zh || '') + ' ' + padZh[kind]).trim().slice(0, 320),
    en: ((e.body.en || '') + ' ' + padEn[kind]).trim().slice(0, 420)
  };
  if (!e.lore) e.lore = { placeId: city, origin: 'marco-polo', ref: { book: 'marco-polo', chapterId: city } };
}

/* ---------- Codex ---------- */
const cxIds = new Set();
for (const e of events) {
  const scan = fx => {
    for (const f of fx || []) if (f.op === 'codex' && f.value) cxIds.add(f.value);
  };
  for (const ch of e.choices || []) {
    scan(ch.effects);
    scan(ch.pass && ch.pass.effects);
    scan(ch.fail && ch.fail.effects);
  }
}
BATTUTA_CITIES.forEach(c => {
  cxIds.add(`cx-${c.id}`);
  ['market', 'faith', 'craft'].forEach(k => cxIds.add(`cx-${c.id}-${k}`));
});
['cx-cairo-tree', 'cx-cairo-judgment', 'cx-mecca-witness', 'cx-mecca-hajj', 'cx-bridge-baghdad-damascus'].forEach(id => cxIds.add(id));

const catOf = id => {
  if (/market|suq|bazaar|goods|trade/.test(id)) return 'goods';
  if (/faith|hajj|shrine|temple|mosque|judgment|tree/.test(id)) return 'religion';
  if (/rt-|road|bridge|route/.test(id)) return 'travel';
  if (/npc|mentor|qadi|guide/.test(id)) return 'people';
  return 'geography';
};

const codex = [...cxIds].sort().map(id => {
  const city = id.replace(/^cx-/, '').split('-')[0];
  const c = cities.find(x => x.id === city);
  const name = c ? c.name : bi(id, id);
  return {
    id,
    category: catOf(id),
    title: bi(
      name.zh ? `${name.zh}·见闻` : id,
      name.en ? `${name.en} note` : id
    ),
    body: bi(
      `图鉴条目：${id}。探索中解锁的远路知识。`,
      `Codex entry ${id}: far-road knowledge unlocked by exploration.`
    ),
    lore: { ref: { id }, origin: /battuta|cairo|mecca|tangier|damascus|delhi|calicut/.test(id) ? 'ibn-battuta' : 'marco-polo' }
  };
});

/* Write tables */
write('cities.json', cities);
write('routes.json', routes);
write('events.json', events);
write('goods.json', goods);
write('retainers.json', retainers);
write('archetypes.json', archetypes);
write('endings.json', endings);
write('glossary.json', glossary);
write('codex.json', codex);

/* Battuta lore runtime JS */
const placeMap = {};
for (const p of battutaLore.places || []) {
  placeMap[p.id] = {
    id: p.id,
    title: p.title,
    band: p.band,
    bodyEn: String(p.body || '').slice(0, 800),
    source: p.source
  };
}
const zhTrunk = {
  tangier: '丹吉尔：白图泰出发之城，大西洋风把礼拜的声音送到港口。',
  cairo: '开罗：尼罗与苏丹之城，市集与经学院并立，断案声从河边传来。',
  damascus: '大马士革：绿荫与刃钢之城，东来西往的商队在此换季。',
  mecca: '麦加：朝觐的圆心。仪轨完成处，游记可以写成归途而非终点。',
  delhi: '德里：苏丹国的庭与市，译员与书记比刀剑更常开口。',
  calicut: '卡利卡特：胡椒海岸。船主以季风为历，以诚信为帆。'
};

fs.writeFileSync(path.join(root, 'js/data-battuta-lore.js'),
`/* Auto-built from assets/books/ibn-battuta-lore.json — do not hand-edit */
window.FQ = window.FQ || {};
FQ.BATTUTA_LORE = ${JSON.stringify(placeMap, null, 2)};
FQ.battutaPlace = function (id) { return (FQ.BATTUTA_LORE || {})[id] || null; };
`);

fs.writeFileSync(path.join(root, 'js/data-lore-zh-battuta-trunk.js'),
`/* Hand trunk Chinese for Battuta hubs */
window.FQ = window.FQ || {};
FQ.BATTUTA_ZH = ${JSON.stringify(zhTrunk, null, 2)};
`);

console.log('M2-M3 content built:', {
  cities: cities.length,
  routes: routes.length,
  events: events.length,
  retainers: retainers.length,
  codex: codex.length,
  battutaCities: BATTUTA_CITIES.length
});
