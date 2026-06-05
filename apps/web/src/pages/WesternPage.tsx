import { useMemo, useState } from "react";
import { computeWestern, type WesternResult } from "@atlas/engines";
import { NatalWheel } from "@/components/charts/NatalWheel";
import { Page } from "@/components/ui/Page";
import { getAspectReading, getHouseReading, WESTERN_PLANET_IN_SIGN } from "@/data/westernAdvancedLibrary";

export function WesternPage() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [showTransits, setShowTransits] = useState(false);
  const [computed, setComputed] = useState(false);

  const result = useMemo<WesternResult | null>(() => {
    if (!birthDate || !computed) return null;
    const r = computeWestern({
      birthDate,
      birthTime,
      timestamp: showTransits ? new Date().toISOString() : undefined,
    });
    if ("error" in r) return null;
    return r as WesternResult;
  }, [birthDate, birthTime, computed, showTransits]);

  return (
    <Page wide className="western-page">
      <section className="method-detail-hero">
        <p className="method-kicker">WESTERN ASTROLOGY</p>
        <h1>西洋占星</h1>
        <p>本命盘、Whole Sign 宫位、相位与行运推运。符号框架用于自我认识，非科学必然性。</p>
      </section>

      <section className="method-workbench">
        <label>
          <span>出生日期</span>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </label>
        <label>
          <span>出生时间</span>
          <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={showTransits} onChange={(e) => setShowTransits(e.target.checked)} />
          <span>包含当前行运与次限推运</span>
        </label>
        <button type="button" className="primary-btn" onClick={() => setComputed(true)} disabled={!birthDate}>
          生成星盘
        </button>
      </section>

      {result && (
        <section className="western-result">
          <p className="summary-line">{result.summary}</p>
          <div className="western-chart-layout">
            <NatalWheel
              ascendantLongitude={result.ascendant.longitude}
              planets={result.planetList.map((p) => ({
                label: p.label.slice(0, 1),
                longitude: p.longitude,
              }))}
            />
            <div className="western-details">
              <h3>行星</h3>
              {result.planetList.map((p) => (
                <article key={p.key}>
                  <strong>{p.label}</strong> {p.sign} {p.degree}° · {p.houseName}
                  <p>{WESTERN_PLANET_IN_SIGN[p.label] ?? p.meaning}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="reading-grid">
            <h3>宫位</h3>
            {result.houses.slice(0, 6).map((h) => (
              <article key={h.number}>
                <span>{h.name}</span>
                <strong>{h.sign}</strong>
                <p>{getHouseReading(h.number)}</p>
              </article>
            ))}
          </div>
          {result.aspects.length > 0 && (
            <div className="combo-panel">
              <h3>主要相位</h3>
              {result.aspects.map((a) => (
                <p key={`${a.planetA}-${a.planetB}`}>
                  {a.planetA} {a.aspect} {a.planetB}（容许 {a.orb}°）— {getAspectReading(a.aspect)}
                </p>
              ))}
            </div>
          )}
          {result.transits && result.transits.length > 0 && (
            <div className="combo-panel">
              <h3>当前行运</h3>
              {result.transits.map((t, i) => (
                <p key={i}>{t.reading}</p>
              ))}
            </div>
          )}
        </section>
      )}
    </Page>
  );
}
