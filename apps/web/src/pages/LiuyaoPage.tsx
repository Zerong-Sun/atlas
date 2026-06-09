import { useMemo, useState } from "react";
import { castLiuyao, type LiuyaoResult } from "@atlas/engines/liuyao";
import { HexagramLines } from "@/components/charts/HexagramLines";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildLiuyaoReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
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
    playMethodSound("liuyao", "action");
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
      playMethodSound("liuyao", "complete");
    }
  };

  const reset = () => {
    setCoinLines([]);
    setResult(null);
  };

  const copilotReport = useMemo(
    () => (result ? buildLiuyaoReportSnapshot(question, subjectType, result) : null),
    [result, question, subjectType],
  );
  useRegisterMethodCopilotReport(copilotReport);

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
      <MethodHero
        methodId="liuyao"
        kicker="LIUYAO"
        title="纳甲六爻"
        description="铜钱起卦，定世应、纳甲、六亲与用神旺衰。一事一占，先定用神再看动变。"
      />

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
          {coinLines.length > 0 && (
            <p className="muted coin-cast__progress">
              已得：{coinLines.map((v) => (v === 6 ? "老阳" : v === 7 ? "少阳" : v === 8 ? "少阴" : "老阴")).join(" · ")}
            </p>
          )}
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
          <MethodResultActions />
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
