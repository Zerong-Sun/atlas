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
 *   node tools/lore/migrate_story.mjs --all [--fill] [--dry]
 *   node tools/lore/migrate_story.mjs --trunk [--fill]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const I18N = join(ROOT, "content/i18n");
const STORY = join(ROOT, "content/story");
const CITIES = join(ROOT, "content/tables/cities");

const TRUNK = ["tauris", "baldacum", "ormus", "balc", "samarcanda", "cascar",
               "cotan", "lop", "chandu", "cambaluc", "kinsay", "zayton"];

function loadCityIds() {
  const ids = [];
  for (const f of readdirSync(CITIES)) {
    if (!f.endsWith(".json")) continue;
    const data = JSON.parse(readFileSync(join(CITIES, f), "utf8"));
    for (const r of data.records ?? []) ids.push(r.id);
  }
  return ids.sort();
}

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const fill = args.includes("--fill");
const all = args.includes("--all");
const trunkOnly = args.includes("--trunk");
const unitIdx = args.indexOf("--unit");
const unitArg = unitIdx >= 0 ? args[unitIdx + 1] : null;

let units = [];
if (all) units = loadCityIds();
else if (trunkOnly) units = TRUNK;
else if (unitArg) units = [unitArg];

if (!units.length) {
  console.error("usage: migrate_story.mjs --unit <city> | --all | --trunk [--fill] [--dry]");
  process.exit(1);
}

const en = JSON.parse(readFileSync(join(I18N, "en.json"), "utf8"));
const zh = JSON.parse(readFileSync(join(I18N, "zh.json"), "utf8"));
// Must match story.mjs: hash the prose, not its line wrapping.
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const hash = (s) => createHash("sha256").update(norm(s), "utf8").digest("hex").slice(0, 12);

const CJK = /[　-〿一-鿿＀-￯]/;

/** Soft-wrap for readable diffs. CJK breaks anywhere; Latin breaks on spaces. */
function wrap(text, width = 88) {
  if (!text.includes(" ") || CJK.test(text)) {
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

/** Parse existing story md → Set of ## keys already present. */
function existingKeys(path) {
  if (!existsSync(path)) return new Set();
  const keys = new Set();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^##\s+(\S+)\s*$/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

/** Strip frontmatter; return body only (or empty). */
function bodyAfterFrontmatter(path) {
  if (!existsSync(path)) return "";
  const text = readFileSync(path, "utf8");
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return text;
  return text.slice(end + 4).replace(/^\n+/, "");
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
  地域名词用音译+源语对照（tamghā、bājgāh、masjid 等）。
stamps:
${Object.entries(stamps).map(([k, v]) => `  ${k}: ${v}`).join("\n")}
---
`;

let totalEn = 0, totalZh = 0, mismatches = 0, filled = 0, created = 0, skipped = 0;

for (const unit of units) {
  const keys = Object.keys(en).filter((k) => k.split(".").includes(unit)).sort();
  if (!keys.length) {
    console.log(`  ${unit}: no keys found`);
    continue;
  }

  const dir = join(STORY, unit);
  const enPath = join(dir, "en.md");
  const zhPath = join(dir, "zh.md");
  const enExists = existsSync(enPath);
  const zhExists = existsSync(zhPath);

  if (enExists && !fill) {
    console.log(`  ${unit}: already migrated, skipping (use --fill to append missing)`);
    skipped++;
    continue;
  }

  const haveEn = existingKeys(enPath);
  const haveZh = existingKeys(zhPath);

  const enSections = [];
  const zhSections = [];
  const stamps = {};
  let enAdded = 0, zhAdded = 0;

  for (const k of keys) {
    const e = String(en[k]);
    if (!haveEn.has(k)) {
      enSections.push(`## ${k}\n\n${wrap(e)}\n`);
      enAdded++;
      if (unwrap(wrap(e)) !== e) { console.log(`  ! ${k}: en round-trip differs`); mismatches++; }
    }

    if (zh[k] !== undefined) {
      const c = String(zh[k]);
      stamps[k] = hash(e);
      if (!haveZh.has(k)) {
        zhSections.push(`## ${k}\n\n${wrap(c)}\n`);
        zhAdded++;
        if (unwrap(wrap(c)) !== c) { console.log(`  ! ${k}: zh round-trip differs`); mismatches++; }
      }
    }
  }

  // For --fill on existing zh: also keep stamps for keys already present
  if (zhExists) {
    for (const k of haveZh) {
      if (en[k] !== undefined && stamps[k] === undefined) stamps[k] = hash(String(en[k]));
    }
  }

  if (!dry) {
    mkdirSync(dir, { recursive: true });

    if (!enExists) {
      writeFileSync(enPath, HEAD_EN(unit) + "\n" + enSections.join("\n"));
      created++;
    } else if (enSections.length) {
      const prev = bodyAfterFrontmatter(enPath);
      // Rebuild full file with head + old body + new sections
      writeFileSync(enPath, HEAD_EN(unit) + "\n" + prev.trimEnd() + "\n\n" + enSections.join("\n"));
      filled++;
    }

    if (zhSections.length || (!zhExists && Object.keys(stamps).length)) {
      if (!zhExists) {
        // Only keys we have zh for
        const allZh = [];
        const allStamps = {};
        for (const k of keys) {
          if (zh[k] === undefined) continue;
          allZh.push(`## ${k}\n\n${wrap(String(zh[k]))}\n`);
          allStamps[k] = hash(String(en[k]));
        }
        if (allZh.length) {
          writeFileSync(zhPath, HEAD_ZH(unit, allStamps) + "\n" + allZh.join("\n"));
        }
      } else if (zhSections.length) {
        // Append missing sections; refresh stamps frontmatter
        const prevBody = bodyAfterFrontmatter(zhPath);
        // Merge stamps from previous file
        const prevText = readFileSync(zhPath, "utf8");
        const stampMatch = prevText.match(/^stamps:\n((?:  .+\n)*)/m);
        if (stampMatch) {
          for (const line of stampMatch[1].split("\n")) {
            const m = line.match(/^\s+([\w.]+):\s*(\S+)/);
            if (m) stamps[m[1]] = m[2];
          }
        }
        for (const k of keys) {
          if (zh[k] !== undefined) stamps[k] = hash(String(en[k]));
        }
        writeFileSync(zhPath, HEAD_ZH(unit, stamps) + "\n" + prevBody.trimEnd() + "\n\n" + zhSections.join("\n"));
        filled++;
      }
    }
  }

  totalEn += enAdded || (enExists ? 0 : keys.length);
  totalZh += zhAdded;
  const action = !enExists ? "created" : (enAdded || zhAdded ? "filled" : "noop");
  console.log(`  ${unit}: ${action} (+${enAdded} en, +${zhAdded} zh)`);
}

console.log(`\n${dry ? "[dry] " : ""}created≈${created} filled≈${filled} skipped=${skipped}`
  + ` · +${totalEn} en · +${totalZh} zh`
  + (mismatches ? `  ⚠ ${mismatches} round-trip mismatches` : "  round-trip clean"));
