import { useEffect, useMemo, useState } from "react";
import { DreamCapture } from "@/components/DreamCapture";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { createDreamEntry, fetchDreamTrend, type DreamInterpretation } from "@/lib/api/dreams";
import { buildDreamReportSnapshot } from "@/lib/methodReportSnapshot";

import { DREAM_SCHOOLS } from "@/data/dreamSchoolsLibrary";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";

const DREAM_PROTOCOL = [
  "一事一梦：每次只解读一个完整梦境，避免混杂多个片段。",
  "标注情绪与符号：醒来时的感受与关键物象会显著影响解读方向。",
  "多视角并列：古法、象征与反思并存，不作唯一结论。",
  "明确边界：不断言灾祸日期，不替代医学或法律判断。",
  "倾向建议：输出可执行的反思问题，而非恐吓式预言。",
];

export function DreamPage() {
  const dreamStyle = methodExperienceStyle(getMethodExperience("dream"));
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
      <div style={dreamStyle}>
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
        <div className="dream-main">
          <DreamCapture
            onSubmit={handleSubmit}
            loading={loading}
            result={result}
            resultActions={result ? <MethodCopilotTrigger variant="analyze" /> : undefined}
          />
        </div>

        <aside className="dream-protocol" aria-label="解梦协议">
          <h3>解梦协议</h3>
          <p>占梦是高频自省入口，以下原则贯穿每次解读。</p>
          <ul>
            {DREAM_PROTOCOL.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      {trend && trend.topSymbols.length > 0 && (
        <section className="dream-trend" aria-label="七日梦境趋势">
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

      <section className="dream-section-head" aria-labelledby="dream-schools-title">
        <h2 id="dream-schools-title">解读流派</h2>
        <p>四种视角并列输出，展示同一梦境的不同读法与边界。</p>
      </section>

      <section className="dream-schools" aria-label="占梦流派">
        {DREAM_SCHOOLS.map((school) => (
          <article key={school.id}>
            <span>{school.id.toUpperCase()}</span>
            <h4>{school.title}</h4>
            <p>{school.summary}</p>
            <ul>
              {school.taboos.slice(0, 2).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      </div>
    </Page>
  );
}

function symbolWidth(count: number, symbols: Array<{ count: number }>): number {
  const max = Math.max(...symbols.map((s) => s.count), 1);
  return Math.max(12, Math.round((count / max) * 100));
}
