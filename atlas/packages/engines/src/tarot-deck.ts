/** Tarot spread definitions (mirrors web advanced library) */
export type TarotSpreadDefinition = {
  id: string;
  name: string;
  topic: "通用" | "关系" | "事业" | "财务" | "心理";
  difficulty: "入门" | "进阶" | "深度";
  positions: string[];
};

export const TAROT_SPREADS: TarotSpreadDefinition[] = [
  { id: "one-card", name: "一牌校准", topic: "通用", difficulty: "入门", positions: ["当前主象"] },
  { id: "three-timeline", name: "三牌时间线", topic: "通用", difficulty: "入门", positions: ["过去/成因", "现在/核心", "趋势/建议"] },
  { id: "cross", name: "小十字阵", topic: "通用", difficulty: "进阶", positions: ["核心", "阻力", "显性资源", "隐性资源", "建议"] },
  { id: "celtic-cross", name: "凯尔特十字", topic: "通用", difficulty: "深度", positions: ["现状", "挑战", "根源", "过去", "可能趋势", "近未来", "自我", "环境", "希望/恐惧", "结果"] },
  { id: "relationship-mirror", name: "关系镜像", topic: "关系", difficulty: "进阶", positions: ["我方状态", "对方状态", "显性互动", "隐性需求", "下一步"] },
  { id: "choice-gate", name: "双选门", topic: "通用", difficulty: "进阶", positions: ["方案A收益", "方案A代价", "方案B收益", "方案B代价", "选择原则"] },
  { id: "career-map", name: "事业地图", topic: "事业", difficulty: "进阶", positions: ["当前岗位", "核心能力", "外部机会", "内部阻力", "三十日行动"] },
  { id: "money-flow", name: "金钱流", topic: "财务", difficulty: "进阶", positions: ["收入入口", "支出漏洞", "资源沉淀", "风险提醒", "调整动作"] },
  { id: "shadow-dialogue", name: "阴影对话", topic: "心理", difficulty: "深度", positions: ["我看见的自己", "我回避的自己", "重复模式", "身体信号", "整合练习"] },
];

export type TarotDeckCard = {
  id: string;
  name: string;
  arcana: "major" | "minor";
  suit: string;
  element: string;
  upright: string;
  reversedMeaning: string;
  keywords: string[];
  reversedKeywords: string[];
  advice: string;
  reversalLayers?: Partial<Record<"阻滞" | "过量" | "内化" | "延迟" | "释放", string>>;
};

const MAJOR_NAMES = [
  "愚者", "魔术师", "女祭司", "皇后", "皇帝", "教皇", "恋人", "战车", "力量", "隐者",
  "命运之轮", "正义", "倒吊人", "死神", "节制", "恶魔", "高塔", "星星", "月亮", "太阳", "审判", "世界",
];

const SUIT_PREFIX = { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" } as const;
const RANKS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "王后", "国王"] as const;

function buildDeck(): TarotDeckCard[] {
  const major: TarotDeckCard[] = MAJOR_NAMES.map((name, i) => ({
    id: `major-${i}`,
    name,
    arcana: "major",
    suit: "major",
    element: "灵魂",
    upright: `${name}正位：主题能量顺畅流动。`,
    reversedMeaning: `${name}逆位：能量阻滞或内化。`,
    keywords: [name],
    reversedKeywords: ["阻滞"],
    advice: `关注${name}的核心主题。`,
  }));

  const minor: TarotDeckCard[] = Object.entries(SUIT_PREFIX).flatMap(([suit, prefix]) =>
    RANKS.map((rank, i) => ({
      id: `${suit}-${i}`,
      name: `${prefix}${rank}`,
      arcana: "minor" as const,
      suit,
      element: suit === "wands" ? "火" : suit === "cups" ? "水" : suit === "swords" ? "风" : "土",
      upright: `${prefix}${rank}：现实层面的具体主题。`,
      reversedMeaning: `${prefix}${rank}逆位：阻滞或过量。`,
      keywords: [rank, prefix],
      reversedKeywords: ["阻滞", "失衡"],
      advice: `用${prefix}的方式处理当前局面。`,
    })),
  );

  return [...major, ...minor];
}

export const TAROT_DECK = buildDeck();

export function getSpread(id: string): TarotSpreadDefinition {
  return TAROT_SPREADS.find((s) => s.id === id) ?? TAROT_SPREADS[1]!;
}

export function getCardByName(name: string): TarotDeckCard | undefined {
  return TAROT_DECK.find((c) => c.name === name);
}
