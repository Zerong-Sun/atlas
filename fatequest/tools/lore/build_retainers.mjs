#!/usr/bin/env node
/**
 * Generates content/tables/retainers.json.
 *
 * Two populations:
 *   1. MENTORS — one per metropolis. The city table already points at
 *      npc-<city>-mentor, so these must exist or G2 breaks. Their teaching
 *      subject follows the band (GDD §6: every city has a local mentor).
 *   2. HIREABLE — the M5 starter set: guide, interpreter, porter (GDD §16.6),
 *      seeded across the trunk so a player always has someone reachable.
 *
 * Ability/trait/fate numbers are on the 0-31 scale (GDD) and are derived from
 * role + band rather than hand-rolled, so the spread stays comparable across
 * the roster. Real personalities come from the text pass, not from the numbers
 * — see docs/STORY_REQUIREMENTS.md §7.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

const cities = [];
for (const b of ["west_asia", "central_asia", "steppe", "china", "india", "maritime_asia", "europe"]) {
  const p = join(ROOT, `content/tables/cities/${b}.json`);
  if (existsSync(p)) cities.push(...JSON.parse(readFileSync(p, "utf8")).records);
}

const BAND_LANG = {
  west_asia: ["arabic", "persian"], central_asia: ["persian", "turkic"],
  steppe: ["turkic", "mongol"], china: ["chinese", "mongol"],
  india: ["tamil", "persian"], maritime_asia: ["malay", "arabic"],
  europe: ["latin", "greek"],
};
const BAND_FAITH = {
  west_asia: "islam", central_asia: "islam", steppe: "folk",
  china: "buddhism", india: "hindu", maritime_asia: "islam", europe: "latin",
};
// What the local mentor teaches — GDD §6: divination, language, etiquette,
// medicine, navigation or trade, depending on where you are.
const BAND_TEACHES = {
  west_asia: "etiquette", central_asia: "travel", steppe: "travel",
  china: "divination", india: "medicine", maritime_asia: "navigation",
  europe: "trade",
};

const zero = { travel: 8, guard: 6, trade: 8, language: 8, medicine: 4, cartography: 4, faith: 6, divination: 2, cargo: 0 };
const ROLE_ABILITY = {
  diviner:     { divination: 26, faith: 20, language: 14 },
  guide:       { travel: 24, cartography: 16, guard: 10 },
  interpreter: { language: 26, trade: 14 },
  porter:      { cargo: 12, travel: 14, guard: 8 },
  physician:   { medicine: 24, faith: 12 },
  sailor:      { travel: 20, cargo: 8, guard: 10 },
  agent:       { trade: 24, language: 16 },
};
const ROLE_CARGO = {
  porter: { kind: "land", slots: 4, condition: "land_only" },
  sailor: { kind: "sea", slots: 6, condition: "sea_only" },
  agent:  { kind: "valuables", slots: 2, condition: "always" },
};

const records = [];
const seen = new Set();

function make(id, city, roles, opts = {}) {
  if (seen.has(id)) return;
  seen.add(id);
  const band = city.band;
  const ab = { ...zero };
  for (const r of roles) Object.assign(ab, ROLE_ABILITY[r] ?? {});
  const seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const jitter = (n, spread) => Math.max(0, Math.min(31, n + ((seed % (spread * 2 + 1)) - spread)));

  const rec = {
    id,
    name: `npc.${id}.name`,
    roles,
    origin: { city: city.id, culture: city.culture, faith: BAND_FAITH[band] ?? "folk" },
    languages: BAND_LANG[band] ?? ["persian"],
    recruitAt: [{ cityId: city.id, venue: opts.venue ?? "market" }],
    hireMode: opts.hireMode ?? ["open", "divined"],
    wage: { amount: opts.wage ?? 300, currency: "dirham", period: "month" },
    contract: { months: 12, renewable: true },
    abilities: Object.fromEntries(Object.entries(ab).map(([k, v]) => [k, jitter(v, 3)])),
    traits: {
      loyalty: jitter(18, 8), courage: jitter(15, 8), greed: jitter(12, 8),
      curiosity: jitter(17, 8), piety: jitter(14, 8), ambition: jitter(13, 8),
      adaptability: jitter(16, 8), honesty: jitter(19, 8),
    },
    fate: { company: jitter(17, 9), road: jitter(16, 9), success: jitter(16, 9) },
    // Birth is sealed by default: GDD §11.4 makes revealing it a reward, not a
    // stat you read off a card. sealLevel 0 = fully known.
    birth: { internalDate: null, sealLevel: opts.seal ?? 2 },
    sealReason: opts.sealReason ?? "calendar",
    revealPaths: ["divination", "hometown", "trust", "learn_calendar"],
    yearly: [],
    leaveIf: { loyaltyBelow: 8 },
    relations: [],
    omen: `npc.${id}.omen`,
  };
  for (const r of roles) if (ROLE_CARGO[r]) rec.cargo = ROLE_CARGO[r];
  if (opts.teaches) rec.teaches = opts.teaches;
  records.push(rec);
}

// 1. mentors — every metropolis names one, so it must exist
for (const c of cities) {
  if (!c.mentor) continue;
  const teaches = BAND_TEACHES[c.band] ?? "travel";
  const roles = teaches === "divination" ? ["diviner"] : teaches === "medicine" ? ["physician"] : ["guide", "interpreter"];
  make(c.mentor, c, roles, { venue: "mentor", hireMode: ["open"], wage: 500, teaches, seal: 1 });
}

// 2. hireable starter set along the trunk (GDD §16.6: guide/interpreter/porter)
const TRUNK = ["tauris", "baldacum", "ormus", "balc", "samarcanda", "cascar",
               "cotan", "lop", "sachiu", "chandu", "cambaluc", "kinsay", "zayton"];
const KIT = [["guide", 350], ["interpreter", 300], ["porter", 200]];
for (const cid of TRUNK) {
  const c = cities.find((x) => x.id === cid);
  if (!c) continue;
  for (const [role, wage] of KIT) make(`npc-${cid}-${role}`, c, [role], { wage });
}
// A couple of sea specialists so the maritime line is crewable.
for (const cid of ["ormus", "melibar", "zayton"]) {
  const c = cities.find((x) => x.id === cid);
  if (c) make(`npc-${cid}-sailor`, c, ["sailor"], { wage: 400, venue: "harbour" });
}

writeFileSync(join(ROOT, "content/tables/retainers.json"),
  JSON.stringify({ contentVersion: 1, table: "retainers", records }, null, 2) + "\n");

const byRole = {};
for (const r of records) for (const role of r.roles) byRole[role] = (byRole[role] ?? 0) + 1;
console.log(`${records.length} retainers`);
console.log("  " + Object.entries(byRole).map(([k, v]) => `${k}:${v}`).join("  "));
console.log(`  mentors: ${records.filter((r) => r.teaches).length}`);
