import { useMemo, useState } from "react";
import {
  classifyQuestion,
  formatDecisionPressure,
  formatQuestionDomain,
  formatTimeHorizon,
  translateQuestionForMethods,
  type ComparativeMethodId,
} from "@atlas/method-data";
import type { Tradition } from "@atlas/shared-types";
import { TraditionBadge } from "@/components/design-system";
import { Button } from "@/components/ui/Button";
import { TRADITION_LABELS } from "@/theme/traditions";

type Props = {
  onSubmit: (question: string, traditions: Tradition[]) => void;
  loading?: boolean;
  initialQuestion?: string;
};

const COMPARATIVE_METHODS: ComparativeMethodId[] = ["iching", "bazi", "western", "tarot"];

const QUESTION_TEMPLATES: Array<{ title: string; prompt: string }> = [
  {
    title: "职业转向",
    prompt: "我最近想离职，但又怕现在不是好时机。我该如何判断？",
  },
  {
    title: "关系卡点",
    prompt: "这段关系当前真正卡住的地方是什么？我下一步应该靠近还是保持距离？",
  },
  {
    title: "阶段节奏",
    prompt: "我现在处在怎样的人生阶段？接下来一年应该把力气放在哪里？",
  },
  {
    title: "内在状态",
    prompt: "我最近反复焦虑和内耗，这种状态背后真正需要被看见的是什么？",
  },
];

export function AskComposer({ onSubmit, loading, initialQuestion = "" }: Props) {
  const [text, setText] = useState(initialQuestion);
  const frame = useMemo(() => classifyQuestion(text), [text]);
  const recommended = frame.recommendedMethodIds.length > 0 ? frame.recommendedMethodIds : COMPARATIVE_METHODS;
  const [selected, setSelected] = useState<ComparativeMethodId[]>(["iching", "bazi", "western", "tarot"]);
  const activeSelected = useMemo(
    () => selected.filter((methodId) => COMPARATIVE_METHODS.includes(methodId)),
    [selected]
  );
  const translations = useMemo(
    () => translateQuestionForMethods(text || "写下你的问题后，这里会显示不同体系如何重新提问。", activeSelected),
    [activeSelected, text]
  );

  const toggle = (methodId: ComparativeMethodId) => {
    setSelected((prev) =>
      prev.includes(methodId) ? prev.filter((item) => item !== methodId) : [...prev, methodId]
    );
  };

  const applyTemplate = (template: (typeof QUESTION_TEMPLATES)[number]) => {
    const nextFrame = classifyQuestion(template.prompt);
    setText(template.prompt);
    setSelected(nextFrame.recommendedMethodIds.length > 0 ? nextFrame.recommendedMethodIds : [...COMPARATIVE_METHODS]);
  };

  const useRecommended = () => {
    setSelected(recommended);
  };

  const handleSubmit = () => {
    const q = text.trim();
    if (!q || activeSelected.length === 0) return;
    onSubmit(q, activeSelected as Tradition[]);
  };

  return (
    <div className="ask-composer">
      <section className="ask-composer__hero" aria-labelledby="ask-title">
        <p className="ask-composer__kicker">COMPARATIVE TABLE</p>
        <h2 id="ask-title" className="ask-composer__title">把问题放上桌</h2>
        <p>
          先写下真实困惑。诸象会把它翻译成不同文明能够处理的问题格式，再生成对照报告。
        </p>
      </section>

      <div className="template-grid" aria-label="常用问题模板">
        {QUESTION_TEMPLATES.map((template) => (
          <button key={template.title} type="button" onClick={() => applyTemplate(template)}>
            <strong>{template.title}</strong>
            <span>{template.prompt}</span>
          </button>
        ))}
      </div>

      <label className="question-field">
        <span>你的原始问题</span>
        <textarea
          className="ask-composer__textarea"
          placeholder="例如：我最近想离职，但又怕现在不是好时机。我该如何判断？"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
        />
      </label>

      <section className="question-frame" aria-label="问题识别">
        <div>
          <span>问题类型</span>
          <strong>{frame.domains.map(formatQuestionDomain).join("、")}</strong>
        </div>
        <div>
          <span>时间尺度</span>
          <strong>{formatTimeHorizon(frame.timeHorizon)}</strong>
        </div>
        <div>
          <span>决策压力</span>
          <strong>{formatDecisionPressure(frame.decisionPressure)}</strong>
        </div>
      </section>

      <section className="translation-panel" aria-labelledby="translation-title">
        <div className="panel-heading">
          <div>
            <p>QUESTION TRANSLATOR</p>
            <h3 id="translation-title">不同体系会这样重新提问</h3>
          </div>
          <button type="button" onClick={useRecommended}>使用推荐组合</button>
        </div>

        <div className="badges">
          {COMPARATIVE_METHODS.map((methodId) => (
            <TraditionBadge
              key={methodId}
              tradition={methodId}
              selected={activeSelected.includes(methodId)}
              onClick={() => toggle(methodId)}
            />
          ))}
        </div>

        <div className="translation-grid">
          {translations.map((item) => (
            <article key={item.methodId} className="translation-card">
              <span>{TRADITION_LABELS[item.methodId]}</span>
              <strong>{item.rationale}</strong>
              <p>{item.translatedQuestion}</p>
            </article>
          ))}
        </div>
      </section>

      <p className="hint" style={{ margin: 0 }}>
        推荐组合：{recommended.map((methodId) => TRADITION_LABELS[methodId]).join("、")}。不确定性会被拆成提问方式、因果模型和行动边界。
      </p>

      <Button
        title="生成对照报告"
        onClick={handleSubmit}
        loading={loading}
        disabled={!text.trim() || activeSelected.length === 0}
      />

      <style>{`
        .ask-composer { display: flex; flex-direction: column; gap: var(--spacing-lg); }
        .ask-composer__hero {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          padding-bottom: var(--spacing-md);
          border-bottom: 1px solid var(--color-border);
        }
        .ask-composer__kicker,
        .panel-heading p {
          margin: 0;
          color: var(--color-gold);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .ask-composer__title {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 1.65rem;
          font-weight: 600;
          color: var(--color-text);
        }
        .ask-composer__hero p:last-child {
          margin: 0;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }
        .template-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: var(--spacing-sm);
        }
        .template-grid button,
        .panel-heading button {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface);
          color: var(--color-text);
          text-align: left;
          cursor: pointer;
        }
        .template-grid button {
          display: flex;
          min-height: 112px;
          flex-direction: column;
          gap: var(--spacing-xs);
          padding: var(--spacing-md);
        }
        .template-grid button span {
          color: var(--color-text-muted);
          font-size: 0.82rem;
          line-height: 1.45;
        }
        .question-field {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          color: var(--color-gold);
          font-size: 0.85rem;
          font-weight: 700;
        }
        .ask-composer__textarea {
          width: 100%;
          box-sizing: border-box;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          color: var(--color-text);
          font-family: var(--font-sans);
          font-size: 1rem;
          line-height: 1.6;
          resize: vertical;
          transition: border-color 0.2s ease;
        }
        .ask-composer__textarea::placeholder { color: var(--color-text-muted); }
        .ask-composer__textarea:focus {
          outline: none;
          border-color: var(--color-gold-dim);
          box-shadow: 0 0 0 2px rgba(196, 165, 116, 0.12);
        }
        .question-frame {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--spacing-sm);
        }
        .question-frame div,
        .translation-card {
          padding: var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface-elevated);
        }
        .question-frame span,
        .translation-card span {
          display: block;
          color: var(--color-gold);
          font-size: 0.76rem;
          font-weight: 700;
        }
        .question-frame strong {
          display: block;
          margin-top: var(--spacing-xs);
          color: var(--color-text);
          font-size: 0.95rem;
        }
        .translation-panel {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .panel-heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: var(--spacing-md);
        }
        .panel-heading h3 {
          margin: var(--spacing-xs) 0 0;
          font-size: 1.05rem;
        }
        .panel-heading button {
          flex: 0 0 auto;
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--color-gold);
          font-weight: 700;
          text-align: center;
        }
        .translation-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: var(--spacing-sm);
        }
        .translation-card {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        .translation-card strong {
          color: var(--color-text);
          line-height: 1.45;
        }
        .translation-card p {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          line-height: 1.55;
        }
        @media (max-width: 760px) {
          .template-grid,
          .translation-grid,
          .question-frame {
            grid-template-columns: 1fr;
          }
          .panel-heading {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
