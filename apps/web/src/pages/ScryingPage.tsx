import { useMemo, useState } from "react";
import { castScryingVision, CRYSTAL_TYPES, type ScryingResult } from "@atlas/engines/scrying";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildScryingReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { useTimedCallback } from "@/hooks/useTimedCallback";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";
import { buildMethodSeed } from "@/lib/methodSeed";

type Phase = "idle" | "gazing" | "revealed";

export function ScryingPage() {
  const [question, setQuestion] = useState("");
  const [crystalId, setCrystalId] = useState<string>(CRYSTAL_TYPES[0]!.id);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ScryingResult | null>(null);
  const { schedule } = useTimedCallback();
  const { history, push } = useMethodSessionHistory<ScryingResult>("scrying");

  const gaze = () => {
    if (phase === "gazing") return;
    playMethodSound("scrying", "action");
    setPhase("gazing");
    setResult(null);
    schedule(() => {
      const seed = buildMethodSeed("scrying", [question, crystalId, history.length]);
      const next = castScryingVision({
        seed,
        question: question.trim() || undefined,
        crystalId,
      });
      setResult(next);
      push(next);
      setPhase("revealed");
      playMethodSound("scrying", "complete");
    }, 1500);
  };

  const copilotReport = useMemo(
    () => (result && phase === "revealed" ? buildScryingReportSnapshot(question, result) : null),
    [result, question, phase],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="scrying-page">
      <MethodHero
        methodId="scrying"
        kicker="CRYSTAL SCRYING"
        title="水晶凝视"
        description="选择水晶类型，记录凝视中出现的颜色、形状与重复意象。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="你想凝视什么主题？" />
        </label>
        <div className="chip-row">
          {CRYSTAL_TYPES.map((c) => (
            <button key={c.id} type="button" className={crystalId === c.id ? "chip active" : "chip"} onClick={() => setCrystalId(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={gaze} disabled={phase === "gazing"}>
          {phase === "gazing" ? "凝视中…" : phase === "revealed" ? "再次凝视" : "开始凝视"}
        </button>
      </section>

      {result && phase === "revealed" && (
        <section className="scrying-result">
          <MethodResultActions />
          <div className="reading-grid">
            <article><span>水晶</span><strong>{result.crystal.name}</strong><p>{result.crystal.meaning}</p></article>
            <article><span>颜色</span><strong>{result.color.name}</strong><p>{result.color.meaning}</p></article>
            <article><span>形状</span><strong>{result.shape.name}</strong><p>{result.shape.meaning}</p></article>
            <article><span>意象</span><strong>{result.image.name}</strong><p>{result.image.meaning}</p></article>
          </div>
          <p className="scrying-meditation">{result.meditation}</p>
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: item.seed,
          label: `${item.crystal.name} · ${item.color.name} · ${item.shape.name}`,
          detail: item.summary,
        })}
      />

      <MethodLibraryFooter methodId="scrying" />
    </Page>
  );
}
