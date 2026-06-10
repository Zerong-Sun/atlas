import { useMemo, useState } from "react";
import type { VedicResult } from "@atlas/engines/vedic";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildVedicReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";
import { computeVedicAsync } from "@/lib/vedicEphemeris";

const CITY_PRESETS = [
  { label: "北京", lat: 39.9042, lng: 116.4074, tz: 8 },
  { label: "上海", lat: 31.2304, lng: 121.4737, tz: 8 },
  { label: "台北", lat: 25.033, lng: 121.5654, tz: 8 },
  { label: "孟买", lat: 19.076, lng: 72.8777, tz: 5.5 },
  { label: "伦敦", lat: 51.5074, lng: -0.1278, tz: 0 },
  { label: "纽约", lat: 40.7128, lng: -74.006, tz: -5 },
] as const;

export function VedicPage() {
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthPlace, setBirthPlace] = useState("北京");
  const [birthLat, setBirthLat] = useState(39.9042);
  const [birthLng, setBirthLng] = useState(116.4074);
  const [timezone, setTimezone] = useState(8);
  const [result, setResult] = useState<VedicResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: (typeof CITY_PRESETS)[number]) => {
    setBirthPlace(preset.label);
    setBirthLat(preset.lat);
    setBirthLng(preset.lng);
    setTimezone(preset.tz);
    setResult(null);
  };

  const compute = async () => {
    setLoading(true);
    setError(null);
    playMethodSound("vedic", "action");
    try {
      const next = await computeVedicAsync({
        birthDate,
        birthTime,
        birthPlace,
        birthLat,
        birthLng,
        timezone,
      });
      setResult(next);
      playMethodSound("vedic", "complete");
    } catch {
      setError("星历计算失败，请检查出生日期、时间与地点后重试。");
    } finally {
      setLoading(false);
    }
  };

  const copilotReport = useMemo(() => (result ? buildVedicReportSnapshot(result) : null), [result]);
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="vedic-page">
      <MethodHero
        methodId="vedic"
        kicker="VEDIC ASTROLOGY"
        title="印度占星"
        description="吠陀星盘：Lahiri 恒星黄道、Whole Sign 十二宫、九星与 Vimshottari 大运。"
      />

      <aside className="method-preview-banner" role="note">
        含 Whole Sign 宫位与 Vimshottari 大运；不含分盘 Navamsa、Drishti 与行运。出生时间为出生地当地时区。
      </aside>

      <section className="method-workbench">
        <label>
          <span>出生日期</span>
          <input type="date" value={birthDate} onChange={(e) => { setBirthDate(e.target.value); setResult(null); }} />
        </label>
        <label>
          <span>出生时间</span>
          <input type="time" value={birthTime} onChange={(e) => { setBirthTime(e.target.value); setResult(null); }} />
        </label>
        <label>
          <span>出生地</span>
          <input
            type="text"
            value={birthPlace}
            onChange={(e) => { setBirthPlace(e.target.value); setResult(null); }}
            placeholder="城市或地点"
          />
        </label>
        <div className="chip-row" role="group" aria-label="城市预设">
          {CITY_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={birthPlace === preset.label ? "chip active" : "chip"}
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="vedic-coords">
          <label>
            <span>纬度</span>
            <input
              type="number"
              step="0.0001"
              value={birthLat}
              onChange={(e) => { setBirthLat(Number(e.target.value)); setResult(null); }}
            />
          </label>
          <label>
            <span>经度</span>
            <input
              type="number"
              step="0.0001"
              value={birthLng}
              onChange={(e) => { setBirthLng(Number(e.target.value)); setResult(null); }}
            />
          </label>
          <label>
            <span>时区（相对 UTC，小时）</span>
            <input
              type="number"
              step="0.5"
              value={timezone}
              onChange={(e) => { setTimezone(Number(e.target.value)); setResult(null); }}
            />
          </label>
        </div>
        <button type="button" className="primary-btn" onClick={compute} disabled={loading}>
          {loading ? "排盘中…" : result ? "重新排盘" : "生成吠陀星盘"}
        </button>
        {error && <p className="form-error">{error}</p>}
      </section>

      {result && (
        <section className="vedic-result">
          <MethodResultActions />
          <div className="reading-grid">
            <article>
              <span>月亮星座</span>
              <strong>{result.moonSign}</strong>
            </article>
            <article>
              <span>月宿</span>
              <strong>{result.moonNakshatra.label}</strong>
              <p>第 {result.moonNakshatra.pada} 足</p>
            </article>
            <article>
              <span>上升 Lagna</span>
              <strong>{result.ascendantSign}</strong>
              <p>{result.ascendantDegree}°</p>
            </article>
            <article>
              <span>大运 Mahadasha</span>
              <strong>{result.mahadashaLabel}</strong>
              <p>余约 {result.mahadashaRemainingYears} 年</p>
            </article>
            <article>
              <span>小运 Antardasha</span>
              <strong>{result.antardashaLabel}</strong>
              <p>余约 {result.antardashaRemainingYears} 年</p>
            </article>
          </div>

          <h3>九星落宫</h3>
          <div className="vedic-graha-table">
            <table>
              <thead>
                <tr>
                  <th>星体</th>
                  <th>星座</th>
                  <th>度数</th>
                  <th>宫位</th>
                </tr>
              </thead>
              <tbody>
                {result.grahas.map((g) => (
                  <tr key={g.key}>
                    <td>{g.label}</td>
                    <td>{g.sign}</td>
                    <td>{g.degree}°</td>
                    <td>{g.houseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Whole Sign 十二宫</h3>
          <div className="reading-grid">
            {result.houses.map((h) => (
              <article key={h.number}>
                <span>{h.name} · {h.sign}</span>
                <strong>{h.occupants.length ? h.occupants.join("、") : "—"}</strong>
              </article>
            ))}
          </div>

          <p className="muted">{result.note}</p>
          <p className="muted">{result.summary}</p>
        </section>
      )}

      <MethodLibraryFooter methodId="vedic" />
    </Page>
  );
}
