import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/theme/tokens";

type TarotCard = {
  id: number;
  name: string;
  keywords: string[];
};

type DrawnCard = {
  card: TarotCard;
  reversed: boolean;
  position: string;
};

type TarotCardSlot = DrawnCard | { position: string; pending: true };

type Props = {
  onUseSpread: (question: string) => void;
  loading?: boolean;
};

const DECK: TarotCard[] = [
  { id: 0, name: "愚者", keywords: ["开始", "冒险", "信任"] },
  { id: 1, name: "魔术师", keywords: ["意志", "行动", "资源"] },
  { id: 2, name: "女祭司", keywords: ["直觉", "潜意识", "等待"] },
  { id: 3, name: "皇后", keywords: ["滋养", "创造", "丰盛"] },
  { id: 4, name: "皇帝", keywords: ["结构", "边界", "稳定"] },
  { id: 5, name: "教皇", keywords: ["传统", "学习", "信念"] },
  { id: 6, name: "恋人", keywords: ["选择", "关系", "价值"] },
  { id: 7, name: "战车", keywords: ["推进", "掌控", "决心"] },
  { id: 8, name: "力量", keywords: ["勇气", "耐心", "柔韧"] },
  { id: 9, name: "隐者", keywords: ["内省", "独处", "洞见"] },
  { id: 10, name: "命运之轮", keywords: ["周期", "转机", "变化"] },
  { id: 11, name: "正义", keywords: ["公平", "判断", "因果"] },
  { id: 12, name: "倒吊人", keywords: ["暂停", "换位", "放下"] },
  { id: 13, name: "死神", keywords: ["结束", "转化", "新生"] },
  { id: 14, name: "节制", keywords: ["平衡", "调和", "修复"] },
  { id: 15, name: "恶魔", keywords: ["束缚", "欲望", "阴影"] },
  { id: 16, name: "塔", keywords: ["突变", "揭示", "重建"] },
  { id: 17, name: "星星", keywords: ["希望", "疗愈", "指引"] },
  { id: 18, name: "月亮", keywords: ["迷雾", "不安", "想象"] },
  { id: 19, name: "太阳", keywords: ["清晰", "活力", "成功"] },
  { id: 20, name: "审判", keywords: ["觉醒", "复盘", "召唤"] },
  { id: 21, name: "世界", keywords: ["完成", "整合", "抵达"] },
];

const POSITIONS = ["过去/成因", "现在/核心", "趋势/建议"];

export function TarotDrawPanel({ onUseSpread, loading }: Props) {
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);

  const spreadText = useMemo(() => formatSpread(drawn), [drawn]);

  const drawCards = () => {
    const deck = [...DECK];
    const next: DrawnCard[] = [];
    for (const position of POSITIONS) {
      const index = Math.floor(Math.random() * deck.length);
      const card = deck.splice(index, 1)[0];
      next.push({ card, position, reversed: Math.random() > 0.72 });
    }
    setDrawn(next);
  };

  const useSpread = () => {
    if (drawn.length === 0) return;
    const userQuestion = question.trim() || "请根据这组塔罗牌做当下趋势解读。";
    onUseSpread(`${userQuestion}\n\n本次塔罗抽卡：${spreadText}`);
  };

  return (
    <section className="tarot-panel">
      <div className="panel-head">
        <div>
          <h2>塔罗抽卡</h2>
          <p className="hint">三张牌阵：过去/成因、现在/核心、趋势/建议</p>
        </div>
        <button type="button" className="shuffle" onClick={drawCards}>
          {drawn.length > 0 ? "重新抽卡" : "抽三张牌"}
        </button>
      </div>

      <textarea
        placeholder="可先写下想问的问题，再抽牌…"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
      />

      <div className="cards" aria-live="polite">
        {(drawn.length > 0 ? drawn : placeholderCards()).map((item, index) => (
          <article key={`${item.position}-${index}`} className={`tarot-card${isDrawnCard(item) ? "" : " back"}`}>
            <span className="position">{item.position}</span>
            {isDrawnCard(item) ? (
              <>
                <strong>{item.card.name}</strong>
                <span className="orientation">{item.reversed ? "逆位" : "正位"}</span>
                <p>{item.card.keywords.join(" / ")}</p>
              </>
            ) : (
              <>
                <strong>待抽取</strong>
                <span className="orientation">洗牌中</span>
                <p>点击抽卡后显示牌面</p>
              </>
            )}
          </article>
        ))}
      </div>

      <Button
        title="用这组牌生成塔罗解读"
        onClick={useSpread}
        loading={loading}
        disabled={drawn.length === 0}
      />

      <style>{`
        .tarot-panel {
          padding: ${spacing.md}px;
          margin-bottom: ${spacing.xl}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          background: ${colors.surface};
        }
        .panel-head {
          display: flex;
          justify-content: space-between;
          gap: ${spacing.md}px;
          align-items: flex-start;
          margin-bottom: ${spacing.md}px;
        }
        .panel-head h2 { margin: 0 0 ${spacing.xs}px; font-size: 20px; }
        .hint { margin: 0; color: ${colors.textMuted}; font-size: 13px; }
        .shuffle {
          flex: 0 0 auto;
          border: 1px solid ${colors.goldDim};
          border-radius: ${radius.sm}px;
          padding: ${spacing.sm}px ${spacing.md}px;
          background: ${colors.surfaceElevated};
          color: ${colors.gold};
          font-weight: 600;
          cursor: pointer;
        }
        .tarot-panel textarea {
          width: 100%;
          background: ${colors.surfaceElevated};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
          resize: vertical;
          margin-bottom: ${spacing.md}px;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: ${spacing.sm}px;
          margin-bottom: ${spacing.md}px;
        }
        .tarot-card {
          min-height: 172px;
          padding: ${spacing.md}px;
          border: 1px solid ${colors.goldDim};
          border-radius: ${radius.md}px;
          background: ${colors.surfaceElevated};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .tarot-card.back {
          border-style: dashed;
          color: ${colors.textMuted};
        }
        .position, .orientation {
          color: ${colors.gold};
          font-size: 12px;
          font-weight: 600;
        }
        .tarot-card strong { font-size: 22px; }
        .tarot-card p { margin: 0; color: ${colors.textSecondary}; font-size: 13px; }
        @media (max-width: 680px) {
          .panel-head { flex-direction: column; }
          .shuffle { width: 100%; }
          .cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

function placeholderCards(): TarotCardSlot[] {
  return POSITIONS.map((position) => ({ position, pending: true }));
}

function isDrawnCard(item: TarotCardSlot): item is DrawnCard {
  return "card" in item;
}

function formatSpread(cards: DrawnCard[]): string {
  return cards
    .map((item) => {
      const orientation = item.reversed ? "逆位" : "正位";
      return `${item.position}：${item.card.name}（${orientation}，关键词：${item.card.keywords.join("、")}）`;
    })
    .join("；");
}
