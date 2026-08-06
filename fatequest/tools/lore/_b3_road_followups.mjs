#!/usr/bin/env node
// One-off B3 migration: attach queue_event followups to memorable road
// encounters (fadlan-01/19/23/25/29/30/32/35) and file their bilingual text.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const ROAD = join(ROOT, "content/tables/events/road.json");
const EN = join(ROOT, "content/i18n/en.json");
const ZH = join(ROOT, "content/i18n/zh.json");

const road = JSON.parse(readFileSync(ROAD, "utf8"));
const en = JSON.parse(readFileSync(EN, "utf8"));
const zh = JSON.parse(readFileSync(ZH, "utf8"));

// ------------------------------------------------------------------ patches
// event id -> choice indices that should queue the followup
const PATCHES = {
  "ev-road-fadlan-01": [0, 1],
  "ev-road-fadlan-19": [0],
  "ev-road-fadlan-23": [0],
  "ev-road-fadlan-25": [0, 1],
  "ev-road-fadlan-29": [0],
  "ev-road-fadlan-30": [0, 1],
  "ev-road-fadlan-32": [0, 1],
  "ev-road-fadlan-35": [0, 1],
};

for (const rec of road.records) {
  const idx = PATCHES[rec.id];
  if (!idx) continue;
  for (const i of idx) {
    const ch = rec.choices[i];
    if (!ch) throw new Error(`${rec.id} has no choice ${i}`);
    const q = { op: "queue_event", value: `${rec.id}-followup`, reason: `${rec.id}-followup` };
    if (!ch.effects) ch.effects = [];
    if (!ch.effects.some((e) => e.op === "queue_event")) ch.effects.push(q);
  }
}

// ------------------------------------------------------------------- i18n
const TEXT = {
  "ev.ev_road_fadlan_01_followup.title": {
    en: "The Far Bank of the Jayhun",
    zh: "药浑对岸",
  },
  "ev.ev_road_fadlan_01_followup.body": {
    en: "The far bank receives the caravan without mishap, and the ice road that held seventeen spans is already creaking at the edges as the thaw begins. The drovers say the river gives back what it takes, and this winter it has taken nothing.",
    zh: "商队平安登上对岸，那曾厚十七拃的冰道已在解冻的边缘吱吱作响。驱者说，河吞了什么总要还什么，今冬它什么也没吞。",
  },
  "ev.ev_road_fadlan_01_followup.choice_1": {
    en: "Mark the crossing on your map while the ice still holds",
    zh: "趁冰未消，将渡口标上舆图",
  },
  "ev.ev_road_fadlan_01_followup.choice_1_result": {
    en: "You mark the crossing while the ice still holds. The way you came is set down in your book, and a small turn of fortune favours you.",
    zh: "趁冰未消，你把这处渡口记入行纪，来路自此有据。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_01_followup.choice_2": {
    en: "Press on to the first market while the road is firm",
    zh: "趁路尚坚，赶往第一处市集",
  },
  "ev.ev_road_fadlan_01_followup.choice_2_result": {
    en: "You press on while the ice road is still firm, and reach the first market with a day to spare.",
    zh: "趁冰路尚坚你加紧赶路，比预计早一日抵达第一处市集。",
  },
  "ev.ev_road_fadlan_19_followup.title": {
    en: "Return from the Mist",
    zh: "雾中归来",
  },
  "ev.ev_road_fadlan_19_followup.body": {
    en: "A week later the fur merchants come back out of the mist, rope-weary, and lay their pelts beside the same blazed tree. Nothing on their goods-lines was taken; the dark took nothing but their fear. A man who keeps the line always comes back, they say — it is the man who lets go who is lost.",
    zh: "七日后，裘商自雾中归来，绳磨腕疲，将皮货照旧堆在那棵刻了记号的树下。货线上的东西一样未少；暗地只带走了他们的恐惧。他们说，握紧绳索的人总能回来——松手的人才永远留在雾里。",
  },
  "ev.ev_road_fadlan_19_followup.choice_1": {
    en: "Write down what they tell you of the mist",
    zh: "记下他们所说的雾中之事",
  },
  "ev.ev_road_fadlan_19_followup.choice_1_result": {
    en: "You set their testimony in your travel book while it is still fresh. A small turn of fortune favours you.",
    zh: "趁记忆犹新，你把这番证词记入行纪。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_19_followup.choice_2": {
    en: "Ask what the mist smells like, to remember it by",
    zh: "问那雾闻起来是什么味道，好记在心间",
  },
  "ev.ev_road_fadlan_19_followup.choice_2_result": {
    en: "They tell you the mist smells of wet iron and standing water, and you set the answer down beside the rest.",
    zh: "他们说雾里有湿铁与死水的味道，你把它一并记下。",
  },
  "ev.ev_road_fadlan_23_followup.title": {
    en: "The Debt of the Stolen Horses",
    zh: "失马之偿",
  },
  "ev.ev_road_fadlan_23_followup.body": {
    en: "By midday the headman has followed the tracks to the reeds and back. Two horses are returned whole; the third the thief confesses to having sold, and the headman pays its price from his own purse as a debt of honour. That night the Ghuzz feast, and your name is spoken at the fire.",
    zh: "正午前，头人循蹄印追到芦苇荡又折回。两匹马完好带回；第三匹，盗者供认已卖出，头人从自己的钱袋里偿了价，说这是名誉之债。当夜突厥人聚宴，你的名字在火边被提起。",
  },
  "ev.ev_road_fadlan_23_followup.choice_1": {
    en: "Share the feast and hear the settlement told in full",
    zh: "同赴宴席，听完这场了断",
  },
  "ev.ev_road_fadlan_23_followup.choice_1_result": {
    en: "You stay for the feast and hear how the settlement was reached. The camp speaks of you as a man who keeps watch.",
    zh: "你留下赴宴，听罢这场了断的来龙去脉。帐中人提起你，说你是肯守望相助的人。",
  },
  "ev.ev_road_fadlan_23_followup.choice_2": {
    en: "Take the road before the quarrel can turn again",
    zh: "趁纷争未再起，先上大路",
  },
  "ev.ev_road_fadlan_23_followup.choice_2_result": {
    en: "You take the road while the camp is still at feast. A small turn of fortune favours you.",
    zh: "趁帐中尚在宴饮，你离营上道。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_25_followup.title": {
    en: "The Wolves Let You Go",
    zh: "狼群放行",
  },
  "ev.ev_road_fadlan_25_followup.body": {
    en: "The pack trails the caravan until the sky turns grey, then melts into the timber line one by one. The drovers count every beast and every man twice over and find none missing. One wolf, a great pale brute, stands at the tree edge a long moment before it turns and is gone.",
    zh: "狼群跟到天边发白，便一头一头隐入林线。驱者把商队的牲口和人点了两遍，一个不少。一头苍灰的大狼在树缘站了许久，才转身消失在雪里。",
  },
  "ev.ev_road_fadlan_25_followup.choice_1": {
    en: "Keep the guard posted one more day, out of caution",
    zh: "为稳妥起见，再守一宿哨",
  },
  "ev.ev_road_fadlan_25_followup.choice_1_result": {
    en: "You keep the guard posted another day. The wolves do not come back.",
    zh: "你多守了一日哨。狼群没有再回来。",
  },
  "ev.ev_road_fadlan_25_followup.choice_2": {
    en: "Read the morning tracks and set them down in your book",
    zh: "细读晨间蹄印，记入行纪",
  },
  "ev.ev_road_fadlan_25_followup.choice_2_result": {
    en: "The tracks show the pack was led by one old wolf, hunting alone ahead of the rest. A small turn of fortune favours you.",
    zh: "蹄印显示领路的是头老公狼，独行于狼群之前。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_29_followup.title": {
    en: "The Account of the Coffle",
    zh: "囚列之记",
  },
  "ev.ev_road_fadlan_29_followup.body": {
    en: "That night, by the fire, you set down what you saw: the bound wrists, the bare feet on the frozen track, the number of the coffle as near as you could count it. The page is a small thing against such a chain, but it is a page that will outlast the guard's answers.",
    zh: "当夜在火边，你写下所见：缚着的手腕、冻土上赤着的脚、囚列的人数，尽你所数记下。一页纸对那样一条锁链而言是小东西，但这页纸会比守卫的回答活得更久。",
  },
  "ev.ev_road_fadlan_29_followup.choice_1": {
    en: "Keep the account and add the road that carried it",
    zh: "留下这页记录，并记下它来时的路",
  },
  "ev.ev_road_fadlan_29_followup.choice_1_result": {
    en: "You keep the account, and the road that carried it is marked in your book. A small turn of fortune favours you.",
    zh: "你留下了记录，它来时的路也标上了行纪。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_29_followup.choice_2": {
    en: "Fold the page away and say nothing more of it",
    zh: "折起这页纸，不再提起",
  },
  "ev.ev_road_fadlan_29_followup.choice_2_result": {
    en: "You fold the page away. What was written is written, and a small turn of fortune favours you.",
    zh: "你折起那页纸。写下的终归写下了，时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_30_followup.title": {
    en: "Morning After the Storm",
    zh: "雷雨次日",
  },
  "ev.ev_road_fadlan_30_followup.body": {
    en: "The storm walks north by the third watch. In the grey light the low grass steams, and the caravan counts itself whole — one tent torn, no man lost. The horses stand quiet, ears pinned, as if they too are listening for the thunder to come back.",
    zh: "三更时分，雷雨北去。灰白天光里，低草蒸腾着水汽，商队清点人马——一顶帐布撕裂，无人折损。马儿安静地立着，耳朵向后抿，仿佛也在听雷声会不会回来。",
  },
  "ev.ev_road_fadlan_30_followup.choice_1": {
    en: "Wait a day for the ground to firm before moving on",
    zh: "等一日，待地面干硬再行",
  },
  "ev.ev_road_fadlan_30_followup.choice_1_result": {
    en: "You wait a day while the grass dries. The march is slower after, but the road holds.",
    zh: "你等了一日，等草叶干透。此后路虽慢些，却稳妥。",
  },
  "ev.ev_road_fadlan_30_followup.choice_2": {
    en: "Move at once while the roads are empty of travellers",
    zh: "趁道上无人，即刻启程",
  },
  "ev.ev_road_fadlan_30_followup.choice_2_result": {
    en: "You move at once, and the wet road is yours alone. A small turn of fortune favours you.",
    zh: "你即刻上路，湿路上只有你这一队人马。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_32_followup.title": {
    en: "A Watched Crossing",
    zh: "有守的渡口",
  },
  "ev.ev_road_fadlan_32_followup.body": {
    en: "The ford lies behind you, settled however it was settled — paid in coin, or won by the longer road upstream. The king's riders fall back, and the way opens ahead: watched, but passable. The caravan elders reckon the winter raids will cost more than any toll.",
    zh: "渡口已在身后，那笔费用无论如何了结——或付了钱，或绕了上游更远的路。王使的骑从退去，前路放开：有人看守，却可通行。商队长老们盘算，今冬的劫掠会比任何过费都贵。",
  },
  "ev.ev_road_fadlan_32_followup.choice_1": {
    en: "Camp early and cross the king's land openly at dawn",
    zh: "早歇一程，天明堂堂正正过境",
  },
  "ev.ev_road_fadlan_32_followup.choice_1_result": {
    en: "You camp early and cross the king's land at dawn with the caravan's papers in order. The fee is small; the passage is clean.",
    zh: "你早早歇下，天明后随商队持印信堂堂过境。花费不多，一路顺遂。",
  },
  "ev.ev_road_fadlan_32_followup.choice_2": {
    en: "Hurry on while the road is clear of riders",
    zh: "趁道上无骑，加紧赶路",
  },
  "ev.ev_road_fadlan_32_followup.choice_2_result": {
    en: "You hurry on, and the watched road empties before you. A small turn of fortune favours you.",
    zh: "你加紧赶路，有人看守的道路在你面前空了出来。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_35_followup.title": {
    en: "The River Keeps Its Counsel",
    zh: "冰河不语",
  },
  "ev.ev_road_fadlan_35_followup.body": {
    en: "The ice does not speak again for a mile. The guide walks the line himself, then waves the caravan across. On the far bank you look back: the crack has closed under new snow, and the river is as still as it was before the boom, keeping its counsel.",
    zh: "此后一里，冰不再作响。向导亲自踏过线，挥手让商队过河。上得对岸回望：裂口已被新雪合拢，河又像轰鸣之前那样安静，守着自己的秘密。",
  },
  "ev.ev_road_fadlan_35_followup.choice_1": {
    en: "Set the moment down before it fades",
    zh: "趁景象未散，把这一刻记下",
  },
  "ev.ev_road_fadlan_35_followup.choice_1_result": {
    en: "You set down the boom, the silence, the single file across the ice. A small turn of fortune favours you.",
    zh: "你写下那声轰鸣、那阵寂静、那列单行过冰的影子。时运待你，比先前好了几分。",
  },
  "ev.ev_road_fadlan_35_followup.choice_2": {
    en: "Press on and let the cold river keep its secret",
    zh: "赶路要紧，让冷河守住它的秘密",
  },
  "ev.ev_road_fadlan_35_followup.choice_2_result": {
    en: "You press on. The river keeps its secret, and you spend a day on the road before the next halt.",
    zh: "你继续赶路。河守住了它的秘密，你在路上又耗去一日。",
  },
};

for (const [key, { en: ev, zh: zv }] of Object.entries(TEXT)) {
  if (en[key] !== undefined && en[key] !== ev)
    throw new Error(`EN key ${key} already set differently: ${JSON.stringify(en[key])}`);
  if (zh[key] !== undefined && zh[key] !== zv)
    throw new Error(`ZH key ${key} already set differently: ${JSON.stringify(zh[key])}`);
  en[key] = ev;
  zh[key] = zv;
}

writeFileSync(ROAD, JSON.stringify(road, null, 2) + "\n");
writeFileSync(EN, JSON.stringify(Object.fromEntries(Object.keys(en).sort().map((k) => [k, en[k]])), null, 2) + "\n");
writeFileSync(ZH, JSON.stringify(Object.fromEntries(Object.keys(zh).sort().map((k) => [k, zh[k]])), null, 2) + "\n");

console.log("road.json patched:", Object.keys(PATCHES).length, "events;",
  Object.values(PATCHES).flat().length, "choices;", Object.keys(TEXT).length, "text keys.");
