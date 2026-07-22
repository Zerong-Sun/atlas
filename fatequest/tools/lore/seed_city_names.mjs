#!/usr/bin/env node
/**
 * Seeds content/i18n/{zh,en}.json city names from the map's medieval/modern
 * forms and assets/data/glossary.json.
 *
 * This produces a DRAFT. Per docs/STORY_REQUIREMENTS.md §1 the Chinese names
 * must follow Polo's received Chinese renderings (Cambaluc -> 汗八里, Kinsay ->
 * 行在, Zayton -> 刺桐), which the glossary already fixes for the trunk. Names
 * not in the glossary fall back to the medieval Latin form and are listed at
 * the end as NEEDS TRANSLATION — they are not silently invented.
 *
 * Existing translations are never overwritten.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const geo = JSON.parse(readFileSync(join(ROOT, "worldmap/data/cities.geojson"), "utf8"));
const mapBySlug = new Map(geo.features.map((f) => [slug(f.properties.name_medieval), f.properties]));

// glossary.json is { meta, terms: [{id, kind, en, zh, note}] } and its place
// ids already align with our city ids (tauris, cascar, cambaluc, kinsay...).
// Match on id first; a few spellings diverge and are aliased below.
let terms = [];
try {
  terms = JSON.parse(readFileSync(join(ROOT, "assets/data/glossary.json"), "utf8")).terms ?? [];
} catch { /* optional */ }
const GLOSS_ALIAS = { ormus: "hormos", samarcanda: "samarcand", nanghin: "yangiu" };
const glossById = new Map(terms.filter((t) => t.kind === "place").map((t) => [t.id, t]));
const lookupGloss = (cityId) => glossById.get(cityId) ?? glossById.get(GLOSS_ALIAS[cityId] ?? "");

const cities = [];
for (const fn of ["west_asia", "central_asia", "steppe", "china", "india", "maritime_asia", "europe"]) {
  const p = join(ROOT, `content/tables/cities/${fn}.json`);
  if (existsSync(p)) cities.push(...JSON.parse(readFileSync(p, "utf8")).records);
}

const dir = join(ROOT, "content/i18n");
mkdirSync(dir, { recursive: true });
const read = (f) => (existsSync(join(dir, f)) ? JSON.parse(readFileSync(join(dir, f), "utf8")) : {});
const zh = read("zh.json"), en = read("en.json");

const needsTranslation = [];
let addedZh = 0, addedEn = 0;

for (const c of cities) {
  const key = c.name;                       // e.g. city.lop.name
  const props = mapBySlug.get(c.id) ?? {};
  const med = props.name_medieval ?? c.id;
  const mod = props.name_modern ?? "";

  if (!(key in en)) { en[key] = med; addedEn++; }

  if (!(key in zh)) {
    const g = lookupGloss(c.id);
    if (g?.zh) {
      zh[key] = g.zh;
    } else {
      zh[key] = med;                        // placeholder = the Latin form
      needsTranslation.push(`${c.id}\t${med}\t${mod}`);
    }
    addedZh++;
  }
}

writeFileSync(join(dir, "zh.json"), JSON.stringify(zh, null, 2) + "\n");
writeFileSync(join(dir, "en.json"), JSON.stringify(en, null, 2) + "\n");

console.log(`zh: +${addedZh}   en: +${addedEn}   (existing entries untouched)`);
console.log(`glossary hits: ${addedZh - needsTranslation.length} / ${addedZh}`);
if (needsTranslation.length) {
  const out = join(ROOT, "docs/_city_names_todo.tsv");
  writeFileSync(out, "id\tmedieval\tmodern\n" + needsTranslation.join("\n") + "\n");
  console.log(`\n${needsTranslation.length} names need a human Chinese rendering.`);
  console.log(`  -> docs/_city_names_todo.tsv`);
}
