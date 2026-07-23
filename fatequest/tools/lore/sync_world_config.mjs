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
