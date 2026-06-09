import { useEffect, useMemo, useState } from "react";
import { computeQimen, interpretQimen } from "@atlas/engines/qimen";
import type { MatchedRule, QimenJuMethod, TimingWindow } from "@atlas/shared-types";
import { QimenBoard } from "@/components/charts/QimenBoard";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildQimenReportSnapshot } from "@/lib/methodReportSnapshot";
import {
  QIMEN_QUESTION_TYPES,
  QIMEN_DUN_RULES,
  getQimenLibrary,
} from "@/data/qimenLibrary";
import { appendQimenBoardHistory } from "@/lib/storage";

export function QimenPage() {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState(QIMEN_QUESTION_TYPES[0]?.type ?? "事业项目");
  const [predictionWindow, setPredictionWindow] = useState<"时" | "日" | "旬" | "月">("日");
  const [juMethod, setJuMethod] = useState<QimenJuMethod>("chaibu");
  const [timestamp, setTimestamp] = useState(() => new Date().toISOString().slice(0, 16));
  const [computeKey, setComputeKey] = useState(0);

  const chart = useMemo(() => {
    if (computeKey === 0) return null;
    return computeQimen({
      timestamp: new Date(timestamp).toISOString(),
      juMethod,
    });
  }, [computeKey, timestamp, juMethod]);

  const interpretation = useMemo(() => {
    if (!chart) return null;
    return interpretQimen(chart, { questionType, predictionWindow });
  }, [chart, questionType, predictionWindow]);
  const library = getQimenLibrary();

  const handleCompute = () => setComputeKey((k) => k + 1);

  const copilotReport = useMemo(
    () =>
      chart && interpretation
        ? buildQimenReportSnapshot(question, questionType, chart, interpretation)
        : null,
    [chart, interpretation, question, questionType],
  );
  useRegisterMethodCopilotReport(copilotReport);

  useEffect(() => {
    if (!chart || !interpretation) return;
    appendQimenBoardHistory({
      id: `q-${chart.inputTime}`,
      time: new Date(timestamp).toLocaleString("zh-CN"),
      question: question || questionType,
      juMethod,
      dun: chart.dun,
      ju: chart.ju,
      summary: interpretation.summary,
    });
  }, [chart, interpretation, juMethod, question, questionType, timestamp]);

  return (
    <Page wide className="qimen-page">
      <MethodHero
        methodId="qimen"
        kicker="QIMEN DUNJIA"
        title="奇门遁甲"
        description="时家奇门排盘：定局、取用神、识格局、看应期。拆补/置闰双口径可切换。"
      />

      <section className="method-workbench">
        <label>
          <span>所问事项</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
        </label>
        <label>
          <span>事项类型</span>
          <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
            {QIMEN_QUESTION_TYPES.map((q) => (
              <option key={q.type} value={q.type}>{q.type}</option>
            ))}
          </select>
        </label>
        <p className="muted">
          {QIMEN_QUESTION_TYPES.find((q) => q.type === questionType)?.readingKey}
        </p>
        <label>
          <span>起局时间</span>
          <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
        </label>
        <label>
          <span>预测窗口</span>
          <select value={predictionWindow} onChange={(e) => setPredictionWindow(e.target.value as typeof predictionWindow)}>
            <option value="时">时</option>
            <option value="日">日</option>
            <option value="旬">旬</option>
            <option value="月">月</option>
          </select>
        </label>
        <div className="spread-toggle" role="group" aria-label="排盘口径">
          <button type="button" className={juMethod === "chaibu" ? "active" : ""} onClick={() => setJuMethod("chaibu")}>
            拆补法
          </button>
          <button type="button" className={juMethod === "zhirun" ? "active" : ""} onClick={() => setJuMethod("zhirun")}>
            置闰法
          </button>
        </div>
        <p className="muted">{QIMEN_DUN_RULES.find((r) => r.title.includes(juMethod === "chaibu" ? "拆补" : "置闰"))?.note}</p>
        <button type="button" className="primary-btn" onClick={handleCompute}>起局排盘</button>
      </section>

      {chart && interpretation && (
        <>
          <MethodResultActions />
          <section className="method-result-summary">
            <div className="section-heading">
              <p>CHART</p>
              <h2>{chart.dun}{chart.ju}局 · {chart.yuan} · {chart.solarTerm}</h2>
            </div>
            <p>{interpretation.summary}</p>
            <dl className="pillar-grid">
              <div><dt>四柱</dt><dd>{chart.pillars.year} {chart.pillars.month} {chart.pillars.day} {chart.pillars.hour}</dd></div>
              <div><dt>旬首</dt><dd>{chart.xunShou}</dd></div>
              <div><dt>值符</dt><dd>{chart.zhiFu} @ {chart.zhiFuPalace}</dd></div>
              <div><dt>值使</dt><dd>{chart.zhiShi} @ {chart.zhiShiPalace}</dd></div>
              <div><dt>空亡</dt><dd>{chart.kongWang.join("、")}</dd></div>
              <div><dt>口径</dt><dd>{chart.juMethod === "chaibu" ? "拆补法" : "置闰法"}</dd></div>
            </dl>
          </section>

          <section className="qimen-board-section">
            <QimenBoard palaces={chart.palaces} zhiFuPalace={chart.zhiFuPalace} zhiShi={chart.zhiShi} />
            <p className="muted">中五寄坤二解读；符·使为高亮宫。</p>
          </section>

          {interpretation.matchedPatterns.length > 0 && (
            <section className="bazi-panel bazi-panel-full">
              <div className="section-heading"><p>PATTERNS</p><h2>命中格局</h2></div>
              <div className="aspect-grid">
                {interpretation.matchedPatterns.map((p: MatchedRule) => (
                  <article className="aspect-card" key={p.id}>
                    <span>{p.name} · {p.level}</span>
                    <p>{p.meaning}</p>
                    {p.evidence.map((e: MatchedRule["evidence"][number]) => <em key={e.detail}>{e.label}: {e.detail}</em>)}
                    {p.actionHint && <strong>{p.actionHint}</strong>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {interpretation.relations.length > 0 && (
            <section className="bazi-panel">
              <div className="section-heading"><p>RELATIONS</p><h2>结构关系</h2></div>
              <div className="aspect-grid">
                {interpretation.relations.map((r: MatchedRule) => (
                  <article className="aspect-card" key={r.id}>
                    <span>{r.name}</span>
                    <p>{r.meaning}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {interpretation.timingWindows.length > 0 && (
            <section className="bazi-panel">
              <div className="section-heading"><p>TIMING</p><h2>应期窗口</h2></div>
              <div className="aspect-grid">
                {interpretation.timingWindows.map((t: TimingWindow) => (
                  <article className="aspect-card" key={t.label}>
                    <span>{t.label} · {t.range}</span>
                    <p>{t.basis}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {interpretation.directionAdvice && (
            <section className="bazi-panel">
              <div className="section-heading"><p>DIRECTION</p><h2>方位转译</h2></div>
              <article className="aspect-card">
                <span>{interpretation.directionAdvice.palace} · {interpretation.directionAdvice.direction}</span>
                <p>{interpretation.directionAdvice.spatial}</p>
                <p>{interpretation.directionAdvice.action}</p>
                <em>{interpretation.directionAdvice.timing}</em>
              </article>
            </section>
          )}

          <section className="classic-section">
            <div className="section-heading"><p>NOTES</p><h2>排盘说明</h2></div>
            <ul>{chart.notes.map((n: string) => <li key={n}>{n}</li>)}</ul>
          </section>
        </>
      )}

      {!chart && (
        <section className="method-library-preview">
          <div className="section-heading"><p>LIBRARY</p><h2>专库概览</h2></div>
          <p className="muted">{library.patterns.length} 格局 · {library.directionTranslations.length} 方位转译 · {library.questionTypes.length} 问事类型</p>
        </section>
      )}
    </Page>
  );
}
