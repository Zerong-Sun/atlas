#!/usr/bin/env node
/**
 * Apply the confirmed transaction-feedback repair queue.
 *
 * The queue is deliberately data driven: amounts and other effects come from
 * the event table snapshot recorded in text_confirmed_rewrite_items.csv. This
 * script only replaces the known ambiguous phrases and leaves surrounding
 * scene-specific prose intact. It is idempotent and does not stamp reviews.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const QUEUE = join(ROOT, "docs/library_audit/text_confirmed_rewrite_items.csv");

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

function effects(row) {
  const evidence = JSON.parse(row.event_evidence);
  return evidence[0][3];
}

function markdownEntries(text) {
  const re = /^##\s+(\S+)\s*$/gm;
  const matches = [...text.matchAll(re)];
  const out = new Map();
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    out.set(matches[i][1], { start, end, value: text.slice(start, end).trim() });
  }
  return out;
}

function replaceMarkdown(path, key, next) {
  const text = readFileSync(path, "utf8");
  const entries = markdownEntries(text);
  const hit = entries.get(key);
  if (!hit) throw new Error(`missing markdown key ${key} in ${path}`);
  const before = text.slice(hit.start, hit.end);
  const prefix = text.slice(0, hit.start);
  const suffix = text.slice(hit.end);
  const updated = `${prefix}\n\n${next}\n\n${suffix}`.replace(/\n{3,}/g, "\n\n");
  return { text: updated, changed: before.trim() !== next.trim() };
}

function transactionText(row, lang) {
  const es = effects(row);
  const coin = es.find((e) => e.op === "coins");
  const goods = es.find((e) => e.op === "goods");
  const amount = Number(coin?.value ?? 0);
  const n = Number(goods?.value ?? 0);
  if (lang === "zh") {
    const money = amount < 0 ? `你付出 ${Math.abs(amount)} 钱币。` : `你赚得 ${amount} 钱币。`;
    const cargo = goods ? `你把 ${n} 件货物收入行囊。` : "";
    return { money, cargo };
  }
  const money = amount < 0 ? `You pay ${Math.abs(amount)} coins.` : `You earn ${amount} coins.`;
  const cargo = goods ? `You add ${n} item${n === 1 ? "" : "s"} to your stores.` : "";
  return { money, cargo };
}

function rewriteBody(body, row, lang) {
  const { money, cargo } = transactionText(row, lang);
  const es = effects(row);
  const days = es.find((e) => e.op === "days");
  const mentor = row.key.includes("mentor_");
  let next = body;
  if (lang === "zh") {
    next = next
      .replaceAll("银钱易手，囊中为之或增或减。", money)
      .replaceAll("一注钱款进出，得失皆在掌中。", money)
      .replaceAll("货物易手，你的仓廪因之更满。", cargo)
      .replaceAll("这笔买卖，让你的货舱又添了几分。", cargo);
    if (mentor && days && days.value > 0) {
      next = next.replace(
        `你在路上用去 ${days.value} 日光阴。从今往后，无论行至何处，你都可读此法。`,
        `你用 ${days.value} 日向导师学习此法。从今往后，无论行至何处，你都可读此法。`,
      );
    }
  } else {
    next = next
      .replaceAll("Coin changes hands, and the purse settles.", money)
      .replaceAll("Money moves — a little the better or the worse for you.", money)
      .replaceAll("Goods change hands, and your store is the fuller for it.", cargo)
      .replaceAll("The trade fills your hold a little.", cargo);
    if (mentor && days && days.value > 0) {
      next = next.replace(
        `You spend ${days.value} days before the way is clear again. The art is yours now, to read on any road.`,
        `You spend ${days.value} days learning the art. You can now read it on any road.`,
      );
    }
  }
  return next.replace(/ {2,}/g, " ").trim();
}

const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const hash = (s) => createHash("sha256").update(norm(s), "utf8").digest("hex").slice(0, 12);

function syncChangedStamps(rows) {
  const byUnit = new Map();
  for (const row of rows) {
    if (!row.path.startsWith("content/story/")) continue;
    const unit = row.path.split("/")[2];
    if (!byUnit.has(unit)) byUnit.set(unit, new Set());
    byUnit.get(unit).add(row.key);
  }
  // Four additional effect-clarity fixes live outside the original 92-row
  // audit queue. Keep their source stamps in the same reproducible path.
  for (const [unit, key] of [
    ["battuta", "ev.ev_melibar_battuta_a.choice_2_result"],
    ["chinangli", "ev.ev_chinangli_b.choice_1_result"],
    ["sinju", "ev.ev_sinju_b.choice_1_result"],
    ["tanpiju", "ev.ev_tanpiju_b.choice_1_result"],
  ]) {
    if (!byUnit.has(unit)) byUnit.set(unit, new Set());
    byUnit.get(unit).add(key);
  }
  for (const [unit, keys] of byUnit) {
    const enPath = join(ROOT, "content/story", unit, "en.md");
    const zhPath = join(ROOT, "content/story", unit, "zh.md");
    const enText = readFileSync(enPath, "utf8");
    const en = markdownEntries(enText);
    const sourceRev = hash([...en.values()].map((v) => v.value).join("\0"));
    let zhText = readFileSync(zhPath, "utf8");
    zhText = zhText.replace(/^source_rev:.*$/m, `source_rev: ${sourceRev}`);
    for (const key of keys) {
      const src = en.get(key);
      if (!src) throw new Error(`missing English source for stamp ${unit}/${key}`);
      const re = new RegExp(`^(  ${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}: ).*$`, "m");
      if (!re.test(zhText)) throw new Error(`missing existing stamp for ${unit}/${key}`);
      zhText = zhText.replace(re, `$1${hash(src.value)}`);
    }
    writeFileSync(zhPath, zhText);
  }
}

const rows = parseCsv(readFileSync(QUEUE, "utf8"));
const jsonCache = new Map();
let changed = 0;
let touched = 0;

for (const row of rows) {
  const rel = row.path;
  if (rel.startsWith("content/story/")) {
    const zhPath = join(ROOT, rel);
    const enPath = join(dirname(zhPath), "en.md");
    for (const [lang, path] of [["zh", zhPath], ["en", enPath]]) {
      const text = readFileSync(path, "utf8");
      const entries = markdownEntries(text);
      const hit = entries.get(row.key);
      if (!hit) throw new Error(`missing ${row.key} in ${path}`);
      const oldBody = hit.value;
      const newBody = rewriteBody(oldBody, row, lang);
      if (oldBody !== newBody) {
        const before = text.slice(0, hit.start);
        const after = text.slice(hit.end);
        writeFileSync(path, `${before}\n\n${newBody}\n\n${after}`.replace(/\n{3,}/g, "\n\n"));
        changed++;
      }
    }
  } else if (rel === "content/i18n/zh.json") {
    for (const lang of ["zh", "en"]) {
      const path = join(ROOT, `content/i18n/${lang}.json`);
      if (!jsonCache.has(path)) jsonCache.set(path, JSON.parse(readFileSync(path, "utf8")));
      const dict = jsonCache.get(path);
      if (!(row.key in dict)) throw new Error(`missing ${row.key} in ${path}`);
      const next = rewriteBody(dict[row.key], row, lang);
      if (dict[row.key] !== next) { dict[row.key] = next; changed++; }
    }
  }
  touched++;
}

for (const [path, dict] of jsonCache) {
  const sorted = Object.fromEntries(Object.keys(dict).sort().map((k) => [k, dict[k]]));
  writeFileSync(path, JSON.stringify(sorted, null, 2) + "\n");
}
syncChangedStamps(rows);
console.log(`processed ${touched} queued results; updated ${changed} language entries`);
