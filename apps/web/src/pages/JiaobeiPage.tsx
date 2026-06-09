import { useMemo, useRef, useState } from "react";
import { throwJiaobei, getJiaobeiOutcomeLabel, type JiaobeiThrow } from "@atlas/engines/jiaobei";
import { JiaobeiCups, type JiaobeiPhase } from "@/components/charts/JiaobeiCups";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildJiaobeiReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { useTimedCallback } from "@/hooks/useTimedCallback";

const MAX_THROWS = 3;

export function JiaobeiPage() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<JiaobeiPhase>("idle");
  const [throws, setThrows] = useState<JiaobeiThrow[]>([]);
  const [current, setCurrent] = useState<JiaobeiThrow | null>(null);
  const [revisionMode, setRevisionMode] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const { schedule, clearTimers } = useTimedCallback();

  const lastOutcome = throws[throws.length - 1]?.outcome;
  const canThrow = throws.length < MAX_THROWS && phase !== "tossing" && !revisionMode;
  const holyCount = throws.filter((t) => t.outcome === "holy").length;
  const threeHoly = holyCount === 3;
  const lastLaugh = lastOutcome === "laugh";
  const lastYin = lastOutcome === "yin";

  const copilotReport = useMemo(() => {
    if (!throws.length || phase !== "landed") return null;
    return buildJiaobeiReportSnapshot(question, throws);
  }, [throws, question, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const toss = () => {
    if (!canThrow) return;
    playMethodSound("jiaobei", "action");
    setPhase("tossing");
    setCurrent(null);

    schedule(() => {
      const next = throwJiaobei({
        seed: `${Date.now()}-${question}-${throws.length + 1}`,
        question: question.trim() || undefined,
        throwIndex: throws.length + 1,
      });
      setCurrent(next);
      setThrows((prev) => [...prev, next]);
      setPhase("landed");
      if (next.outcome === "laugh") {
        setRevisionMode(true);
        window.requestAnimationFrame(() => questionRef.current?.focus());
      }
      playMethodSound("jiaobei", "complete");
    }, 900);
  };

  const reset = () => {
    clearTimers();
    setThrows([]);
    setCurrent(null);
    setRevisionMode(false);
    setPhase("idle");
  };

  const retryAfterLaugh = () => {
    if (!question.trim()) {
      questionRef.current?.focus();
      return;
    }
    clearTimers();
    setThrows([]);
    setCurrent(null);
    setRevisionMode(false);
    setPhase("idle");
  };

  return (
    <Page wide className="jiaobei-page">
      <MethodHero
        methodId="jiaobei"
        kicker="JIAOBEI"
        title="掷筊问卦"
        description="双筊抛掷，圣杯允准、笑杯重问、阴杯暂停。一事一问，同一问题最多三掷。"
      />

      <section className="method-workbench">
        <label className={revisionMode ? "jiaobei-question jiaobei-question--revise" : "jiaobei-question"}>
          <span>问句（宜是非明确）</span>
          <textarea
            ref={questionRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="例如：此事当前是否宜推进？"
            aria-invalid={revisionMode && !question.trim()}
          />
        </label>

        {revisionMode && (
          <aside className="jiaobei-revision-panel" role="status">
            <strong>笑杯：问句需要校准</strong>
            <p>神明示意问题尚未问准。请把问句改得更清楚、更具体（宜是非判断），然后重新掷筊。</p>
            <ul className="jiaobei-revision-tips">
              <li>避免一次问多件不相干的事</li>
              <li>用「是否」「能否」等可回答的是非句</li>
              <li>写明时间范围或具体情境</li>
            </ul>
            <button type="button" className="primary-btn" onClick={retryAfterLaugh} disabled={!question.trim()}>
              问句已修正，重新掷筊
            </button>
          </aside>
        )}

        <div className="jiaobei-actions">
          {!revisionMode && (
            <button type="button" className="primary-btn" onClick={toss} disabled={!canThrow || lastYin}>
              {phase === "tossing" ? "掷筊中…" : `掷筊（${throws.length}/${MAX_THROWS}）`}
            </button>
          )}
          {throws.length > 0 && (
            <button type="button" className="chip" onClick={reset}>
              重新问事
            </button>
          )}
        </div>
      </section>

      <JiaobeiCups phase={phase} cups={current?.cups} outcome={current?.outcome} />

      {throws.length > 0 && phase === "landed" && (
        <section className="jiaobei-history">
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          <h2>掷筊记录</h2>
          <ul>
            {throws.map((t) => (
              <li key={t.throwIndex}>
                <span>第 {t.throwIndex} 掷</span>
                <strong>{getJiaobeiOutcomeLabel(t.outcome)}</strong>
                <em>
                  {t.cups[0] === "yang" ? "阳" : "阴"} / {t.cups[1] === "yang" ? "阳" : "阴"}
                </em>
              </li>
            ))}
          </ul>
          {threeHoly && <p className="jiaobei-confirm">三圣杯：强确认，可行动（仍须结合现实判断）。</p>}
          {lastLaugh && !revisionMode && (
            <p className="jiaobei-warn">笑杯：请修正问句后再掷，不宜连续强迫。</p>
          )}
          {lastYin && <p className="jiaobei-warn">阴杯：宜暂停，尊重否定的回应。</p>}
        </section>
      )}
    </Page>
  );
}
