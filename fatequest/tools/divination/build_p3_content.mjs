#!/usr/bin/env node
/**
 * Build P3 divination content tables from Atlas-shaped data (hand-ported constants).
 * Run: node tools/divination/build_p3_content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const TABLES = path.join(ROOT, "content/tables");
const DIV = path.join(TABLES, "divination");
const I18N_EN = path.join(ROOT, "content/i18n/en.json");
const I18N_ZH = path.join(ROOT, "content/i18n/zh.json");

function writeTable(file, table, records) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    JSON.stringify({ contentVersion: 1, table, records }, null, 2) + "\n",
  );
  console.log("wrote", path.relative(ROOT, file), `(${records.length})`);
}

function resultTexts(prefix, n = 30) {
  return Array.from({ length: n }, (_, i) => ({
    cond: `idx_${i}`,
    key: `${prefix}.result.${String(i).padStart(2, "0")}`,
  }));
}

const UNCERTAINTY_TO_QUESTION = {
  "yes-no": "risk",
  timing: "timing",
  trend: "trade",
  "strategic-positioning": "route",
  "psychological-mirroring": "person",
  "event-narrative": "identity",
  admonition: "risk",
  reflection: "person",
};

const CULTURE = {
  bazi: "east_asia",
  "bazi-relationship": "east_asia",
  tarot: "latin",
  dream: "central_asia",
  iching: "east_asia",
  qimen: "east_asia",
  ziwei: "east_asia",
  liuyao: "east_asia",
  meihua: "east_asia",
  western: "latin",
  vedic: "indian_ocean",
  numerology: "latin",
  runes: "latin",
  geomancy: "islamic",
  lot: "east_asia",
  jiaobei: "east_asia",
  xiangmian: "east_asia",
  palmistry: "indian_ocean",
  fengshui: "east_asia",
  astrodice: "islamic",
  lenormand: "latin",
  oracle: "latin",
  coffee: "islamic",
  scrying: "latin",
};

const ATLAS_META = {
  bazi: {
    causalityModel: "birth-structure",
    uncertaintyMode: "trend",
    evidenceStyle: ["calculated-chart", "classic-text"],
    questionDomain: ["life-structure", "career", "relationship"],
  },
  "bazi-relationship": {
    causalityModel: "birth-structure",
    uncertaintyMode: "trend",
    evidenceStyle: ["calculated-chart"],
    questionDomain: ["relationship"],
  },
  tarot: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "psychological-mirroring",
    evidenceStyle: ["drawn-card"],
    questionDomain: ["relationship", "inner-state", "specific-event"],
  },
  dream: {
    causalityModel: "folk-association",
    uncertaintyMode: "event-narrative",
    evidenceStyle: ["dream-symbol"],
    questionDomain: ["dream", "inner-state"],
  },
  iching: {
    causalityModel: "time-position",
    uncertaintyMode: "strategic-positioning",
    evidenceStyle: ["cast-symbol", "classic-text"],
    questionDomain: ["specific-event", "timing", "career"],
  },
  qimen: {
    causalityModel: "spatial-flow",
    uncertaintyMode: "strategic-positioning",
    evidenceStyle: ["calculated-chart"],
    questionDomain: ["timing", "specific-event", "space"],
  },
  ziwei: {
    causalityModel: "celestial-cycle",
    uncertaintyMode: "trend",
    evidenceStyle: ["calculated-chart"],
    questionDomain: ["life-structure"],
  },
  liuyao: {
    causalityModel: "time-position",
    uncertaintyMode: "timing",
    evidenceStyle: ["cast-symbol"],
    questionDomain: ["specific-event"],
  },
  meihua: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "timing",
    evidenceStyle: ["cast-symbol"],
    questionDomain: ["specific-event"],
  },
  western: {
    causalityModel: "celestial-cycle",
    uncertaintyMode: "trend",
    evidenceStyle: ["calculated-chart"],
    questionDomain: ["life-structure", "career"],
  },
  vedic: {
    causalityModel: "celestial-cycle",
    uncertaintyMode: "timing",
    evidenceStyle: ["calculated-chart"],
    questionDomain: ["life-structure", "timing"],
  },
  numerology: {
    causalityModel: "birth-structure",
    uncertaintyMode: "reflection",
    evidenceStyle: ["calculated-chart"],
    questionDomain: ["inner-state"],
  },
  runes: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "psychological-mirroring",
    evidenceStyle: ["drawn-card"],
    questionDomain: ["inner-state", "specific-event"],
  },
  geomancy: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "yes-no",
    evidenceStyle: ["cast-symbol"],
    questionDomain: ["specific-event"],
  },
  lot: {
    causalityModel: "textual-admonition",
    uncertaintyMode: "admonition",
    evidenceStyle: ["ritual-result"],
    questionDomain: ["specific-event", "daily-guidance"],
  },
  jiaobei: {
    causalityModel: "ritual-confirmation",
    uncertaintyMode: "yes-no",
    evidenceStyle: ["ritual-result"],
    questionDomain: ["specific-event"],
  },
  xiangmian: {
    causalityModel: "folk-association",
    uncertaintyMode: "reflection",
    evidenceStyle: ["observed-sign"],
    questionDomain: ["inner-state"],
  },
  palmistry: {
    causalityModel: "folk-association",
    uncertaintyMode: "reflection",
    evidenceStyle: ["observed-sign"],
    questionDomain: ["inner-state"],
  },
  fengshui: {
    causalityModel: "spatial-flow",
    uncertaintyMode: "strategic-positioning",
    evidenceStyle: ["observed-sign"],
    questionDomain: ["space"],
  },
  astrodice: {
    causalityModel: "celestial-cycle",
    uncertaintyMode: "timing",
    evidenceStyle: ["cast-symbol"],
    questionDomain: ["daily-guidance"],
  },
  lenormand: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "event-narrative",
    evidenceStyle: ["drawn-card"],
    questionDomain: ["specific-event", "relationship"],
  },
  oracle: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "reflection",
    evidenceStyle: ["drawn-card"],
    questionDomain: ["inner-state", "daily-guidance"],
  },
  coffee: {
    causalityModel: "folk-association",
    uncertaintyMode: "event-narrative",
    evidenceStyle: ["observed-sign"],
    questionDomain: ["daily-guidance"],
  },
  scrying: {
    causalityModel: "symbolic-projection",
    uncertaintyMode: "psychological-mirroring",
    evidenceStyle: ["observed-sign"],
    questionDomain: ["inner-state"],
  },
};

const MVP = new Set(["iching", "bazi", "lot", "tarot"]);

const MVP_GAME = {
  iching: {
    learnAt: ["cambaluc", "kinsay", "sachiu"],
    teacher: "npc-cambaluc-mentor",
    inputs: ["question"],
    reads: ["route", "city", "year"],
    outputs: { advice: "route_choice", confidence: 0.72, horizon: "season" },
    effects: [
      { op: "reveal_map", value: "$subject", reason: "iching-read-the-road" },
      { op: "codex", value: "cx-hexagrams", reason: "iching-recorded-the-hexagram" },
    ],
    cost: { coins: 200, time: 0, favor: 0 },
  },
  bazi: {
    learnAt: ["baldacum", "cambaluc", "kinsay"],
    teacher: "npc-baldacum-mentor",
    inputs: ["birthdate"],
    reads: ["self", "retainer", "year"],
    outputs: { advice: "long_term_fit", confidence: 0.65, horizon: "three_years" },
    effects: [
      { op: "reveal_birth", value: 1, reason: "bazi-read-the-pillars" },
      { op: "reveal_map", value: "$subject", reason: "bazi-named-a-season-window" },
      { op: "codex", value: "cx-four-pillars", reason: "bazi-recorded-the-chart" },
    ],
    cost: { coins: 400, time: 1, favor: 0 },
  },
  lot: {
    learnAt: ["zayton", "kinsay", "lop"],
    teacher: "npc-zayton-mentor",
    inputs: ["question"],
    reads: ["route", "city"],
    outputs: { advice: "yes_no_with_caution", confidence: 0.6, horizon: "day" },
    effects: [
      { op: "flag", value: "fl-lot-drawn", reason: "lot-was-drawn" },
      { op: "reveal_map", value: "$subject", reason: "lot-named-the-road" },
    ],
    cost: { coins: 50, time: 0, favor: 0 },
  },
  tarot: {
    learnAt: ["tauris", "ormus"],
    teacher: "npc-tauris-mentor",
    inputs: ["question"],
    reads: ["route", "city", "self"],
    outputs: { advice: "route_choice", confidence: 0.68, horizon: "season" },
    effects: [
      { op: "reveal_map", value: "$subject", reason: "tarot-read-the-fork" },
      { op: "codex", value: "cx-tarot", reason: "tarot-recorded-the-spread" },
    ],
    cost: { coins: 150, time: 0, favor: 0 },
    spreads: [
      "one-card",
      "three-timeline",
      "cross",
      "celtic-cross",
      "relationship-mirror",
      "choice-gate",
      "career-map",
      "money-flow",
      "shadow-dialogue",
    ],
  },
};

const METHOD_IDS = Object.keys(ATLAS_META);

function buildDivinations() {
  const records = METHOD_IDS.map((id) => {
    const meta = ATLAS_META[id];
    const question =
      UNCERTAINTY_TO_QUESTION[meta.uncertaintyMode] ?? "route";
    const mvp = MVP.has(id);
    const base = {
      id,
      name: `div.${id}.name`,
      culture: CULTURE[id] ?? "east_asia",
      mvp,
      learnAt: mvp ? MVP_GAME[id].learnAt : [],
      teacher: mvp ? MVP_GAME[id].teacher : "",
      question,
      inputs: mvp ? MVP_GAME[id].inputs : ["question"],
      reads: mvp ? MVP_GAME[id].reads : ["route"],
      outputs: mvp
        ? MVP_GAME[id].outputs
        : { advice: "codex_only", confidence: 0.5, horizon: "day" },
      effects: mvp
        ? MVP_GAME[id].effects
        : [{ op: "codex", value: `cx-${id}`, reason: `${id}-recorded-in-codex` }],
      resultTexts: mvp ? resultTexts(`div.${id}`, 30) : [],
      cost: mvp ? MVP_GAME[id].cost : { coins: 0, time: 0, favor: 0 },
      atlasEngine: id,
      causalityModel: meta.causalityModel,
      uncertaintyMode: meta.uncertaintyMode,
      evidenceStyle: meta.evidenceStyle,
      questionDomain: meta.questionDomain,
    };
    if (id === "tarot") base.spreads = MVP_GAME.tarot.spreads;
    return base;
  });
  writeTable(path.join(TABLES, "divinations.json"), "divinations", records);
}

function buildTarot() {
  const spreads = [
    { id: "one-card", name: "div.tarot.spread.one-card", topic: "通用", difficulty: "入门", positions: ["当前主象"] },
    { id: "three-timeline", name: "div.tarot.spread.three-timeline", topic: "通用", difficulty: "入门", positions: ["过去/成因", "现在/核心", "趋势/建议"] },
    { id: "cross", name: "div.tarot.spread.cross", topic: "通用", difficulty: "进阶", positions: ["核心", "阻力", "显性资源", "隐性资源", "建议"] },
    { id: "celtic-cross", name: "div.tarot.spread.celtic-cross", topic: "通用", difficulty: "深度", positions: ["现状", "挑战", "根源", "过去", "可能趋势", "近未来", "自我", "环境", "希望/恐惧", "结果"] },
    { id: "relationship-mirror", name: "div.tarot.spread.relationship-mirror", topic: "关系", difficulty: "进阶", positions: ["我方状态", "对方状态", "显性互动", "隐性需求", "下一步"] },
    { id: "choice-gate", name: "div.tarot.spread.choice-gate", topic: "通用", difficulty: "进阶", positions: ["方案A收益", "方案A代价", "方案B收益", "方案B代价", "选择原则"] },
    { id: "career-map", name: "div.tarot.spread.career-map", topic: "事业", difficulty: "进阶", positions: ["当前岗位", "核心能力", "外部机会", "内部阻力", "三十日行动"] },
    { id: "money-flow", name: "div.tarot.spread.money-flow", topic: "财务", difficulty: "进阶", positions: ["收入入口", "支出漏洞", "资源沉淀", "风险提醒", "调整动作"] },
    { id: "shadow-dialogue", name: "div.tarot.spread.shadow-dialogue", topic: "心理", difficulty: "深度", positions: ["我看见的自己", "我回避的自己", "重复模式", "身体信号", "整合练习"] },
  ];
  writeTable(path.join(DIV, "tarot_spreads.json"), "tarot_spreads", spreads);

  const MAJOR = [
    "愚者", "魔术师", "女祭司", "皇后", "皇帝", "教皇", "恋人", "战车", "力量", "隐者",
    "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔", "高塔", "星星", "月亮", "太阳", "审判", "世界",
  ];
  const SUIT_PREFIX = { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" };
  const RANKS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "王后", "国王"];
  const cards = [];
  MAJOR.forEach((name, i) => {
    cards.push({
      id: `major-${i}`,
      name,
      nameKey: `div.tarot.card.major-${i}`,
      arcana: "major",
      suit: "major",
      element: "灵魂",
      uprightKey: `div.tarot.card.major-${i}.up`,
      reversedKey: `div.tarot.card.major-${i}.rev`,
      keywords: [name],
      reversedKeywords: ["阻滞"],
    });
  });
  for (const [suit, prefix] of Object.entries(SUIT_PREFIX)) {
    RANKS.forEach((rank, i) => {
      const id = `${suit}-${i}`;
      cards.push({
        id,
        name: `${prefix}${rank}`,
        nameKey: `div.tarot.card.${id}`,
        arcana: "minor",
        suit,
        element: suit === "wands" ? "火" : suit === "cups" ? "水" : suit === "swords" ? "风" : "土",
        uprightKey: `div.tarot.card.${id}.up`,
        reversedKey: `div.tarot.card.${id}.rev`,
        keywords: [rank, prefix],
        reversedKeywords: ["阻滞", "失衡"],
      });
    });
  }
  // Carry English names across a regeneration — same reason as the hexagrams.
  const tp = path.join(DIV, "tarot_cards.json");
  if (fs.existsSync(tp)) {
    const prev = new Map((JSON.parse(fs.readFileSync(tp, "utf8")).records ?? [])
      .filter((r) => r.nameEn).map((r) => [r.id, r.nameEn]));
    for (const c of cards) c.nameEn = prev.get(c.id) ?? null;
  }
  writeTable(tp, "tarot_cards", cards);
  return { spreads, cards };
}

function buildLots() {
  const GRADES = ["上签", "中签", "下签"];
  const themes = {
    guanyin: [
      "慈悲化解", "静守待时", "心诚则灵", "云开见月", "行稳致远", "随缘自在",
      "勤修福田", "宽以待人", "守正不移", "柳暗花明", "退一步安", "积善成德",
      "戒急用忍", "内外清明", "信愿行足", "转危为安", "守拙保身", "春风化雨",
      "一念向善", "照见本心", "忍辱波罗蜜", "诸恶莫作", "众善奉行", "因果不虚",
      "放下执著", "返观自省", "和气致祥", "静水深流", "光明在望", "福慧双修",
    ],
    guandi: [
      "忠义为本", "果断前行", "守信立世", "威武不屈", "义字当头", "单刀赴会",
      "过五关斩六将", "千里寻兄", "秉烛达旦", "威震华夏", "刚正不阿", "义释曹操",
      "守诺如金", "勇者不惧", "智勇双全", "兄弟同心", "正气凛然", "斩奸除恶",
      "赤心报国", "不骄不躁", "势如破竹", "稳操胜券", "先难后易", "守城待援",
      "以义制利", "慎战而胜", "厚积薄发", "旗开得胜", "化敌为友", "功成不居",
    ],
    mazu: [
      "护佑航行", "风平浪静", "转舵避凶", "海天同庆", "慈航普渡", "遇难呈祥",
      "顺风得利", "潮信有时", "渔盐得利", "阖家平安", "归航有望", "暗礁已除",
      "妈祖庇佑", "舟行万里", "化险为夷", "潮起潮落", "心向光明", "守望相助",
      "海不扬波", "利涉大川", "渔火平安", "港湾可归", "顺风张帆", "避浪而行",
      "天后恩泽", "行船有信", "潮平岸阔", "护佑商旅", "遇难成祥", "福泽绵长",
    ],
  };
  const prefix = { guanyin: "gy", guandi: "gd", mazu: "mz" };
  const records = [];
  for (const [temple, list] of Object.entries(themes)) {
    list.forEach((theme, i) => {
      const num = i + 1;
      const grade = GRADES[i % 3];
      records.push({
        id: `${prefix[temple]}-${num}`,
        temple,
        number: num,
        grade,
        title: theme,
        poem: [
          `${theme}意自长，`,
          `第${num}签问行藏。`,
          grade === "上签" ? "云开星斗现，" : grade === "中签" ? "守己待时昌，" : "且把步量详，",
          "心正路自广。",
        ],
        plainReading: `签意侧重「${theme}」。宜先分清可控与不可控，再定进退。`,
        advice: [
          "把签文当作路线提示，而非吉凶判决。",
          grade === "下签" ? "宜保守观察，避免重大冲动决策。" : "可小步试探，保留调整空间。",
        ],
      });
    });
  }
  writeTable(path.join(DIV, "lot_signs.json"), "lot_signs", records);
}

function buildHexagrams() {
  const NAMES = [
    "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履",
    "泰", "否", "同人", "大有", "谦", "豫", "随", "蛊", "临", "观",
    "噬嗑", "贲", "剥", "复", "无妄", "大畜", "颐", "大过", "坎", "离",
    "咸", "恒", "遁", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解",
    "损", "益", "夬", "姤", "萃", "升", "困", "井", "革", "鼎",
    "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节",
    "中孚", "小过", "既济", "未济",
  ];
  // English names live in tools/divination/name_en.mjs and are read back here.
  // Regenerating this table used to drop them silently, which is how 64
  // hexagram names sat in en.json as Chinese characters for an English player.
  const existing = new Map();
  const p = path.join(DIV, "hexagrams.json");
  if (fs.existsSync(p))
    for (const r of JSON.parse(fs.readFileSync(p, "utf8")).records ?? [])
      if (r.nameEn) existing.set(r.id, r.nameEn);

  const records = NAMES.map((name, i) => ({
    id: `hex-${i}`,
    index: i,
    name,
    nameEn: existing.get(`hex-${i}`) ?? null,
    nameKey: `div.iching.hex.${i}`,
    adviceKey: `div.iching.hex.${i}.advice`,
  }));
  writeTable(p, "hexagrams", records);
}

/** Compact ephemeris: solar-term day-of-year for Li Chun year boundary + month branches. */
function buildEphemeris() {
  // Approx solar term starts (day-of-year, non-leap) for month pillars — good enough for game.
  const solarTerms = [
    { name: "小寒", doy: 5, monthBranch: "丑" },
    { name: "立春", doy: 35, monthBranch: "寅" },
    { name: "惊蛰", doy: 65, monthBranch: "卯" },
    { name: "清明", doy: 95, monthBranch: "辰" },
    { name: "立夏", doy: 126, monthBranch: "巳" },
    { name: "芒种", doy: 157, monthBranch: "午" },
    { name: "小暑", doy: 188, monthBranch: "未" },
    { name: "立秋", doy: 218, monthBranch: "申" },
    { name: "白露", doy: 249, monthBranch: "酉" },
    { name: "寒露", doy: 279, monthBranch: "戌" },
    { name: "立冬", doy: 309, monthBranch: "亥" },
    { name: "大雪", doy: 340, monthBranch: "子" },
  ];
  const years = [];
  for (let y = 1253; y <= 1453; y++) {
    // Li Chun JDN approximation: year * 365.2425 + offset calibrated near historical range
    const lichunJdn = Math.round(1721425.5 + y * 365.2425 + 34.5);
    years.push({
      id: `ephem-${y}`,
      year: y,
      lichunJdn,
    });
  }
  writeTable(path.join(DIV, "ephemeris_years.json"), "ephemeris_years", years);
  writeTable(path.join(DIV, "ephemeris_solar_terms.json"), "ephemeris_solar_terms", solarTerms.map((t, i) => ({ id: `st-${i}`, ...t })));
}

const ROUTE_ADVICE = {
  iching: [
    "此卦宜缓行陆路，先问驿站再定行程。",
    "动爻多，宜改道就近城邑休整三日。",
    "时位不利渡河，可等风止再涉。",
    "西路商队密，情报易得，宜问价勿急买。",
    "北路关卡严，需先备文书与通译。",
    "海上季候未稳，宜改走沿岸短程。",
    "此程宜结伴，独行则少打听、多停留。",
    "关隘前宜先献薄礼，再问通行时辰。",
    "粮草宜按双倍日程备，旱段难补给。",
    "此城宜短停，勿久居议价，易失时窗。",
    "驿路有岔，宜选有水井的那条。",
    "夜行不宜，宜黎明动身。",
    "此卦提示：问清税则再入市。",
    "同行者中有熟路之人，宜请其前导。",
    "驼队宜减负，山路不宜满载。",
    "渡口拥挤，可绕上游浅滩。",
    "此程宜先求宿处，再谈买卖。",
    "风向将转，海船宜候两日。",
    "边市价虚高，宜比三家再定。",
    "关吏更替在即，宜趁旧令通行。",
    "沙漠段宜夜行昼息。",
    "此卦宜求向导，勿凭旧图独断。",
    "河冰将融，涉水需改木桥。",
    "城门黄昏即闭，宜早入。",
    "商路有劫警，宜改官道。",
    "此程宜携盐茶作赠，便于问路。",
    "驿马稀缺，宜步行段与骑行段交替。",
    "雨季将至，宜赶在泥泞前过谷。",
    "此卦提示：先问水源再定宿营。",
    "终点城有节庆，宜提前入城求栈。",
  ],
  bazi: [
    "日主偏刚，宜选稳妥官道，勿赌抄近。",
    "流年水旺，渡河航运窗口较宽。",
    "土气足，宜陆路长程，忌频繁换船。",
    "金气显，议价宜硬，但勿开罪关吏。",
    "木气发，宜早动身、多问新路。",
    "火气燥，夏日午间宜停行。",
    "日柱提示：结交通译比结交商人更紧要。",
    "年柱稳，可签较长雇约。",
    "月令弱，宜缩短单段行程。",
    "时柱动，岔路口宜再占一次再决。",
    "五行缺水，宜沿河择路。",
    "五行缺火，夜营宜近人烟。",
    "比劫多，同伴宜少、规矩宜明。",
    "食伤透，适合打听物产与市价。",
    "财星显，市集可久留，驿站勿久留。",
    "官杀重，关卡前宜备足文书。",
    "印星护，宜投宿有寺观的城。",
    "大运换局将近，重大改道宜缓。",
    "此盘宜向东求学，向西求货。",
    "出生季提示：秋行宜早，春行宜稳。",
    "日支冲程，忌与同属之人同宿议事。",
    "天干合多，宜合作雇驼，勿独揽。",
    "地支刑开，山路宜缓、平原可疾。",
    "空亡临路，勿信无据的捷径传言。",
    "禄刃分明，宜择熟悉的商帮同行。",
    "调候需水，海上段优先于旱段。",
    "调候需火，宜选日照长的谷道。",
    "此盘提示：三年内宜以商路养学路。",
    "驿马星动，迁徙频繁之年宜减货载。",
    "华盖临，宜访地方导师再定长线。",
  ],
  lot: [
    "签示缓行：先问本地人此路是否季节可通。",
    "签示可行：按原定驿站推进，勿临时改线。",
    "签示慎渡：今日不宜上船，改明日潮信。",
    "签示问价：同货比三摊，再定是否买入。",
    "签示结伴：独行段改并入商队。",
    "签示止步：此岔宜回城再备粮。",
    "签示早发：黎明出城可避关卡拥堵。",
    "签示夜宿：勿野营，寻有墙的驿馆。",
    "签示礼让：关前先礼后问，可减滞留。",
    "签示藏锋：市集少露贵货。",
    "签示求译：语言不通处先雇通译再议。",
    "签示分水：两路皆可，选有井泉者。",
    "签示候风：海路再等一个潮汐周期。",
    "签示减载：山道卸货分两趟。",
    "签示求医：同行若有病，先城内处置再行。",
    "签示改道：官道虽远，劫警较少。",
    "签示问税：入城前先打听抽分比例。",
    "签示守信：已允的交货日勿再拖延。",
    "签示止贪：此城特产只购所需。",
    "签示求庇：近海处先谒天后再开船。",
    "签示静观：消息矛盾时，停一日再决。",
    "签示北行：近期北路补给更稳。",
    "签示南行：季风将顺，可考虑海段。",
    "签示西行：驼队价平，宜此时雇脚力。",
    "签示东行：文书易办，关卡较宽。",
    "签示短停：只宿一夜，勿恋市集。",
    "签示长驻：可在此学一季方言再走。",
    "签示赠礼：薄礼问路，胜过空言。",
    "签示记档：把路况写入图鉴，供返程。",
    "签示再问：一事一签，勿同日连抽。",
  ],
  tarot: [
    "牌阵指向稳路：选补给明确的那条出口。",
    "阻力牌提示：抄近路代价高于官道。",
    "资源牌在左：西向商队可借力。",
    "资源牌在右：东向驿站更可靠。",
    "时间线显示：过去延误，宜压缩今日行程。",
    "现在牌要求：先解决通译，再谈路线。",
    "趋势牌开放：三日内适合改乘船舶。",
    "双选门A收益高但代价是时间——宜货急时选。",
    "双选门B代价是金钱——囊中紧时避开。",
    "选择原则牌：以安全高于利润。",
    "逆位阻滞：今日不宜签长雇约。",
    "逆位过量：勿一次购满货舱。",
    "正位通行：关卡问询可如实作答。",
    "阴影牌：勿轻信无来历的向导。",
    "环境牌：此城流言多，情报需交叉验证。",
    "自我牌：你更适合陆路节律。",
    "结果牌：短程试探后再定长线。",
    "挑战牌：河渡是本段关键风险。",
    "希望牌：可在下一城补学占法。",
    "恐惧牌：勿因传闻放弃已探明的路。",
    "事业地图式读法：先稳岗位（补给），再求机会（新路）。",
    "金钱流提示：支出在关税，不在脚力。",
    "关系镜像：同伴意见宜听，决策仍在你。",
    "一牌校准：今日主题是「停」不是「冲」。",
    "一牌校准：今日主题是「问」不是「买」。",
    "三牌建议位：改道前先看水位。",
    "凯尔特结果位：长线仍指向原目的地。",
    "牌组合：水元素多，宜近河湖择路。",
    "牌组合：火元素多，宜避开正午行军。",
    "牌组合：土元素多，旱路可托运重货。",
  ],
};

function patchI18n(tarot) {
  const en = JSON.parse(fs.readFileSync(I18N_EN, "utf8"));
  const zh = JSON.parse(fs.readFileSync(I18N_ZH, "utf8"));

  const NAMES_ZH = {
    bazi: "八字",
    "bazi-relationship": "八字缘合",
    tarot: "塔罗",
    dream: "占梦",
    iching: "易占",
    qimen: "奇门遁甲",
    ziwei: "紫微斗数",
    liuyao: "纳甲六爻",
    meihua: "梅花易数",
    western: "西洋占星",
    vedic: "印度占星",
    numerology: "数字命理",
    runes: "卢恩符文",
    geomancy: "土占",
    lot: "签占",
    jiaobei: "杯筊",
    xiangmian: "面相",
    palmistry: "手相",
    fengshui: "风水",
    astrodice: "占星骰子",
    lenormand: "雷诺曼",
    oracle: "神谕卡",
    coffee: "咖啡渣占卜",
    scrying: "水晶凝视",
  };
  const NAMES_EN = {
    bazi: "Four Pillars",
    "bazi-relationship": "Pillars Compatibility",
    tarot: "Tarot",
    dream: "Dream Reading",
    iching: "I Ching",
    qimen: "Qi Men Dun Jia",
    ziwei: "Zi Wei Dou Shu",
    liuyao: "Six Lines",
    meihua: "Plum Blossom",
    western: "Western Astrology",
    vedic: "Vedic Astrology",
    numerology: "Numerology",
    runes: "Runes",
    geomancy: "Geomancy",
    lot: "Temple Lots",
    jiaobei: "Jiaobei",
    xiangmian: "Face Reading",
    palmistry: "Palmistry",
    fengshui: "Feng Shui",
    astrodice: "Astro Dice",
    lenormand: "Lenormand",
    oracle: "Oracle Cards",
    coffee: "Coffee Grounds",
    scrying: "Scrying",
  };

  for (const id of METHOD_IDS) {
    zh[`div.${id}.name`] = NAMES_ZH[id];
    en[`div.${id}.name`] = NAMES_EN[id];
  }

  for (const [mid, lines] of Object.entries(ROUTE_ADVICE)) {
    lines.forEach((line, i) => {
      const key = `div.${mid}.result.${String(i).padStart(2, "0")}`;
      zh[key] = line;
      en[key] = `[route] ${line}`;
    });
  }

  for (const s of tarot.spreads) {
    zh[s.name] = s.positions ? s.name.replace("div.tarot.spread.", "") : s.name;
  }
  const spreadZh = {
    "one-card": "一牌校准",
    "three-timeline": "三牌时间线",
    cross: "小十字阵",
    "celtic-cross": "凯尔特十字",
    "relationship-mirror": "关系镜像",
    "choice-gate": "双选门",
    "career-map": "事业地图",
    "money-flow": "金钱流",
    "shadow-dialogue": "阴影对话",
  };
  const spreadEn = {
    "one-card": "One-Card Check",
    "three-timeline": "Past, Present, Trend",
    cross: "Small Cross",
    "celtic-cross": "Celtic Cross",
    "relationship-mirror": "Relationship Mirror",
    "choice-gate": "The Two Doors",
    "career-map": "Career Map",
    "money-flow": "Money Flow",
    "shadow-dialogue": "Shadow Dialogue",
  };
  for (const [id, label] of Object.entries(spreadZh)) {
    zh[`div.tarot.spread.${id}`] = label;
    if (!spreadEn[id]) throw new Error(`tarot spread ${id}: no English label`);
    en[`div.tarot.spread.${id}`] = spreadEn[id];
  }

  // Hexagram names. Nothing wrote these before, so whatever put Chinese into
  // en.json did it once, by hand, years ago — and no rebuild could correct it.
  // Generating them here means the table is the source of truth for both
  // languages, the way every other string in the game already works.
  {
    const hexPath = path.join(DIV, "hexagrams.json");
    if (fs.existsSync(hexPath)) {
      for (const h of JSON.parse(fs.readFileSync(hexPath, "utf8")).records ?? []) {
        if (!h.nameEn) throw new Error(`hexagram ${h.id}: no nameEn — run tools/divination/name_en.mjs --write`);
        zh[h.nameKey] = h.name;
        en[h.nameKey] = h.nameEn;
      }
    }
  }

  // `nameEn` comes from tools/divination/name_en.mjs. Falling back to the
  // Chinese would put 愚者 in front of an English player and, in the sentences
  // below, produce "愚者 upright: energy flows" — text in no language at all.
  // Better to fail loudly here than to ship that again.
  for (const c of tarot.cards) {
    if (!c.nameEn) throw new Error(`tarot ${c.id}: no nameEn — run tools/divination/name_en.mjs --write`);
    zh[c.nameKey] = c.name;
    en[c.nameKey] = c.nameEn;
    zh[c.uprightKey] = `${c.name}正位：主题能量顺畅，可作路线参照。`;
    zh[c.reversedKey] = `${c.name}逆位：能量阻滞，宜放缓决策。`;
    en[c.uprightKey] = `${c.nameEn} upright: energy flows; use as route counsel.`;
    en[c.reversedKey] = `${c.nameEn} reversed: blockage; slow the decision.`;
  }

  // Mentor / UI strings
  Object.assign(zh, {
    "ev.cambaluc.mentor_iching.title": "大都太史学易",
    "ev.cambaluc.mentor_iching.body": "太史署的先生愿以十四日教你起卦观路，不问吉凶，只问时位。",
    "ev.cambaluc.mentor_iching.choice.learn": "奉束脩，学易占",
    "ev.cambaluc.mentor_iching.choice.ask": "先听他讲卦与道路",
    "ev.baldacum.mentor_bazi.title": "报达推命",
    "ev.baldacum.mentor_bazi.body": "精通历算的先生愿据生辰排四柱，教你看三年内的行路窗口。",
    "ev.baldacum.mentor_bazi.choice.learn": "奉礼金，学八字",
    "ev.baldacum.mentor_bazi.choice.ask": "先问历法如何服务于行路",
    "ev.tauris.mentor_tarot.title": "大不里士牌阵",
    "ev.tauris.mentor_tarot.body": "一位法兰克商人的遗孀以牌阵教人看岔路：收益、代价与选择原则。",
    "ev.tauris.mentor_tarot.choice.learn": "奉银，学塔罗",
    "ev.tauris.mentor_tarot.choice.ask": "先看她演示双选门",
    "ui.divination.symbol": "象",
    "ui.divination.reading": "解读",
    "ui.divination.effects": "所得",
    "ev.road.fork_tarot.title": "岔路口的牌",
    "ev.road.fork_tarot.body": "两条驿路分向未知。你可在此铺开双选门，比较收益与代价。",
    "ev.road.fork_tarot.choice.cast": "以塔罗双选门观路",
    "ev.road.fork_tarot.choice.walk": "凭经验径直择路",
  });
  Object.assign(en, {
    "ev.cambaluc.mentor_iching.title": "I Ching at Khanbaliq",
    "ev.cambaluc.mentor_iching.body": "A court chronologer will teach hexagram casting for roads — timing and position, not luck.",
    "ev.cambaluc.mentor_iching.choice.learn": "Pay the fee and learn I Ching",
    "ev.cambaluc.mentor_iching.choice.ask": "Hear how hexagrams speak of roads",
    "ev.baldacum.mentor_bazi.title": "Pillars at Baghdad",
    "ev.baldacum.mentor_bazi.body": "A calendar master will teach four pillars to read three-year travel windows.",
    "ev.baldacum.mentor_bazi.choice.learn": "Pay and learn Ba Zi",
    "ev.baldacum.mentor_bazi.choice.ask": "Ask how calendars serve the road",
    "ev.tauris.mentor_tarot.title": "Cards at Tabriz",
    "ev.tauris.mentor_tarot.body": "A Frankish widow teaches spreads that weigh gain, cost, and the rule of choice at forks.",
    "ev.tauris.mentor_tarot.choice.learn": "Pay silver and learn Tarot",
    "ev.tauris.mentor_tarot.choice.ask": "Watch a choice-gate demonstration",
    "ui.divination.symbol": "Symbol",
    "ui.divination.reading": "Reading",
    "ui.divination.effects": "What changed",
    "ev.road.fork_tarot.title": "Cards at the Fork",
    "ev.road.fork_tarot.body": "Two post-roads split. You may lay a choice-gate and compare gain against cost.",
    "ev.road.fork_tarot.choice.cast": "Cast Tarot choice-gate",
    "ev.road.fork_tarot.choice.walk": "Choose by experience alone",
  });

  fs.writeFileSync(I18N_ZH, JSON.stringify(zh, null, 2) + "\n");
  fs.writeFileSync(I18N_EN, JSON.stringify(en, null, 2) + "\n");
  console.log("patched i18n zh/en");
}

function buildMentorEvents() {
  const records = [
    {
      id: "ev-cambaluc-mentor-iching",
      kind: "site",
      title: "ev.cambaluc.mentor_iching.title",
      when: { cities: ["cambaluc"], not_flags: ["fl-learned-iching"] },
      body: "ev.cambaluc.mentor_iching.body",
      once: true,
      choices: [
        {
          label: "ev.cambaluc.mentor_iching.choice.learn",
          needs: { coins: { min: 8000 } },
          effects: [
            { op: "coins", value: -8000, reason: "fee-to-the-chronologer" },
            { op: "days", value: 14, reason: "a-fortnight-learning-hexagrams" },
            { op: "learn_divination", value: "iching", reason: "learned-iching" },
            { op: "flag", value: "fl-learned-iching", reason: "learned-iching" },
          ],
        },
        {
          label: "ev.cambaluc.mentor_iching.choice.ask",
          effects: [{ op: "codex", value: "cx-hexagrams", reason: "heard-how-hexagrams-read-roads" }],
        },
      ],
      lore: { origin: "authored" },
    },
    {
      id: "ev-baldacum-mentor-bazi",
      kind: "site",
      title: "ev.baldacum.mentor_bazi.title",
      when: { cities: ["baldacum"], not_flags: ["fl-learned-bazi"] },
      body: "ev.baldacum.mentor_bazi.body",
      once: true,
      choices: [
        {
          label: "ev.baldacum.mentor_bazi.choice.learn",
          needs: { coins: { min: 10000 } },
          effects: [
            { op: "coins", value: -10000, reason: "fee-to-the-calendar-master" },
            { op: "days", value: 21, reason: "three-weeks-learning-pillars" },
            { op: "learn_divination", value: "bazi", reason: "learned-bazi" },
            { op: "flag", value: "fl-learned-bazi", reason: "learned-bazi" },
          ],
        },
        {
          label: "ev.baldacum.mentor_bazi.choice.ask",
          effects: [{ op: "codex", value: "cx-four-pillars", reason: "heard-how-pillars-serve-travel" }],
        },
      ],
      lore: { origin: "authored" },
    },
    {
      id: "ev-tauris-mentor-tarot",
      kind: "site",
      title: "ev.tauris.mentor_tarot.title",
      when: { cities: ["tauris"], not_flags: ["fl-learned-tarot"] },
      body: "ev.tauris.mentor_tarot.body",
      once: true,
      choices: [
        {
          label: "ev.tauris.mentor_tarot.choice.learn",
          needs: { coins: { min: 6000 } },
          effects: [
            { op: "coins", value: -6000, reason: "silver-to-the-card-reader" },
            { op: "days", value: 10, reason: "ten-days-learning-spreads" },
            { op: "learn_divination", value: "tarot", reason: "learned-tarot" },
            { op: "flag", value: "fl-learned-tarot", reason: "learned-tarot" },
          ],
        },
        {
          label: "ev.tauris.mentor_tarot.choice.ask",
          effects: [{ op: "codex", value: "cx-tarot", reason: "watched-a-choice-gate" }],
        },
      ],
      lore: { origin: "authored" },
    },
    {
      id: "ev-road-fork-tarot",
      kind: "road",
      title: "ev.road.fork_tarot.title",
      body: "ev.road.fork_tarot.body",
      when: { not_flags: ["fl-fork-tarot-done"] },
      once: false,
      choices: [
        {
          label: "ev.road.fork_tarot.choice.cast",
          needs: { learned_divination: ["tarot"] },
          divination: "tarot",
          spread: "choice-gate",
          pass: {
            effects: [
              { op: "reveal_map", value: "$subject", reason: "choice-gate-passed" },
              { op: "flag", value: "fl-fork-tarot-done", reason: "fork-read" },
            ],
          },
          fail: {
            effects: [
              { op: "days", value: 1, reason: "cards-clouded" },
              { op: "flag", value: "fl-fork-tarot-done", reason: "fork-read" },
            ],
          },
        },
        {
          label: "ev.road.fork_tarot.choice.walk",
          effects: [{ op: "flag", value: "fl-fork-tarot-done", reason: "walked-without-cards" }],
        },
      ],
      lore: { origin: "authored" },
    },
  ];
  writeTable(path.join(TABLES, "events/mentors_divination.json"), "events", records);
}

buildDivinations();
const tarot = buildTarot();
buildLots();
buildHexagrams();
buildEphemeris();
buildMentorEvents();
patchI18n(tarot);
console.log("P3 content build complete.");
