import { useState } from "react";
import type { Tradition } from "@atlas/shared-types";
import { TraditionBadge } from "@/components/design-system";
import { Button } from "@/components/ui/Button";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

type Props = {
  onSubmit: (question: string, traditions: Tradition[]) => void;
  loading?: boolean;
};

const QUESTION_TEMPLATES: Array<{ title: string; prompt: string; traditions: Tradition[] }> = [
  {
    title: "事业方向",
    prompt: "我现在的事业节奏、适合发力的方向，以及近期需要避开的风险是什么？",
    traditions: ["bazi", "western", "iching"],
  },
  {
    title: "感情关系",
    prompt: "这段关系当前的核心状态、双方真实需求，以及下一步更稳妥的相处方式是什么？",
    traditions: ["tarot", "western", "iching"],
  },
  {
    title: "近期选择",
    prompt: "面对这个选择，我应该优先考虑什么？当前局势的机会与隐患分别在哪里？",
    traditions: ["tarot", "iching"],
  },
  {
    title: "长期节奏",
    prompt: "请从长期运势、个人特质与阶段节奏看，我接下来一年适合如何规划？",
    traditions: ["bazi", "western"],
  },
];

export function AskComposer({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Tradition[]>([...READING_TRADITIONS]);

  const toggle = (t: Tradition) => {
    setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const handleSubmit = () => {
    const q = text.trim();
    if (!q || selected.length === 0) return;
    onSubmit(q, selected);
  };

  const applyTemplate = (template: (typeof QUESTION_TEMPLATES)[number]) => {
    setText(template.prompt);
    setSelected(template.traditions);
  };

  return (
    <div className="ask-composer">
      <h2>同题多算</h2>
      <p className="hint">选择任意体系组合，对照解读（全功能开放）</p>

      <div className="template-grid" aria-label="常用问题模板">
        {QUESTION_TEMPLATES.map((template) => (
          <button key={template.title} type="button" onClick={() => applyTemplate(template)}>
            <strong>{template.title}</strong>
            <span>{template.traditions.map((t) => TRADITION_LABELS[t]).join(" · ")}</span>
          </button>
        ))}
      </div>

      <textarea
        placeholder="写下你的问题…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
      />

      <span className="label">选择体系</span>
      <div className="badges">
        {READING_TRADITIONS.map((t) => (
          <TraditionBadge
            key={t}
            tradition={t}
            selected={selected.includes(t)}
            onClick={() => toggle(t)}
          />
        ))}
      </div>
      {selected.length > 0 && (
        <p className="hint">
          已选 {selected.length} 个：{selected.map((t) => TRADITION_LABELS[t]).join("、")}
        </p>
      )}

      <Button
        title="生成对照报告"
        onClick={handleSubmit}
        loading={loading}
        disabled={!text.trim() || selected.length === 0}
      />

      <style>{`
        .ask-composer { display: flex; flex-direction: column; gap: ${spacing.md}px; }
        .ask-composer h2 { margin: 0; font-size: 20px; }
        .ask-composer .hint { margin: 0; font-size: 13px; color: ${colors.textMuted}; }
        .template-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: ${spacing.sm}px;
        }
        .template-grid button {
          min-height: 88px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: ${spacing.sm}px;
          padding: ${spacing.md}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
          background: ${colors.surfaceElevated};
          color: ${colors.text};
          text-align: left;
        }
        .template-grid button:hover {
          border-color: ${colors.goldDim};
          background: ${colors.goldDim}16;
        }
        .template-grid strong { font-size: 14px; color: ${colors.gold}; }
        .template-grid span { font-size: 12px; color: ${colors.textMuted}; line-height: 1.35; }
        .ask-composer .label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: ${colors.gold};
        }
        .ask-composer textarea {
          width: 100%;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
          resize: vertical;
        }
        .ask-composer .badges {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing.sm}px;
        }
        @media (max-width: 760px) {
          .template-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
