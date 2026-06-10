import { useEffect, useMemo, useState } from "react";
import { castGeomancy, type GeomancyResult } from "@atlas/engines/geomancy";
import {
  createEmptyMothers,
  GeomancyMotherBuilder,
  isMothersComplete,
  mothersToBooleanMatrix,
  type MotherRowState,
} from "@/components/charts/GeomancyMotherBuilder";
import { GeomancyFigure } from "@/components/charts/GeomancyFigure";
import { MethodHistoryPanel } from "@/components/MethodHistoryPanel";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useMethodSessionHistory } from "@/hooks/useMethodSessionHistory";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildGeomancyReportSnapshot } from "@/lib/methodReportSnapshot";
import { buildMethodSeed } from "@/lib/methodSeed";
import { playMethodSound } from "@/lib/methodSounds";

type CastMode = "tap" | "random";

export function GeomancyPage() {
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<CastMode>("tap");
  const [mothers, setMothers] = useState<MotherRowState[][]>(createEmptyMothers);
  const [activeMother, setActiveMother] = useState(0);
  const [result, setResult] = useState<GeomancyResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { history, push } = useMethodSessionHistory<GeomancyResult>("geomancy");

  const tapReady = isMothersComplete(mothers);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  const resetTap = () => {
    setMothers(createEmptyMothers());
    setActiveMother(0);
    setResult(null);
  };

  const castFromTap = () => {
    playMethodSound("geomancy", "action");
    const next = castGeomancy({
      mothers: mothersToBooleanMatrix(mothers),
      question: question.trim() || undefined,
    });
    setResult(next);
    push(next);
    setConfirmOpen(false);
    playMethodSound("geomancy", "complete");
  };

  const castRandom = () => {
    playMethodSound("geomancy", "action");
    const seed = buildMethodSeed("geomancy", [question, history.length]);
    const next = castGeomancy({ seed, question: question.trim() || undefined });
    setResult(next);
    push(next);
    playMethodSound("geomancy", "complete");
  };

  const requestCast = () => {
    if (mode === "random") {
      castRandom();
      return;
    }
    if (!tapReady) return;
    setConfirmOpen(true);
  };

  const copilotReport = useMemo(
    () => (result ? buildGeomancyReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="geomancy-page">
      <MethodHero
        methodId="geomancy"
        kicker="GEOMANCY"
        title="土占 Geomancy"
        description="四母点阵衍生四女、见证人与审判图，判断计划成败与推进时机。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="要问的计划或选择…" />
        </label>

        <div className="chip-row" role="group" aria-label="起局模式">
          <button
            type="button"
            className={mode === "tap" ? "chip active" : "chip"}
            onClick={() => { setMode("tap"); setResult(null); }}
          >
            手点母图
          </button>
          <button
            type="button"
            className={mode === "random" ? "chip active" : "chip"}
            onClick={() => { setMode("random"); setResult(null); }}
          >
            一键随机
          </button>
        </div>

        {mode === "tap" && (
          <GeomancyMotherBuilder
            mothers={mothers}
            activeMother={activeMother}
            onMothersChange={setMothers}
            onActiveMotherChange={setActiveMother}
            onRowTap={() => playMethodSound("geomancy", "action")}
          />
        )}

        <div className="geomancy-actions">
          {mode === "tap" && (
            <button type="button" className="chip" onClick={resetTap}>
              重置四母
            </button>
          )}
          <button
            type="button"
            className="primary-btn"
            onClick={requestCast}
            disabled={mode === "tap" && !tapReady}
          >
            {result ? "重新起局" : "起局"}
          </button>
        </div>
      </section>

      {confirmOpen && (
        <div
          className="geomancy-confirm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="geomancy-confirm-title"
          onClick={() => setConfirmOpen(false)}
        >
          <div className="geomancy-confirm__panel" onClick={(e) => e.stopPropagation()}>
            <h3 id="geomancy-confirm-title">确认四母已固定</h3>
            <p>四母点阵生成后不可改点。确认按当前四母衍生法庭图与十二宫？</p>
            <div className="geomancy-confirm__actions">
              <button type="button" className="chip" onClick={() => setConfirmOpen(false)}>
                返回修改
              </button>
              <button type="button" className="primary-btn" onClick={castFromTap}>
                确认起局
              </button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <section className="geomancy-result">
          <MethodResultActions />
          <div className="geomancy-result__court">
            <h3>四母图</h3>
            <div className="geomancy-result__mothers">
              {result.mothers.map((mother, index) => (
                <GeomancyFigure key={mother.key} name={`母${index + 1} · ${mother.name}`} lines={mother.lines} />
              ))}
            </div>
            <h3>四女图</h3>
            <div className="geomancy-result__mothers">
              {result.daughters.map((daughter, index) => (
                <GeomancyFigure key={daughter.key} name={`女${index + 1} · ${daughter.name}`} lines={daughter.lines} />
              ))}
            </div>
            <div className="geomancy-result__witnesses">
              <GeomancyFigure name={`左见证 · ${result.witnesses[0]!.name}`} lines={result.witnesses[0]!.lines} />
              <GeomancyFigure
                name={`审判 · ${result.judge.name}`}
                lines={result.judge.lines}
                caption={result.judge.meaning}
              />
              <GeomancyFigure name={`右见证 · ${result.witnesses[1]!.name}`} lines={result.witnesses[1]!.lines} />
            </div>
          </div>
          <div className="reading-grid">
            {result.houses.map((h) => (
              <article key={h.house}>
                <span>第{h.house}宫</span>
                <strong>{h.figure.name}</strong>
                <p>{h.figure.meaning}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <MethodHistoryPanel
        items={history}
        renderItem={(item) => ({
          key: item.seed,
          label: `审判 ${item.judge.name}`,
          detail: item.summary,
        })}
      />

      <MethodLibraryFooter methodId="geomancy" />
    </Page>
  );
}
