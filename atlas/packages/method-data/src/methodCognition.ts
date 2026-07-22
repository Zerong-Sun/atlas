import type { CausalityModel, EvidenceStyle, QuestionDomain, UncertaintyMode } from "./divinationMethods.ts";

export type MethodCognition = {
  questionGrammar: string;
  causalityModel: CausalityModel;
  uncertaintyMode: UncertaintyMode;
  evidenceStyle: EvidenceStyle[];
  bestFor: QuestionDomain[];
  weakFor: QuestionDomain[];
  requiredInputs: string[];
  optionalInputs: string[];
  misuseBoundary: string;
};

const CAUSALITY_LABELS: Record<CausalityModel, string> = {
  "birth-structure": "出生结构与阶段周期",
  "time-position": "时位、处境与变化条件",
  "celestial-cycle": "天体周期与人生节律",
  "symbolic-projection": "图像符号与心理投射",
  "ritual-confirmation": "礼俗仪式与确认机制",
  "folk-association": "日常痕迹与民俗联想",
  "spatial-flow": "时空方位与资源布局",
  "textual-admonition": "文本劝诫与典故修辞",
};

const CAUSALITY_EXPLANATIONS: Record<CausalityModel, string> = {
  "birth-structure": "出生时刻形成长期结构，后续周期触发变化。",
  "time-position": "当前处境、位置、时机与行动关系共同构成判断。",
  "celestial-cycle": "天体周期被用来描述阶段压力、身份转向和人生节律。",
  "symbolic-projection": "抽取到的图像和符号让心理动力与情境关系显形。",
  "ritual-confirmation": "通过礼俗、仪式或确认机制帮助行动定心。",
  "folk-association": "从日常痕迹、梦境、身体观察或民俗联想进入解释。",
  "spatial-flow": "时间、空间、方位和资源分布共同影响行动策略。",
  "textual-admonition": "用文本、典故和劝诫修辞把问题转成行动提醒。",
};

const UNCERTAINTY_LABELS: Record<UncertaintyMode, string> = {
  trend: "趋势倾向",
  timing: "宜动宜守与时机条件",
  "yes-no": "是非确认",
  "psychological-mirroring": "心理显影",
  admonition: "劝诫提示",
  "event-narrative": "事件叙事",
  "strategic-positioning": "策略布局",
  reflection: "反思练习",
};

const UNCERTAINTY_EXPLANATIONS: Record<UncertaintyMode, string> = {
  trend: "给出阶段倾向，而不是保证单一事件。",
  timing: "判断宜动、宜守，以及变化需要满足的条件。",
  "yes-no": "把问题收束为可、不可、未明或需要重问。",
  "psychological-mirroring": "照见心理动力、盲点和下一步姿态。",
  admonition: "以劝诫、等待或修正方向回应不确定性。",
  "event-narrative": "把现实线索组织成近期事件叙事。",
  "strategic-positioning": "把不确定性转成时机、方位、资源和阻力的布局。",
  reflection: "作为文化探索和自我反思材料。",
};

const profile = (
  questionGrammar: string,
  causalityModel: CausalityModel,
  uncertaintyMode: UncertaintyMode,
  evidenceStyle: EvidenceStyle[],
  bestFor: QuestionDomain[],
  weakFor: QuestionDomain[],
  misuseBoundary: string,
  requiredInputs: string[] = ["questionText"],
  optionalInputs: string[] = ["context"]
): MethodCognition => ({
  questionGrammar,
  causalityModel,
  uncertaintyMode,
  evidenceStyle,
  bestFor,
  weakFor,
  requiredInputs,
  optionalInputs,
  misuseBoundary,
});

export const METHOD_COGNITION: Record<string, MethodCognition> = {
  bazi: profile(
    "这件事是否符合你的长期命局结构和当前大运流年节律？",
    "birth-structure",
    "trend",
    ["calculated-chart", "classic-text"],
    ["life-structure", "career", "relationship"],
    ["specific-event", "timing", "daily-guidance"],
    "不适合回答即时是非、具体号码或短期随机事件。",
    ["birthDate", "birthTime", "birthPlace"],
    ["gender", "currentLocation"]
  ),
  "bazi-relationship": profile(
    "两个人的长期结构、关系角色和五行互动如何互补或相冲？",
    "birth-structure",
    "trend",
    ["calculated-chart", "classic-text"],
    ["relationship", "life-structure"],
    ["daily-guidance", "specific-event"],
    "不适合用来给关系下绝对判决，也不应替代沟通和现实观察。",
    ["birthDateA", "birthTimeA", "birthPlaceA", "birthDateB", "birthTimeB", "birthPlaceB"],
    ["relationshipType", "context"]
  ),
  tarot: profile(
    "这件事中有哪些心理动力、盲点和下一步行动姿态？",
    "symbolic-projection",
    "psychological-mirroring",
    ["drawn-card", "user-narrative"],
    ["relationship", "inner-state", "specific-event", "daily-guidance"],
    ["life-structure", "space"],
    "不适合要求绝对预测、医学诊断或替用户做不可逆决定。",
    ["questionText", "spread"],
    ["deck", "reversalPolicy"]
  ),
  dream: profile(
    "梦中的重复意象、醒后情绪和人生阶段之间有什么象征关系？",
    "folk-association",
    "reflection",
    ["dream-symbol", "user-narrative", "classic-text"],
    ["dream", "inner-state", "life-structure"],
    ["timing", "specific-event"],
    "不把梦境当作确定预言；强烈创伤或持续睡眠问题应寻求专业支持。",
    ["dreamText"],
    ["emotions", "symbols", "recurringPattern"]
  ),
  iching: profile(
    "此时此位是否宜动？变化需要满足什么条件？",
    "time-position",
    "timing",
    ["cast-symbol", "classic-text"],
    ["specific-event", "timing", "career", "relationship"],
    ["life-structure"],
    "不适合无限重复追问同一问题，也不应替代现实调查。",
    ["questionText", "castingMethod"],
    ["context"]
  ),
  qimen: profile(
    "此行动在当前时空局势中，资源、阻力、方向和时机如何分布？",
    "spatial-flow",
    "strategic-positioning",
    ["calculated-chart", "observed-sign"],
    ["timing", "specific-event", "career", "space"],
    ["inner-state", "dream"],
    "不适合脱离现实信息做高风险决策，也不适合泛泛人生画像。",
    ["questionText", "currentTime", "currentLocation"],
    ["direction", "actorRole"]
  ),
  ziwei: profile(
    "人生各领域的宫位结构、主星组合和阶段流转如何组织这件事？",
    "birth-structure",
    "trend",
    ["calculated-chart", "classic-text"],
    ["life-structure", "career", "relationship"],
    ["daily-guidance", "specific-event"],
    "不适合做即时是非判断，也不应把宫位解读当成不可改变的命令。",
    ["birthDate", "birthTime", "gender"],
    ["calendar", "currentYear"]
  ),
  liuyao: profile(
    "这件具体事情的用神、世应、动变与旺衰如何显示成败和阻力？",
    "time-position",
    "timing",
    ["cast-symbol", "classic-text"],
    ["specific-event", "timing", "relationship", "career"],
    ["life-structure", "dream"],
    "适合一事一占，不适合反复追问同一问题或替代事实核查。",
    ["questionText", "castingMethod"],
    ["questionCategory", "context"]
  ),
  meihua: profile(
    "眼前的数字、时间或外应如何转成体用生克与即时象意？",
    "time-position",
    "timing",
    ["cast-symbol", "observed-sign", "classic-text"],
    ["specific-event", "timing", "daily-guidance"],
    ["life-structure"],
    "适合轻量即时判断，不适合承载重大决策的唯一依据。",
    ["questionText", "mode"],
    ["numbers", "timestamp", "observedSign"]
  ),
  western: profile(
    "近期行运正在触发哪些人生领域、责任压力与身份转向？",
    "celestial-cycle",
    "trend",
    ["calculated-chart", "user-narrative"],
    ["life-structure", "career", "relationship", "inner-state"],
    ["specific-event", "daily-guidance"],
    "不适合把行运解释成单一事件保证，也不适合替代心理或医疗建议。",
    ["birthDate", "birthTime", "birthPlace"],
    ["currentLocation", "transitDate"]
  ),
  vedic: profile(
    "当前 Dasha、月宿和恒星黄道结构如何显示长期阶段与业力主题？",
    "celestial-cycle",
    "trend",
    ["calculated-chart", "classic-text"],
    ["life-structure", "career", "relationship", "timing"],
    ["daily-guidance", "inner-state"],
    "不适合把 Dasha 当作单一事件保证；具体判断需说明分盘和流派边界。",
    ["birthDate", "birthTime", "birthPlace"],
    ["timezone", "ayanamsa"]
  ),
  numerology: profile(
    "姓名、生日和年度数字如何组织人格主题、周期和练习方向？",
    "textual-admonition",
    "reflection",
    ["user-narrative", "observed-sign"],
    ["life-structure", "daily-guidance", "inner-state"],
    ["specific-event", "space"],
    "跨语言姓名口径会影响结果，不适合作为严肃决策的唯一依据。",
    ["birthDate"],
    ["name", "referenceYear"]
  ),
  runes: profile(
    "当前挑战需要哪种意志、保护、承诺或行动姿态？",
    "symbolic-projection",
    "reflection",
    ["cast-symbol", "user-narrative"],
    ["inner-state", "specific-event", "daily-guidance"],
    ["life-structure", "space"],
    "适合作为行动提醒和内在校准，不应包装成确定预言。",
    ["questionText", "spread"],
    ["allowReversed"]
  ),
  geomancy: profile(
    "随机点画生成的图形如何落入宫位，显示人、资源、位置和成败流向？",
    "time-position",
    "event-narrative",
    ["cast-symbol", "classic-text"],
    ["specific-event", "timing", "space", "career"],
    ["inner-state", "dream"],
    "适合具体事项，不适合泛泛人生画像或脱离现实信息的高风险判断。",
    ["questionText", "mothers"],
    ["questionType"]
  ),
  lot: profile(
    "签文、典故和事项分类如何把问题转成劝诫、等待或行动提醒？",
    "textual-admonition",
    "admonition",
    ["ritual-result", "classic-text"],
    ["daily-guidance", "specific-event", "relationship"],
    ["life-structure"],
    "不适合把签诗当成命令；应保留礼俗语境和现实判断。",
    ["questionText", "temple"],
    ["context"]
  ),
  jiaobei: profile(
    "这个问题是否足够清晰，能够被礼俗确认机制回答为可、不可或未明？",
    "ritual-confirmation",
    "yes-no",
    ["ritual-result", "user-narrative"],
    ["specific-event", "timing", "daily-guidance"],
    ["life-structure", "inner-state"],
    "只适合清晰的是/否请示，不适合复杂规划或无限连续重问。",
    ["yesNoQuestion"],
    ["sessionContext"]
  ),
  xiangmian: profile(
    "身体观察项如何作为文化象征，帮助记录状态、气质和自我修正方向？",
    "folk-association",
    "reflection",
    ["observed-sign", "user-narrative"],
    ["inner-state", "daily-guidance"],
    ["relationship", "specific-event"],
    "不得用于外貌歧视、身份价值判断或医学诊断。",
    ["observations"],
    ["questionText"]
  ),
  palmistry: profile(
    "掌纹、掌丘和用手习惯如何象征行动模式、表达方式和阶段经验？",
    "folk-association",
    "reflection",
    ["observed-sign", "user-narrative"],
    ["inner-state", "life-structure", "daily-guidance"],
    ["specific-event", "space"],
    "不做健康诊断，不用掌纹评价他人价值或能力。",
    ["hand", "observations"],
    ["questionText"]
  ),
  fengshui: profile(
    "空间方位、坐向、九宫与身体感如何影响居住和行动秩序？",
    "spatial-flow",
    "strategic-positioning",
    ["calculated-chart", "observed-sign", "classic-text"],
    ["space", "career", "daily-guidance"],
    ["inner-state", "dream"],
    "不适合制造恐惧或替代建筑、消防、法律等专业判断。",
    ["spaceType", "direction"],
    ["birthYear", "timestamp", "observations"]
  ),
  astrodice: profile(
    "行星、星座、宫位三元句如何快速提示行动动词、风格和场域？",
    "symbolic-projection",
    "reflection",
    ["cast-symbol", "user-narrative"],
    ["daily-guidance", "specific-event", "inner-state"],
    ["life-structure"],
    "适合快速启发，不适合替代完整本命盘或严肃预测。",
    ["questionText"],
    ["seed"]
  ),
  lenormand: profile(
    "具体事件中的人物、消息、阻力和时间线如何被牌间语法拼成现实句子？",
    "symbolic-projection",
    "event-narrative",
    ["drawn-card", "user-narrative"],
    ["specific-event", "relationship", "timing"],
    ["life-structure", "space"],
    "适合现实线索叙事，不适合抽象人生定论。",
    ["questionText", "spread"],
    ["significator"]
  ),
  oracle: profile(
    "当前情绪、照护需求和练习方向需要哪一种温和提醒？",
    "symbolic-projection",
    "reflection",
    ["drawn-card", "user-narrative"],
    ["inner-state", "daily-guidance"],
    ["specific-event", "timing"],
    "适合自我照护和日记练习，不替代心理治疗或危机干预。",
    ["questionText"],
    ["theme", "spread"]
  ),
  coffee: profile(
    "杯痕图形和位置区间如何讲述近期氛围、消息和生活小转折？",
    "folk-association",
    "event-narrative",
    ["observed-sign", "user-narrative"],
    ["daily-guidance", "relationship", "specific-event"],
    ["life-structure", "space"],
    "适合作为民俗叙事和轻量提醒，不适合严肃预测或重大决定。",
    ["questionText"],
    ["cupZones", "observedShapes"]
  ),
  scrying: profile(
    "凝视中浮现的颜色、形状和重复意象如何整理成冥想主题？",
    "symbolic-projection",
    "reflection",
    ["observed-sign", "user-narrative"],
    ["inner-state", "dream", "daily-guidance"],
    ["specific-event", "career"],
    "偏冥想和投射整理，不应宣称看见确定事实或替代心理支持。",
    ["questionText"],
    ["crystalId", "visualNotes"]
  ),
};

export function getMethodCognition(methodId: string): MethodCognition | undefined {
  return METHOD_COGNITION[methodId];
}

export function formatCausalityModel(model: CausalityModel): string {
  return CAUSALITY_LABELS[model];
}

export function explainCausalityModel(model: CausalityModel): string {
  return CAUSALITY_EXPLANATIONS[model];
}

export function formatUncertaintyMode(mode: UncertaintyMode): string {
  return UNCERTAINTY_LABELS[mode];
}

export function explainUncertaintyMode(mode: UncertaintyMode): string {
  return UNCERTAINTY_EXPLANATIONS[mode];
}
