import { useCallback, useMemo, useState } from "react";
import { computeBazi, interpretBazi, type BaziResult } from "@atlas/engines/bazi";
import type { MatchedRule } from "@atlas/shared-types";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildBaziReportSnapshot } from "@/lib/methodReportSnapshot";
import {
  BAZI_CLASSIC_CONDITION_MAP,
  BAZI_LUCK_INTERACTIONS,
  BAZI_PATTERN_DETAILS,
  BAZI_SHA_LIBRARY,
  BAZI_TEN_GOD_COMBINATIONS,
} from "@/data/baziAdvancedLibrary";

/* ── Colour maps for elements ── */
const ELEMENT_COLORS: Record<string, string> = {
  木: "#4ade80",
  火: "#f87171",
  土: "#fbbf24",
  金: "#c0c0c0",
  水: "#60a5fa",
};

const STRENGTH_COLORS: Record<string, string> = {
  身强: "var(--color-gold)",
  "中和偏强": "var(--color-gold)",
  中和: "var(--color-text-secondary)",
  "中和偏弱": "var(--color-text-muted)",
  身弱: "var(--color-text-muted)",
};

/* ── Profile type ── */
interface Profile {
  id: string;
  name: string;
  date: string;
  time: string;
  place: string;
}

/* ── Main component ── */
export function BaziPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [hasComputed, setHasComputed] = useState(false);

  const result = useMemo<BaziResult | null>(() => {
    if (!birthDate) return null;
    try {
      return computeBazi({
        birthDate,
        birthTime,
        gender,
        timestamp: new Date().toISOString(),
      });
    } catch {
      return null;
    }
  }, [birthDate, birthTime, gender]);

  const interpretation = useMemo(() => {
    if (!result || result.error) return null;
    return interpretBazi(result, { selectedYear });
  }, [result, selectedYear]);

  const selectProfile = useCallback((id: string) => {
    const profile = profiles.find((item) => item.id === id);
    if (!profile) return;
    setActiveId(id);
    setName(profile.name);
    setBirthDate(profile.date);
    setBirthTime(profile.time);
    setBirthPlace(profile.place);
  }, [profiles]);

  const saveCurrentToProfile = useCallback(() => {
    if (!activeId) return;
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeId ? { ...p, name, date: birthDate, time: birthTime, place: birthPlace } : p,
      ),
    );
  }, [activeId, name, birthDate, birthTime, birthPlace]);

  const addProfile = useCallback(() => {
    if (profiles.length >= 3) return;
    const id = `p-${Date.now()}`;
    const newProfile: Profile = { id, name: `例子${profiles.length + 1}`, date: "", time: "", place: "" };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveId(id);
    setName(newProfile.name);
    setBirthDate("");
    setBirthTime("");
    setBirthPlace("");
    setHasComputed(false);
  }, [profiles.length]);

  const removeProfile = useCallback((id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setName("");
      setBirthDate("");
      setBirthTime("");
      setBirthPlace("");
      setHasComputed(false);
    }
  }, [activeId]);

  const handleCompute = useCallback(() => {
    if (birthDate && birthTime) {
      setHasComputed(true);
      saveCurrentToProfile();
    }
  }, [birthDate, birthTime, saveCurrentToProfile]);

  const filled = Boolean(birthDate && birthTime);
  const showResults = hasComputed && filled && result && !result.error;

  const copilotReport = useMemo(
    () => (showResults && result ? buildBaziReportSnapshot(result, interpretation, name) : null),
    [showResults, result, interpretation, name],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="bazi-page">
      <MethodHero
        methodId="bazi"
        kicker="BAZI CHART"
        title="八字命盘"
        description="输入出生日期与时间，生成四柱八字、十神、藏干、五行分析、神煞、格局、大运流年与性格解读。"
      />

      {/* ── Profile strip ── */}
      <section className="bazi-profile-strip" aria-label="档案切换">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            className={profile.id === activeId ? "active" : ""}
            onClick={() => { selectProfile(profile.id); setHasComputed(false); }}
          >
            <strong>{profile.name}</strong>
            <span className="bazi-profile-remove" onClick={(e) => { e.stopPropagation(); removeProfile(profile.id); }}>
              &times;
            </span>
          </button>
        ))}
        {profiles.length < 3 && (
          <button type="button" className="bazi-add-profile" onClick={addProfile}>
            <span>新增</span>
            <strong>+</strong>
          </button>
        )}
      </section>

      {/* ── Steps ── */}
      <section className="bazi-steps" aria-label="八字测算流程">
        <span className={filled ? "done" : ""}>录入资料</span>
        <span className={showResults ? "done" : ""}>生成四柱</span>
        <span className={showResults ? "done" : ""}>解读命盘</span>
        <span className={showResults ? "done" : ""}>运势分析</span>
      </section>

      {/* ── Input form + summary ── */}
      <section className="bazi-workbench">
        <form className="bazi-form" onSubmit={(e) => { e.preventDefault(); handleCompute(); }}>
          <label>
            <span>姓名</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="输入姓名" />
          </label>
          <label>
            <span>出生日期</span>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </label>
          <label>
            <span>出生时间</span>
            <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
          </label>
          <label>
            <span>性别</span>
            <select value={gender} onChange={(e) => setGender(e.target.value as "male" | "female")}>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </label>
          <label>
            <span>出生地点</span>
            <input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} placeholder="输入出生地" />
          </label>
          <div className="bazi-form-actions">
            <button type="submit" className="bazi-compute-btn" disabled={!filled}>
              {hasComputed ? "重新排盘" : "开始排盘"}
            </button>
          </div>
        </form>

        <div className="bazi-summary">
          <span>命盘状态</span>
          {showResults ? (
            <>
              <strong>{result.summary}</strong>
              <p>农历：{result.lunarDate}　生肖：{result.zodiac}</p>
              <p>格局：{result.pattern.name}　日主：{result.strength.level}（得分 {result.strength.score}）</p>
            </>
          ) : (
            <>
              <strong>{filled ? "资料已就绪，点击排盘" : "等待资料完整"}</strong>
              <p>请填写完整的出生日期和出生时间，然后点击"开始排盘"生成八字命盘。</p>
            </>
          )}
        </div>
      </section>

      {/* ── Results: only shown after compute ── */}
      {showResults && (
        <>
          <div className="method-result-actions">
            <MethodCopilotTrigger variant="analyze" />
          </div>
          {/* ── Four Pillars ── */}
          <section className="pillar-board" aria-label="四柱">
            {result.pillarList.map((pillar) => (
              <article className="pillar-card" key={pillar.key}>
                <span>{pillar.label}</span>
                <strong>{pillar.value}</strong>
                <dl>
                  <div><dt>天干</dt><dd>{pillar.stem}（{pillar.tenGod}）</dd></div>
                  <div><dt>地支</dt><dd>{pillar.branch}</dd></div>
                  <div><dt>藏干</dt><dd>{pillar.hiddenStems.map((h) => `${h.stem}·${h.tenGod}`).join("  ")}</dd></div>
                  <div><dt>五行</dt><dd>{pillar.stemElement}/{pillar.branchElement}</dd></div>
                </dl>
              </article>
            ))}
          </section>

          {/* ── Pattern & Strength ── */}
          <section className="bazi-two-col">
            <div className="bazi-panel">
              <div className="section-heading">
                <p>PATTERN</p>
                <h2>格局</h2>
              </div>
              <div className="bazi-panel-content">
                <strong className="pattern-name">{result.pattern.name}</strong>
                <p>{result.pattern.description}</p>
                <p className="pattern-advice">{result.pattern.advice}</p>
              </div>
            </div>
            <div className="bazi-panel">
              <div className="section-heading">
                <p>STRENGTH</p>
                <h2>日主旺衰</h2>
              </div>
              <div className="bazi-panel-content">
                <strong style={{ color: STRENGTH_COLORS[result.strength.level] }}>
                  {result.strength.level}（{result.strength.score >= 0 ? "+" : ""}{result.strength.score}）
                </strong>
                <div className="strength-factors">
                  {result.strength.factors.map((f, i) => (
                    <p key={i}>{f}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Five Elements ── */}
          <section className="bazi-panel bazi-panel-full">
            <div className="section-heading">
              <p>FIVE PHASES</p>
              <h2>五行分布</h2>
            </div>
            <div className="element-bars">
              {result.elementAnalysis.map((item) => (
                <div className="element-row" key={item.element}>
                  <span style={{ color: ELEMENT_COLORS[item.element] }}>{item.element}</span>
                  <i style={{ width: `${Math.max(6, item.percentage)}%`, background: ELEMENT_COLORS[item.element] }} />
                  <strong>{item.role}</strong>
                  <span className="element-count">{item.count}个（{item.percentage}%）</span>
                </div>
              ))}
            </div>
            <div className="element-interpretations">
              {result.elementAnalysis
                .filter((item) => item.status === "excess" || item.status === "absent")
                .map((item) => (
                  <div key={item.element} className="element-note" style={{ borderLeftColor: ELEMENT_COLORS[item.element] }}>
                    <span>{item.element} — {item.status === "excess" ? "偏旺" : "缺失"}</span>
                    <p>{item.interpretation}</p>
                  </div>
                ))}
            </div>
            {result.climate.description && (
              <div className="climate-note">
                <span>调候</span>
                <p>{result.climate.description}</p>
              </div>
            )}
          </section>

          {/* ── Combinations ── */}
          {result.combinations.length > 0 && (
            <section className="bazi-panel bazi-panel-full">
              <div className="section-heading">
                <p>COMBINATIONS</p>
                <h2>合冲</h2>
              </div>
              <div className="combo-list">
                {result.combinations.map((c, i) => (
                  <div className="combo-item" key={i}>{c}</div>
                ))}
              </div>
            </section>
          )}

          {/* ── Deities (神煞) ── */}
          {result.deities.length > 0 && (
            <section className="bazi-panel bazi-panel-full">
              <div className="section-heading">
                <p>DEITIES</p>
                <h2>神煞</h2>
              </div>
              <div className="deity-grid">
                {result.deities.map((d) => (
                  <article className={`deity-card deity-${d.type}`} key={d.name}>
                    <div className="deity-header">
                      <strong>{d.name}</strong>
                      <span>{d.type}</span>
                    </div>
                    <p>{d.meaning}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── Personality ── */}
          <section className="bazi-panel bazi-panel-full">
            <div className="section-heading">
              <p>PERSONALITY</p>
              <h2>性格解读</h2>
            </div>
            <div className="personality-archetype">{result.personality.archetype}</div>
            <div className="personality-grid">
              <div>
                <span>特质</span>
                {result.personality.traits.map((t, i) => <p key={i}>{t}</p>)}
              </div>
              <div>
                <span>优势</span>
                {result.personality.strengths.map((s, i) => <p key={i}>{s}</p>)}
              </div>
              <div>
                <span>注意</span>
                {result.personality.weaknesses.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            </div>
            <div className="personality-advice">
              <span>建议</span>
              <p>{result.personality.advice}</p>
            </div>
          </section>

          {/* ── Life Aspects ── */}
          <section className="bazi-panel bazi-panel-full">
            <div className="section-heading">
              <p>LIFE ASPECTS</p>
              <h2>人生分析</h2>
            </div>
            <div className="aspect-grid">
              {[
                { label: "事业", content: result.aspects.career },
                { label: "财运", content: result.aspects.wealth },
                { label: "感情", content: result.aspects.relationship },
                { label: "健康", content: result.aspects.health },
              ].map((a) => (
                <article className="aspect-card" key={a.label}>
                  <span>{a.label}</span>
                  <p>{a.content}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── Major Luck Cycles (大运) ── */}
          <section className="bazi-panel bazi-panel-full">
            <div className="section-heading">
              <p>MAJOR LUCK CYCLES</p>
              <h2>大运</h2>
            </div>
            <div className="luck-cycle-grid">
              {result.majorLuck.map((cycle) => (
                <article className="luck-card" key={cycle.startAge}>
                  <div className="luck-card-header">
                    <span>{cycle.startAge}-{cycle.endAge}岁</span>
                    <strong>{cycle.pillar}</strong>
                  </div>
                  <dl>
                    <div><dt>天干</dt><dd>{cycle.stem}（{cycle.tenGod}）</dd></div>
                    <div><dt>地支</dt><dd>{cycle.branch}</dd></div>
                    <div><dt>五行</dt><dd>{cycle.stemElement}/{cycle.branchElement}</dd></div>
                  </dl>
                  <p>{cycle.summary}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── Annual Fortune (流年) ── */}
          <section className="annual-section">
            <div className="section-heading">
              <p>ANNUAL FLOW</p>
              <h2>流年提示</h2>
            </div>
            <div className="annual-list">
              {result.annualFortunes.map((item) => (
                <button
                  type="button"
                  className={item.year === selectedYear ? "annual-card current" : "annual-card"}
                  key={item.year}
                  onClick={() => setSelectedYear(item.year)}
                >
                  <span>{item.year}</span>
                  <strong>{item.pillar} · {item.tenGod}</strong>
                  <p>{item.note}</p>
                </button>
              ))}
            </div>
          </section>

          {/* ── Classics (古文) ── */}
          {result.classics.length > 0 && (
            <section className="classic-section">
              <div className="section-heading">
                <p>CLASSICS</p>
                <h2>古文释义</h2>
              </div>
              <div className="classic-list">
                {result.classics.map((item) => (
                  <article className="classic-card" key={item.id}>
                    <span>{item.title} · {item.chapter}</span>
                    <blockquote>{item.fullText}</blockquote>
                    <p>{item.analysis}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {interpretation && (
            <>
              <section className="bazi-panel bazi-panel-full">
                <div className="section-heading">
                  <p>MATCHED RULES</p>
                  <h2>命中十神组合 · {selectedYear}岁运</h2>
                </div>
                <p className="muted">{interpretation.summary}</p>
                <div className="aspect-grid">
                  {interpretation.matchedCombos.map((rule: MatchedRule) => (
                    <article className="aspect-card" key={rule.id}>
                      <span>{rule.name}</span>
                      <p>{rule.meaning}</p>
                      {rule.evidence.map((e: MatchedRule["evidence"][number]) => <em key={e.detail}>{e.label}: {e.detail}</em>)}
                    </article>
                  ))}
                </div>
                <div className="aspect-grid">
                  {interpretation.matchedPatterns.map((rule: MatchedRule) => (
                    <article className="aspect-card" key={rule.id}>
                      <span>{rule.name}</span>
                      <p>{rule.meaning}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="bazi-panel bazi-panel-full">
                <div className="section-heading">
                  <p>ACTIVE SHA</p>
                  <h2>命局神煞</h2>
                </div>
                <div className="deity-grid">
                  {interpretation.activeDeities.map((rule: MatchedRule) => (
                    <article className="deity-card deity-neutral" key={rule.id}>
                      <div className="deity-header">
                        <strong>{rule.name}</strong>
                        <span>{rule.level}</span>
                      </div>
                      <p>{rule.meaning}</p>
                    </article>
                  ))}
                </div>
                <div className="aspect-grid">
                  {interpretation.luckInteractions.map((rule: MatchedRule) => (
                    <article className="aspect-card" key={rule.id}>
                      <span>{rule.name}</span>
                      <p>{rule.meaning}</p>
                      {rule.evidence.map((e: MatchedRule["evidence"][number]) => <em key={e.detail}>{e.detail}</em>)}
                    </article>
                  ))}
                </div>
              </section>

              <section className="classic-section">
                <div className="section-heading">
                  <p>CLASSIC HITS</p>
                  <h2>古籍条文命中</h2>
                </div>
                <div className="classic-list">
                  {interpretation.classicHits.map((rule: MatchedRule) => (
                    <article className="classic-card" key={rule.id}>
                      <span>{rule.name}</span>
                      <p>{rule.meaning}</p>
                      {rule.evidence[0] && <blockquote>{rule.evidence[0].detail}</blockquote>}
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          <section className="bazi-panel bazi-panel-full">
            <div className="section-heading">
              <p>REFERENCE</p>
              <h2>专库参考（全量）</h2>
            </div>
            <div className="aspect-grid">
              {BAZI_TEN_GOD_COMBINATIONS.slice(0, 4).map((rule) => (
                <article className="aspect-card" key={rule.id}>
                  <span>{rule.name}</span>
                  <p>{rule.condition}</p>
                  <em>{rule.meaning}</em>
                </article>
              ))}
            </div>
            <div className="aspect-grid">
              {BAZI_PATTERN_DETAILS.slice(0, 4).map((rule) => (
                <article className="aspect-card" key={rule.id}>
                  <span>{rule.name}</span>
                  <p>{rule.use}</p>
                  <em>{rule.caution}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="bazi-panel bazi-panel-full">
            <div className="section-heading">
              <p>SHA & LUCK</p>
              <h2>神煞库与岁运交互</h2>
            </div>
            <div className="deity-grid">
              {BAZI_SHA_LIBRARY.map((rule) => (
                <article className="deity-card deity-neutral" key={rule.id}>
                  <div className="deity-header">
                    <strong>{rule.name}</strong>
                    <span>{rule.use}</span>
                  </div>
                  <p>{rule.condition}</p>
                </article>
              ))}
            </div>
            <div className="aspect-grid">
              {BAZI_LUCK_INTERACTIONS.map((rule) => (
                <article className="aspect-card" key={rule.id}>
                  <span>{rule.name}</span>
                  <p>{rule.meaning}</p>
                  <em>{rule.caution}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="classic-section">
            <div className="section-heading">
              <p>CLASSIC CONDITIONS</p>
              <h2>古籍条文条件映射</h2>
            </div>
            <div className="classic-list">
              {BAZI_CLASSIC_CONDITION_MAP.map((rule) => (
                <article className="classic-card" key={rule.id}>
                  <span>{rule.name}</span>
                  <blockquote>{rule.condition}</blockquote>
                  <p>{rule.use}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </Page>
  );
}
