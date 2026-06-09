import { useMemo, useState } from "react";
import { castMeihua, type MeihuaResult } from "@atlas/engines/meihua";
import type { MeihuaMode } from "@atlas/shared-types";
import { HexagramLines, type HexLine } from "@/components/charts/HexagramLines";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildMeihuaReportSnapshot } from "@/lib/methodReportSnapshot";
import { buildMethodSeed } from "@/lib/methodSeed";
import { playMethodSound } from "@/lib/methodSounds";

function buildHexLines(result: MeihuaResult): HexLine[] {
  const lower = result.lower.lines.map((isYang, index) => ({
    position: index + 1,
    isYang,
    label: index === 0 ? `下${result.lower.name}` : undefined,
  }));
  const upper = result.upper.lines.map((isYang, index) => ({
    position: index + 4,
    isYang,
    label: index === 2 ? `上${result.upper.name}` : undefined,
  }));
  return [...lower, ...upper];
}

export function MeihuaPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<MeihuaMode>("number");
  const [numA, setNumA] = useState("3");
  const [numB, setNumB] = useState("7");
  const [result, setResult] = useState<MeihuaResult | null>(null);
  const { history, push } = useMethodSessionHistory<MeihuaResult>("meihua");

  const cast = () => {
    playMethodSound("meihua", "action");
    const numbers = [Number(numA) || 1, Number(numB) || 1];
    const timestamp = mode === "time" ? new Date().toISOString() : undefined;
    const seed = buildMethodSeed("meihua", [mode, question, ...numbers, timestamp]);
    const next = castMeihua({
      seed,
      question: question.trim() || undefined,
      mode,
      numbers: mode === "number" ? numbers : undefined,
      timestamp,
    });
    setResult(next);
    push(next);
    playMethodSound("meihua", "complete");
  };

  const copilotReport = useMemo(
    () => (result ? buildMeihuaReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const hexLines = useMemo(() => (result ? buildHexLines(result) : []), [result]);

  return (
    <Page wide className="meihua-page">
      <MethodHero
        methodId="meihua"
        kicker="PLUM BLOSSOM"
        title="梅花易数"
        description="时间或数字取卦，体用生克、互卦变卦与外应校准。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="要问的事项…" />
        </label>
        <div className="chip-row">
          {(["number", "time"] as MeihuaMode[]).map((m) => (
            <button key={m} type="button" className={mode === m ? "chip active" : "chip"} onClick={() => setMode(m)}>
              {m === "number" ? "数字取卦" : "时间取卦"}
            </button>
          ))}
        </div>
        {mode === "number" && (
          <div className="method-workbench__row">
            <label>
              <span>上卦数</span>
              <input type="number" value={numA} onChange={(e) => setNumA(e.target.value)} min={1} />
            </label>
            <label>
              <span>下卦数</span>
              <input type="number" value={numB} onChange={(e) => setNumB(e.target.value)} min={1} />
            </label>
          </div>
        )}
        <button type="button" className="primary-btn" onClick={cast}>
          {result ? "重新起卦" : "取数成卦"}
        </button>
      </section>

      {result && (
        <section className="meihua-result">
          <MethodResultActions />
          <div className="meihua-result__layout">
            <HexagramLines lines={hexLines} title={`${result.upper.name}${result.lower.name} 卦`} />
            <div className="reading-grid">
              <article><span>体卦</span><strong>{result.body.name}</strong><p>{result.body.meaning}</p></article>
              <article><span>用卦</span><strong>{result.use.name}</strong><p>{result.use.meaning}</p></article>
              <article><span>体用</span><strong>生克</strong><p>{result.relation}</p></article>
              <article><span>互卦</span><strong>{result.mutualUpper.name}{result.mutualLower.name}</strong><p>过程中段</p></article>
              <article><span>变卦</span><strong>{result.changing.name}</strong><p>{result.changing.meaning}</p></article>
            </div>
          </div>
          <p className="meihua-summary">{result.summary}</p>
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: item.seed,
          label: `${item.upper.name}${item.lower.name} · 体${item.body.name}用${item.use.name}`,
          detail: item.relation,
        })}
      />

      <MethodLibraryFooter methodId="meihua" />
    </Page>
  );
}
