import { useEffect, useState } from "react";
import { DreamCapture } from "@/components/DreamCapture";
import { Page } from "@/components/ui/Page";
import { createDreamEntry, fetchDreamTrend, type DreamInterpretation } from "@/lib/api/dreams";

import { DREAM_SCHOOLS } from "@/data/dreamSchoolsLibrary";

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
    <Page wide className="dream-page">
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <section className="method-detail-hero">
        <p className="method-kicker">DREAM ORACLE</p>
        <h1>占梦</h1>
        <p>梦境解释需要多视角并列：古法可以保留神秘性，LLM 输出则需要明确边界，避免恐吓、绝对化和医学化判断。</p>
      </section>

      <section className="dream-layout">
        <div className="dream-main">
          <DreamCapture onSubmit={handleSubmit} loading={loading} result={result} />
        </div>
        <aside className="dream-protocol">
          <div className="section-heading">
            <p>PROMPT LIMITS</p>
            <h2>解梦模型约束</h2>
          </div>
          <ul>
            <li>先复述梦中关键符号，不添加用户未说的信息。</li>
            <li>同一符号至少给出两种解释，并标注不确定性。</li>
            <li>输出行动建议，避免断言灾祸、疾病、投资或关系结局。</li>
            <li>保留古籍口吻，但最终落到可执行的自我反思。</li>
          </ul>
        </aside>
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
