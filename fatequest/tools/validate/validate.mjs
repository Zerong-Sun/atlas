#!/usr/bin/env node
/**
 * Content validator — the CI gates from docs/ARCHITECTURE.md §9 and
 * docs/DATA_MODEL.md §9.
 *
 * Built BEFORE the tables are filled at scale, deliberately: 136 lore records
 * landing across eight tables produce well over a thousand cross-references,
 * and a human cannot check those. See DATA_MODEL.md §10.
 *
 * Usage:  node tools/validate/validate.mjs [--quiet]
 * Exit:   0 = all gates pass, 1 = at least one error
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const TABLES = join(ROOT, "content/tables");
const MAP = join(ROOT, "worldmap/data/cities.geojson");

const errors = [];
const warnings = [];
const err = (gate, file, msg) => errors.push({ gate, file, msg });
const warn = (gate, file, msg) => warnings.push({ gate, file, msg });

// ---------------------------------------------------------------- load
function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".json") ? [p] : [];
  });
}

const files = walk(TABLES);
const byTable = {};
const recordFile = new Map(); // id -> file (for error messages)

for (const f of files) {
  const rel = relative(ROOT, f);
  let doc;
  try {
    doc = JSON.parse(readFileSync(f, "utf8"));
  } catch (e) {
    err("G1", rel, `invalid JSON: ${e.message}`);
    continue;
  }
  if (!doc.table) { err("G1", rel, "missing `table` header"); continue; }
  if (doc.contentVersion === undefined) err("G1", rel, "missing `contentVersion` header");
  (byTable[doc.table] ??= []).push(...(doc.records ?? []));
  for (const r of doc.records ?? []) {
    if (!r.id) { err("G1", rel, "record without id"); continue; }
    if (recordFile.has(r.id)) err("G1", rel, `duplicate id "${r.id}" (also in ${recordFile.get(r.id)})`);
    recordFile.set(r.id, rel);
  }
}

const ids = (t) => new Set((byTable[t] ?? []).map((r) => r.id));
const cityIds = ids("cities"), routeIds = ids("routes"),
      eventIds = ids("events"), transportIds = ids("transports"),
      divIds = ids("divinations");

// ------------------------------------------------- G1: tier-graded fields
// Graded per DATA_MODEL.md §6 — a `station` must NOT be reported for the
// fields only a `metropolis` owes.
const REQUIRED_BY_TIER = {
  metropolis: ["entryEvent", "market", "shrine", "mentor", "sites", "specialty"],
  city:       ["entryEvent", "market", "shrine"],
  town:       ["entryEvent", "market"],
  station:    ["entryEvent"],
};
const BASE = ["id", "name", "band", "coord", "tier", "exits", "lore"];

for (const c of byTable.cities ?? []) {
  const f = recordFile.get(c.id);
  for (const k of BASE) if (c[k] === undefined) err("G1", f, `${c.id}: missing base field \`${k}\``);
  const req = REQUIRED_BY_TIER[c.tier];
  if (!req) { err("G1", f, `${c.id}: unknown tier "${c.tier}"`); continue; }
  for (const k of req) if (c[k] === undefined) err("G1", f, `${c.id} (${c.tier}): missing \`${k}\``);
  if (c.tier === "metropolis" && (c.sites?.length ?? 0) !== 3)
    err("G1", f, `${c.id}: metropolis needs exactly 3 sites, has ${c.sites?.length ?? 0}`);
}

// ----------------------------------------------- G2: reference integrity
const ref = (ok, gate, file, msg) => { if (!ok) err(gate, file, msg); };
const referenced = new Set();
const mark = (s) => { if (s) referenced.add(s); };

for (const c of byTable.cities ?? []) {
  const f = recordFile.get(c.id);
  ref(eventIds.has(c.entryEvent), "G2", f, `${c.id}.entryEvent -> "${c.entryEvent}" not found`);
  mark(c.entryEvent);
  for (const s of c.sites ?? []) { ref(eventIds.has(s), "G2", f, `${c.id}.sites -> "${s}" not found`); mark(s); }
  for (const e of c.exits ?? []) { ref(routeIds.has(e), "G2", f, `${c.id}.exits -> "${e}" not found`); mark(e); }
}
for (const r of byTable.routes ?? []) {
  const f = recordFile.get(r.id);
  ref(cityIds.has(r.from), "G2", f, `${r.id}.from -> "${r.from}" not found`);
  ref(cityIds.has(r.to), "G2", f, `${r.id}.to -> "${r.to}" not found`);
  for (const m of r.modes ?? []) ref(transportIds.has(m), "G2", f, `${r.id}.modes -> "${m}" not found`);
  for (const e of r.encounters ?? []) { ref(eventIds.has(e), "G2", f, `${r.id}.encounters -> "${e}" not found`); mark(e); }
}

// --------------------------------- G10: every effect carries a reason
const CONDITION_KEYS = new Set(["any","all","not","cities","bands","faiths","season","years",
  "flags","not_flags","has_item","lacks_item","learned_divination","language",
  "min_reputation","fate","coins"]);
const OPS = new Set(["coins","days","goods","item","remove_item","cargo_slots","reputation",
  "faith","language","etiquette","fate","unlock_route","reveal_map","learn_divination",
  "flag","unflag","goto","recruit","dismiss","retainer_mood","reveal_birth","sticker","codex"]);

function checkEffects(list, f, where) {
  for (const [i, e] of (list ?? []).entries()) {
    if (!e.op) { err("G10", f, `${where}[${i}]: missing \`op\``); continue; }
    if (!OPS.has(e.op)) err("G10", f, `${where}[${i}]: unknown op "${e.op}"`);
    if (!e.reason) err("G10", f, `${where}[${i}] (${e.op}): missing \`reason\``);
    if (e.op === "reputation" && !e.scope) err("G10", f, `${where}[${i}]: reputation needs \`scope\``);
    if (e.chance !== undefined && (e.chance < 0 || e.chance > 1))
      err("G10", f, `${where}[${i}]: chance ${e.chance} out of [0,1]`);
  }
}
// Unknown condition keys must fail loudly — a typo would otherwise be
// vacuously true and fire the event in the wrong place with no error.
function checkCondition(cond, f, where) {
  if (!cond || typeof cond !== "object") return;
  for (const k of Object.keys(cond)) {
    if (!CONDITION_KEYS.has(k)) err("G1", f, `${where}: unknown condition key "${k}"`);
    if (k === "any" || k === "all") for (const [i, c] of cond[k].entries()) checkCondition(c, f, `${where}.${k}[${i}]`);
    if (k === "not") checkCondition(cond[k], f, `${where}.not`);
  }
}

for (const e of byTable.events ?? []) {
  const f = recordFile.get(e.id);
  checkCondition(e.when, f, `${e.id}.when`);
  for (const [i, ch] of (e.choices ?? []).entries()) {
    checkCondition(ch.needs, f, `${e.id}.choices[${i}].needs`);
    checkEffects(ch.effects, f, `${e.id}.choices[${i}].effects`);
    checkEffects(ch.pass?.effects, f, `${e.id}.choices[${i}].pass.effects`);
    checkEffects(ch.fail?.effects, f, `${e.id}.choices[${i}].fail.effects`);
    if (ch.divination && divIds.size && !divIds.has(ch.divination))
      err("G2", f, `${e.id}.choices[${i}].divination -> "${ch.divination}" not registered`);
    for (const eff of ch.effects ?? []) if (eff.op === "unlock_route" || eff.op === "reveal_map") mark(eff.value);
  }
  // G8: source-derived text must be traceable (GDD §19).
  if (e.lore?.origin === "source" && !e.lore?.ref)
    err("G8", f, `${e.id}: lore.origin="source" requires \`ref\``);
}

// --------------------------------------------- G3: divination effects ≠ ∅
for (const d of byTable.divinations ?? []) {
  if (!d.effects?.length) err("G3", recordFile.get(d.id), `${d.id}: \`effects\` must not be empty (GDD §8.2)`);
}

// ------------------------------------------------- G12: map alignment
if (existsSync(MAP)) {
  const geo = JSON.parse(readFileSync(MAP, "utf8"));
  const medieval = new Set(geo.features.map((x) =>
    String(x.properties.name_medieval).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")));
  for (const c of byTable.cities ?? [])
    if (!medieval.has(c.id))
      err("G12", recordFile.get(c.id), `${c.id}: no matching name_medieval in worldmap/data/cities.geojson`);
} else {
  warn("G12", "worldmap", "cities.geojson not found — map alignment skipped");
}

// ------------------------------------------------ G2b: orphan detection
for (const e of byTable.events ?? [])
  if (!referenced.has(e.id) && e.kind !== "road")
    warn("G2b", recordFile.get(e.id), `${e.id}: not referenced by any city or route (may be reserved)`);

// ------------------------------------------------------------- report
const quiet = process.argv.includes("--quiet");
const counts = Object.entries(byTable).map(([t, r]) => `${t}:${r.length}`).join(" ");
if (!quiet) {
  console.log(`\ncontent: ${files.length} files, ${counts}\n`);
  const gates = ["G1","G2","G2b","G3","G8","G10","G12"];
  for (const g of gates) {
    const es = errors.filter((x) => x.gate === g);
    const ws = warnings.filter((x) => x.gate === g);
    const label = es.length ? "FAIL" : ws.length ? "WARN" : "ok  ";
    console.log(`  ${label}  ${g.padEnd(4)} ${es.length} errors, ${ws.length} warnings`);
    for (const e of es) console.log(`          ${e.file}: ${e.msg}`);
    for (const w of ws) console.log(`          ~ ${w.file}: ${w.msg}`);
  }
}
console.log(errors.length ? `\n${errors.length} error(s)\n` : "\nall gates pass\n");
process.exit(errors.length ? 1 : 0);
