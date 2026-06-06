import { useMemo, useState } from "react";
import { computeFengshui, type FengshuiResult } from "@atlas/engines";
import { CompassRose } from "@/components/charts/CompassRose";
import { PalaceGrid } from "@/components/charts/PalaceGrid";
import { Page } from "@/components/ui/Page";
import { FENGSHUI_STARS } from "@/data/fengshuiLibrary";

export function FengshuiPage() {
  const [sittingDegree, setSittingDegree] = useState(0);
  const [birthYear, setBirthYear] = useState("");
  const [computed, setComputed] = useState(false);

  const result = useMemo<FengshuiResult | null>(() => {
    if (!computed) return null;
    return computeFengshui({
      sittingDegree,
      birthYear: birthYear ? Number(birthYear) : undefined,
    });
  }, [sittingDegree, birthYear, computed]);

  const gridCells = useMemo(() => {
    if (!result) return [];
    const order = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    return order.map((pos) => {
      const p = result.palaces.find((x) => x.position === pos);
      return {
        key: String(pos),
        label: p?.direction ?? "",
        sublabel: p ? `${p.mountainStar}/${p.facingStar}` : "",
        highlight: p?.annualStar === "五黄" || p?.annualStar === "二黑",
        children: p ? <small>{p.annualStar} 流年</small> : null,
      };
    });
  }, [result]);

  return (
    <Page wide className="fengshui-page">
      <section className="method-detail-hero">
        <p className="method-kicker">FENG SHUI</p>
        <h1>风水罗盘</h1>
        <p>坐向、玄空九宫飞星与流年重点。解读为空间象征参考，重大决策请结合建筑规范。</p>
      </section>

      <section className="method-workbench fengshui-workbench">
        <CompassRose
          degree={sittingDegree}
          onDegreeChange={(deg) => {
            setSittingDegree(deg);
            setComputed(false);
          }}
        />
        <label>
          <span>出生年（可选，命卦）</span>
          <input
            type="number"
            min={1920}
            max={2030}
            value={birthYear}
            onChange={(e) => {
              setBirthYear(e.target.value);
              setComputed(false);
            }}
            placeholder="1990"
          />
        </label>
        <button type="button" className="primary-btn" onClick={() => setComputed(true)}>
          排飞星盘
        </button>
      </section>

      {result && (
        <section className="fengshui-result">
          <p className="summary-line">{result.summary}</p>
          <p className="muted">坐向 {result.sittingMountain} · 向 {result.facingMountain} · 第 {result.period} 运</p>
          {result.mingGua && (
            <p className="muted">命卦 {result.mingGua.gua} · {result.mingGua.group}</p>
          )}
          <PalaceGrid cells={gridCells} columns={3} ariaLabel="九宫飞星盘" />
          <div className="reading-grid">
            {result.palaces.map((p) => (
              <article key={p.position}>
                <span>{p.direction}</span>
                <strong>{p.combined}</strong>
                <p>{FENGSHUI_STARS[p.mountainStar]?.reading ?? "结合山向与流年综合判断。"}</p>
              </article>
            ))}
          </div>
          <ul className="sign-scroll__advice">
            {result.advice.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      )}
    </Page>
  );
}
