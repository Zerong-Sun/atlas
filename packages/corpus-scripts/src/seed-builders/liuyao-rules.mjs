import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "liuyao_rules",
  source_type: "self_authored",
  license_note: "自研六爻纳甲规则摘要，概念源于传统易占，非逐字引用《增删卜易》等现代译本",
  source_url: "https://ctext.org/wiki.pl?if=gb&res=77488",
  verbatim_allowed: false,
};

const RULES = [
  {
    chapter: "起卦",
    section: "大衍",
    text: "三变成爻，六爻成卦；老阳老阴为变爻，静爻不变。",
  },
  {
    chapter: "装卦",
    section: "纳甲",
    text: "八宫卦属，世应二爻定吉凶焦点；纳甲配干支，以定五行生克。",
  },
  {
    chapter: "六亲",
    section: "定义",
    text: "生我者为父母，我生者为子孙，克我者为官鬼，我克者为妻财，同我者为兄弟。",
  },
  {
    chapter: "六亲",
    section: "问事",
    text: "问财以妻财为用；问官以官鬼为用；问婚以妻财、官鬼互参；问病看官鬼、子孙。",
  },
  {
    chapter: "用神",
    section: "选取",
    text: "用神旺相则吉，休囚则滞；用神受克则阻，得生则助。",
  },
  {
    chapter: "世应",
    section: "关系",
    text: "世为我方，应为对方；世应相生则和，相克则争，比和则平。",
  },
  {
    chapter: "动爻",
    section: "作用",
    text: "动爻可生克冲合他爻，变出之爻为结果倾向；静爻力量较弱。",
  },
  {
    chapter: "日月",
    section: "建破",
    text: "月建为提纲，日辰为主宰；旺相休囚死绝，以日月生克定爻之强弱。",
  },
  {
    chapter: "空亡",
    section: "旬空",
    text: "旬空之爻，事多虚浮或待填实；冲空则实，合空则绊。",
  },
  {
    chapter: "进退",
    section: "化进",
    text: "化进神则势进，化退神则势退；回头生克，以变爻论吉凶。",
  },
  {
    chapter: "三合",
    section: "局",
    text: "申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金；成局则力聚。",
  },
  {
    chapter: "六冲",
    section: "卦",
    text: "六冲卦主散、主速、主变；问婚问合不宜，问讼问散可取。",
  },
  {
    chapter: "六合",
    section: "卦",
    text: "六合卦主合、主慢、主成；问婚问合作多取。",
  },
  {
    chapter: "青龙",
    section: "六神",
    text: "青龙主喜庆、正直、婚姻吉象；配爻而看。",
  },
  {
    chapter: "朱雀",
    section: "六神",
    text: "朱雀主口舌、文书、信息；动则多言语之事。",
  },
  {
    chapter: "勾陈",
    section: "六神",
    text: "勾陈主田土、迟滞、牵连；问地产、旧事宜参。",
  },
  {
    chapter: "螣蛇",
    section: "六神",
    text: "螣蛇主虚惊、怪异、缠绕；宜察心理压力。",
  },
  {
    chapter: "白虎",
    section: "六神",
    text: "白虎主凶险、血光、道路；非必然凶，象征压力与决断。",
  },
  {
    chapter: "玄武",
    section: "六神",
    text: "玄武主私情、盗贼、暧昧；问财防暗耗。",
  },
  {
    chapter: "伏神",
    section: "飞伏",
    text: "用神不现，查伏神；伏而飞生则出，飞克伏则难显。",
  },
  {
    chapter: "应期",
    section: "判断",
    text: "应期看用神旺相、冲合、填实之月日；勿断绝对日期。",
  },
  {
    chapter: "心态",
    section: "占断",
    text: "六爻为趋势与象征，非宿命；宜结合现实决策与伦理。",
  },
];

const GONG_EXAMPLES = [
  { name: "乾宫", gua: "乾为天", note: "金局，问事多主刚健、领导、父亲。" },
  { name: "坤宫", gua: "坤为地", note: "土局，问事多主包容、母亲、田土。" },
  { name: "震宫", gua: "震为雷", note: "木局，问事多主行动、长男、惊动。" },
  { name: "巽宫", gua: "巽为风", note: "木局，问事多主入、长女、文书。" },
  { name: "坎宫", gua: "坎为水", note: "水局，问事多主险、中男、流动。" },
  { name: "离宫", gua: "离为火", note: "火局，问事多主文、中女、光明。" },
  { name: "艮宫", gua: "艮为山", note: "土局，问事多主止、少男、阻隔。" },
  { name: "兑宫", gua: "兑为泽", note: "金局，问事多主悦、少女、口舌。" },
];

export function buildLiuyaoChunks() {
  const chunks = RULES.map((r, i) =>
    makeChunk({
      id: `liuyao-rule-${i + 1}`,
      ...SOURCE,
      tradition: "iching",
      chapter: r.chapter,
      section: r.section,
      original_text: "",
      translation_zh: r.text,
      annotation_zh: "六爻规则库，MVP 供周易体系扩展检索；与梅花、纳甲流派或有差异。",
      keywords: ["六爻", r.chapter, r.section, "纳甲", "占卜"],
    }),
  );

  for (const g of GONG_EXAMPLES) {
    chunks.push(
      makeChunk({
        id: `liuyao-gong-${g.name}`,
        ...SOURCE,
        tradition: "iching",
        chapter: "八宫",
        section: g.name,
        original_text: "",
        translation_zh: `${g.gua}属${g.name}：${g.note}`,
        annotation_zh: "八宫纳甲简表，供装卦与用神定位参考。",
        keywords: [g.name, "八宫", "六爻", g.gua],
      }),
    );
  }

  return chunks;
}
