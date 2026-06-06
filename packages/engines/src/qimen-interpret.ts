import type { QimenInterpretResult, MatchedRule, MatchedRuleEvidence, TimingWindow, DirectionAdvice } from "@atlas/shared-types";
import type { QimenResult, QimenPalace } from "./qimen.js";
import { matchRules, type RuleWithPredicate, type RulePredicate } from "./rule-match.js";

export type QimenPatternRule = RuleWithPredicate & {
  category: string;
  level: string;
  meaning: string;
  actionHint?: string;
};

const STEM_COMBO_PATTERNS: QimenPatternRule[] = [
  { id: "long-hui-shou", name: "龙回首", category: "三奇吉格", level: "大吉", meaning: "旧资源回头、贵人复顾、文书关系有修复机会。", actionHint: "主动复盘旧线索，用柔性文本打开入口。", predicate: { type: "stemCombo", heaven: "乙", earth: "戊" } },
  { id: "niao-die-xue", name: "鸟跌穴", category: "三奇吉格", level: "吉", meaning: "名声、机会落到可承接的平台，利显化与成交。", actionHint: "把亮点落成具体材料与负责人。", predicate: { type: "stemCombo", heaven: "丙", earth: "戊" } },
  { id: "qing-long-tao-zou", name: "青龙逃走", category: "三奇凶格", level: "凶", meaning: "柔性资源走失或变质。", actionHint: "先查版本、证据和联系人。", predicate: { type: "stemCombo", heaven: "乙", earth: "辛" } },
  { id: "bai-hu-chang-kuang", name: "白虎猖狂", category: "三奇凶格", level: "大凶", meaning: "硬冲突压倒柔性资源。", actionHint: "降级冲突，保留证据。", predicate: { type: "stemCombo", heaven: "辛", earth: "乙" } },
  { id: "yi-qi-de-shi", name: "乙奇得使", category: "门奇吉格", level: "吉", meaning: "柔性资源被行动入口承接。", predicate: { type: "custom", evaluate: (ctx) => hasSanQiDeShi(ctx as QimenCtx, "乙") } },
  { id: "bing-qi-de-shi", name: "丙奇得使", category: "门奇吉格", level: "吉", meaning: "曝光与突破被行动入口承接。", predicate: { type: "custom", evaluate: (ctx) => hasSanQiDeShi(ctx as QimenCtx, "丙") } },
  { id: "ding-qi-de-shi", name: "丁奇得使", category: "门奇吉格", level: "吉", meaning: "信息与灵感被行动入口承接。", predicate: { type: "custom", evaluate: (ctx) => hasSanQiDeShi(ctx as QimenCtx, "丁") } },
  { id: "geng-jia-ri-gan", name: "庚加日干", category: "庚格", level: "凶", meaning: "外部阻力压到问者。", predicate: { type: "custom", evaluate: (ctx) => gengOnDayStem(ctx as QimenCtx) } },
  { id: "tian-dun", name: "天遁", category: "遁格", level: "大吉", meaning: "公开通道与远景资源打开。", predicate: { type: "custom", evaluate: (ctx) => dunPattern(ctx as QimenCtx, { stem: "丙", door: "开门" }) } },
  { id: "di-dun", name: "地遁", category: "遁格", level: "吉", meaning: "地利与长期资源可承接。", predicate: { type: "custom", evaluate: (ctx) => dunPattern(ctx as QimenCtx, { stem: "乙", door: "生门" }) } },
  { id: "ren-dun", name: "人遁", category: "遁格", level: "吉", meaning: "人情协商有效。", predicate: { type: "custom", evaluate: (ctx) => dunPattern(ctx as QimenCtx, { stem: "丁", door: "休门" }) } },
  { id: "fu-yin", name: "伏吟", category: "全局结构", level: "凶", meaning: "旧事重来、进展迟缓。", predicate: { type: "custom", evaluate: (ctx) => fuYin(ctx as QimenCtx) } },
  { id: "fan-yin", name: "反吟", category: "全局结构", level: "凶", meaning: "反复迁动、计划不稳。", predicate: { type: "custom", evaluate: (ctx) => fanYin(ctx as QimenCtx) } },
];

const QUESTION_USEFUL_GOD: Record<string, string[]> = {
  事业项目: ["开门", "值符"],
  财务经营: ["生门", "戊"],
  关系合作: ["六合", "乙"],
  出行迁移: ["马星", "开门"],
  考试文书: ["景门", "天辅"],
  健康修复: ["天心", "天芮"],
};

const PALACE_NUMBER: Record<string, number> = {
  坎一: 1, 坤二: 2, 震三: 3, 巽四: 4, 中五: 5, 乾六: 6, 兑七: 7, 艮八: 8, 离九: 9,
};

const DIRECTION_TABLE: Record<string, DirectionAdvice> = {
  坎一: { palace: "坎一宫", direction: "北", spatial: "低处、水边、流动渠道", action: "查资料、等消息、走暗线", people: "信息中介", timing: "一数" },
  坤二: { palace: "坤二宫", direction: "西南", spatial: "平地、社区、仓库", action: "协作、补材料、稳基础", people: "后勤支持者", timing: "二数" },
  震三: { palace: "震三宫", direction: "东", spatial: "门口、路口、新场地", action: "启动、通知、抢先行动", people: "执行者", timing: "三数" },
  巽四: { palace: "巽四宫", direction: "东南", spatial: "风口、文书、网络", action: "谈判、渗透、发邮件", people: "顾问、文案", timing: "四数" },
  中五: { palace: "中五宫", direction: "中", spatial: "中心、平台、枢纽", action: "统筹、定规则", people: "负责人", timing: "五数" },
  乾六: { palace: "乾六宫", direction: "西北", spatial: "高处、办公室、机构", action: "找上级、走规则", people: "领导、监管者", timing: "六数" },
  兑七: { palace: "兑七宫", direction: "西", spatial: "口舌场、交易处", action: "谈条件、报价", people: "销售、客户", timing: "七数" },
  艮八: { palace: "艮八宫", direction: "东北", spatial: "门槛、边界、库存", action: "暂停、设限、积蓄", people: "守门人", timing: "八数" },
  离九: { palace: "离九宫", direction: "南", spatial: "明亮处、屏幕、展台", action: "展示、发布", people: "媒体、证人", timing: "九数" },
};

interface QimenCtx {
  chart: QimenResult;
  dayStem?: string;
  questionType?: string;
}

export function interpretQimen(
  chart: QimenResult,
  opts: {
    questionType?: string;
    dayStem?: string;
    predictionWindow?: "时" | "日" | "旬" | "月";
  } = {},
): QimenInterpretResult {
  const ctx: QimenCtx = { chart, dayStem: opts.dayStem ?? chart.pillars.day[0], questionType: opts.questionType };
  const matchedPatterns = matchRules(ctx, STEM_COMBO_PATTERNS, evaluateQimenPredicate);
  const relations = buildRelationRules(chart);
  const usefulGod = resolveUsefulGod(ctx);
  const usefulPalace = findUsefulPalace(chart, usefulGod);
  const timingWindows = buildTimingWindows(chart, usefulPalace, opts.predictionWindow ?? "日");
  const directionAdvice = usefulPalace ? DIRECTION_TABLE[usefulPalace.palace] : undefined;
  const summary = buildSummary(chart, matchedPatterns, usefulGod, timingWindows);

  return {
    matchedPatterns,
    relations,
    timingWindows,
    directionAdvice,
    usefulGod,
    summary,
  };
}

function evaluateQimenPredicate(
  ctx: unknown,
  predicate: RulePredicate,
  _rule: QimenPatternRule,
): { match: boolean; evidence?: MatchedRuleEvidence[]; confidence?: number } {
  const qctx = ctx as QimenCtx;
  if (predicate.type === "stemCombo") {
    const hit = qctx.chart.palaces.find(
      (p) => p.heavenStem === predicate.heaven && p.earthStem === predicate.earth,
    );
    if (!hit) return { match: false };
    return {
      match: true,
      confidence: 0.9,
      evidence: [{ label: hit.palace, detail: `天盘${predicate.heaven}加地盘${predicate.earth}` }],
    };
  }
  if (predicate.type === "custom") {
    const result = predicate.evaluate(qctx);
    if (typeof result === "boolean") {
      return { match: result, confidence: result ? 0.85 : 0 };
    }
    return { match: result.match, evidence: result.evidence, confidence: result.match ? 0.85 : 0 };
  }
  return { match: false };
}

function hasSanQiDeShi(ctx: QimenCtx, stem: string): boolean {
  const zhiShiDoor = ctx.chart.zhiShi;
  const hit = ctx.chart.palaces.find((p) => p.door === zhiShiDoor && (p.heavenStem === stem || p.earthStem === stem));
  return Boolean(hit);
}

function gengOnDayStem(ctx: QimenCtx): boolean {
  const day = ctx.dayStem ?? ctx.chart.pillars.day[0];
  return ctx.chart.palaces.some((p) => p.heavenStem === "庚" && p.earthStem === day);
}

function dunPattern(ctx: QimenCtx, req: { stem: string; door: string }): boolean {
  return ctx.chart.palaces.some((p) => p.door === req.door && (p.heavenStem === req.stem || p.earthStem === req.stem));
}

function fuYin(ctx: QimenCtx): boolean {
  return ctx.chart.palaces.filter((p) => p.palace !== "中五").every((p) => p.heavenStem === p.earthStem);
}

const OPPOSITE: Record<string, string> = {
  坎一: "离九", 离九: "坎一", 震三: "兑七", 兑七: "震三", 巽四: "乾六", 乾六: "巽四", 艮八: "坤二", 坤二: "艮八",
};

function fanYin(ctx: QimenCtx): boolean {
  let count = 0;
  for (const p of ctx.chart.palaces) {
    if (p.palace === "中五") continue;
    const opp = OPPOSITE[p.palace];
    const other = ctx.chart.palaces.find((x) => x.palace === opp);
    if (other && p.star === other.star) count++;
  }
  return count >= 2;
}

function buildRelationRules(chart: QimenResult): MatchedRule[] {
  const rules: MatchedRule[] = [];
  if (chart.menPo.length > 0) {
    rules.push({
      id: "men-po", name: "门迫", confidence: 0.8, category: "关系结构", level: "凶",
      meaning: "行动方式压迫环境，费力且容易被迫。",
      evidence: chart.menPo.map((d) => ({ label: "门迫", detail: d })),
    });
  }
  if (chart.jiXing.length > 0) {
    rules.push({
      id: "ji-xing", name: "击刑", confidence: 0.8, category: "关系结构", level: "凶",
      meaning: "内耗、急躁、失序。",
      evidence: chart.jiXing.map((d) => ({ label: "击刑", detail: d })),
    });
  }
  if (chart.ruMu.length > 0) {
    rules.push({
      id: "ru-mu", name: "入墓", confidence: 0.75, category: "关系结构", level: "平",
      meaning: "力量收藏，行动迟滞。",
      evidence: chart.ruMu.map((d) => ({ label: "入墓", detail: d })),
    });
  }
  if (chart.kongWang.length > 0) {
    rules.push({
      id: "kong-wang", name: "空亡", confidence: 0.75, category: "关系结构", level: "凶",
      meaning: "信息未实、资源未到。",
      evidence: [{ label: "旬空", detail: chart.kongWang.join("、") }],
    });
  }
  return rules;
}

function resolveUsefulGod(ctx: QimenCtx): string {
  const keys = ctx.questionType ? QUESTION_USEFUL_GOD[ctx.questionType] : undefined;
  return keys?.[0] ?? "日干";
}

function findUsefulPalace(chart: QimenResult, usefulGod: string): QimenPalace | undefined {
  if (usefulGod === "日干") {
    const day = chart.pillars.day[0];
    return chart.palaces.find((p) => p.heavenStem === day || p.earthStem === day);
  }
  if (usefulGod === "值符") {
    return chart.palaces.find((p) => p.isZhiFu) ?? chart.palaces.find((p) => p.palace === chart.zhiFuPalace);
  }
  return chart.palaces.find((p) => p.door === usefulGod || p.star === usefulGod || p.god === usefulGod || p.heavenStem === usefulGod);
}

function buildTimingWindows(
  chart: QimenResult,
  palace: QimenPalace | undefined,
  window: "时" | "日" | "旬" | "月",
): TimingWindow[] {
  const windows: TimingWindow[] = [];
  const num = palace ? PALACE_NUMBER[palace.palace] ?? 3 : 3;
  const scale = window === "时" ? "小时" : window === "日" ? "日" : window === "旬" ? "旬" : "月";

  if (palace?.kongWang) {
    windows.push({ label: "填实窗口", range: `${num}${scale}后`, basis: "用神落空亡，待填实或冲实" });
  }
  if (palace?.ruMu) {
    windows.push({ label: "冲开窗口", range: `${num * 2}${scale}内`, basis: "用神入墓，待冲开或钥匙条件" });
  }
  if (chart.zhiShi === "开门" || chart.zhiShi === "生门") {
    windows.push({ label: "较快应期", range: `${num}${scale}内`, basis: "值使吉门，行动通道较顺" });
  } else if (chart.zhiShi === "死门" || chart.zhiShi === "杜门") {
    windows.push({ label: "较慢应期", range: `${num * 3}${scale}以上`, basis: "值使门迟滞，宜耐心推进" });
  } else {
    windows.push({ label: "常规窗口", range: `${num}${scale}至${num * 2}${scale}`, basis: "按宫位数与问题时窗缩放" });
  }
  return windows;
}

function buildSummary(chart: QimenResult, patterns: MatchedRule[], usefulGod: string, timing: TimingWindow[]): string {
  const top = patterns[0]?.name ?? "无显著格局";
  const timingHint = timing[0]?.range ?? "观察期";
  return `${chart.dun}${chart.ju}局·${chart.yuan}；用神取${usefulGod}；主格${top}；应期参考${timingHint}（窗口估计，非绝对日期）。`;
}

export { STEM_COMBO_PATTERNS, QUESTION_USEFUL_GOD, DIRECTION_TABLE };
