#!/usr/bin/env node
/**
 * Emits a stub entry event for every city node that lacks one, plus stub site
 * events for metropolises. Existing events are never touched.
 *
 * Stubs carry `"stub": true` and `origin: "authored"` so they are trivially
 * greppable — they are scaffolding for the reference graph, NOT shippable text.
 * A stub reaching players would violate GDD §19 (source vs. invention must be
 * distinguishable), which is why the validator counts them and prints the
 * remaining total on every run.
 *
 * Usage: node tools/lore/build_entry_events.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const CITY_DIR = join(ROOT, "content/tables/cities");
const EV_DIR = join(ROOT, "content/tables/events");

// ---------------------------------------------------------- existing events
const existing = new Set();
for (const fn of readdirSync(EV_DIR)) {
  if (!fn.endsWith(".json")) continue;
  for (const r of JSON.parse(readFileSync(join(EV_DIR, fn), "utf8")).records ?? []) existing.add(r.id);
}

// ------------------------------------------------------------------ cities
const cities = [];
for (const fn of readdirSync(CITY_DIR)) {
  if (!fn.endsWith(".json")) continue;
  cities.push(...(JSON.parse(readFileSync(join(CITY_DIR, fn), "utf8")).records ?? []));
}

const BAND_BG = {
  europe: "port-town", west_asia: "caravan-city", central_asia: "desert-town",
  steppe: "steppe-camp", china: "canal-city", india: "monsoon-port",
  maritime_asia: "spice-harbour",
};

const newEntries = [];
const newSites = [];

for (const c of cities) {
  if (c.entryEvent && !existing.has(c.entryEvent)) {
    newEntries.push({
      id: c.entryEvent,
      kind: "entry",
      stub: true,
      title: `ev.${c.id}.entry.title`,
      when: { cities: [c.id] },
      scene: { bg: BAND_BG[c.band] ?? "caravan-city", region: c.band },
      body: `ev.${c.id}.entry.body`,
      once: true,
      choices: [{
        label: `ev.${c.id}.entry.choice.enter`,
        effects: [{ op: "reveal_map", value: c.id, reason: "arrived-and-looked-about" }],
      }],
      // Stubs are `authored`, never `source` — claiming a source origin without
      // real text would put an unbacked citation in front of the player.
      lore: c.lore?.placeId
        ? { placeId: c.lore.placeId, origin: "authored" }
        : { origin: "authored" },
    });
  }
  for (const s of c.sites ?? []) {
    if (existing.has(s)) continue;
    newSites.push({
      id: s,
      kind: "site",
      stub: true,
      title: `ev.${s}.title`,
      when: { cities: [c.id] },
      scene: { bg: BAND_BG[c.band] ?? "caravan-city", region: c.band },
      body: `ev.${s}.body`,
      once: true,
      choices: [{
        label: `ev.${s}.choice.look`,
        effects: [{ op: "codex", value: `cx-${c.id}`, reason: "recorded-what-was-seen" }],
      }],
      lore: { origin: "authored" },
    });
  }
}

function append(file, records) {
  const p = join(EV_DIR, file);
  const doc = existsSync(p)
    ? JSON.parse(readFileSync(p, "utf8"))
    : { contentVersion: 1, table: "events", records: [] };
  doc.records.push(...records);
  doc.records.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
}

if (newEntries.length) append("entry.json", newEntries);
if (newSites.length) append("site.json", newSites);

console.log(`+${newEntries.length} entry stubs, +${newSites.length} site stubs`);
console.log(`  (${existing.size} events already existed and were left alone)`);
