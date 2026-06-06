import { useMemo, useState } from "react";
import { drawTarotSpread } from "@atlas/engines";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/theme/tokens";

type TarotCard = {
  id: string;
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

const POSITIONS = ["过去/成因", "现在/核心", "趋势/建议"];

export function TarotDrawPanel({ onUseSpread, loading }: Props) {
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);

  const spreadText = useMemo(() => formatSpread(drawn), [drawn]);

  const drawCards = () => {
    const seed = `${Date.now()}-${question}`;
    const result = drawTarotSpread({ seed, spreadId: "three-timeline", includeMinor: false });
    const next: DrawnCard[] = result.cards.map((c) => ({
      card: { id: c.id, name: c.name, keywords: c.keywords },
      position: c.position,
      reversed: c.reversed,
    }));
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
