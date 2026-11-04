#!/usr/bin/env node
/** City and travel narration must not address the player as “你”. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const story = join(root, "content/story");
const cities = join(root, "content/tables/cities");

function outsideDialogue(value) {
  // Dialogue between characters may naturally contain “你”.
  return value.replace(/“[^”]*”|「[^」]*」/gs, "");
}

if (outsideDialogue("女孩问：“你去哪儿？”") !== "女孩问：") {
  throw new Error("Dialogue exclusion failed");
}
if (!outsideDialogue("你问这条渠通到哪里").includes("你")) {
  throw new Error("Narrator detection failed");
}

const units = new Set();
for (const filename of readdirSync(cities).filter((name) => name.endsWith(".json"))) {
  const table = JSON.parse(readFileSync(join(cities, filename), "utf8"));
  for (const record of table.records) units.add(record.id);
}
for (const unit of readdirSync(story)) {
  if (unit.startsWith("unique-site-") || unit.endsWith("-road") || unit === "battuta") {
    units.add(unit);
  }
}
for (const unit of ["alexandria_welcome", "alexandria_market", "zayton-bowl", "endings", "character_opening", "codex_legends"]) {
  units.add(unit);
}

const failures = [];
// Some older journey events and endings live only in the runtime dictionary.
// Include them so a source-only check cannot miss player-facing narration.
const runtime = JSON.parse(readFileSync(join(root, "content/i18n/zh.json"), "utf8"));
for (const [key, value] of Object.entries(runtime)) {
  const isNarrative = key.startsWith("ev.") || key.startsWith("end.")
    || key.startsWith("ending.") || /^arch\.[^.]+\.description$/.test(key);
  if (!isNarrative || typeof value !== "string") continue;
  const bare = outsideDialogue(value);
  if (bare.includes("你")) failures.push(`runtime/${key}: ${bare.match(/[^。！？\n]*你[^。！？\n]*/)?.[0]?.trim()}`);
}

for (const unit of [...units].sort()) {
  const path = join(story, unit, "zh.md");
  if (!existsSync(path)) {
    failures.push(`${unit}: missing Chinese story source`);
    continue;
  }
  const source = readFileSync(path, "utf8");
  for (const section of source.split(/^##\s+/m).slice(1)) {
    const newline = section.indexOf("\n");
    const key = section.slice(0, newline).trim();
    const value = section.slice(newline + 1);
    const bare = outsideDialogue(value);
    if (bare.includes("你")) failures.push(`${unit}/${key}: ${bare.match(/[^。！？\n]*你[^。！？\n]*/)?.[0]?.trim()}`);
  }
}

if (failures.length) {
  throw new Error(`Player addressed as “你” in ${failures.length} story entries:\n${failures.join("\n")}`);
}
console.log(`STORY_VIEWPOINT: PASS (${units.size} units)`);
