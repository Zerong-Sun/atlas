import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "bazi_rules",
  source_type: "self_authored",
  license_note: "自研八字规则片段，非逐字古籍引用",
  source_url: null,
  verbatim_allowed: false,
};

const TEN_GODS = [
  { slug: "bijian", name: "比肩", def: "同我之五行，象征自我、同伴、竞争与独立。" },
  { slug: "jiecai", name: "劫财", def: "同我异阴阳，象征分享、冲动消费、兄弟朋友牵扯。" },
  { slug: "shishen", name: "食神", def: "我生之同性，象征表达、享受、才华输出与温和生财。" },
  { slug: "shangguan", name: "伤官", def: "我生之异性，象征创意、叛逆、口才与规则挑战。" },
  { slug: "piancai", name: "偏财", def: "我克之同性，象征流动财、机会财、外缘与交际。" },
  { slug: "zhengcai", name: "正财", def: "我克之异性，象征稳定收入、务实、责任与家庭资源。" },
  { slug: "qisha", name: "七杀", def: "克我之同性，象征压力、权威、冒险与激烈变动。" },
  { slug: "zhengguan", name: "正官", def: "克我之异性，象征制度、名誉、自律与职位责任。" },
  { slug: "pianyin", name: "偏印", def: "生我之同性，象征偏门学识、灵感、孤独与非常规支持。" },
  { slug: "zhengyin", name: "正印", def: "生我之异性，象征学历、母亲、庇护、名誉与正统学习。" },
];

const ELEMENTS = [
  { name: "木", nature: "生发条达", sheng: "火", ke: "土", season: "春" },
  { name: "火", nature: "炎上光明", sheng: "土", ke: "金", season: "夏" },
  { name: "土", nature: "稼穑承载", sheng: "金", ke: "水", season: "四季末" },
  { name: "金", nature: "从革肃杀", sheng: "水", ke: "木", season: "秋" },
  { name: "水", nature: "润下藏纳", sheng: "木", ke: "火", season: "冬" },
];

const PATTERNS = [
  { name: "身强", note: "日主得令、得地、得助多，宜泄耗克，忌再印比。" },
  { name: "身弱", note: "日主失令、受制、无助多，宜印比生扶，忌财官过重。" },
  { name: "从格", note: "日主极弱无根，顺从旺势五行，忌逆扶。" },
  { name: "调候", note: "寒暖燥湿失衡时，以季节用神为先，再论格局。" },
];

const LIUNIAN_TOPICS = [
  "流年见正官，多主责任、考试、职位变动",
  "流年见七杀，压力增大，宜守不宜冒进",
  "流年见正财，务实理财，稳定收入机会",
  "流年见偏财，交际应酬、机会财波动",
  "流年见正印，学习、证书、贵人庇护",
  "流年见偏印，思维跳跃，注意健康与休息",
  "流年见食神，表达展示、生活享受提升",
  "流年见伤官，创意爆发，注意口舌合约",
];

export function buildBaziChunks() {
  const chunks = [];

  for (const g of TEN_GODS) {
    const aspects = [
      { section: "定义", text: g.def },
      { section: "性格倾向", text: `${g.name}在命局中显见时，常对应上述象征在性格与处事上的倾向（非绝对）。` },
      { section: "事业财运", text: `问事业财运时，${g.name}可提示资源获取方式：宜观察其与日主五行生克及位置（年月日时）。` },
      { section: "感情人际", text: `问感情人际时，${g.name}多映射特定关系角色与互动模式，需结合性别与宫位综合判断。` },
    ];
    for (const a of aspects) {
      chunks.push(
        makeChunk({
          id: `bazi-god-${g.slug}-${a.section}`,
          ...SOURCE,
          tradition: "bazi",
          chapter: `十神·${g.name}`,
          section: a.section,
          original_text: "",
          translation_zh: a.text,
          annotation_zh: `十神规则库条目。slug: ten_god.${g.slug}`,
          keywords: [g.name, "十神", "八字", a.section],
        }),
      );
    }
  }

  for (const e of ELEMENTS) {
    const rules = [
      { section: "性质", text: `${e.name}性${e.nature}，旺于${e.season}。` },
      { section: "相生", text: `${e.name}生${e.sheng}，宜见${e.sheng}气流通则顺。` },
      { section: "相克", text: `${e.name}克${e.ke}，过克则${e.ke}受损，需平衡。` },
      { section: "日主取用", text: `日主属${e.name}时，喜忌需综合月令、格局与调候，不可单看五行旺衰。` },
      { section: "过旺", text: `${e.name}过旺：宜泄（我生）或耗（我克），忌再生助。` },
      { section: "过弱", text: `${e.name}过弱：宜生（生我）或扶（同我），忌再克泄。` },
      { section: "流年", text: `流年${e.name}气重，往往放大命局中${e.name}相关十神与六亲象意。` },
      { section: "合化", text: `${e.name}参与合化时，以化神五行论吉凶，原五行力量可能转化。` },
    ];
    for (const r of rules) {
      chunks.push(
        makeChunk({
          id: `bazi-element-${e.name}-${r.section}`,
          ...SOURCE,
          tradition: "bazi",
          chapter: `五行·${e.name}`,
          section: r.section,
          original_text: "",
          translation_zh: r.text,
          annotation_zh: `五行规则片段，供引擎与检索引用。`,
          keywords: [e.name, "五行", r.section, "八字"],
        }),
      );
    }
  }

  for (const p of PATTERNS) {
    chunks.push(
      makeChunk({
        id: `bazi-pattern-${p.name}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "格局",
        section: p.name,
        original_text: "",
        translation_zh: p.note,
        annotation_zh: "格局判断需结合全局，此条为规则提示而非独断结论。",
        keywords: ["格局", p.name, "八字"],
      }),
    );
  }

  for (let i = 0; i < LIUNIAN_TOPICS.length; i++) {
    chunks.push(
      makeChunk({
        id: `bazi-liunian-${i + 1}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "流年",
        section: "简断",
        original_text: "",
        translation_zh: LIUNIAN_TOPICS[i],
        annotation_zh: "流年简断模板句，需与用户流年干支计算结果绑定。",
        keywords: ["流年", "八字", "运势"],
      }),
    );
  }

  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  for (const s of stems) {
    chunks.push(
      makeChunk({
        id: `bazi-stem-${s}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "天干",
        section: s,
        original_text: "",
        translation_zh: `天干${s}：属${["甲乙木", "丙丁火", "戊己土", "庚辛金", "壬癸水"][Math.floor(stems.indexOf(s) / 2)]}，主外在气质与显性行动方式。`,
        annotation_zh: "天干象意简表，供排盘结果解释引用。",
        keywords: [s, "天干", "八字"],
      }),
    );
  }
  for (const b of branches) {
    chunks.push(
      makeChunk({
        id: `bazi-branch-${b}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "地支",
        section: b,
        original_text: "",
        translation_zh: `地支${b}：藏干与月令关系影响日主强弱，主内在环境、阶段与根基。`,
        annotation_zh: "地支象意简表，需结合藏干与合冲刑害。",
        keywords: [b, "地支", "八字"],
      }),
    );
  }

  const branchInteractions = [
    { name: "子午冲", note: "水火冲，情绪与事业节奏易波动，宜调和作息。" },
    { name: "丑未冲", note: "土土冲，内在固执与变动需求拉扯，宜灵活。" },
    { name: "寅申冲", note: "木金冲，行动与规则摩擦，注意合约与肢体伤。" },
    { name: "卯酉冲", note: "木金冲，人际与审美价值观冲突。" },
    { name: "辰戌冲", note: "土土冲，库门开阖，环境变动与心理防御。" },
    { name: "巳亥冲", note: "火水冲，理想与现实、精神与物质拉扯。" },
    { name: "寅午戌三合火", note: "火局成，热情、表达与行动力强，忌过燥。" },
    { name: "申子辰三合水", note: "水局成，智谋、流动与适应力增强。" },
    { name: "亥卯未三合木", note: "木局成，生长、仁厚与拓展力提升。" },
    { name: "巳酉丑三合金", note: "金局成，决断、规则与执行力增强。" },
    { name: "子卯刑", note: "无礼之刑，沟通误会、感情纠葛需注意。" },
    { name: "丑戌刑", note: "持势之刑，压力与责任感的内化。" },
    { name: "寅巳刑", note: "无恩之刑，付出与回报失衡感。" },
    { name: "辰辰自刑", note: "自我要求过高，宜减负。" },
    { name: "午午自刑", note: "情绪急躁，宜冷却决策。" },
    { name: "酉酉自刑", note: "完美主义与自我批评。" },
    { name: "亥亥自刑", note: "逃避与沉溺倾向，宜建立边界。" },
  ];
  for (const x of branchInteractions) {
    chunks.push(
      makeChunk({
        id: `bazi-interaction-${x.name}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "合冲刑害",
        section: x.name,
        original_text: "",
        translation_zh: x.note,
        annotation_zh: "地支关系规则，需结合命局是否入合入冲。",
        keywords: [x.name, "合冲", "八字", "地支"],
      }),
    );
  }

  const stemCombos = [
    { name: "甲己合土", note: "合化土气，主诚信、务实与整合。" },
    { name: "乙庚合金", note: "合化金气，主原则、决断与改革。" },
    { name: "丙辛合水", note: "合化水气，主灵活、沟通与智谋。" },
    { name: "丁壬合木", note: "合化木气，主成长、仁厚与拓展。" },
    { name: "戊癸合火", note: "合化火气，主热情、表达与行动。" },
  ];
  for (const s of stemCombos) {
    chunks.push(
      makeChunk({
        id: `bazi-stem-combo-${s.name}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "天干合化",
        section: s.name,
        original_text: "",
        translation_zh: s.note,
        annotation_zh: "天干五合，是否化成功看月令与支持。",
        keywords: [s.name, "天干合", "八字"],
      }),
    );
  }

  const dayMasterTips = [
    "日主旺时宜泄耗，忌再生扶太过。",
    "日主弱时宜印比，忌财官攻身无救。",
    "月令司令决定季节气势，先看月令再论格局。",
    "用神选取以平衡为先，次取通关与调候。",
    "忌神过旺之年月，宜守不宜攻。",
    "喜神得力之年月，可积极进取。",
    "比劫旺则竞争多，合作需明界限。",
    "食伤旺则表达强，注意言多伤气。",
    "财星旺则务实，防过度物质化。",
    "官杀旺则责任重，注意压力管理。",
    "印星旺则学习力强，防思虑过多。",
    "枭印旺则想法多，宜落地执行。",
  ];
  for (let i = 0; i < dayMasterTips.length; i++) {
    chunks.push(
      makeChunk({
        id: `bazi-daymaster-tip-${i + 1}`,
        ...SOURCE,
        tradition: "bazi",
        chapter: "日主取用",
        section: `要点${i + 1}`,
        original_text: "",
        translation_zh: dayMasterTips[i],
        annotation_zh: "日主强弱与用神原则，供引擎 facts 后检索引用。",
        keywords: ["日主", "用神", "八字"],
      }),
    );
  }

  return chunks;
}
