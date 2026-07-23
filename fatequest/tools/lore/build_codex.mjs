#!/usr/bin/env node
/**
 * Fills in codex and sticker text for entries the events award but nothing
 * names (docs/GDD.md §13).
 *
 * 83 codex ids are granted by events; 7 had text. The rest are mostly
 * `cx-<city>`, and a city's codex entry should say what the traveller learned
 * there — which the corpus already records. So the body is lifted from the
 * lore chapter's opening rather than invented, and marked as such.
 *
 * Entries with no lore behind them get a name only, never a fabricated body:
 * an empty codex line is honest, a made-up one is not (GDD §19).
 *
 *   node tools/lore/build_codex.mjs [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const dry = process.argv.includes("--dry");

const en = JSON.parse(readFileSync(join(ROOT, "content/i18n/en.json"), "utf8"));
const zh = JSON.parse(readFileSync(join(ROOT, "content/i18n/zh.json"), "utf8"));

const cities = [];
for (const f of readdirSync(join(ROOT, "content/tables/cities"))) {
  if (f.endsWith(".json")) cities.push(...JSON.parse(readFileSync(join(ROOT, "content/tables/cities", f), "utf8")).records);
}
const cityById = new Map(cities.map((c) => [c.id, c]));

const lore = JSON.parse(readFileSync(join(ROOT, "assets/books/marco-polo-lore.json"), "utf8"));
const loreById = new Map(lore.places.map((p) => [p.id, p]));

// Which ids do events actually grant? Only those need text.
const codex = new Set(), stickers = new Set();
for (const f of readdirSync(join(ROOT, "content/tables/events"))) {
  if (!f.endsWith(".json")) continue;
  for (const r of JSON.parse(readFileSync(join(ROOT, "content/tables/events", f), "utf8")).records) {
    for (const c of r.choices ?? []) {
      for (const e of [...(c.effects ?? []), ...(c.pass?.effects ?? []), ...(c.fail?.effects ?? [])]) {
        if (e.op === "codex") codex.add(String(e.value));
        if (e.op === "sticker") stickers.add(String(e.value));
      }
    }
  }
}

/** First two sentences of the chapter — enough to say what was learned. */
function opening(text, max = 300) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  const cut = clean.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return (stop > 80 ? cut.slice(0, stop + 1) : cut).trim();
}

let addedEn = 0, addedZh = 0, bodies = 0, nameOnly = 0;

for (const id of [...codex].sort()) {
  const nameKey = `codex.${id}.name`;
  const bodyKey = `codex.${id}.body`;
  if (en[nameKey] !== undefined) continue;

  const cityId = id.replace(/^cx-/, "");
  const city = cityById.get(cityId);

  if (city) {
    const cityNameEn = en[city.name] ?? cityId;
    const cityNameZh = zh[city.name];
    en[nameKey] = cityNameEn;
    if (cityNameZh) { zh[nameKey] = cityNameZh; addedZh++; }
    addedEn++;

    const place = city.lore?.placeId ? loreById.get(city.lore.placeId) : null;
    if (place?.body) {
      en[bodyKey] = opening(place.body);
      bodies++;
    } else {
      nameOnly++;
    }
  } else {
    // Not a city: a concept, a marvel, a custom. Name it from the id rather
    // than invent a description for something with no source behind it.
    en[nameKey] = cityId.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    addedEn++;
    nameOnly++;
  }
}

for (const id of [...stickers].sort()) {
  const k = `sticker.${id}.name`;
  if (en[k] !== undefined) continue;
  en[k] = id.replace(/^st-/, "").replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  addedEn++;
}

if (!dry) {
  for (const [file, obj] of [["en.json", en], ["zh.json", zh]]) {
    const p = join(ROOT, "content/i18n", file);
    const sorted = Object.fromEntries(Object.keys(obj).sort().map((k) => [k, obj[k]]));
    writeFileSync(p, JSON.stringify(sorted, null, 2) + "\n");
  }
}

console.log(`${dry ? "[dry] " : ""}codex ${codex.size} · stickers ${stickers.size}`);
console.log(`  en +${addedEn}  zh +${addedZh}`);
console.log(`  bodies from lore: ${bodies}   name only (no source): ${nameOnly}`);
