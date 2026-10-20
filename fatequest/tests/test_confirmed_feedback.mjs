#!/usr/bin/env node
/** Regression gate for the effects-backed transaction prose queue. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const csvPath = join(ROOT, "docs/library_audit/text_confirmed_rewrite_items.csv");

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.filter((r) => r.length === headers.length)
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const zh = JSON.parse(readFileSync(join(ROOT, "content/i18n/zh.json"), "utf8"));
const en = JSON.parse(readFileSync(join(ROOT, "content/i18n/en.json"), "utf8"));
const seen = new Set();
const forbidden = [
  "银钱易手", "一注钱款进出", "囊中为之或增或减", "货物易手", "货舱又添了几分",
  "Coin changes hands", "Money moves — a little the better or the worse for you",
  "Goods change hands", "The trade fills your hold a little",
];
const errors = [];
for (const row of rows) {
  if (seen.has(row.key)) errors.push(`duplicate key ${row.key}`);
  seen.add(row.key);
  const evidence = JSON.parse(row.event_evidence)[0][3];
  const coin = evidence.find((e) => e.op === "coins");
  if (!coin) { errors.push(`no coins effect ${row.key}`); continue; }
  for (const [lang, dict] of [["zh", zh], ["en", en]]) {
    const value = dict[row.key];
    if (typeof value !== "string") { errors.push(`missing ${lang} ${row.key}`); continue; }
    if (!value.includes(String(Math.abs(Number(coin.value))))) errors.push(`amount missing ${lang} ${row.key}`);
    const direction = Number(coin.value) < 0
      ? (lang === "zh" ? "付出" : "pay")
      : (lang === "zh" ? "赚得" : "earn");
    if (!value.includes(direction)) errors.push(`direction missing ${lang} ${row.key}`);
    for (const phrase of forbidden) if (value.includes(phrase)) errors.push(`ambiguous phrase ${lang} ${row.key}: ${phrase}`);
  }
}
if (rows.length !== 92) errors.push(`expected 92 queue rows, got ${rows.length}`);
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`CONFIRMED_FEEDBACK: PASS (${rows.length} rows, effects and bilingual prose aligned)`);
