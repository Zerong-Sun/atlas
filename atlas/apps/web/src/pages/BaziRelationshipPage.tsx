import { useCallback, useMemo, useState } from "react";
import {
  computeBaziCompatibility,
  type BaziCompatibilityResult,
  type RelationshipContext,
} from "@atlas/engines/bazi";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildBaziRelationshipSnapshot } from "@/lib/methodReportSnapshot";
import {
  BAZI_LUCK_INTERACTIONS,
  BAZI_SHA_LIBRARY,
} from "@/data/baziAdvancedLibrary";

const ELEMENT_COLORS: Record<string, string> = {
  木: "#4ade80",
  火: "#f87171",
  土: "#fbbf24",
  金: "#c0c0c0",
  水: "#60a5fa",
};

const TONE_LABELS: Record<string, string> = {
  harmonious: "协调",
  conflict: "需调和",
  neutral: "平和",
  mixed: "动态",
};

const RELATIONSHIP_OPTIONS: Array<{ value: RelationshipContext; label: string }> = [
  { value: "romance", label: "伴侣" },
  { value: "friendship", label: "朋友" },
  { value: "family", label: "家人" },
  { value: "business", label: "同事/合伙人" },
  { value: "general", label: "一般关系" },
];

const REFERENCE_RULES = [
  BAZI_LUCK_INTERACTIONS.find((r) => r.id === "he-chong-original"),
  BAZI_SHA_LIBRARY.find((r) => r.id === "tao-hua"),
  BAZI_SHA_LIBRARY.find((r) => r.id === "yi-ma"),
  BAZI_SHA_LIBRARY.find((r) => r.id === "yang-ren"),
].filter(Boolean);

interface PersonForm {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
}

const emptyPerson = (): PersonForm => ({
  name: "",
  birthDate: "",
  birthTime: "",
  gender: "male",
});

function PersonFields({
  label,
  person,
  onChange,
}: {
  label: string;
  person: PersonForm;
  onChange: (next: PersonForm) => void;
}) {
  return (
    <fieldset className="bazi-relationship-person">
      <legend>{label}</legend>
      <label>
        <span>姓名</span>
        <input
          value={person.name}
          onChange={(e) => onChange({ ...person, name: e.target.value })}
          placeholder={`输入${label}姓名`}
        />
      </label>
      <label>
        <span>出生日期</span>
        <input
          type="date"
          value={person.birthDate}
          onChange={(e) => onChange({ ...person, birthDate: e.target.value })}
        />
      </label>
      <label>
        <span>出生时间</span>
        <input
          type="time"
          value={person.birthTime}
          onChange={(e) => onChange({ ...person, birthTime: e.target.value })}
        />
      </label>
      <label>
        <span>性别</span>
        <select
          value={person.gender}
          onChange={(e) => onChange({ ...person, gender: e.target.value as "male" | "female" })}
        >
          <option value="male">男</option>
          <option value="female">女</option>
        </select>
      </label>
    </fieldset>
  );
}

function MiniPillarBoard({
  title,
  result,
}: {
  title: string;
  result: BaziCompatibilityResult["personA"];
}) {
  if (!result.pillars) return null;
  return (
    <div className="bazi-relationship-mini-board">
      <h3>{title}</h3>
      <p className="bazi-relationship-mini-summary">{result.summary}</p>
      <div className="bazi-relationship-mini-pillars">
        {result.pillarList.map((pillar) => (
          <article key={pillar.key} className="bazi-relationship-mini-pillar">
            <span>{pillar.label}</span>
            <strong style={{ color: ELEMENT_COLORS[pillar.stemElement] ?? "inherit" }}>
              {pillar.value}
            </strong>
            <small>{pillar.stem}·{pillar.tenGod}</small>
          </article>
        ))}
      </div>
      <p className="bazi-relationship-mini-meta">
        日主 {result.dayMaster}（{result.dayMasterElement}）· {result.strength.level}
      </p>
    </div>
  );
}

export function BaziRelationshipPage() {
  const [personA, setPersonA] = useState<PersonForm>({ ...emptyPerson(), name: "甲" });
  const [personB, setPersonB] = useState<PersonForm>({ ...emptyPerson(), name: "乙", gender: "female" });
  const [relationshipType, setRelationshipType] = useState<RelationshipContext>("romance");
  const [hasComputed, setHasComputed] = useState(false);

  const filled = Boolean(
    personA.birthDate && personA.birthTime && personB.birthDate && personB.birthTime,
  );

  const result = useMemo<BaziCompatibilityResult | null>(() => {
    if (!filled) return null;
    try {
      return computeBaziCompatibility({
        personA: {
          name: personA.name,
          birthDate: personA.birthDate,
          birthTime: personA.birthTime,
          gender: personA.gender,
        },
        personB: {
          name: personB.name,
          birthDate: personB.birthDate,
          birthTime: personB.birthTime,
          gender: personB.gender,
        },
        relationshipType,
      });
    } catch {
      return null;
    }
  }, [filled, personA, personB, relationshipType]);

  const handleCompute = useCallback(() => {
    if (filled) setHasComputed(true);
  }, [filled]);

  const showResults = hasComputed && filled && result && !result.error;

  const copilotReport = useMemo(
    () =>
      showResults && result
        ? buildBaziRelationshipSnapshot(result, personA.name || "甲", personB.name || "乙")
        : null,
    [showResults, result, personA.name, personB.name],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="bazi-relationship-page">
      <MethodHero
        methodId="bazi-relationship"
        kicker="BAZI SYNASTRY"
        title="八字缘合"
        description="输入两人出生信息，交叉比对四柱、日支、五行与十神，观察相处模式与互动倾向。此为趋势反思，非宿命预测。"
      />

      <section className="bazi-relationship-disclaimer">
        <p>解读侧重情绪模式、沟通节奏与冲突来源，不作「注定合/不合」的绝对论断。</p>
      </section>

      <section className="bazi-steps" aria-label="缘合流程">
        <span className={filled ? "done" : ""}>录入双人资料</span>
        <span className={showResults ? "done" : ""}>交叉合盘</span>
        <span className={showResults ? "done" : ""}>互动解读</span>
      </section>

      <section className="bazi-relationship-workbench">
        <form
          className="bazi-relationship-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleCompute();
          }}
        >
          <div className="bazi-relationship-dual">
            <PersonFields label="甲" person={personA} onChange={setPersonA} />
            <PersonFields label="乙" person={personB} onChange={setPersonB} />
          </div>

          <label className="bazi-relationship-type">
            <span>关系类型</span>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value as RelationshipContext)}
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <div className="bazi-form-actions">
            <button type="submit" className="bazi-compute-btn" disabled={!filled}>
              {hasComputed ? "重新合盘" : "开始合盘"}
            </button>
          </div>
        </form>

        <div className="bazi-summary bazi-relationship-summary">
          <span>合盘状态</span>
          {showResults ? (
            <>
              <strong>{result.summary}</strong>
              <div className="bazi-relationship-tags">
                {result.highlights.positive.map((item) => (
                  <span key={item} className="bazi-relationship-tag bazi-relationship-tag--pos">
                    {item.split("：")[0]}
                  </span>
                ))}
                {result.highlights.challenges.map((item) => (
                  <span key={item} className="bazi-relationship-tag bazi-relationship-tag--chal">
                    {item.split("：")[0]}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <strong>{filled ? "资料已就绪，点击合盘" : "等待双人资料完整"}</strong>
              <p>请填写双方出生日期与时间，选择关系类型后点击「开始合盘」。</p>
            </>
          )}
        </div>
      </section>

      {showResults && (
        <>
          <MethodResultActions />
          <section className="bazi-relationship-boards">
            <MiniPillarBoard title={personA.name || "甲"} result={result.personA} />
            <MiniPillarBoard title={personB.name || "乙"} result={result.personB} />
          </section>

          <section className="bazi-relationship-dimensions" aria-label="七维度分析">
            <div className="section-heading">
              <p>DIMENSIONS</p>
              <h2>七维度互动</h2>
            </div>
            <div className="bazi-relationship-dimension-grid">
              {result.dimensions.map((dim) => (
                <article key={dim.key} className={`bazi-relationship-dimension bazi-relationship-dimension--${dim.tone}`}>
                  <header>
                    <h3>{dim.label}</h3>
                    <span>{TONE_LABELS[dim.tone] ?? dim.tone}</span>
                  </header>
                  <p>{dim.detail}</p>
                  <ul>
                    {dim.evidence.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="bazi-relationship-insights">
            <div className="section-heading">
              <p>INSIGHTS</p>
              <h2>相处解读</h2>
            </div>
            <div className="aspect-grid">
              <article className="bazi-panel">
                <span>情绪模式</span>
                <p>{result.emotionPattern}</p>
              </article>
              <article className="bazi-panel">
                <span>沟通模式</span>
                <p>{result.communicationStyle}</p>
              </article>
              <article className="bazi-panel">
                <span>长期稳定性</span>
                <p>{result.longTermStability}</p>
              </article>
              <article className="bazi-panel">
                <span>吸引力来源</span>
                <p>{result.attraction}</p>
              </article>
              <article className="bazi-panel">
                <span>冲突来源</span>
                <ul>
                  {result.conflictSources.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="bazi-panel">
                <span>现实风险</span>
                <ul>
                  {result.practicalRisks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="bazi-panel bazi-panel-full bazi-relationship-advice">
              <span>修复建议</span>
              <ul>
                {result.repairAdvice.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bazi-relationship-reference">
            <div className="section-heading">
              <p>REFERENCE</p>
              <h2>规则参考</h2>
            </div>
            <div className="classic-list">
              {REFERENCE_RULES.map((rule) => (
                <article key={rule!.id} className="classic-card">
                  <span>{rule!.name}</span>
                  <strong>{rule!.condition}</strong>
                  <p>{rule!.meaning}</p>
                  <p className="pattern-advice">{rule!.caution}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </Page>
  );
}
