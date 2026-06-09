import { useMemo, useState } from "react";
import { computeVedic, type VedicResult } from "@atlas/engines/vedic";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildVedicReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";

export function VedicPage() {
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("12:00");
  const [result, setResult] = useState<VedicResult | null>(null);

  const compute = () => {
    playMethodSound("vedic", "action");
    setResult(computeVedic({ birthDate, birthTime }));
    playMethodSound("vedic", "complete");
  };

  const copilotReport = useMemo(() => (result ? buildVedicReportSnapshot(result) : null), [result]);
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="vedic-page">
      <MethodHero
        methodId="vedic"
        kicker="VEDIC ASTROLOGY"
        title="印度占星"
        description="吠陀星盘核心：月亮星座、月宿 Nakshatra、上升与简化大运周期。"
      />

      <aside className="method-preview-banner" role="note">
        MVP 范围：月亮星宿、上升与简化大运，非完整吠陀宫位详盘。
      </aside>

      <section className="method-workbench">
        <label>
          <span>出生日期</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <label>
          <span>出生时间</span>
          <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
        </label>
        <button type="button" className="primary-btn" onClick={compute}>
          {result ? "重新排盘" : "生成吠陀星盘"}
        </button>
      </section>

      {result && (
        <section className="vedic-result">
          <MethodResultActions />
          <div className="reading-grid">
            <article><span>月亮星座</span><strong>{result.moonSign}</strong></article>
            <article><span>月宿</span><strong>{result.moonNakshatra.label}</strong><p>第 {result.moonNakshatra.pada} 足</p></article>
            <article><span>上升</span><strong>{result.ascendantSign}</strong></article>
            <article><span>大运主星</span><strong>{result.mahadashaLabel}</strong></article>
          </div>
          <p className="muted">{result.note}</p>
        </section>
      )}

      <MethodLibraryFooter methodId="vedic" />
    </Page>
  );
}
