#!/usr/bin/env node
/**
 * Generates content/tables/cities/*.json from the two authoritative sources:
 *   - worldmap/data/cities.geojson  → coord, name_medieval (id), map tier
 *   - content/lore/marco-polo-lore.json → band, lore linkage, depth signal
 *
 * Written as a generator rather than by hand because ~75 records × ~14 fields
 * is exactly the kind of work where hand-typing produces silent drift between
 * the map layer and the content layer. Re-run it whenever either source moves;
 * hand edits to the output will be overwritten.
 *
 * Per docs/DATA_MODEL.md §2 rule 2, the city id is the slugified
 * `name_medieval` from the map, so one id spans map and content. The lore
 * record is linked separately via lore.placeId, because Polo's chapter slug
 * and the map's Latin form do not always agree (samarcan vs Samarcanda).
 *
 * Usage: node tools/lore/build_cities.mjs [--dry]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const geo = JSON.parse(readFileSync(join(ROOT, "worldmap/data/cities.geojson"), "utf8"));
const lore = JSON.parse(readFileSync(join(ROOT, "assets/books/marco-polo-lore.json"), "utf8"));

// ---------------------------------------------------------------- GDD §16.4
// The twelve trunk metropolises, keyed by map slug.
const METROPOLIS = new Set([
  "tauris", "baldacum", "ormus", "balc", "samarcanda", "cascar",
  "cotan", "lop", "chandu", "cambaluc", "kinsay", "zayton",
]);

// Polo's chapter slug -> map slug, where the two naming traditions diverge.
const LORE_TO_MAP = {
  baudas: "baldacum",
  samarcan: "samarcanda",
  "descent-to-the-city-of-hormos": "ormus",
  "great-city-of-yasdi": "yasdi",
  "kingdom-of-kerman": "kerman",
  "a-province-called-cotan": "cotan",
  "great-province-of-tangut": "campichu",
  "kingdom-of-melibar": "melibar",
  "great-province-of-maabar": "maabar",
  "kingdom-of-tana": "tana",
  "kingdom-of-cambaet": "cambaet",
  "kingdom-of-semenat": "semenat",
  "island-called-pentam": "pentam",
  "great-country-called-chamba": "chamba",
  "great-city-of-kinsay": "kinsay",
  "great-haven-of-zayton": "zayton",
  "greatness-of-the-city-of-fuju": "fuju",
  "noble-city-of-sinjumatu": "sinjumatu",
  "very-noble-city-of-saianfu": "saianfu",
  "city-of-sindafu": "sindafu",
  aden: "aden",
  // Grand Canal corridor — Polo's densest run of city chapters.
  "great-river-caramoran-and-the-city-of-cachanfu": "cachanfu",
  "cities-of-cacanfu": "cacanfu",
  "cities-of-linju": "linju",
  "cities-of-paukin": "paukin",
  "cities-of-tiju": "tiju",
  "chinginju-and-the-slaughter-of-certain-alans-there": "chinginju",
  "gulf-of-calatu": "calatu",
  // cambaluc-2 is Polo's SECOND chapter on the capital, not a second city.
  // It is folded into cambaluc rather than becoming a phantom node.
  "cambaluc-2": "cambaluc",
};

// Band by longitude, used when a city has no lore record to inherit one from.
function bandFor(lon, lat) {
  if (lon < 26) return "europe";
  // NOTE: this only applies to cities with no lore record — where one exists,
  // its band wins. Polo files the Arabian coast under his India book, so Aden
  // and Dhofar are `india` here. That is the book's grouping, not an economic
  // zone, and the two are not the same thing (see §economy note below).
  if (lon < 60) return lat < 25 ? "india" : "west_asia";
  if (lon < 78) return "central_asia";
  if (lon < 100) return lat > 41 ? "steppe" : "central_asia";
  if (lat < 20) return "maritime_asia";
  return "china";
}
const CULTURE = {
  europe: "latin", west_asia: "islamic", central_asia: "steppe",
  steppe: "steppe", china: "east_asia", india: "indian_ocean",
  maritime_asia: "indian_ocean",
};
const FAITHS = {
  europe: ["latin"], west_asia: ["islam", "nestorian"],
  central_asia: ["islam", "buddhism", "folk"], steppe: ["folk", "nestorian", "buddhism"],
  china: ["buddhism", "daoism", "folk", "nestorian"],
  india: ["hindu", "islam", "folk"], maritime_asia: ["islam", "hindu", "folk"],
};
const CURRENCY = {
  europe: "ducat", west_asia: "dinar", central_asia: "dirham",
  steppe: "silver-ingot", china: "cash", india: "dinar", maritime_asia: "dinar",
};
const CALENDARS = {
  europe: ["julian"], west_asia: ["islamic"], central_asia: ["islamic", "turkic"],
  steppe: ["turkic", "chinese"], china: ["chinese"], india: ["indian"],
  maritime_asia: ["islamic", "indian"],
};

// --------------------------------------------------------------- index lore
const loreBySlug = new Map();
for (const p of lore.places) {
  loreBySlug.set(p.id, p);
  const alias = LORE_TO_MAP[p.id];
  if (alias) loreBySlug.set(alias, p);
}

// -------------------------------------------------------------- select nodes
// A map city becomes a content node if it has lore, is a trunk metropolis, or
// sits on the corridor (east of the Bosphorus). The western cities stay on the
// map without content: the world is larger than the chapter, which is the
// whole point of GDD §16.1.
const nodes = [];
for (const f of geo.features) {
  const id = slug(f.properties.name_medieval);
  const [lon, lat] = f.geometry.coordinates;
  const lr = loreBySlug.get(id);
  const onCorridor = lon >= 26;
  if (!lr && !METROPOLIS.has(id) && !onCorridor) continue;

  const band = lr?.band ?? bandFor(lon, lat);
  // Depth follows the corpus, not a guess. Measured body lengths across the
  // 136 places: p25=1089, median=1822, p75=1960, max=2094. An earlier >2500
  // threshold could never fire — nothing in the book is that long. Anything at
  // or above the median carries enough material for a shrine and a market.
  let tier;
  if (METROPOLIS.has(id)) tier = "metropolis";
  else if (lr && (lr.body?.length ?? 0) >= 1822) tier = "city";
  else if (lr || f.properties.tier <= 2) tier = "town";
  else tier = "station";

  nodes.push({ id, lon, lat, band, tier, lore: lr, props: f.properties });
}

// ------------------------------------------------------- preserve hand work
// Load whatever is already on disk and keep the fields a human is likely to
// have authored. A generator that silently overwrites hand-written content is
// a trap: the first time someone tunes a market or wires a real site event,
// the next regen would erase it with no diff anyone reads.
// ONLY hand-authorable fields. `tier`, `band`, `culture`, `faiths`, `coord`
// and `lore` are DERIVED — preserving them would freeze stale values and make
// the generator unable to correct itself (an earlier version pinned the old
// tier and silently defeated a threshold fix).
const PRESERVE = ["sites", "entryEvent", "exits", "mentor", "specialty", "market", "shrine"];
const existing = new Map();
try {
  for (const fn of readdirSync(join(ROOT, "content/tables/cities"))) {
    if (!fn.endsWith(".json")) continue;
    const doc = JSON.parse(readFileSync(join(ROOT, "content/tables/cities", fn), "utf8"));
    for (const r of doc.records ?? []) existing.set(r.id, r);
  }
} catch { /* first run: nothing to preserve */ }

// A field counts as hand-authored when it differs from what we would generate.
// Stub ids (ev-<id>-a/b/c) are ours, so they are safe to replace.
// Match the EXACT strings this generator emits — not prefixes. An earlier
// version treated any "npc-*" as a stub and so clobbered npc-lop-guide, which
// the route table referenced via `unlock`. Broad prefix matching in a
// preservation check silently eats hand-authored ids.
const isStub = (id, v) =>
  typeof v === "string" &&
  (v === `ev-${id}-entry` || v === `ev-${id}-a` || v === `ev-${id}-b` || v === `ev-${id}-c` ||
   v === `npc-${id}-mentor` || v === `sp-${id}`);

// --------------------------------------------------------------- emit
const out = {};
let preservedCount = 0;
for (const n of nodes) {
  const rec = {
    id: n.id,
    name: `city.${n.id}.name`,
    band: n.band,
    culture: CULTURE[n.band],
    faiths: FAITHS[n.band],
    coord: [Number(n.lon.toFixed(3)), Number(n.lat.toFixed(3))],
    tier: n.tier,
    entryEvent: `ev-${n.id}-entry`,
    sites: n.tier === "metropolis"
      ? [`ev-${n.id}-a`, `ev-${n.id}-b`, `ev-${n.id}-c`]
      : [],
    exits: [],
    lore: n.lore
      ? { placeId: n.lore.id, origin: "source", ref: { book: "marco-polo", chapterId: n.lore.source?.chapterId ?? "unknown" } }
      : { origin: "authored" },
  };
  if (n.tier !== "station")
    rec.market = { goods: [], currency: CURRENCY[n.band], spread: n.tier === "metropolis" ? 0.18 : 0.22 };
  if (n.tier === "metropolis" || n.tier === "city")
    rec.shrine = { faith: FAITHS[n.band][0], services: ["bless"] };
  if (n.tier === "metropolis") {
    rec.mentor = `npc-${n.id}-mentor`;
    rec.specialty = `sp-${n.id}`;
  }
  rec.calendars = CALENDARS[n.band];

  const prev = existing.get(n.id);
  if (prev) {
    for (const k of PRESERVE) {
      if (prev[k] === undefined) continue;
      // Arrays of stub ids are ours; anything else was authored by hand.
      if (Array.isArray(prev[k])) {
        if (prev[k].length && !prev[k].every((v) => isStub(n.id, v))) { rec[k] = prev[k]; preservedCount++; }
      } else if (typeof prev[k] === "object") {
        // Keep an authored market/shrine (e.g. a filled goods list).
        if (JSON.stringify(prev[k]) !== JSON.stringify(rec[k])) { rec[k] = prev[k]; preservedCount++; }
      } else if (!isStub(n.id, prev[k]) && prev[k] !== rec[k]) {
        rec[k] = prev[k];
        preservedCount++;
      }
    }
  }
  (out[n.band] ??= []).push(rec);
}

const dry = process.argv.includes("--dry");
const dir = join(ROOT, "content/tables/cities");
if (!dry) mkdirSync(dir, { recursive: true });

let total = 0;
const tierCount = {};
for (const [band, records] of Object.entries(out)) {
  records.sort((a, b) => a.id.localeCompare(b.id));
  total += records.length;
  for (const r of records) tierCount[r.tier] = (tierCount[r.tier] ?? 0) + 1;
  if (!dry)
    writeFileSync(join(dir, `${band}.json`),
      JSON.stringify({ contentVersion: 1, table: "cities", records }, null, 2) + "\n");
}
if (preservedCount) console.log(`  preserved ${preservedCount} hand-authored field(s)`);
console.log(`${dry ? "[dry] " : ""}${total} city nodes across ${Object.keys(out).length} bands`);
for (const [b, r] of Object.entries(out)) console.log(`  ${b.padEnd(15)} ${r.length}`);
console.log("  " + Object.entries(tierCount).map(([t, n]) => `${t}:${n}`).join("  "));
