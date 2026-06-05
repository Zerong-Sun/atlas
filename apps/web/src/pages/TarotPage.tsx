import { useMemo, useState } from "react";
import { Page } from "@/components/ui/Page";

type DeckMode = "major" | "full";
type SpreadMode = "three" | "decision" | "mirror";

type Card = {
  name: string;
  suit?: string;
  keywords: string[];
};

type DrawnCard = Card & {
  position: string;
  reversed: boolean;
};

const MAJOR: Card[] = [
  { name: "愚者", keywords: ["开始", "冒险", "信任"] },
  { name: "魔术师", keywords: ["意志", "行动", "资源"] },
  { name: "女祭司", keywords: ["直觉", "潜意识", "等待"] },
  { name: "皇后", keywords: ["滋养", "创造", "丰盛"] },
  { name: "皇帝", keywords: ["结构", "边界", "稳定"] },
  { name: "教皇", keywords: ["传统", "学习", "信念"] },
  { name: "恋人", keywords: ["选择", "关系", "价值"] },
  { name: "战车", keywords: ["推进", "掌控", "决心"] },
  { name: "力量", keywords: ["勇气", "耐心", "柔韧"] },
  { name: "隐者", keywords: ["内省", "独处", "洞见"] },
  { name: "命运之轮", keywords: ["周期", "转机", "变化"] },
  { name: "正义", keywords: ["公平", "判断", "因果"] },
  { name: "倒吊人", keywords: ["暂停", "换位", "放下"] },
  { name: "死神", keywords: ["结束", "转化", "新生"] },
  { name: "节制", keywords: ["平衡", "调和", "修复"] },
  { name: "恶魔", keywords: ["束缚", "欲望", "阴影"] },
  { name: "塔", keywords: ["突变", "揭示", "重建"] },
  { name: "星星", keywords: ["希望", "疗愈", "指引"] },
  { name: "月亮", keywords: ["迷雾", "不安", "想象"] },
  { name: "太阳", keywords: ["清晰", "活力", "成功"] },
  { name: "审判", keywords: ["觉醒", "复盘", "召唤"] },
  { name: "世界", keywords: ["完成", "整合", "抵达"] },
];

const MINOR: Card[] = ["权杖", "圣杯", "宝剑", "星币"].flatMap((suit) =>
  ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "王后", "国王"].map((rank) => ({
    name: `${suit}${rank}`,
    suit,
    keywords: suitKeywords(suit, rank),
  }))
);

const SPREADS: Record<SpreadMode, { label: string; positions: string[]; note: string }> = {
  three: {
    label: "三牌阵",
    positions: ["成因", "核心", "建议"],
    note: "适合快速看一件事的来龙去脉。",
  },
  decision: {
    label: "抉择阵",
    positions: ["方案 A", "方案 B", "隐藏条件", "建议"],
    note: "适合两个选择之间的比较。",
  },
  mirror: {
    label: "关系镜像",
    positions: ["我方状态", "对方状态", "关系张力", "下一步"],
    note: "适合关系、合作与互动议题。",
  },
};

export function TarotPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<DeckMode>("major");
  const [spreadMode, setSpreadMode] = useState<SpreadMode>("three");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [lastDraw, setLastDraw] = useState("");

  const combo = useMemo(() => buildComboReading(cards), [cards]);
  const spread = SPREADS[spreadMode];

  const draw = () => {
    const deck = [...MAJOR, ...(mode === "full" ? MINOR : [])];
    const next: DrawnCard[] = [];
    for (const position of spread.positions) {
      const index = Math.floor(Math.random() * deck.length);
      const card = deck.splice(index, 1)[0];
      next.push({ ...card, position, reversed: Math.random() > 0.72 });
    }
    setCards(next);
    setLastDraw(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <Page wide className="tarot-page">
      <section className="method-detail-hero tarot-hero">
        <p className="method-kicker">TAROT SPREAD</p>
        <h1>塔罗抽卡</h1>
        <p>塔罗不需要和八字绑在一起。这里专注抽卡、牌面解释、牌阵位置和组合语义。</p>
      </section>

      <section className="tarot-console">
        <div className="tarot-controls">
          <label>
            <span>问题</span>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="写下你想问的事，也可以留空只看当下趋势。" />
          </label>
          <div className="deck-toggle" role="group" aria-label="牌组选择">
            <button type="button" className={mode === "major" ? "active" : ""} onClick={() => setMode("major")}>
              大阿卡那
            </button>
            <button type="button" className={mode === "full" ? "active" : ""} onClick={() => setMode("full")}>
              全牌组
            </button>
          </div>
          <div className="spread-toggle" role="group" aria-label="牌阵选择">
            {(Object.entries(SPREADS) as Array<[SpreadMode, (typeof SPREADS)[SpreadMode]]>).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={spreadMode === key ? "active" : ""}
                onClick={() => {
                  setSpreadMode(key);
                  setCards([]);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="spread-note">{spread.note}</p>
          <button type="button" className="draw-button" onClick={draw}>
            {cards.length ? "重新抽牌" : "开始抽牌"}
          </button>
          {lastDraw && <p className="last-draw">上次抽牌 {lastDraw}</p>}
        </div>

        <div className="tarot-spread" aria-live="polite">
          {(cards.length ? cards : spread.positions.map((position) => ({ name: "牌背", position, reversed: false, keywords: ["等待抽取"] }))).map((card, index) => (
            <article className={cards.length ? "spread-card" : "spread-card is-back"} key={`${card.position}-${index}`}>
              <span>{card.position}</span>
              <strong>{card.name}</strong>
              <i>{cards.length ? (card.reversed ? "逆位" : "正位") : "未翻开"}</i>
              <p>{card.keywords.join(" / ")}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="tarot-reading">
        <div className="section-heading">
          <p>INTERPRETATION</p>
          <h2>牌面与组合解释</h2>
        </div>
        <div className="reading-grid">
          <article>
            <span>问题焦点</span>
            <p>{question.trim() || "未指定问题，按当下趋势解释。"}</p>
          </article>
          <article>
            <span>组合语义</span>
            <p>{combo}</p>
          </article>
          <article>
            <span>指点</span>
            <p>先把“发生了什么”和“我希望什么”分开。若出现逆位，它更像提醒：能量不是没有，而是被卡在表达方式里。</p>
          </article>
        </div>
      </section>
    </Page>
  );
}

function suitKeywords(suit: string, rank: string) {
  const suitMap: Record<string, string[]> = {
    权杖: ["行动", "热情", "推进"],
    圣杯: ["情感", "关系", "感受"],
    宝剑: ["判断", "冲突", "思考"],
    星币: ["现实", "资源", "稳定"],
  };
  return [rank, ...(suitMap[suit] ?? [])];
}

function buildComboReading(cards: DrawnCard[]) {
  if (cards.length === 0) return "抽牌后会在这里生成这组牌的整体脉络。";
  const names = cards.map((card) => `${card.name}${card.reversed ? "逆位" : ""}`).join("、");
  const keywords = Array.from(new Set(cards.flatMap((card) => card.keywords))).slice(0, 6).join("、");
  return `${names}连在一起，主题落在${keywords}。先看第二张牌作为核心，再让第一张解释成因，第三张给行动方向。`;
}
