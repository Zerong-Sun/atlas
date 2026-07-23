#!/usr/bin/env node
/**
 * Compiles the story-text authoring format into the flat i18n JSON the runtime
 * reads, and reports which translations have gone stale.
 *
 *   content/story/<unit>/<lang>.md   ← authored here (people)
 *   content/i18n/<lang>.json         ← compiled to here (the game)
 *
 * Why two formats at all: the runtime wants one flat map it can look up in O(1)
 * with no parsing, and prose wants line breaks, no escaping, and a diff that
 * shows the sentence you changed rather than the paragraph it lives in. Those
 * are different jobs; making one format serve both means one of them suffers,
 * and it is always the writing.
 *
 * The frontmatter carries what a flat map cannot:
 *
 *   source_rev   hash of the SOURCE text this translation was made from.
 *                When the English changes, the hash stops matching and the
 *                translation is flagged stale. Nothing in a flat key-value
 *                file can express this, so today a silently outdated
 *                translation is indistinguishable from a current one.
 *   status       draft | translated | reviewed
 *   voice/notes  register rules, in front of the translator rather than in a
 *                document they have to remember to open.
 *
 *   node tools/lore/story.mjs check     # report status and staleness
 *   node tools/lore/story.mjs build     # compile into content/i18n/*.json
 *   node tools/lore/story.mjs stamp zh  # record current source hashes
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const STORY = join(ROOT, "content/story");
const I18N = join(ROOT, "content/i18n");
const SOURCE_LANG = "en";

const cmd = process.argv[2] ?? "check";
const argLang = process.argv[3];

// ------------------------------------------------------------------- parse

/** Minimal frontmatter + `## key` sections. No YAML dependency: the schema is
 *  four scalar fields and one folded string, and a parser for that is shorter
 *  than the argument about which library to add. */
function parseDoc(text) {
  const meta = {};
  let body = text;
  if (text.startsWith("---")) {
    const end = text.indexOf("\n---", 3);
    if (end > 0) {
      const raw = text.slice(4, end);
      body = text.slice(end + 4);
      let key = null;
      let nested = false;
      for (const line of raw.split("\n")) {
        const m = line.match(/^(\w+):\s*(.*)$/);
        if (m) {
          key = m[1];
          // `stamps:` is a nested map, not a scalar. Reading it as one made the
          // staleness check silently no-op: meta.stamps was a string, so every
          // lookup returned undefined and nothing was ever reported stale.
          nested = m[2] === "" && key === "stamps";
          meta[key] = nested ? {} : (m[2] === ">" ? "" : m[2].trim());
        } else if (key && line.trim()) {
          const kv = line.trim().match(/^([\w.]+):\s*(.*)$/);
          if (nested && kv) meta[key][kv[1]] = kv[2].trim();
          else if (!nested) meta[key] = (meta[key] ? meta[key] + " " : "") + line.trim();
        }
      }
    }
  }

  const entries = {};
  let current = null;
  const buf = [];
  const flush = () => {
    if (current) entries[current] = buf.join("\n").trim();
    buf.length = 0;
  };
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(\S+)\s*$/);
    if (h) {
      flush();
      current = h[1];
    } else if (current !== null) {
      buf.push(line);
    }
  }
  flush();
  return { meta, entries };
}

/** Prose is authored with soft line breaks for readable diffs; the game wants
 *  one paragraph. Blank lines stay as paragraph breaks. */
function unwrap(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.split("\n").map((l) => l.trim()).join(
      // No space is inserted between CJK lines — that would open a gap mid
      // sentence. Latin scripts need the space.
      /[一-鿿　-〿]$/.test(p.split("\n")[0]?.trim() ?? "") ? "" : " "))
    .map((p) => p.trim())
    .join("\n\n");
}

const hash = (s) => createHash("sha256").update(s, "utf8").digest("hex").slice(0, 12);

// -------------------------------------------------------------------- load

function units() {
  if (!existsSync(STORY)) return [];
  return readdirSync(STORY).filter((d) => statSync(join(STORY, d)).isDirectory());
}

function loadUnit(unit) {
  const dir = join(STORY, unit);
  const langs = {};
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    const lang = f.slice(0, -3);
    langs[lang] = parseDoc(readFileSync(join(dir, f), "utf8"));
  }
  return langs;
}

// ------------------------------------------------------------------- check

function check() {
  let stale = 0, missing = 0, ok = 0;
  for (const unit of units()) {
    const langs = loadUnit(unit);
    const src = langs[SOURCE_LANG];
    if (!src) {
      console.log(`  ${unit}: no ${SOURCE_LANG}.md — cannot judge translations`);
      continue;
    }
    for (const [lang, doc] of Object.entries(langs)) {
      if (lang === SOURCE_LANG) continue;
      const rows = [];
      for (const key of Object.keys(src.entries)) {
        const srcHash = hash(src.entries[key]);
        if (!(key in doc.entries)) { rows.push([key, "missing", srcHash]); missing++; continue; }
        const stamped = (doc.meta.stamps ?? {})[key];
        if (doc.meta.source_rev === "PENDING") { rows.push([key, "unstamped", srcHash]); continue; }
        if (stamped && stamped !== srcHash) { rows.push([key, "STALE", srcHash]); stale++; continue; }
        ok++;
      }
      const bad = rows.filter((r) => r[1] !== "unstamped");
      console.log(`  ${unit}/${lang}: ${Object.keys(doc.entries).length} entries`
        + `, status=${doc.meta.status ?? "?"}`
        + (bad.length ? `, ${bad.length} need attention` : ""));
      for (const [k, why] of bad.slice(0, 6)) console.log(`      ${why.padEnd(8)} ${k}`);
    }
  }
  console.log(`\n${ok} current · ${stale} stale · ${missing} missing`);
  return stale + missing;
}

// ------------------------------------------------------------------- build

function build() {
  const byLang = {};
  for (const unit of units()) {
    for (const [lang, doc] of Object.entries(loadUnit(unit))) {
      byLang[lang] ??= {};
      for (const [k, v] of Object.entries(doc.entries)) {
        byLang[lang][k] = unwrap(v);
      }
    }
  }
  let total = 0;
  for (const [lang, entries] of Object.entries(byLang)) {
    const p = join(I18N, `${lang}.json`);
    const cur = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : {};
    let n = 0;
    for (const [k, v] of Object.entries(entries)) {
      if (cur[k] !== v) { cur[k] = v; n++; }
    }
    const sorted = Object.fromEntries(Object.keys(cur).sort().map((k) => [k, cur[k]]));
    writeFileSync(p, JSON.stringify(sorted, null, 2) + "\n");
    console.log(`  ${lang}.json: ${n} updated from story/ (${Object.keys(entries).length} authored)`);
    total += n;
  }
  return total;
}

// ------------------------------------------------------------------- stamp

/** Records the source hash each translated entry was made from. Run after a
 *  translation pass; the next `check` then knows what has drifted. */
function stamp(lang) {
  if (!lang) { console.error("usage: story.mjs stamp <lang>"); process.exit(1); }
  for (const unit of units()) {
    const dir = join(STORY, unit);
    const p = join(dir, `${lang}.md`);
    if (!existsSync(p)) continue;
    const src = parseDoc(readFileSync(join(dir, `${SOURCE_LANG}.md`), "utf8"));
    const text = readFileSync(p, "utf8");
    const doc = parseDoc(text);
    const stamps = {};
    for (const key of Object.keys(doc.entries)) {
      if (src.entries[key] !== undefined) stamps[key] = hash(src.entries[key]);
    }
    const line = `source_rev: ${hash(Object.values(src.entries).join(" "))}`;
    let out = text.replace(/^source_rev:.*$/m, line);
    out = out.replace(/^stamps:.*(\n {2}.*)*$/m, "").replace(/\n{3,}/g, "\n\n");
    const block = "stamps:\n" + Object.entries(stamps)
      .map(([k, v]) => `  ${k}: ${v}`).join("\n");
    out = out.replace(/^---\n/, "---\n").replace(/\n---\n/, `\n${block}\n---\n`);
    writeFileSync(p, out);
    console.log(`  ${unit}/${lang}.md: stamped ${Object.keys(stamps).length} entries`);
  }
}

switch (cmd) {
  case "build": process.exit(build() >= 0 ? 0 : 1);
  case "stamp": stamp(argLang); break;
  default: process.exit(check() > 0 ? 0 : 0);
}
