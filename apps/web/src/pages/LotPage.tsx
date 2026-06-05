import { useMemo, useState } from "react";
import { drawLot, registerLotSigns } from "@atlas/engines";
import type { LotTemple } from "@atlas/shared-types";
import { Page } from "@/components/ui/Page";
import { LOT_SIGNS, LOT_TEMPLE_LABELS } from "@/data/lotSignsLibrary";

registerLotSigns(LOT_SIGNS);

type Phase = "idle" | "shaking" | "revealed";

export function LotPage() {
  const [temple, setTemple] = useState<LotTemple>("mixed");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ReturnType<typeof drawLot> | null>(null);

  const temples: LotTemple[] = ["mixed", "guanyin", "guandi", "mazu"];

  const draw = () => {
    if (phase === "shaking") return;
    setPhase("shaking");
    setResult(null);
    window.setTimeout(() => {
      setResult(drawLot({ temple, seed: `${Date.now()}-${temple}` }, LOT_SIGNS));
      setPhase("revealed");
    }, 1200);
  };

  const categories = useMemo(() => {
    if (!result) return [];
    const map: Record<string, string> = {
      career: "事业", love: "感情", health: "健康", general: "一般",
    };
    return result.sign.categories.map((c) => map[c] ?? c);
  }, [result]);

  return (
    <Page wide className="lot-page">
      <section className="method-detail-hero">
        <p className="method-kicker">TEMPLE LOTS</p>
        <h1>抽签签诗</h1>
        <p>观音、关帝、妈祖三庙签诗，摇签得号，读诗反思。签文为倾向提示，非必然预言。</p>
      </section>

      <section className="method-workbench">
        <div className="chip-row">
          {temples.map((t) => (
            <button key={t} type="button" className={temple === t ? "chip active" : "chip"} onClick={() => setTemple(t)}>
              {LOT_TEMPLE_LABELS[t]}
            </button>
          ))}
        </div>
        <button type="button" className={`primary-btn lot-shake ${phase === "shaking" ? "lot-shake--active" : ""}`} onClick={draw} disabled={phase === "shaking"}>
          {phase === "shaking" ? "摇签中…" : "摇签"}
        </button>
      </section>

      {result && phase === "revealed" && (
        <section className="sign-scroll" aria-label="签诗结果">
          <div className="sign-scroll__head">
            <span>{LOT_TEMPLE_LABELS[result.sign.temple]}</span>
            <strong>第 {result.sign.number} 签 · {result.sign.grade}</strong>
            <em>{result.sign.title}</em>
          </div>
          <blockquote className="sign-scroll__poem">
            {result.sign.poem.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </blockquote>
          {result.sign.story && <p className="sign-scroll__story">{result.sign.story}</p>}
          <div className="sign-scroll__reading">
            <h3>白话解曰</h3>
            <p>{result.sign.plainReading}</p>
          </div>
          <div className="chip-row">
            {categories.map((c) => (
              <span key={c} className="chip">{c}</span>
            ))}
          </div>
          <ul className="sign-scroll__advice">
            {result.sign.advice.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  );
}
