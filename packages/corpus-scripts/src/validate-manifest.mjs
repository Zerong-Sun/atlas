#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { AUDIT_DIR, MANIFEST_PATH } from "./lib/paths.mjs";
import { loadManifest } from "./lib/parse-manifest.mjs";
import { loadAllChunks } from "./lib/load-seeds.mjs";
import { runQualityChecks } from "./lib/quality-checks.mjs";

if (!existsSync(MANIFEST_PATH)) {
  console.error("Missing manifest:", MANIFEST_PATH);
  process.exit(1);
}

const manifest = loadManifest();
const chunks = loadAllChunks();

const { ok, errors, warnings, stats } = runQualityChecks({ manifest, chunks });

mkdirSync(AUDIT_DIR, { recursive: true });
const auditPath = join(AUDIT_DIR, "copyright-coverage.json");
writeFileSync(
  auditPath,
  JSON.stringify(
    {
      corpus_version: manifest.version,
      validated_at: new Date().toISOString(),
      passed: ok,
      stats,
      errors,
      warnings,
    },
    null,
    2,
  ),
  "utf8",
);

console.log("Manifest:", MANIFEST_PATH);
console.log("Corpus version:", manifest.version);
console.log("Sources:", manifest.sources.length);
console.log("Chunks:", stats.chunk_count);
console.log("Copyright coverage:", `${stats.copyright_coverage_pct}%`);
console.log("Audit report:", auditPath);

if (warnings.length) {
  console.warn("\nWarnings:");
  for (const w of warnings) console.warn("  -", w);
}

if (!ok) {
  console.error("\nValidation FAILED:");
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}

console.log("\nValidation PASSED");
