import { useEffect, useMemo, useState } from "react";
import { drawLenormand, type LenormandResult } from "@atlas/engines/lenormand";
import { CardDrawTable } from "@/components/charts/CardDrawTable";
import { FlipCard } from "@/components/charts/FlipCard";
import { useCardDrawPhase } from "@/hooks/useCardDrawPhase";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildLenormandReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { getLenormandDeckCardByName } from "@/data/lenormandDeck";
import { getLenormandCard, lookupLenormandPair } from "@/data/lenormandLibrary";

type Spread = "three" | "five" | "nine";

const SPREADS: Record<Spread, string> = {
  three: "三牌阵",
  five: "五牌阵",
  nine: "九宫格",
};

const SPREAD_COLUMNS: Record<Spread, number> = {
  three: 3,
  five: 3,
  nine: 3,
};

const POSITIONS: Record<Spread, string[]> = {
  three: ["过去/背景", "核心主题", "趋势/建议"],
  five: ["核心", "上方影响", "下方基础", "左方过去", "右方趋势"],
  nine: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

export function LenormandPage() {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<Spread>("three");
  const [result, setResult] = useState<LenormandResult | null>(null);
  const { phase, isBusy, runDraw, resetPhase } = useCardDrawPhase();

  useEffect(() => {
    if (!result) return;
    result.cards.forEach((card) => {
      const deck = getLenormandDeckCardByName(card.name);
      if (deck?.image) {
        const img = new Image();
        img.src = deck.image;
      }
    });
  }, [result]);
  const positions = POSITIONS[spread];

  const readings = useMemo(() => {
    if (!result) return [];
    return result.cards.map((card) => ({
      card,
      meaning: getLenormandCard(card.name)?.plainMeaning ?? "",
    }));
  }, [result]);

  const copilotReport = useMemo(() => {
    if (!result || phase !== "revealed") return null;
    return buildLenormandReportSnapshot(question, SPREADS[spread], result, readings);
  }, [result, question, spread, readings, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const visibleCards = result
    ? result.cards.map((c) => ({ ...c, deck: getLenormandDeckCardByName(c.name) }))
    : positions.map((position) => ({ position, placeholder: true as const }));

  const draw = () => {
    playMethodSound("lenormand", "action");
    setResult(null);
    runDraw({
      onShuffleComplete: () => {
        setResult(
          drawLenormand({
            spread,
            question: question.trim() || undefined,
            seed: `${Date.now()}-${question}-${spread}`,
          }),
        );
      },
      onRevealed: () => playMethodSound("lenormand", "complete"),
    });
  };

  return (
    <Page wide className="lenormand-page">
      <MethodHero
        methodId="lenormand"
        kicker="LENORMAND"
        title="雷诺曼牌"
        description="三十六张符号牌，以名词与相邻组合说话。内置 Dondorf 经典牌面（完整单张扫描），中心牌定主题，旁牌定修饰。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="输入你要问的事项…" />
        </label>
        <div className="chip-row">
          {(Object.keys(SPREADS) as Spread[]).map((s) => (
            <button
              key={s}
              type="button"
              className={spread === s ? "chip active" : "chip"}
              onClick={() => {
                setSpread(s);
                setResult(null);
                resetPhase();
              }}
            >
              {SPREADS[s]}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={draw} disabled={isBusy}>
          {phase === "shuffling" ? "洗牌中…" : phase === "drawing" ? "抽牌中…" : result ? "重新抽取" : "抽取雷诺曼牌"}
        </button>
      </section>

      <section className="lenormand-table-section">
        <CardDrawTable
          phase={phase}
          spreadCount={spread === "five" ? 3 : SPREAD_COLUMNS[spread]}
          spreadClassName={spread === "five" ? "tarot-spread--lenormand-five-cross" : undefined}
          className={spread === "five" ? "lenormand-table lenormand-table--five-cross" : "lenormand-table"}
          deckLabels={{ idle: "LENORMAND", shuffling: "SHUFFLING", drawing: "DRAWING" }}
        >
          {visibleCards.map((card, index) =>
            !("placeholder" in card) ? (
              <FlipCard
                key={`${card.position}-${card.id}`}
                position={card.position}
                revealed={phase === "revealed"}
                index={index}
                className={card.name === result?.centerTheme ? "spread-card--highlight" : ""}
                face={
                  card.deck ? (
                    <img
                      src={card.deck.image}
                      alt={card.name}
                      loading={phase === "revealed" ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <strong className="lenormand-fallback-face">{card.name}</strong>
                  )
                }
                meta={
                  <>
                    <span>{card.position}</span>
                    <strong>{card.name}</strong>
                    <p>{card.keywords.join(" / ")}</p>
                  </>
                }
              />
            ) : (
              <FlipCard
                key={`${card.position}-${index}`}
                position={card.position}
                revealed={false}
                index={index}
                placeholder
                placeholderHint="等待洗牌"
                meta={
                  <>
                    <span>{card.position}</span>
                    <strong>牌背</strong>
                    <i>等待抽取</i>
                  </>
                }
              />
            )
          )}
        </CardDrawTable>
      </section>

      {result && phase === "revealed" && (
        <section className="lenormand-result">
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          {result.centerTheme && <p className="muted">中心主题：{result.centerTheme}</p>}
          <div className="reading-grid">
            {readings.map(({ card, meaning }) => (
              <article key={`${card.id}-${card.position}`}>
                <span>{card.position}</span>
                <strong>{card.name}</strong>
                <p>{meaning}</p>
                {card.keywords.length > 0 && <p className="muted">{card.keywords.join(" · ")}</p>}
              </article>
            ))}
          </div>
          {result.pairs.length > 0 && (
            <div className="combo-panel">
              <h3>组合语法</h3>
              {result.pairs.map((p) => (
                <p key={`${p.cardA}-${p.cardB}`}>
                  {p.cardA} + {p.cardB}：{p.reading || lookupLenormandPair(p.cardA, p.cardB)}
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </Page>
  );
}
