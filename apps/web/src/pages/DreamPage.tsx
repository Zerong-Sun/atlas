import { useMemo, useState } from "react";
import { DreamCapture } from "@/components/DreamCapture";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { createDreamEntry, type DreamInterpretation } from "@/lib/api/dreams";
import { buildDreamReportSnapshot } from "@/lib/methodReportSnapshot";

import { DREAM_SCHOOLS } from "@/data/dreamSchoolsLibrary";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";

export function DreamPage() {
  const dreamStyle = methodExperienceStyle(getMethodExperience("dream"));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamInterpretation | null>(null);
  const [lastDreamText, setLastDreamText] = useState("");
  const [error, setError] = useState<string | null>(null);

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

      <section className="dream-main">
        <DreamCapture
          onSubmit={handleSubmit}
          loading={loading}
          result={result}
          resultActions={result ? <MethodCopilotTrigger variant="analyze" /> : undefined}
        />
      </section>

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
