import { CoinCastPanel } from "@/components/charts/CoinCastPanel";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { castIChingFromLines } from "@atlas/engines/iching";
import { HexagramLines } from "@/components/charts/HexagramLines";
import { MethodResultActions } from "@/components/MethodResultActions";
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
  yaoTexts: readonly string[];
  sourceUrl: string;
  sourceTitle: string;
  useText?: string;
};

type IChingResult = {
  primary: IChingHex;
  changing: IChingHex;
  summary: string;
  method: string;
  movingLines: number[];
  coinLines: number[];
  textNote: string;
};

export function IchingPage() {
  const [question, setQuestion] = useState("");
  const [castEpoch,setCastEpoch]=useState(0);
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [result, setResult] = useState<IChingResult | null>(null);

  const castStep = coinLines.length;

  const throwCoins = (sum: number) => {
    if (castStep >= 6) return;
    playMethodSound("iching", "action");
    const next = [...coinLines, sum];
    setCoinLines(next);
    if (next.length === 6) {
      const raw = castIChingFromLines(next) as unknown as IChingResult;
      setResult(raw);
      playMethodSound("iching", "complete");
    }
  };

  const reset = () => {
    setCastEpoch(v=>v+1);
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
      label: result.movingLines.includes(index + 1) ? "动爻" : "静爻",
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

      <aside className="method-preview-banner iching-workbench-link" role="note">
        本页采用三钱法，按实际六次投掷从下向上成卦，6 老阴、9 老阳。事件占断、纳甲世应六亲请用
        {" "}
        <Link to="/methods/liuyao">纳甲六爻</Link>
        。
        {" "}
        <Link to="/methods/iching/workbench">参考文库模板工作台</Link>
        {" "}
        仅按输入 hash 拼装象征草稿，非演卦，用于对照术语与整理思路。
      </aside>

      <section className="method-workbench">
        <label>
          <span>所问事项</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
        </label>
        <div className="coin-cast">
          <p>第 {Math.min(castStep + 1, 6)} 爻 / 6</p>
          {coinLines.length > 0 && (
            <p className="muted coin-cast__progress">
              已得：{coinLines.map((v) => (v === 6 ? "老阴" : v === 7 ? "少阳" : v === 8 ? "少阴" : "老阳")).join(" · ")}
            </p>
          )}
          <CoinCastPanel key={castEpoch} lines={coinLines} onCast={throwCoins} />
          {castStep > 0 && (
            <button type="button" className="chip" onClick={reset}>
              重置
            </button>
          )}
        </div>
      </section>

      {result && (
        <section className="iching-result">
          <MethodResultActions />
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
          <p>投掷记录（初爻 → 上爻）：{result.coinLines.join(" · ")}。{result.textNote}</p>
          <a href={result.primary.sourceUrl} target="_blank" rel="noreferrer">核对原典版本 · {result.primary.sourceTitle} ↗</a>
          <div className="reading-grid">
            <article>
              <span>卦辞 · 原典</span>
              <p>{result.primary.judgment}</p>{result.primary.useText&&<p>{result.primary.useText}（附原文，取用遵循所选流派）</p>}
            </article>
            <article>
              <span>大象 · 原典</span>
              <p>{result.primary.image}</p>
            </article>
            <article>
              <span>变卦卦辞</span>
              <p>{result.changing.judgment}</p>
            </article>
            <article><span>爻辞 · 原典（初爻至上爻）</span>{result.primary.yaoTexts.map((text,i)=><p key={i}>{result.movingLines.includes(i+1)?"● 动爻 · ":""}{text}</p>)}</article>
          </div>
        </section>
      )}
    </Page>
  );
}
