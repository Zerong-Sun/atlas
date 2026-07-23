#!/usr/bin/env node
/**
 * Localisation export / import / report — docs/L10N_PLAN.md §4.
 *
 * Hand-editing 917 JSON entries is not a workable process, and neither is
 * translating in key order: a translator needs to know WHERE a line appears
 * ("Ask the pilots" is a different sentence at a quay than in a palace), so the
 * export carries a context column derived from the content tables.
 *
 *   node tools/lore/l10n.mjs export --lang zh --batch B1 > b1.tsv
 *   node tools/lore/l10n.mjs import --lang zh b1.done.tsv
 *   node tools/lore/l10n.mjs report --lang zh
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const I18N = join(ROOT, "content/i18n");

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name, dflt = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const lang = flag("lang", "zh");

// ------------------------------------------------------------------ load
const en = JSON.parse(readFileSync(join(I18N, "en.json"), "utf8"));
const target = existsSync(join(I18N, `${lang}.json`))
  ? JSON.parse(readFileSync(join(I18N, `${lang}.json`), "utf8"))
  : {};

const events = {};
for (const f of readdirSync(join(ROOT, "content/tables/events"))) {
  if (!f.endsWith(".json")) continue;
  for (const r of JSON.parse(readFileSync(join(ROOT, "content/tables/events", f), "utf8")).records)
    events[r.id] = r;
}
const cities = {};
for (const f of readdirSync(join(ROOT, "content/tables/cities"))) {
  if (!f.endsWith(".json")) continue;
  for (const r of JSON.parse(readFileSync(join(ROOT, "content/tables/cities", f), "utf8")).records)
    cities[r.id] = r;
}
const metroIds = Object.values(cities).filter((c) => c.tier === "metropolis").map((c) => c.id);

// -------------------------------------------------- which batch is a key in
// Batches follow reading probability, not alphabetical order (L10N_PLAN §3).
function batchOf(key) {
  if (key.startsWith("ev.road.")) return "B2";
  if (key.startsWith("ev.")) {
    const city = key.split(".")[1];
    if (metroIds.includes(city)) return "B1";
    // ev.<eventid>... — resolve through the event's own `when.cities`
    const ev = events[`ev-${city}-entry`] ?? events[city];
    const c = ev?.when?.cities?.[0];
    if (c && metroIds.includes(c)) return "B1";
    return "B3";
  }
  if (key.startsWith("codex.") || key.startsWith("sticker.")) return "B2";
  if (key.startsWith("retainer.") || key.startsWith("npc.")
      || key.startsWith("good.") || key.startsWith("ending.")) return "B4";
  if (key.startsWith("div.")) return "B2";
  return "B4";
}

/** Where does this line appear? Without this a translator is guessing. */
function contextOf(key) {
  const parts = key.split(".");
  if (parts[0] !== "ev") return parts.slice(0, 2).join(".");
  const slug = parts[1];
  // Find the event that owns this key by prefix match on its own fields.
  for (const ev of Object.values(events)) {
    const own = [ev.title, ev.body, ...(ev.choices ?? []).map((c) => c.label)];
    if (own.includes(key)) {
      const city = ev.when?.cities?.[0] ?? ev.when?.bands?.[0] ?? "—";
      const field = key.endsWith(".title") ? "标题"
        : key.endsWith(".body") ? "正文" : "选项";
      return `${ev.kind}/${city}/${field}`;
    }
  }
  return `ev/${slug}`;
}

// ---------------------------------------------------------------- commands
if (cmd === "export") {
  const want = flag("batch");
  const rows = [];
  for (const key of Object.keys(en).sort()) {
    if (target[key] !== undefined) continue;          // already translated
    const b = batchOf(key);
    if (want && b !== want) continue;
    rows.push([key, b, contextOf(key), String(en[key]).replace(/\t|\n/g, " ")].join("\t"));
  }
  process.stdout.write("key\tbatch\tcontext\tenglish\ttranslation\n");
  process.stdout.write(rows.map((r) => r + "\t").join("\n") + "\n");
  process.stderr.write(`# ${rows.length} rows${want ? ` in ${want}` : ""}\n`);

} else if (cmd === "import") {
  const file = argv.find((a) => a.endsWith(".tsv"));
  if (!file) { console.error("usage: import --lang zh <file.tsv>"); process.exit(1); }
  const force = argv.includes("--force");
  let added = 0, skipped = 0, blank = 0;
  for (const line of readFileSync(file, "utf8").split("\n").slice(1)) {
    if (!line.trim()) continue;
    const [key, , , , translation] = line.split("\t");
    if (!key) continue;
    if (!translation || !translation.trim()) { blank++; continue; }
    if (target[key] !== undefined && !force) { skipped++; continue; }
    target[key] = translation.trim();
    added++;
  }
  const sorted = Object.fromEntries(Object.keys(target).sort().map((k) => [k, target[k]]));
  writeFileSync(join(I18N, `${lang}.json`), JSON.stringify(sorted, null, 2) + "\n");
  console.log(`${lang}: +${added} translated, ${skipped} kept (use --force to overwrite), ${blank} blank rows`);

} else if (cmd === "report") {
  const keys = Object.keys(en);
  const missing = keys.filter((k) => target[k] === undefined);
  const byBatch = {};
  for (const k of missing) { const b = batchOf(k); byBatch[b] = (byBatch[b] ?? 0) + 1; }
  const bodies = missing.filter((k) => k.endsWith(".body")).length;
  console.log(`${lang}: ${keys.length - missing.length}/${keys.length} translated `
    + `(${(100 * (keys.length - missing.length) / keys.length).toFixed(1)}%)`);
  for (const b of ["B1", "B2", "B3", "B4"])
    if (byBatch[b]) console.log(`  ${b}: ${byBatch[b]} remaining`);
  console.log(`  long-form (.body): ${bodies} — these must be human-translated (L10N_PLAN §6)`);

} else {
  console.error("usage: l10n.mjs export|import|report --lang zh [--batch B1] [file.tsv]");
  process.exit(1);
}
