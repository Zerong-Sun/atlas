import { useMemo, useState } from "react";
import { drawLenormand, type LenormandResult } from "@atlas/engines/lenormand";
import { CardSpread } from "@/components/charts/CardSpread";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildLenormandReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { getLenormandCard, lookupLenormandPair } from "@/data/lenormandLibrary";

type Spread = "three" | "five" | "nine";

const SPREADS: Record<Spread, string> = {
  three: "三牌阵",
  five: "五牌阵",
  nine: "九宫格",
};

export function LenormandPage() {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<Spread>("three");
  const [result, setResult] = useState<LenormandResult | null>(null);

  const readings = useMemo(() => {
    if (!result) return [];
    return result.cards.map((card) => ({
      card,
      meaning: getLenormandCard(card.name)?.plainMeaning ?? "",
    }));
  }, [result]);

  const copilotReport = useMemo(() => {
    if (!result) return null;
    return buildLenormandReportSnapshot(question, SPREADS[spread], result, readings);
  }, [result, question, spread, readings]);
  useRegisterMethodCopilotReport(copilotReport);

  const draw = () => {
    playMethodSound("lenormand", "action");
    try {
      setResult(
        drawLenormand({
          spread,
          question: question.trim() || undefined,
          seed: `${Date.now()}-${question}-${spread}`,
        })
      );
      playMethodSound("lenormand", "complete");
    } catch (err) {
      console.error("[lenormand]", err);
    }
  };

  return (
    <Page wide className="lenormand-page">
      <MethodHero
        methodId="lenormand"
        kicker="LENORMAND"
        title="雷诺曼牌"
        description="三十六张符号牌，以名词与相邻组合说话。中心牌定主题，旁牌定修饰。"
      />

      <section className="method-workbench">
        <label>
          <span>问题</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="输入你要问的事项…" />
        </label>
        <div className="chip-row">
          {(Object.keys(SPREADS) as Spread[]).map((s) => (
            <button
              key={s}
              type="button"
              className={spread === s ? "chip active" : "chip"}
              onClick={() => {
                setSpread(s);
                setResult(null);
              }}
            >
              {SPREADS[s]}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={draw}>
          抽取雷诺曼牌
        </button>
      </section>

      {result && (
        <section className="lenormand-result">
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          <CardSpread
            columns={spread === "nine" ? 3 : spread === "five" ? 3 : 3}
            cards={result.cards.map((c, i) => ({
              id: `${c.id}-${i}`,
              name: c.name,
              position: c.position,
              highlight: c.name === result.centerTheme,
            }))}
          />
          {result.centerTheme && <p className="muted">中心主题：{result.centerTheme}</p>}
          <div className="reading-grid">
            {readings.map(({ card, meaning }) => (
              <article key={`${card.id}-${card.position}`}>
                <span>{card.position}</span>
                <strong>{card.name}</strong>
                <p>{meaning}</p>
                {card.keywords.length > 0 && (
                  <p className="muted">{card.keywords.join(" · ")}</p>
                )}
              </article>
            ))}
          </div>
          {result.pairs.length > 0 && (
            <div className="combo-panel">
              <h3>组合语法</h3>
              {result.pairs.map((p) => (
                <p key={`${p.cardA}-${p.cardB}`}>
                  {p.cardA} + {p.cardB}：{p.reading || lookupLenormandPair(p.cardA, p.cardB)}
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </Page>
  );
}
