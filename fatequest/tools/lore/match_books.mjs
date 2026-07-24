#!/usr/bin/env node
/**
 * Binds cities that currently have no source backing to passages in the three
 * travellers Polo does not cover (docs/LORE_PIPELINE.md §2, method B).
 *
 * The problem this solves, precisely:
 *
 *   `build_lore.mjs` cut these books at their printed chapter boundaries. That
 *   works for Polo, whose Yule–Cordier edition has 234 short chapters averaging
 *   1.7k characters — roughly one place each. It does not work here. The Lee
 *   translation of Ibn Battuta is a 25-chapter abridgement whose chapters run
 *   to 43k characters and whose titles are dash-joined lists of thirty places.
 *   Binding a city to such a chapter would put the whole of Hindustan behind
 *   one gate marker and call it sourced.
 *
 * So the unit here is the PASSAGE, not the chapter: the paragraphs that
 * actually name the place, plus the paragraph on either side for context.
 * A city gets a binding only if a passage exists; there is no partial credit
 * and no "close enough" chapter fallback. An unbound city keeps
 * `origin: "authored"`, which is an honest label, and 39 honest labels are
 * worth more than 39 citations that do not survive being checked.
 *
 *   node tools/lore/match_books.mjs            # report what would bind
 *   node tools/lore/match_books.mjs --write    # write passages + bind cities
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const BOOKS = join(ROOT, "assets/books");
const CITIES = join(ROOT, "content/tables/cities");
const OUT = join(ROOT, "assets/books/passages.json");

const WRITE = process.argv.includes("--write");

/**
 * Historical name variants, keyed by city id. These are the forms the three
 * translators actually print — Lee's Battuta, Wright's Jubayr, Lunde-Stone's
 * Fadlan — not modern spellings. Getting these from a gazetteer would be
 * cleaner and would also be wrong: "Aleppo" appears in no sentence that Lee
 * wrote, who calls it Haleb.
 *
 * Each entry is matched case-insensitively as a whole word, so "Acre" does not
 * fire inside "massacre" and "Tana" does not fire inside "Sultana".
 */
const NAMES = {
  // — west_asia: the Islamic heartland, which is Battuta's and Jubayr's ground
  accon: ["Acre", "Acca", "Akka", "'Akka"],
  alexandria: ["Alexandria", "Iskandaria", "Iskandariya"],
  antiochia: ["Antioch", "Antākiya", "Antakiya"],
  "babylonia-cairus": ["Cairo", "Caïro", "Misr", "Fustat", "Fostat"],
  basora: ["Basra", "Basrah", "Bussorah", "El Basra"],
  berrhoea: ["Aleppo", "Haleb", "Halab", "Berrhoea"],
  bethleem: ["Bethlehem", "Bait Lahm"],
  caffa: ["Kaffa", "Kafa", "Caffa", "El Kafā", "Kafā"],
  constantinopolis: ["Constantinople", "Istambul", "Stambul", "Rūm"],
  ctesiphon: ["Ctesiphon", "Madāin", "Madain", "El Madāin"],
  damascus: ["Damascus", "Dimashq", "Damascene"],
  edessa: ["Edessa", "Roha", "Ruha", "Urfa"],
  ephesus: ["Ephesus", "Ayasoluk", "Aya Suluk"],
  hierusalem: ["Jerusalem", "El Kuds", "Al-Quds", "Bait El Makdis", "Bait al-Maqdis"],
  ispahan: ["Isfahan", "Ispahan", "Isfahān", "Ispahān"],
  kiovia: ["Kiev", "Kiew", "Kiyev"],
  moscovia: ["Moscow", "Moscovy", "Muscovy"],
  nicaea: ["Nicaea", "Nikaia", "Iznik", "Isnik"],
  ninive: ["Nineveh", "Mosul", "Mausil", "El Mausil"],
  novogardia: ["Novgorod", "Novogardia"],
  petra: ["Petra"],
  smyrna: ["Smyrna", "Izmir", "Yazmīr"],
  "tana-azov": ["Azov", "Azak", "Tana"],
  tarsus: ["Tarsus", "Tarsūs"],
  trapezus: ["Trebizond", "Trapezus", "Tarabzun"],
  tripolis: ["Tripoli", "Tarābulus", "Tarabulus"],
  tyrus: ["Tyre", "Sūr", "Sour"],
  // — central_asia
  bochara: ["Bukhara", "Bokhara", "Bukhārā", "Bokhārā"],
  cabul: ["Kabul", "Kābul", "Cabul"],
  delli: ["Delhi", "Dihli", "Dehli", "Dehlī"],
  merva: ["Merv", "Marw", "Merva"],
  sachiu: ["Sachiu", "Suchau", "Suchow"],
  samara: ["Samara"],
  // — india / africa reach
  axuma: ["Axum", "Aksum", "Abyssinia"],
  dongola: ["Dongola", "Dunqula"],
  mecha: ["Mecca", "Makka", "Mekka"],
  medina: ["Medina", "Madina", "El Madīna"],
  // — china / maritime
  coigangiu: ["Coigangiu"],
  "java-major": ["Java", "Jāva", "Sumatra", "Sumatrā"],
};

const SOURCES = [
  { id: "ibn-battuta", raw: "_ibn_battuta_chapters_raw.json", years: "1325-1354" },
  { id: "ibn-fadlan", raw: "_ibn_fadlan_chapters_raw.json", years: "921-922" },
  { id: "ibn-jubayr", raw: "_ibn_jubayr_chapters_raw.json", years: "1183-1185" },
];

// Chapters that are apparatus rather than travel: prefaces, chronologies,
// editorial notes. Their text mentions places constantly and describes none of
// them, so a match inside one is a false positive by construction.
const isApparatus = (title, body) => {
  const t = String(title).toLowerCase();
  if (/preface|introduction|contents|index|appendix|chronolog|bibliograph|note on/.test(t)) return true;
  // A chronology reads as dated one-line entries; a travel narrative does not.
  const years = (body.match(/\b(8|9|10|11|12|13)\d\d\b/g) ?? []).length;
  return years > body.length / 400;
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Period invective. All three travellers write across a religious frontier and
 * two of them write during the crusades, so the sources call each other pigs
 * and swine and ask God to destroy each other's cities. Ibn Jubayr on Acre is
 * the clearest case, and it is genuine twelfth-century text, not an artefact of
 * extraction.
 *
 * This is not a reason to drop the sources — it is a reason to be explicit that
 * a passage is RAW MATERIAL FOR AN AUTHOR, never shipped prose. Passages are
 * flagged here; gate G24 checks the other end, that no string a player can read
 * carries this vocabulary. Marking it at extraction and checking it at the ship
 * surface is what keeps "we'll remember to clean that up" from being the plan.
 */
const INVECTIVE = /\b(pigs?|swine|sows?|dogs?|infidels?|heretics?|accursed|abominable|filthy|vile)\b|may God (destroy|curse)/gi;

const invectiveIn = (text) => [...new Set((text.match(INVECTIVE) ?? []).map((s) => s.toLowerCase()))];

/** Whether the chapter's own title names this place. */
function titleNames(title, variants) {
  const re = new RegExp(`(^|[^\\p{L}])(${variants.map(esc).join("|")})([^\\p{L}]|$)`, "iu");
  return re.test(String(title));
}


/** Paragraphs naming the place, each with one neighbour on either side. */
function passagesFor(body, variants) {
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 80);
  const re = new RegExp(`(^|[^\\p{L}])(${variants.map(esc).join("|")})([^\\p{L}]|$)`, "iu");
  const hits = [];
  for (let i = 0; i < paras.length; i++) if (re.test(paras[i])) hits.push(i);
  if (!hits.length) return null;

  // Merge neighbouring hits into runs so a place discussed over four paragraphs
  // comes back as one passage rather than four overlapping ones.
  const runs = [];
  for (const i of hits) {
    const last = runs[runs.length - 1];
    if (last && i - last[1] <= 2) last[1] = i;
    else runs.push([i, i]);
  }
  return runs.map(([a, b]) => ({
    text: paras.slice(Math.max(0, a - 1), Math.min(paras.length, b + 2)).join("\n\n"),
    // The sentence around the name itself. `text` opens with a context
    // paragraph, and the match can sit deep inside a paragraph of prose, so
    // neither is reviewable by eye — which is how a passage about Sumatra
    // looked like a plausible citation for Jerusalem until this field existed.
    // Every binding is meant to be checkable in one line, by a person.
    quote: quoteAround(paras[a], re),
    hits: hits.filter((h) => h >= a && h <= b).length,
  }));
}


/** ~90 characters either side of the matched name. */
function quoteAround(para, re) {
  const m = para.match(re);
  if (!m) return para.slice(0, 180);
  const at = para.indexOf(m[0]);
  const from = Math.max(0, at - 90);
  const to = Math.min(para.length, at + m[0].length + 90);
  return (from > 0 ? "…" : "") + para.slice(from, to).replace(/\s+/g, " ").trim()
    + (to < para.length ? "…" : "");
}

// ------------------------------------------------------------------- run

const chapters = [];
for (const s of SOURCES) {
  const p = join(BOOKS, s.raw);
  if (!existsSync(p)) continue;
  const doc = JSON.parse(readFileSync(p, "utf8"));
  const arr = Array.isArray(doc) ? doc : doc.chapters ?? [];
  for (const c of arr) {
    const body = String(c.rawBody ?? "");
    if (body.length < 400) continue;
    if (isApparatus(c.chapterTitle, body)) continue;
    chapters.push({ book: s.id, years: s.years, id: c.id, title: c.chapterTitle, body });
  }
}

const cityFiles = readdirSync(CITIES).filter((f) => f.endsWith(".json"));
const cityDocs = new Map(cityFiles.map((f) => [f, JSON.parse(readFileSync(join(CITIES, f), "utf8"))]));
const allCities = [...cityDocs.values()].flatMap((d) => d.records);
const unbound = allCities.filter((c) => !c.lore?.placeId && !c.lore?.storyId);

const passages = {};
const report = [];

for (const city of unbound) {
  const variants = NAMES[city.id];
  if (!variants) { report.push({ id: city.id, status: "no-variants" }); continue; }

  const found = [];
  for (const ch of chapters) {
    const ps = passagesFor(ch.body, variants);
    if (!ps) continue;
    for (const p of ps)
      found.push({ book: ch.book, years: ch.years, chapterId: ch.id, title: ch.title, ...p });
  }
  if (!found.length) { report.push({ id: city.id, status: "not-found" }); continue; }

  // Rank by how much the passage actually says about the place; use the
  // chapter title only to break ties.
  //
  // Both orderings were tried and both extremes are wrong. Ranking by mentions
  // alone buried Ibn Fadlan's chapter headed "Bukhārā" — one mention, but the
  // whole chapter is the visit — under a passing reference elsewhere. Ranking
  // by title first then bound Jerusalem to a Battuta chapter about Sumatra,
  // displacing Ibn Jubayr, who devotes pages to the city. A title says the
  // chapter is about the place; it does not say this passage is.
  for (const f of found) f.titled = titleNames(f.title, variants);
  found.sort((a, b) =>
    b.hits - a.hits || (b.titled ? 1 : 0) - (a.titled ? 1 : 0) || b.text.length - a.text.length);
  const best = found.slice(0, 3);

  // What counts as source backing. A single glancing mention does not, and
  // length is no substitute: the first cut of this gate accepted "one mention
  // in a passage over 900 characters" and bound Tarsus and Trebizond to Ibn
  // Fadlan — who never went to Anatolia. Both matches sat inside al-Mas'ūdī's
  // second-hand geography, and "the Sea of Trebizond" is the Black Sea, not the
  // town. Length measures the paragraph, not the evidence.
  //
  // So: either the place is named more than once, or it appears in the
  // chapter's own title. The titles of all three books are dash-joined lists of
  // the places the chapter covers — the author's index of his own itinerary,
  // which is exactly the judgement being borrowed here.
  const titled = titleNames(best[0].title, variants);
  const strong = best[0].hits >= 2 || titled;
  report.push({
    id: city.id, status: strong ? "bind" : "weak",
    book: best[0].book, hits: best[0].hits, chars: best[0].text.length,
    why: best[0].hits >= 2 ? `${best[0].hits} 处提及` : "见于章标题",
  });
  if (strong) passages[city.id] = best.map((b) => ({
    book: b.book, years: b.years, chapterId: b.chapterId,
    title: b.title, hits: b.hits, quote: b.quote, text: b.text,
    // Non-empty means: rewrite before any of this reaches a player (G24).
    invective: invectiveIn(b.text),
  }));
}

// ---------------------------------------------------------------- output

const bind = report.filter((r) => r.status === "bind");
const weak = report.filter((r) => r.status === "weak");
const miss = report.filter((r) => r.status !== "bind" && r.status !== "weak");

console.log(`\n可用章节 ${chapters.length} 条（已排除序言／年表等非游记部分）`);
console.log(`未绑定城市 ${unbound.length} 座\n`);
console.log(`  可绑定 ${bind.length}　证据太弱 ${weak.length}　查无 ${miss.length}\n`);

const byBook = {};
for (const r of bind) byBook[r.book] = (byBook[r.book] ?? 0) + 1;
console.log("  按书:", JSON.stringify(byBook));

console.log("\n可绑定：");
for (const r of bind.sort((a, b) => b.hits - a.hits))
  console.log(`  ${r.id.padEnd(18)} ${r.book.padEnd(12)} ${(r.why??"").padEnd(10)} ${r.chars} 字符`);
if (weak.length) {
  console.log("\n证据太弱（保持 authored）：");
  for (const r of weak) console.log(`  ${r.id.padEnd(18)} ${r.book.padEnd(12)} ${r.hits} 处  ${r.chars} 字符`);
}
if (miss.length) {
  console.log("\n查无：");
  for (const r of miss) console.log(`  ${r.id.padEnd(18)} ${r.status}`);
}

if (!WRITE) {
  console.log("\n（未写入。加 --write 落盘）");
  process.exit(0);
}

writeFileSync(OUT, JSON.stringify({
  note: "Passages extracted by tools/lore/match_books.mjs. Source of truth is assets/books/*.txt.",
  generated: passages,
}, null, 2) + "\n");
console.log(`\n写入 ${OUT}：${Object.keys(passages).length} 座城的段落`);

// Bind the cities. Only the `lore` block changes; nothing else is touched.
let touched = 0;
for (const [file, doc] of cityDocs) {
  let dirty = false;
  for (const c of doc.records) {
    const ps = passages[c.id];
    if (!ps) continue;
    c.lore = {
      placeId: `${ps[0].book}:${ps[0].chapterId}`,
      origin: "source",
      ref: { book: ps[0].book, chapterId: ps[0].chapterId },
    };
    dirty = true; touched++;
  }
  if (dirty) writeFileSync(join(CITIES, file), JSON.stringify(doc, null, 2) + "\n");
}
console.log(`绑定 ${touched} 座城的 lore`);
