#!/usr/bin/env node
/** Post-gen M4 text QA — exit 1 on failure. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "assets/data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const zhLen = (s) => [...String(s || "")].length;

const fails = [];
const warn = [];

const events = read("events.json");
const codex = read("codex.json");
const cities = read("cities.json");

const entries = events.filter((e) => e.kind === "entry");
const sites = events.filter((e) => e.kind === "site");

for (const e of entries) {
  const n = zhLen(e.body?.zh);
  if (n < 280 || n > 520) fails.push(`${e.id} entry zh len ${n} (want ~300–500 ±20)`);
  if (!e.body?.en || e.body.en.length < 80) fails.push(`${e.id} missing/short en`);
  if (!e.lore?.ref) fails.push(`${e.id} missing lore.ref`);
}

for (const e of sites) {
  const n = zhLen(e.body?.zh);
  if (n < 150) fails.push(`${e.id} site zh len ${n} < 150`);
  if (!e.body?.en) fails.push(`${e.id} missing en`);
}

let stub = 0;
for (const c of codex) {
  const zh = c.body?.zh || "";
  const en = c.body?.en || "";
  if (zhLen(zh) < 80) fails.push(`${c.id} codex zh < 80`);
  if (!en || en.length < 40) fails.push(`${c.id} codex en short`);
  if (/图鉴条目：/.test(zh)) stub++;
}
if (stub / codex.length >= 0.05) fails.push(`codex stub rate ${stub}/${codex.length}`);
else if (stub) warn.push(`codex stubs remaining: ${stub}`);

const damascus = cities.find((c) => c.id === "damascus");
if (!damascus?.sites?.includes("ev-damascus-tree-1")) {
  fails.push("damascus.sites missing ev-damascus-tree-1");
}
for (const id of ["ev-damascus-tree-1", "ev-damascus-tree-2", "ev-damascus-tree-3"]) {
  if (!events.some((e) => e.id === id)) fails.push(`missing ${id}`);
}

const elens = entries.map((e) => zhLen(e.body.zh));
const slens = sites.map((e) => zhLen(e.body.zh));
const clens = codex.map((c) => zhLen(c.body.zh));

console.log("M4 text check");
console.log(
  `  entries ${entries.length} zh min/avg/max ${Math.min(...elens)}/${Math.round(elens.reduce((a, b) => a + b, 0) / elens.length)}/${Math.max(...elens)}`
);
console.log(
  `  sites ${sites.length} zh min/avg ${Math.min(...slens)}/${Math.round(slens.reduce((a, b) => a + b, 0) / slens.length)}`
);
console.log(
  `  codex ${codex.length} zh min/avg ${Math.min(...clens)}/${Math.round(clens.reduce((a, b) => a + b, 0) / clens.length)} stubs=${stub}`
);
warn.forEach((w) => console.log("  WARN", w));
if (fails.length) {
  fails.forEach((f) => console.error("  FAIL", f));
  process.exit(1);
}
console.log("  OK");
