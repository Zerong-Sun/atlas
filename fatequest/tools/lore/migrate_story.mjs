#!/usr/bin/env node
/**
 * Moves text that already lives in content/i18n/*.json into the story
 * authoring format (docs/STORY_TEXT_FORMAT.md).
 *
 * The prose was written before the format existed, so this is a lift, not a
 * rewrite: every string is carried across byte-for-byte. What the migration
 * ADDS is the thing the flat file could never hold — a record of which source
 * revision each translation was made from, so drift becomes detectable from
 * here on.
 *
 * Long prose is re-wrapped onto soft line breaks so future diffs show the
 * sentence that changed rather than the paragraph around it. `story.mjs build`
 * unwraps it again, and a round-trip check below proves nothing is altered.
 *
 *   node tools/lore/migrate_story.mjs --unit tauris [--dry]
 *   node tools/lore/migrate_story.mjs --all
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const I18N = join(ROOT, "content/i18n");
const STORY = join(ROOT, "content/story");

const TRUNK = ["tauris", "baldacum", "ormus", "balc", "samarcanda", "cascar",
               "cotan", "lop", "chandu", "cambaluc", "kinsay", "zayton"];

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const all = args.includes("--all");
const unitArg = args[args.indexOf("--unit") + 1];
const units = all ? TRUNK : (unitArg ? [unitArg] : []);
if (!units.length) {
  console.error("usage: migrate_story.mjs --unit <city> | --all [--dry]");
  process.exit(1);
}

const en = JSON.parse(readFileSync(join(I18N, "en.json"), "utf8"));
const zh = JSON.parse(readFileSync(join(I18N, "zh.json"), "utf8"));
const hash = (s) => createHash("sha256").update(s, "utf8").digest("hex").slice(0, 12);

const CJK = /[　-〿一-鿿＀-￯]/;

/** Soft-wrap for readable diffs. CJK breaks anywhere; Latin breaks on spaces. */
function wrap(text, width = 88) {
  if (!text.includes(" ") || CJK.test(text)) {
    // CJK: break on a punctuation boundary near the target column so a line
    // never splits a word, and never introduces a space the unwrap would keep.
    const out = [];
    let line = "";
    for (const ch of text) {
      line += ch;
      if (line.length >= 40 && "。！？；：，、）」』".includes(ch)) {
        out.push(line);
        line = "";
      }
    }
    if (line) out.push(line);
    return out.join("\n");
  }
  const words = text.split(/\s+/);
  const out = [];
  let line = "";
  for (const w of words) {
    if (line.length + w.length + 1 > width) { out.push(line); line = w; }
    else line = line ? line + " " + w : w;
  }
  if (line) out.push(line);
  return out.join("\n");
}

/** The inverse of story.mjs's unwrap — used to prove the migration is lossless. */
function unwrap(text) {
  return text.split(/\n\s*\n/).map((p) => {
    const lines = p.split("\n").map((l) => l.trim());
    return lines.reduce((acc, l) => {
      if (!acc) return l;
      return CJK.test(acc.slice(-1)) ? acc + l : acc + " " + l;
    }, "");
  }).join("\n\n");
}

const HEAD_EN = (unit) => `---
unit: ${unit}
lang: en
role: source
status: reviewed
voice: yule
notes: >
  Observational register after the Yule-Cordier translation: second person,
  present tense, no modern vocabulary, no interiority. See LORE_PIPELINE §4.
---
`;

const HEAD_ZH = (unit, stamps) => `---
unit: ${unit}
lang: zh
source: en
source_rev: ${hash(Object.values(stamps).join(" "))}
status: translated
translator: 人工校译
notes: >
  行纪腔，非现代白话。「你须知道」是 Yule 的招牌句式，中译须保留；
  Christendom 作「基督教国」不作「西方」；数字关系照搬不改写。
stamps:
${Object.entries(stamps).map(([k, v]) => `  ${k}: ${v}`).join("\n")}
---
`;

let totalEn = 0, totalZh = 0, mismatches = 0;

for (const unit of units) {
  const keys = Object.keys(en).filter((k) => k.split(".").includes(unit)).sort();
  if (!keys.length) {
    console.log(`  ${unit}: no keys found`);
    continue;
  }

  const enBody = [];
  const zhBody = [];
  const stamps = {};

  for (const k of keys) {
    const e = String(en[k]);
    enBody.push(`## ${k}\n\n${wrap(e)}\n`);
    // Round-trip guard: if wrapping changes the string, the migration would
    // silently rewrite prose. Better to know now than to find it in game.
    if (unwrap(wrap(e)) !== e) { console.log(`  ! ${k}: en round-trip differs`); mismatches++; }

    if (zh[k] !== undefined) {
      const c = String(zh[k]);
      zhBody.push(`## ${k}\n\n${wrap(c)}\n`);
      stamps[k] = hash(e);
      if (unwrap(wrap(c)) !== c) { console.log(`  ! ${k}: zh round-trip differs`); mismatches++; }
    }
  }

  const dir = join(STORY, unit);
  if (!dry) {
    mkdirSync(dir, { recursive: true });
    if (existsSync(join(dir, "en.md"))) {
      console.log(`  ${unit}: already migrated, skipping`);
      continue;
    }
    writeFileSync(join(dir, "en.md"), HEAD_EN(unit) + "\n" + enBody.join("\n"));
    if (zhBody.length) {
      writeFileSync(join(dir, "zh.md"), HEAD_ZH(unit, stamps) + "\n" + zhBody.join("\n"));
    }
  }
  totalEn += keys.length;
  totalZh += zhBody.length;
  console.log(`  ${unit}: ${keys.length} en, ${zhBody.length} zh`);
}

console.log(`\n${dry ? "[dry] " : ""}${totalEn} en · ${totalZh} zh`
  + (mismatches ? `  ⚠ ${mismatches} round-trip mismatches` : "  round-trip clean"));
