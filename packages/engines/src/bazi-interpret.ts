import type { BaziInterpretResult, MatchedRule, MatchedRuleEvidence } from "@atlas/shared-types";
import type { BaziResult } from "./bazi.ts";
import { selectBaziClassics } from "./bazi-classics.ts";

type BaziCtx = {
  result: BaziResult;
  selectedYear?: number;
};

const TEN_GOD_COMBO_RULES: Array<{
  id: string;
  name: string;
  meaning: string;
  caution: string;
  test: (ctx: BaziCtx) => { match: boolean; evidence?: MatchedRuleEvidence[] };
}> = [
  {
    id: "sha-yin", name: "杀印相生",
    meaning: "压力转化为学习、资质和权力承接。",
    caution: "日主太弱且印不接杀，则压力先表现为焦虑。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      const match = (gods.has("七杀") || gods.has("正官")) && (gods.has("正印") || gods.has("偏印"));
      return { match, evidence: match ? [{ label: "十神", detail: [...gods].filter((g) => ["七杀", "正官", "正印", "偏印"].includes(g)).join("、") }] : [] };
    },
  },
  {
    id: "shi-shen-sheng-cai", name: "食神生财",
    meaning: "技能、表达转化为收入。",
    caution: "食神太过会懒散。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      return { match: gods.has("食神") && !gods.has("伤官") && (gods.has("正财") || gods.has("偏财")), evidence: [{ label: "十神", detail: "食神 + 财星" }] };
    },
  },
  {
    id: "shang-guan-pei-yin", name: "伤官配印",
    meaning: "锋芒被学历、资质收束。",
    caution: "无印则易伤官见官。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      return { match: gods.has("伤官") && (gods.has("正印") || gods.has("偏印")), evidence: [{ label: "十神", detail: "伤官 + 印星" }] };
    },
  },
  {
    id: "cai-guan", name: "财官相生",
    meaning: "资源带来职位、信誉或秩序。",
    caution: "身弱财官旺，容易被责任压住。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      return { match: (gods.has("正财") || gods.has("偏财")) && (gods.has("正官") || gods.has("七杀")), evidence: [{ label: "十神", detail: "财 + 官" }] };
    },
  },
  {
    id: "guan-yin", name: "官印相生",
    meaning: "规则、组织、学历形成正向通道。",
    caution: "过旺则保守。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      return { match: (gods.has("正官") || gods.has("七杀")) && (gods.has("正印") || gods.has("偏印")), evidence: [{ label: "十神", detail: "官 + 印" }] };
    },
  },
  {
    id: "bi-jie-duo-cai", name: "比劫夺财",
    meaning: "竞争、分利消耗财务资源。",
    caution: "身弱见比劫也可能是帮扶。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      const biJie = [...gods].filter((g) => g === "比肩" || g === "劫财").length;
      return { match: biJie >= 2 && (gods.has("正财") || gods.has("偏财")), evidence: [{ label: "十神", detail: `比劫${biJie}处见财` }] };
    },
  },
  {
    id: "shang-guan-jian-guan", name: "伤官见官",
    meaning: "表达、反叛冲撞规则权威。",
    caution: "若有印制伤或财通关，可转为改革能力。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      const hasOfficer = gods.has("正官") || gods.has("七杀");
      return { match: gods.has("伤官") && hasOfficer && !gods.has("正印") && !gods.has("偏印"), evidence: [{ label: "十神", detail: "伤官见官无印" }] };
    },
  },
  {
    id: "cai-xing-huai-yin", name: "财星坏印",
    meaning: "现实利益削弱学习与保护。",
    caution: "印为忌时，财坏印反可推动现实化。",
    test: (ctx) => {
      const stems = collectStemTenGods(ctx.result);
      const hasCai = stems.some((g) => g === "正财" || g === "偏财");
      const hasYin = stems.some((g) => g === "正印" || g === "偏印");
      return { match: hasCai && hasYin, evidence: [{ label: "十神", detail: "天干财印并见" }] };
    },
  },
  {
    id: "shi-shang-sheng-cai", name: "食伤生财",
    meaning: "产出与表达通道畅通，利于转化收益。",
    caution: "食伤过旺则分散。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      const hasCai = gods.has("正财") || gods.has("偏财");
      return {
        match: hasCai && gods.has("伤官"),
        evidence: [{ label: "十神", detail: "伤官 + 财" }],
      };
    },
  },
  {
    id: "sha-zhuo-ruo", name: "财滋弱杀",
    meaning: "资源喂养压力，竞争加剧。",
    caution: "需印或食伤化解。",
    test: (ctx) => {
      const gods = collectTenGods(ctx.result);
      return { match: (gods.has("正财") || gods.has("偏财")) && (gods.has("七杀")), evidence: [{ label: "十神", detail: "财生杀" }] };
    },
  },
];

const PATTERN_RULES: Array<{ id: string; name: string; meaning: string; match: (ctx: BaziCtx) => boolean }> = [
  { id: "zheng-guan-ge", name: "正官格", meaning: "重秩序、名誉、责任。", match: (ctx) => ctx.result.pattern?.name.includes("正官") ?? false },
  { id: "qi-sha-ge", name: "七杀格", meaning: "压力强、竞争强。", match: (ctx) => ctx.result.pattern?.name.includes("七杀") ?? false },
  { id: "cai-ge", name: "财格", meaning: "资源、经营为主轴。", match: (ctx) => (ctx.result.pattern?.name.includes("财") ?? false) && !ctx.result.pattern?.name.includes("坏") },
  { id: "yin-ge", name: "印格", meaning: "学习、资质、保护强。", match: (ctx) => ctx.result.pattern?.name.includes("印格") ?? false },
  { id: "shi-shang-ge", name: "食伤格", meaning: "表达、技术、创意输出明显。", match: (ctx) => ctx.result.pattern?.name.includes("食伤") ?? false },
  { id: "jian-lu-ge", name: "建禄格", meaning: "日主得令而旺。", match: (ctx) => ctx.result.pattern?.name.includes("建禄") ?? false },
  { id: "cong-ge", name: "从格", meaning: "日主极弱，顺势借势。", match: (ctx) => (ctx.result.strength?.level === "身弱" && (ctx.result.strength?.score ?? 0) < -3) || false },
  { id: "zhuan-wang", name: "专旺格", meaning: "一行极旺成势。", match: (ctx) => (ctx.result.strength?.level === "身强" && (ctx.result.strength?.score ?? 0) > 3) || false },
];

const CLASSIC_CONDITIONS: Array<{ id: string; name: string; meaning: string; match: (ctx: BaziCtx) => boolean }> = [
  { id: "yue-ling-first", name: "先看月令", meaning: "月令决定旺衰和格局入口。", match: () => true },
  { id: "qiang-ruo-yong", name: "强弱取用", meaning: "同一十神在不同强弱下含义相反。", match: (ctx) => Boolean(ctx.result.strength?.level) },
  { id: "ge-ju-then-cai-guan", name: "格局既成方论财官", meaning: "先判断结构是否成立，再细看财官。", match: (ctx) => Boolean(ctx.result.pattern?.name) },
  { id: "sui-yun-bing-lin", name: "岁运并临", meaning: "阶段主题被加倍，事件感更强。", match: (ctx) => checkSuiYunBingLin(ctx) },
];

function collectTenGods(result: BaziResult): Set<string> {
  const gods = new Set<string>();
  const list = result.pillarList as Array<{ tenGod: string; hiddenStems?: Array<{ tenGod: string }> }> | undefined;
  if (!list) return gods;
  for (const p of list) {
    if (p.tenGod && p.tenGod !== "日主") gods.add(p.tenGod);
    for (const h of p.hiddenStems ?? []) {
      if (h.tenGod && h.tenGod !== "日主") gods.add(h.tenGod);
    }
  }
  return gods;
}

function collectStemTenGods(result: BaziResult): string[] {
  const list = result.pillarList as Array<{ tenGod: string }> | undefined;
  if (!list) return [];
  return list.map((p) => p.tenGod).filter((g) => g && g !== "日主");
}

function checkSuiYunBingLin(ctx: BaziCtx): boolean {
  const year = ctx.selectedYear ?? new Date().getFullYear();
  const majorLuck = ctx.result.majorLuck as Array<{ pillar: string; startAge: number; endAge: number }> | undefined;
  const annual = ctx.result.annualFortunes as Array<{ year: number; pillar: string }> | undefined;
  if (!majorLuck?.length || !annual?.length) return false;
  const af = annual.find((a) => a.year === year);
  if (!af) return false;
  return majorLuck.some((m) => m.pillar === af.pillar);
}

function buildLuckInteractions(ctx: BaziCtx): MatchedRule[] {
  const rules: MatchedRule[] = [];
  const year = ctx.selectedYear ?? new Date().getFullYear();
  const annual = ctx.result.annualFortunes as Array<{ year: number; pillar: string; tenGod: string; isCurrent: boolean }> | undefined;
  const af = annual?.find((a) => a.year === year);
  const combos = ctx.result.combinations as string[] | undefined;

  if (af) {
    rules.push({
      id: "yun-year-trigger",
      name: "运年触发",
      confidence: 0.8,
      meaning: `${year}流年${af.pillar}（${af.tenGod}）引动原局。`,
      evidence: [{ label: "流年", detail: af.pillar }],
    });
  }

  if (checkSuiYunBingLin(ctx)) {
    rules.push({
      id: "sui-yun-bing-lin-hit",
      name: "岁运并临",
      confidence: 0.9,
      meaning: "大运与流年同柱，阶段主题加倍。",
      evidence: [{ label: String(year), detail: af?.pillar ?? "" }],
    });
  }

  if (combos?.some((c) => c.includes("冲"))) {
    rules.push({
      id: "he-chong-original",
      name: "合冲原局",
      confidence: 0.75,
      meaning: "岁运或原局存在冲合，关系/岗位/资金结构可能被触发。",
      evidence: combos.filter((c) => c.includes("冲")).map((c) => ({ label: "冲", detail: c })),
    });
  }

  const strength = ctx.result.strength?.level;
  if (strength === "身弱" && af && ["正印", "偏印", "比肩", "劫财"].includes(af.tenGod)) {
    rules.push({
      id: "useful-god-arrives",
      name: "用神到位",
      confidence: 0.7,
      meaning: "流年出现扶身十神，事项更容易推进。",
      evidence: [{ label: af.tenGod, detail: `${year}流年` }],
    });
  }

  if (strength === "身强" && af && ["七杀", "伤官", "偏财"].includes(af.tenGod)) {
    rules.push({
      id: "useful-god-arrives-strong",
      name: "用神到位",
      confidence: 0.7,
      meaning: "身旺见泄耗，利于输出与突破。",
      evidence: [{ label: af.tenGod, detail: `${year}流年` }],
    });
  }

  return rules;
}

export function interpretBazi(result: BaziResult, opts: { selectedYear?: number } = {}): BaziInterpretResult {
  const ctx: BaziCtx = { result, selectedYear: opts.selectedYear };

  const matchedCombos: MatchedRule[] = [];
  for (const rule of TEN_GOD_COMBO_RULES) {
    const outcome = rule.test(ctx);
    if (!outcome.match) continue;
    matchedCombos.push({
      id: rule.id,
      name: rule.name,
      confidence: 0.85,
      meaning: rule.meaning,
      evidence: outcome.evidence ?? [],
    });
  }

  const matchedPatterns: MatchedRule[] = PATTERN_RULES.filter((r) => r.match(ctx)).map((r) => ({
    id: r.id, name: r.name, confidence: 0.8, meaning: r.meaning, evidence: [{ label: "格局", detail: result.pattern?.description ?? "" }],
  }));

  const activeDeities: MatchedRule[] = (result.deities as Array<{ name: string; meaning: string; type: string }> ?? []).map((d) => ({
    id: d.name,
    name: d.name,
    confidence: 0.9,
    meaning: d.meaning,
    level: d.type,
    evidence: [{ label: d.type, detail: d.name }],
  }));

  const luckInteractions = buildLuckInteractions(ctx);

  const classicHits: MatchedRule[] = CLASSIC_CONDITIONS.filter((c) => c.id !== "yue-ling-first" && c.match(ctx)).map((c) => ({
    id: c.id,
    name: c.name,
    confidence: 0.75,
    meaning: c.meaning,
    evidence: [],
  }));

  const classicTags = new Set<string>();
  if (result.pattern?.name) classicTags.add("格局");
  if (result.strength?.level) classicTags.add("旺衰");
  classicTags.add("总论");
  classicTags.add("月令");
  classicTags.add("日主");

  for (const classic of selectBaziClassics([...classicTags], 2)) {
    classicHits.push({
      id: classic.id,
      name: `${classic.title}·${classic.chapter}`,
      confidence: 0.7,
      meaning: classic.analysis,
      evidence: [{ label: "原文", detail: classic.fullText }],
    });
  }

  const summary = [
    matchedPatterns[0]?.name ?? result.pattern?.name,
    matchedCombos[0]?.name,
    luckInteractions[0]?.name,
  ].filter(Boolean).join(" · ") || result.summary;

  return { matchedCombos, matchedPatterns, activeDeities, luckInteractions, classicHits, summary };
}
