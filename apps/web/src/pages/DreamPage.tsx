import { useEffect, useState } from "react";
import { DreamCapture } from "@/components/DreamCapture";
import { Page } from "@/components/ui/Page";
import { createDreamEntry, fetchDreamTrend, type DreamInterpretation } from "@/lib/api/dreams";
import { colors, radius, spacing } from "@/theme/tokens";

export function DreamPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamInterpretation | null>(null);
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof fetchDreamTrend>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDreamTrend().catch(() => setError("梦境趋势加载失败。"));
  }, []);

  const handleSubmit = async (text: string, emotions: string[], symbols: string[]) => {
    setLoading(true);
    setError(null);
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
    <Page>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <DreamCapture onSubmit={handleSubmit} loading={loading} result={result} />
      {trend && (
        <section className="trend">
          <h3>七日趋势</h3>
          <p className="muted">{trend.summary}</p>
          <div className="symbol-bars" aria-label="七日梦境符号频次">
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
      <style>{`
        .trend { margin-top: ${spacing.xxl}px; }
        .trend h3 { font-size: 20px; margin: 0 0 ${spacing.md}px; }
        .trend .muted { color: ${colors.textSecondary}; line-height: 1.5; }
        .symbol-bars { display: flex; flex-direction: column; gap: ${spacing.sm}px; margin-top: ${spacing.md}px; }
        .symbol-row {
          display: grid;
          grid-template-columns: 56px 1fr 32px;
          gap: ${spacing.sm}px;
          align-items: center;
          padding: ${spacing.sm}px;
          background: ${colors.surface};
          border-radius: ${radius.md}px;
        }
        .symbol-row span { color: ${colors.gold}; font-weight: 600; }
        .symbol-row i {
          display: block;
          height: 8px;
          border-radius: ${radius.full}px;
          background: ${colors.goldDim};
        }
        .symbol-row strong { color: ${colors.textSecondary}; text-align: right; }
      `}</style>
    </Page>
  );
}

function symbolWidth(count: number, symbols: Array<{ count: number }>): number {
  const max = Math.max(...symbols.map((s) => s.count), 1);
  return Math.max(12, Math.round((count / max) * 100));
}
