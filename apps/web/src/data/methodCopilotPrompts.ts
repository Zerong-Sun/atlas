import { getMethod } from "@/data/divinationMethods";

export type MethodCopilotConfig = {
  title: string;
  subtitle: string;
  quickPrompts: string[];
  systemSkill: string;
};

export type MethodCopilotContext = {
  workbench?: boolean;
};

const WORKBENCH_BOUNDARY =
  "边界：本页为参考文库 + 模板化 draft，按输入 hash 选象征填句，非真实演算或投掷。";

const BASE_RULES = `你是「诸象 Atlas」侧栏解说助手，只回答与当前占卜体系相关的术语、结构与断法问题。

回复原则：
1. 用该体系的专业语言解释，但让初学者能听懂；必要时对比常见误解。
2. 若问题超出当前体系，简短说明并引导回正题。
3. 不做医疗、法律、投资之确定性结论；涉及重大决策时提醒「仅供参考」。
4. 回答简洁，通常 2–4 段，每段不超过 3 句。

示意要求：
- 在 diagram 字段用纯文本 ASCII 或分行结构图示意（如牌阵位置、宫位、卦爻、五行生克），不超过 12 行、每行不超过 28 字。
- 若无需图示，diagram 留空字符串。

返回 JSON：
{
  "answer": "正文解释",
  "diagram": "可选 ASCII 示意",
  "relatedTerms": ["相关术语1", "相关术语2"]
}`;

const METHOD_SKILLS: Record<string, Omit<MethodCopilotConfig, "title" | "subtitle">> = {
  bazi: {
    quickPrompts: ["十神是什么？", "用神怎么取？", "大运和流年区别", "日主强弱怎么看？"],
    systemSkill: `当前体系：八字命盘（四柱、十神、用神、大运流年）。
重点解释：天干地支、藏干、十神、格局、喜用神、刑冲合害、大运流年与本命的关系。`,
  },
  "bazi-relationship": {
    quickPrompts: ["日支为什么重要？", "六合和六冲区别", "配偶星怎么看？", "五行互补是什么意思？"],
    systemSkill: `当前体系：八字缘合（双人四柱交叉、日支夫妻宫、五行互补、十神互动）。
重点解释：两人日支合冲刑害、日主五行相生相克、四柱交叉、身强身弱互补、配偶星与跨盘神煞。
边界：只做趋势与相处模式分析，不作「注定合/不合」的绝对论断。`,
  },
  tarot: {
    quickPrompts: ["逆位是什么意思？", "大阿卡那 vs 小阿卡那", "三张牌阵怎么读？", "牌面组合如何看？"],
    systemSkill: `当前体系：塔罗（大/小阿卡那、牌阵、正逆位、元素与数字）。
重点解释：牌义、位置语义、正逆位差异、牌组结构、常见牌阵与组合读法。`,
  },
  dream: {
    quickPrompts: ["荣格阴影是什么？", "反复出现的意象", "中国梦占怎么看？", "噩梦要不要当真？"],
    systemSkill: `当前体系：占梦（中国梦占、荣格象征、民俗文本、精神反思）。
重点解释：梦中符号、原型、情结、重复意象；强调非预言、宜自省。`,
  },
  liuyao: {
    quickPrompts: ["世应是什么？", "六亲指什么？", "用神怎么定？", "动爻变卦怎么看？"],
    systemSkill: `当前体系：纳甲六爻（铜钱起卦、世应、六亲、用神、旺衰、动变）。
重点解释：卦爻结构、纳甲、六亲、用神取法、旺相休囚、动爻与世应关系。`,
  },
  iching: {
    quickPrompts: ["本卦变卦区别", "爻辞怎么用？", "与纳甲六爻有何不同？", "一事一占是什么意思？"],
    systemSkill: `当前体系：周易六十四卦（铜钱起卦、本卦、变卦、卦辞象辞）。
重点解释：八卦、卦体结构、动变逻辑、卦辞爻辞在占断中的角色。
边界：本页为真实铜钱演卦；纳甲世应六亲见「纳甲六爻」；参考文库模板工作台见 /methods/iching/workbench。`,
  },
  "iching-workbench": {
    quickPrompts: ["本卦变卦区别", "八卦取象怎么用？", "与纳甲六爻有何不同？", "模板草稿怎么读？"],
    systemSkill: `当前体系：易经卦象参考工作台（本卦、动爻、变卦、卦辞爻辞、八卦取象）。
重点解释：八卦、卦体结构、动变逻辑、卦辞爻辞在占断中的角色。
${WORKBENCH_BOUNDARY} 纳甲世应六亲见「纳甲六爻」。`,
  },
  meihua: {
    quickPrompts: ["体用生克怎么看？", "外应是什么？", "互卦变卦区别", "数字取卦怎么用？"],
    systemSkill: `当前体系：梅花易数（时空取数、体用互变、五行生克、外应校准）。
重点解释：体卦用卦、互卦变卦、生克比和、外应取象与错综卦。
${WORKBENCH_BOUNDARY}`,
  },
  vedic: {
    quickPrompts: ["Dasha 是什么？", "Nakshatra 怎么看？", "Rahu Ketu 指什么？", "与西洋占星有何不同？"],
    systemSkill: `当前体系：吠陀占星（Rashi 盘、Dasha 周期、Nakshatra、宫位与行星尊卑）。
重点解释：月亮星座、上升、南北交、Dasha 阶段主题与转运思路。
${WORKBENCH_BOUNDARY}`,
  },
  numerology: {
    quickPrompts: ["生命路径数是什么？", "命运数和灵魂冲动数区别", "个人年怎么算？", "挑战数怎么看？"],
    systemSkill: `当前体系：数字命理（生命路径、姓名数、个人年/月、挑战数与成熟数）。
重点解释：核心数字含义、周期节奏、优势与挑战的练习方向。
${WORKBENCH_BOUNDARY}`,
  },
  runes: {
    quickPrompts: ["卢恩符文怎么读？", "正逆位重要吗？", "三符阵位置含义", "九符阵怎么用？"],
    systemSkill: `当前体系：卢恩符文（单符、三符、九符阵、符文原义与组合）。
重点解释：符文本义、阵位语义、保护边界与行动提醒。
${WORKBENCH_BOUNDARY}`,
  },
  geomancy: {
    quickPrompts: ["四母图是什么？", "法庭图怎么读？", "十六图形含义", "十二宫位怎么用？"],
    systemSkill: `当前体系：地占 Geomancy（四母四女、见证人、审判图、十二宫落点）。
重点解释：图形性质、宫位映射、两端见证与整体倾向。
${WORKBENCH_BOUNDARY}`,
  },
  jiaobei: {
    quickPrompts: ["圣杯笑杯阴杯区别", "三圣杯确认是什么？", "为什么只能问是非？", "可以连续重问吗？"],
    systemSkill: `当前体系：杯筊问事（圣杯、笑杯、阴杯、连续确认与问句边界）。
重点解释：结果含义、确认强度、问句校准与次数限制。
${WORKBENCH_BOUNDARY}`,
  },
  xiangmian: {
    quickPrompts: ["三停是什么？", "十二宫怎么看？", "气色能判断什么？", "面相能断健康吗？"],
    systemSkill: `当前体系：面相（三停五官、十二宫、气色与纹路观察）。
重点解释：区域观察、气质倾向、表达习惯与修正建议。
${WORKBENCH_BOUNDARY} 不做医疗或身份诊断。`,
  },
  palmistry: {
    quickPrompts: ["三大主线是什么？", "掌丘代表什么？", "左右手区别", "掌纹会变吗？"],
    systemSkill: `当前体系：手相（生命线、智慧线、感情线、事业线与掌丘）。
重点解释：主线副线、掌丘能量、阶段变化与行动习惯。
${WORKBENCH_BOUNDARY} 不做健康诊断。`,
  },
  astrodice: {
    quickPrompts: ["占星骰三颗分别代表什么？", "行星星座宫位怎么合成一句？", "适合问什么问题？", "与本命盘区别"],
    systemSkill: `当前体系：占星骰子（行星、星座、宫位三骰组合语法）。
重点解释：行星动词、星座风格、宫位场域与快速决策读法。
${WORKBENCH_BOUNDARY}`,
  },
  oracle: {
    quickPrompts: ["神谕卡和塔罗区别", "肯定语怎么用？", "主题卡怎么选？", "适合什么类型问题？"],
    systemSkill: `当前体系：神谕卡（主题卡、意象、肯定语与反思练习）。
重点解释：情绪照护、边界与信任、小练习与日记问题。
${WORKBENCH_BOUNDARY} 不替代心理治疗。`,
  },
  coffee: {
    quickPrompts: ["杯壁杯底位置含义", "常见图案象征", "图形模糊怎么办？", "咖啡占卜起源"],
    systemSkill: `当前体系：咖啡渣占卜（杯壁杯底图案、位置区间与象征故事）。
重点解释：图案识别、位置判断、组合叙事与近期提醒。
${WORKBENCH_BOUNDARY}`,
  },
  scrying: {
    quickPrompts: ["凝视记录怎么写？", "颜色象征常见说法", "直觉和事实怎么区分？", "重复意象意义"],
    systemSkill: `当前体系：水晶凝视（颜色、形状、情绪与重复意象记录）。
重点解释：意象整理、冥想建议、情绪线索与现实校准。
${WORKBENCH_BOUNDARY}`,
  },
  qimen: {
    quickPrompts: ["九宫格怎么读？", "八门代表什么？", "值符值使是什么？", "时空起局什么意思？"],
    systemSkill: `当前体系：奇门遁甲（九宫、八门、九星、八神、时空起局）。
重点解释：盘面结构、门星神、用神取象、时空与事项匹配。`,
  },
  ziwei: {
    quickPrompts: ["十二宫各管什么？", "主星和辅星区别", "大限怎么看？", "四化是什么？"],
    systemSkill: `当前体系：紫微斗数（十二宫、主星辅星、四化、大限流年）。
重点解释：命宫身宫、宫位主题、星曜性质、四化飞星、大限流转。`,
  },
  western: {
    quickPrompts: ["上升星座是什么？", "相位怎么理解？", "宫位和星座区别", "行运怎么看？"],
    systemSkill: `当前体系：西洋占星（本命盘、宫位、相位、行运）。
重点解释：十大行星、十二星座、十二宫位、主要相位、行运与本命互动。`,
  },
  fengshui: {
    quickPrompts: ["坐向怎么定？", "九宫飞星是什么？", "峦头与理气区别", "煞气常见有哪些？"],
    systemSkill: `当前体系：风水罗盘（方位、坐向、九宫飞星、峦头理气）。
重点解释：罗盘方位、八卦九宫、飞星入中、形峦与理气配合。`,
  },
  lenormand: {
    quickPrompts: ["雷诺曼牌语法", "九宫格怎么铺？", "牌义和塔罗区别", "指示牌是什么？"],
    systemSkill: `当前体系：雷诺曼牌（36 张、牌间语法、九宫格、日签）。
重点解释：牌义、组合读法、线性叙事、与塔罗的体系差异。`,
  },
  lot: {
    quickPrompts: ["签诗怎么断？", "上中下签区别", "典故有什么用？", "一事一签要注意什么？"],
    systemSkill: `当前体系：抽签签诗（签文、解曰、典故、事项分类）。
重点解释：签级、签文层次、典故取象、事项对应与心诚则灵的传统语境。`,
  },
};

const GENERAL_CONFIG: MethodCopilotConfig = {
  title: "占法导览",
  subtitle: "术语 · 结构 · 断法入门",
  quickPrompts: ["什么是用神？", "一事一占是什么意思？", "正逆位/动静怎么理解？", "如何选适合自己的占法？"],
  systemSkill: `当前场景：诸象占法目录，用户尚未进入具体占法或正在浏览。
可概述各体系共性（起卦/抽牌/排盘、取象、断语、应期），并引导用户进入对应占法页面获得更专业解答。`,
};

const ANALYSIS_RULES = `你是「诸象 Atlas」报告解析助手。用户已生成一份占卜/命理报告，附在「当前页面报告」中。

解析原则：
1. 必须基于报告中的具体数据（四柱、牌面、卦爻、星盘等）作答，引用关键要素，不可泛泛而谈。
2. 用该体系专业语言解释，同时让初学者能跟上；必要时点出常见误读。
3. 不做医疗、法律、投资之确定性结论；涉及重大决策时提醒「仅供参考」。
4. 输出详尽但有条理，通常 5–7 个小节。

返回 JSON：
{
  "answer": "完整正文（可作为 fallback 展示）",
  "sections": [
    { "title": "总览", "content": "…" },
    { "title": "核心依据", "content": "…" },
    { "title": "趋势判断", "content": "…" },
    { "title": "风险与矛盾", "content": "…" },
    { "title": "行动建议", "content": "…" },
    { "title": "可追问点", "content": "…" }
  ],
  "diagram": "可选 ASCII 结构示意，不超过 12 行",
  "relatedTerms": ["相关术语1", "相关术语2"],
  "highlights": ["关键发现1", "关键发现2"]
}`;

const ANALYSIS_FOCUS: Record<string, string> = {
  bazi: "重点：用神、格局、十神组合、大运流年与本命互动。",
  "bazi-relationship": "重点：双人日支合冲、五行互补、十神互动、相处模式与修复建议。",
  tarot: "重点：牌阵位置语义、正逆位、牌组组合与问题语境。",
  dream: "重点：梦中符号、多流派视角差异、自省而非预言。",
  liuyao: "重点：用神旺衰、世应、动变与世应关系。",
  iching: "重点：本卦变卦、爻位与爻辞在事项中的角色。",
  "iching-workbench": "重点：模板草稿中的主象、预测维度与参考文库对照；提醒非真实演卦。",
  meihua: "重点：体用生克、互变、外应与取数来源。",
  vedic: "重点：Dasha 阶段、月宿、宫位主题与业力表述。",
  numerology: "重点：核心数字、周期数与挑战练习。",
  runes: "重点：符文本义、阵位与组合保护边界。",
  geomancy: "重点：图形落宫、见证关系与审判倾向。",
  jiaobei: "重点：问句清晰度、结果类型与确认强度。",
  xiangmian: "重点：三停五官观察项与气质倾向，不作诊断。",
  palmistry: "重点：主线掌丘主题与阶段习惯，不作健康结论。",
  astrodice: "重点：行星星座宫位合成语法与行动场域。",
  oracle: "重点：主题卡、肯定语与情绪照护练习。",
  coffee: "重点：图案位置、象征故事与近期提醒。",
  scrying: "重点：意象颜色形状、情绪线索与冥想校准。",
  qimen: "重点：值符值使、门星神、格局与应期方位。",
  ziwei: "重点：命宫身宫、主星辅星、四化与大限流转。",
  western: "重点：上升、宫位、主要相位与行运互动。",
  fengshui: "重点：坐向、飞星组合、流年煞星与空间建议。",
  lenormand: "重点：牌间语法、中心牌与线性叙事。",
  lot: "重点：签级、签文层次、典故取象与事项对应。",
};

function resolveCopilotSkillKey(methodId: string | null, context?: MethodCopilotContext): string | null {
  if (!methodId) return null;
  if (context?.workbench && methodId === "iching") return "iching-workbench";
  return methodId;
}

export function getMethodCopilotAnalysisSkill(
  methodId: string | null,
  context?: MethodCopilotContext,
): string {
  const method = methodId ? getMethod(methodId) : null;
  const title = method?.title ?? "占卜报告";
  const skillKey = resolveCopilotSkillKey(methodId, context);
  const focus =
    (skillKey && ANALYSIS_FOCUS[skillKey]) ||
    (methodId && ANALYSIS_FOCUS[methodId]) ||
    "按该体系传统术语与结构，逐层拆解报告要点。";
  const base =
    skillKey && METHOD_SKILLS[skillKey]?.systemSkill
      ? METHOD_SKILLS[skillKey].systemSkill
      : `当前体系：${title}。按报告中的符号与结构进行深度解读。`;
  return `${base}\n\n${focus}\n\n${ANALYSIS_RULES}`;
}

export function getMethodCopilotPromptsWithReport(
  methodId: string | null,
  hasReport: boolean,
  context?: MethodCopilotContext,
): string[] {
  const config = getMethodCopilotConfig(methodId, context);
  if (!hasReport) return config.quickPrompts;
  return ["解析本次报告", "用初学者能懂的话重讲一遍", "这份结果最大的风险点是什么？", ...config.quickPrompts.slice(0, 2)];
}

export function getMethodCopilotConfig(
  methodId: string | null,
  context?: MethodCopilotContext,
): MethodCopilotConfig {
  if (!methodId) return { ...GENERAL_CONFIG, systemSkill: GENERAL_CONFIG.systemSkill + "\n\n" + BASE_RULES };

  const method = getMethod(methodId);
  const skillKey = resolveCopilotSkillKey(methodId, context);
  const skill = skillKey ? METHOD_SKILLS[skillKey] : undefined;
  const title = method?.title ?? methodId;
  const subtitle = method?.tradition ? `${method.tradition} · 术语解说` : "术语 · 结构 · 断法";

  if (skill) {
    return {
      title,
      subtitle,
      quickPrompts: skill.quickPrompts,
      systemSkill: skill.systemSkill + "\n\n" + BASE_RULES,
    };
  }

  return {
    title,
    subtitle,
    quickPrompts: [`${title}的基本流程`, "这个体系的核心符号", "初学者常犯的错误", "如何理解本次结果？"],
    systemSkill: `当前体系：${title}（${method?.tradition ?? "占卜"}）。
${method?.subtitle ?? ""}
按该体系传统术语与结构回答，不确定处标明「各家说法不一」。\n\n${BASE_RULES}`,
  };
}
