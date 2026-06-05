import { useMemo, useState } from "react";
import { castLiuyao, type LiuyaoResult } from "@atlas/engines";
import { HexagramLines } from "@/components/charts/HexagramLines";
import { Page } from "@/components/ui/Page";
import { LIUYAO_RELATIVES, LIUYAO_STRENGTH, LIUYAO_USEFUL_GOD } from "@/data/liuyaoLibrary";

type CastStep = number;

export function LiuyaoPage() {
  const [question, setQuestion] = useState("");
  const [subjectType, setSubjectType] = useState("事业申请");
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [result, setResult] = useState<LiuyaoResult | null>(null);

  const castStep = coinLines.length as CastStep;

  const throwCoins = () => {
    if (castStep >= 6) return;
    const rng = Math.random();
    const sum = Math.floor(rng * 4) + 6;
    const next = [...coinLines, sum];
    setCoinLines(next);
    if (next.length === 6) {
      const categoryMap: Record<string, "career" | "love" | "finance" | "health" | "general"> = {
        事业申请: "career", 合作关系: "love", 财务得失: "finance", 失物寻人: "general", 健康状态: "health",
      };
      setResult(
        castLiuyao({
          lines: next,
          questionCategory: categoryMap[subjectType] ?? "general",
          seed: `${Date.now()}-${question}`,
        })
      );
    }
  };

  const reset = () => {
    setCoinLines([]);
    setResult(null);
  };

  const hexLines = useMemo(() => {
    if (!result) return [];
    return result.lines.map((l) => ({
      position: l.position,
      isYang: l.isYang,
      isMoving: l.isMoving,
      label: `${l.branch}${l.relative}${l.isWorld ? "·世" : ""}${l.isResponse ? "·应" : ""}`,
      meta: `${l.strength} · ${LIUYAO_STRENGTH[l.strength] ?? ""}`,
    }));
  }, [result]);

  return (
    <Page wide className="liuyao-page">
      <section className="method-detail-hero">
        <p className="method-kicker">LIUYAO</p>
        <h1>纳甲六爻</h1>
        <p>铜钱起卦，定世应、纳甲、六亲与用神旺衰。一事一占，先定用神再看动变。</p>
      </section>

      <section className="method-workbench">
        <label>
          <span>所问事项</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
        </label>
        <label>
          <span>事项类型</span>
          <select value={subjectType} onChange={(e) => setSubjectType(e.target.value)}>
            {Object.keys(LIUYAO_USEFUL_GOD).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <p className="muted">{LIUYAO_USEFUL_GOD[subjectType]?.note}</p>
        <div className="coin-cast">
          <p>第 {Math.min(castStep + 1, 6)} 爻 / 6（点击铜钱起卦）</p>
          <button type="button" className="primary-btn" onClick={throwCoins} disabled={castStep >= 6}>
            🪙 掷铜钱
          </button>
          {castStep > 0 && (
            <button type="button" className="chip" onClick={reset}>重置</button>
          )}
        </div>
      </section>

      {result && (
        <section className="liuyao-result">
          <header>
            <h2>{result.primaryName}卦 → {result.changedName}卦</h2>
            <p>{result.palace}宫 · 世{result.worldLine} 应{result.responseLine} · 用神{result.usefulGod}</p>
            <p className="muted">日柱 {result.dayStem}{result.dayBranch} · 月建 {result.monthBranch}</p>
          </header>
          <HexagramLines lines={hexLines} title="六爻排盘" />
          <div className="reading-grid">
            {result.lines.map((l) => (
              <article key={l.position} className={l.position === result.usefulGodLine ? "hi" : ""}>
                <span>{l.position}爻 {l.branch}{l.stem}</span>
                <strong>{l.relative}{l.isWorld ? "·世" : ""}{l.isResponse ? "·应" : ""}</strong>
                <p>{LIUYAO_RELATIVES[l.relative]} · {l.strength}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}
