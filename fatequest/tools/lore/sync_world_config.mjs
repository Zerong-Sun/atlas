#!/usr/bin/env node
/** Copies worldmap/data/world_config.json -> content/world/ so the runtime can
 *  read the bbox from an exportable location. Run after any worldmap regen. */
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
