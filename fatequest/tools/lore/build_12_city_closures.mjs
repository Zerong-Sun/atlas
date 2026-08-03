#!/usr/bin/env node
/**
 * Build the first narrative closure pass for the twelve metropolis nodes.
 *
 * Existing content remains the source of truth. This script only adds the
 * missing authored consequence records, attaches them to entry choices, and
 * appends bilingual authoring keys. It is intentionally idempotent so a
 * content editor can rerun it after resolving a merge.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const CITY_DIR = join(ROOT, "content/tables/cities");
const EVENT_DIR = join(ROOT, "content/tables/events");
const STORY_DIR = join(ROOT, "content/story");
const MATRIX_PATH = join(ROOT, "docs/12_CITY_CLOSURE_MATRIX.md");
const CONSEQUENCE_PATH = join(EVENT_DIR, "consequence_12.json");
const cleanedStories = new Set();

const CITY_INFO = {
  balc: { zh: "巴里黑", en: "Balc", focusZh: "废墟与蓝宝石商路", focusEn: "ruins and the lapis road" },
  cascar: { zh: "喀什噶尔", en: "Cascar", focusZh: "山口与驿路", focusEn: "the mountain pass and its relay road" },
  cotan: { zh: "于阗", en: "Cotan", focusZh: "玉河与绿洲", focusEn: "the jade river and the oasis" },
  lop: { zh: "罗卜", en: "Lop", focusZh: "沙海与旧井", focusEn: "the sand sea and its old wells" },
  samarcanda: { zh: "撒马尔罕", en: "Samarcanda", focusZh: "学舍与商队", focusEn: "the colleges and the caravans" },
  cambaluc: { zh: "大都（汗八里）", en: "Cambaluc", focusZh: "宫门与驿站", focusEn: "the palace gate and the relay stations" },
  kinsay: { zh: "行在", en: "Kinsay", focusZh: "水巷与粮船", focusEn: "the canals and the grain boats" },
  zayton: { zh: "刺桐", en: "Zayton", focusZh: "海港与番舶", focusEn: "the harbour and the foreign ships" },
  chandu: { zh: "上都", en: "Chandu", focusZh: "行宫与草场", focusEn: "the summer palace and the meadow" },
  baldacum: { zh: "报达", en: "Baldacum", focusZh: "两河与旧宫", focusEn: "the two rivers and the old palace" },
  ormus: { zh: "忽鲁谟斯", en: "Ormus", focusZh: "海峡与珍珠", focusEn: "the strait and the pearl boats" },
  tauris: { zh: "大不里士", en: "Tauris", focusZh: "市集（巴扎）与雪山水道", focusEn: "the bazaar and the snow-fed qanats" },
};

const METROPOLISES = Object.keys(CITY_INFO);

// A site choice is not a closure merely because it has a resultText key. The
// foreign-merchants choice is an authored information lead: it must open a
// second page in the same interaction so the player can ask what the rumour
// means and decide what to do with it.
const SITE_FOLLOWUPS = {
  "ev-tauris-a:0": {
    city: "tauris",
    id: "ev-tauris-a-merchants-followup",
    record: {
      id: "ev-tauris-a-merchants-followup",
      kind: "consequence",
      title: "ev.ev_tauris_a_merchants_followup.title",
      when: { cities: ["tauris"] },
      body: "ev.ev_tauris_a_merchants_followup.body",
      once: true,
      choices: [
        {
          label: "ev.ev_tauris_a_merchants_followup.choice_1",
          resultText: "ev.ev_tauris_a_merchants_followup.choice_1_result",
          effects: [
            { op: "reveal_map", value: "ctesiphon", reason: "merchant-named-the-southern-road" },
            { op: "codex", value: "cx-tauris", reason: "recorded-the-road-warning" },
          ],
        },
        {
          label: "ev.ev_tauris_a_merchants_followup.choice_2",
          resultText: "ev.ev_tauris_a_merchants_followup.choice_2_result",
          effects: [
            { op: "reputation", value: 1, scope: "city", id: "tauris", reason: "shared-the-road-warning" },
            { op: "codex", value: "cx-tauris", reason: "shared-the-road-warning" },
          ],
        },
        {
          label: "ev.ev_tauris_a_merchants_followup.choice_3",
          resultText: "ev.ev_tauris_a_merchants_followup.choice_3_result",
          effects: [
            { op: "days", value: 1, reason: "waited-for-the-merchants-ledger" },
            { op: "sticker", value: "st-tauris-road-sense", reason: "waited-for-the-merchants-ledger" },
          ],
        },
      ],
      lore: { origin: "authored" },
    },
    texts: {
      title: [
        "Tauris: The Roads Behind the Rumour",
        "大不里士：传闻背后的道路",
      ],
      body: [
        "The foreign merchants do not merely name places. One points south toward Ctesiphon, another warns that the road to Baudas follows a different rhythm of tolls and water. Their answers are useful only if you press them for the detail that belongs to your own journey.",
        "外国商人并不只是报出几个地名。有人指向南方的泰西封，有人提醒说，通往报达的道路有另一套关卡与水源节奏。只有追问与你自己的旅程有关的细节，这些回答才真正有用。",
      ],
      choices: [
        [
          "Ask which southern road is safest after the next levy",
          "追问下一道关卡之后，哪条南行道路最稳妥",
        ],
        [
          "Share the warning with the caravan brokers",
          "把这条警告告诉商队经纪人",
        ],
        [
          "Wait for the merchant who keeps the water ledger",
          "等那位记着水源账本的商人回来",
        ],
      ],
      results: [
        [
          "The merchant marks the southern road in charcoal: Ctesiphon is now more than a name on a distant map.",
          "商人用炭笔标出了南行道路：泰西封不再只是远地图上的一个名字。",
        ],
        [
          "The brokers lower their voices and add your warning to the day's road talk; a useful name now travels with you.",
          "经纪人压低声音，把你的警告添进当天的路上传闻；一个有用的名字如今随你同行。",
        ],
        [
          "The water ledger gives you one more day's measure between wells. It costs time, but the next departure is no longer blind.",
          "水源账本让你多得到一日井站之间的尺度。你付出了时间，却不再盲目启程。",
        ],
      ],
    },
  },
};

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const walkJson = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walkJson(p) : (name.endsWith(".json") ? [p] : []);
});
const slug = (id) => id.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
const q = (s) => JSON.stringify(s);

function eventKey(id, suffix) {
  return `ev.${slug(id)}.${suffix}`;
}

function feedbackText(city, event, index) {
  const info = CITY_INFO[city];
  const focus = info.focusEn.replace(/^the\s+/i, "");
  const focusZh = info.focusZh;
  const labels = [
    [`The choice leaves a mark: the people of ${info.en} now remember you among the ${focus}.`, `这一选择留下了痕迹：${info.zh}的人们已把你记在${focusZh}之间。`],
    [`The matter is not finished, but the next road is clear; your name travels ahead with the ${focus}.`, `事情尚未完结，但下一段路已经显出：你的名字随${focusZh}先一步传开。`],
    [`You close the matter for now. The sign you gained will still guide your next action in ${info.en}.`, `你暂且把此事收下。得到的线索仍会指向你在${info.zh}的下一步行动。`],
  ];
  return labels[index % labels.length];
}

function branchTexts(city, branch, resolution) {
  const info = CITY_INFO[city];
  const focusEn = info.focusEn;
  const focusZh = info.focusZh;
  const branchName = branch === "a" ? ["The Mark at the Gate", "门上的印记"] : ["The Road Behind the Answer", "回答之后的路"];
  const resolutionName = resolution === "a" ? ["A Name Worth Carrying", "值得带走的名字"] : ["The Road Opens", "道路由此打开"];
  if (branch === "a") {
    return {
      title: [`${info.en}: ${branchName[0]}`, `${info.zh}：${branchName[1]}`],
      body: [
        `The first answer does not end at the gate. A clerk, porter, or traveller draws you aside and asks what you intend to carry away from ${info.en}. Beyond the question lies ${info.focusEn}; choose what you will make of the sign.`,
        `第一个回答并没有在城门处结束。吏员、脚夫或旅人把你引到一旁，问你打算从${info.zh}带走什么。问题背后正是${info.focusZh}；你须决定如何对待这道征兆。`,
      ],
      choices: [
        ["Keep the name and ask who can vouch for it", "记下这个名字，追问谁能为它作保"],
        ["Thank the stranger and keep your own counsel", "谢过来人，把自己的打算收在心里"],
      ],
    };
  }
  return {
    title: [`${info.en}: ${branchName[0]}`, `${info.zh}：${branchName[1]}`],
    body: [
      `The answer sends a rumour along the road. Before the day is out, someone who knows ${info.en} by its working life offers a second account of ${focusEn}. It is less grand than a traveller's tale, and more useful.`,
      `回答把一条传闻送上了道路。日落之前，一个熟悉${info.zh}日常生计的人又讲起${focusZh}。这说法不如游记宏大，却更适合带在身上。`,
    ],
    choices: [
      ["Follow the practical advice", "照着这条实用的建议走"],
      ["Leave the rumour with the teller", "把这条传闻留给讲述它的人"],
    ],
  };
}

function resolutionTexts(city, branch) {
  const info = CITY_INFO[city];
  const focus = branch === "a" ? ["the name at the gate", "城门上的名字"] : ["the road rumour", "道路上的传闻"];
  return {
    title: [`${info.en}: A Consequence Takes Shape`, `${info.zh}：后果显出形状`],
    body: [
      `By choosing to carry ${focus[0]}, you turn a passing exchange into a small obligation. It will not decide the whole journey, but it gives the next person a reason to open a door.`,
      `你选择带走${focus[1]}，便把一次擦肩而过的交谈变成了一桩小小的承诺。它不会替你决定整段旅程，却会让下一个人有理由为你开门。`,
    ],
    choices: [
      ["Make the introduction before nightfall", "在天黑前把这份引荐送到"],
      ["Keep the sign in your travel book", "把这道征兆收进自己的行纪"],
    ],
  };
}

function resultKey(eventId, index) {
  return eventKey(eventId, `choice_${index + 1}_result`);
}

function appendStory(unit, entries) {
  const paths = [join(STORY_DIR, unit, "en.md"), join(STORY_DIR, unit, "zh.md")];
  for (const p of paths) {
    if (!existsSync(p)) throw new Error(`missing story unit: ${relative(ROOT, p)}`);
    const lang = p.endsWith("/en.md") ? 0 : 1;
    let text = readFileSync(p, "utf8");
    // A failed first generation left only the Zayton fixed-name records
    // orphaned. Remove those generated sections before rebuilding them from
    // the actual queue targets; authored source sections are untouched.
    if (!cleanedStories.has(p)) {
      const prefixes = [
        "ev.ev_zayton_consequence_a", "ev.ev_zayton_consequence_b",
        "ev.ev_zayton_ledger_consequence", "ev.ev_zayton_watch_consequence",
      ];
      const lines = text.split("\n");
      const kept = [];
      let skip = false;
      for (const line of lines) {
        const heading = line.match(/^##\s+(\S+)/)?.[1] ?? "";
        if (heading) skip = prefixes.some((prefix) => heading.startsWith(prefix));
        if (!skip) kept.push(line);
      }
      text = kept.join("\n");
      cleanedStories.add(p);
    }
    text = text.replace(/\s+$/, "") + "\n";
    for (const [key, values] of entries) {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const section = new RegExp(`(## ${escaped}\\n\\n)[\\s\\S]*?(?=\\n## |$)`);
      if (section.test(text)) {
        text = text.replace(section, (_match, head) => `${head}${values[lang]}\n`);
      } else {
        text += `\n## ${key}\n\n${values[lang]}\n`;
      }
    }
    writeFileSync(p, text.replace(/\n{3,}/g, "\n\n"));
  }
}

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

function recordSpan(text, id) {
  const marker = `"id": ${q(id)}`;
  const idPos = text.indexOf(marker);
  if (idPos < 0) return null;
  const start = text.lastIndexOf("{", idPos);
  const end = findMatching(text, start, "{", "}");
  return { start, end, idPos };
}

function patchExistingEvents(eventsById, allEvents, citiesById) {
  const fileTexts = new Map();
  for (const p of walkJson(EVENT_DIR)) fileTexts.set(p, readFileSync(p, "utf8"));
  const insertions = new Map();
  const matrix = [];
  const queueTargets = new Map();

  const addInsertion = (p, pos, value) => {
    const list = insertions.get(p) ?? [];
    list.push({ pos, value });
    insertions.set(p, list);
  };

  for (const city of METROPOLISES) {
    const info = CITY_INFO[city];
    const entry = eventsById.get(`ev-${city}-entry`);
    if (!entry) throw new Error(`missing entry event for ${city}`);
    const branchIds = [];
    for (let i = 0; i < 2; i++) {
      const existing = (entry.choices?.[i]?.effects ?? []).find((e) => e.op === "queue_event");
      branchIds.push(existing?.value ?? `ev-${city}-consequence-${i === 0 ? "a" : "b"}`);
    }

    const targets = new Set([entry.id, ...(eventsById.get(`ev-${city}-entry`)?.when?.cities ?? [])]);
    const cityRec = citiesById.get(city);
    const cityTable = allEvents.filter((e) => e.when?.cities?.includes(city));
    for (const e of cityTable) if (["entry", "site", "mentor", "consequence"].includes(e.kind)) targets.add(e.id);
    const storyEntries = [];

    for (const eventId of targets) {
      const event = eventsById.get(eventId);
      if (!event) continue;
      const p = [...fileTexts.keys()].find((candidate) => readJson(candidate).records?.some((r) => r.id === eventId));
      if (!p) throw new Error(`missing event file for ${eventId}`);
      const span = recordSpan(fileTexts.get(p), eventId);
      if (!span) throw new Error(`cannot locate event record ${eventId}`);
      for (let i = 0; i < (event.choices ?? []).length; i++) {
        const choice = event.choices[i];
        if (choice.resultText) {
          storyEntries.push([choice.resultText, feedbackText(city, eventId, i)]);
        }
        const followup = SITE_FOLLOWUPS[`${event.id}:${i}`];
        if (followup) {
          const target = followup.id;
          const hasQueue = (choice.effects ?? []).some((e) => e.op === "queue_event" && e.value === target);
          if (!hasQueue) {
            const labelPos = fileTexts.get(p).indexOf(`"label": ${q(choice.label)}`, span.start);
            const effectsPos = fileTexts.get(p).indexOf('"effects": [', labelPos);
            const effectsEnd = findMatching(fileTexts.get(p), effectsPos + '"effects": '.length, "[", "]");
            if (effectsPos < 0 || effectsEnd < 0 || effectsEnd > span.end)
              throw new Error(`cannot locate effects for ${event.id}[${i}]`);
            const text = fileTexts.get(p);
            const indent = (text.slice(text.lastIndexOf("\n", effectsEnd) + 1, effectsEnd).match(/^\s*/)?.[0] ?? "          ") + "  ";
            addInsertion(p, effectsEnd, `,\n${indent}{ "op": "queue_event", "value": ${q(target)}, "reason": "${event.id}-followup" }\n${indent.slice(0, -2)}`);
          }
          queueTargets.set(target, city);
        }
        if (choice.resultText) continue;
        const labelPos = fileTexts.get(p).indexOf(`"label": ${q(choice.label)}`, span.start);
        if (labelPos < 0 || labelPos > span.end) throw new Error(`cannot locate label for ${eventId}[${i}]`);
        const lineEnd = fileTexts.get(p).indexOf("\n", labelPos);
        const line = fileTexts.get(p).slice(fileTexts.get(p).lastIndexOf("\n", labelPos) + 1, lineEnd);
        const indent = line.match(/^\s*/)?.[0] ?? "          ";
        const key = resultKey(eventId, i);
        addInsertion(p, lineEnd + 1, `${indent}"resultText": ${q(key)},\n`);
        storyEntries.push([key, feedbackText(city, eventId, i)]);
      }
    }

    for (let i = 0; i < 2; i++) {
      const event = entry;
      const target = branchIds[i];
      const hasQueue = (event.choices?.[i]?.effects ?? []).some((e) => e.op === "queue_event" && e.value === target);
      if (!hasQueue) {
        const p = [...fileTexts.keys()].find((candidate) => readJson(candidate).records?.some((r) => r.id === entry.id));
        const text = fileTexts.get(p);
        const span = recordSpan(text, entry.id);
        const labelPos = text.indexOf(`"label": ${q(event.choices[i].label)}`, span.start);
        const choiceStart = text.lastIndexOf("{", labelPos);
        const choiceEnd = findMatching(text, choiceStart, "{", "}");
        const effectsPos = text.indexOf('"effects": [', labelPos);
        const effectsEnd = findMatching(text, effectsPos + '"effects": '.length, "[", "]");
        if (effectsPos < 0 || effectsEnd < 0 || effectsEnd > choiceEnd)
          throw new Error(`cannot locate effects for ${entry.id}[${i}]`);
        const indent = (text.slice(text.lastIndexOf("\n", effectsEnd) + 1, effectsEnd).match(/^\s*/)?.[0] ?? "          ") + "  ";
        const reason = `${city}-entry-consequence-${i === 0 ? "a" : "b"}`;
        addInsertion(p, effectsEnd, `,\n${indent}{ "op": "queue_event", "value": ${q(target)}, "reason": ${q(reason)} }\n${indent.slice(0, -2)}`);
      }
      queueTargets.set(target, city);
    }

    matrix.push({ city, name: info.zh, entry: entry.id, mentor: cityRec?.mentorEvent ?? "", branches: branchIds, sites: [...(cityRec?.sites ?? [])] });
    appendStory(city, storyEntries);
  }

  for (const [p, changes] of insertions) {
    let text = fileTexts.get(p);
    for (const change of changes.sort((a, b) => b.pos - a.pos)) text = text.slice(0, change.pos) + change.value + text.slice(change.pos);
    writeFileSync(p, text);
  }
  return { matrix, queueTargets };
}

function buildNewRecords(eventsById, queueTargets) {
  const records = (existsSync(CONSEQUENCE_PATH) ? readJson(CONSEQUENCE_PATH).records : [])
    .filter((r) => !r.id.startsWith("ev-zayton-consequence-a") && !r.id.startsWith("ev-zayton-consequence-b"));
  const byId = new Map(records.map((r) => [r.id, r]));
  const storyByCity = new Map();
  const addStory = (city, key, values) => {
    const list = storyByCity.get(city) ?? [];
    list.push([key, values]);
    storyByCity.set(city, list);
  };

  for (const city of METROPOLISES) {
    for (const branch of ["a", "b"]) {
      const entry = eventsById.get(`ev-${city}-entry`);
      const branchId = (entry?.choices?.[branch === "a" ? 0 : 1]?.effects ?? [])
        .find((e) => e.op === "queue_event")?.value ?? `ev-${city}-consequence-${branch}`;
      const resolutionId = `${branchId}-resolution`;
      const texts = branchTexts(city, branch, branch);
      const resolution = resolutionTexts(city, branch);
      const existingBranch = eventsById.get(branchId);
      if (!byId.has(branchId) && !existingBranch) {
        byId.set(branchId, {
          id: branchId,
          kind: "consequence",
          title: eventKey(branchId, "title"),
          when: { cities: [city] },
          body: eventKey(branchId, "body"),
          once: true,
          choices: [
            { label: eventKey(branchId, "choice_1"), resultText: resultKey(branchId, 0), effects: [{ op: "queue_event", value: resolutionId, reason: `${city}-${branch}-resolution` }] },
            { label: eventKey(branchId, "choice_2"), resultText: resultKey(branchId, 1), effects: [{ op: "flag", value: `fl-${city}-closure-${branch}`, reason: `${city}-${branch}-kept-counsel` }] },
          ],
          lore: { origin: "authored" },
        });
      }
      if (!byId.has(resolutionId)) {
        byId.set(resolutionId, {
          id: resolutionId,
          kind: "consequence",
          title: eventKey(resolutionId, "title"),
          when: { cities: [city] },
          body: eventKey(resolutionId, "body"),
          once: true,
          choices: [
            { label: eventKey(resolutionId, "choice_1"), resultText: resultKey(resolutionId, 0), effects: [{ op: "flag", value: `fl-${city}-closure-${branch}-carried`, reason: `${city}-${branch}-carried-forward` }] },
            { label: eventKey(resolutionId, "choice_2"), resultText: resultKey(resolutionId, 1), effects: [{ op: "days", value: 1, reason: `${city}-${branch}-made-time` }] },
          ],
          lore: { origin: "authored" },
        });
      }
      if (!existingBranch || city !== "zayton") {
        addStory(city, eventKey(branchId, "title"), texts.title);
        addStory(city, eventKey(branchId, "body"), texts.body);
        addStory(city, eventKey(branchId, "choice_1"), texts.choices[0]);
        addStory(city, resultKey(branchId, 0), feedbackText(city, branchId, 0));
        addStory(city, eventKey(branchId, "choice_2"), texts.choices[1]);
        addStory(city, resultKey(branchId, 1), feedbackText(city, branchId, 1));
      }
      addStory(city, eventKey(resolutionId, "title"), resolution.title);
      addStory(city, eventKey(resolutionId, "body"), resolution.body);
      addStory(city, eventKey(resolutionId, "choice_1"), resolution.choices[0]);
      addStory(city, resultKey(resolutionId, 0), feedbackText(city, resolutionId, 0));
      addStory(city, eventKey(resolutionId, "choice_2"), resolution.choices[1]);
      addStory(city, resultKey(resolutionId, 1), feedbackText(city, resolutionId, 1));
      if (existingBranch) {
        // Existing Zayton branches are preserved; their first choice gets the
        // same second page as newly-authored branches.
        const p = [...walkJson(EVENT_DIR)].find((candidate) => readJson(candidate).records?.some((r) => r.id === branchId));
        const text = readFileSync(p, "utf8");
        const span = recordSpan(text, branchId);
        const labelPos = text.indexOf(`"label": ${q(existingBranch.choices[0].label)}`, span.start);
        const effectsPos = text.indexOf('"effects": [', labelPos);
        const effectsEnd = findMatching(text, effectsPos + '"effects": '.length, "[", "]");
        const indent = (text.slice(text.lastIndexOf("\n", effectsEnd) + 1, effectsEnd).match(/^\s*/)?.[0] ?? "          ") + "  ";
        const queued = (existingBranch.choices?.[0]?.effects ?? []).find((e) => e.op === "queue_event");
        let updated = text;
        if (queued && queued.value !== resolutionId) {
          const oldValue = q(queued.value);
          const oldPos = text.indexOf(oldValue, effectsPos);
          updated = text.slice(0, oldPos) + q(resolutionId) + text.slice(oldPos + oldValue.length);
        } else if (!queued) {
          updated = text.slice(0, effectsEnd) + `,\n${indent}{ "op": "queue_event", "value": ${q(resolutionId)}, "reason": "${city}-${branch}-resolution" }\n${indent.slice(0, -2)}` + text.slice(effectsEnd);
        }
        writeFileSync(p, updated);
      }
    }
    const siteFollowup = SITE_FOLLOWUPS["ev-tauris-a:0"];
    if (city === siteFollowup.city) {
      if (!byId.has(siteFollowup.id) && !eventsById.has(siteFollowup.id)) {
        byId.set(siteFollowup.id, siteFollowup.record);
      }
      addStory(city, siteFollowup.record.title, siteFollowup.texts.title);
      addStory(city, siteFollowup.record.body, siteFollowup.texts.body);
      for (let i = 0; i < siteFollowup.texts.choices.length; i++) {
        addStory(city, siteFollowup.record.choices[i].label, siteFollowup.texts.choices[i]);
        addStory(city, siteFollowup.record.choices[i].resultText, siteFollowup.texts.results[i]);
      }
    }
    appendStory(city, storyByCity.get(city) ?? []);
  }
  writeJson(CONSEQUENCE_PATH, { contentVersion: 1, table: "events", records: [...byId.values()] });
}

function writeMatrix(matrix) {
  const lines = [
    "# 十二主城剧情闭环接线矩阵",
    "",
    "本表由 `tools/lore/build_12_city_closures.mjs` 生成，描述当前首批剧情接线。入口事件前两项为重要选择，进入两页后果链；第三项使用即时反馈与状态效果。",
    "",
    "| 城市 | 入口事件 | 导师事件 | 重要分支 A | 重要分支 B | 探索点 |",
    "|---|---|---|---|---|---|",
  ];
  for (const row of matrix) lines.push(`| ${row.name} \`${row.city}\` | \`${row.entry}\` | \`${row.mentor}\` | \`${row.branches[0]}\` → resolution | \`${row.branches[1]}\` → resolution | ${row.sites.map((s) => `\`${s}\``).join("、")} |`);
  lines.push("", "验收：每个入口选择必须出现即时反馈或后续事件；每条重要分支至少包含一个分支页和一个 resolution 页；中英文 key 由主校验器统一检查。", "");
  writeFileSync(MATRIX_PATH, lines.join("\n"));
}

function cleanLegacyCompiledKeys() {
  const legacy = [
    "ev.ev_zayton_consequence_a",
    "ev.ev_zayton_consequence_b",
    "ev.ev_zayton_ledger_consequence",
    "ev.ev_zayton_watch_consequence",
  ];
  for (const lang of ["en", "zh"]) {
    const p = join(ROOT, `content/i18n/${lang}.json`);
    if (!existsSync(p)) continue;
    const data = readJson(p);
    for (const key of Object.keys(data)) {
      const isLegacyBranch = legacy.slice(0, 2).some((prefix) => key === prefix || key.startsWith(`${prefix}.`) || key.startsWith(`${prefix}_`));
      const isLegacyExisting = legacy.slice(2).some((prefix) =>
        (key === prefix || key.startsWith(`${prefix}.`)) && !key.startsWith(`${prefix}_resolution.`));
      if (isLegacyBranch || isLegacyExisting) delete data[key];
    }
    writeJson(p, Object.fromEntries(Object.keys(data).sort().map((key) => [key, data[key]])));
  }
}

const allFiles = walkJson(CITY_DIR);
const cities = allFiles.flatMap((p) => readJson(p).records ?? []);
const events = walkJson(EVENT_DIR).flatMap((p) => readJson(p).records ?? []);
const eventsById = new Map(events.map((e) => [e.id, e]));
const citiesById = new Map(cities.map((c) => [c.id, c]));
for (const city of METROPOLISES) if (cities.find((c) => c.id === city)?.tier !== "metropolis") throw new Error(`${city} is not a metropolis`);
const { matrix, queueTargets } = patchExistingEvents(eventsById, events, citiesById);
buildNewRecords(eventsById, queueTargets);
writeMatrix(matrix);
cleanLegacyCompiledKeys();
console.log(`12-city closure content generated: ${matrix.length} cities, ${METROPOLISES.length * 4} consequence records planned.`);
