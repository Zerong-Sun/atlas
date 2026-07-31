#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const EVENT_PATH = join(ROOT, "content/tables/events/mentor_12.json");
const STORY = join(ROOT, "content/story");

const MENTORS = {
  balc: ["巴里黑", "Balc", "蓝宝石商路上的老抄写员", "the old copyist of the lapis road"],
  cascar: ["喀什噶尔", "Cascar", "山口驿站的领路人", "the guide at the mountain relay"],
  cotan: ["于阗", "Cotan", "玉河边的守井人", "the keeper of the jade-river well"],
  lop: ["罗卜", "Lop", "沙海边的听风人", "the listener who reads the desert wind"],
  samarcanda: ["撒马尔罕", "Samarcanda", "蓝砖学舍的老学生", "the old student of the blue-tiled college"],
  chandu: ["上都", "Chandu", "草场边的宫廷驯马人", "the court horse-master by the meadow"],
};

const key = (city, suffix) => `ev.${city}.mentor_closure.${suffix}`;
const records = [];
const stories = new Map();
for (const [city, [zh, en, mentorZh, mentorEn]] of Object.entries(MENTORS)) {
  const id = `ev-${city}-mentor`;
  records.push({
    id,
    kind: "mentor",
    title: key(city, "title"),
    when: { cities: [city] },
    body: key(city, "body"),
    once: true,
    choices: [
      { label: key(city, "choice_1"), resultText: key(city, "choice_1_result"), effects: [{ op: "flag", value: `fl-${city}-mentor-met`, reason: `${city}-mentor-met` }] },
      { label: key(city, "choice_2"), resultText: key(city, "choice_2_result"), effects: [{ op: "days", value: 1, reason: `${city}-mentor-lesson` }, { op: "flag", value: `fl-${city}-mentor-met`, reason: `${city}-mentor-lesson` }] },
      { label: key(city, "choice_3"), resultText: key(city, "choice_3_result"), effects: [{ op: "flag", value: `fl-${city}-mentor-passed`, reason: `${city}-mentor-passed` }] },
    ],
    lore: { origin: "authored" },
  });
  stories.set(city, [
    [key(city, "title"), [`The Guide of ${en}`, `${zh}的引路人`]],
    [key(city, "body"), [
      `Before you leave ${en}, ${mentorEn} asks what you have learned from ${en}. The lesson is not a spell or a bargain; it is a way of noticing which detail will matter after the road turns.`,
      `离开${zh}之前，${mentorZh}问你从这里看出了什么。这个教诲不是法术，也不是交易；它只是教你留意道路转弯之后真正有用的细节。`,
    ]],
    [key(city, "choice_1"), ["Ask what the road will demand", "问这条路将要求你付出什么"]],
    [key(city, "choice_1_result"), [
      `The guide names one risk plainly. You leave ${en} with a question that can be acted upon.`,
      `引路人直说出一种风险。你带着一个可以实际应对的问题离开${zh}。`,
    ]],
    [key(city, "choice_2"), ["Stay for a day and listen to the whole account", "留下 一日，听完这段完整的讲述"]],
    [key(city, "choice_2_result"), [
      `A day is spent, but the guide's account gives shape to the next stage of your journey.`,
      `你用一日换来一段完整的讲述，下一阶段的旅程因此有了轮廓。`,
    ]],
    [key(city, "choice_3"), ["Thank the guide and keep moving", "谢过引路人，继续上路"]],
    [key(city, "choice_3_result"), [
      `You keep the meeting brief. The road remains open, and the guide's warning stays in your book.`,
      `你把会面保持得很简短。道路仍然敞开，引路人的提醒留在你的行纪里。`,
    ]],
  ]);
}

function appendStory(city, entries) {
  for (const lang of ["en", "zh"]) {
    const p = join(STORY, city, `${lang}.md`);
    let text = readFileSync(p, "utf8").replace(/\s+$/, "") + "\n";
    for (const [heading, values] of entries) {
      if (new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m").test(text)) continue;
      text += `\n## ${heading}\n\n${values[lang === "en" ? 0 : 1]}\n`;
    }
    writeFileSync(p, text.replace(/\n{3,}/g, "\n\n"));
  }
}

const cityFiles = {
  balc: "content/tables/cities/central_asia.json",
  cascar: "content/tables/cities/central_asia.json",
  cotan: "content/tables/cities/central_asia.json",
  lop: "content/tables/cities/central_asia.json",
  samarcanda: "content/tables/cities/central_asia.json",
  chandu: "content/tables/cities/steppe.json",
};
const docs = existsSync(EVENT_PATH) ? JSON.parse(readFileSync(EVENT_PATH, "utf8")) : { contentVersion: 1, table: "events", records: [] };
const byId = new Map(docs.records.map((r) => [r.id, r]));
for (const record of records) byId.set(record.id, record);
writeFileSync(EVENT_PATH, JSON.stringify({ contentVersion: 1, table: "events", records: [...byId.values()] }, null, 2) + "\n");

for (const [city, file] of Object.entries(cityFiles)) {
  const p = join(ROOT, file);
  let text = readFileSync(p, "utf8");
  const mentorEvent = `ev-${city}-mentor`;
  if (!text.includes(`"mentorEvent": "${mentorEvent}"`)) {
    const mentor = `"mentor": "npc-${city}-${city === "lop" ? "guide" : "mentor"}"`;
    const at = text.indexOf(mentor);
    if (at < 0) throw new Error(`missing mentor field for ${city}`);
    const end = text.indexOf("\n", at);
    text = text.slice(0, end + 1) + `      "mentorEvent": "${mentorEvent}",\n` + text.slice(end + 1);
    writeFileSync(p, text);
  }
  appendStory(city, stories.get(city));
}

console.log(`12-city mentor events generated: ${records.length}`);
