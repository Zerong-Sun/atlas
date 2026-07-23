#!/usr/bin/env node
/**
 * Generates content/tables/goods.json — 60 tradeable goods (GDD §9.1).
 *
 * The commodity LIST is curated (these are the wares Polo and his contemporaries
 * actually name), but the PRICE BANDS are computed from one rule so the economy
 * stays internally consistent:
 *
 *   base   local purchase        100-200
 *   far    ordinary distant sale 200-300
 *   hot    high-demand region    800-1000
 *
 * Hand-tuning 60 x 3 price bands produces an economy nobody can reason about;
 * deriving them from tier + bulk keeps the arbitrage curve inspectable, which
 * is what gate G6 (docs/ARCHITECTURE.md §9) will need to check.
 *
 * Usage: node tools/lore/build_goods.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// [id, band, bulk, tier, wantedByBands]
const GOODS = [
  // --- Mediterranean / Latin West -----------------------------------------
  ["murano-glass",    "europe", 2, "specialty", ["china", "india"]],
  ["woolen-cloth",    "europe", 2, "regional",  ["central_asia", "steppe"]],
  ["olive-oil",       "europe", 2, "regional",  ["west_asia"]],
  ["coral",           "europe", 1, "regional",  ["india", "china"]],
  ["silverware",      "europe", 1, "regional",  ["steppe", "west_asia"]],
  // --- West Asia ------------------------------------------------------------
  ["frankincense",    "west_asia", 1, "regional",  ["china", "europe"]],
  ["myrrh",           "west_asia", 1, "regional",  ["china", "europe"]],
  ["damascus-steel",  "west_asia", 2, "specialty", ["china", "steppe"]],
  ["baghdad-brocade", "west_asia", 1, "specialty", ["europe", "china"]],
  ["persian-carpet",  "west_asia", 3, "regional",  ["china", "europe"]],
  ["rosewater",       "west_asia", 1, "regional",  ["india", "china"]],
  ["dates",           "west_asia", 2, "regional",  ["central_asia"]],
  ["arabian-horse",   "west_asia", 4, "regional",  ["india", "china"]],
  ["glass-lamps",     "west_asia", 2, "regional",  ["india"]],
  ["paper",           "west_asia", 1, "regional",  ["europe"]],
  ["tabriz-pearls",   "west_asia", 1, "specialty", ["europe", "china"]],
  // --- Central Asia ---------------------------------------------------------
  ["jade",            "central_asia", 1, "specialty", ["china"]],
  ["camel-felt",      "central_asia", 3, "regional",  ["west_asia", "china"]],
  ["lapis",           "central_asia", 1, "specialty", ["europe", "china"]],
  ["balas-ruby",      "central_asia", 1, "specialty", ["europe", "china"]],
  ["furs",            "central_asia", 3, "regional",  ["china", "india"]],
  ["salt",            "central_asia", 2, "regional",  ["india", "china"]],
  ["melons",          "central_asia", 2, "regional",  ["china"]],
  ["turquoise",       "central_asia", 1, "regional",  ["europe", "india"]],
  ["asbestos-cloth",  "central_asia", 1, "specialty", ["europe"]],
  ["cotton-cloth",    "central_asia", 2, "regional",  ["steppe", "china"]],
  // --- Steppe ---------------------------------------------------------------
  ["steppe-horse",    "steppe", 4, "regional",  ["china", "india", "west_asia"]],
  ["camlet",          "steppe", 2, "specialty", ["europe", "west_asia"]],
  ["sable",           "steppe", 2, "regional",  ["china", "europe"]],
  ["koumiss",         "steppe", 3, "regional",  ["central_asia"]],
  ["hunting-falcon",  "steppe", 1, "specialty", ["west_asia", "europe"]],
  ["leather",         "steppe", 2, "regional",  ["china", "west_asia"]],
  // --- China ----------------------------------------------------------------
  ["silk",            "china", 1, "regional",  ["europe", "west_asia", "india"]],
  ["porcelain",       "china", 2, "regional",  ["west_asia", "india", "europe"]],
  ["dehua-porcelain", "china", 2, "specialty", ["europe", "west_asia"]],
  ["tea",             "china", 2, "regional",  ["steppe", "central_asia"]],
  ["lacquerware",     "china", 2, "regional",  ["west_asia", "europe"]],
  ["rhubarb",         "china", 1, "regional",  ["west_asia", "europe"]],
  ["ginger",          "china", 1, "regional",  ["europe", "west_asia"]],
  ["cinnabar",        "china", 1, "regional",  ["india", "west_asia"]],
  ["paper-money",     "china", 1, "specialty", []],
  ["hangzhou-fan",    "china", 1, "specialty", ["europe", "west_asia"]],
  ["sugar",           "china", 2, "regional",  ["central_asia", "steppe"]],
  ["musk",            "china", 1, "regional",  ["west_asia", "europe"]],
  // --- India ----------------------------------------------------------------
  ["pepper",          "india", 2, "regional",  ["europe", "china", "west_asia"]],
  ["indigo",          "india", 2, "regional",  ["europe", "west_asia"]],
  ["diamonds",        "india", 1, "specialty", ["europe", "china"]],
  ["muslin",          "india", 1, "regional",  ["west_asia", "europe"]],
  ["pearls",          "india", 1, "regional",  ["china", "europe"]],
  ["sandalwood",      "india", 2, "regional",  ["china", "west_asia"]],
  ["turmeric",        "india", 1, "regional",  ["west_asia"]],
  ["brazilwood",      "india", 2, "regional",  ["europe", "china"]],
  // --- Maritime Asia --------------------------------------------------------
  ["cloves",          "maritime_asia", 1, "specialty", ["europe", "west_asia", "china"]],
  ["nutmeg",          "maritime_asia", 1, "specialty", ["europe", "west_asia"]],
  ["aloeswood",       "maritime_asia", 1, "regional",  ["china", "west_asia"]],
  ["camphor",         "maritime_asia", 1, "regional",  ["china", "india"]],
  ["tin",             "maritime_asia", 3, "regional",  ["china", "india"]],
  ["tortoiseshell",   "maritime_asia", 1, "regional",  ["china", "europe"]],
  ["ebony",           "maritime_asia", 3, "regional",  ["china", "europe"]],
  ["birds-nest",      "maritime_asia", 1, "specialty", ["china"]],
];

// Prices in fen (1/100 coin) — the kernel keeps money in integers only.
const F = 100;
function bands(tier, bulk) {
  const lux = tier === "specialty" ? 1.35 : 1.0;
  const heavy = 1 + (bulk - 1) * 0.08;      // bulky goods cost more per slot
  const base = [Math.round(100 * lux * heavy * F), Math.round(200 * lux * heavy * F)];
  const far  = [Math.round(200 * lux * heavy * F), Math.round(300 * lux * heavy * F)];
  const hot  = [Math.round(800 * lux * heavy * F), Math.round(1000 * lux * heavy * F)];
  return { base, far, hot };
}

const SPOIL = new Set(["dates", "melons", "koumiss", "tea", "sugar", "rosewater", "birds-nest"]);
const GUARDED = new Set(["diamonds", "pearls", "balas-ruby", "lapis", "jade", "tabriz-pearls",
                         "silverware", "musk", "turquoise", "coral"]);

const records = GOODS.map(([id, band, bulk, tier, wanted]) => {
  const b = bands(tier, bulk);
  const rec = {
    id,
    name: `good.${id}.name`,
    tier,
    origin: [band],
    base: b.base,
    far: b.far,
    hot: { bands: wanted, range: b.hot },
    bulk,
    risk: {
      spoil: SPOIL.has(id) ? 0.08 : 0,
      theft: GUARDED.has(id) ? 0.07 : 0.02,
      seizure: tier === "specialty" ? 0.04 : 0.02,
    },
    needs: [],
    events: [],
  };
  if (SPOIL.has(id)) rec.needs.push("cool");
  if (GUARDED.has(id)) rec.needs.push("guarded");
  return rec;
});

writeFileSync(join(ROOT, "content/tables/goods.json"),
  JSON.stringify({ contentVersion: 1, table: "goods", records }, null, 2) + "\n");

const byBand = {};
for (const [, band] of GOODS) byBand[band] = (byBand[band] ?? 0) + 1;
console.log(`${records.length} goods`);
console.log("  " + Object.entries(byBand).map(([b, n]) => `${b}:${n}`).join("  "));
console.log(`  specialty: ${records.filter((r) => r.tier === "specialty").length}`);

// Wire each city's market to the goods of its own band, plus its specialty.
let wired = 0;
for (const b of ["west_asia", "central_asia", "steppe", "china", "india", "maritime_asia", "europe"]) {
  const p = join(ROOT, `content/tables/cities/${b}.json`);
  if (!existsSync(p)) continue;
  const doc = JSON.parse(readFileSync(p, "utf8"));
  for (const c of doc.records) {
    if (!c.market) continue;
    const local = records.filter((g) => g.origin.includes(c.band)).map((g) => g.id);
    if (local.length) { c.market.goods = local; wired++; }
    // A metropolis specialty must be a real good, not the sp-<id> placeholder.
    if (c.specialty && String(c.specialty).startsWith("sp-")) {
      const own = records.find((g) => g.tier === "specialty" && g.origin.includes(c.band));
      if (own) c.specialty = own.id;
    }
  }
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
}
console.log(`  wired ${wired} city markets`);
