import { computeBazi, type BaziResult } from "./bazi.js";
import {
  detectBranchRelations,
  detectStemRelation,
  formatBranchRelationEvidence,
  getElementRelation,
  type BranchRelationTone,
  type Element,
} from "./bazi-branch-relations.js";

export type RelationshipContext = "romance" | "friendship" | "family" | "business" | "general";

export interface BaziPersonInput {
  name?: string;
  birthDate: string;
  birthTime?: string;
  gender: "male" | "female";
}

export interface BaziCompatibilityInput {
  personA: BaziPersonInput;
  personB: BaziPersonInput;
  relationshipType: RelationshipContext;
}

export interface CompatibilityDimension {
  key: string;
  label: string;
  detail: string;
  evidence: string[];
  tone: BranchRelationTone | "mixed";
}

export interface BaziCompatibilityResult {
  error?: string;
  personA: BaziResult;
  personB: BaziResult;
  relationshipType: RelationshipContext;
  summary: string;
  emotionPattern: string;
  communicationStyle: string;
  conflictSources: string[];
  longTermStability: string;
  attraction: string;
  practicalRisks: string[];
  repairAdvice: string[];
  highlights: { positive: string[]; challenges: string[] };
  dimensions: CompatibilityDimension[];
}

const stemElement: Record<string, Element> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const stemPolarity: Record<string, "阳" | "阴"> = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
const PILLAR_LABELS: Record<(typeof PILLAR_KEYS)[number], string> = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  hour: "时柱",
};

const RELATIONSHIP_LABELS: Record<RelationshipContext, string> = {
  romance: "伴侣",
  friendship: "朋友",
  family: "家人",
  business: "同事/合伙人",
  general: "一般关系",
};

const TAOHUA: Record<string, string> = {
  子: "酉", 丑: "午", 寅: "卯", 卯: "子", 辰: "酉", 巳: "午",
  午: "卯", 未: "子", 申: "酉", 酉: "午", 戌: "卯", 亥: "子",
};

const YIMA: Record<string, string> = {
  子: "寅", 丑: "亥", 寅: "申", 卯: "巳", 辰: "寅", 巳: "亥",
  午: "申", 未: "巳", 申: "寅", 酉: "亥", 戌: "寅", 亥: "巳",
};

const YANGREN: Record<string, string> = { 甲: "卯", 丙: "午", 庚: "酉", 壬: "子" };

function elementRole(dayMaster: string, element: Element): string {
  const masterElement = stemElement[dayMaster];
  if (!masterElement) return "待定";
  const rel = getElementRelation(masterElement, element);
  if (rel === "比和") return "同类/比劫";
  if (rel === "相生" && generatesElement(element, masterElement)) return "生我/印";
  if (rel === "相生" && generatesElement(masterElement, element)) return "我生/食伤";
  if (rel === "相克" && controlsElement(masterElement, element)) return "我克/财";
  if (rel === "相克" && controlsElement(element, masterElement)) return "克我/官杀";
  return "待定";
}

function generatesElement(a: Element, b: Element): boolean {
  return getElementRelation(a, b) === "相生" && (
    (a === "木" && b === "火") ||
    (a === "火" && b === "土") ||
    (a === "土" && b === "金") ||
    (a === "金" && b === "水") ||
    (a === "水" && b === "木")
  );
}

function controlsElement(a: Element, b: Element): boolean {
  return getElementRelation(a, b) === "相克" && (
    (a === "木" && b === "土") ||
    (a === "土" && b === "水") ||
    (a === "水" && b === "火") ||
    (a === "火" && b === "金") ||
    (a === "金" && b === "木")
  );
}

function computeTenGod(dayMaster: string, otherStem: string): string {
  const relation = elementRole(dayMaster, stemElement[otherStem]);
  const samePolarity = stemPolarity[dayMaster] === stemPolarity[otherStem];
  switch (relation) {
    case "同类/比劫": return samePolarity ? "比肩" : "劫财";
    case "生我/印": return samePolarity ? "偏印" : "正印";
    case "我生/食伤": return samePolarity ? "食神" : "伤官";
    case "我克/财": return samePolarity ? "偏财" : "正财";
    case "克我/官杀": return samePolarity ? "七杀" : "正官";
    default: return "—";
  }
}

function collectBranches(result: BaziResult): string[] {
  if (!result.pillars) return [];
  return PILLAR_KEYS.map((k) => result.pillars![k].charAt(1));
}

function collectStems(result: BaziResult): string[] {
  if (!result.pillars) return [];
  return PILLAR_KEYS.map((k) => result.pillars![k].charAt(0));
}

function toneFromRelations(relations: Array<{ tone: BranchRelationTone }>): BranchRelationTone | "mixed" {
  if (relations.length === 0) return "neutral";
  const tones = new Set(relations.map((r) => r.tone));
  if (tones.size > 1) return "mixed";
  return relations[0].tone;
}

function buildDayBranchDimension(a: BaziResult, b: BaziResult): CompatibilityDimension {
  const branchA = a.pillars!.day.charAt(1);
  const branchB = b.pillars!.day.charAt(1);
  const relations = detectBranchRelations(branchA, branchB);
  const evidence = formatBranchRelationEvidence(branchA, branchB, "日支夫妻宫");

  let detail = "日支为夫妻宫，代表日常相处与亲密互动底色。";
  if (relations.some((r) => r.kind === "六合" || r.kind === "三合")) {
    detail += "双方日支有合局倾向，日常相处较易找到默契与归属感。";
  } else if (relations.some((r) => r.kind === "六冲")) {
    detail += "日支相冲，生活节奏与需求容易对冲，宜建立缓冲与协商机制。";
  } else if (relations.some((r) => r.kind === "六害" || r.kind === "三刑")) {
    detail += "日支有刑害牵动，隐性摩擦需主动沟通化解。";
  } else {
    detail += "日支无强烈合冲，相处模式更多取决于后天经营。";
  }

  return {
    key: "dayBranch",
    label: "日支互动",
    detail,
    evidence,
    tone: toneFromRelations(relations),
  };
}

function buildDayMasterDimension(a: BaziResult, b: BaziResult): CompatibilityDimension {
  const elA = a.dayMasterElement;
  const elB = b.dayMasterElement;
  const relation = getElementRelation(elA, elB);
  const evidence = [
    `甲日主${a.dayMaster}（${elA}）vs 乙日主${b.dayMaster}（${elB}）`,
    `五行关系：${relation}`,
  ];

  let detail = "";
  if (relation === "相生") {
    detail = "日主五行相生，情绪节奏上易形成扶持与滋养，一方付出时另一方较易承接。";
  } else if (relation === "相克") {
    detail = "日主五行相克，互动中可能出现主导与制约的张力，需留意边界与节奏。";
  } else {
    detail = "日主同气比和，价值观与处事风格相近，默契来得快，但也需避免同质化竞争。";
  }

  return { key: "dayMaster", label: "日主五行", detail, evidence, tone: relation === "相生" ? "harmonious" : relation === "相克" ? "conflict" : "neutral" };
}

function buildPillarCrossDimension(a: BaziResult, b: BaziResult): CompatibilityDimension {
  const evidence: string[] = [];
  const relations: ReturnType<typeof detectBranchRelations> = [];

  for (const key of PILLAR_KEYS) {
    const pillarA = a.pillars![key];
    const pillarB = b.pillars![key];
    const stemRel = detectStemRelation(pillarA.charAt(0), pillarB.charAt(0));
    const branchRels = detectBranchRelations(pillarA.charAt(1), pillarB.charAt(1));
    relations.push(...branchRels);
    if (stemRel) {
      evidence.push(`${PILLAR_LABELS[key]}天干：${stemRel.description}`);
    }
    evidence.push(...formatBranchRelationEvidence(pillarA.charAt(1), pillarB.charAt(1), PILLAR_LABELS[key]));
  }

  const harmonious = relations.filter((r) => r.tone === "harmonious").length;
  const conflict = relations.filter((r) => r.tone === "conflict").length;

  let detail = `四柱交叉共见 ${relations.length} 处显著互动。`;
  if (harmonious > conflict) {
    detail += "合拱多于冲刑，整体结构偏协调，背景与习惯有互补空间。";
  } else if (conflict > harmonious) {
    detail += "冲刑多于合拱，家庭背景与生活节奏差异较大，需更多磨合。";
  } else {
    detail += "合冲力量相当，关系呈动态平衡，关键在如何运用差异。";
  }

  return { key: "pillarCross", label: "四柱交叉", detail, evidence, tone: toneFromRelations(relations) };
}

function buildElementComplementDimension(a: BaziResult, b: BaziResult): CompatibilityDimension {
  const evidence: string[] = [];
  let complementCount = 0;

  for (const itemA of a.elementAnalysis) {
    if (itemA.status !== "deficient" && itemA.status !== "absent") continue;
    const matchB = b.elementAnalysis.find((itemB) => itemB.element === itemA.element);
    if (matchB && (matchB.status === "excess" || matchB.status === "balanced")) {
      complementCount++;
      evidence.push(`甲偏缺${itemA.element}，乙${matchB.element}气${matchB.status === "excess" ? "偏旺" : "适中"}，可互补`);
    }
  }

  for (const itemB of b.elementAnalysis) {
    if (itemB.status !== "deficient" && itemB.status !== "absent") continue;
    const matchA = a.elementAnalysis.find((itemA) => itemA.element === itemB.element);
    if (matchA && (matchA.status === "excess" || matchA.status === "balanced")) {
      const line = `乙偏缺${itemB.element}，甲${matchA.element}气${matchA.status === "excess" ? "偏旺" : "适中"}，可互补`;
      if (!evidence.includes(line)) {
        complementCount++;
        evidence.push(line);
      }
    }
  }

  if (evidence.length === 0) {
    evidence.push("双方五行偏旺偏弱未见明显互补项");
  }

  const detail = complementCount >= 2
    ? "五行结构存在多处互补，一方所缺往往为另一方所备，利于分工协作。"
    : complementCount === 1
      ? "有一处五行互补，可在特定领域形成支援，但整体仍需后天调和。"
      : "五行互补不明显，宜通过生活方式与角色分工补足差异。";

  return {
    key: "elementComplement",
    label: "五行互补",
    detail,
    evidence,
    tone: complementCount >= 2 ? "harmonious" : complementCount === 1 ? "neutral" : "neutral",
  };
}

function buildStrengthBalanceDimension(a: BaziResult, b: BaziResult): CompatibilityDimension {
  const levelA = a.strength.level;
  const levelB = b.strength.level;
  const strongA = levelA.includes("强");
  const strongB = levelB.includes("强");
  const weakA = levelA.includes("弱");
  const weakB = levelB.includes("弱");

  const evidence = [
    `甲日主${levelA}（${a.strength.score >= 0 ? "+" : ""}${a.strength.score}）`,
    `乙日主${levelB}（${b.strength.score >= 0 ? "+" : ""}${b.strength.score}）`,
  ];

  let detail: string;
  let tone: BranchRelationTone | "mixed";

  if ((strongA && weakB) || (weakA && strongB)) {
    detail = "一方身强一方身弱，传统上视为可扶持互补：强者担责，弱者借力，但需避免单向消耗。";
    tone = "harmonious";
  } else if (strongA && strongB) {
    detail = "双方均偏身强，主见与行动力都足，合作中易出现主导权竞争，宜明确分工。";
    tone = "conflict";
  } else if (weakA && weakB) {
    detail = "双方均偏身弱，互相理解但共同承压时易缺乏担当，宜借助外部支持与稳定节奏。";
    tone = "neutral";
  } else {
    detail = "双方旺衰接近中和，节奏相当，相处压力不大，但也缺少天然互补张力。";
    tone = "neutral";
  }

  return { key: "strengthBalance", label: "强弱平衡", detail, evidence, tone };
}

function buildTenGodDimensionWithGender(
  a: BaziResult,
  b: BaziResult,
  genderA: "male" | "female",
  genderB: "male" | "female",
  relationshipType: RelationshipContext,
): CompatibilityDimension {
  const evidence: string[] = [];
  const stemsB = collectStems(b);
  const stemsA = collectStems(a);
  const godsInB = stemsB.map((s) => computeTenGod(a.dayMaster, s));
  const godsInA = stemsA.map((s) => computeTenGod(b.dayMaster, s));

  const hasCai = (gods: string[]) => gods.some((g) => g === "正财" || g === "偏财");
  const hasGuan = (gods: string[]) => gods.some((g) => g === "正官" || g === "七杀");
  const hasYin = (gods: string[]) => gods.some((g) => g === "正印" || g === "偏印");
  const hasShiShang = (gods: string[]) => gods.some((g) => g === "食神" || g === "伤官");
  const hasBiJie = (gods: string[]) => gods.some((g) => g === "比肩" || g === "劫财");

  let detail: string;
  let tone: BranchRelationTone | "mixed" = "neutral";

  if (relationshipType === "romance") {
    if (genderA === "male" && hasCai(godsInB)) {
      evidence.push("男命甲见乙盘有财星，配偶星得位，利情感投入与务实经营");
      tone = "harmonious";
    } else if (genderA === "male") {
      evidence.push("男命甲见乙盘财星不显，感情表达宜更主动务实");
    }
    if (genderB === "male" && hasCai(godsInA)) {
      evidence.push("男命乙见甲盘有财星，配偶星得位");
      tone = "harmonious";
    } else if (genderB === "male") {
      evidence.push("男命乙见甲盘财星不显");
    }
    if (genderA === "female" && hasGuan(godsInB)) {
      evidence.push("女命甲见乙盘有官杀，配偶星得位，利关系稳定感");
      tone = "harmonious";
    } else if (genderA === "female") {
      evidence.push("女命甲见乙盘官杀不显，宜主动建立安全感");
    }
    if (genderB === "female" && hasGuan(godsInA)) {
      evidence.push("女命乙见甲盘有官杀，配偶星得位");
      tone = "harmonious";
    } else if (genderB === "female") {
      evidence.push("女命乙见甲盘官杀不显");
    }
    detail = "婚恋语境下，配偶星得位倾向利于吸引与承诺；不得位则需更多主动经营。";
  } else if (relationshipType === "business") {
    evidence.push(`甲见乙：${hasCai(godsInB) ? "财星现" : "财弱"}、${hasGuan(godsInB) ? "官星现" : "官弱"}`);
    evidence.push(`乙见甲：${hasCai(godsInA) ? "财星现" : "财弱"}、${hasGuan(godsInA) ? "官星现" : "官弱"}`);
    detail = "合作语境下，财官主资源与秩序，比劫旺时须防利益分配争议。";
    tone = hasBiJie(godsInB) && hasBiJie(godsInA) ? "conflict" : "neutral";
  } else if (relationshipType === "friendship") {
    evidence.push(`印星：甲见乙${hasYin(godsInB) ? "有" : "弱"}，乙见甲${hasYin(godsInA) ? "有" : "弱"}`);
    evidence.push(`食伤表达：${hasShiShang(godsInB) || hasShiShang(godsInA) ? "通畅" : "偏弱"}`);
    detail = "友谊语境下，印星主理解，食伤主趣味表达，宜保持真诚与边界。";
    tone = hasYin(godsInB) || hasYin(godsInA) ? "harmonious" : "neutral";
  } else {
    evidence.push(`甲见乙：${[...new Set(godsInB)].join("、")}`);
    evidence.push(`乙见甲：${[...new Set(godsInA)].join("、")}`);
    detail = "十神反映互动角色：财主务实、官主规则、印主包容、食伤主表达、比劫主并肩。";
    tone = "neutral";
  }

  return { key: "tenGod", label: "十神互动", detail, evidence, tone };
}

function buildDeityCrossDimension(a: BaziResult, b: BaziResult, relationshipType: RelationshipContext): CompatibilityDimension {
  const branchesB = new Set(collectBranches(b));
  const branchesA = new Set(collectBranches(a));
  const evidence: string[] = [];

  const dayBranchA = a.pillars!.day.charAt(1);
  const dayBranchB = b.pillars!.day.charAt(1);

  if (branchesB.has(TAOHUA[dayBranchA])) {
    evidence.push(`甲桃花${TAOHUA[dayBranchA]}落于乙盘中，人缘吸引力易被触发`);
  }
  if (branchesA.has(TAOHUA[dayBranchB])) {
    evidence.push(`乙桃花${TAOHUA[dayBranchB]}落于甲盘中，互动中魅力因素较明显`);
  }
  if (branchesB.has(YIMA[dayBranchA])) {
    evidence.push(`甲驿马${YIMA[dayBranchA]}落于乙盘，生活节奏差异或迁动频繁`);
  }
  if (branchesA.has(YIMA[dayBranchB])) {
    evidence.push(`乙驿马${YIMA[dayBranchB]}落于甲盘，一方变动可能影响另一方稳定感`);
  }
  if (branchesB.has(YANGREN[a.dayMaster] ?? "")) {
    evidence.push(`甲羊刃${YANGREN[a.dayMaster]}落于乙盘，冲突时锋芒需收敛`);
  }
  if (branchesA.has(YANGREN[b.dayMaster] ?? "")) {
    evidence.push(`乙羊刃${YANGREN[b.dayMaster]}落于甲盘，争执时易有强硬表现`);
  }

  if (evidence.length === 0) {
    evidence.push("跨盘未见显著桃花、驿马、羊刃触达");
  }

  let detail = "神煞跨盘触达提示关系中的吸引力、变动与锋芒因素。";
  if (relationshipType === "romance" && evidence.some((e) => e.includes("桃花"))) {
    detail += "桃花互见，吸引力与社交曝光较强，亦需留意边界。";
  } else if (evidence.some((e) => e.includes("驿马"))) {
    detail += "驿马互见，异地或节奏变化是关系变量，宜提前协商。";
  } else if (evidence.some((e) => e.includes("羊刃"))) {
    detail += "羊刃互见，冲突时易强硬，宜设冷静期与沟通规则。";
  }

  const tone: BranchRelationTone | "mixed" = evidence.some((e) => e.includes("羊刃"))
    ? "conflict"
    : evidence.some((e) => e.includes("桃花"))
      ? "harmonious"
      : "neutral";

  return { key: "deityCross", label: "神煞触达", detail, evidence, tone };
}

function buildSummaryFields(
  dimensions: CompatibilityDimension[],
  relationshipType: RelationshipContext,
  nameA: string,
  nameB: string,
): Pick<
  BaziCompatibilityResult,
  | "summary"
  | "emotionPattern"
  | "communicationStyle"
  | "conflictSources"
  | "longTermStability"
  | "attraction"
  | "practicalRisks"
  | "repairAdvice"
  | "highlights"
> {
  const dayBranch = dimensions.find((d) => d.key === "dayBranch");
  const dayMaster = dimensions.find((d) => d.key === "dayMaster");
  const strength = dimensions.find((d) => d.key === "strengthBalance");
  const element = dimensions.find((d) => d.key === "elementComplement");
  const tenGod = dimensions.find((d) => d.key === "tenGod");
  const deity = dimensions.find((d) => d.key === "deityCross");
  const pillar = dimensions.find((d) => d.key === "pillarCross");

  const positive: string[] = [];
  const challenges: string[] = [];

  for (const dim of dimensions) {
    if (dim.tone === "harmonious") positive.push(`${dim.label}：${dim.detail.split("。")[0]}`);
    if (dim.tone === "conflict") challenges.push(`${dim.label}：${dim.detail.split("。")[0]}`);
  }

  const relLabel = RELATIONSHIP_LABELS[relationshipType];

  const summary = `${nameA}与${nameB}（${relLabel}）八字缘合：${dayBranch?.detail.split("。")[0] ?? "日支互动平和"}；${dayMaster?.detail.split("。")[0] ?? "日主关系中性"}。此为趋势参考，非定论。`;

  const emotionPattern = dayMaster?.detail ?? "情绪节奏需结合双方日主五行观察。";
  const communicationStyle = tenGod?.detail ?? "沟通风格取决于十神互动与表达通道。";

  const conflictSources: string[] = [];
  if (dayBranch?.tone === "conflict" || dayBranch?.tone === "mixed") {
    conflictSources.push("日支冲刑害带来日常节奏摩擦");
  }
  if (strength?.tone === "conflict") {
    conflictSources.push("双方身强，主导权与决策风格易冲突");
  }
  if (deity?.evidence.some((e) => e.includes("羊刃"))) {
    conflictSources.push("羊刃触达，争执时易言辞锋利");
  }
  if (pillar?.tone === "conflict") {
    conflictSources.push("四柱交叉冲刑较多，背景与习惯差异大");
  }
  if (conflictSources.length === 0) {
    conflictSources.push("未见强烈结构性冲突，摩擦多来自沟通与期待管理");
  }

  let longTermStability = "";
  if (dayBranch?.tone === "harmonious" && strength?.tone === "harmonious") {
    longTermStability = "日支合拱且强弱互补，长期稳定性倾向较好，但仍需持续经营。";
  } else if (dayBranch?.tone === "conflict") {
    longTermStability = "日支有冲，长期相处需建立弹性规则与共同目标，避免积累怨气。";
  } else {
    longTermStability = "结构中性，长期稳定取决于价值观一致性与冲突修复能力。";
  }

  let attraction = "";
  if (deity?.evidence.some((e) => e.includes("桃花"))) {
    attraction = "桃花互见，吸引力与人缘因素较明显，初期互动易有火花。";
  } else if (dayMaster?.tone === "harmonious") {
    attraction = "日主相生，天然有扶持感与亲近感，吸引力偏温厚持久。";
  } else {
    attraction = "吸引力来自互补差异与共同兴趣，宜主动创造共处记忆。";
  }

  const practicalRisks: string[] = [];
  if (deity?.evidence.some((e) => e.includes("驿马"))) {
    practicalRisks.push("驿马触达，异地、出差或节奏变化可能影响陪伴感");
  }
  if (strength?.tone === "conflict") {
    practicalRisks.push("双强格局，重大决策时易各执己见");
  }
  if (element?.tone === "neutral" && element.evidence[0]?.includes("未见")) {
    practicalRisks.push("五行互补有限，生活压力期需额外支持系统");
  }
  if (practicalRisks.length === 0) {
    practicalRisks.push("现实风险主要来自沟通断层与期待不一致，宜定期对齐");
  }

  const repairAdvice: string[] = [];
  if (dayBranch?.tone === "conflict" || dayBranch?.tone === "mixed") {
    repairAdvice.push("日支冲刑时，设立固定沟通时间与冷静期，避免在情绪激动时做决定");
  }
  if (strength?.tone === "conflict") {
    repairAdvice.push("双强时明确分工：谁主导何领域，减少全面竞争");
  }
  if (tenGod?.tone === "harmonious") {
    repairAdvice.push("善用十神中的印星与食伤：一方倾听，一方表达，交替进行");
  }
  repairAdvice.push("以具体行动验证理解，不只停留在象征解读层面");
  if (relationshipType === "romance") {
    repairAdvice.push("婚恋议题中，配偶星不得位时，用稳定投入代替猜测");
  }

  return {
    summary,
    emotionPattern,
    communicationStyle,
    conflictSources,
    longTermStability,
    attraction,
    practicalRisks,
    repairAdvice,
    highlights: { positive, challenges },
  };
}

function emptyResult(error: string): BaziCompatibilityResult {
  const emptyBazi = computeBazi({});
  return {
    error,
    personA: emptyBazi,
    personB: emptyBazi,
    relationshipType: "general",
    summary: "",
    emotionPattern: "",
    communicationStyle: "",
    conflictSources: [],
    longTermStability: "",
    attraction: "",
    practicalRisks: [],
    repairAdvice: [],
    highlights: { positive: [], challenges: [] },
    dimensions: [],
  };
}

export function computeBaziCompatibility(input: BaziCompatibilityInput): BaziCompatibilityResult {
  if (!input.personA.birthDate || !input.personB.birthDate) {
    return emptyResult("birth_date_required");
  }

  const personA = computeBazi({
    birthDate: input.personA.birthDate,
    birthTime: input.personA.birthTime,
    gender: input.personA.gender,
    timestamp: new Date().toISOString(),
  });
  const personB = computeBazi({
    birthDate: input.personB.birthDate,
    birthTime: input.personB.birthTime,
    gender: input.personB.gender,
    timestamp: new Date().toISOString(),
  });

  if (personA.error || !personA.pillars) {
    return { ...emptyResult(personA.error ?? "person_a_invalid"), personA, personB };
  }
  if (personB.error || !personB.pillars) {
    return { ...emptyResult(personB.error ?? "person_b_invalid"), personA, personB };
  }

  const dimensions: CompatibilityDimension[] = [
    buildDayBranchDimension(personA, personB),
    buildDayMasterDimension(personA, personB),
    buildPillarCrossDimension(personA, personB),
    buildElementComplementDimension(personA, personB),
    buildStrengthBalanceDimension(personA, personB),
    buildTenGodDimensionWithGender(
      personA,
      personB,
      input.personA.gender,
      input.personB.gender,
      input.relationshipType,
    ),
    buildDeityCrossDimension(personA, personB, input.relationshipType),
  ];

  const nameA = input.personA.name?.trim() || "甲";
  const nameB = input.personB.name?.trim() || "乙";
  const summaryFields = buildSummaryFields(dimensions, input.relationshipType, nameA, nameB);

  return {
    personA,
    personB,
    relationshipType: input.relationshipType,
    dimensions,
    ...summaryFields,
  };
}
