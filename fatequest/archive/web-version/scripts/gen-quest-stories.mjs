#!/usr/bin/env node
/* Build FQ.STORIES + FQ.QUESTS catalogs from outcome matrices + lore. */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JS = path.join(ROOT, "js");
const OUT = path.join(JS, "data-quests-stories.js");

function loadFQ() {
  const window = { FQ: {} };
  const ctx = { window, FQ: window.FQ, console };
  vm.createContext(ctx);
  const pre = "var FQ = window.FQ;\n";
  for (const f of [
    "data-tarot.js", "data-hexagrams.js", "data-misc.js", "data-lore.js",
    "data-marco-lore.js", "data-journey.js", "data-journey-extra.js",
    "outcomes/lots-expanded.js", "outcomes/outcome-keys.js"
  ]) {
    const p = path.join(JS, f);
    if (!fs.existsSync(p)) continue;
    vm.runInContext(pre + fs.readFileSync(p, "utf8"), ctx);
    ctx.FQ = ctx.window.FQ;
  }
  for (const f of fs.readdirSync(path.join(JS, "outcomes")).filter(x => x.startsWith("marco-") && x.endsWith(".js"))) {
    vm.runInContext(fs.readFileSync(path.join(JS, "outcomes", f), "utf8"), ctx);
    ctx.FQ = ctx.window.FQ;
  }
  return ctx.window.FQ;
}

const FQ = loadFQ();

function findNode(id) {
  for (const ch of FQ.CHAPTERS || []) {
    const n = (ch.nodes || []).find(x => x.id === id);
    if (n) return n;
  }
  return null;
}

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function clip(s, n) {
  if (!s) return "";
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1) + "…";
}

const CIV = {
  chr: { zh: "基督之境", en: "Christendom" },
  isl: { zh: "新月之境", en: "Crescent Lands" },
  con: { zh: "儒道之境", en: "Confucian Realm" },
  mazu: { zh: "妈祖之海", en: "Mazu's Sea" }
};

const KIND = {
  tale: { zh: "传说", en: "Tale", ic: "📖" },
  murmur: { zh: "巷语", en: "Murmur", ic: "🗣️" },
  warn: { zh: "警诫", en: "Warning", ic: "⚠️" }
};

const TALE_HOOKS = [
  { zh: "茶肆角落有人低声说起", en: "In a teahouse corner someone murmurs of" },
  { zh: "驿站墙上墨迹未干，写着", en: "Ink still wet on the post-house wall tells of" },
  { zh: "商队夜里围火，讲到", en: "By the caravan fire they speak of" },
  { zh: "老人把念珠拨了一圈，才肯说", en: "An elder counts his beads once before telling of" }
];

const QUEST_VERBS = [
  { zh: "打听", en: "Inquire about" },
  { zh: "护送", en: "Escort" },
  { zh: "寻回", en: "Recover" },
  { zh: "核对", en: "Verify" },
  { zh: "转交", en: "Deliver" },
  { zh: "记下", en: "Record" },
  { zh: "求证", en: "Confirm" },
  { zh: "安顿", en: "Settle" }
];

const QUEST_OBJS = {
  chr: [
    { zh: "圣墓灯油的下落", en: "the fate of Holy Sepulchre oil" },
    { zh: "一份拉丁文书的抄本", en: "a Latin letter's fair copy" },
    { zh: "里亚尔托来的口信", en: "a Rialto verbal charge" },
    { zh: "十字军港口的关防印", en: "a crusader-port customs seal" }
  ],
  isl: [
    { zh: "驿栈三日旧例", en: "the three-day caravanserai custom" },
    { zh: "一袋胡椒的兑率", en: "the rate on a sack of pepper" },
    { zh: "星盘刻度是否走偏", en: "whether an astrolabe's scale drifts" },
    { zh: "朝觐路上的水井名", en: "the name of a well on the hajj road" }
  ],
  con: [
    { zh: "金牌所开的站赤", en: "the yam stations a paiza opens" },
    { zh: "一签诗的真伪", en: "whether a lot-verse is genuine" },
    { zh: "大黄与盐引的账", en: "accounts of rhubarb and salt certificates" },
    { zh: "鼓楼三通的时刻", en: "the hour of three drum-tower beats" }
  ],
  mazu: [
    { zh: "天妃殿前的筊答", en: "the moon-block answer before Tianfei" },
    { zh: "一艘缝合船的船号", en: "the name of a sewn dhow's hull" },
    { zh: "放灯纸船的名单", en: "the list for paper lantern-boats" },
    { zh: "季风转向的口诀", en: "the rhyme for monsoon turn" }
  ]
};

function lorePool(L) {
  const keys = ["notesZh", "zhDesc", "goodsZh", "faithZh", "foodZh", "dressZh", "customZh", "pricesZh"];
  const keysEn = ["notesEn", "enDesc", "goodsEn", "faithEn", "foodEn", "dressEn", "customEn", "pricesEn"];
  return {
    zh: keys.map(k => L[k]).filter(Boolean),
    en: keysEn.map(k => L[k]).filter(Boolean)
  };
}

function pickSlice(text, h, len) {
  if (!text) return "";
  const start = text.length <= len ? 0 : h % Math.max(1, text.length - len);
  return clip(text.slice(start), len);
}

function storyEntry(id) {
  const m = id.match(/^(chr|isl|con|mazu)_(tale|murmur|warn)_(\d+)$/);
  if (!m) {
    return {
      id, kind: "tale", civ: "chr", ic: "📜",
      zh: id, en: id,
      bodyZh: "路上听来的一则旧闻，细节已模糊。",
      bodyEn: "A scrap of road-talk; the details have blurred."
    };
  }
  const [, civ, kind, num] = m;
  const L = (FQ.LORE_REGION && FQ.LORE_REGION[civ]) || {};
  const pool = lorePool(L);
  const h = hash(id);
  const hook = TALE_HOOKS[h % TALE_HOOKS.length];
  const k = KIND[kind];
  const zhSrc = pool.zh[h % Math.max(1, pool.zh.length)] || "";
  const enSrc = pool.en[h % Math.max(1, pool.en.length)] || "";
  const flavorZh = pickSlice(zhSrc, h, 90);
  const flavorEn = pickSlice(enSrc, (h >>> 3), 140);
  const titleBits = {
    tale: { zh: `${CIV[civ].zh}·${k.zh}之${(+num) + 1}`, en: `${CIV[civ].en} · ${k.en} ${(+num) + 1}` },
    murmur: { zh: `${CIV[civ].zh}巷语·${(+num) + 1}`, en: `${CIV[civ].en} murmur ${(+num) + 1}` },
    warn: { zh: `${CIV[civ].zh}警诫·${(+num) + 1}`, en: `${CIV[civ].en} warning ${(+num) + 1}` }
  };
  const lead = {
    tale: {
      zh: `${hook.zh}${CIV[civ].zh}的旧事（其${(+num) + 1}）。`,
      en: `${hook.en} old matters in ${CIV[civ].en} (${(+num) + 1}).`
    },
    murmur: {
      zh: `第${(+num) + 1}则巷语：路过的人只用半句话，便把${CIV[civ].zh}的气氛递到你耳边。`,
      en: `Murmur ${(+num) + 1}: a passer-by needs half a sentence to hand you the air of ${CIV[civ].en}.`
    },
    warn: {
      zh: `警诫其${(+num) + 1}：有人压低声音——在${CIV[civ].zh}，疏忽会换血与沙的代价。`,
      en: `Warning ${(+num) + 1}: someone lowers their voice — in ${CIV[civ].en}, carelessness buys blood and sand.`
    }
  };
  return {
    id, kind, civ, ic: k.ic,
    zh: titleBits[kind].zh,
    en: titleBits[kind].en,
    bodyZh: `${lead[kind].zh}${flavorZh ? " " + flavorZh : ""}`,
    bodyEn: `${lead[kind].en}${flavorEn ? " " + flavorEn : ""}`
  };
}

function questEntry(id) {
  const m = id.match(/^(.+)_q(\d+)$/);
  const nodeId = m ? m[1] : id;
  const qi = m ? +m[2] : 0;
  const n = findNode(nodeId);
  const civ = (n && n.region) || "chr";
  const placeZh = n ? n.zh : nodeId;
  const placeEn = n ? n.en : nodeId;
  const h = hash(id);
  const verb = QUEST_VERBS[(h + qi) % QUEST_VERBS.length];
  const objs = QUEST_OBJS[civ] || QUEST_OBJS.chr;
  const obj = objs[(h + qi * 3) % objs.length];
  const factsZh = n && n.factsZh ? clip(n.factsZh, 64) : "";
  const factsEn = n && n.factsEn ? clip(n.factsEn, 110) : "";
  return {
    id, at: nodeId, civ, ic: "❗",
    zh: `${placeZh}·${verb.zh}${obj.zh}`,
    en: `${placeEn}: ${verb.en} ${obj.en}`,
    bodyZh: `在${placeZh}受托：${verb.zh}${obj.zh}。${factsZh}`,
    bodyEn: `At ${placeEn} you are charged to ${verb.en.toLowerCase()} ${obj.en}. ${factsEn}`.trim()
  };
}

const storyIds = new Set();
const questIds = new Set();
for (const table of Object.values(FQ.OUTCOMES || {})) {
  for (const e of Object.values(table)) {
    for (const op of e.fx || []) {
      if (op.op === "story" && op.v) storyIds.add(op.v);
      if (op.op === "quest" && op.v) questIds.add(op.v);
    }
  }
}

const STORIES = {};
[...storyIds].sort().forEach(id => { STORIES[id] = storyEntry(id); });
const QUESTS = {};
[...questIds].sort().forEach(id => { QUESTS[id] = questEntry(id); });

const header = `/* Auto-generated quest/story catalog — regenerate via scripts/gen-quest-stories.mjs */
window.FQ = window.FQ || {};
FQ.STORIES = `;

const mid = `;
FQ.QUESTS = `;

const footer = `;
FQ.storyOf = function (id) {
  return (FQ.STORIES && FQ.STORIES[id]) || {
    id, ic: "📜", kind: "tale", civ: "chr",
    zh: id, en: id,
    bodyZh: "路上听来的一则旧闻。", bodyEn: "A scrap of road-talk."
  };
};
FQ.questOf = function (id) {
  return (FQ.QUESTS && FQ.QUESTS[id]) || {
    id, ic: "❗", at: "", civ: "chr",
    zh: id, en: id,
    bodyZh: "一桩未写明的嘱托。", bodyEn: "An unnamed charge."
  };
};
`;

fs.writeFileSync(OUT, header + JSON.stringify(STORIES, null, 2) + mid + JSON.stringify(QUESTS, null, 2) + footer);
console.log(`Wrote ${OUT}`);
console.log(`stories=${Object.keys(STORIES).length} quests=${Object.keys(QUESTS).length}`);
