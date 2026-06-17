import { useMemo, useState, type ReactNode } from "react";
import type { DreamInterpretation } from "@/lib/api/dreams";
import { matchDreamSymbols, searchDreamSymbols } from "@/data/dreamSymbolsLibrary";
import { Button } from "@/components/ui/Button";
import { getCulturalPrefs } from "@/lib/culturalPrefs";

const EMOTIONS = ["平静", "焦虑", "喜悦", "恐惧", "困惑", "期待"];

const INTERPRET_BLOCKS: Array<{
  key: keyof Pick<DreamInterpretation, "chinese" | "jungian" | "reflection">;
  title: string;
  primary?: boolean;
}> = [
  { key: "chinese", title: "中国梦占" },
  { key: "jungian", title: "荣格简释" },
  { key: "reflection", title: "精神反思", primary: true },
];

type Props = {
  onSubmit: (text: string, emotions: string[], symbols: string[]) => void;
  loading?: boolean;
  result?: DreamInterpretation | null;
  resultActions?: ReactNode;
};

export function DreamCapture({ onSubmit, loading, result, resultActions }: Props) {
  const [text, setText] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const culturalPrefs = useMemo(() => getCulturalPrefs(), []);

  const autoMatched = useMemo(() => matchDreamSymbols(text), [text]);
  const suggestions = useMemo(() => searchDreamSymbols(query), [query]);
  const charCount = text.trim().length;

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const addSymbol = (symbol: string) => {
    if (!symbols.includes(symbol)) setSymbols((prev) => [...prev, symbol]);
    setQuery("");
  };

  return (
    <div className="dream-capture">
      <div className="dream-capture__head">
        <h2>记录梦境</h2>
        <p className="dream-capture__hint" aria-live="polite">
          {charCount > 0 ? `${charCount} 字` : "醒来即记，细节越具体越好"}
        </p>
      </div>

      <textarea
        placeholder="描述场景、人物、情绪与转折…例如：梦见自己在浑浊的水里找不到出口，感到焦虑。"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        aria-label="梦境描述"
      />

      {autoMatched.length > 0 && (
        <div className="dream-autocomplete">
          <span className="label">库中匹配符号 · 点击添加</span>
          <div className="chips">
            {autoMatched.slice(0, 8).map((s) => (
              <button
                key={s.symbol}
                type="button"
                className={`chip${symbols.includes(s.symbol) ? " selected" : ""}`}
                onClick={() => addSymbol(s.symbol)}
              >
                {s.symbol}
              </button>
            ))}
          </div>
        </div>
      )}

      <ChipRow
        label="醒来时的情绪"
        items={EMOTIONS}
        selected={emotions}
        onToggle={(i) => toggle(emotions, setEmotions, i)}
      />

      <div className="chip-section">
        <span className="label">梦中符号（可搜索）</span>
        <input
          className="symbol-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="水、门、飞行、牙齿…"
          aria-label="搜索梦中符号"
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
        onClick={() => {
          const mergedSymbols = [
            ...new Set([...symbols, ...autoMatched.map((entry) => entry.symbol)]),
          ];
          onSubmit(text.trim(), emotions, mergedSymbols);
        }}
        loading={loading}
        disabled={!text.trim()}
      />

      {result && (
        <section className="dream-results" aria-label="梦境解读">
          <div className="dream-results__head">
            <h3>多视角解读</h3>
            {resultActions}
          </div>
          {result.degraded && (
            <p className="dream-degraded" role="status">
              当前显示基础模板解读；LLM 服务暂时不可用，请稍后重试以获取专业解析。
            </p>
          )}
          <div className="dream-interpret-grid">
            {INTERPRET_BLOCKS.map(({ key, title, primary }) => (
              <InterpretBlock key={key} title={title} body={result[key]} primary={primary} />
            ))}
            <InterpretBlock
              title="民俗征兆"
              body={buildFolkDreamView(symbols, emotions)}
            />
            <InterpretBlock
              title="文化适配"
              body={buildCulturalDreamView(culturalPrefs.culturalLens, culturalPrefs.locale)}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function buildCulturalDreamView(lens: ReturnType<typeof getCulturalPrefs>["culturalLens"], locale: ReturnType<typeof getCulturalPrefs>["locale"]): string {
  const localeNote = locale === "en-US"
    ? "When translating dream terms, keep the original symbol beside the explanation so cultural meaning is not flattened."
    : locale === "ja-JP"
      ? "可把梦中征兆和日常礼俗、季节感并读，但避免把它说成唯一答案。"
      : locale === "ko-KR"
        ? "可结合家族、礼俗与日常关系阅读梦象，同时保留现实判断。"
        : "可保留原文化术语，再用现代白话解释，避免把不同传统硬翻成同一种说法。";
  if (lens === "native") return `本土语境会优先尊重梦占传统内部的说法；${localeNote}`;
  if (lens === "academic") return `研究注释会把梦当作民俗、心理和叙事材料并读，标出不确定性；${localeNote}`;
  if (lens === "diaspora") return `跨文化入门会先解释符号背景，再提示它在日常生活里可能对应的感受；${localeNote}`;
  return `文明对照会并列民俗征兆、心理投射与伦理行动，不急着合成单一结论；${localeNote}`;
}

function buildFolkDreamView(symbols: string[], emotions: string[]): string {
  const symbolText = symbols.length ? `梦里反复出现「${symbols.slice(0, 4).join("、")}」` : "梦里最醒目的场景";
  const emotionText = emotions.length ? `醒来后残留「${emotions.join("、")}」` : "醒来后的身体感";
  return `${symbolText}，可先按民俗象征看作生活中的提醒；${emotionText}，说明重点不只在事件本身，也在你如何承接它。建议记录三天内的相似征兆，但不要把它当成必然预言。`;
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

function InterpretBlock({ title, body, primary }: { title: string; body: string; primary?: boolean }) {
  return (
    <article className={`dream-interpret${primary ? " dream-interpret--primary" : ""}`}>
      <span className="label">{title}</span>
      <p>{body}</p>
    </article>
  );
}
