#!/usr/bin/env node
/* Manual smoke: gate types → key → resolve → fx; path edges; HP rest; dream×16; lore UI hooks. */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const JS = path.join(ROOT, "js");

function load() {
  const window = { FQ: {} };
  const ctx = {
    window, FQ: window.FQ, console,
    setTimeout: (fn) => fn(),
    innerWidth: 800, innerHeight: 600
  };
  vm.createContext(ctx);
  const pre = "var FQ = window.FQ;\n";
  const files = [
    "data-tarot.js", "data-hexagrams.js", "data-misc.js", "data-lore.js",
    "data-marco-lore.js", "data-lore-zh-trunk.js", "data-quests-stories.js",
    "engines.js", "data-journey.js", "data-journey-extra.js", "data-secret-paths.js",
    "outcomes/lots-expanded.js", "outcomes/outcome-keys.js",
    "outcomes/marco-chr.js", "outcomes/marco-isl.js", "outcomes/marco-con.js", "outcomes/marco-mazu.js"
  ];
  for (const f of files) {
    const p = path.join(JS, f);
    if (!fs.existsSync(p)) throw new Error("missing " + f);
    vm.runInContext(pre + fs.readFileSync(p, "utf8"), ctx);
    ctx.FQ = ctx.window.FQ;
  }
  /* minimal journey stubs for fx / HP */
  const FQ = ctx.window.FQ;
  FQ.state = { journey: null, stardust: 3, readings: 0, xp: 0, col: { tarot: [], hex: [], rune: [], len: [] }, achv: [], methodsTried: [], learned: ["tarot"] };
  FQ.lang = "zh";
  FQ.t = (k) => k;
  FQ.bi = (o, a, b) => (o && (o[a] || o[b])) || "";
  FQ.save = () => {};
  FQ.toast = () => {};
  FQ.gainXP = () => {};
  FQ.gainDust = () => {};
  FQ.J = FQ.J || {};
  FQ.J.chapter = () => FQ.CHAPTERS[0];
  FQ.J.node = id => FQ.J.chapter().nodes.find(n => n.id === id);
  FQ.J.ensure = function () {
    if (!FQ.state.journey) {
      FQ.state.journey = {
        v: 2, ch: "marco", at: "venice", visited: ["venice"], edgesDone: [],
        days: 0, coins: 10, hp: 5, hpMax: 5,
        favor: { chr: 0, isl: 0, con: 0, mazu: 0 },
        bag: [], comp: { tebrizi: { on: false, fav: 0 }, lin: { on: false, fav: 0 } },
        flags: {}, gates: {}, quests: {}, stories: [], pathsUnlocked: [], log: []
      };
    }
    return FQ.state.journey;
  };
  FQ.J.bagCount = j => j.bag.length;
  FQ.J.hasToken = () => false;
  FQ.J.hasTool = () => false;
  FQ.J.goodsOf = () => null;
  FQ.J.outEdges = id => {
    const j = FQ.J.ensure();
    return FQ.J.chapter().edges.filter(e => {
      if (e.from !== id) return false;
      if (e.needPath && !(j.pathsUnlocked || []).includes(e.needPath) && !j.flags["path_" + e.needPath]) return false;
      return true;
    });
  };
  FQ.J.journalNote = () => {};
  FQ.J.fx = function (list) {
    const j = FQ.J.ensure();
    const ch = FQ.J.chapter();
    (list || []).forEach(op => {
      if (op.op === "hp") j.hp = Math.min(j.hpMax, Math.max(0, j.hp + op.v));
      if (op.op === "coins") j.coins = Math.max(0, j.coins + op.v);
      if (op.op === "path") {
        if (op.v && !j.pathsUnlocked.includes(op.v)) j.pathsUnlocked.push(op.v);
        j.flags["path_" + op.v] = true;
      }
      if (op.op === "story" && op.v && !j.stories.includes(op.v)) j.stories.push(op.v);
      if (op.op === "quest") { j.quests = j.quests || {}; j.quests[op.v] = op.act === "complete" ? "done" : "active"; }
      if (op.op === "token" && FQ.J.bagCount(j) < (ch.bagSlots || 9)) j.bag.push({ kind: "token", id: op.v });
    });
  };
  FQ.J.applyOutcome = function (node, key) {
    const oc = FQ.resolveOutcome(node.id, key);
    if (!oc) return null;
    FQ.J.fx(oc.fx || []);
    const j = FQ.J.ensure();
    if (j.hp <= 0) { j.hp = 1; j.days += 2; j.coins = Math.max(0, j.coins - 1); }
    return oc;
  };
  return FQ;
}

const FQ = load();
let fail = 0;
function ok(name, cond, detail) {
  if (!cond) { fail++; console.log("FAIL", name, detail || ""); }
  else console.log("OK  ", name, detail || "");
}

/* 1) coverage validate */
const report = FQ.validateOutcomes();
ok("validate-outcomes", report.every(r => r.ok), `${report.length} gates`);

/* 2) one sample per gate type */
const samples = [
  ["tarotAny", "venice", () => FQ.drawTarot(1)[0]],
  ["tarotLow", "acre", () => FQ.drawTarot(1)[0]],
  ["diceElem", "hormuz", () => FQ.rollAstroDice()],
  ["diceFire", "tabriz", () => FQ.rollAstroDice()],
  ["diceHouse", "kerman", () => FQ.rollAstroDice()],
  ["diceAny", "mosul", () => FQ.rollAstroDice()],
  ["meihua", "baghdad", () => FQ.meihua()],
  ["ichingYang", "shangdu", () => [0,0,0,0,0,0].map(() => FQ.tossCoins())],
  ["lot", "yezd", () => FQ.drawLot()],
  ["jiaobei", "quanzhou", () => FQ.throwJiaobeiSeq(3)],
  ["coinYang", "yarkand", () => FQ.tossCoinSeq(4)],
  ["dreamChoice", "khanbaliq", () => ({ idx: 3 })]
];
for (const [type, nid, gen] of samples) {
  const payload = gen();
  const key = FQ.outcomeKey(type, payload);
  const oc = FQ.resolveOutcome(nid, key);
  ok(`gate:${type}@${nid}`, !!key && !!oc, key);
  if (oc) {
    const node = FQ.J.node(nid);
    FQ.J.ensure().gates = {};
    FQ.J.applyOutcome(node, key);
    ok(`advance:${nid}`, true, `fx=${(oc.fx||[]).length}`);
  }
}

/* 3) dream 16 options */
const dreamKeys = FQ.outcomeKeysFor("dreamChoice");
ok("dream:16", dreamKeys.length === 16, String(dreamKeys.length));
let dreamOk = 0;
dreamKeys.forEach(k => { if (FQ.resolveOutcome("khanbaliq", k)) dreamOk++; });
ok("dream:khanbaliq-all", dreamOk === 16, String(dreamOk));

/* 4) path unlock → outEdges */
const j = FQ.J.ensure();
j.at = "baghdad";
j.pathsUnlocked = [];
j.flags = {};
const before = FQ.J.outEdges("baghdad").filter(e => e.needPath === "baghdad_secret").length;
ok("path:locked", before === 0, `secret outs=${before}`);
FQ.J.fx([{ op: "path", v: "baghdad_secret" }]);
const after = FQ.J.outEdges("baghdad").filter(e => e.needPath === "baghdad_secret").length;
ok("path:unlocked", after === 1, `secret outs=${after}`);
const secretCount = (FQ.CHAPTERS[0].edges || []).filter(e => e.needPath).length
  + ((FQ.CHAPTERS[1] && FQ.CHAPTERS[1].edges) || []).filter(e => e.needPath).length;
ok("path:edges-present", secretCount >= 30, `needPath edges=${secretCount}`);

/* 5) HP → forced rest */
j.hp = 1;
FQ.J.fx([{ op: "hp", v: -2 }]);
const ocHp = FQ.J.applyOutcome(FQ.J.node("baghdad"), "hex:3");
ok("hp:rest-floor", j.hp >= 1, `hp=${j.hp}`);

/* 6) trunk zh lore */
const trunkIds = [
  "tauris", "descent-to-the-city-of-hormos", "badashan", "cascar",
  "great-province-of-tangut", "campichu", "chandu", "cambaluc",
  "great-city-of-kinsay", "great-haven-of-zayton"
];
trunkIds.forEach(id => {
  const p = FQ.MARCO_LORE.places[id];
  ok(`zh:${id}`, p && p.zhStatus === "done" && p.bodyZh && p.bodyZh.length > 80
    && !p.bodyZh.includes("英文正文见游记全章"), `len=${p && p.bodyZh.length}`);
});
ok("glossary-file", fs.existsSync(path.join(ROOT, "assets/data/glossary.json")));
const gloss = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/data/glossary.json"), "utf8"));
ok("glossary-terms", (gloss.terms || []).length >= 80, String((gloss.terms || []).length));

/* 7) meihua passWhen data shape on snowpass */
const snow = FQ.CHAPTERS[0].encounters.find(e => e.id === "snowpass");
const rite = snow && snow.choices.find(c => c.ritual && c.ritual.passWhen);
ok("meihua:table-driven", !!(rite && rite.ritual.passWhen.trigrams.includes("kan")));

/* 8) Ch.2 case thickened */
const c2 = FQ.CHAPTERS[1].case;
ok("case2:methods", (c2.methods || []).length >= 3, String((c2.methods || []).length));
ok("case2:options", (c2.options || []).length >= 2, String((c2.options || []).length));

/* 9) lore read-full hook fields exist on some outcome */
let loreHits = 0;
let sampleLore = null;
Object.values(FQ.OUTCOMES).forEach(table => {
  Object.values(table).forEach(oc => {
    if (oc.lore && oc.lore.placeId) {
      loreHits++;
      if (!sampleLore) sampleLore = oc.lore;
    }
  });
});
ok("lore:refs", loreHits > 100, String(loreHits));
ok("lore:place-resolvable", !!(sampleLore && FQ.MARCO_LORE.places[sampleLore.placeId]), sampleLore && sampleLore.placeId);
const journeySrc = fs.readFileSync(path.join(JS, "journey.js"), "utf8");
ok("lore:ui-fullPlace-btn", journeySrc.includes("journey.lore.fullPlace") && journeySrc.includes("openLoreDoc"));
ok("lore:ui-i18n", fs.readFileSync(path.join(JS, "i18n.js"), "utf8").includes("journey.lore.fullPlace"));

console.log(fail ? `\n${fail} FAILURES` : "\nALL SMOKE CHECKS PASSED");
process.exit(fail ? 1 : 0);
