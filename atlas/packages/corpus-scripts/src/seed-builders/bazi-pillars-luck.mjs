import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "bazi_rules",
  source_type: "self_authored",
  license_note: "自研八字规则片段：四柱、大运、流年、小运、流月列表与释义",
  source_url: null,
  verbatim_allowed: false,
};

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_ELEMENT = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const STEM_YIN_YANG = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};

/** 六十甲子序 */
function buildJiaZi60() {
  const list = [];
  let stemIdx = 0;
  let branchIdx = 0;
  for (let i = 0; i < 60; i++) {
    list.push({
      index: i + 1,
      ganzhi: STEMS[stemIdx] + BRANCHES[branchIdx],
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
    });
    stemIdx = (stemIdx + 1) % 10;
    branchIdx = (branchIdx + 1) % 12;
  }
  return list;
}

const JIAZI_60 = buildJiaZi60();

const PILLAR_META = [
  {
    key: "year",
    name: "年柱",
    palace: "父母宫、祖上、早年环境",
    scope: "0–15 岁前后气场，社会背景与家族资源",
    person: "父母、长辈、上司（远）",
    topics: ["遗传气质", "家庭出身", "早年运势", "祖业荫庇"],
  },
  {
    key: "month",
    name: "月柱",
    palace: "兄弟宫、提纲、事业根基",
    scope: "16–30 岁前后，月令司权最重",
    person: "兄弟姊妹、同事、青年伙伴",
    topics: ["格局核心", "日主旺衰", "职业方向", "青年机遇"],
  },
  {
    key: "day",
    name: "日柱",
    palace: "夫妻宫、日主本体",
    scope: "31–45 岁前后，以日干为我",
    person: "配偶、自身身体与核心意志",
    topics: ["婚姻质量", "自我认同", "中年主线", "用神取象"],
  },
  {
    key: "hour",
    name: "时柱",
    palace: "子女宫、晚年、归宿",
    scope: "46 岁后渐显，结果与传承",
    person: "子女、学生、下属、晚年境遇",
    topics: ["晚运", "成果落地", "内在抱负", "私密心性"],
  },
];

const PILLAR_SECTIONS = [
  { section: "宫位", tpl: (p) => `【${p.name}】${p.palace}。时间象：${p.scope}。` },
  { section: "人事", tpl: (p) => `【${p.name}】主象：${p.person}。问事时此柱十神、生克决定该领域吉凶倾向（非宿命）。` },
  { section: "主题列表", tpl: (p) => `【${p.name}】常看：${p.topics.join("、")}。` },
  { section: "天干", tpl: (p) => `【${p.name}】天干为外在显化、社会标签；与日主关系定十神，定该领域资源或压力性质。` },
  { section: "地支", tpl: (p) => `【${p.name}】地支为根基与藏干；参与合冲刑害时，该领域人事易有变动。` },
  { section: "藏干", tpl: (p) => `【${p.name}】须查地支藏干（本气、中气、余气），藏干十神可揭示隐性动机与次要人物。` },
  { section: "与月令", tpl: (p) =>
      p.key === "month"
        ? "【月柱】为提纲，决定季节旺衰与格局成败，论命先看月令再论年日时。"
        : `【${p.name}】须与月柱五行气势联看：得令则易显，失令则宜扶助或泄耗。`,
  },
  { section: "与大运", tpl: (p) => `【${p.name}】大运干支触动此柱时，该领域十年或数年主题被放大；大运喜用神则顺，忌则阻。` },
  { section: "与流年", tpl: (p) => `【${p.name}】流年冲合刑害此柱，该年对应人事易有事件；流年十神引动此柱藏干尤验。` },
  { section: "与小运", tpl: (p) => `【${p.name}】童年及交运前后，小运叠此柱可细推逐年吉凶，与流年并看。` },
  { section: "与流月", tpl: (p) => `【${p.name}】流月引动此柱，该月相关事务（财、官、婚等）有短期波动。` },
  { section: "空破", tpl: (p) => `【${p.name}】若入空亡、被冲或墓库，对应人事可能延迟、虚化或经历转折，宜结合大运。` },
];

const DAYUN_SECTIONS = [
  { section: "定义", text: "大运：每步通常管十年，为命局外在时间轴的主线，权重高于单年流年。" },
  { section: "起运", text: "起运岁数依出生至下一节气的天数折算：三天折一岁（常见算法），男女顺逆不同。" },
  {
    section: "顺逆列表",
    text: [
      "阳年生男、阴年生女：大运顺行（从月柱顺排六十甲子）。",
      "阴年生男、阳年生女：大运逆行（从月柱逆排六十甲子）。",
      "顺行：未来节气方向；逆行：逆回上一节气方向。",
    ].join("\n"),
  },
  { section: "与命局", text: "大运干支与四柱生克：生扶用神则该十年顺遂，克泄用神则宜守成、调整策略。" },
  { section: "与流年", text: "流年为太岁，主该年应期；大运定十年背景，流年定触发点。吉凶须运年并论。" },
  { section: "交运", text: "交运前后一两年常感变动，称「脱运」「换运」；宜减少重大冒险，观察新运十神。" },
  { section: "十神", text: "大运天干十神主十年外在主题；地支十神主内在环境、家庭或实质资源变化。" },
  { section: "冲合", text: "大运冲命局年柱多动祖业父母；冲月柱多动事业环境；冲日柱多动婚姻自身；冲时柱子嗣晚运。" },
  { section: "墓库", text: "大运入墓库，相关五行事物可能收敛、潜伏或结束旧阶段；出墓则重启。" },
  { section: "空亡", text: "大运逢空亡，该十年计划易虚浮或延后，填实之年（冲空）多见落实。" },
  { section: "童限", text: "未起大运前，以月柱大运或小运、流年推断童年；童限亦看年柱父母与月柱环境。" },
];

const XIAOYUN_SECTIONS = [
  { section: "定义", text: "小运：一年一运，体量小于大运，用于补充逐年推断，童限与交运期尤重。" },
  { section: "排法", text: "小运排法与大运顺逆一致：顺行则一年一柱顺推，逆行则逆推，从时柱或命宫起（流派有别，以引擎配置为准）。" },
  { section: "与流年", text: "小运干支与流年干支并看：若小运生用神、流年亦吉，则该年事易成；双克用神则宜守。" },
  { section: "与大运", text: "大运管十年背景，小运管一年气色；大运吉而小运凶，多为小挫折；大运凶小运吉，或有喘息之机。" },
  { section: "童限", text: "三岁至起运前，可逐年查小运配合流年，看健康、学业、家庭变动。" },
  { section: "列表说明", text: "小运六十甲子与流年、大运同源，差别在起算起点与是否「一年一换」的粒度。" },
];

const LIUYUE_MONTHS = [
  { name: "正月", branch: "寅", note: "寅月建，木气渐旺，多主开局与计划。" },
  { name: "二月", branch: "卯", note: "卯木当令，生发、合作、感情议题易起。" },
  { name: "三月", branch: "辰", note: "辰土湿，木气余，调候与脾胃宜留意。" },
  { name: "四月", branch: "巳", note: "巳火渐旺，行动、曝光、竞争增加。" },
  { name: "五月", branch: "午", note: "午火炎上，情绪、名誉、心脏火气宜平衡。" },
  { name: "六月", branch: "未", note: "未土燥，火土交接，收束与转化。" },
  { name: "七月", branch: "申", note: "申金始，变革、规则、出行事务。" },
  { name: "八月", branch: "酉", note: "酉金旺，决断、财务、口舌是非慎之。" },
  { name: "九月", branch: "戌", note: "戌土库，火入库，项目收尾或压力积聚。" },
  { name: "十月", branch: "亥", note: "亥水旺，潜藏、学习、休养生息。" },
  { name: "十一月", branch: "子", note: "子水极旺，寒湿，宜守不宜大动。" },
  { name: "十二月", branch: "丑", note: "丑土寒，岁末总结，为来年蓄势。" },
];

const BRANCH_HIDDEN = {
  子: "癸",
  丑: "己癸辛",
  寅: "甲丙戊",
  卯: "乙",
  辰: "戊乙癸",
  巳: "丙戊庚",
  午: "丁己",
  未: "己丁乙",
  申: "庚壬戊",
  酉: "辛",
  戌: "戊辛丁",
  亥: "壬甲",
};

function liunianNote({ stem, branch, ganzhi }) {
  const se = STEM_ELEMENT[stem];
  const be = {
    寅: "木", 卯: "木", 巳: "火", 午: "火", 辰: "土", 戌: "土", 丑: "土", 未: "土",
    申: "金", 酉: "金", 子: "水", 亥: "水",
  }[branch];
  return `【流年${ganzhi}】天干${stem}（${se}·${STEM_YIN_YANG[stem]}），地支${branch}（${be}）。太岁主该年应期：天干主外在事件与名声，地支主环境、身体与实质变动；须与大运、命局用神同参。`;
}

function dayunStemNote(stem) {
  return `【大运天干${stem}】五行属${STEM_ELEMENT[stem]}，阳${STEM_YIN_YANG[stem] === "阳" ? "干" : "干"}。十年外在主题常随此干十神而显：遇日主则重自我与竞争，遇财官则重事业责任，遇食伤则重表达与变动，遇印枭则重学习与健康。`;
}

function dayunBranchNote(branch) {
  const hidden = BRANCH_HIDDEN[branch];
  return `【大运地支${branch}】藏干${hidden}。十年内在根基、家庭、身体与环境依此支刑冲合害而定；与命局地支成局则该五行力量大增。`;
}

function chunk(id, chapter, section, text, keywords, annotation) {
  return makeChunk({
    id,
    ...SOURCE,
    tradition: "bazi",
    chapter,
    section,
    original_text: "",
    translation_zh: text,
    annotation_zh: annotation ?? "四柱运程规则库，须绑定用户排盘结果使用。",
    keywords: Array.isArray(keywords) ? keywords : [keywords],
  });
}

export function buildBaziPillarsLuckChunks() {
  const chunks = [];

  chunks.push(
    chunk(
      "bazi-four-pillars-overview",
      "四柱",
      "总览",
      [
        "四柱：年、月、日、时各一干一支，共八字。",
        "年柱观祖上父母与早年；月柱观提纲格局与青年；日柱观日主与婚姻；时柱观子女与晚运。",
        "大运为十年主线（大限），流年为一年太岁（小限之一），小运为一年一气之补充。",
        "论命顺序：月令旺衰 → 格局用神 → 大运 → 流年 → 流月；忌单看吉凶星。",
      ].join("\n"),
      ["四柱", "八字", "总览", "年月日时"],
    ),
    chunk(
      "bazi-four-pillars-table",
      "四柱",
      "列表",
      [
        "| 柱 | 宫位 | 时间象 | 主事 |",
        "| --- | --- | --- | --- |",
        "| 年柱 | 父母宫·祖上 | 0–15 岁前后 | 父母、长辈、早年、社会背景 |",
        "| 月柱 | 兄弟宫·提纲 | 16–30 岁前后 | 格局、旺衰、事业根基、兄弟 |",
        "| 日柱 | 夫妻宫·日主 | 31–45 岁前后 | 自我、配偶、身体、用神 |",
        "| 时柱 | 子女宫·归宿 | 46 岁后渐显 | 子女、晚运、成果、内在志愿 |",
      ].join("\n"),
      ["四柱", "列表", "年柱", "月柱", "日柱", "时柱"],
      "四柱宫位对照表，供检索与报告表格引用。",
    ),
    chunk(
      "bazi-luck-hierarchy",
      "大运流年",
      "层次",
      [
        "| 层次 | 名称 | 周期 | 作用 |",
        "| --- | --- | --- | --- |",
        "| 大限 | 大运 | 约 10 年/步 | 十年背景、主线趋势 |",
        "| 小限 | 流年 | 1 年 | 太岁应期、当年触发 |",
        "| 补充 | 小运 | 1 年 | 逐年气色，童限与交运期 |",
        "| 细应 | 流月 | 1 月 | 当月短期财官婚动 |",
        "| 更细 | 流日 | 1 日 | 择日、短期，MVP 可略 |",
      ].join("\n"),
      ["大运", "流年", "小运", "流月", "列表"],
    ),
  );

  for (const p of PILLAR_META) {
    for (const s of PILLAR_SECTIONS) {
      chunks.push(
        chunk(
          `bazi-pillar-${p.key}-${s.section}`,
          `四柱·${p.name}`,
          s.section,
          s.tpl(p),
          [p.name, s.section, "四柱", "八字", p.key],
        ),
      );
    }
  }

  for (const s of DAYUN_SECTIONS) {
    chunks.push(
      chunk(
        `bazi-dayun-${s.section}`,
        "大运",
      s.section,
      s.text,
      ["大运", s.section, "八字"],
    ),
    );
  }

  for (const stem of STEMS) {
    chunks.push(
      chunk(`bazi-dayun-stem-${stem}`, "大运", `天干·${stem}`, dayunStemNote(stem), [
        "大运",
        stem,
        "天干",
      ]),
    );
  }
  for (const branch of BRANCHES) {
    chunks.push(
      chunk(`bazi-dayun-branch-${branch}`, "大运", `地支·${branch}`, dayunBranchNote(branch), [
        "大运",
        branch,
        "地支",
      ]),
    );
  }

  for (let step = 1; step <= 8; step++) {
    chunks.push(
      chunk(
        `bazi-dayun-step-${step}`,
        "大运",
        `第${step}步`,
        `【大运第${step}步】通常对应人生第 ${(step - 1) * 10 + 1}–${step * 10} 个大运岁数区间（以起运年龄为起点）。该步干支十神决定十年主题；与命局冲合则该阶段对应宫位人事变动显著。`,
        ["大运", `第${step}步`, "十年"],
      ),
    );
  }

  for (const x of XIAOYUN_SECTIONS) {
    chunks.push(
      chunk(`bazi-xiaoyun-${x.section}`, "小运", x.section, x.text, ["小运", x.section, "流年"]),
    );
  }

  chunks.push(
    chunk(
      "bazi-liunian-overview",
      "流年",
      "总论",
      "流年即太岁，每年一变。流年天干主外象（名声、职位、公开事件），流年地支主内象（环境、家庭、身体）。须与大运、命局用神同看：用神得流年生扶则吉，忌神旺则宜守。列表见六十甲子流年条。",
      ["流年", "太岁", "八字"],
    ),
    chunk(
      "bazi-liunian-vs-dayun",
      "流年",
      "运年并论",
      "大运吉、流年凶：十年底色尚可，该年有波折。大运凶、流年吉：困境中有缓解，勿过度乐观。大运流年同克用神：该年宜守，防健康、官非、破财。大运流年同生用神：可积极进取。",
      ["流年", "大运", "用神"],
    ),
  );

  for (const jz of JIAZI_60) {
    chunks.push(
      chunk(
        `bazi-liunian-${jz.ganzhi}`,
        "流年",
        jz.ganzhi,
        liunianNote(jz),
        ["流年", jz.ganzhi, jz.stem, jz.branch, "六十甲子", "列表"],
        `六十甲子第${jz.index}位，流年检索键：${jz.ganzhi}。`,
      ),
    );
  }

  const TEN_GODS = ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"];
  for (const god of TEN_GODS) {
    chunks.push(
      chunk(
        `bazi-liunian-god-${god}`,
        "流年",
        `十神·${god}`,
        `【流年逢${god}】（相对日主）：该年易突出${god}象征的人事主题；须看${god}是否为用神、是否被冲克。与大运十神相同则主题叠加，相反则拉扯。`,
        ["流年", god, "十神"],
      ),
      chunk(
        `bazi-dayun-god-${god}`,
        "大运",
        `十神·${god}`,
        `【大运逢${god}】：此十年${god}为主导十神之一，该领域（财、官、印、食伤、比劫）为运程主轴；结合所在柱位（年父母、月事业、日自身、时子女）断细节。`,
        ["大运", god, "十神"],
      ),
    );
  }

  chunks.push(
    chunk(
      "bazi-liuyue-overview",
      "流月",
      "总论",
      "流月以节气为月令，每月一干一支。流月引动大运、流年，主短期（一月内）财、官、婚、出行等。论流月须先看流年喜忌，再看流月与命局月柱、日柱关系。",
      ["流月", "八字"],
    ),
  );

  for (const m of LIUYUE_MONTHS) {
    chunks.push(
      chunk(
        `bazi-liuyue-${m.branch}`,
        "流月",
        m.name,
        `【${m.name}（${m.branch}月）】${m.note}流月地支${m.branch}当令，五行气势随季节变化，宜结合命局用神判断是否生扶。`,
        ["流月", m.name, m.branch, "列表"],
      ),
    );
  }

  for (const [branch, hidden] of Object.entries(BRANCH_HIDDEN)) {
    chunks.push(
      chunk(
        `bazi-canggan-${branch}`,
        "藏干",
        branch,
        `【地支${branch}藏干】${hidden.split("").join("、")}（本气在前）。藏干参与十神、合化与流年冲合，是断局细部关键。`,
        ["藏干", branch, "地支", "列表"],
      ),
    );
  }

  chunks.push(
    chunk(
      "bazi-nayin-list-intro",
      "纳音",
      "列表说明",
      [
        "六十甲子纳音：每两柱共享一纳音五行，共三十种纳音、六十条干支。",
        "纳音为气质、行业、环境之象意补充，可用于流年、大运、年柱气质；论命仍以正五行生克与用神为主。",
        "完整列表见本章六十条（甲子…癸亥）各节。",
      ].join("\n"),
      ["纳音", "六十甲子", "列表"],
    ),
    chunk(
      "bazi-nayin-table",
      "纳音",
      "三十纳音表",
      [
        "| 纳音 | 干支 | 意象概要 |",
        "| --- | --- | --- |",
        "| 海中金 | 甲子、乙丑 | 深藏、积蓄、信仰 |",
        "| 炉中火 | 丙寅、丁卯 | 冶炼、热情、技艺 |",
        "| 大林木 | 戊辰、己巳 | 成林、组织、成长 |",
        "| 路旁土 | 庚午、辛未 | 道路、承载、奔波 |",
        "| 剑锋金 | 壬申、癸酉 | 锋芒、决断、改革 |",
        "| 山头火 | 甲戌、乙亥 | 高远、名声、理想 |",
        "| 涧下水 | 丙子、丁丑 | 细流、智慧、渗透 |",
        "| 城头土 | 戊寅、己卯 | 屏障、制度、守护 |",
        "| 白蜡金 | 庚辰、辛巳 | 精炼、礼仪、收敛 |",
        "| 杨柳木 | 壬午、癸未 | 柔韧、适应、人情 |",
        "| 泉中水 | 甲申、乙酉 | 清澈、源头、萌芽 |",
        "| 屋上土 | 丙戌、丁亥 | 覆盖、家庭、归宿 |",
        "| 霹雳火 | 戊子、己丑 | 突发、震动、变革 |",
        "| 松柏木 | 庚寅、辛卯 | 耐寒、坚持、正直 |",
        "| 长流水 | 壬辰、癸巳 | 绵延、贸易、流动 |",
        "| 砂中金 | 甲午、乙未 | 埋藏之宝、待发掘 |",
        "| 山下火 | 丙申、丁酉 | 文明、教化、内敛之火 |",
        "| 平地木 | 戊戌、己亥 | 平原、普及、民生 |",
        "| 壁上土 | 庚子、辛丑 | 装饰、门面、结构 |",
        "| 金箔金 | 壬寅、癸卯 | 薄而亮、名声、艺术 |",
        "| 覆灯火 | 甲辰、乙巳 | 照明、文化、传承 |",
        "| 天河水 | 丙午、丁未 | 高远、雨露、传播 |",
        "| 大驿土 | 戊申、己酉 | 驿站、交通、枢纽 |",
        "| 钗钏金 | 庚戌、辛亥 | 装饰、女性、精细 |",
        "| 桑柘木 | 壬子、癸丑 | 滋养、纺织、后勤 |",
        "| 大溪水 | 甲寅、乙卯 | 奔流、开拓、冒险 |",
        "| 沙中土 | 丙辰、丁巳 | 混杂、过渡、蓄势 |",
        "| 天上火 | 戊午、己未 | 显赫、光明、权威 |",
        "| 石榴木 | 庚申、辛酉 | 多子、结实、秋实 |",
        "| 大海水 | 壬戌、癸亥 | 浩瀚、包容、终极 |",
      ].join("\n"),
      ["纳音", "列表", "三十纳音"],
      "三十纳音与干支配对总表。",
    ),
  );

  /** 三十纳音（每两甲子共享），序与 JIAZI_60 下标 //2 对应 */
  const NAYIN_30 = [
    { ny: "海中金", element: "金", gloss: "如深海之金，主深藏、积蓄、信仰与潜在资源；宜慢热、忌浮躁外露。" },
    { ny: "炉中火", element: "火", gloss: "冶炼之火，主热情、技艺、锻造与转化；宜专注一业。" },
    { ny: "大林木", element: "木", gloss: "成林之木，主组织、扩展、教育与管理；宜合作成势。" },
    { ny: "路旁土", element: "土", gloss: "道路之土，主承载、奔波、服务与中间枢纽；宜务实过渡。" },
    { ny: "剑锋金", element: "金", gloss: "锋利之金，主决断、改革、执法与突破；忌过刚易折。" },
    { ny: "山头火", element: "火", gloss: "高岗之火，主理想、名声、远见与精神追求；宜照亮他人。" },
    { ny: "涧下水", element: "水", gloss: "山涧之水，主细润、渗透、智慧与潜移默化；宜柔性沟通。" },
    { ny: "城头土", element: "土", gloss: "城墙之土，主屏障、制度、守护与边界；宜稳定防御。" },
    { ny: "白蜡金", element: "金", gloss: "白蜡之金，主精炼、礼仪、收敛与审美；宜打磨细节。" },
    { ny: "杨柳木", element: "木", gloss: "杨柳之木，主柔韧、适应、人情与随风调整；宜顺势而为。" },
    { ny: "泉中水", element: "水", gloss: "泉源之水，主清澈、萌芽、起点与内在滋养；宜开源节流。" },
    { ny: "屋上土", element: "土", gloss: "屋上之土，主覆盖、家庭、归宿与保护；宜筑基安家。" },
    { ny: "霹雳火", element: "火", gloss: "雷电之火，主突发、震动、觉醒与快速变革；宜防过激。" },
    { ny: "松柏木", element: "木", gloss: "松柏之木，主耐寒、坚持、正直与长久；宜守志不渝。" },
    { ny: "长流水", element: "水", gloss: "江河长流，主绵延、贸易、流动与持续；宜长远布局。" },
    { ny: "砂中金", element: "金", gloss: "沙里淘金，主潜在价值、待发掘、耐心与筛选；宜厚积薄发。" },
    { ny: "山下火", element: "火", gloss: "山下之火，主文明、教化、内敛热情；宜温和影响。" },
    { ny: "平地木", element: "木", gloss: "平原之木，主普及、民生、广泛生长；宜接地气。" },
    { ny: "壁上土", element: "土", gloss: "墙壁之土，主门面、装饰、结构与形象；宜修葺外在。" },
    { ny: "金箔金", element: "金", gloss: "金箔之金，主薄而亮、名声、艺术与表面光彩；宜重实质。" },
    { ny: "覆灯火", element: "火", gloss: "灯烛之火，主照明、文化、传承与夜读；宜守正道。" },
    { ny: "天河水", element: "水", gloss: "天河之水，主高远、雨露、传播与理想流动；宜志存高远。" },
    { ny: "大驿土", element: "土", gloss: "驿站之土，主交通、枢纽、信息与往来；宜连接四方。" },
    { ny: "钗钏金", element: "金", gloss: "钗钏之金，主精细、装饰、女性气质与审美；宜柔和表达。" },
    { ny: "桑柘木", element: "木", gloss: "桑柘之木，主滋养、纺织、后勤与供给；宜养人养业。" },
    { ny: "大溪水", element: "水", gloss: "溪壑之水，主开拓、冒险、奔流与探索；宜顺势而下。" },
    { ny: "沙中土", element: "土", gloss: "沙中之土，主混杂、过渡、蓄势与未定；宜澄清方向。" },
    { ny: "天上火", element: "火", gloss: "天火之明，主显赫、光明、权威与公开；忌虚浮。" },
    { ny: "石榴木", element: "木", gloss: "石榴之木，主多实、结实、秋收与繁衍；宜结果导向。" },
    { ny: "大海水", element: "水", gloss: "大海之水，主浩瀚、包容、终极与起伏；宜大度亦防泛滥。" },
  ];

  for (let i = 0; i < JIAZI_60.length; i++) {
    const jz = JIAZI_60[i];
    const meta = NAYIN_30[Math.floor(i / 2)];
    chunks.push(
      chunk(
        `bazi-nayin-${jz.ganzhi}`,
        "纳音",
        jz.ganzhi,
        [
          `【${jz.ganzhi}·纳音${meta.ny}】（六十甲子第${jz.index}位）`,
          `纳音五行：${meta.ny}（象${meta.element}）。`,
          meta.gloss,
          `用于年柱、日柱、大运、流年气质参考；须与正五行旺衰、用神一并判断。`,
          `配对干支：与${i % 2 === 0 ? JIAZI_60[i + 1].ganzhi : JIAZI_60[i - 1].ganzhi}同纳音${meta.ny}。`,
        ].join("\n"),
        ["纳音", jz.ganzhi, meta.ny, meta.element, "六十甲子", "列表"],
        `纳音检索键：${jz.ganzhi} → ${meta.ny}。`,
      ),
    );
  }

  return chunks;
}
