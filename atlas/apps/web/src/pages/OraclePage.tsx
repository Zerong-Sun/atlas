import { useMemo, useState } from "react";
import { drawOracle, type OracleResult } from "@atlas/engines/oracle";
import type { OracleSpread } from "@atlas/shared-types";
import { FlipCard } from "@/components/charts/FlipCard";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildOracleReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { useTimedCallback } from "@/hooks/useTimedCallback";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";
import { buildMethodSeed } from "@/lib/methodSeed";

type Phase = "idle" | "drawing" | "revealed";

export function OraclePage() {
  const [question, setQuestion] = useState("");
  const [theme, setTheme] = useState("");
  const [spread, setSpread] = useState<OracleSpread>("single");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<OracleResult | null>(null);
  const { schedule } = useTimedCallback();
  const { history, push } = useMethodSessionHistory<OracleResult>("oracle");

  const draw = () => {
    if (phase === "drawing") return;
    playMethodSound("oracle", "action");
    setPhase("drawing");
    setResult(null);
    schedule(() => {
      const seed = buildMethodSeed("oracle", [question, theme, spread, history.length]);
      const next = drawOracle({
        seed,
        question: question.trim() || undefined,
        theme: theme.trim() || undefined,
        spread,
      });
      setResult(next);
      push(next);
      setPhase("revealed");
      playMethodSound("oracle", "complete");
    }, 900);
  };

  const copilotReport = useMemo(
    () => (result && phase === "revealed" ? buildOracleReportSnapshot(question, result) : null),
    [result, question, phase],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="oracle-page">
      <MethodHero
        methodId="oracle"
        kicker="ORACLE CARDS"
        title="神谕卡"
        description="主题抽卡与反思提示，偏向情绪照护与肯定语练习。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="今天需要怎样的提醒？" />
        </label>
        <label>
          <span>主题（可选）</span>
          <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="边界、信任、休息…" />
        </label>
        <div className="chip-row">
          {(["single", "three"] as OracleSpread[]).map((s) => (
            <button key={s} type="button" className={spread === s ? "chip active" : "chip"} onClick={() => setSpread(s)}>
              {s === "single" ? "单卡" : "三卡"}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={draw} disabled={phase === "drawing"}>
          {phase === "drawing" ? "抽卡中…" : phase === "revealed" ? "再抽一轮" : "抽取神谕卡"}
        </button>
      </section>

      {result && phase === "revealed" && (
        <section className="oracle-result">
          <MethodResultActions />
          <div className="card-draw-grid">
            {result.cards.map((card, index) => (
              <FlipCard
                key={card.position}
                position={card.position}
                revealed
                index={index}
                face={<strong className="oracle-card-face">{card.name}</strong>}
                meta={<p>{card.meaning}</p>}
              />
            ))}
          </div>
          {result.cards.map((card) => (
            <article key={`${card.id}-affirm`} className="oracle-affirmation">
              <strong>{card.name}</strong>
              <p>{card.affirmation}</p>
            </article>
          ))}
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: item.seed,
          label: item.cards.map((c) => c.name).join(" · "),
          detail: item.summary,
        })}
      />

      <MethodLibraryFooter methodId="oracle" />
    </Page>
  );
}
