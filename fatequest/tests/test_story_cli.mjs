#!/usr/bin/env node
/** The story checker must fail CI for stale or absent translations. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const tempRoot = mkdtempSync(join(tmpdir(), "fatequest-story-check-"));
const toolPath = join(tempRoot, "tools/lore/story.mjs");
const unitPath = join(tempRoot, "content/story/probe");
const hash = (text) => createHash("sha256")
  .update(text.replace(/\s+/g, " ").trim())
  .digest("hex")
  .slice(0, 12);

function runCheck() {
  return spawnSync(process.execPath, [toolPath, "check"], {
    cwd: tempRoot,
    encoding: "utf8",
  });
}

function expectExit(expected, label) {
  const result = runCheck();
  if (result.status !== expected) {
    throw new Error(`${label}: exit ${result.status}, expected ${expected}\n${result.stdout}${result.stderr}`);
  }
}

try {
  mkdirSync(dirname(toolPath), { recursive: true });
  mkdirSync(unitPath, { recursive: true });
  copyFileSync(join(projectRoot, "tools/lore/story.mjs"), toolPath);
  const source = "---\nunit: probe\nlang: en\n---\n\n## key\n\nHello traveller\n";
  const translation = (stamp) => `---\nunit: probe\nlang: zh\nstamps:\n  key: ${stamp}\n---\n\n## key\n\n旅人你好\n`;
  writeFileSync(join(unitPath, "en.md"), source);
  writeFileSync(join(unitPath, "zh.md"), translation(hash("Hello traveller")));
  expectExit(0, "current translation");

  writeFileSync(join(unitPath, "en.md"), source + "\n## key\n\nDuplicate\n");
  expectExit(1, "duplicate key in one document");
  writeFileSync(join(unitPath, "en.md"), source);

  const secondUnit = join(tempRoot, "content/story/second");
  mkdirSync(secondUnit, { recursive: true });
  writeFileSync(join(secondUnit, "en.md"), source);
  writeFileSync(join(secondUnit, "zh.md"), translation(hash("Hello traveller")));
  const duplicateBuild = spawnSync(process.execPath, [toolPath, "build"], { cwd: tempRoot, encoding: "utf8" });
  if (duplicateBuild.status !== 1 || !duplicateBuild.stderr.includes("Duplicate story key across units")) {
    throw new Error(`cross-unit duplicate: ${duplicateBuild.status}\n${duplicateBuild.stdout}${duplicateBuild.stderr}`);
  }
  rmSync(secondUnit, { recursive: true, force: true });

  writeFileSync(join(unitPath, "zh.md"), translation("000000000000"));
  expectExit(1, "stale translation");

  writeFileSync(join(unitPath, "zh.md"), "---\nunit: probe\nlang: zh\n---\n");
  expectExit(1, "missing translated key");

  rmSync(join(unitPath, "zh.md"));
  expectExit(1, "missing translation document");

  writeFileSync(join(unitPath, "zh.md"), translation(hash("Hello traveller")));
  rmSync(join(unitPath, "en.md"));
  expectExit(1, "missing source document");

  console.log("STORY_CLI: PASS");
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
