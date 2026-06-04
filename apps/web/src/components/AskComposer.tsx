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

  return (
    <div className="ask-composer">
      <h2>同题多算</h2>
      <p className="hint">选择任意体系组合，对照解读（全功能开放）</p>

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
      `}</style>
    </div>
  );
}
