import { useEffect, useMemo, useState } from "react";
import { DreamCapture } from "@/components/DreamCapture";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { createDreamEntry, fetchDreamTrend, type DreamInterpretation } from "@/lib/api/dreams";
import { buildDreamReportSnapshot } from "@/lib/methodReportSnapshot";

import { DREAM_SCHOOLS } from "@/data/dreamSchoolsLibrary";

export function DreamPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamInterpretation | null>(null);
  const [lastDreamText, setLastDreamText] = useState("");
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof fetchDreamTrend>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDreamTrend()
      .then(setTrend)
      .catch(() => setError("梦境趋势加载失败。"));
  }, []);

  const copilotReport = useMemo(
    () => (result ? buildDreamReportSnapshot(lastDreamText, result) : null),
    [result, lastDreamText],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const handleSubmit = async (text: string, emotions: string[], symbols: string[]) => {
    setLoading(true);
    setError(null);
    setLastDreamText(text);
    try {
      const interp = await createDreamEntry({ text, emotions, symbols });
      setResult(interp);
      setTrend(await fetchDreamTrend());
    } catch {
      setError("梦境解读失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page wide className="dream-page">
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <MethodHero
        methodId="dream"
        kicker="DREAM ORACLE"
        title="占梦"
        description="梦境解释需要多视角并列：古法可以保留神秘性，解读则明确边界，避免恐吓、绝对化和医学化判断。"
      />

      <section className="dream-layout">
        {result && (
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
        )}
        <DreamCapture onSubmit={handleSubmit} loading={loading} result={result} />
      </section>

      <section className="dream-schools" aria-label="占梦流派">
        {DREAM_SCHOOLS.map((school) => (
          <article key={school.id}>
            <span>{school.title}</span>
            <p>{school.summary}</p>
          </article>
        ))}
      </section>

      {trend && (
        <section className="trend" style={{ marginTop: "var(--spacing-xxl)" }}>
          <h3 style={{ margin: "0 0 var(--spacing-md)" }}>七日趋势</h3>
          <p className="muted">{trend.summary}</p>
          <div
            className="symbol-bars"
            aria-label="七日梦境符号频次"
            style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", marginTop: "var(--spacing-md)" }}
          >
            {trend.topSymbols.map((s) => (
              <div key={s.symbol} className="symbol-row">
                <span>{s.symbol}</span>
                <i style={{ width: `${symbolWidth(s.count, trend.topSymbols)}%` }} />
                <strong>{s.count}</strong>
              </div>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}

function symbolWidth(count: number, symbols: Array<{ count: number }>): number {
  const max = Math.max(...symbols.map((s) => s.count), 1);
  return Math.max(12, Math.round((count / max) * 100));
}
