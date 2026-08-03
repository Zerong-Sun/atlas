#!/usr/bin/env node
/**
 * Close the G29 gap: every silent choice gets a resultText key and bilingual
 * text. Silent means no resultText, no divination (the reading is feedback),
 * and no queue_event anywhere in the choice's effect lists.
 *
 * Existing content is the source of truth. This script only adds the missing
 * resultText keys and their bilingual authoring text; it never rewrites an
 * authored result, and it is idempotent so a content editor can rerun it.
 *
 * Destination of new text:
 *   - events whose body lives in a story unit → append to that unit's
 *     en.md/zh.md, then `story.mjs build` compiles them into i18n;
 *   - i18n-only events (generic road) → appended straight to en.json/zh.json.
 *
 * Usage: node tools/lore/build_silent_results.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const EVENT_DIR = join(ROOT, "content/tables/events");
const STORY_DIR = join(ROOT, "content/story");
const I18N_DIR = join(ROOT, "content/i18n");

// ---------------------------------------------------------------- helpers
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const walkJson = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walkJson(p) : (name.endsWith(".json") ? [p] : []);
});
const slug = (id) => id.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
const q = (s) => JSON.stringify(s);
const eventKey = (id, suffix) => `ev.${slug(id)}.${suffix}`;
const resultKey = (eventId, index) => eventKey(eventId, `choice_${index + 1}_result`);

// ---------------------------------------------------------------- load
const enI18n = readJson(join(I18N_DIR, "en.json"));
const zhI18n = readJson(join(I18N_DIR, "zh.json"));

const cities = walkJson(join(ROOT, "content/tables/cities"))
  .flatMap((p) => readJson(p).records ?? []);
const cityById = new Map(cities.map((c) => [c.id, c]));
const cityName = (id, lang) => {
  const rec = cityById.get(id);
  const key = rec?.name;
  if (!key) return id;
  const map = lang === "zh" ? zhI18n : enI18n;
  return map[key] ?? id;
};

// Which story unit (if any) hosts an event's body text?
const storyUnits = existsSync(STORY_DIR)
  ? readdirSync(STORY_DIR).filter((d) => statSync(join(STORY_DIR, d)).isDirectory())
  : [];
const unitBodyCache = new Map(); // unit -> Set of keys
const keyUnit = new Map();       // key -> unit
for (const unit of storyUnits) {
  const p = join(STORY_DIR, unit, "en.md");
  if (!existsSync(p)) continue;
  const text = readFileSync(p, "utf8");
  for (const m of text.matchAll(/^##\s+(\S+)\s*$/gm)) {
    keyUnit.set(m[1], unit);
  }
}
const eventUnit = (e) => {
  if (e.body && keyUnit.has(e.body)) return keyUnit.get(e.body);
  for (const c of e.when?.cities ?? []) if (storyUnits.includes(c)) return c;
  return null;
};

// ------------------------------------------------- effect-aware text
// The register: second person, past tense, travelogue — matching the
// authored bodies. Clause libraries are keyed by op and cycled deterministically
// (by a stable hash of event+index) so consecutive choices do not repeat.
const pick = (arr, seed) => arr[(seed >>> 0) % arr.length];
function seedOf(eventId, index, kind) {
  let h = 2166136261;
  for (const ch of `${kind}:${eventId}:${index}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const CLAUSE_EN = {
  days: (v) => (v > 0 ? [`It costs you ${v} day${v > 1 ? "s" : ""} on the road.`, `You spend ${v} day${v > 1 ? "s" : ""} before the way is clear again.`]
                    : [`You gain ${-v} day${-v > 1 ? "s" : ""} over your reckoning.`, `The detour is shorter than feared; you save ${-v} day${-v > 1 ? "s" : ""}.`]),
  coins: () => ["Coin changes hands, and the purse settles. ", "Money moves — a little the better or the worse for you. "],
  reputation: () => ["Word of your conduct runs ahead of you. ", "Your name carries a little more weight here now. "],
  reveal_map: (v, ctx) => {
    const name = ctx.cityName(v, ctx.lang);
    if (name !== v)
      return [`The road to ${name} opens on your map. `, `You set the way to ${name} on your map. `];
    return ["A road you did not know opens on your map. ", "The way ahead is marked on your map at last. "];
  },
  codex: () => ["You set what you saw into your travel book. ", "The account is written down before the hour turns. "],
  sticker: () => ["You carry away a small sign of the place. ", "A little mark of it stays with you. "],
  fate: () => ["Fortune bends a little your way. ", "A small turn of fortune favours you. "],
  goods: () => ["Goods change hands, and your store is the fuller for it. ", "The trade fills your hold a little. "],
  flag: () => ["The matter is marked and will not be forgotten. ", "A mark is set on this affair. "],
  unflag: () => ["An old mark is set aside, and the matter stands clear. ", "What was noted is noted no longer. "],
  item: () => ["You carry away something that will serve you later. ", "A useful thing passes into your keeping. "],
  language: (v) => (v ? [`You pick up words of ${v} on the way. `, `A little of the ${v} tongue stays with you. `] : ["You pick up a few words of a new tongue. ", "Some words of a strange speech stay with you. "]),
  reveal_city: (v, ctx) => {
    const name = ctx.cityName(v, ctx.lang);
    return name !== v
      ? [`They tell you of ${name}, farther down the road. `, `You hear the name of ${name}, and mark it on the map. `]
      : ["They name a city farther down the road. ", "You hear the name of a far city, and mark it. "];
  },
  reveal_route: () => ["A route between known places is made plain to you. ", "You learn the stages of a road you had not charted. "],
  unlock_route: () => ["A road long closed to you stands open now. ", "The way that was barred to you is passable again. "],
  learn_divination: () => ["You learn the method, and it is yours to cast on the road ahead. ", "The art is yours now, to read on any road. "],
};

const CLAUSE_ZH = {
  days: (v) => (v > 0 ? [`为此费去你 ${v} 日路程。`, `你在路上用去 ${v} 日光阴。`]
                    : [`你比估算省下 ${-v} 日。`, `绕路比预想的短，你省下 ${-v} 日。`]),
  coins: () => ["银钱易手，囊中为之或增或减。", "一注钱款进出，得失皆在掌中。"],
  reputation: () => ["你的行事之名先你一步传开。", "此地人谈起你，语气添了几分敬重。"],
  reveal_map: (v, ctx) => {
    const name = ctx.cityName(v, ctx.lang);
    if (name !== v)
      return [`通往${name}的道路，就此展开在舆图上。`, `你标出了通往${name}的路。`];
    return ["一条你先前不知的道路，就此展开在舆图上。", "前路终于标上了你的舆图。"];
  },
  codex: () => ["你把这番见闻记入行纪。", "不到一个时辰，这段记录已落笔成文。"],
  sticker: () => ["你带走此地的一枚小小印记。", "一缕此地痕迹，随你留在身上。"],
  fate: () => ["气运稍稍偏向于你。", "时运待你，比先前好了几分。"],
  goods: () => ["货物易手，你的仓廪因之更满。", "这笔买卖，让你的货舱又添了几分。"],
  flag: () => ["此事已作下记号，不会被忘记。", "这件公案，就此有了着落。"],
  unflag: () => ["旧日的记号就此销去，事情归于清朗。", "记下的事，不再记下了。"],
  item: () => ["你带走一件日后有用的物事。", "一宗堪用的物件，落入你手中。"],
  language: (v) => (v ? [`你沿途学了几句${v}话。`, `${v}语的一鳞半爪，随你留在身上。`] : ["你学了几句陌生言语。", "一门外邦话语，你略通皮毛。"]),
  reveal_city: (v, ctx) => {
    const name = ctx.cityName(v, ctx.lang);
    return name !== v
      ? [`他们向你提起${name}，更在前路深处。`, `你听说${name}之名，把它记在了舆图上。`]
      : ["他们向你提起前路的一座城。", "你听说了远方一座城之名，把它记下。"];
  },
  reveal_route: () => ["两座已知之地间的路，被你摸清了。", "你得知一条尚未图绘的路程与站程。"],
  unlock_route: () => ["一条久已对你不通的路，如今门户大开。", "那道曾拦着你的路，如今可以通行了。"],
  learn_divination: () => ["你习得此法，前路之上尽可起卦。", "从今往后，无论行至何处，你都可读此法。"],
};

function effectsOf(choice) {
  return [
    ...(choice.effects ?? []),
    ...(choice.pass?.effects ?? []),
    ...(choice.fail?.effects ?? []),
    ...(choice.lessonFailEffects ?? []),
  ];
}

const clausesOf = (lang) => (lang === "zh" ? CLAUSE_ZH : CLAUSE_EN);

function labelText(choice, lang) {
  const map = lang === "zh" ? zhI18n : enI18n;
  return map[choice.label] ?? "";
}

// Opens with the action (label), then consequences from effects.
function composeText(event, choice, index, lang) {
  const kind = event.kind ?? "event";
  const seed = seedOf(event.id, index, kind);
  const clauses = clausesOf(lang);
  const seen = new Set();
  const unique = [];
  for (const eff of effectsOf(choice)) {
    const k = `${eff.op}:${String(eff.value ?? "")}`;
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push([eff.op, eff.value]);
  }
  const body = unique.map(([op, v]) => {
    const fn = clauses[op];
    return fn ? pick(fn(v, { cityName, lang }), seed + op.length) : null;
  }).filter(Boolean);

  // Opener: restate the action. For EN lower-case the label start so it reads
  // as a second-person past narration; ZH labels already read as narration.
  const label = labelText(choice, lang).trim();
  let opener = "";
  if (label) {
    opener = lang === "zh"
      ? (label.startsWith("你") ? label : `你${label}`)
      : `You ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
  }
  const end = lang === "zh" ? "。" : ".";
  const stripEnd = (s) => s.trim().replace(/[。.]+$/, "");
  const parts = [];
  if (opener) parts.push(stripEnd(opener));
  for (const clause of body) parts.push(stripEnd(clause));
  const ps = parts.filter(Boolean);
  if (!ps.length) return lang === "zh" ? "……" : "...";
  if (lang === "zh") {
    // First clause is tied to the opener with a comma; the rest read as their
    // own sentences so the narration does not run on.
    return ps.map((p, i) => p + (i < ps.length - 1 ? (i === 0 ? "，" : "。") : "。")).join("");
  }
  return ps.map((p, i) => p + (i < ps.length - 1 ? "." : "")).join(" ") + end;
}

// ---------------------------------------------------------------- text plans
const plans = []; // { file, text, span, choiceIndex, key, unit, en, zh }

function findMatching(text, start, open, close) {
  let depth = 0, string = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (string) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') string = false;
      continue;
    }
    if (c === '"') { string = true; continue; }
    if (c === open) depth++;
    if (c === close && --depth === 0) return i;
  }
  return -1;
}

const eventFiles = walkJson(EVENT_DIR);
for (const p of eventFiles) {
  const text = readFileSync(p, "utf8");
  const doc = readJson(p);
  for (const event of doc.records ?? []) {
    const unit = eventUnit(event);
    for (let i = 0; i < (event.choices ?? []).length; i++) {
      const choice = event.choices[i];
      const hasFeedback = Boolean(choice.resultText) || Boolean(choice.divination) ||
        effectsOf(choice).some((eff) => eff.op === "queue_event");
      if (hasFeedback) continue;
      const key = resultKey(event.id, i);
      const en = composeText(event, choice, i, "en");
      const zh = composeText(event, choice, i, "zh");
      plans.push({ file: p, text, event, choiceIndex: i, choice, key, unit, en, zh });
    }
  }
}

const n = plans.length;

if (process.argv.includes("--sample")) {
  console.log(`\nPreview (${n} silent choices planned):`);
  const shown = plans.filter((pl) =>
    !process.argv[3] || pl.event.id.includes(process.argv[3]) || pl.file.includes(process.argv[3])
  ).slice(0, 12);
  for (const pl of shown) {
    console.log(`\n[${pl.file.split("/").pop()} ${pl.event.id}[${pl.choiceIndex}] -> ${pl.key}]`);
    console.log(`  EN: ${pl.en}`);
    console.log(`  ZH: ${pl.zh}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------- apply JSON
const textByFile = new Map();
for (const plan of plans) {
  const text = textByFile.get(plan.file) ?? plan.text;
  const marker = `"id": ${q(plan.event.id)}`;
  const idPos = text.indexOf(marker);
  if (idPos < 0) throw new Error(`cannot locate event ${plan.event.id} in ${plan.file}`);
  const recordStart = text.lastIndexOf("{", idPos);
  const recordEnd = findMatching(text, recordStart, "{", "}");
  const labelPos = text.indexOf(`"label": ${q(plan.choice.label)}`, recordStart);
  if (labelPos < 0 || labelPos > recordEnd)
    throw new Error(`cannot locate label for ${plan.event.id}[${plan.choiceIndex}]`);
  const lineEnd = text.indexOf("\n", labelPos);
  const line = text.slice(text.lastIndexOf("\n", labelPos) + 1, lineEnd);
  const indent = line.match(/^\s*/)?.[0] ?? "          ";
  // Insert after the label line so resultText sits next to label (matches the
  // hand-authored 12-city style).
  textByFile.set(plan.file, text.slice(0, lineEnd + 1) + `${indent}"resultText": ${q(plan.key)},\n` + text.slice(lineEnd + 1));
}
for (const [p, text] of textByFile) writeFileSync(p, text);

// ---------------------------------------------------------------- apply text
const storyAdditions = new Map(); // unit -> [[key, en, zh], ...]
const i18nAdditions = { en: [], zh: [] };

for (const plan of plans) {
  if (plan.unit) {
    const list = storyAdditions.get(plan.unit) ?? [];
    list.push([plan.key, plan.en, plan.zh]);
    storyAdditions.set(plan.unit, list);
  } else {
    i18nAdditions.en.push([plan.key, plan.en]);
    i18nAdditions.zh.push([plan.key, plan.zh]);
  }
}

function appendStory(unit, entries) {
  for (const lang of ["en", "zh"]) {
    const p = join(STORY_DIR, unit, `${lang}.md`);
    if (!existsSync(p)) throw new Error(`missing story unit: ${p}`);
    let text = readFileSync(p, "utf8");
    text = text.replace(/\s+$/, "") + "\n";
    for (const [key, en, zh] of entries) {
      const value = lang === "en" ? en : zh;
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const section = new RegExp(`(## ${escaped}\\n\\n)[\\s\\S]*?(?=\\n## |$)`);
      if (section.test(text)) text = text.replace(section, (_m, head) => `${head}${value}\n`);
      else text += `\n## ${key}\n\n${value}\n`;
    }
    writeFileSync(p, text.replace(/\n{3,}/g, "\n\n"));
  }
}

for (const [unit, entries] of storyAdditions) appendStory(unit, entries);

if (i18nAdditions.en.length) {
  for (const lang of ["en", "zh"]) {
    const p = join(I18N_DIR, `${lang}.json`);
    const data = readJson(p);
    const list = i18nAdditions[lang];
    for (const [key, value] of list) data[key] = value;
    writeJson(p, Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]])));
  }
}

// ---------------------------------------------------------------- compile
if (storyAdditions.size) {
  execSync("node tools/lore/story.mjs build", { cwd: ROOT, stdio: "inherit" });
}

console.log(`\nSilent choices closed: ${n} resultText keys added.`);
console.log(`  story units touched: ${storyAdditions.size} (${[...storyAdditions.keys()].join(", ")})`);
if (i18nAdditions.en.length) console.log(`  i18n-direct keys: ${i18nAdditions.en.length}`);
