#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { OUTPUT_DIR } from "./lib/paths.mjs";
import { loadManifest } from "./lib/parse-manifest.mjs";
import { loadAllChunks } from "./lib/load-seeds.mjs";
import { runQualityChecks } from "./lib/quality-checks.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const format = args.includes("--json") ? "json" : "sql";
const corpusVersion = process.env.CORPUS_VERSION || "corpus_v0_1";

function escapeSql(str) {
  if (str == null) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function chunkToSql(chunk) {
  const keywords = `ARRAY[${chunk.keywords.map((k) => escapeSql(k)).join(",")}]::text[]`;
  return `INSERT INTO source_chunks (
  id, source_id, chapter, section, original_text, translation_zh, annotation_zh,
  keywords, tradition, corpus_version, review_status
) VALUES (
  ${escapeSql(chunk.id)}::uuid,
  ${escapeSql(chunk.source_id)},
  ${escapeSql(chunk.chapter)},
  ${escapeSql(chunk.section)},
  ${escapeSql(chunk.original_text || null)},
  ${escapeSql(chunk.translation_zh)},
  ${escapeSql(chunk.annotation_zh)},
  ${keywords},
  ${escapeSql(chunk.tradition)},
  ${escapeSql(corpusVersion)},
  ${escapeSql(chunk.review_status || "ai_reviewed")}
) ON CONFLICT (id) DO UPDATE SET
  translation_zh = EXCLUDED.translation_zh,
  annotation_zh = EXCLUDED.annotation_zh,
  keywords = EXCLUDED.keywords,
  review_status = EXCLUDED.review_status;`;
}

function sourceToSql(src) {
  return `INSERT INTO sources (
  id, title, tradition, source_type, license_note, source_url, verbatim_allowed, corpus_version
) VALUES (
  ${escapeSql(src.id)},
  ${escapeSql(src.title)},
  ${escapeSql(src.tradition)},
  ${escapeSql(src.source_type)},
  ${escapeSql(src.license_note)},
  ${escapeSql(src.source_url || null)},
  ${src.verbatim_allowed !== false},
  ${escapeSql(corpusVersion)}
) ON CONFLICT (id) DO UPDATE SET
  license_note = EXCLUDED.license_note,
  corpus_version = EXCLUDED.corpus_version;`;
}

function releaseSql() {
  return `INSERT INTO corpus_releases (version, chunk_count, notes)
VALUES (${escapeSql(corpusVersion)}, ${chunks.length}, ${escapeSql("MVP corpus_v0_1 seed import")})
ON CONFLICT (version) DO UPDATE SET chunk_count = EXCLUDED.chunk_count, published_at = now();`;
}

const manifest = loadManifest();
const chunks = loadAllChunks();
const check = runQualityChecks({ manifest, chunks });

if (!check.ok) {
  console.error("Quality checks failed; fix seeds before ingest.");
  for (const e of check.errors) console.error("  -", e);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

if (format === "json") {
  const payload = {
    corpus_version: corpusVersion,
    dry_run: dryRun,
    sources: manifest.sources.map((s) => ({
      ...s,
      corpus_version: corpusVersion,
      verbatim_allowed: s.verbatim_allowed !== "false",
    })),
    chunks: chunks.map((c) => ({
      ...c,
      corpus_version: corpusVersion,
    })),
    stats: check.stats,
  };
  const outPath = join(OUTPUT_DIR, "ingest-payload.json");
  if (!dryRun) {
    writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  }
  console.log(dryRun ? "[dry-run]" : "[write]", "JSON payload:", outPath);
  console.log("Sources:", payload.sources.length, "Chunks:", payload.chunks.length);
  process.exit(0);
}

const lines = [
  "-- Atlas corpus ingest (generated)",
  `-- corpus_version: ${corpusVersion}`,
  `-- chunks: ${chunks.length}`,
  `BEGIN;`,
  releaseSql(),
  ...manifest.sources.map(sourceToSql),
  ...chunks.map(chunkToSql),
  `COMMIT;`,
];

const sqlPath = join(OUTPUT_DIR, "ingest.sql");
if (dryRun) {
  console.log("[dry-run] SQL would write to:", sqlPath);
  console.log("Sources:", manifest.sources.length);
  console.log("Chunks:", chunks.length);
  console.log("Sample chunk SQL (first):");
  console.log(chunkToSql(chunks[0]).slice(0, 200) + "...");
} else {
  writeFileSync(sqlPath, lines.join("\n\n"), "utf8");
  console.log("Wrote SQL:", sqlPath);
  console.log("Lines:", lines.length);
}

console.log("Quality:", check.stats.copyright_coverage_pct, "% copyright coverage");
