#!/usr/bin/env node
/* Generate full-matrix bilingual outcomes for every journey gate node. */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JS = path.join(ROOT, "js");

function loadFQ() {
  const window = { FQ: {} };
  const ctx = { window, FQ: window.FQ, console };
  vm.createContext(ctx);
  const preload = "var FQ = window.FQ;\n";
  for (const f of ["data-tarot.js", "data-hexagrams.js", "data-misc.js", "data-lore.js", "data-journey.js"]) {
    vm.runInContext(preload + fs.readFileSync(path.join(JS, f), "utf8"), ctx);
    ctx.FQ = ctx.window.FQ;
  }
  return ctx.window.FQ;
}

const FQ = loadFQ();
const ELEM_EN = { "火": "fire", "土": "earth", "风": "air", "水": "water" };
const JB = ["sheng", "xiao", "yin"];

/* Expand lots to ≥16 with stable ids if needed */
function ensureLots() {
  const base = FQ.LOTS.slice();
  const extras = [
    { id: 6, g: "上吉", gEn: "Great", zh: "灯火照归途，旧约有回音。", en: "Lamps light the road home; an old promise answers." },
    { id: 7, g: "中吉", gEn: "Good", zh: "市声如潮起，一物换一物。", en: "Market tide rises; one good trades for another." },
    { id: 8, g: "中平", gEn: "Even", zh: "茶凉再续水，话未说完。", en: "Tea cools; pour again — the tale is unfinished." },
    { id: 9, g: "小吉", gEn: "Fair", zh: "鞋底磨薄一层，路识你半分。", en: "Soles wear thin; the road learns your step." },
    { id: 10, g: "上上", gEn: "Supreme", zh: "驿铃先到，喜讯后至。", en: "Bell before the news; joy follows the ring." },
    { id: 11, g: "中吉", gEn: "Good", zh: "陌生人口授一条岔路。", en: "A stranger's mouth names a side path." },
    { id: 12, g: "中平", gEn: "Even", zh: "雨停在檐上，心事停在唇边。", en: "Rain pauses on the eave; a thought pauses on the lip." },
    { id: 13, g: "小吉", gEn: "Fair", zh: "旧符重贴，护佑未散。", en: "An old charm re-pasted; blessing still holds." },
    { id: 14, g: "下下", gEn: "Testing", zh: "夜影贴墙走，宜合伴同行。", en: "Night-shadows hug walls — walk with company." },
    { id: 15, g: "上吉", gEn: "Great", zh: "远帆入港，信物可换粮。", en: "Far sails enter harbor; a token buys grain." }
  ];
  const lots = base.map((l, i) => Object.assign({ id: i }, l));
  while (lots.length < 16) lots.push(extras[lots.length - base.length] || extras[0]);
  return lots.slice(0, Math.max(16, lots.length));
}
const LOTS = ensureLots();

const TOKENS = ["lampoil", "astrolabe", "paiza", "mazucharm"];
const GOODS = ["silk", "spice", "glass", "jade", "rhubarb"];

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pick(arr, h) { return arr[h % arr.length]; }

function loreBits(region) {
  const L = (FQ.LORE_REGION && FQ.LORE_REGION[region]) || {};
  return {
    zh: L.zh || region, en: L.en || region,
    noteZh: (L.notesZh || L.zhDesc || "").slice(0, 48),
    noteEn: (L.notesEn || L.enDesc || "").slice(0, 90)
  };
}

function valenceFrom(key, type) {
  const h = hash(key);
  if (type.startsWith("tarot")) {
    const id = +key.split(":")[1];
    if ([16, 15, 13, 12].includes(id)) return "bad";
    if ([19, 17, 21, 3, 1].includes(id)) return "good";
    if (id <= 9) return h % 3 === 0 ? "good" : "even";
    return h % 3 === 0 ? "bad" : "even";
  }
  if (type === "lot") {
    const lot = LOTS.find(l => "lot:" + l.id === key) || LOTS[0];
    if (lot.g === "下下") return "bad";
    if (lot.g.startsWith("上")) return "good";
    return "even";
  }
  if (type === "jiaobei") {
    const parts = key.split(":")[1].split("-");
    const score = parts.filter(x => x === "sheng").length - parts.filter(x => x === "yin").length;
    if (score >= 2) return "good";
    if (score <= -1) return "bad";
    return "even";
  }
  if (type === "coinYang") {
    const ys = (key.split(":")[1].match(/Y/g) || []).length;
    if (ys >= 3) return "good";
    if (ys <= 1) return "bad";
    return "even";
  }
  if (type.startsWith("dice")) {
    const [, pi, el] = key.split(":");
    const p = +pi;
    if ([5, 0, 3].includes(p) && el !== "water") return "good";
    if ([6, 4, 9].includes(p)) return "bad";
    return h % 3 === 0 ? "good" : h % 3 === 1 ? "bad" : "even";
  }
  if (type === "ichingYang" || type === "meihua") {
    const n = +key.split(":")[1];
    if ([1, 11, 14, 19, 42, 55].includes(n)) return "good";
    if ([23, 29, 47, 12, 6, 36].includes(n)) return "bad";
    return n % 3 === 0 ? "good" : n % 3 === 1 ? "even" : "bad";
  }
  if (type === "dreamChoice") {
    return h % 3 === 0 ? "good" : h % 3 === 1 ? "even" : "bad";
  }
  return "even";
}

function fxFor(val, node, key) {
  const h = hash(node.id + "|" + key);
  const civ = node.region;
  const fx = [];
  if (val === "good") {
    const roll = h % 7;
    if (roll === 0) fx.push({ op: "coins", v: 1 + (h % 3) });
    if (roll === 1) fx.push({ op: "favor", civ, v: 1 });
    if (roll === 2) fx.push({ op: "token", v: pick(TOKENS, h) });
    if (roll === 3) fx.push({ op: "goods", id: pick(GOODS, h), v: 1 });
    if (roll === 4) fx.push({ op: "hp", v: 1 }, { op: "coins", v: 1 });
    if (roll === 5) fx.push({ op: "story", v: civ + "_tale_" + (h % 8) });
    if (roll === 6) fx.push({ op: "quest", v: node.id + "_q" + (h % 4), act: "accept" });
    if (h % 11 === 0) fx.push({ op: "path", v: node.id + "_secret" });
    if (h % 13 === 0) fx.push({ op: "cfavor", who: h % 2 ? "tebrizi" : "lin", v: 1 });
  } else if (val === "bad") {
    const roll = h % 6;
    if (roll === 0) fx.push({ op: "hp", v: -1 }, { op: "coins", v: -1 - (h % 2) });
    if (roll === 1) fx.push({ op: "coins", v: -2 }, { op: "lose", kind: "goods" });
    if (roll === 2) fx.push({ op: "hp", v: -1 }, { op: "days", v: 1 });
    if (roll === 3) fx.push({ op: "lose", kind: "token" }, { op: "coins", v: -1 });
    if (roll === 4) fx.push({ op: "days", v: 1 + (h % 2) }, { op: "favor", civ, v: -1 });
    if (roll === 5) fx.push({ op: "hp", v: -2 }, { op: "story", v: civ + "_warn_" + (h % 5) });
  } else {
    const roll = h % 5;
    if (roll === 0) fx.push({ op: "story", v: civ + "_murmur_" + (h % 8) });
    if (roll === 1) fx.push({ op: "days", v: 0 }, { op: "favorLocal", v: 0 }); // flavor-only marker filtered later
    if (roll === 2) fx.push({ op: "coins", v: h % 2 ? 1 : -1 });
    if (roll === 3) fx.push({ op: "cfavor", who: h % 2 ? "tebrizi" : "lin", v: 1 });
    if (roll === 4) fx.push({ op: "quest", v: node.id + "_q" + (h % 4), act: h % 2 ? "accept" : "complete" });
  }
  return fx.filter(op => !(op.op === "days" && op.v === 0) && !(op.op === "favorLocal" && op.v === 0));
}

const STORY = {
  good: {
    zh: [
      "市集为你让出半步，一份薄礼落到掌心。",
      "有人记住你的口音，愿把消息换给你。",
      "护佑像薄纱，轻轻罩住今夜的路。",
      "岔路口多出一道脚印——那是新路的邀请。",
      "旅伴眼中有光，关系又近了一寸。"
    ],
    en: [
      "The bazaar yields a half-step; a small gift finds your palm.",
      "Someone keeps your accent and offers news in trade.",
      "A thin blessing settles over tonight's road.",
      "Extra footprints at the fork — an invitation to a new path.",
      "A companion's eyes brighten; the bond deepens a little."
    ]
  },
  even: {
    zh: [
      "茶肆里多听半句闲话，世界宽了一指。",
      "风从旧墙缝里钻出，像谁在讲从前。",
      "你把所见写进行囊，未得未失。",
      "礼仪走完，命运不急不缓地点头。",
      "路上多一个名字，日记多一行。"
    ],
    en: [
      "Half a rumor in the teahouse widens the world by a finger.",
      "Wind slips an old wall-crack — someone telling yesterday.",
      "You pack what you saw; nothing gained, nothing lost.",
      "Rites finish; fate nods at an even pace.",
      "One more name on the road; one more line in the journal."
    ]
  },
  bad: {
    zh: [
      "巷口有人夺路，盘缠与气息都短了一截。",
      "夜色像手，摸走袋中一物。",
      "脚程被雨打湿，明日须多歇一日。",
      "关吏多问三句，护佑薄了些。",
      "你听见警告的故事——血与沙的代价。"
    ],
    en: [
      "At the alley mouth someone cuts you short — coin and breath both.",
      "Night's hand lifts one thing from your bag.",
      "Rain soaks the day's march; rest costs tomorrow.",
      "The gate clerk asks thrice; blessing thins a little.",
      "You hear a warning tale — the price of blood and sand."
    ]
  }
};

function omenFor(type, key, node) {
  if (type.startsWith("tarot")) {
    const id = +key.split(":")[1];
    const c = FQ.TAROT[id];
    return {
      omenZh: `「${c.zh}」· ${c.upZh}`,
      omenEn: `"${c.en}" — ${c.upEn}`
    };
  }
  if (type === "ichingYang" || type === "meihua") {
    const n = +key.split(":")[1];
    const h = FQ.HEXAGRAMS[n - 1];
    return {
      omenZh: `得「${h.zh}」：${h.mZh}`,
      omenEn: `${h.en}: ${h.mEn}`
    };
  }
  if (type.startsWith("dice")) {
    const [, pi, el] = key.split(":");
    const p = FQ.DICE_PLANETS[+pi] || FQ.DICE_PLANETS[0];
    const elZh = Object.keys(ELEM_EN).find(k => ELEM_EN[k] === el) || "火";
    return {
      omenZh: `${p.sym}${p.zh}落于${elZh}象：${p.kZh}`,
      omenEn: `${p.sym} ${p.en} in ${el}: ${p.kEn}`
    };
  }
  if (type === "lot") {
    const lot = LOTS.find(l => "lot:" + l.id === key) || LOTS[0];
    return { omenZh: `签曰「${lot.g}」：${lot.zh}`, omenEn: `Lot "${lot.gEn}": ${lot.en}` };
  }
  if (type === "jiaobei") {
    const seq = key.split(":")[1];
    const map = { sheng: "圣", xiao: "笑", yin: "阴" };
    const mapEn = { sheng: "Sheng", xiao: "Xiao", yin: "Yin" };
    const parts = seq.split("-");
    return {
      omenZh: `三掷得 ${parts.map(p => map[p]).join("·")}。天妃以连掷作答。`,
      omenEn: `Triple cast: ${parts.map(p => mapEn[p]).join("·")}. Mazu answers in sequence.`
    };
  }
  if (type === "coinYang") {
    const seq = key.split(":")[1];
    const y = (seq.match(/Y/g) || []).length;
    return {
      omenZh: `四掷得阳 ${y}、阴 ${4 - y}。铜声未散，数已成象。`,
      omenEn: `Four tosses: ${y} yang, ${4 - y} yin. The bronze still rings.`
    };
  }
  if (type === "dreamChoice") {
    const i = +key.split(":")[1];
    const dreams = [
      ["飞越雪峰", "Flying the snow peaks"], ["井中星斗", "Stars in a well"],
      ["燃烧的桥", "A burning bridge"], ["无字天书", "A sky-book without words"],
      ["驼铃成雨", "Camel-bells as rain"], ["镜中故人", "An old friend in glass"],
      ["沉船灯火", "Lamps of a sunken ship"], ["白鹰落腕", "A white hawk on the wrist"],
      ["沙中城门", "A city gate in sand"], ["潮退露路", "Tide leaves a road"],
      ["鼓楼三通", "Three drum-tower beats"], ["纸马夜奔", "Paper horses at night"],
      ["盐船低语", "Salt-boats whispering"], ["玉碎又圆", "Jade breaks, then rounds"],
      ["无名祭石", "A nameless offering-stone"], ["归帆先到", "The home-sail arrives first"]
    ];
    const d = dreams[i % 16];
    return { omenZh: `梦境示象：${d[0]}。`, omenEn: `The dream shows: ${d[1]}.` };
  }
  return { omenZh: "征兆已显。", omenEn: "The omen is clear." };
}

function storyFor(val, node, key, lore) {
  const h = hash(node.id + key + val);
  const lineZh = pick(STORY[val].zh, h);
  const lineEn = pick(STORY[val].en, h);
  const flavorZh = lore.noteZh ? lore.noteZh.slice(0, 28) : "";
  const flavorEn = lore.noteEn ? lore.noteEn.slice(0, 50) : "";
  return {
    storyZh: `在${node.zh}，${lineZh}${flavorZh ? "——此地：" + flavorZh + "…" : ""}`,
    storyEn: `At ${node.en}, ${lineEn}${flavorEn ? " — here: " + flavorEn + "…" : ""}`
  };
}

function keysFor(type) {
  if (type === "tarotAny" || type === "tarotLow") return FQ.TAROT.map(c => "tarot:" + c.id);
  if (type === "ichingYang" || type === "meihua") return FQ.HEXAGRAMS.map(h => "hex:" + h.n);
  if (type.startsWith("dice")) {
    const keys = [];
    FQ.DICE_PLANETS.forEach((p, pi) => {
      ["火", "土", "风", "水"].forEach(el => keys.push("dice:" + pi + ":" + ELEM_EN[el]));
    });
    return keys;
  }
  if (type === "lot") return LOTS.map(l => "lot:" + l.id);
  if (type === "jiaobei") {
    const keys = [];
    for (const a of JB) for (const b of JB) for (const c of JB) keys.push("jiaobei:" + a + "-" + b + "-" + c);
    return keys;
  }
  if (type === "coinYang") {
    const keys = [];
    for (let i = 0; i < 16; i++) {
      let s = "";
      for (let b = 0; b < 4; b++) s += (i >> b) & 1 ? "Y" : "N";
      keys.push("coin:" + s);
    }
    return keys;
  }
  if (type === "dreamChoice") return Array.from({ length: 16 }, (_, i) => "dream:" + i);
  return [];
}

function buildNode(node) {
  const lore = loreBits(node.region);
  const table = {};
  for (const key of keysFor(node.gate.type)) {
    const val = valenceFrom(key, node.gate.type);
    const omen = omenFor(node.gate.type, key, node);
    const story = storyFor(val, node, key, lore);
    table[key] = {
      omenZh: omen.omenZh,
      omenEn: omen.omenEn,
      storyZh: story.storyZh,
      storyEn: story.storyEn,
      fx: fxFor(val, node, key)
    };
  }
  return table;
}

function emitFile(name, nodes, tables) {
  let out = `/* Auto-generated outcome matrix — ${name}. Do not hand-edit bulk; regenerate via scripts/gen-outcomes.mjs */\n`;
  out += "window.FQ = window.FQ || {};\nFQ.OUTCOMES = FQ.OUTCOMES || {};\n";
  for (const n of nodes) {
    const t = tables[n.id];
    out += `FQ.OUTCOMES[${JSON.stringify(n.id)}] = ${JSON.stringify(t)};\n`;
  }
  const dir = path.join(JS, "outcomes");
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, name + ".js");
  fs.writeFileSync(fp, out);
  console.log("wrote", fp, "nodes", nodes.length, "bytes", out.length);
}

/* also write expanded lots patch snippet info */
function main() {
  const byRegion = { chr: [], isl: [], con: [], mazu: [] };
  const tables = {};
  for (const ch of FQ.CHAPTERS) {
    for (const n of ch.nodes) {
      if (!n.gate || n.gate.type === "case") continue;
      tables[n.id] = buildNode(n);
      (byRegion[n.region] || byRegion.isl).push(n);
    }
  }
  emitFile("marco-chr", byRegion.chr, tables);
  emitFile("marco-isl", byRegion.isl, tables);
  emitFile("marco-con", byRegion.con, tables);
  emitFile("marco-mazu", byRegion.mazu, tables);

  /* lots expansion file for runtime */
  const lotsJs = `/* Expanded lot cylinder (≥16) for outcome keys */\nwindow.FQ = window.FQ || {};\nFQ.LOTS = ${JSON.stringify(LOTS, null, 2)};\n`;
  fs.writeFileSync(path.join(JS, "outcomes", "lots-expanded.js"), lotsJs);
  console.log("nodes total", Object.keys(tables).length);
  let min = Infinity;
  for (const id of Object.keys(tables)) min = Math.min(min, Object.keys(tables[id]).length);
  console.log("min keys per node", min);
}

main();
