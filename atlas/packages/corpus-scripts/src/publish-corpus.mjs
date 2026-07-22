#!/usr/bin/env node
import { spawnSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { AUDIT_DIR, OUTPUT_DIR } from "./lib/paths.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const scriptsDir = __dirname;

function run(label, script, extraArgs = []) {
  console.log(`\n==> ${label}`);
  const res = spawnSync("node", [join(scriptsDir, script), ...extraArgs], {
    stdio: "inherit",
    env: process.env,
  });
  if (res.status !== 0) {
    console.error(`${label} failed with code ${res.status}`);
    process.exit(res.status ?? 1);
  }
}

const args = process.argv.slice(2);
const skipGenerate = args.includes("--skip-generate");

if (!skipGenerate) {
  run("Generate seeds", "generate-seeds.mjs");
}

run("Validate manifest & quality", "validate-manifest.mjs");
run("Ingest dry-run (SQL)", "ingest-seeds.mjs", ["--dry-run"]);
run("Ingest dry-run (JSON)", "ingest-seeds.mjs", ["--dry-run", "--json"]);

const releaseNote = {
  version: process.env.CORPUS_VERSION || "corpus_v0_1",
  published_at: new Date().toISOString(),
  workflow: "publish-corpus.mjs",
  artifacts: {
    seeds: "corpus/seeds/*.json",
    audit: "corpus/audit/copyright-coverage.json",
    ingest_sql: "corpus/.cache/ingest.sql",
    ingest_json: "corpus/.cache/ingest-payload.json",
  },
};

mkdirSync(OUTPUT_DIR, { recursive: true });
const notePath = join(OUTPUT_DIR, "release-note.json");
writeFileSync(notePath, JSON.stringify(releaseNote, null, 2), "utf8");

console.log("\n==> Publish workflow complete");
console.log("Release note:", notePath);
if (existsSync(join(AUDIT_DIR, "copyright-coverage.json"))) {
  console.log("Copyright audit: corpus/audit/copyright-coverage.json");
}
