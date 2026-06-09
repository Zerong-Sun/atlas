import { useMemo, useState } from "react";
import { castGeomancy, type GeomancyResult } from "@atlas/engines/geomancy";
import { GeomancyFigure } from "@/components/charts/GeomancyFigure";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildGeomancyReportSnapshot } from "@/lib/methodReportSnapshot";
import { buildMethodSeed } from "@/lib/methodSeed";
import { playMethodSound } from "@/lib/methodSounds";

export function GeomancyPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<GeomancyResult | null>(null);
  const { history, push } = useMethodSessionHistory<GeomancyResult>("geomancy");

  const cast = () => {
    playMethodSound("geomancy", "action");
    const seed = buildMethodSeed("geomancy", [question, history.length]);
    const next = castGeomancy({ seed, question: question.trim() || undefined });
    setResult(next);
    push(next);
    playMethodSound("geomancy", "complete");
  };

  const copilotReport = useMemo(
    () => (result ? buildGeomancyReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="geomancy-page">
      <MethodHero
        methodId="geomancy"
        kicker="GEOMANCY"
        title="土占 Geomancy"
        description="四母图生成四女、见证人与审判图，判断计划成败与推进时机。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="要问的计划或选择…" />
        </label>
        <button type="button" className="primary-btn" onClick={cast}>
          {result ? "重新起局" : "生成土占图"}
        </button>
      </section>

      {result && (
        <section className="geomancy-result">
          <MethodResultActions />
          <div className="geomancy-result__court">
            <h3>四母图</h3>
            <div className="geomancy-result__mothers">
              {result.mothers.map((mother, index) => (
                <GeomancyFigure key={mother.key} name={`母${index + 1} · ${mother.name}`} lines={mother.lines} />
              ))}
            </div>
            <div className="geomancy-result__witnesses">
              <GeomancyFigure name={`左见证 · ${result.witnesses[0]!.name}`} lines={result.witnesses[0]!.lines} />
              <GeomancyFigure
                name={`审判 · ${result.judge.name}`}
                lines={result.judge.lines}
                caption={result.judge.meaning}
              />
              <GeomancyFigure name={`右见证 · ${result.witnesses[1]!.name}`} lines={result.witnesses[1]!.lines} />
            </div>
          </div>
          <div className="reading-grid">
            {result.houses.map((h) => (
              <article key={h.house}>
                <span>第{h.house}宫</span>
                <strong>{h.figure.name}</strong>
                <p>{h.figure.meaning}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: item.seed,
          label: `审判 ${item.judge.name}`,
          detail: item.summary,
        })}
      />

      <MethodLibraryFooter methodId="geomancy" />
    </Page>
  );
}
