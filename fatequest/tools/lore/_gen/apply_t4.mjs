#!/usr/bin/env node
/**
 * Apply T4 Fadlan steppe road events into road.json + story unit.
 *   node tools/lore/_gen/apply_t4.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import events from "./t4_fadlan_roads.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const roadPath = join(ROOT, "content/tables/events/road.json");
const roadDoc = JSON.parse(readFileSync(roadPath, "utf8"));
const existing = new Set(roadDoc.records.map((r) => r.id));

let added = 0;
for (const e of events) {
  if (existing.has(e.id)) {
    roadDoc.records = roadDoc.records.filter((r) => r.id !== e.id);
  }
  // i18n key uses underscore form: ev.road.fadlan_01.title
  const keyBase = e.id.replace(/^ev-/, "ev.").replace(/-/g, "_").replace(/^ev\.road_/, "ev.road.");
  // fadlan ids are ev-road-fadlan-01 → ev.road.fadlan_01
  const num = e.id.match(/fadlan-(\d+)/)[1];
  const kb = `ev.road.fadlan_${num}`;
  const rec = {
    id: e.id,
    kind: "road",
    title: `${kb}.title`,
    body: `${kb}.body`,
    once: false,
    when: { bands: ["steppe"] },
    scene: {
      bg: e.sceneBg || "desert-night",
      region: "steppe",
    },
    choices: e.choices.map((ch) => {
      const out = {
        label: `${kb}.choice.${ch.slug}`,
        effects: ch.effects,
      };
      if (ch.needs) out.needs = ch.needs;
      return out;
    }),
    lore: {
      storyId: e.storyId || e.id,
      origin: e.origin || "hybrid",
      ref: e.ref || { book: "ibn-fadlan", chapterId: e.storyId || "fadlan-road" },
    },
  };
  roadDoc.records.push(rec);
  added++;
}
writeFileSync(roadPath, JSON.stringify(roadDoc, null, 2) + "\n");
console.log(`road.json: +${added} (total ${roadDoc.records.length})`);

// Story unit
const unitDir = join(ROOT, "content/story/ibn-fadlan-road");
mkdirSync(unitDir, { recursive: true });

function buildMd(lang) {
  const isEn = lang === "en";
  const lines = [];
  if (isEn) {
    lines.push("---");
    lines.push("unit: ibn-fadlan-road");
    lines.push("lang: en");
    lines.push("role: source");
    lines.push("status: reviewed");
    lines.push("voice: yule");
    lines.push("notes: >");
    lines.push("  Steppe road events rewritten from Ibn Fadlan and related northern");
    lines.push("  travel lore. Second person, present tense, observational. G24 clean.");
    lines.push("---");
    lines.push("");
  } else {
    lines.push("---");
    lines.push("unit: ibn-fadlan-road");
    lines.push("lang: zh");
    lines.push("source: en");
    lines.push("source_rev: PENDING");
    lines.push("status: translated");
    lines.push("translator: 人工校译");
    lines.push("notes: >");
    lines.push("  行纪腔。草原途中事件，据法德兰及相关北方行纪改写。");
    lines.push("---");
    lines.push("");
  }
  for (const e of events) {
    const num = e.id.match(/fadlan-(\d+)/)[1];
    const kb = `ev.road.fadlan_${num}`;
    lines.push(`## ${kb}.title`);
    lines.push("");
    lines.push(isEn ? e.titleEn : e.titleZh);
    lines.push("");
    lines.push(`## ${kb}.body`);
    lines.push("");
    lines.push(isEn ? e.bodyEn : e.bodyZh);
    lines.push("");
    for (const ch of e.choices) {
      lines.push(`## ${kb}.choice.${ch.slug}`);
      lines.push("");
      lines.push(isEn ? ch.labelEn : ch.labelZh);
      lines.push("");
    }
  }
  return lines.join("\n");
}

writeFileSync(join(unitDir, "en.md"), buildMd("en"));
writeFileSync(join(unitDir, "zh.md"), buildMd("zh"));
console.log(`story ibn-fadlan-road: ${events.length} events ×2 langs`);

// Counts
const steppe = roadDoc.records.filter((r) => (r.when?.bands || []).includes("steppe"));
console.log(`steppe band now: ${steppe.length}; total road: ${roadDoc.records.length}`);
