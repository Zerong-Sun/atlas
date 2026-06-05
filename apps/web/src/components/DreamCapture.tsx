import { useMemo, useState } from "react";
import type { DreamInterpretation } from "@/lib/api/dreams";
import { matchDreamSymbols, searchDreamSymbols } from "@/data/dreamSymbolsLibrary";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/theme/tokens";

const EMOTIONS = ["平静", "焦虑", "喜悦", "恐惧", "困惑", "期待"];

type Props = {
  onSubmit: (text: string, emotions: string[], symbols: string[]) => void;
  loading?: boolean;
  result?: DreamInterpretation | null;
};

export function DreamCapture({ onSubmit, loading, result }: Props) {
  const [text, setText] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const autoMatched = useMemo(() => matchDreamSymbols(text), [text]);
  const suggestions = useMemo(() => searchDreamSymbols(query), [query]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const addSymbol = (symbol: string) => {
    if (!symbols.includes(symbol)) setSymbols((prev) => [...prev, symbol]);
    setQuery("");
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
      {autoMatched.length > 0 && (
        <div className="dream-autocomplete">
          <span className="label">库中匹配符号</span>
          <div className="chips">
            {autoMatched.slice(0, 8).map((s) => (
              <button key={s.symbol} type="button" className="chip selected" onClick={() => addSymbol(s.symbol)}>
                {s.symbol}
              </button>
            ))}
          </div>
        </div>
      )}
      <ChipRow
        label="情绪"
        items={EMOTIONS}
        selected={emotions}
        onToggle={(i) => toggle(emotions, setEmotions, i)}
      />
      <div className="chip-section">
        <span className="label">符号（可搜索添加）</span>
        <input
          className="symbol-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入梦象，如 水、门、飞行…"
        />
        {suggestions.length > 0 && (
          <div className="chips">
            {suggestions.map((s) => (
              <button key={s.symbol} type="button" className="chip" onClick={() => addSymbol(s.symbol)}>
                {s.symbol}
              </button>
            ))}
          </div>
        )}
        {symbols.length > 0 && (
          <div className="chips">
            {symbols.map((s) => (
              <button key={s} type="button" className="chip selected" onClick={() => toggle(symbols, setSymbols, s)}>
                {s} ×
              </button>
            ))}
          </div>
        )}
      </div>
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
              当前显示基础模板解读；LLM 服务暂时不可用，请稍后重试以获取专业解析。
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
        .dream-capture textarea, .symbol-search {
          width: 100%;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
          resize: vertical;
        }
        .symbol-search { resize: none; }
        .chip-section .label, .dream-autocomplete .label {
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
