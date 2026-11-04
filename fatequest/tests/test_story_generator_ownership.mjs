#!/usr/bin/env node
/** Legacy content generators must not replace text maintained in content/story. */
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const story = join(root, "content/story");
const authored = new Set();
for (const unit of readdirSync(story, { withFileTypes: true })) {
  if (!unit.isDirectory()) continue;
  for (const lang of ["en", "zh"]) {
    const path = join(story, unit.name, `${lang}.md`);
    try {
      for (const match of readFileSync(path, "utf8").matchAll(/^##\s+(\S+)\s*$/gm)) {
        authored.add(match[1]);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

const divinationGenerator = readFileSync(join(root, "tools/divination/build_p3_content.mjs"), "utf8");
const assignments = [...divinationGenerator.matchAll(/^\s*"((?:ev|end)\.[^"]+)":/gm)]
  .map((match) => match[1]);
const conflicts = assignments.filter((key) => authored.has(key));
if (conflicts.length) throw new Error(`Divination generator duplicates story keys: ${conflicts.join(", ")}`);

const temp = mkdtempSync(join(tmpdir(), "fatequest-story-owner-"));
try {
  mkdirSync(join(temp, "tools/lore"), { recursive: true });
  mkdirSync(join(temp, "content/story/zayton"), { recursive: true });
  mkdirSync(join(temp, "content/i18n"), { recursive: true });
  copyFileSync(join(root, "tools/lore/zayton_text.mjs"), join(temp, "tools/lore/zayton_text.mjs"));
  writeFileSync(join(temp, "package.json"), '{"type":"module"}\n');
  for (const lang of ["en", "zh"]) {
    writeFileSync(join(temp, `content/story/zayton/${lang}.md`), "## ev.zayton.entry.title\n\nAuthored title\n");
    writeFileSync(join(temp, `content/i18n/${lang}.json`), JSON.stringify({
      "ev.zayton.entry.title": "Authored title",
      "city.zayton.market.name": "Old seed",
    }));
  }
  const run = spawnSync(process.execPath, [join(temp, "tools/lore/zayton_text.mjs")], { encoding: "utf8" });
  if (run.status !== 0) throw new Error(run.stderr || run.stdout);
  for (const lang of ["en", "zh"]) {
    const values = JSON.parse(readFileSync(join(temp, `content/i18n/${lang}.json`), "utf8"));
    if (values["ev.zayton.entry.title"] !== "Authored title") {
      throw new Error(`${lang} story title was overwritten`);
    }
    if (values["city.zayton.market.name"] === "Old seed") {
      throw new Error(`${lang} generator-owned label was not updated`);
    }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("STORY_GENERATOR_OWNERSHIP: PASS");
