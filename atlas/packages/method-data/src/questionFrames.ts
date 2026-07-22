import {
  DIVINATION_METHODS,
  type CausalityModel,
  type EvidenceStyle,
  type QuestionDomain,
  type UncertaintyMode,
} from "./divinationMethods.ts";
import { getMethodCognition } from "./methodCognition.ts";
import type {
  ComparativeMethodId,
  DecisionPressure,
  QuestionFrame,
  QuestionTranslation,
  Sensitivity,
  TimeHorizon,
} from "@atlas/shared-types";

const COMPARATIVE_METHOD_IDS: ComparativeMethodId[] = ["bazi", "western", "tarot", "iching"];

const DOMAIN_LABELS: Record<QuestionDomain, string> = {
  "life-structure": "人生结构",
  career: "事业选择",
  relationship: "关系互动",
  "specific-event": "具体事件",
  timing: "行动时机",
  "inner-state": "内在状态",
  dream: "梦境意象",
  space: "空间方位",
  "daily-guidance": "日常提醒",
};

const TIME_LABELS: Record<TimeHorizon, string> = {
  immediate: "即时",
  weeks: "数周",
  months: "数月",
  year: "一年内",
  "life-stage": "人生阶段",
  unknown: "未明确",
};

const PRESSURE_LABELS: Record<DecisionPressure, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export type MethodCulturalProfile = {
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

export function classifyQuestion(rawText: string): QuestionFrame {
  const text = rawText.trim();
  const domains = unique<QuestionDomain>([
    hasAny(text, ["工作", "事业", "职业", "离职", "跳槽", "创业", "offer", "升职"]) ? "career" : undefined,
    hasAny(text, ["关系", "感情", "恋爱", "复合", "分手", "婚姻", "伴侣", "他", "她", "ta", "TA"]) ? "relationship" : undefined,
    hasAny(text, ["梦", "梦见", "噩梦", "醒来", "反复梦"]) ? "dream" : undefined,
    hasAny(text, ["搬家", "房间", "办公室", "方位", "方向", "城市", "住"]) ? "space" : undefined,
    hasAny(text, ["焦虑", "害怕", "内耗", "情绪", "卡住", "迷茫", "压力"]) ? "inner-state" : undefined,
    hasAny(text, ["要不要", "该不该", "是否", "能不能", "可不可以", "选择", "决定"]) ? "specific-event" : undefined,
    hasAny(text, ["什么时候", "时机", "近期", "现在", "本周", "这个月"]) ? "timing" : undefined,
    hasAny(text, ["长期", "未来一年", "今年", "阶段", "人生", "方向"]) ? "life-structure" : undefined,
  ]);

  const resolvedDomains: QuestionDomain[] = domains.length > 0 ? domains : ["daily-guidance"];
  const timeHorizon = resolveTimeHorizon(text);
  const sensitivity = resolveSensitivity(text);
  const needsBirthData = resolvedDomains.some((d) => d === "life-structure" || d === "career" || d === "relationship");
  const needsLocation = resolvedDomains.includes("space") || resolvedDomains.includes("timing");
  const recommendedMethodIds = recommendMethods(resolvedDomains, timeHorizon);

  return {
    rawText: text,
    domains: resolvedDomains,
    timeHorizon,
    decisionPressure: hasAny(text, ["必须", "马上", "立刻", "裸辞", "重大", "高风险"]) ? "high" : text.length > 40 ? "medium" : "low",
    sensitivity,
    needsBirthData,
    needsLocation,
    recommendedMethodIds,
    discouragedMethodIds: ["jiaobei", "coffee"],
  };
}

export function translateQuestionForMethods(rawText: string, methodIds: ComparativeMethodId[]): QuestionTranslation[] {
  return methodIds.map((methodId) => translateQuestionForMethod(rawText, methodId));
}

export function translateQuestionForMethod(rawText: string, methodId: ComparativeMethodId): QuestionTranslation {
  const method = DIVINATION_METHODS.find((item) => item.id === methodId);
  const cognition = getMethodCognition(methodId);
  const fallback = cognition?.questionGrammar ?? method?.questionGrammar ?? "这个传统会如何把你的问题转成可解释的象征结构？";
  const question = rawText.trim();
  const translatedQuestion = methodId === "bazi"
    ? `当前议题是否符合我的长期结构、阶段节律与大运流年触发？原问题：${question}`
    : methodId === "western"
      ? `近期行运正在触发哪些人生领域、责任压力与身份转向？原问题：${question}`
      : methodId === "tarot"
        ? `我在这个选择里真正期待、害怕、回避和需要采取的下一步是什么？原问题：${question}`
        : methodId === "iching"
          ? `此时此位是否宜动？如果要变，需要满足什么条件？原问题：${question}`
          : `${fallback} 原问题：${question}`;

  return {
    methodId,
    methodTitle: method?.title ?? methodId,
    translatedQuestion,
    rationale: cognition?.questionGrammar ?? method?.questionGrammar ?? fallback,
  };
}

export function formatQuestionDomain(domain: QuestionDomain): string {
  return DOMAIN_LABELS[domain];
}

export function formatTimeHorizon(horizon: TimeHorizon): string {
  return TIME_LABELS[horizon];
}

export function formatDecisionPressure(pressure: DecisionPressure): string {
  return PRESSURE_LABELS[pressure];
}

export function getMethodCulturalProfile(methodId: string): MethodCulturalProfile {
  const method = DIVINATION_METHODS.find((item) => item.id === methodId);
  const cognition = getMethodCognition(methodId);
  return {
    questionGrammar: cognition?.questionGrammar ?? method?.questionGrammar ?? method?.questionStyle ?? "这个系统会先把问题转成自身可处理的象征格式。",
    causalityModel: cognition?.causalityModel ?? method?.causalityModel ?? "symbolic-projection",
    uncertaintyMode: cognition?.uncertaintyMode ?? method?.uncertaintyMode ?? "reflection",
    evidenceStyle: cognition?.evidenceStyle ?? method?.evidenceStyle ?? ["user-narrative"],
    bestFor: cognition?.bestFor ?? method?.bestFor ?? [],
    weakFor: cognition?.weakFor ?? method?.weakFor ?? [],
    requiredInputs: cognition?.requiredInputs ?? method?.requiredInputs ?? ["questionText"],
    optionalInputs: cognition?.optionalInputs ?? method?.optionalInputs ?? ["context"],
    misuseBoundary: cognition?.misuseBoundary ?? method?.misuseBoundary ?? "适合作为文化探索与自我反思，不替代专业建议。",
  };
}

function recommendMethods(domains: QuestionDomain[], timeHorizon: TimeHorizon): ComparativeMethodId[] {
  if (domains.includes("dream")) return ["tarot", "iching"];
  if (domains.includes("career") && (domains.includes("timing") || domains.includes("specific-event"))) {
    return ["iching", "bazi", "western", "tarot"];
  }
  if (domains.includes("relationship")) return ["tarot", "western", "bazi", "iching"];
  if (domains.includes("inner-state")) return ["tarot", "western", "iching"];
  if (timeHorizon === "life-stage" || domains.includes("life-structure")) return ["bazi", "western", "iching", "tarot"];
  return [...COMPARATIVE_METHOD_IDS];
}

function resolveTimeHorizon(text: string): TimeHorizon {
  if (hasAny(text, ["马上", "现在", "今天", "此刻"])) return "immediate";
  if (hasAny(text, ["本周", "下周", "最近几周"])) return "weeks";
  if (hasAny(text, ["近期", "这个月", "几个月", "三个月", "半年"])) return "months";
  if (hasAny(text, ["今年", "未来一年", "明年"])) return "year";
  if (hasAny(text, ["长期", "人生", "阶段", "命运", "方向"])) return "life-stage";
  return "unknown";
}

function resolveSensitivity(text: string): Sensitivity[] {
  const values = unique<Sensitivity>([
    hasAny(text, ["病", "健康", "医院", "症状", "抑郁", "焦虑症"]) ? "medical" : undefined,
    hasAny(text, ["法律", "合同", "诉讼", "起诉", "律师"]) ? "legal" : undefined,
    hasAny(text, ["投资", "股票", "借钱", "贷款", "财务", "钱"]) ? "financial" : undefined,
    hasAny(text, ["分手", "复合", "婚姻", "伴侣", "关系"]) ? "relationship" : undefined,
    hasAny(text, ["自杀", "伤害自己", "崩溃", "创伤"]) ? "mental-health" : undefined,
  ]);
  return values.length > 0 ? values : ["none"];
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function unique<T>(items: Array<T | undefined>): T[] {
  return Array.from(new Set(items.filter((item): item is T => Boolean(item))));
}
