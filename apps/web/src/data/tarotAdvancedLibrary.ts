import type { TarotCard } from "./tarotDeck";

export type TarotSpreadDefinition = {
  id: string;
  name: string;
  topic: "通用" | "关系" | "事业" | "财务" | "心理";
  difficulty: "入门" | "进阶" | "深度";
  positions: string[];
  useCase: string;
  readingKey: string;
};

export type TarotPairRule = {
  id: string;
  cards: string[];
  theme: string;
  meaning: string;
  caution: string;
};

export type TarotReversalLayer = {
  layer: string;
  cue: string;
  reading: string;
};

export type TarotScenarioLens = {
  scenario: "关系" | "事业" | "财务" | "心理";
  focus: string;
  majorArcanaKey: string;
  suits: Record<string, string>;
  outputSections: string[];
};

export type TarotSenseRecord = {
  field: string;
  prompt: string;
  use: string;
};

export const TAROT_SPREAD_LIBRARY: TarotSpreadDefinition[] = [
  { id: "one-card", name: "一牌校准", topic: "通用", difficulty: "入门", positions: ["当前主象"], useCase: "每日提醒、快速确认状态。", readingKey: "只读一个核心动作，不扩写成完整预测。" },
  { id: "three-timeline", name: "三牌时间线", topic: "通用", difficulty: "入门", positions: ["过去/成因", "现在/核心", "趋势/建议"], useCase: "看一件事的来龙去脉。", readingKey: "中间牌定主题，前后牌定因果与行动。" },
  { id: "cross", name: "小十字阵", topic: "通用", difficulty: "进阶", positions: ["核心", "阻力", "显性资源", "隐性资源", "建议"], useCase: "问题有阻力但不需要完整凯尔特十字时。", readingKey: "阻力牌不必视为坏牌，常表示需要补足的能力。" },
  { id: "celtic-cross", name: "凯尔特十字", topic: "通用", difficulty: "深度", positions: ["现状", "挑战", "根源", "过去", "可能趋势", "近未来", "自我", "环境", "希望/恐惧", "结果"], useCase: "复杂议题、阶段复盘、长期趋势。", readingKey: "先读中轴，再读环境与希望恐惧，最后读结果牌的条件性。" },
  { id: "relationship-mirror", name: "关系镜像", topic: "关系", difficulty: "进阶", positions: ["我方状态", "对方状态", "显性互动", "隐性需求", "下一步"], useCase: "恋爱、复合、合作、亲密关系。", readingKey: "两端人物牌看角色，中间牌看互动质量。" },
  { id: "choice-gate", name: "双选门", topic: "通用", difficulty: "进阶", positions: ["方案A收益", "方案A代价", "方案B收益", "方案B代价", "选择原则"], useCase: "两个方案比较。", readingKey: "不要只选更吉的牌，要看代价是否可承担。" },
  { id: "career-map", name: "事业地图", topic: "事业", difficulty: "进阶", positions: ["当前岗位", "核心能力", "外部机会", "内部阻力", "三十日行动"], useCase: "换工作、项目推进、职场定位。", readingKey: "权杖看行动，星币看资源，宝剑看沟通制度。" },
  { id: "money-flow", name: "金钱流", topic: "财务", difficulty: "进阶", positions: ["收入入口", "支出漏洞", "资源沉淀", "风险提醒", "调整动作"], useCase: "预算、投资心态、经营复盘。", readingKey: "财务牌阵重现实条件，不把好牌直接读成收益。" },
  { id: "shadow-dialogue", name: "阴影对话", topic: "心理", difficulty: "深度", positions: ["我看见的自己", "我回避的自己", "重复模式", "身体信号", "整合练习"], useCase: "情绪、梦境、自我探索。", readingKey: "恶魔、月亮、高塔在此阵中常是觉察入口，而非坏结论。" },
];

export const TAROT_PAIR_RULES: TarotPairRule[] = [
  { id: "lovers-devil", cards: ["恋人", "恶魔"], theme: "选择与依附", meaning: "关系中同时存在吸引和绑定，关键是区分价值选择与欲望惯性。", caution: "不要把强烈化学反应直接读成稳定承诺。" },
  { id: "magician-high-priestess", cards: ["魔术师", "女祭司"], theme: "显化与隐藏", meaning: "一张牌要求行动，一张牌要求倾听，表示需要在表达前确认隐性信息。", caution: "若两者皆逆位，防漂亮话和信息不透明。" },
  { id: "tower-star", cards: ["高塔", "星星"], theme: "崩塌后的疗愈", meaning: "旧结构被打破后，恢复和愿景开始出现。", caution: "星星不是立刻变好，而是给重建方向。" },
  { id: "death-world", cards: ["死神", "世界"], theme: "结束与完成", meaning: "这是一个循环正式收束，不适合继续用旧身份维持旧事。", caution: "需要完成告别仪式或交付动作。" },
  { id: "emperor-hierophant", cards: ["皇帝", "教皇"], theme: "规则与体系", meaning: "权威、制度、传统标准成为局面中心。", caution: "在关系题里可能提示僵硬、父权或外部规范压力。" },
  { id: "moon-seven-cups", cards: ["月亮", "圣杯七"], theme: "迷雾与幻想", meaning: "情绪投射和多重想象增强，需要事实校准。", caution: "避免在信息不足时做终局承诺。" },
  { id: "swords-three-cups-three", cards: ["宝剑三", "圣杯三"], theme: "伤害与群体", meaning: "社交、第三方或朋友圈信息可能牵动伤痛。", caution: "勿急于传播未经确认的说法。" },
  { id: "pentacles-ace-pentacles-ten", cards: ["星币一", "星币十"], theme: "种子到家业", meaning: "新资源有长期沉淀潜力，适合从小投入做结构。", caution: "初始机会仍需预算、合同和耐心。" },
];

export const TAROT_REVERSAL_LAYERS: TarotReversalLayer[] = [
  { layer: "阻滞", cue: "正位能量存在但流不动。", reading: "先找卡点：时间、资源、信心、外部许可。" },
  { layer: "过量", cue: "牌义被放大到失衡。", reading: "例如皇帝逆位可能是控制过度，圣杯逆位可能是情绪过量。" },
  { layer: "内化", cue: "事件不一定外显，而是发生在心理层。", reading: "用于心理牌阵时，逆位常代表尚未说出口的内在经验。" },
  { layer: "延迟", cue: "事情会发生，但窗口后移。", reading: "结合牌阵位置判断是等待、拖延，还是需要补条件。" },
  { layer: "释放", cue: "阴影牌逆位不总是更糟。", reading: "恶魔、月亮、宝剑九逆位可能表示松绑、清醒或焦虑下降。" },
];

export const TAROT_SCENARIO_LENSES: TarotScenarioLens[] = [
  { scenario: "关系", focus: "互动模式、需求差异、承诺质量。", majorArcanaKey: "恋人、女祭司、恶魔、节制看关系选择与亲密边界。", suits: { 权杖: "吸引和主动性", 圣杯: "情感流动", 宝剑: "沟通与伤害", 星币: "稳定承诺" }, outputSections: ["双方状态", "互动张力", "真实需求", "下一步边界"] },
  { scenario: "事业", focus: "目标、能力、组织结构、机会窗口。", majorArcanaKey: "皇帝、战车、命运之轮、审判看职业阶段转折。", suits: { 权杖: "项目推进", 圣杯: "团队氛围", 宝剑: "制度沟通", 星币: "岗位资源" }, outputSections: ["职业主轴", "资源阻力", "可执行动作", "复盘时间"] },
  { scenario: "财务", focus: "现金流、风险、资源沉淀、消费心理。", majorArcanaKey: "正义、恶魔、命运之轮、世界看风险与周期。", suits: { 权杖: "创业冲动", 圣杯: "情绪消费", 宝剑: "合同风险", 星币: "资产与预算" }, outputSections: ["收入入口", "支出漏洞", "风险控制", "稳定策略"] },
  { scenario: "心理", focus: "情绪、阴影、身体感受、自我整合。", majorArcanaKey: "女祭司、隐者、月亮、星星看潜意识与疗愈。", suits: { 权杖: "生命力", 圣杯: "情绪容器", 宝剑: "认知压力", 星币: "身体扎根" }, outputSections: ["情绪命名", "重复模式", "身体信号", "整合练习"] },
];

export const TAROT_SENSE_RECORD_FIELDS: TarotSenseRecord[] = [
  { field: "第一眼", prompt: "这张牌第一眼看见了什么颜色、人物或动作？", use: "记录个人牌感入口。" },
  { field: "身体感", prompt: "抽到它时身体哪里紧、松、热或冷？", use: "帮助区分直觉与焦虑。" },
  { field: "现实印证", prompt: "未来 3-7 天出现了什么对应事件？", use: "形成用户自己的历史抽牌库。" },
  { field: "修正牌义", prompt: "这张牌在你身上和传统牌义哪里不同？", use: "个性化解释权重。" },
];

export function getScenarioLens(question: string) {
  const text = question.toLowerCase();
  if (/关系|恋|复合|喜欢|伴侣|合作/.test(text)) return TAROT_SCENARIO_LENSES[0];
  if (/工作|事业|项目|面试|职业|老板/.test(text)) return TAROT_SCENARIO_LENSES[1];
  if (/钱|财|收入|投资|预算|消费/.test(text)) return TAROT_SCENARIO_LENSES[2];
  return TAROT_SCENARIO_LENSES[3];
}

export function explainReversal(card: TarotCard) {
  return TAROT_REVERSAL_LAYERS.map((layer) => `${layer.layer}：${card.name}可读作${layer.reading}`).slice(0, 3);
}
