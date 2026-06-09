import { useMemo, useState } from "react";
import { drawRunes, type RunesResult } from "@atlas/engines/runes";
import type { RuneSpread } from "@atlas/shared-types";
import { CardDrawTable } from "@/components/charts/CardDrawTable";
import { FlipCard } from "@/components/charts/FlipCard";
import { useCardDrawPhase } from "@/hooks/useCardDrawPhase";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildRunesReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";

const SPREADS: Record<RuneSpread, string> = {
  single: "单符",
  three: "三符",
  nine: "九符阵",
};

const SPREAD_POSITIONS: Record<RuneSpread, string[]> = {
  single: ["核心"],
  three: ["过去", "现在", "未来"],
  nine: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

const SPREAD_COLUMNS: Record<RuneSpread, number> = {
  single: 1,
  three: 3,
  nine: 3,
};

export function RunesPage() {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<RuneSpread>("three");
  const [result, setResult] = useState<RunesResult | null>(null);
  const { phase, isBusy, runDraw, resetPhase } = useCardDrawPhase();
  const positions = SPREAD_POSITIONS[spread];

  const copilotReport = useMemo(() => {
    if (!result || phase !== "revealed") return null;
    return buildRunesReportSnapshot(question, SPREADS[spread], result);
  }, [result, question, spread, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const visibleRunes = result
    ? result.runes
    : positions.map((position) => ({ position, placeholder: true as const }));

  const draw = () => {
    playMethodSound("runes", "action");
    setResult(null);
    runDraw({
      onShuffleComplete: () => {
        setResult(
          drawRunes({
            spread,
            question: question.trim() || undefined,
            seed: `${Date.now()}-${question}-${spread}`,
          }),
        );
      },
      onRevealed: () => playMethodSound("runes", "complete"),
    });
  };

  return (
    <Page wide className="runes-page">
      <MethodHero
        methodId="runes"
        kicker="RUNE CAST"
        title="卢恩符文占卜"
        description="抽取 Elder Futhark 符文，以石面刻痕显化能量。支持单符、三符与九符阵，含正逆位。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="输入你要问的事项…" />
        </label>
        <div className="chip-row">
          {(Object.keys(SPREADS) as RuneSpread[]).map((s) => (
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
          {phase === "shuffling" ? "取符中…" : phase === "drawing" ? "显符中…" : result ? "重新抽取" : "抽取符文"}
        </button>
      </section>

      <section className="runes-table-section">
      <CardDrawTable phase={phase} spreadCount={SPREAD_COLUMNS[spread]} className="runes-table">
        {visibleRunes.map((rune, index) =>
          !("placeholder" in rune) ? (
            <FlipCard
              key={`${rune.position}-${rune.id}`}
              position={rune.position}
              revealed={phase === "revealed"}
              reversed={rune.reversed}
              index={index}
              face={
                <div className="rune-stone">
                  <span className="rune-stone__glyph">{rune.glyph}</span>
                  <em>{rune.name}</em>
                </div>
              }
              meta={
                <>
                  <span>{rune.position}</span>
                  <strong>
                    {rune.nameZh} · {rune.name}
                  </strong>
                  <i>{rune.reversed ? "逆位" : "正位"}</i>
                  <p>{rune.keywords.join(" / ")}</p>
                </>
              }
            />
          ) : (
            <FlipCard
              key={`${rune.position}-${index}`}
              position={rune.position}
              revealed={false}
              index={index}
              placeholder
              placeholderHint="等待取符"
              meta={
                <>
                  <span>{rune.position}</span>
                  <strong>符袋</strong>
                  <i>等待抽取</i>
                </>
              }
            />
          )
        )}
      </CardDrawTable>
      </section>

      {result && phase === "revealed" && (
        <section className="runes-result">
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          <div className="reading-grid">
            {result.runes.map((rune) => (
              <article key={`${rune.id}-${rune.position}`}>
                <span>
                  {rune.position} · {rune.reversed ? "逆位" : "正位"}
                </span>
                <strong>
                  {rune.glyph} {rune.nameZh}
                </strong>
                <p>{rune.keywords.join(" · ")}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}
