import { useMemo, useState } from "react";
import { computeNumerology, type NumerologyResult } from "@atlas/engines/numerology";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildNumerologyReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";

export function NumerologyPage() {
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [name, setName] = useState("");
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const { history, push } = useMethodSessionHistory<NumerologyResult>("numerology");

  const compute = () => {
    playMethodSound("numerology", "action");
    const next = computeNumerology({ birthDate, name: name.trim() || "Seeker" });
    setResult(next);
    push(next);
    playMethodSound("numerology", "complete");
  };

  const copilotReport = useMemo(() => (result ? buildNumerologyReportSnapshot(result) : null), [result]);
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="numerology-page">
      <MethodHero
        methodId="numerology"
        kicker="NUMEROLOGY"
        title="数字命理"
        description="生命路径数、命运数与个人年周期，从生日与姓名推导核心数字主题。"
      />

      <section className="method-workbench">
        <label>
          <span>出生日期</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <label>
          <span>姓名（拼音或英文）</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="用于计算命运数" />
        </label>
        <button type="button" className="primary-btn" onClick={compute}>
          {result ? "重新计算" : "计算数字命盘"}
        </button>
      </section>

      {result && (
        <section className="numerology-result">
          <MethodResultActions />
          <p className="numerology-summary">{result.summary}</p>
          <div className="numerology-numbers" aria-label="核心数字">
            <div className="numerology-numbers__orb"><span>生命路径</span><strong>{result.lifePath}</strong></div>
            <div className="numerology-numbers__orb"><span>命运数</span><strong>{result.destiny}</strong></div>
            <div className="numerology-numbers__orb"><span>个人年</span><strong>{result.personalYear}</strong></div>
          </div>
          <div className="reading-grid">
            <article>
              <span>生命路径</span>
              <strong>{result.lifePath}</strong>
              <p>{result.lifePathMeaning}</p>
            </article>
            <article>
              <span>命运数</span>
              <strong>{result.destiny}</strong>
              <p>{result.destinyMeaning}</p>
            </article>
            <article>
              <span>个人年</span>
              <strong>{result.personalYear}</strong>
              <p>{result.personalYearMeaning}</p>
            </article>
          </div>
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: `${item.birthDate}-${item.name}`,
          label: `${item.name} · 路径${item.lifePath} · 年${item.personalYear}`,
          detail: item.summary,
        })}
      />

      <MethodLibraryFooter methodId="numerology" />
    </Page>
  );
}
