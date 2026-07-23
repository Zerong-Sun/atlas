#!/usr/bin/env node
/**
 * I18n data-level validation — standalone, no Godot dependency.
 *
 * Checks every i18n JSON, the glossary, and the cross-references between
 * content tables and text keys. Superset of what validate.mjs covers on
 * the i18n side — runs faster and reports in more detail.
 *
 * Usage:  node tests/test_i18n_lines.mjs [--verbose]
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const I18N = join(ROOT, "content/i18n");
const TABLES = join(ROOT, "content/tables");
const GLOSSARY = join(ROOT, "assets/data/glossary.json");
const VERBOSE = process.argv.includes("--verbose");

let fail = 0;
const ok = (cond, msg) => { if (!cond) { console.log("  FAIL: " + msg); fail++; } };
const info = (msg) => VERBOSE && console.log("  " + msg);

// ------------------------------------------------------------------ Load
const enRaw = readFileSync(join(I18N, "en.json"), "utf8");
const zhRaw = readFileSync(join(I18N, "zh.json"), "utf8");
let en, zh;
try { en = JSON.parse(enRaw); } catch (e) { ok(false, "en.json: invalid JSON — " + e.message); process.exit(1); }
try { zh = JSON.parse(zhRaw); } catch (e) { ok(false, "zh.json: invalid JSON — " + e.message); process.exit(1); }

const allEnKeys = Object.keys(en).sort();
const allZhKeys = Object.keys(zh).sort();

// ------------------------------------------------------------------ I. Structural
console.log("\n--- I. Structure ---");
info(`en.json: ${allEnKeys.length} keys, ${Math.round(enRaw.length / 1024)} KB`);
info(`zh.json: ${allZhKeys.length} keys, ${Math.round(zhRaw.length / 1024)} KB`);

// All zh keys must exist in en
const zhOrphans = allZhKeys.filter(k => !en[k]);
for (const k of zhOrphans) ok(false, `zh.json:${k} — key not in en.json`);

// No empty translations
const empty = allZhKeys.filter(k => typeof zh[k] === "string" && zh[k].trim() === "");
for (const k of empty) ok(false, `zh.json:${k} — empty translation`);

// All values must be strings
const nonStr = allZhKeys.filter(k => typeof zh[k] !== "string");
for (const k of nonStr) ok(false, `zh.json:${k} — non-string (${typeof zh[k]})`);

// Keys sorted (catches merge errors)
let prev = "";
let sortedOk = true;
for (const k of allZhKeys) {
  if (k < prev) { ok(false, `zh.json: key order broken at "${k}" after "${prev}"`); sortedOk = false; break; }
  prev = k;
}
if (sortedOk) info("key sort order: ✓");

// ------------------------------------------------------------------ II. Coverage
console.log("\n--- II. Coverage ---");
const untranslated = allEnKeys.filter(k => !zh[k]);
const byBatch = {};
const METROS = ["tauris","baldacum","ormus","chandu","cambaluc","kinsay","balc","samarcanda","cascar","cotan","lop","zayton"];
function batchOf(key) {
  if (key.startsWith("ev.road.")) return "B2";
  if (key.startsWith("ev.")) return METROS.includes(key.split(".")[1]) ? "B1" : "B3";
  if (key.startsWith("codex.") || key.startsWith("div.")) return "B2";
  return "B4";
}
for (const k of untranslated) byBatch[batchOf(k)] = (byBatch[batchOf(k)] || 0) + 1;
const pct = (100 * allZhKeys.length / allEnKeys.length).toFixed(1);
console.log(`  ${allZhKeys.length}/${allEnKeys.length} (${pct}%) translated`);
for (const b of ["B1","B2","B3","B4"])
  if (b in byBatch) console.log(`  ${b}: ${byBatch[b]} remaining`);
const longForms = untranslated.filter(k => k.endsWith(".body"));
console.log(`  long-form .body: ${longForms.length}`);

// ------------------------------------------------------------------ III. Zayton completeness
console.log("\n--- III. Zayton (template city) ---");
const zKeys = allEnKeys.filter(k => k.includes("zayton"));
const zMissing = zKeys.filter(k => !zh[k]);
for (const k of zMissing) ok(false, `Zayton missing: ${k}`);
console.log(zMissing.length
  ? `  FAIL: ${zMissing.length}/${zKeys.length} Zayton keys missing`
  : `  ${zKeys.length}/${zKeys.length} Zayton complete ✓`);

// ------------------------------------------------------------------ IV. Glossary cross-reference
console.log("\n--- IV. Glossary ---");
if (existsSync(GLOSSARY)) {
  const glossary = JSON.parse(readFileSync(GLOSSARY, "utf8"));
  const terms = glossary.terms ?? [];
  info(`${terms.length} terms in glossary`);

  // Build pre-compiled lookup
  const termLookup = new Map();
  for (const t of terms) {
    const enTerm = t.en.toLowerCase().split("/")[0].trim();
    const parts = t.zh.split(/[（(／\/）)]/).map(s => s.trim()).filter(Boolean);
    const esc = enTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    termLookup.set(enTerm, { regex: new RegExp("\\b" + esc + "\\b", "i"), variants: parts, kind: t.kind });
    for (const a of t.aliases ?? []) {
      const aEsc = a.toLowerCase().trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!termLookup.has(a.toLowerCase().trim()))
        termLookup.set(a.toLowerCase().trim(), { regex: new RegExp("\\b" + aEsc + "\\b", "i"), variants: parts, kind: t.kind });
    }
  }

  // Place terms: strict check
  const placeHits = [];
  for (const [key, zhText] of Object.entries(zh)) {
    if (typeof zhText !== "string") continue;
    const enText = en[key];
    if (typeof enText !== "string") continue;
    for (const [term, info] of termLookup) {
      if (info.kind !== "place") continue;
      if (!info.regex.test(enText)) continue;
      if (!info.variants.some(v => v.length >= 1 && zhText.includes(v)))
        placeHits.push({ key, term, variants: info.variants });
    }
  }
  for (const hit of placeHits.slice(0, 5))
    ok(false, `G7-place: ${hit.key} EN has "${hit.term}" → ZH missing ${JSON.stringify(hit.variants)}`);
  if (placeHits.length > 5) console.log(`  ... and ${placeHits.length - 5} more G7-place hits`);
  if (!placeHits.length) info("G7-place: all clean ✓");

  // Check that all metro city ids exist as glossary place terms
  const missingFromGlossary = [];
  for (const m of METROS) {
    if (!termLookup.has(m) || termLookup.get(m).kind !== "place")
      missingFromGlossary.push(m);
  }
  for (const m of missingFromGlossary)
    ok(false, `metro "${m}" not in glossary (G7 will be blind to it)`);
  if (!missingFromGlossary.length) info(`all ${METROS.length} metros in glossary ✓`);
} else {
  console.log("  glossary.json not found — skipped");
}

// ------------------------------------------------------------------ V. Event table → i18n key references
console.log("\n--- V. Table → i18n key references ---");
let tableRefs = 0, tableMissing = 0;
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!f.endsWith(".json")) continue;
    const doc = JSON.parse(readFileSync(p, "utf8"));
    for (const r of doc.records ?? []) {
      for (const k of [r.title, r.body]) {
        if (k) { tableRefs++; if (!en[k]) { ok(false, `${f}: "${r.id}" → i18n key "${k}" not in en.json`); tableMissing++; } }
      }
      for (const c of r.choices ?? []) {
        if (c.label) { tableRefs++; if (!en[c.label]) { ok(false, `${f}: "${r.id}" → choice "${c.label}" not in en.json`); tableMissing++; } }
      }
    }
  }
}
walk(join(TABLES, "events"));
info(`event → i18n: ${tableRefs - tableMissing}/${tableRefs} keys exist`);

// ------------------------------------------------------------------ VI. G18 ASCII leak detection
console.log("\n--- VI. G18 ASCII leak detection ---");
const LONG_SUFFIXES = [".body", ".desc", ".wonder", ".origin", ".quest", ".omen", ".sign"];
const leaks = [];
for (const [key, zhText] of Object.entries(zh)) {
  if (typeof zhText !== "string") continue;
  if (!LONG_SUFFIXES.some(s => key.endsWith(s))) continue;
  const ascii = [...zhText].filter(c => c.charCodeAt(0) < 128).length;
  if (zhText.length > 20 && ascii / zhText.length > 0.6)
    leaks.push({ key, pct: Math.round(ascii / zhText.length * 100) });
}
for (const l of leaks.slice(0, 5))
  ok(false, `G18: ${l.key} — ${l.pct}% ASCII`);
if (leaks.length > 5) console.log(`  ... and ${leaks.length - 5} more ASCII leaks`);
if (!leaks.length) info("G18: all clean ✓");

// ------------------------------------------------------------------ Report
console.log("\n" + "=".repeat(50));
if (fail === 0) {
  console.log("ALL CHECKS PASSED ✓\n");
  process.exit(0);
} else {
  console.log(`FAILED: ${fail} error(s)\n`);
  process.exit(1);
}
