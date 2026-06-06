import { useMemo, useState } from "react";
import { computeZiwei, type ZiweiResult } from "@atlas/engines";
import { PalaceGrid } from "@/components/charts/PalaceGrid";
import { Page } from "@/components/ui/Page";
import { getPalaceReading, getStarReading, ZIWEI_MUTAGEN } from "@/data/ziweiLibrary";

export function ZiweiPage() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null);
  const [computed, setComputed] = useState(false);

  const result = useMemo<ZiweiResult | null>(() => {
    if (!birthDate || !computed) return null;
    return computeZiwei({ birthDate, birthTime, gender });
  }, [birthDate, birthTime, gender, computed]);

  const gridCells = useMemo(() => {
    if (!result?.palaces.length) return [];
    return result.palaces.map((p) => ({
      key: String(p.index),
      label: p.name,
      sublabel: p.majorStars.map((s) => s.name).join(" ") || "空宫",
      highlight: p.isSoul || p.isBody,
      children: (
        <>
          {p.mutagens.map((m) => (
            <em key={m.star}>{m.star}化{m.type}</em>
          ))}
          {p.isSoul && <small>命宫</small>}
          {p.isBody && <small>身宫</small>}
        </>
      ),
    }));
  }, [result]);

  const activePalace = selectedPalace != null ? result?.palaces[selectedPalace] : result?.palaces.find((p) => p.isSoul);

  return (
    <Page wide className="ziwei-page">
      <section className="method-detail-hero">
        <p className="method-kicker">ZI WEI DOU SHU</p>
        <h1>紫微斗数</h1>
        <p>十二宫、主星辅星、四化与大限流年。三合派排盘，供趋势反思而非宿命断言。</p>
      </section>

      <section className="method-workbench">
        <label>
          <span>出生日期</span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              setComputed(false);
              setSelectedPalace(null);
            }}
          />
        </label>
        <label>
          <span>出生时辰</span>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => {
              setBirthTime(e.target.value);
              setComputed(false);
              setSelectedPalace(null);
            }}
          />
        </label>
        <label>
          <span>性别</span>
          <select
            value={gender}
            onChange={(e) => {
              setGender(e.target.value as "male" | "female");
              setComputed(false);
              setSelectedPalace(null);
            }}
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </label>
        <button type="button" className="primary-btn" onClick={() => setComputed(true)} disabled={!birthDate}>
          排紫微命盘
        </button>
      </section>

      {result && result.palaces.length > 0 && (
        <section className="ziwei-result">
          <p className="summary-line">{result.summary}</p>
          <p className="muted">{result.lunarDate} · {result.chineseDate} · {result.fiveElementsClass}</p>
          <PalaceGrid
            cells={gridCells}
            columns={4}
            ariaLabel="紫微十二宫命盘"
            className="ziwei-grid"
            selectedKey={selectedPalace != null ? String(selectedPalace) : undefined}
            onCellClick={(key) => setSelectedPalace(Number(key))}
          />
          {activePalace && (
            <aside className="ziwei-sidebar">
              <h3>{activePalace.name}</h3>
              <p>{getPalaceReading(activePalace.name)}</p>
              <ul>
                {activePalace.majorStars.map((s) => (
                  <li key={s.name}>
                    <strong>{s.name}</strong>
                    {s.mutagen && <em> 化{s.mutagen}</em>}
                    <p>{getStarReading(s.name)}</p>
                    {s.mutagen && <small>{ZIWEI_MUTAGEN[s.mutagen]}</small>}
                  </li>
                ))}
              </ul>
              {activePalace.minorStars.length > 0 && (
                <p className="muted">辅星：{activePalace.minorStars.join("、")}</p>
              )}
            </aside>
          )}
          {result.decadals.length > 0 && (
            <div className="combo-panel">
              <h3>大限</h3>
              {result.decadals.slice(0, 8).map((d) => (
                <p key={d.index}>
                  {d.range[0]}-{d.range[1]}岁 · {d.palace}（{d.heavenlyStem}{d.earthlyBranch}）
                </p>
              ))}
            </div>
          )}
        </section>
      )}
    </Page>
  );
}
