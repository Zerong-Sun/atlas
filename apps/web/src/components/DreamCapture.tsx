import { useState } from "react";
import type { DreamInterpretation } from "@/lib/api/dreams";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/theme/tokens";

const EMOTIONS = ["平静", "焦虑", "喜悦", "恐惧", "困惑", "期待"];
const SYMBOLS = ["水", "门", "路", "飞行", "坠落", "动物", "亲人", "光"];

type Props = {
  onSubmit: (text: string, emotions: string[], symbols: string[]) => void;
  loading?: boolean;
  result?: DreamInterpretation | null;
};

export function DreamCapture({ onSubmit, loading, result }: Props) {
  const [text, setText] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  return (
    <div className="dream-capture">
      <h2>记录梦境</h2>
      <textarea
        placeholder="描述你的梦…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
      <ChipRow
        label="情绪"
        items={EMOTIONS}
        selected={emotions}
        onToggle={(i) => toggle(emotions, setEmotions, i)}
      />
      <ChipRow
        label="符号"
        items={SYMBOLS}
        selected={symbols}
        onToggle={(i) => toggle(symbols, setSymbols, i)}
      />
      <Button
        title="生成多视角解释"
        onClick={() => onSubmit(text.trim(), emotions, symbols)}
        loading={loading}
        disabled={!text.trim()}
      />
      {result && (
        <div className="results">
          {result.degraded && (
            <p className="degraded" role="status">
              当前显示基础模板解读；配置服务端 LLM 后会生成更具体的专业解析。
            </p>
          )}
          <InterpretBlock title="中国梦占" body={result.chinese} />
          <InterpretBlock title="荣格简释" body={result.jungian} />
          <InterpretBlock title="精神反思" body={result.reflection} highlight />
        </div>
      )}
      <style>{`
        .dream-capture { display: flex; flex-direction: column; gap: ${spacing.md}px; }
        .dream-capture h2 { margin: 0; font-size: 20px; }
        .dream-capture textarea {
          width: 100%;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
          resize: vertical;
        }
        .chip-section .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
          margin-bottom: ${spacing.sm}px;
        }
        .chips { display: flex; flex-wrap: wrap; gap: ${spacing.sm}px; }
        .chip {
          padding: ${spacing.xs}px ${spacing.sm}px;
          border-radius: ${radius.full}px;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          font-size: 13px;
          color: ${colors.textSecondary};
          cursor: pointer;
        }
        .chip.selected { border-color: ${colors.gold}; color: ${colors.gold}; }
        .results { display: flex; flex-direction: column; gap: ${spacing.md}px; margin-top: ${spacing.lg}px; }
        .degraded {
          margin: 0;
          padding: ${spacing.sm}px ${spacing.md}px;
          border: 1px solid ${colors.goldDim};
          border-radius: ${radius.md}px;
          color: ${colors.textSecondary};
          font-size: 13px;
        }
        .interpret {
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border-radius: ${radius.md}px;
        }
        .interpret.highlight { border: 1px solid ${colors.goldDim}; }
        .interpret .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
          margin-bottom: ${spacing.sm}px;
        }
        .interpret p { margin: 0; line-height: 1.5; }
      `}</style>
    </div>
  );
}

function ChipRow({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <div className="chip-section">
      <span className="label">{label}</span>
      <div className="chips">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip${selected.includes(item) ? " selected" : ""}`}
            onClick={() => onToggle(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function InterpretBlock({ title, body, highlight }: { title: string; body: string; highlight?: boolean }) {
  return (
    <div className={`interpret${highlight ? " highlight" : ""}`}>
      <span className="label">{title}</span>
      <p>{body}</p>
    </div>
  );
}
