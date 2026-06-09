import { useMemo, useState } from "react";
import { castIChing } from "@atlas/engines/iching";
import { HexagramLines } from "@/components/charts/HexagramLines";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildIchingReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";

type IChingHex = {
  number: number;
  name: string;
  judgment: string;
  image: string;
  lines: Array<"yang" | "yin">;
};

type IChingResult = {
  primary: IChingHex;
  changing: IChingHex;
  summary: string;
  method: string;
};

export function IchingPage() {
  const [question, setQuestion] = useState("");
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [result, setResult] = useState<IChingResult | null>(null);

  const castStep = coinLines.length;

  const throwCoins = () => {
    if (castStep >= 6) return;
    playMethodSound("iching", "action");
    const sum = Math.floor(Math.random() * 4) + 6;
    const next = [...coinLines, sum];
    setCoinLines(next);
    if (next.length === 6) {
      const seed = `${Date.now()}-${question}-${next.join("")}`;
      const raw = castIChing(seed) as IChingResult;
      setResult(raw);
      playMethodSound("iching", "complete");
    }
  };

  const reset = () => {
    setCoinLines([]);
    setResult(null);
  };

  const copilotReport = useMemo(
    () => (result ? buildIchingReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const primaryLines = useMemo(() => {
    if (!result) return [];
    return result.primary.lines.map((line, index) => ({
      position: index + 1,
      isYang: line === "yang",
      label: result.primary.name,
    }));
  }, [result]);

  const changingLines = useMemo(() => {
    if (!result) return [];
    return result.changing.lines.map((line, index) => ({
      position: index + 1,
      isYang: line === "yang",
      label: result.changing.name,
    }));
  }, [result]);

  return (
    <Page wide className="iching-page">
      <MethodHero
        methodId="iching"
        kicker="I CHING"
        title="周易六十四卦"
        description="铜钱起卦，取本卦与变卦，对照卦辞、象辞理解事项趋势。问题宜具体，一事一占。"
      />

      <section className="method-workbench">
        <label>
          <span>所问事项</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
        </label>
        <div className="coin-cast">
          <p>第 {Math.min(castStep + 1, 6)} 爻 / 6</p>
          {coinLines.length > 0 && (
            <p className="muted coin-cast__progress">
              已得：{coinLines.map((v) => (v === 6 ? "老阳" : v === 7 ? "少阳" : v === 8 ? "少阴" : "老阴")).join(" · ")}
            </p>
          )}
          <button type="button" className="primary-btn" onClick={throwCoins} disabled={castStep >= 6}>
            🪙 掷铜钱
          </button>
          {castStep > 0 && (
            <button type="button" className="chip" onClick={reset}>
              重置
            </button>
          )}
        </div>
      </section>

      {result && (
        <section className="iching-result">
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          <header>
            <h2>
              本卦 {result.primary.name}（{result.primary.number}）→ 变卦 {result.changing.name}（{result.changing.number}）
            </h2>
            <p>{result.summary}</p>
          </header>
          <div className="iching-dual">
            <HexagramLines lines={primaryLines} title={`本卦 · ${result.primary.name}`} />
            <HexagramLines lines={changingLines} title={`变卦 · ${result.changing.name}`} />
          </div>
          <div className="reading-grid">
            <article>
              <span>卦辞</span>
              <p>{result.primary.judgment}</p>
            </article>
            <article>
              <span>象辞</span>
              <p>{result.primary.image}</p>
            </article>
            <article>
              <span>变卦卦辞</span>
              <p>{result.changing.judgment}</p>
            </article>
          </div>
        </section>
      )}
    </Page>
  );
}
