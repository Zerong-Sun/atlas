import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { SEEDS_DIR } from "./paths.mjs";

const SEED_FILES = ["iching.json", "bazi.json", "tarot.json", "western.json", "dream.json"];

export function loadSeedFiles() {
  const files = [];
  for (const name of SEED_FILES) {
    const path = join(SEEDS_DIR, name);
    const raw = JSON.parse(readFileSync(path, "utf8"));
    files.push({ name, path, data: raw });
  }
  return files;
}

export function loadAllChunks() {
  const combinedPath = join(SEEDS_DIR, "all-chunks.json");
  try {
    const combined = JSON.parse(readFileSync(combinedPath, "utf8"));
    if (combined.chunks?.length) return combined.chunks;
  } catch {
    /* fall through */
  }

  const chunks = [];
  for (const { data } of loadSeedFiles()) {
    chunks.push(...(data.chunks ?? []));
  }
  return chunks;
}

export function loadAllConcepts() {
  const concepts = [];
  for (const { data } of loadSeedFiles()) {
    concepts.push(...(data.concepts ?? []));
  }
  return concepts;
}

export function listSeedJsonFiles() {
  return readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".json"));
}
