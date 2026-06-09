import { useMemo, useState } from "react";
import { readCoffeeGrounds, type CoffeeResult } from "@atlas/engines/coffee";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildCoffeeReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";
import { buildMethodSeed } from "@/lib/methodSeed";

export function CoffeePage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<CoffeeResult | null>(null);
  const { history, push } = useMethodSessionHistory<CoffeeResult>("coffee");

  const read = () => {
    playMethodSound("coffee", "action");
    const seed = buildMethodSeed("coffee", [question, history.length]);
    const next = readCoffeeGrounds({ seed, question: question.trim() || undefined });
    setResult(next);
    push(next);
    playMethodSound("coffee", "complete");
  };

  const copilotReport = useMemo(
    () => (result ? buildCoffeeReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="coffee-page">
      <MethodHero
        methodId="coffee"
        kicker="COFFEE READING"
        title="咖啡渣占卜"
        description="杯底、杯壁、杯沿三区象征组合，解读近期趋势与行动提醒。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="你想从杯底看见什么？" />
        </label>
        <button type="button" className="primary-btn" onClick={read}>
          {result ? "重新解读" : "生成杯底图形"}
        </button>
      </section>

      {result && (
        <section className="coffee-result">
          <MethodResultActions />
          <div className="coffee-cup" aria-hidden>
            {result.zones.map((zone) => (
              <div key={zone.zone} className={`coffee-cup__zone coffee-cup__zone--${zone.zone}`}>
                <span>{zone.zoneLabel}</span>
                <strong>{zone.symbol.name}</strong>
              </div>
            ))}
          </div>
          <div className="reading-grid">
            {result.zones.map((zone) => (
              <article key={zone.zone}>
                <span>{zone.zoneLabel}</span>
                <strong>{zone.symbol.name}</strong>
                <p>{zone.reading}</p>
              </article>
            ))}
          </div>
          <p className="coffee-narrative">{result.narrative}</p>
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: item.seed,
          label: item.zones.map((z) => `${z.zoneLabel}${z.symbol.name}`).join(" · "),
          detail: item.summary,
        })}
      />

      <MethodLibraryFooter methodId="coffee" />
    </Page>
  );
}
