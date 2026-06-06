import type { TarotInterpretResult, MatchedRule } from "@atlas/shared-types";
import type { TarotDeckCard } from "./tarot-deck.js";
import { normalizeTarotCardName, tarotNamesMatch } from "./tarot-names.js";

export type DrawnTarotCard = TarotDeckCard & {
  reversed: boolean;
  position: string;
  reversalLayer?: string;
};

export type TarotPairRule = {
  id: string;
  cards: string[];
  theme: string;
  meaning: string;
  caution: string;
};

export const TAROT_PAIR_RULES: TarotPairRule[] = [
  { id: "lovers-devil", cards: ["恋人", "恶魔"], theme: "选择与依附", meaning: "关系中同时存在吸引和绑定。", caution: "不要把化学反应读成稳定承诺。" },
  { id: "magician-priestess", cards: ["魔术师", "女祭司"], theme: "显化与隐藏", meaning: "行动与倾听需要平衡。", caution: "两者皆逆位时防漂亮话。" },
  { id: "tower-star", cards: ["高塔", "星星"], theme: "崩塌后的疗愈", meaning: "旧结构打破后恢复出现。", caution: "星星不是立刻变好。" },
  { id: "death-world", cards: ["死神", "世界"], theme: "结束与完成", meaning: "循环正式收束。", caution: "需要完成告别。" },
  { id: "emperor-hierophant", cards: ["皇帝", "教皇"], theme: "规则与体系", meaning: "权威与制度成为中心。", caution: "关系题里可能僵硬。" },
  { id: "moon-seven-cups", cards: ["月亮", "圣杯七"], theme: "迷雾与幻想", meaning: "情绪投射增强，需事实校准。", caution: "信息不足时勿做终局承诺。" },
  { id: "swords-three-cups-three", cards: ["宝剑三", "圣杯三"], theme: "伤害与群体", meaning: "社交信息牵动伤痛。", caution: "勿传播未经确认说法。" },
  { id: "pentacles-ace-ten", cards: ["星币一", "星币十"], theme: "种子到家业", meaning: "新资源有长期沉淀潜力。", caution: "仍需预算与耐心。" },
  { id: "chariot-justice", cards: ["战车", "正义"], theme: "推进与判断", meaning: "意志与规则共同决定方向。", caution: "硬冲可能忽视公平。" },
  { id: "hermit-star", cards: ["隐者", "星星"], theme: "内省与希望", meaning: "独处后愿景更清晰。", caution: "希望需落地为行动。" },
  { id: "lovers-temperance", cards: ["恋人", "节制"], theme: "选择与调和", meaning: "关系需要价值与节奏平衡。", caution: "避免只谈感觉不谈边界。" },
  { id: "empress-emperor", cards: ["皇后", "皇帝"], theme: "滋养与结构", meaning: "创造与秩序并存。", caution: "一方过强会失衡。" },
  { id: "devil-tower", cards: ["恶魔", "高塔"], theme: "束缚与突变", meaning: "旧绑定被强制打破。", caution: "震荡期需保护核心资源。" },
  { id: "sun-world", cards: ["太阳", "世界"], theme: "清晰与完成", meaning: "可见成果与阶段完成。", caution: "完成不等于无需收尾。" },
  { id: "wands-ace-pentacles-ace", cards: ["权杖一", "星币一"], theme: "启动与资源", meaning: "新行动需配现实投入。", caution: "热情 alone 不够。" },
  { id: "cups-ten-swords-ten", cards: ["圣杯十", "宝剑十"], theme: "情感与终结", meaning: "理想与切割并见。", caution: "区分真实结束与情绪放大。" },
];

const REVERSAL_LAYERS = ["阻滞", "过量", "内化", "延迟", "释放"] as const;

const SCENARIO_SECTIONS: Record<string, string[]> = {
  关系: ["双方状态", "互动张力", "真实需求", "下一步边界"],
  事业: ["职业主轴", "资源阻力", "可执行动作", "复盘时间"],
  财务: ["收入入口", "支出漏洞", "风险控制", "稳定策略"],
  心理: ["情绪命名", "重复模式", "身体信号", "整合练习"],
  通用: ["核心主题", "阻力", "资源", "行动建议"],
};

export function matchPairRules(cards: DrawnTarotCard[]): MatchedRule[] {
  const names = new Set(cards.map((c) => normalizeTarotCardName(c.name)));
  const results: MatchedRule[] = [];
  for (const rule of TAROT_PAIR_RULES) {
    if (rule.cards.every((n) => names.has(normalizeTarotCardName(n)))) {
      results.push({
        id: rule.id,
        name: rule.theme,
        confidence: 0.9,
        meaning: rule.meaning,
        evidence: rule.cards.map((c) => ({ label: c, detail: rule.theme })),
      });
    }
  }
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i]!;
    const b = cards[i + 1]!;
    const hit = TAROT_PAIR_RULES.find(
      (r) =>
        (tarotNamesMatch(r.cards[0], a.name) && tarotNamesMatch(r.cards[1], b.name)) ||
        (tarotNamesMatch(r.cards[0], b.name) && tarotNamesMatch(r.cards[1], a.name)),
    );
    if (hit && !results.some((r) => r.id === hit.id)) {
      results.push({
        id: `${hit.id}-adj`,
        name: `${hit.theme}（相邻）`,
        confidence: 0.75,
        meaning: hit.meaning,
        evidence: [{ label: a.position, detail: `${a.name} + ${b.name}` }],
      });
    }
  }
  return results;
}

export function pickReversalLayer(card: DrawnTarotCard, rngValue: number): string {
  if (!card.reversed) return "";
  const idx = Math.floor(rngValue * REVERSAL_LAYERS.length);
  return REVERSAL_LAYERS[idx] ?? "阻滞";
}

export function getReversalReading(card: DrawnTarotCard, layer: string): string {
  const detail = card.reversalLayers?.[layer as keyof typeof card.reversalLayers];
  if (detail) return detail;
  return `${card.name}逆位（${layer}）：${card.reversedMeaning}`;
}

export function getScenarioReading(
  cards: DrawnTarotCard[],
  scenario: "关系" | "事业" | "财务" | "心理" | "通用" = "通用",
): Array<{ title: string; content: string }> {
  const sections = SCENARIO_SECTIONS[scenario] ?? SCENARIO_SECTIONS.通用;
  return sections.map((title, i) => {
    const card = cards[i] ?? cards[cards.length - 1];
    if (!card) return { title, content: "—" };
    const meaning = card.reversed ? card.reversedMeaning : card.upright;
    return { title, content: `${card.name}${card.reversed ? "逆" : "正"}：${meaning}` };
  });
}

export function buildTarotCombination(cards: DrawnTarotCard[]): string {
  if (cards.length === 0) return "抽牌后会在这里生成整体脉络。";
  const majorCount = cards.filter((c) => c.arcana === "major").length;
  const reversedCount = cards.filter((c) => c.reversed).length;
  const center = cards[Math.floor(cards.length / 2)]!;
  return `${cards.map((c) => `${c.position}·${c.name}${c.reversed ? "逆" : "正"}`).join("，")}。核心${center.name}；大阿卡${majorCount}张，逆位${reversedCount}张。`;
}

export function interpretTarot(
  cards: DrawnTarotCard[],
  opts: { scenario?: "关系" | "事业" | "财务" | "心理" | "通用"; question?: string } = {},
): TarotInterpretResult {
  let scenario = opts.scenario ?? "通用";
  if (!opts.scenario && opts.question) {
    const q = opts.question;
    if (/关系|恋|复合|伴侣/.test(q)) scenario = "关系";
    else if (/工作|事业|职业/.test(q)) scenario = "事业";
    else if (/钱|财|投资/.test(q)) scenario = "财务";
    else if (/心理|情绪|梦/.test(q)) scenario = "心理";
  }
  const pairMatches = matchPairRules(cards);
  const scenarioSections = getScenarioReading(cards, scenario);
  const cardReadings = cards.map((c) => ({
    cardId: c.id,
    name: c.name,
    position: c.position,
    reversed: c.reversed,
    upright: c.upright,
    reversalLayer: c.reversalLayer,
    reversalDetail: c.reversed ? getReversalReading(c, c.reversalLayer ?? "阻滞") : undefined,
  }));
  return {
    pairMatches,
    scenarioSections,
    cardReadings,
    summary: buildTarotCombination(cards),
  };
}
