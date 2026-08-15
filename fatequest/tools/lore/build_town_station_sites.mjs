#!/usr/bin/env node
/**
 * P6 · Town/station site deepening (61 cities).
 *
 * Every town/station node that had only an entry event gets one standing
 * exploration site (`ev-<city>-a`) that deepens into a multi-round followup
 * (`ev-<city>-a-followup`), mirroring the city-tier pattern from
 * build_21city_followups.mjs. The authored packs live in
 * `tools/lore/packs_town_station.mjs` (en+zh, Yule-Cordier register).
 *
 * Writes:
 *   - site records             → content/tables/events/site.json   (merged by id)
 *   - followup records         → content/tables/events/followups_town_station.json
 *   - story sections           → content/story/<city>/en.md + zh.md (idempotent)
 *   - matrix doc               → docs/61_CITY_DEEPENING_MATRIX.md
 *
 * Run `node tools/lore/story.mjs build` afterwards to compile i18n, and
 * `node tools/lore/build_cities.mjs` to wire the sites into city records
 * (build_cities emits `sites: [ev-<id>-a]` for town/station tiers).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { PACKS } from "./packs_town_station.mjs";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const SITE_PATH = join(ROOT, "content/tables/events/site.json");
const OUT_PATH = join(ROOT, "content/tables/events/followups_town_station.json");
const MATRIX_PATH = join(ROOT, "docs/61_CITY_DEEPENING_MATRIX.md");
const STORY_DIR = join(ROOT, "content/story");

const siteKey = (city, suffix) => `ev.${city}.a.${suffix}`;
const fuKey = (city, suffix) => `ev.ev_${city}_a_followup.${suffix}`;
const siteId = (city) => `ev-${city}-a`;
const fuId = (city) => `ev-${city}-a-followup`;

// ----------------------------------------------------------------- story

function appendStory(unit, entries) {
  for (const lang of ["en", "zh"]) {
    const p = join(STORY_DIR, unit, `${lang}.md`);
    if (!existsSync(p)) throw new Error(`missing story unit: ${unit}/${lang}.md`);
    const langIdx = lang === "en" ? 0 : 1;
    let text = readFileSync(p, "utf8");
    // Strip previously generated sections for this unit (idempotent reruns).
    const prefixes = [`ev.${unit}.a.`, `ev.ev_${unit}_a_followup.`];
    const lines = text.split("\n");
    const kept = [];
    let skip = false;
    for (const line of lines) {
      const heading = line.match(/^##\s+(\S+)/)?.[1] ?? "";
      if (heading) skip = prefixes.some((prefix) => heading.startsWith(prefix));
      if (!skip) kept.push(line);
    }
    text = kept.join("\n").replace(/\s+$/, "") + "\n";
    for (const [k, values] of entries) {
      const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const section = new RegExp(`(## ${escaped}\\n\\n)[\\s\\S]*?(?=\\n## |$)`);
      if (section.test(text)) {
        text = text.replace(section, (_m, head) => `${head}${values[langIdx]}\n`);
      } else {
        text += `\n## ${k}\n\n${values[langIdx]}\n`;
      }
    }
    writeFileSync(p, text.replace(/\n{3,}/g, "\n\n"));
  }
}

// --------------------------------------------------------------- records

function buildRecords() {
  const site = JSON.parse(readFileSync(SITE_PATH, "utf8"));
  const byId = new Map(site.records.map((r) => [r.id, r]));
  const records = [];
  const storyByCity = new Map();
  const matrix = [];

  for (const pack of PACKS) {
    const sid = siteId(pack.city);
    const fid = fuId(pack.city);
    const siteChoices = pack.site.choices.map((c, i) => ({
      label: siteKey(pack.city, `choice.${i + 1}`),
      resultText: `ev.ev_${pack.city}_a.choice_${i + 1}_result`,
      effects: pack.siteEffects[i],
    }));
    const fuChoices = pack.followup.choices.map((c, i) => ({
      label: fuKey(pack.city, `choice_${i + 1}`),
      resultText: fuKey(pack.city, `choice_${i + 1}_result`),
      effects: pack.followupEffects[i],
    }));

    byId.set(sid, {
      id: sid,
      kind: "site",
      title: siteKey(pack.city, "title"),
      when: { cities: [pack.city] },
      scene: pack.scene,
      body: siteKey(pack.city, "body"),
      once: true,
      choices: siteChoices,
      lore: pack.lore,
    });
    records.push({
      id: fid,
      kind: "consequence",
      title: fuKey(pack.city, "title"),
      when: { cities: [pack.city] },
      body: fuKey(pack.city, "body"),
      once: true,
      choices: fuChoices,
      lore: pack.lore,
    });

    const entries = [];
    entries.push([siteKey(pack.city, "title"), pack.site.title]);
    entries.push([siteKey(pack.city, "body"), pack.site.body]);
    for (let i = 0; i < 3; i++) {
      entries.push([siteChoices[i].label, pack.site.choices[i]]);
      entries.push([siteChoices[i].resultText, pack.site.results[i]]);
    }
    entries.push([fuKey(pack.city, "title"), pack.followup.title]);
    entries.push([fuKey(pack.city, "body"), pack.followup.body]);
    for (let i = 0; i < 3; i++) {
      entries.push([fuChoices[i].label, pack.followup.choices[i]]);
      entries.push([fuChoices[i].resultText, pack.followup.results[i]]);
    }
    const list = storyByCity.get(pack.city) ?? [];
    list.push(...entries);
    storyByCity.set(pack.city, list);

    const resultTypes = [...new Set(pack.siteEffects.concat(pack.followupEffects).flat().map((e) => e.op))].join("/");
    matrix.push({
      city: pack.city,
      zh: pack.zhName,
      site: sid,
      followup: fid,
      tier: pack.tier,
      resultTypes,
    });
  }

  site.records = [...byId.values()];
  writeFileSync(SITE_PATH, JSON.stringify(site, null, 2) + "\n");
  writeFileSync(OUT_PATH, JSON.stringify({ contentVersion: 1, table: "events", records }, null, 2) + "\n");
  for (const [city, entries] of storyByCity) appendStory(city, entries);
  return { matrix };
}

// ---------------------------------------------------------------- matrix

function writeMatrix(matrix) {
  const lines = [
    "# 61 Town/Station 探索点深化接线矩阵",
    "",
    "本表由 `tools/lore/build_town_station_sites.mjs` 生成。每座只有入口文本的 `town` / `station` 节点获得一个 standing 探索点，其前两个选择 `queue_event` 进入多轮 followup；第三个选择即时反馈。",
    "",
    "| 城市 | 层级 | 探索点 | 后续事件 | 结果类型 |",
    "|---|---|---|---|---|",
  ];
  for (const row of matrix) {
    lines.push(
      `| ${row.zh} \`${row.city}\` | ${row.tier} | \`${row.site}\` | \`${row.followup}\` | ${row.resultTypes} |`,
    );
  }
  lines.push(
    "",
    "验收：每城 site 选择 0/1 `queue_event` 指向有效 consequence followup；中英文 key 由 **G34** 与主校验器检查；运行时回归见 `tests/smoke_town_station_followups.gd`。",
    "",
  );
  writeFileSync(MATRIX_PATH, lines.join("\n"));
}

// ------------------------------------------------------------------ run

// TARGETS integrity: every pack must have both a site and a followup, and
// choices 0/1 of the site must queue the followup (choice 2 stays instant).
for (const pack of PACKS) {
  if (!pack.site || !pack.followup) throw new Error(`${pack.city}: pack missing site/followup`);
  for (const i of [0, 1]) {
    const effects = pack.siteEffects[i];
    if (!effects.some((e) => e.op === "queue_event" && e.value === fuId(pack.city))) {
      throw new Error(`${pack.city}: site choice ${i} must queue ${fuId(pack.city)}`);
    }
  }
  if (pack.siteEffects[2].some((e) => e.op === "queue_event")) {
    throw new Error(`${pack.city}: site choice 2 must be instant (no queue_event)`);
  }
}

const { matrix } = buildRecords();
writeMatrix(matrix);
console.log(`town/station sites: ${PACKS.length} packs, site.json merged, ${matrix.length} followups → ${OUT_PATH}`);
