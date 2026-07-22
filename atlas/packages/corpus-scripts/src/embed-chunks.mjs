#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { OUTPUT_DIR } from "./lib/paths.mjs";
import { loadAllChunks } from "./lib/load-seeds.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const dims = 1536;

function escapeSql(str) {
  return `'${String(str).replace(/'/g, "''")}'`;
}

function hashToVector(seed, dimensions = dims) {
  const values = [];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < dimensions; i += 1) {
    h = Math.imul(h ^ i, 2246822519);
    values.push(((h >>> 0) % 2000) / 1000 - 1);
  }
  const norm = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0)) || 1;
  return values.map((v) => v / norm);
}

async function fetchEmbedding(text) {
  const key = process.env.OPENAI_API_KEY ?? process.env.LLM_API_KEY;
  const base = (process.env.OPENAI_BASE_URL ?? process.env.LLM_API_BASE_URL ?? "https://api.openai.com/v1").replace(
    /\/$/,
    ""
  );
  const model = process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
  if (!key) return null;

  const res = await fetch(`${base}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, input: text.slice(0, 2000) }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0]?.embedding ?? null;
}

function vectorSql(values) {
  return `'[${values.map((v) => Number(v).toFixed(8)).join(",")}]'::vector`;
}

const chunks = loadAllChunks();
if (chunks.length === 0) {
  console.error("No chunks found. Run corpus:generate first.");
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

const lines = [
  "-- Atlas corpus embedding updates (generated)",
  `-- chunks: ${chunks.length}`,
  `-- mode: ${dryRun ? "dry-run (deterministic hash vectors)" : "api"}`,
  "BEGIN;",
];

let embedded = 0;
for (const chunk of chunks) {
  const text = [chunk.translation_zh, chunk.original_text, ...(chunk.keywords ?? [])].filter(Boolean).join(" ");
  let vector;
  if (dryRun || !(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY)) {
    vector = hashToVector(`${chunk.id}:${text.slice(0, 120)}`);
  } else {
    vector = await fetchEmbedding(text);
    if (!vector) vector = hashToVector(`${chunk.id}:${text.slice(0, 120)}`);
  }
  if (vector.length !== dims) {
    console.error(`Invalid embedding dimension for ${chunk.id}: ${vector.length}`);
    process.exit(1);
  }
  lines.push(
    `UPDATE source_chunks SET embedding = ${vectorSql(vector)} WHERE id = ${escapeSql(chunk.id)}::uuid;`
  );
  embedded += 1;
}

lines.push("COMMIT;");

const sqlPath = join(OUTPUT_DIR, "embed.sql");
if (dryRun) {
  console.log("[dry-run] SQL would write to:", sqlPath);
  console.log("Chunks:", embedded, "Dimensions:", dims);
} else {
  writeFileSync(sqlPath, lines.join("\n") + "\n", "utf8");
  console.log("[write]", sqlPath, "updates:", embedded);
}
