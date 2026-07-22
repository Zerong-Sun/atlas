import { useState } from "react";
import type { CSSProperties } from "react";
import {
  classifyQuestion,
  explainCausalityModel,
  explainUncertaintyMode,
  formatQuestionDomain,
  formatTimeHorizon,
  getMethodCulturalProfile,
  translateQuestionForMethods,
  type ComparativeMethodId,
} from "@atlas/method-data";
import type { ReadingReport, Tradition } from "@atlas/shared-types";
import {
  CitationBlock,
  ConsensusCard,
  DivergenceCard,
  TraditionBadge,
} from "@/components/design-system";
import { TRADITION_LABELS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

type Props = { report: ReadingReport };

export function ReadingResultView({ report }: Props) {
  const [activeTradition, setActiveTradition] = useState<Tradition | null>(
    report.traditions[0] ?? null
  );

  const summary = report.sections.find((s) => s.type === "summary");
  const question = report.sections.find((s) => s.type === "question_restate")?.content ?? "";
  const questionFrame = report.questionFrame ?? classifyQuestion(question);
  const advice = report.sections.find((s) => s.type === "advice");
  const cautions = report.sections.find((s) => s.type === "cautions");
  const traditionSections = report.sections.filter((s) => s.type === "tradition_analysis");
  const activeSection = traditionSections.find((s) => s.tradition === activeTradition);
  const activeFacts =
    report.structuredFacts?.find((f) => f.tradition === activeTradition)?.facts ??
    (traditionSections[0]?.metadata?.[activeTradition ?? ""] as Record<string, unknown> | undefined);
  const activeContent =
    activeSection?.content ?? getTraditionContent(traditionSections[0]?.content, activeTradition);
  const comparableTraditions = report.traditions.filter(isComparativeMethodId);
  const questionTranslations =
    report.questionTranslations?.filter((item) => comparableTraditions.includes(item.methodId)) ??
    translateQuestionForMethods(question || "本次问题", comparableTraditions);

  return (
    <div className="reading-result">
      {question && (
        <section className="question-frame-card">
          <span className="label">问题如何被放上桌</span>
          <h3>{question}</h3>
          <p>
            这不是单纯寻找“准答案”的问题；本次先把它识别为
            {questionFrame.domains.map(formatQuestionDomain).join("、")}，时间尺度为
            {formatTimeHorizon(questionFrame.timeHorizon)}，再交给不同体系按自己的方式处理。
          </p>
        </section>
      )}

      {summary && (
        <section className="summary">
          <span className="label">结论摘要</span>
          <p className="serif">{summary.content}</p>
        </section>
      )}

      <div className="hero">
        <ConsensusCard content={report.consensus} />
        <DivergenceCard content={report.divergence} />
      </div>

      {questionTranslations.length > 0 && (
        <section className="translation-readout" aria-labelledby="translation-readout-title">
          <span className="label">同一个问题如何被翻译</span>
          <h3 id="translation-readout-title">每个体系先改变问题的形状</h3>
          <div className="translation-readout__grid">
            {questionTranslations.map((item) => (
              <article key={item.methodId}>
                <strong>{TRADITION_LABELS[item.methodId]}</strong>
                <p>{item.rationale}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <CulturalComparisonMatrix traditions={report.traditions} />

      <h3>各体系解读</h3>
      <div className="tabs">
        {report.traditions.map((t) => (
          <TraditionBadge
            key={t}
            tradition={t}
            selected={activeTradition === t}
            onClick={() => setActiveTradition(t)}
          />
        ))}
      </div>
      {activeTradition && (
        <div className="tradition-card">
          <span className="label">{TRADITION_LABELS[activeTradition]}</span>
          {activeTradition === "bazi" && activeFacts ? (
            <BaziStructuredView facts={activeFacts} />
          ) : activeTradition === "western" && activeFacts ? (
            <WesternChartView facts={activeFacts} />
          ) : activeTradition === "tarot" && activeFacts ? (
            <TarotStructuredView facts={activeFacts} content={activeContent} />
          ) : activeTradition === "iching" && activeFacts ? (
            <IChingStructuredView facts={activeFacts} content={activeContent} />
          ) : (
            <p>{activeContent}</p>
          )}
        </div>
      )}

      <h3>古籍依据</h3>
      {report.citations.map((c) => (
        <CitationBlock key={c.chunkId} citation={c} />
      ))}

      {advice && (
        <section className="block">
          <span className="label">行动建议</span>
          <p>{advice.content}</p>
        </section>
      )}
      {cautions && (
        <section className="block caution">
          <span className="label">风险提醒</span>
          <p className="muted">{cautions.content}</p>
        </section>
      )}
      {report.degraded && <p className="degraded">AI 综合解释（降级模式）</p>}

      <style>{`
        .reading-result { display: flex; flex-direction: column; gap: ${spacing.md}px; }
        .reading-result .hero { margin: ${spacing.md}px 0; }
        .reading-result h3 { font-size: 20px; margin: ${spacing.lg}px 0 ${spacing.sm}px; }
        .question-frame-card,
        .translation-readout,
        .comparison-matrix {
          padding: ${spacing.md}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          background: ${colors.surface};
        }
        .question-frame-card h3,
        .translation-readout h3,
        .comparison-matrix h3 {
          margin: ${spacing.xs}px 0;
        }
        .question-frame-card p {
          margin: ${spacing.sm}px 0 0;
          color: ${colors.textSecondary};
          line-height: 1.6;
        }
        .translation-readout__grid,
        .comparison-matrix__grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: ${spacing.sm}px;
          margin-top: ${spacing.md}px;
        }
        .translation-readout article,
        .comparison-row {
          padding: ${spacing.md}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
          background: ${colors.surfaceElevated};
        }
        .translation-readout article strong,
        .comparison-row strong {
          color: ${colors.gold};
        }
        .translation-readout article p {
          margin: ${spacing.xs}px 0 0;
          color: ${colors.textSecondary};
          line-height: 1.5;
        }
        .comparison-row {
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: ${spacing.sm}px;
        }
        .comparison-row dl {
          display: grid;
          gap: ${spacing.sm}px;
          margin: 0;
        }
        .comparison-row dt {
          color: ${colors.gold};
          font-size: 12px;
          font-weight: 700;
        }
        .comparison-row dd {
          margin: ${spacing.xs}px 0 0;
          color: ${colors.textSecondary};
          line-height: 1.45;
        }
        .reading-result .summary {
          padding-bottom: ${spacing.md}px;
          border-bottom: 1px solid ${colors.border};
        }
        .reading-result .summary .serif {
          font-family: Georgia, "Noto Serif SC", serif;
          font-size: 17px;
          line-height: 1.6;
          margin: ${spacing.sm}px 0 0;
        }
        .reading-result .label {
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
        }
        .reading-result .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing.sm}px;
          margin-bottom: ${spacing.md}px;
        }
        .reading-result .tradition-card {
          background: ${colors.surface};
          padding: ${spacing.md}px;
          border-radius: ${radius.md}px;
        }
        .reading-result .tradition-card p { margin: ${spacing.sm}px 0 0; line-height: 1.5; }
        .bazi-detail { display: flex; flex-direction: column; gap: ${spacing.lg}px; margin-top: ${spacing.sm}px; }
        .bazi-summary {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs}px;
          padding: ${spacing.md}px;
          background: ${colors.surfaceElevated};
          border-radius: ${radius.sm}px;
        }
        .bazi-summary strong { color: ${colors.gold}; }
        .bazi-detail h4 { margin: 0 0 ${spacing.sm}px; font-size: 15px; color: ${colors.text}; }
        .bazi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: ${spacing.sm}px;
        }
        .mini-card, .classic-card {
          padding: ${spacing.md}px;
          background: ${colors.surfaceElevated};
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
        }
        .mini-card span, .classic-card span {
          color: ${colors.gold};
          font-size: 12px;
          font-weight: 600;
        }
        .mini-card strong { display: block; margin: ${spacing.xs}px 0; font-size: 20px; }
        .mini-card p, .classic-card p { color: ${colors.textSecondary}; font-size: 13px; }
        .bazi-list {
          list-style: none;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: ${spacing.sm}px;
          padding: 0;
          margin: 0;
        }
        .bazi-list li {
          display: flex;
          flex-direction: column;
          gap: ${spacing.xs}px;
          padding: ${spacing.sm}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
          background: ${colors.surfaceElevated};
        }
        .bazi-list span, .year-row span { color: ${colors.gold}; font-weight: 600; }
        .bazi-list strong { font-size: 20px; }
        .bazi-list em, .year-row em { color: ${colors.textMuted}; font-size: 12px; font-style: normal; }
        .year-list, .classic-list { display: flex; flex-direction: column; gap: ${spacing.sm}px; }
        .year-row {
          display: grid;
          grid-template-columns: 110px 70px 70px 1fr;
          gap: ${spacing.sm}px;
          align-items: center;
          padding: ${spacing.sm}px ${spacing.md}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
          background: ${colors.surfaceElevated};
        }
        .year-row.current {
          border-color: ${colors.gold};
          background: ${colors.goldDim}22;
        }
        .year-row p { margin: 0; color: ${colors.textSecondary}; font-size: 13px; }
        .classic-card blockquote {
          margin: ${spacing.sm}px 0;
          padding-left: ${spacing.md}px;
          border-left: 2px solid ${colors.goldDim};
          font-family: Georgia, "Noto Serif SC", serif;
          color: ${colors.text};
        }
        .reading-result .block { margin-top: ${spacing.md}px; }
        .reading-result .block p { margin: ${spacing.sm}px 0 0; }
        .reading-result .caution {
          padding: ${spacing.md}px;
          background: ${colors.surfaceElevated};
          border-radius: ${radius.md}px;
        }
        .reading-result .muted { color: ${colors.textSecondary}; font-size: 14px; }
        .reading-result .degraded { color: ${colors.gold}; font-size: 13px; }
        .western-detail { display: flex; flex-direction: column; gap: ${spacing.lg}px; margin-top: ${spacing.sm}px; }
        .astro-layout {
          display: grid;
          grid-template-columns: minmax(260px, 360px) 1fr;
          gap: ${spacing.lg}px;
          align-items: start;
        }
        .chart-wheel {
          position: relative;
          aspect-ratio: 1;
          border: 1px solid ${colors.goldDim};
          border-radius: 50%;
          background:
            radial-gradient(circle at center, ${colors.surface} 0 30%, transparent 31%),
            conic-gradient(from -90deg, ${colors.surfaceElevated} 0deg 30deg, ${colors.surface} 30deg 60deg, ${colors.surfaceElevated} 60deg 90deg, ${colors.surface} 90deg 120deg, ${colors.surfaceElevated} 120deg 150deg, ${colors.surface} 150deg 180deg, ${colors.surfaceElevated} 180deg 210deg, ${colors.surface} 210deg 240deg, ${colors.surfaceElevated} 240deg 270deg, ${colors.surface} 270deg 300deg, ${colors.surfaceElevated} 300deg 330deg, ${colors.surface} 330deg 360deg);
          box-shadow: inset 0 0 0 42px ${colors.ink}55;
        }
        .chart-wheel::before {
          content: "";
          position: absolute;
          inset: 14%;
          border: 1px solid ${colors.border};
          border-radius: 50%;
        }
        .chart-wheel::after {
          content: "";
          position: absolute;
          inset: 36%;
          border: 1px solid ${colors.border};
          border-radius: 50%;
        }
        .sign-mark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 44px;
          margin-left: -22px;
          margin-top: -10px;
          transform: rotate(var(--angle)) translateY(-45%) rotate(calc(-1 * var(--angle)));
          transform-origin: 50% 50%;
          color: ${colors.textMuted};
          font-size: 11px;
          text-align: center;
        }
        .planet-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 34px;
          height: 34px;
          margin: -17px 0 0 -17px;
          border-radius: 50%;
          border: 1px solid ${colors.goldDim};
          background: ${colors.ink};
          color: ${colors.gold};
          font-size: 12px;
          font-weight: 700;
          display: grid;
          place-items: center;
          transform: rotate(var(--angle)) translateY(-98px) rotate(calc(-1 * var(--angle)));
          transform-origin: 50% 50%;
        }
        .astro-panel {
          display: flex;
          flex-direction: column;
          gap: ${spacing.sm}px;
        }
        .planet-row, .aspect-row {
          display: grid;
          grid-template-columns: 70px 1fr 58px;
          gap: ${spacing.sm}px;
          align-items: center;
          padding: ${spacing.sm}px ${spacing.md}px;
          background: ${colors.surfaceElevated};
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
        }
        .planet-row strong, .aspect-row strong { color: ${colors.gold}; }
        .planet-row em, .aspect-row em { color: ${colors.textMuted}; font-style: normal; font-size: 12px; }
        .balance-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: ${spacing.sm}px;
        }
        .balance-card {
          padding: ${spacing.sm}px;
          border-radius: ${radius.sm}px;
          background: ${colors.surfaceElevated};
          border: 1px solid ${colors.border};
        }
        .balance-card span { color: ${colors.gold}; font-weight: 700; }
        .balance-bar {
          height: 6px;
          margin-top: ${spacing.xs}px;
          border-radius: ${radius.full}px;
          background: ${colors.border};
          overflow: hidden;
        }
        .balance-bar i {
          display: block;
          height: 100%;
          width: var(--value);
          background: ${colors.gold};
        }
        .tarot-detail, .iching-detail {
          display: flex;
          flex-direction: column;
          gap: ${spacing.lg}px;
          margin-top: ${spacing.sm}px;
        }
        .tarot-spread {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: ${spacing.md}px;
        }
        .tarot-card {
          min-height: 240px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: ${spacing.md}px;
          padding: ${spacing.lg}px ${spacing.md}px;
          border: 1px solid ${colors.goldDim};
          border-radius: ${radius.md}px;
          background:
            linear-gradient(180deg, ${colors.goldDim}18, transparent 42%),
            ${colors.surfaceElevated};
        }
        .tarot-card.reversed {
          border-style: dashed;
          background:
            linear-gradient(0deg, ${colors.goldDim}18, transparent 42%),
            ${colors.surfaceElevated};
        }
        .tarot-card span, .hex-card span { color: ${colors.gold}; font-size: 12px; font-weight: 700; }
        .tarot-card strong { font-size: 22px; }
        .tarot-card em { color: ${colors.textMuted}; font-style: normal; font-size: 12px; }
        .keyword-row {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing.xs}px;
        }
        .keyword-row i {
          padding: 4px 8px;
          border-radius: ${radius.full}px;
          background: ${colors.goldDim}20;
          color: ${colors.textSecondary};
          font-size: 12px;
          font-style: normal;
        }
        .iching-flow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr);
          gap: ${spacing.md}px;
          align-items: center;
        }
        .hex-card {
          padding: ${spacing.md}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
          background: ${colors.surfaceElevated};
        }
        .hex-card h4 { margin: ${spacing.xs}px 0 ${spacing.md}px; font-size: 22px; }
        .hex-lines {
          display: flex;
          flex-direction: column-reverse;
          gap: 8px;
          margin: ${spacing.md}px 0;
        }
        .hex-line {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          height: 10px;
        }
        .hex-line.yin { grid-template-columns: 1fr 1fr; }
        .hex-line i {
          display: block;
          border-radius: ${radius.full}px;
          background: ${colors.gold};
        }
        .hex-arrow {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid ${colors.goldDim};
          border-radius: 50%;
          color: ${colors.gold};
        }
        @media (max-width: 720px) {
          .bazi-grid, .bazi-list { grid-template-columns: 1fr 1fr; }
          .year-row { grid-template-columns: 1fr 1fr; }
          .year-row p { grid-column: 1 / -1; }
          .astro-layout { grid-template-columns: 1fr; }
          .planet-dot { transform: rotate(var(--angle)) translateY(-82px) rotate(calc(-1 * var(--angle))); }
          .balance-grid { grid-template-columns: 1fr 1fr; }
          .tarot-spread, .iching-flow { grid-template-columns: 1fr; }
          .hex-arrow { margin: 0 auto; transform: rotate(90deg); }
        }
        @media (max-width: 760px) {
          .translation-readout__grid,
          .comparison-matrix__grid {
            grid-template-columns: 1fr;
          }
          .comparison-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function CulturalComparisonMatrix({ traditions }: { traditions: Tradition[] }) {
  const comparable = traditions.filter(isComparativeMethodId);
  if (comparable.length === 0) return null;

  return (
    <section className="comparison-matrix" aria-labelledby="comparison-matrix-title">
      <span className="label">三层对照</span>
      <h3 id="comparison-matrix-title">提问方式、因果模型与不确定性处理</h3>
      <div className="comparison-matrix__grid">
        {comparable.map((tradition) => {
          const profile = getMethodCulturalProfile(tradition);
          return (
            <article key={tradition} className="comparison-row">
              <strong>{TRADITION_LABELS[tradition]}</strong>
              <dl>
                <div>
                  <dt>如何提问</dt>
                  <dd>{profile.questionGrammar}</dd>
                </div>
                <div>
                  <dt>如何理解因果</dt>
                  <dd>{explainCausalityModel(profile.causalityModel)}</dd>
                </div>
                <div>
                  <dt>如何处理不确定性</dt>
                  <dd>{explainUncertaintyMode(profile.uncertaintyMode)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const COMPARATIVE_METHOD_IDS: ComparativeMethodId[] = ["bazi", "western", "tarot", "iching"];

function isComparativeMethodId(value: Tradition): value is ComparativeMethodId {
  return COMPARATIVE_METHOD_IDS.includes(value as ComparativeMethodId);
}

function getTraditionContent(content: string | undefined, tradition: Tradition | null): string {
  if (!content || !tradition) return "暂无该体系的结构化解读。";
  const label = TRADITION_LABELS[tradition];
  const start = content.indexOf(`【${label}】`);
  if (start < 0) return content;
  const rest = content.slice(start);
  const next = rest.slice(1).search(/\n\n【/);
  return (next >= 0 ? rest.slice(0, next + 1) : rest).replace(`【${label}】`, "").trim();
}

function BaziStructuredView({ facts }: { facts: Record<string, unknown> }) {
  const pillars = getArray(facts.pillarList);
  const elements = getArray(facts.elementList);
  const years = getArray(facts.annualFortunes);
  const classics = getArray(facts.classics);

  return (
    <div className="bazi-detail">
      <div className="bazi-summary">
        <strong>日主：{String(facts.dayMaster ?? "未定")}</strong>
        <span>{String(facts.summary ?? "")}</span>
      </div>

      <section>
        <h4>四柱列表</h4>
        <div className="bazi-grid">
          {pillars.map((item) => (
            <div key={String(item.key)} className="mini-card">
              <span>{String(item.label)}</span>
              <strong>{String(item.value)}</strong>
              <p>
                天干{String(item.stem)}属{String(item.stemElement)}，地支{String(item.branch)}属
                {String(item.branchElement)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4>五行分布</h4>
        <ul className="bazi-list">
          {elements.map((item) => (
            <li key={String(item.element)}>
              <span>{String(item.element)}</span>
              <strong>{String(item.count)}</strong>
              <em>{String(item.role)}</em>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>流年列表</h4>
        <div className="year-list">
          {years.map((item) => (
            <div key={String(item.year)} className={`year-row${item.isCurrent ? " current" : ""}`}>
              <span>{String(item.year)}{item.isCurrent ? "（今年）" : ""}</span>
              <strong>{String(item.pillar)}</strong>
              <em>{String(item.tenGod)}</em>
              <p>{String(item.note)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4>典籍原文与解析</h4>
        <div className="classic-list">
          {classics.map((item) => (
            <article key={String(item.id)} className="classic-card">
              <span>{String(item.title)} · {String(item.chapter)}</span>
              <blockquote>{String(item.fullText)}</blockquote>
              <p>{String(item.analysis)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function WesternChartView({ facts }: { facts: Record<string, unknown> }) {
  const planets = getArray(facts.planetList);
  const aspects = getArray(facts.aspects);
  const elementBalance = getRecord(facts.elementBalance);
  const modalityBalance = getRecord(facts.modalityBalance);
  const ascendant = getRecord(facts.ascendant);
  const signLabels = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];

  return (
    <div className="western-detail">
      <div className="bazi-summary">
        <strong>{String(facts.summary ?? "西洋占星盘")}</strong>
        <span>上升 {String(ascendant.sign ?? "未定")} {String(ascendant.degree ?? "")}°；圆盘为估算黄道位置。</span>
      </div>

      <div className="astro-layout">
        <div className="chart-wheel" aria-label="星盘可视化">
          {signLabels.map((sign, index) => (
            <span
              key={sign}
              className="sign-mark"
              style={{ "--angle": `${index * 30 + 15}deg` } as CSSProperties}
            >
              {sign}
            </span>
          ))}
          {planets.map((planet) => (
            <span
              key={String(planet.key)}
              className="planet-dot"
              title={`${String(planet.label)} ${String(planet.sign)} ${String(planet.degree)}°`}
              style={{ "--angle": `${Number(planet.longitude) - 90}deg` } as CSSProperties}
            >
              {String(planet.label).slice(0, 1)}
            </span>
          ))}
        </div>

        <div className="astro-panel">
          <h4>行星落点</h4>
          {planets.map((planet) => (
            <div key={String(planet.key)} className="planet-row">
              <strong>{String(planet.label)}</strong>
              <span>{String(planet.sign)} {String(planet.degree)}° · 第{String(planet.house)}宫</span>
              <em>{String(planet.element)} / {String(planet.modality)}</em>
            </div>
          ))}
        </div>
      </div>

      <section>
        <h4>元素分布</h4>
        <BalanceGrid data={elementBalance} keys={["火", "土", "风", "水"]} total={planets.length} />
      </section>

      <section>
        <h4>模式分布</h4>
        <BalanceGrid data={modalityBalance} keys={["基本", "固定", "变动"]} total={planets.length} />
      </section>

      <section>
        <h4>主要相位</h4>
        <div className="astro-panel">
          {aspects.length > 0 ? (
            aspects.map((aspect, index) => (
              <div key={`${String(aspect.planetA)}-${String(aspect.planetB)}-${index}`} className="aspect-row">
                <strong>{String(aspect.aspect)}</strong>
                <span>{String(aspect.planetA)} 与 {String(aspect.planetB)}</span>
                <em>容许度 {String(aspect.orb)}°</em>
              </div>
            ))
          ) : (
            <p>主要相位较少，解读以行星落座与宫位为主。</p>
          )}
        </div>
      </section>
    </div>
  );
}

function BalanceGrid({ data, keys, total }: { data: Record<string, unknown>; keys: string[]; total: number }) {
  const denominator = Math.max(total, 1);
  return (
    <div className="balance-grid">
      {keys.map((key) => {
        const value = Number(data[key] ?? 0);
        return (
          <div key={key} className="balance-card">
            <span>{key} {value}</span>
            <div className="balance-bar">
              <i style={{ "--value": `${Math.round((value / denominator) * 100)}%` } as CSSProperties} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TarotStructuredView({ facts, content }: { facts: Record<string, unknown>; content: string }) {
  const cards = getArray(facts.cards);

  return (
    <div className="tarot-detail">
      <div className="bazi-summary">
        <strong>{String(facts.summary ?? "三张牌阵")}</strong>
        <span>{content}</span>
      </div>

      <div className="tarot-spread">
        {cards.map((card, index) => {
          const keywords = Array.isArray(card.keywords) ? card.keywords : [];
          return (
            <article
              key={`${String(card.position)}-${String(card.name)}-${index}`}
              className={`tarot-card${card.reversed ? " reversed" : ""}`}
            >
              <span>{String(card.position ?? `第${index + 1}张`)}</span>
              <strong>{String(card.name ?? "未知牌")}</strong>
              <em>{card.reversed ? "逆位" : "正位"}</em>
              <div className="keyword-row">
                {keywords.map((keyword) => (
                  <i key={String(keyword)}>{String(keyword)}</i>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function IChingStructuredView({ facts, content }: { facts: Record<string, unknown>; content: string }) {
  const primary = getRecord(facts.primary);
  const changing = getRecord(facts.changing);

  return (
    <div className="iching-detail">
      <div className="bazi-summary">
        <strong>{String(facts.summary ?? "易经卦象")}</strong>
        <span>{content}</span>
      </div>

      <div className="iching-flow">
        <HexagramCard title="本卦" hexagram={primary} />
        <div className="hex-arrow" aria-hidden="true">→</div>
        <HexagramCard title="变卦" hexagram={changing} />
      </div>
    </div>
  );
}

function HexagramCard({ title, hexagram }: { title: string; hexagram: Record<string, unknown> }) {
  const lines = Array.isArray(hexagram.lines) ? hexagram.lines : [];

  return (
    <article className="hex-card">
      <span>{title} · 第{String(hexagram.number ?? "?")}卦</span>
      <h4>{String(hexagram.name ?? "未定")}</h4>
      <div className="hex-lines" aria-label={`${title}六爻`}>
        {lines.map((line, index) => (
          <div key={`${String(line)}-${index}`} className={`hex-line ${String(line)}`}>
            <i />
            {line === "yin" && <i />}
          </div>
        ))}
      </div>
      <p>{String(hexagram.judgment ?? "")}</p>
      <p className="muted">{String(hexagram.image ?? "")}</p>
    </article>
  );
}

function getArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
