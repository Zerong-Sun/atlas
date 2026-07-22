import { useMemo, useState } from "react";
import { rollAstrodice, type AstrodiceResult } from "@atlas/engines/astrodice";
import { AstroIcon } from "@/components/charts/AstroIcon";
import { AstrologyDice, type AstrodicePhase } from "@/components/charts/AstrologyDice";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildAstrodiceReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { useTimedCallback } from "@/hooks/useTimedCallback";

export function AstrodicePage() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<AstrodicePhase>("idle");
  const [result, setResult] = useState<AstrodiceResult | null>(null);
  const [history, setHistory] = useState<AstrodiceResult[]>([]);
  const { schedule } = useTimedCallback();

  const copilotReport = useMemo(() => {
    if (!result || phase !== "settled") return null;
    return buildAstrodiceReportSnapshot(question, result);
  }, [result, question, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const roll = () => {
    if (phase === "rolling") return;
    playMethodSound("astrodice", "action");
    setPhase("rolling");
    setResult(null);

    schedule(() => {
      const next = rollAstrodice({
        seed: `${Date.now()}-${question}-${history.length}`,
        question: question.trim() || undefined,
      });
      setResult(next);
      setHistory((prev) => [next, ...prev].slice(0, 6));
      setPhase("settled");
      playMethodSound("astrodice", "complete");
    }, 1200);
  };

  return (
    <Page wide className="astrodice-page">
      <MethodHero
        methodId="astrodice"
        kicker="ASTRO DICE"
        title="占星骰子"
        description="投掷行星、星座、宫位三枚骰子，组合成一句象征语法与行动提示。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="输入你要问的事项…" />
        </label>
        <button type="button" className="primary-btn" onClick={roll} disabled={phase === "rolling"}>
          {phase === "rolling" ? "掷骰中…" : phase === "settled" ? "再掷一轮" : "投掷三骰"}
        </button>
      </section>

      <AstrologyDice phase={phase} planet={result?.planet} sign={result?.sign} house={result?.house} />

      {result && phase === "settled" && (
        <section className="astrodice-result">
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          <article className="astrodice-syntax">
            <span>象征语法</span>
            <p>{result.syntaxLine}</p>
          </article>
          <div className="reading-grid">
            <article>
              <span className="astrodice-result-card__label">
                行星 <AstroIcon kind="planet" id={result.planet.id} size="inline" />
              </span>
              <strong>{result.planet.name}</strong>
              <p>{result.planet.meaning}</p>
            </article>
            <article>
              <span className="astrodice-result-card__label">
                星座 <AstroIcon kind="sign" id={result.sign.id} size="inline" />
              </span>
              <strong>{result.sign.name}</strong>
              <p>{result.sign.meaning}</p>
            </article>
            <article>
              <span className="astrodice-result-card__label">
                宫位 <AstroIcon kind="house" id={result.house.id} size="inline" />
              </span>
              <strong>{result.house.name}</strong>
              <p>{result.house.meaning}</p>
            </article>
          </div>
        </section>
      )}

      {history.length > 1 && (
        <section className="astrodice-history">
          <h2>追问记录</h2>
          <ul>
            {history.slice(1).map((item) => (
              <li key={item.seed}>
                <strong>
                  {item.planet.name} · {item.sign.name} · {item.house.name}
                </strong>
                <p>{item.syntaxLine}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  );
}
