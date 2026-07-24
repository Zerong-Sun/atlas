#!/usr/bin/env node
/* 《远行之书》data + logic invariants — the CI check for the book.html engine.
   Mirrors BOF.DB.validate() (which only runs in the browser) and adds the
   economy/reachability checks that a data table cannot express on its own:
   the map must be fully reachable, and no city may strand a penniless traveler.

     node scripts/check_bof.mjs

   Exits non-zero on the first category with failures, so it gates merges. */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DATA = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "data");
const read = f => JSON.parse(readFileSync(join(DATA, f), "utf8"));
const byId = (rows, k = "id") => Object.fromEntries(rows.map(r => [r[k], r]));

const wm = read("worldmap.json");
const cities = byId(read("cities.json").cities);
const routes = byId(read("routes.json").routes);
const transports = byId(read("transports.json").transports);
const events = byId([...read("events-west.json").events, ...read("events-east.json").events]);
const div = read("divinations.json");
const divinations = byId(div.divinations);
const teachers = byId(div.teachers);
const goods = byId(read("goods.json").goods);
const currencies = byId(read("goods.json").currencies);
const archetypes = byId(read("archetypes.json").archetypes);
const endings = byId(read("endings.json").endings);
const mapCities = byId(wm.cities);
const itemNames = new Set(
  [...readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "js", "bof", "fx.js"), "utf8")
    .matchAll(/"([a-z0-9-]+)":\s*\{ zh:/g)].map(m => m[1]));

const problems = [];
const bad = (where, msg) => problems.push(`${where}: ${msg}`);

/* ---------- structural (mirrors BOF.DB.validate) ---------- */
for (const c of Object.values(cities)) {
  if (!mapCities[c.map]) bad(c.id, `map id '${c.map}' not in worldmap.json`);
  if (!events[c.entry]) bad(c.id, `entry event '${c.entry}' missing`);
  (c.sites || []).forEach(s => { if (!events[s]) bad(c.id, `site '${s}' missing`); });
  if (c.teaches && !divinations[c.teaches]) bad(c.id, `teaches unknown '${c.teaches}'`);
  if (c.mentor && !teachers[c.mentor]) bad(c.id, `mentor '${c.mentor}' missing`);
  (c.market?.goods || []).forEach(g => { if (!goods[g]) bad(c.id, `good '${g}' missing`); });
  if (c.market && !currencies[c.market.currency]) bad(c.id, `currency '${c.market.currency}' missing`);
  if (c.specialty && !goods[c.specialty]) bad(c.id, `specialty '${c.specialty}' missing`);
}
for (const r of Object.values(routes)) {
  if (!cities[r.from]) bad(r.id, `from '${r.from}' not a city`);
  if (!cities[r.to]) bad(r.id, `to '${r.to}' not a city`);
  (r.modes || []).forEach(m => { if (!transports[m]) bad(r.id, `mode '${m}' missing`); });
}
const OPS = new Set(["coins", "days", "fate", "rep", "goods", "item", "flag",
  "language", "codex", "sticker", "revealCity", "revealRoute", "offerLearn", "goto"]);
for (const e of Object.values(events)) {
  if (e.city && !cities[e.city]) bad(e.id, `city '${e.city}' missing`);
  if (!e.choices?.length) bad(e.id, "no choices");
  (e.choices || []).forEach((ch, i) => {
    const tag = `${e.id}#${ch.id || i}`;
    const plain = ch.then?.text;
    const forked = ch.pass?.text && ch.fail?.text;
    if (!plain && !forked) bad(tag, "resolves to nothing (needs then, or pass+fail)");
    if (ch.divination && !divinations[ch.divination]) bad(tag, `unknown art '${ch.divination}'`);
    if (ch.needs?.item && !itemNames.has(ch.needs.item)) bad(tag, `needs item '${ch.needs.item}' has no display name`);
    [ch.then, ch.pass, ch.fail].forEach(br => (br?.effects || []).forEach(op => {
      if (!OPS.has(op.op)) bad(tag, `unknown op '${op.op}'`);
      if (op.op === "revealCity" && !cities[op.id]) bad(tag, `revealCity '${op.id}' missing`);
      if (op.op === "revealRoute" && !routes[op.id]) bad(tag, `revealRoute '${op.id}' missing`);
      if (op.op === "goods" && !goods[op.id]) bad(tag, `goods '${op.id}' missing`);
      if (op.op === "offerLearn" && !divinations[op.id]) bad(tag, `offerLearn '${op.id}' missing`);
      if (op.op === "goto" && !events[op.id]) bad(tag, `goto '${op.id}' missing`);
      if (op.op === "item" && !itemNames.has(op.id)) bad(tag, `item '${op.id}' has no display name`);
    }));
  });
}
for (const d of Object.values(divinations)) {
  if (!d.effects?.length) bad(d.id, "no effects (would be decoration)");
  if (!d.minigame) bad(d.id, "no minigame");
  (d.learnAt || []).forEach(c => { if (!cities[c]) bad(d.id, `learnAt '${c}' missing`); });
}
for (const a of Object.values(archetypes)) {
  if (!cities[a.start]) bad(a.id, `start '${a.start}' missing`);
  (a.knownCities || []).forEach(c => { if (!cities[c]) bad(a.id, `knownCity '${c}' missing`); });
  (a.knownRoutes || []).forEach(r => { if (!routes[r]) bad(a.id, `knownRoute '${r}' missing`); });
  (a.endings || []).forEach(e => { if (!endings[e]) bad(a.id, `ending '${e}' missing`); });
}

/* ---------- economy: no penniless traveler is ever stranded ----------
   The runtime escape (travel.js work-passage) only fires when a route has a
   mode blocked by COINS. If a city's every outgoing mode were gated by permit
   or faith instead, a broke player with neither could be stuck. Assert that
   every city has at least one outgoing route offering a mode that needs
   neither a permit nor a faith — i.e. always coins-blockable, always workable. */
const modeGate = t => (t.needs || []).some(n => n === "permit" || n === "faith") ? "hard" : "coins";
for (const c of Object.values(cities)) {
  const outs = Object.values(routes).filter(r => r.from === c.id || r.to === c.id);
  const hasWorkable = outs.some(r => (r.modes || []).some(m => transports[m] && modeGate(transports[m]) === "coins"));
  if (!outs.length) bad(c.id, "no outgoing routes — dead-end city");
  else if (!hasWorkable) bad(c.id, "every exit is permit/faith-gated — a broke player could be stranded");
}

/* ---------- reachability: the whole map is walkable from some start ---------- */
const starts = new Set(Object.values(archetypes).map(a => a.start));
const seen = new Set(starts);
const q = [...starts];
while (q.length) {
  const cur = q.shift();
  Object.values(routes).forEach(r => {
    const other = r.from === cur ? r.to : r.to === cur ? r.from : null;
    if (other && !seen.has(other)) { seen.add(other); q.push(other); }
  });
}
for (const id of Object.keys(cities)) {
  if (!seen.has(id)) bad(id, "unreachable from any archetype start");
}

/* ---------- report ---------- */
const n = Object.keys(events).length;
const choiceCount = Object.values(events).reduce((s, e) => s + e.choices.length, 0);
if (problems.length) {
  console.error(`\n✗ check_bof: ${problems.length} problem(s)\n`);
  problems.forEach(p => console.error("  · " + p));
  console.error("");
  process.exit(1);
}
console.log(`✓ check_bof: ${Object.keys(cities).length} cities, ${Object.keys(routes).length} routes, `
  + `${n} events / ${choiceCount} choices, ${Object.keys(divinations).length} arts, `
  + `${Object.keys(archetypes).length} archetypes — all reachable, none strandable.`);
