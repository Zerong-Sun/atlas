#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { SEEDS_DIR } from "./lib/paths.mjs";
import { buildIchingChunks } from "./seed-builders/iching.mjs";
import { buildYijingYaoChunks } from "./seed-builders/yijing-yao.mjs";
import { buildLiuyaoChunks } from "./seed-builders/liuyao-rules.mjs";
import { buildBaziChunks } from "./seed-builders/bazi.mjs";
import { buildBaziPillarsLuckChunks } from "./seed-builders/bazi-pillars-luck.mjs";
import { buildClassicsBaziChunks } from "./seed-builders/classics-bazi-pd.mjs";
import { buildTarotChunks } from "./seed-builders/tarot.mjs";
import { buildTarotMinorChunks } from "./seed-builders/tarot-minor.mjs";
import { buildWesternChunks } from "./seed-builders/western.mjs";
import { buildTetrabiblosChunks } from "./seed-builders/tetrabiblos-pd.mjs";
import { buildDreamChunks } from "./seed-builders/dream.mjs";
import { buildZhougongChunks } from "./seed-builders/zhougong-pd.mjs";
import { stableChunkUuid } from "./lib/stable-uuid.mjs";

const CORPUS_VERSION = "corpus_v0_1";

function withStableIds(chunks) {
  return chunks.map((c) => {
    const slug = c.slug ?? c.id;
    return { ...c, slug, id: stableChunkUuid(slug) };
  });
}

const TRADITION_FILES = [
  {
    file: "iching.json",
    tradition: "iching",
    build: () => [...buildIchingChunks(), ...buildYijingYaoChunks(), ...buildLiuyaoChunks()],
  },
  {
    file: "bazi.json",
    tradition: "bazi",
    build: () => [
      ...buildBaziChunks(),
      ...buildBaziPillarsLuckChunks(),
      ...buildClassicsBaziChunks(),
    ],
  },
  {
    file: "tarot.json",
    tradition: "tarot",
    build: () => [...buildTarotChunks(), ...buildTarotMinorChunks()],
  },
  {
    file: "western.json",
    tradition: "western",
    build: () => [...buildWesternChunks(), ...buildTetrabiblosChunks()],
  },
  {
    file: "dream.json",
    tradition: "dream",
    build: () => [...buildDreamChunks(), ...buildZhougongChunks()],
  },
];

function buildConcepts(chunks) {
  const byKey = new Map();
  for (const c of chunks) {
    const conceptSlug = `${c.tradition}-${c.slug}`;
    if (!byKey.has(conceptSlug)) {
      byKey.set(conceptSlug, {
        slug: conceptSlug,
        label_zh: `${c.chapter}·${c.section}`,
        tradition: c.tradition,
        definition_zh: c.translation_zh.slice(0, 200),
        chunk_ids: [c.id],
        related_slugs: [],
      });
    }
  }
  return [...byKey.values()];
}

mkdirSync(SEEDS_DIR, { recursive: true });

const allChunks = [];
const summary = {};

for (const { file, tradition, build } of TRADITION_FILES) {
  const chunks = withStableIds(build()).map((c) => ({
    ...c,
    corpus_version: CORPUS_VERSION,
  }));
  allChunks.push(...chunks);
  summary[tradition] = chunks.length;

  const payload = {
    corpus_version: CORPUS_VERSION,
    tradition,
    generated_at: new Date().toISOString(),
    chunk_count: chunks.length,
    chunks,
    concepts: buildConcepts(chunks),
  };

  const outPath = join(SEEDS_DIR, file);
  writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${outPath} (${chunks.length} chunks)`);
}

const combined = {
  corpus_version: CORPUS_VERSION,
  generated_at: new Date().toISOString(),
  chunk_count: allChunks.length,
  by_tradition: summary,
  chunks: allChunks,
};

writeFileSync(join(SEEDS_DIR, "all-chunks.json"), JSON.stringify(combined, null, 2), "utf8");
console.log(`\nTotal chunks: ${allChunks.length}`);
console.log("By tradition:", summary);

if (allChunks.length < 500) {
  console.error("ERROR: chunk count below MVP minimum (500)");
  process.exit(1);
}
