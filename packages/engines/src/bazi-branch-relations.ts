export type Element = "木" | "火" | "土" | "金" | "水";

export type BranchRelationKind = "六合" | "六冲" | "三合" | "三刑" | "六害" | "自刑";

export type BranchRelationTone = "harmonious" | "conflict" | "neutral";

export interface BranchRelation {
  kind: BranchRelationKind;
  description: string;
  tone: BranchRelationTone;
}

export const BRANCH_SIX_COMBOS: Record<string, { partner: string; element: Element }> = {
  子: { partner: "丑", element: "土" },
  丑: { partner: "子", element: "土" },
  寅: { partner: "亥", element: "木" },
  亥: { partner: "寅", element: "木" },
  卯: { partner: "戌", element: "火" },
  戌: { partner: "卯", element: "火" },
  辰: { partner: "酉", element: "金" },
  酉: { partner: "辰", element: "金" },
  巳: { partner: "申", element: "水" },
  申: { partner: "巳", element: "水" },
  午: { partner: "未", element: "土" },
  未: { partner: "午", element: "土" },
};

export const BRANCH_CLASHES: Record<string, string> = {
  子: "午", 丑: "未", 寅: "申", 卯: "酉", 辰: "戌", 巳: "亥",
  午: "子", 未: "丑", 申: "寅", 酉: "卯", 戌: "辰", 亥: "巳",
};

export const BRANCH_SIX_HARMS: Record<string, string> = {
  子: "未", 未: "子",
  丑: "午", 午: "丑",
  寅: "巳", 巳: "寅",
  卯: "辰", 辰: "卯",
  申: "亥", 亥: "申",
  酉: "戌", 戌: "酉",
};

const BRANCH_THREE_PUNISHMENT_GROUPS: string[][] = [
  ["寅", "巳", "申"],
  ["丑", "戌", "未"],
  ["子", "卯"],
];

const BRANCH_THREE_COMBO_GROUPS: Array<{ branches: string[]; element: Element; name: string }> = [
  { branches: ["申", "子", "辰"], element: "水", name: "申子辰水局" },
  { branches: ["寅", "午", "戌"], element: "火", name: "寅午戌火局" },
  { branches: ["亥", "卯", "未"], element: "木", name: "亥卯未木局" },
  { branches: ["巳", "酉", "丑"], element: "金", name: "巳酉丑金局" },
];

export const STEM_FIVE_COMBOS: Record<string, { partner: string; element: Element }> = {
  甲: { partner: "己", element: "土" },
  己: { partner: "甲", element: "土" },
  乙: { partner: "庚", element: "金" },
  庚: { partner: "乙", element: "金" },
  丙: { partner: "辛", element: "水" },
  辛: { partner: "丙", element: "水" },
  丁: { partner: "壬", element: "木" },
  壬: { partner: "丁", element: "木" },
  戊: { partner: "癸", element: "火" },
  癸: { partner: "戊", element: "火" },
};

export function generates(a: Element, b: Element): boolean {
  return (
    (a === "木" && b === "火") ||
    (a === "火" && b === "土") ||
    (a === "土" && b === "金") ||
    (a === "金" && b === "水") ||
    (a === "水" && b === "木")
  );
}

export function controls(a: Element, b: Element): boolean {
  return (
    (a === "木" && b === "土") ||
    (a === "土" && b === "水") ||
    (a === "水" && b === "火") ||
    (a === "火" && b === "金") ||
    (a === "金" && b === "木")
  );
}

export type ElementRelationKind = "相生" | "相克" | "比和";

export function getElementRelation(a: Element, b: Element): ElementRelationKind {
  if (a === b) return "比和";
  if (generates(a, b) || generates(b, a)) return "相生";
  if (controls(a, b) || controls(b, a)) return "相克";
  return "比和";
}

export function detectStemRelation(stemA: string, stemB: string): BranchRelation | null {
  const combo = STEM_FIVE_COMBOS[stemA];
  if (combo && combo.partner === stemB) {
    return {
      kind: "六合",
      description: `${stemA}${stemB}天干五合，化${combo.element}`,
      tone: "harmonious",
    };
  }
  return null;
}

export function detectBranchRelations(branchA: string, branchB: string): BranchRelation[] {
  if (!branchA || !branchB) return [];

  const found: BranchRelation[] = [];

  if (branchA === branchB && ["辰", "午", "酉", "亥"].includes(branchA)) {
    found.push({
      kind: "自刑",
      description: `${branchA}${branchB}自刑，同气相激`,
      tone: "conflict",
    });
  }

  const sixCombo = BRANCH_SIX_COMBOS[branchA];
  if (sixCombo && sixCombo.partner === branchB) {
    found.push({
      kind: "六合",
      description: `${branchA}${branchB}六合，化${sixCombo.element}`,
      tone: "harmonious",
    });
  }

  if (BRANCH_CLASHES[branchA] === branchB) {
    found.push({
      kind: "六冲",
      description: `${branchA}${branchB}六冲，气场对冲`,
      tone: "conflict",
    });
  }

  if (BRANCH_SIX_HARMS[branchA] === branchB) {
    found.push({
      kind: "六害",
      description: `${branchA}${branchB}六害，暗中牵制`,
      tone: "conflict",
    });
  }

  for (const group of BRANCH_THREE_PUNISHMENT_GROUPS) {
    if (group.includes(branchA) && group.includes(branchB) && branchA !== branchB) {
      found.push({
        kind: "三刑",
        description: `${branchA}${branchB}相刑，需留意摩擦与规则冲突`,
        tone: "conflict",
      });
      break;
    }
  }

  for (const group of BRANCH_THREE_COMBO_GROUPS) {
    if (group.branches.includes(branchA) && group.branches.includes(branchB) && branchA !== branchB) {
      const alreadySix = found.some((r) => r.kind === "六合");
      if (!alreadySix) {
        found.push({
          kind: "三合",
          description: `${branchA}${branchB}拱${group.name}，有合力倾向`,
          tone: "harmonious",
        });
      }
      break;
    }
  }

  return found;
}

export function formatBranchRelationEvidence(
  branchA: string,
  branchB: string,
  context?: string,
): string[] {
  const relations = detectBranchRelations(branchA, branchB);
  const prefix = context ? `${context}：` : "";
  if (relations.length === 0) {
    return [`${prefix}${branchA}与${branchB}无显著合冲刑害`];
  }
  return relations.map((r) => `${prefix}${r.description}`);
}

export function detectCombinationsInChart(pillars: Record<string, string>): string[] {
  const branches = [
    pillars.year.charAt(1),
    pillars.month.charAt(1),
    pillars.day.charAt(1),
    pillars.hour.charAt(1),
  ];
  const labels = ["年支", "月支", "日支", "时支"];
  const found: string[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const relations = detectBranchRelations(branches[i], branches[j]);
      for (const rel of relations) {
        found.push(`${labels[i]}${branches[i]}与${labels[j]}${branches[j]}${rel.description.replace(/^.+?(六合|六冲|六害|三刑|三合|自刑)/, "$1")}`);
      }
    }
  }

  return found;
}
