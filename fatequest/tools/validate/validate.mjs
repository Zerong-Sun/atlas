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
import { createHash } from "node:crypto";
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
      divIds = ids("divinations"), goodIds = ids("goods"),
      retainerIds = ids("retainers"), endingIds = ids("endings");

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

// G2 continued — the rest of the DATA_MODEL.md §5 reference graph. Without
// these, "all gates pass" only means the three tables that existed first are
// consistent, which is exactly the kind of false green that lets a broken
// mentor or a phantom commodity ship.
for (const c of byTable.cities ?? []) {
  const f = recordFile.get(c.id);
  if (c.mentor) { ref(retainerIds.has(c.mentor), "G2", f, `${c.id}.mentor -> "${c.mentor}" not found`); mark(c.mentor); }
  // How the player actually MEETS the mentor. GDD §6 counts the local mentor
  // among a city's six things; a mentor with no encounter is unreachable.
  if (c.mentorEvent) { ref(eventIds.has(c.mentorEvent), "G2", f, `${c.id}.mentorEvent -> "${c.mentorEvent}" not found`); mark(c.mentorEvent); }
  if (c.specialty) { ref(goodIds.has(c.specialty), "G2", f, `${c.id}.specialty -> "${c.specialty}" not found`); mark(c.specialty); }
  for (const g of c.market?.goods ?? []) { ref(goodIds.has(g), "G2", f, `${c.id}.market.goods -> "${g}" not found`); mark(g); }
}
for (const a of byTable.archetypes ?? []) {
  const f = recordFile.get(a.id);
  ref(cityIds.has(a.start), "G2", f, `${a.id}.start -> "${a.start}" not found`);
  if (a.goal?.target) ref(cityIds.has(a.goal.target), "G2", f, `${a.id}.goal.target -> "${a.goal.target}" not found`);
  for (const e of a.endings ?? []) { ref(endingIds.has(e), "G2", f, `${a.id}.endings -> "${e}" not found`); mark(e); }
  for (const g of a.startKit?.goods ?? []) ref(goodIds.has(g), "G2", f, `${a.id}.startKit.goods -> "${g}" not found`);
}
for (const d of byTable.divinations ?? []) {
  const f = recordFile.get(d.id);
  for (const c of d.learnAt ?? []) ref(cityIds.has(c), "G2", f, `${d.id}.learnAt -> "${c}" not found`);
  if (d.teacher) { ref(retainerIds.has(d.teacher), "G2", f, `${d.id}.teacher -> "${d.teacher}" not found`); mark(d.teacher); }
}
for (const r of byTable.retainers ?? []) {
  const f = recordFile.get(r.id);
  if (r.origin?.city) ref(cityIds.has(r.origin.city), "G2", f, `${r.id}.origin.city -> "${r.origin.city}" not found`);
  for (const v of r.recruitAt ?? []) ref(cityIds.has(v.cityId), "G2", f, `${r.id}.recruitAt -> "${v.cityId}" not found`);
  for (const rel of r.relations ?? []) ref(retainerIds.has(rel.retainerId), "G2", f, `${r.id}.relations -> "${rel.retainerId}" not found`);
  if (r.questId) ref(eventIds.has(r.questId), "G2", f, `${r.id}.questId -> "${r.questId}" not found`);
}
for (const g of byTable.goods ?? []) {
  const f = recordFile.get(g.id);
  for (const e of g.events ?? []) { ref(eventIds.has(e), "G2", f, `${g.id}.events -> "${e}" not found`); mark(e); }
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
// MVP methods need route-facing effects + ≥30 resultTexts; non-MVP may be codex-only.
for (const d of byTable.divinations ?? []) {
  const f = recordFile.get(d.id);
  if (!d.effects?.length) err("G3", f, `${d.id}: \`effects\` must not be empty (GDD §8.2)`);
  if (d.mvp) {
    if ((d.resultTexts?.length ?? 0) < 30)
      err("G3", f, `${d.id}: mvp requires resultTexts.length >= 30 (got ${d.resultTexts?.length ?? 0})`);
    const routeFacing = (d.effects ?? []).some((e) =>
      ["reveal_map", "reveal_birth", "unlock_route"].includes(e.op));
    if (!routeFacing)
      err("G3", f, `${d.id}: mvp requires at least one route-facing effect (reveal_map|reveal_birth|unlock_route)`);
  } else if (!(d.effects ?? []).some((e) => e.op === "codex")) {
    err("G3", f, `${d.id}: non-mvp should include a codex soft effect`);
  }
}

// ------------------------------------- G13: the three lines must be walkable
// GDD M1 acceptance is "the three character lines can be walked end to end".
// That is a graph property, so assert it rather than discovering it in
// playtesting. Endpoints follow GDD §16.5.
// `mode` matters: the maritime line must be SAILABLE, not merely reachable on
// foot. An earlier version only checked reachability and passed while the
// Indian Ocean was fragmented — the "sea route" was quietly walking overland
// through the Taklamakan.
const LINES = {
  "polo":     { from: "tauris", to: "cambaluc", ship: false },
  "steppe":   { from: "tauris", to: "chandu",   ship: false },
  "maritime": { from: "ormus",  to: "zayton",   ship: true  },
};
{
  const build = (shipOnly) => {
    const a = new Map();
    for (const r of byTable.routes ?? []) {
      if (shipOnly && !(r.modes ?? []).includes("ship")) continue;
      if (!a.has(r.from)) a.set(r.from, []);
      if (!a.has(r.to)) a.set(r.to, []);
      a.get(r.from).push(r.to);
      a.get(r.to).push(r.from);
    }
    return a;
  };
  const graphs = { any: build(false), ship: build(true) };
  for (const [name, spec] of Object.entries(LINES)) {
    const { from, to } = spec;
    const adj = spec.ship ? graphs.ship : graphs.any;
    if (!cityIds.has(from) || !cityIds.has(to)) {
      err("G13", "routes", `line "${name}": endpoint missing (${from} -> ${to})`);
      continue;
    }
    // BFS with hop count, so we can also report an implausibly long path.
    const seen = new Set([from]);
    let frontier = [from], hops = 0, found = false;
    while (frontier.length && !found) {
      const next = [];
      for (const n of frontier) for (const m of adj.get(n) ?? []) {
        if (m === to) { found = true; break; }
        if (!seen.has(m)) { seen.add(m); next.push(m); }
      }
      frontier = next; hops++;
      if (hops > 60) break;
    }
    if (!found)
      err("G13", "routes", `line "${name}": NO ${spec.ship ? "SAILABLE " : ""}PATH from ${from} to ${to}`);
  }
}

// ---------------------------- G14: every line must be AFFORDABLE, not just
// connected. G13 proves a path exists; a path you cannot pay for is not a
// walkable line. All three archetypes shipped under-funded once — the graph
// was fine and the journey was impossible — so the purse is now checked
// against the cheapest fare, with headroom for imperfect routing.
//
// NOTE: until trade gives an income side (ROADMAP P4), the purse IS the whole
// budget. Rebalance this margin when trading lands.
{
  // With trade implemented the purse is seed capital, not a prepaid itinerary:
  // it must cover the first legs and a first cargo, and the journey funds
  // itself from there. Requiring the full fare up front made the merchant
  // start with more silver than a leg of the trip could ever earn.
  const MARGIN = 0.45;
  const tc = Object.fromEntries((byTable.transports ?? []).map((t) => [t.id, t]));
  const adj = new Map();
  for (const r of byTable.routes ?? []) {
    if (!adj.has(r.from)) adj.set(r.from, []);
    if (!adj.has(r.to)) adj.set(r.to, []);
    adj.get(r.from).push(r);
    adj.get(r.to).push(r);
  }
  const other = (r, c) => (r.from === c ? r.to : r.from);
  const cheapest = (from, to, shipOnly) => {
    const dist = new Map([[from, 0]]);
    const pq = [[0, from]];
    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, n] = pq.shift();
      if (n === to) return d;
      if (d > (dist.get(n) ?? Infinity)) continue;
      for (const r of adj.get(n) ?? []) {
        const modes = (r.modes ?? []).filter((m) => !shipOnly || m === "ship");
        if (!modes.length) continue;
        const fare = Math.min(...modes.map((m) => (r.cost ?? 0) + (tc[m]?.cost ?? 0)));
        const nxt = other(r, n), nd = d + fare;
        if (nd < (dist.get(nxt) ?? Infinity)) { dist.set(nxt, nd); pq.push([nd, nxt]); }
      }
    }
    return dist.get(to) ?? null;
  };
  for (const a of byTable.archetypes ?? []) {
    const to = a.goal?.target;
    if (!a.start || !to) continue;
    const shipOnly = a.id === "merchant";
    const fare = cheapest(a.start, to, shipOnly);
    const purse = a.startKit?.coins ?? 0;
    if (fare === null) { err("G14", recordFile.get(a.id), `${a.id}: no farecheap path ${a.start} -> ${to}`); continue; }
    if (purse < fare * MARGIN)
      err("G14", recordFile.get(a.id),
        `${a.id}: purse ${purse} < seed capital ${Math.ceil(fare * MARGIN)} `
        + `(${MARGIN} x cheapest fare ${fare}, ${a.start} -> ${to})`);
  }
}

// ------------------------- G17: every text key an event asks for must exist
// A key generator once turned the hyphen in city ids into a dot, filing the
// text for java-major / babylonia-cairus / tana-azov under an address nothing
// ever looks up. The i18n fallback chain hid it: those cities silently showed
// raw keys. Assert the addresses match instead of trusting them to.
{
  const enPath = join(ROOT, "content/i18n/en.json");
  if (existsSync(enPath)) {
    const en = JSON.parse(readFileSync(enPath, "utf8"));
    const want = new Map();
    for (const e of byTable.events ?? []) {
      for (const k of [e.title, e.body]) if (k) want.set(k, e.id);
      for (const c of e.choices ?? []) if (c.label) want.set(c.label, e.id);
    }
    for (const c of byTable.cities ?? []) if (c.name) want.set(c.name, c.id);
    let missing = 0;
    for (const [k, owner] of want) {
      if (en[k] === undefined) {
        missing++;
        if (missing <= 8) err("G17", "content/i18n/en.json", `${owner} asks for "${k}" — no English text`);
      }
    }
    if (missing > 8) err("G17", "content/i18n/en.json", `...and ${missing - 8} more missing keys`);
    // Orphans are warnings: text may legitimately precede its event.
    let orphan = 0;
    for (const k of Object.keys(en)) if (k.startsWith("ev.") && !want.has(k)) orphan++;
    if (orphan) warn("G17", "content/i18n/en.json", `${orphan} ev.* keys referenced by nothing`);
  }
}

// ----------------------- G21: authored story text must be compiled and current
// A translation whose source has since changed is worse than a missing one: it
// reads as finished. The story/ authoring format records the source hash it was
// made from, so drift is detectable — this gate surfaces it.
{
  const storyDir = join(ROOT, "content/story");
  if (existsSync(storyDir)) {
    for (const unit of readdirSync(storyDir)) {
      const dir = join(storyDir, unit);
      if (!statSync(dir).isDirectory()) continue;
      const enPath = join(dir, "en.md");
      if (!existsSync(enPath)) { warn("G21", `content/story/${unit}`, "no en.md source"); continue; }
      const sections = (t) => {
        const out = {};
        let key = null, buf = [];
        const body = t.replace(/^---[\s\S]*?\n---\n/, "");
        for (const line of body.split("\n")) {
          const h = line.match(/^##\s+(\S+)\s*$/);
          if (h) { if (key) out[key] = buf.join("\n").trim(); key = h[1]; buf = []; }
          else if (key !== null) buf.push(line);
        }
        if (key) out[key] = buf.join("\n").trim();
        return out;
      };
      const en = sections(readFileSync(enPath, "utf8"));
      for (const f of readdirSync(dir)) {
        if (!f.endsWith(".md") || f === "en.md") continue;
        const lang = f.slice(0, -3);
        const text = readFileSync(join(dir, f), "utf8");
        const stampBlock = text.match(/^stamps:\n((?: {2}.*\n)+)/m);
        const stamps = {};
        if (stampBlock) {
          for (const line of stampBlock[1].split("\n")) {
            const kv = line.trim().match(/^([\w.]+):\s*(\S+)$/);
            if (kv) stamps[kv[1]] = kv[2];
          }
        }
        const tr = sections(text);
        for (const key of Object.keys(en)) {
          // Normalised: a re-wrap is not a content change (see story.mjs).
          const h = createHash("sha256")
            .update(String(en[key]).replace(/\s+/g, " ").trim(), "utf8")
            .digest("hex").slice(0, 12);
          if (!(key in tr)) { warn("G21", `content/story/${unit}/${f}`, `${key}: not translated`); continue; }
          if (stamps[key] && stamps[key] !== h)
            err("G21", `content/story/${unit}/${f}`, `${key}: STALE — source changed since translation`);
        }
      }
    }
  }
}

// ------------------- G9/G11: the kernel's architectural rules, machine-checked
// CODE_PLAN §9 specified these gates and nothing ever implemented them, so the
// three rules that keep the kernel deterministic and testable have been resting
// on nobody breaking them by accident. Architectural decay is exactly what a
// functional test cannot see.
{
  const kernel = join(ROOT, "core");
  const walkGd = (dir) => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walkGd(p) : (n.endsWith(".gd") ? [p] : []);
    });
  };
  // Banned constructs and why. Comments and doc-comments are stripped first so
  // a rule explained in prose does not trip its own gate.
  const BANNED = [
    [/\brandi\s*\(/, "randi() — use Rng (determinism)"],
    [/\brandf\s*\(/, "randf() — use Rng (determinism)"],
    [/\brandomize\s*\(/, "randomize() — use Rng (determinism)"],
    [/\brandi_range\s*\(/, "randi_range() — use Rng (determinism)"],
    [/\bTime\.get_/, "Time.get_* — wall-clock time is not world time"],
    [/^extends\s+Node\b/m, "extends Node — the kernel must be headless"],
  ];
  for (const f of walkGd(kernel)) {
    const rel = relative(ROOT, f);
    const src = readFileSync(f, "utf8")
      .split("\n").map((l) => l.replace(/#.*$/, "")).join("\n");
    for (const [re, why] of BANNED) {
      if (re.test(src)) err("G11", rel, why);
    }
    // G9: only the executor writes WorldState.
    if (!rel.endsWith("effect_executor.gd")) {
      const m = src.match(/\bstate\.(coins|goods|city|flags|codex|stickers|fate|items|languages|revealed|jdn|days_elapsed|cargo_slots|faith|once_fired|unlocked_routes|learned_divinations)\s*(=|\+=|-=)[^=]/);
      if (m) err("G9", rel, `writes WorldState.${m[1]} directly — emit an effect instead`);
    }
  }
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

// ------------------------------- G15/G16: stub accounting (docs/PLAN.md §8)
// Progress on the 133 stubs should be a number CI prints every run, not
// something anyone tracks by memory. G16 is the hard rule: a metropolis is
// the one tier that owes GDD §6's full six, so none of its events may be a
// placeholder.
{
  const evs = byTable.events ?? [];
  const stubs = evs.filter((e) => e.stub);
  const metro = new Set((byTable.cities ?? []).filter((c) => c.tier === "metropolis").map((c) => c.id));
  const metroEvents = new Set();
  for (const c of byTable.cities ?? []) {
    if (!metro.has(c.id)) continue;
    if (c.entryEvent) metroEvents.add(c.entryEvent);
    for (const s of c.sites ?? []) metroEvents.add(s);
  }
  const metroStubs = stubs.filter((e) => metroEvents.has(e.id));
  const pct = evs.length ? ((evs.length - stubs.length) / evs.length * 100).toFixed(1) : "0";
  warn("G15", "events", `${evs.length - stubs.length}/${evs.length} written (${pct}%), ${stubs.length} stubs remain`);
  for (const e of metroStubs)
    warn("G16", recordFile.get(e.id), `${e.id}: metropolis event is still a stub`);
}

// ------------------------------------------------ G2b: orphan detection
for (const e of byTable.events ?? [])
  if (!referenced.has(e.id) && e.kind !== "road")
    warn("G2b", recordFile.get(e.id), `${e.id}: not referenced by any city or route (may be reserved)`);

// ------------------------------------------------ G7: glossary consistency
// Every Chinese translation must use glossary-approved terms when the
// corresponding English source contains a glossary-tracked English term.
// Without this gate, Zayton will be "刺桐" in one city and "泉州" in another
// (docs/PLAN.md §4, docs/L10N_PLAN.md §4.3).
{
  const glossaryPath = join(ROOT, "assets/data/glossary.json");
  const zhPath = join(ROOT, "content/i18n/zh.json");
  const enPath = join(ROOT, "content/i18n/en.json");
  if (existsSync(glossaryPath) && existsSync(zhPath) && existsSync(enPath)) {
    const glossary = JSON.parse(readFileSync(glossaryPath, "utf8"));
    const zh = JSON.parse(readFileSync(zhPath, "utf8"));
    const en = JSON.parse(readFileSync(enPath, "utf8"));

    // Build two-tier map with pre-compiled regex patterns
    const placeTerms = new Map(); // en_lower → { regex, zhVariants }
    const conceptTerms = new Map();
    for (const t of glossary.terms ?? []) {
      const enLower = t.en.toLowerCase().split("/")[0].trim();
      const parts = t.zh.split(/[（(／\/）)]/).map(s => s.trim()).filter(Boolean);
      const esc = enLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const entry = { regex: new RegExp("\\b" + esc + "\\b", "i"), zhVariants: parts, aliases: t.aliases ?? [] };
      const target = t.kind === "place" ? placeTerms : conceptTerms;
      target.set(enLower, entry);
      for (const a of t.aliases ?? []) {
        const aLower = a.toLowerCase().trim();
        if (!target.has(aLower)) {
          const aEsc = aLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          target.set(aLower, { regex: new RegExp("\\b" + aEsc + "\\b", "i"), zhVariants: parts, aliases: [] });
        }
      }
    }

    // For each translated Chinese entry, verify glossary terms
    let g7Errors = 0, g7Warns = 0;
    const checkTerms = (key, zhText, enText, terms, isPlace) => {
      for (const [enTerm, info] of terms) {
        if (!info.regex.test(enText)) continue;
        const variants = info.zhVariants;
        if (!variants.length) continue;
        // Single-character terms (e.g. "玉", "玉") must also pass the check.
        if (!variants.some((v) => v.length >= 1 && zhText.includes(v))) {
          if (isPlace) {
            g7Errors++;
            if (g7Errors <= 10)
              err("G7", `zh.json:${key}`,
                `place "${enTerm}" → ZH missing approved term(s) ${JSON.stringify(variants)}`);
          } else {
            g7Warns++;
            if (g7Warns <= 6)
              warn("G7", `zh.json:${key}`,
                `term "${enTerm}" → ZH missing ${JSON.stringify(variants)} (advisory)`);
          }
        }
      }
    };
    for (const [key, zhText] of Object.entries(zh)) {
      if (!zhText || typeof zhText !== "string") continue;
      const enText = en[key];
      if (!enText || typeof enText !== "string") continue;
      checkTerms(key, zhText, enText, placeTerms, true);
      checkTerms(key, zhText, enText, conceptTerms, false);
    }
    if (g7Errors > 10) err("G7", "zh.json", `...and ${g7Errors - 10} more place-term mismatches`);
    if (g7Warns > 6) warn("G7", "zh.json", `...and ${g7Warns - 6} more advisory mismatches`);
  } else {
    warn("G7", "i18n", "glossary.json or zh.json not found — glossary gate skipped");
  }
}

// ------------------------------ G18: Chinese body must not be ASCII prose
// When the fallback chain silently serves English where Chinese is missing,
// the player sees mixed-language text. Every Chinese entry whose EN source
// is long-form prose (.body, .desc, .wonder, .origin, .quest, .omen, .sign)
// must actually BE Chinese — not a copy of the English.
{
  const zhPath = join(ROOT, "content/i18n/zh.json");
  if (existsSync(zhPath)) {
    const zh = JSON.parse(readFileSync(zhPath, "utf8"));
    const LONG_SUFFIXES = [".body", ".desc", ".wonder", ".origin", ".quest", ".omen", ".sign"];
    let g18Errors = 0;
    for (const [key, zhText] of Object.entries(zh)) {
      if (!zhText || typeof zhText !== "string") continue;
      const isLong = LONG_SUFFIXES.some((s) => key.endsWith(s));
      if (!isLong) continue;
      // If > 60% of characters are ASCII (English), the text is untranslated
      const ascii = [...zhText].filter((c) => c.charCodeAt(0) < 128).length;
      const total = zhText.length;
      if (total > 20 && ascii / total > 0.6) {
        g18Errors++;
        if (g18Errors <= 8)
          err("G18", `zh.json:${key}`, `${Math.round(ascii/total*100)}% ASCII — likely untranslated English`);
      }
    }
    if (g18Errors > 8) err("G18", "zh.json", `...and ${g18Errors - 8} more ASCII-leak entries`);
  }
}

// ------------------------------ G20: Zayton must be translation-complete
// Zayton is the template city for all translation (docs/L10N_PLAN.md §1).
// If a Zayton text is missing from zh.json, the vertical slice is broken —
// this is a hard CI error, not a warning.
{
  const enPath = join(ROOT, "content/i18n/en.json");
  const zhPath = join(ROOT, "content/i18n/zh.json");
  if (existsSync(enPath) && existsSync(zhPath)) {
    const en = JSON.parse(readFileSync(enPath, "utf8"));
    const zh = JSON.parse(readFileSync(zhPath, "utf8"));
    const zKeys = Object.keys(en).filter((k) => k.includes("zayton"));
    const missing = zKeys.filter((k) => !zh[k]);
    for (const k of missing)
      err("G20", `zh.json:${k}`, `Zayton translation missing — template city must be 100%`);
    if (zKeys.length && !missing.length)
      warn("G20", "zh.json", `Zayton: ${zKeys.length}/${zKeys.length} translated — template city complete`);
  }
}

// ------------- G24: source citations must resolve, and the sources' invective
// must not reach the player.
//
// Two halves of one rule, because the three new travellers introduce two new
// ways to be wrong that Polo did not.
//
// (a) A city marked `origin: "source"` claims a passage backs it. The claim is
//     worth nothing unless the passage exists and actually names the place —
//     an earlier cut of the matcher bound Tarsus and Trebizond to Ibn Fadlan,
//     who never went to Anatolia, and nothing would have caught it.
//
// (b) Ibn Jubayr and Ibn Battuta write across a religious frontier during the
//     crusades and call the other side pigs and swine. That is authentic
//     twelfth-century text and legitimate source material; it is not shippable
//     prose. `passages.json` marks it, and this checks the far end — no string
//     a player can read may carry it. GDD §19's red line, enforced rather than
//     remembered.
{
  const PASSAGES = join(ROOT, "assets/books/passages.json");
  const passages = existsSync(PASSAGES)
    ? JSON.parse(readFileSync(PASSAGES, "utf8")).generated ?? {}
    : {};

  for (const c of byTable.cities ?? []) {
    if (c.lore?.origin !== "source") continue;
    const book = c.lore?.ref?.book;
    if (book === "marco-polo") continue;   // Polo predates this pipeline
    const ps = passages[c.id];
    if (!ps?.length) {
      err("G24", recordFile.get(c.id),
        `${c.id}: claims origin "source" from ${book}, but no passage backs it`);
      continue;
    }
    if (ps[0].book !== book)
      err("G24", recordFile.get(c.id),
        `${c.id}: cites ${book} but the passage comes from ${ps[0].book}`);
    if (!ps[0].quote || ps[0].quote.length < 40)
      err("G24", recordFile.get(c.id), `${c.id}: passage has no reviewable quote`);
  }

  // The ship surface. Deliberately checked against the compiled i18n rather
  // than the authoring sources: what matters is what a player can read.
  const INVECTIVE = /\b(swine|sows?|infidels?|heretics?|accursed|abominable)\b|may God (destroy|curse)/gi;
  for (const lang of ["en", "zh"]) {
    const p = join(ROOT, `content/i18n/${lang}.json`);
    if (!existsSync(p)) continue;
    const doc = JSON.parse(readFileSync(p, "utf8"));
    for (const [k, v] of Object.entries(doc)) {
      const found = [...new Set((String(v).match(INVECTIVE) ?? []).map((s) => s.toLowerCase()))];
      if (found.length)
        err("G24", `${lang}.json:${k}`,
          `period invective reaches the player: ${found.join(", ")} — rewrite, do not quote`);
    }
  }
}

// ------------------ G23: every ending must be reachable, and say something
// GDD §14 / AUDIT §9.2. An ending whose conditions no run can satisfy is worse
// than a missing one: it sits in the table looking finished. The judge in
// core/narrative/ending.gd is the authority on what a condition key means, so
// this gate checks the two things a static pass can actually prove — that each
// key is one the judge implements, and that each numeric demand is within what
// the shipped world can supply.
{
  const KEYS = new Set(["visitedCities", "returnedToStart", "reputationBands", "netWorth",
    "revealedRoutes", "learnedDivinations", "flags", "retainersKept", "codexPct"]);
  const cityCount = (byTable.cities ?? []).length;
  const routeCount = (byTable.routes ?? []).length;
  const divIds = new Set((byTable.divinations ?? []).map((d) => d.id));
  const retainerCount = (byTable.retainers ?? []).length;
  const bandSet = new Set((byTable.cities ?? []).map((c) => c.band).filter(Boolean));

  // Flags a run can actually raise: anything some event or divination sets.
  const flagsSet = new Set();
  for (const ev of byTable.events ?? [])
    for (const ch of ev.choices ?? [])
      for (const branch of [ch, ch.pass, ch.fail])
        for (const eff of branch?.effects ?? [])
          if (eff.op === "flag") flagsSet.add(eff.value);

  let layer1 = 0;
  for (const e of byTable.endings ?? []) {
    const c = e.conditions ?? {};
    if (Number(e.layer) === 1) layer1++;
    const at = recordFile.get(e.id);

    for (const [k, v] of Object.entries(c)) {
      if (!KEYS.has(k)) { err("G23", at, `${e.id}: condition key '${k}' is not implemented`); continue; }
      if (k === "visitedCities" && Number(v) > cityCount)
        err("G23", at, `${e.id}: asks for ${v} cities; the world has ${cityCount}`);
      if (k === "revealedRoutes" && Number(v) > routeCount)
        err("G23", at, `${e.id}: asks for ${v} routes; the world has ${routeCount}`);
      if (k === "retainersKept" && Number(v) > retainerCount)
        err("G23", at, `${e.id}: asks for ${v} retainers; only ${retainerCount} exist`);
      if (k === "reputationBands" && Number(v) > bandSet.size)
        err("G23", at, `${e.id}: asks for ${v} bands; only ${bandSet.size} are inhabited`);
      if (k === "codexPct" && Number(v) > 100)
        err("G23", at, `${e.id}: asks for ${v}% of the codex`);
      if (k === "learnedDivinations")
        for (const d of v)
          if (!divIds.has(d)) err("G23", at, `${e.id}: requires unknown divination '${d}'`);
      if (k === "flags")
        for (const f of v)
          if (!flagsSet.has(f)) err("G23", at, `${e.id}: requires flag '${f}' that nothing sets`);
    }

    // The epilogue must interpolate only variables the judge can supply, and
    // must actually use the ones it declares — an unused variable is a sign the
    // text was rewritten and the field forgotten.
    const VARS = new Set(["cities", "years", "start", "lastCity", "faith",
      "longestRoute", "richestTrade"]);
    for (const v of e.variables ?? [])
      if (!VARS.has(v)) err("G23", at, `${e.id}: epilogue variable '{${v}}' has no value`);
  }

  // Layer 1 is the floor under every run: without it a player who qualifies for
  // nothing has no way to close the book.
  if (layer1 === 0)
    err("G23", "endings", "no layer-1 ending — a run that qualifies for nothing cannot end");
}

// -------------------- G22: a retainer's hold must match the road they know
// GDD §11.7 / AUDIT §9.1. The cargo linkage is the reason retainers exist, and
// it only means anything if a sailor's hold is worthless on land and a porter's
// is worthless at sea. Nothing in the schema enforces that — `cargo.condition`
// is a free string sitting next to `roles`, and a copy-paste that gives a
// sailor `land_only` would quietly hand the player six free land slots that no
// test would notice. So check the two against each other here.
{
  const ROLE_ROAD = { porter: "land", caravaneer: "land", sailor: "sea", pilot: "sea" };
  const OK_FOR = { land: ["land_only", "always"], sea: ["sea_only", "always"] };
  for (const r of byTable.retainers ?? []) {
    if (!r.cargo) continue;
    const cond = r.cargo.condition ?? "always";
    const slots = Number(r.cargo.slots ?? 0);

    if (slots > 0 && cond === "always")
      err("G22", `retainers:${r.id}`,
        `cargo works on every road — a hold must be land_only or sea_only`);

    // `kind` and `condition` are two spellings of the same fact; disagreement
    // means one of them was edited and the other forgotten.
    if (r.cargo.kind && !OK_FOR[r.cargo.kind]?.includes(cond))
      err("G22", `retainers:${r.id}`,
        `cargo.kind=${r.cargo.kind} but condition=${cond}`);

    const road = (r.roles ?? []).map((x) => ROLE_ROAD[x]).find(Boolean);
    if (road && !OK_FOR[road].includes(cond))
      err("G22", `retainers:${r.id}`,
        `roles=[${r.roles}] travel by ${road}, but cargo is ${cond}`);
  }
}

// ------------------------------------------------------------- report
const quiet = process.argv.includes("--quiet");
const counts = Object.entries(byTable).map(([t, r]) => `${t}:${r.length}`).join(" ");
if (!quiet) {
  console.log(`\ncontent: ${files.length} files, ${counts}\n`);
  const gates = ["G1","G2","G2b","G3","G7","G8","G10","G12","G13","G14","G15","G16","G9","G11","G17","G18","G21","G20","G22","G23","G24"];
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
