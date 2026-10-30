#!/usr/bin/env node
/** Run every smoke test with a fresh user:// directory and retain its log. */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const runner = join(project, "tools/test/run_isolated_godot.mjs");
const logDir = join(project, "build/test-audit/smoke");
const tests = readdirSync(join(project, "tests"))
  .filter((name) => /^smoke_.*\.gd$/.test(name)).sort();
mkdirSync(logDir, { recursive: true });

let failed = 0;
for (const name of tests) {
  const result = spawnSync(process.execPath, [runner, `tests/${name}`], {
    cwd: project,
    encoding: "utf8",
    timeout: 190_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  writeFileSync(join(logDir, `${name}.log`), output);
  const ok = result.status === 0 && !result.error;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${result.error ? ` (${result.error.message})` : ""}`);
}
console.log(`SMOKE SUITE: ${tests.length - failed}/${tests.length} passed`);
process.exitCode = failed ? 1 : 0;
