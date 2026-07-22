#!/usr/bin/env node
/**
 * Generates content/tables/routes.json — the connectivity graph for the 102
 * city nodes. See docs/ROADMAP.md §3.1.
 *
 * Everything is DERIVED, not hand-typed:
 *   - land vs sea      by sampling the great circle against real coastlines
 *                      (worldmap/data/land.geojson, Natural Earth)
 *   - days             great-circle distance / mode speed
 *   - cost / risk      distance, terrain and mode
 *   - hazards          band + proximity to mountain spines + sea crossing
 *
 * Hand edits to routes.json are overwritten. To change the graph, change the
 * rules here or the map data, then re-run.
 *
 * Usage: node tools/lore/build_routes.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const R_EARTH = 6371.0088;
const rad = (d) => (d * Math.PI) / 180;

// ------------------------------------------------------------------ inputs
const cities = [];
for (const b of ["west_asia", "central_asia", "steppe", "china", "india", "maritime_asia", "europe"]) {
  const p = join(ROOT, `content/tables/cities/${b}.json`);
  if (existsSync(p)) cities.push(...JSON.parse(readFileSync(p, "utf8")).records);
}
const byId = new Map(cities.map((c) => [c.id, c]));

const landFeatures = (() => {
  const p = join(ROOT, "worldmap/data/land.geojson");
  if (!existsSync(p)) {
    console.warn("! land.geojson missing — every route will be treated as land.");
    console.warn("  Run worldmap/scripts/build_real_terrain.py to fetch coastlines.");
    return [];
  }
  return JSON.parse(readFileSync(p, "utf8")).features;
})();

const mountains = (() => {
  const p = join(ROOT, "worldmap/data/mountains.geojson");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")).features : [];
})();

// ------------------------------------------------- point-in-land (ray cast)
// Rings are pre-flattened with bounding boxes so the per-point test skips
// almost every polygon. Without the bbox filter this is ~40x slower.
const rings = [];
for (const f of landFeatures) {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  if (!polys) continue;
  for (const poly of polys) {
    for (const ring of poly) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const [x, y] of ring) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      rings.push({ ring, minX, minY, maxX, maxY });
    }
  }
}

function onLand(lon, lat) {
  let inside = false;
  for (const r of rings) {
    if (lon < r.minX || lon > r.maxX || lat < r.minY || lat > r.maxY) continue;
    const pts = r.ring;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

// ------------------------------------------------------------- geometry
function haversine(a, b) {
  const [lon1, lat1] = a, [lon2, lat2] = b;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

/** Fraction of the straight path that lies over land, sampled at N points. */
function landFraction(a, b, n = 24) {
  if (rings.length === 0) return 1;
  let hits = 0;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (onLand(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) hits++;
  }
  return hits / (n - 1);
}

function nearMountain(a, b, km = 160) {
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  for (const m of mountains) {
    const g = m.geometry;
    const pts = g.type === "LineString" ? g.coordinates : [g.coordinates];
    for (const p of pts) if (haversine(mid, p) < km) return m.properties.name_medieval;
  }
  return null;
}

// --------------------------------------------------------------- rules
const SPEED = { land: 30, sea: 120 };          // km/day
const DESERT_BANDS = new Set(["central_asia"]);
const MONSOON_BANDS = new Set(["india", "maritime_asia"]);

// GDD §16.4 trunk. These edges are FORCED even if the heuristics would skip
// them — the corridor is the spine of chapter one and must always connect.
const TRUNK = ["tauris", "baldacum", "ormus", "balc", "samarcanda", "cascar",
               "cotan", "lop", "sachiu", "chandu", "cambaluc", "kinsay", "zayton"];

// GDD §16.5's maritime line is a DESIGNED route, exactly like the land trunk,
// so it gets a forced chain too. Nearest-neighbour meshing cannot produce it:
// an Indian Ocean crossing is 2000-3000 km, so it never lands in any port's
// three closest neighbours and the ocean silently fragments. This is the
// historical monsoon circuit — Hormuz down Arabia, across to Malabar and
// Coromandel, through the straits, up to Zayton.
const SEA_LANE = ["ormus", "calatu", "dufar", "esher", "aden",
                  "cambaet", "tana", "melibar", "maabar", "cail",
                  "samara", "pentam", "java-major", "chamba", "zayton"];

function classify(a, b) {
  const frac = landFraction(a.coord, b.coord);
  if (frac >= 0.75) return "land";
  if (frac <= 0.25) return "sea";
  return "coastal";   // hugs a shoreline: passable by land, faster by ship
}

function makeRoute(a, b, forced = false, lane = false) {
  const km = haversine(a.coord, b.coord);
  let kind = classify(a, b);
  // A designed sea lane is sailable by definition. The straight-line land test
  // is simply the wrong instrument for coast-hugging navigation: the great
  // circle from Calatu to Dufar cuts across Oman, and Tana to Melibar cuts
  // across India, but medieval shipping followed the shoreline round both.
  // Downgrading these to "coastal" keeps them walkable AND sailable.
  if (lane && kind === "land") kind = "coastal";
  const isSea = kind === "sea";
  const days = Math.max(1, Math.round(km / SPEED[isSea ? "sea" : "land"]));

  const modes = isSea ? ["ship"]
    : kind === "coastal" ? ["caravan", "foot", "ship"]
    : ["caravan", "camel", "foot"];

  const hazards = [];
  let risk = isSea ? 3 : 2;
  if (isSea) hazards.push("storm", "pirates");
  else {
    const range = nearMountain(a.coord, b.coord);
    if (range) { hazards.push("snow"); risk += 1; }
    if (DESERT_BANDS.has(a.band) && DESERT_BANDS.has(b.band)) { hazards.push("sand"); risk += 1; }
    hazards.push("bandits");
  }
  if (km > 1500) risk += 1;
  risk = Math.min(5, risk);

  // Monsoon: the Indian Ocean is only sailed on the right half of the year.
  const season = isSea && (MONSOON_BANDS.has(a.band) || MONSOON_BANDS.has(b.band))
    ? { open: [10, 11, 12, 1, 2, 3, 4], bonus: [11, 12, 1] }
    : hazards.includes("snow")
      ? { open: [4, 5, 6, 7, 8, 9, 10], bonus: [5, 6, 7] }
      : { open: [1,2,3,4,5,6,7,8,9,10,11,12], bonus: [] };

  return {
    id: `rt-${a.id}-${b.id}`,
    from: a.id, to: b.id, reverse: true,
    kind, trunk: forced || undefined, lane: lane || undefined,
    modes,
    days,
    distanceKm: Math.round(km),
    cost: Math.round(days * (isSea ? 45 : 30)),
    risk,
    season,
    hazards,
    encounters: [],
    lore: { origin: "authored" },
  };
}

// ------------------------------------------------------------ build graph
const routes = new Map();
const add = (a, b, forced = false, lane = false) => {
  if (!a || !b || a.id === b.id) return;
  const k = [a.id, b.id].sort().join("|");
  if (routes.has(k)) {
    const r = routes.get(k);
    if (forced) r.trunk = true;
    if (lane && !r.modes.includes("ship")) { r.lane = true; r.kind = "coastal"; r.modes = ["caravan", "foot", "ship"]; }
    return;
  }
  routes.set(k, makeRoute(a, b, forced, lane));
};

// 1. trunk chain
let trunkMissing = [];
for (let i = 0; i < TRUNK.length - 1; i++) {
  const a = byId.get(TRUNK[i]), b = byId.get(TRUNK[i + 1]);
  if (!a || !b) { trunkMissing.push(!a ? TRUNK[i] : TRUNK[i + 1]); continue; }
  add(a, b, true);
}

// 1b. forced sea lane
let seaMissing = [];
for (let i = 0; i < SEA_LANE.length - 1; i++) {
  const a = byId.get(SEA_LANE[i]), b = byId.get(SEA_LANE[i + 1]);
  if (!a || !b) { seaMissing.push(!a ? SEA_LANE[i] : SEA_LANE[i + 1]); continue; }
  add(a, b, true, true);
}

// 2. nearest-neighbour mesh, so the world is a network and not a corridor
const K = 3;
const MAX_LINK_KM = 2200;
for (const c of cities) {
  const near = cities
    .filter((o) => o.id !== c.id)
    .map((o) => ({ o, d: haversine(c.coord, o.coord) }))
    .filter((x) => x.d <= MAX_LINK_KM)
    .sort((x, y) => x.d - y.d)
    .slice(0, K);
  for (const { o } of near) add(c, o);
}

// 3. connectivity repair — attach any node the mesh left stranded
const all = [...routes.values()];
const adj = new Map(cities.map((c) => [c.id, []]));
for (const r of all) { adj.get(r.from)?.push(r.to); adj.get(r.to)?.push(r.from); }

function componentOf(start) {
  const seen = new Set([start]); const q = [start];
  while (q.length) for (const n of adj.get(q.pop()) ?? []) if (!seen.has(n)) { seen.add(n); q.push(n); }
  return seen;
}
let main = componentOf(TRUNK[0]);
let repairs = 0;
for (const c of cities) {
  if (main.has(c.id)) continue;
  // Link the orphan to the closest node already in the main component.
  let best = null, bestD = Infinity;
  for (const m of main) {
    const d = haversine(c.coord, byId.get(m).coord);
    if (d < bestD) { bestD = d; best = byId.get(m); }
  }
  if (best) {
    add(c, best);
    repairs++;
    const r = routes.get([c.id, best.id].sort().join("|"));
    adj.get(r.from).push(r.to); adj.get(r.to).push(r.from);
    main = componentOf(TRUNK[0]);
  }
}

// ----------------------------------------------------------------- emit
const list = [...routes.values()].sort((a, b) => a.id.localeCompare(b.id));

// exits are derived from the graph; never hand-maintained on the city record
const exits = new Map(cities.map((c) => [c.id, []]));
for (const r of list) { exits.get(r.from)?.push(r.id); exits.get(r.to)?.push(r.id); }

const dry = process.argv.includes("--dry");
if (!dry) {
  writeFileSync(join(ROOT, "content/tables/routes.json"),
    JSON.stringify({ contentVersion: 1, table: "routes", records: list }, null, 2) + "\n");

  for (const b of ["west_asia", "central_asia", "steppe", "china", "india", "maritime_asia", "europe"]) {
    const p = join(ROOT, `content/tables/cities/${b}.json`);
    if (!existsSync(p)) continue;
    const doc = JSON.parse(readFileSync(p, "utf8"));
    for (const c of doc.records) c.exits = (exits.get(c.id) ?? []).sort();
    writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
  }
}

const kinds = {};
for (const r of list) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1;
const isolated = cities.filter((c) => (exits.get(c.id) ?? []).length === 0);

console.log(`${dry ? "[dry] " : ""}${list.length} routes across ${cities.size ?? cities.length} cities`);
console.log(`  kinds: ${Object.entries(kinds).map(([k, v]) => `${k}:${v}`).join("  ")}`);
console.log(`  forced edges: ${list.filter((r) => r.trunk).length} (land trunk ${TRUNK.length - 1} + sea lane ${SEA_LANE.length - 1})`);
const seaGraph = list.filter((r) => r.modes.includes("ship"));
console.log(`  ship-capable edges: ${seaGraph.length}`);
if (seaMissing.length) console.log(`  ! sea lane cities not in tables: ${seaMissing.join(", ")}`);
console.log(`  connectivity repairs: ${repairs}`);
console.log(`  isolated nodes: ${isolated.length}${isolated.length ? " -> " + isolated.map((c) => c.id).join(", ") : ""}`);
if (trunkMissing.length) console.log(`  ! trunk cities not in tables: ${trunkMissing.join(", ")}`);
const days = list.map((r) => r.days).sort((a, b) => a - b);
console.log(`  days: min ${days[0]}  median ${days[days.length >> 1]}  max ${days[days.length - 1]}`);
