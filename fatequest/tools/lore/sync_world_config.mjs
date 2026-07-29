#!/usr/bin/env node
/** Copies the map data the RUNTIME needs from worldmap/data/ into content/world/.
 *
 *  worldmap/data carries a .gdignore (its cities.csv would otherwise be imported
 *  as a Godot translation file), and .gdignore'd files are excluded from
 *  EXPORTED builds — so reading them from there works in the editor and then
 *  silently fails in a shipped game. Run after any worldmap regen. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const src = join(ROOT, "worldmap/data/world_config.json");
const dstDir = join(ROOT, "content/world");
mkdirSync(dstDir, { recursive: true });
const cfg = JSON.parse(readFileSync(src, "utf8"));
writeFileSync(join(dstDir, "world_config.json"), JSON.stringify(cfg, null, 1) + "\n");
console.log(`synced bbox ${JSON.stringify(cfg.bbox)} -> content/world/world_config.json`);

// Mountain spines drive the side-elevation relief on the map (GDD §5.3).
// Only the fields the renderer reads are kept, so the runtime file stays small.
const mt = JSON.parse(readFileSync(join(ROOT, "worldmap/data/mountains.geojson"), "utf8"));
const ranges = mt.features.map((f) => ({
  name: f.properties.name_medieval,
  peak_m: f.properties.peak_m ?? 1000,
  points: f.geometry.type === "LineString" ? f.geometry.coordinates : [f.geometry.coordinates],
}));
writeFileSync(join(dstDir, "mountains.json"),
  JSON.stringify({ contentVersion: 1, ranges }, null, 1) + "\n");
console.log(`synced ${ranges.length} mountain ranges -> content/world/mountains.json`);

// Runtime vector underlay sourced from fatequest-worldmap. Keep only geometry
// and reader-facing names, and lightly decimate Natural Earth coastlines so a
// 2D redraw does not push tens of thousands of points every frame.
const sampleLine = (line, stride = 1) => {
  if (stride <= 1 || line.length <= 3) return line;
  const out = line.filter((_, i) => i % stride === 0);
  const last = line[line.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
};
const geometryLines = (feature, stride = 1) => {
  const g = feature.geometry ?? {};
  if (g.type === "LineString") return [sampleLine(g.coordinates, stride)];
  if (g.type === "MultiLineString") return g.coordinates.map((x) => sampleLine(x, stride));
  return [];
};
const coast = JSON.parse(readFileSync(join(ROOT, "worldmap/data/coastline.geojson"), "utf8"));
const rivers = JSON.parse(readFileSync(join(ROOT, "worldmap/data/rivers.geojson"), "utf8"));
const seas = JSON.parse(readFileSync(join(ROOT, "worldmap/data/seas.geojson"), "utf8"));
const vectors = {
  contentVersion: 1,
  source: "fatequest-worldmap",
  coastlines: coast.features.flatMap((f) => geometryLines(f, 4)),
  rivers: rivers.features.map((f) => ({
    name: f.properties?.name_medieval ?? "",
    lines: geometryLines(f),
  })),
  seas: seas.features.map((f) => ({
    name: f.properties?.name_medieval ?? "",
    coord: f.geometry?.coordinates ?? [0, 0],
  })),
};
writeFileSync(join(dstDir, "vector_map.json"), JSON.stringify(vectors) + "\n");
console.log(`synced ${vectors.coastlines.length} coastlines, ${vectors.rivers.length} rivers, ${vectors.seas.length} seas -> content/world/vector_map.json`);
