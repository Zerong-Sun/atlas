import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  CULTURAL_METHOD_GROUPS,
  DIVINATION_METHODS,
  getMethodCognition,
  getLocalizedMethodName,
  type CausalityModel,
  type MethodStatus,
  type QuestionDomain,
  type UncertaintyMode,
} from "@/data/divinationMethods";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";
import { playMethodSound, unlockAudio } from "@/lib/methodSounds";
import { Page } from "@/components/ui/Page";
import { getCulturalPrefs } from "@/lib/culturalPrefs";

type StatusFilter = "all" | MethodStatus;
type GroupMode = "all" | "civilization" | "causality" | "uncertainty" | "domain";

const STATUS_LABEL: Record<MethodStatus, string> = {
  ready: "可用",
  preview: "参考预览",
  planned: "待开发",
};

export function MethodsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [groupMode, setGroupMode] = useState<GroupMode>("all");
  const culturalPrefs = useMemo(() => getCulturalPrefs(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DIVINATION_METHODS.filter((method) => {
      const matchesStatus = status === "all" || method.status === status;
      const searchable = [
        method.title,
        method.subtitle,
        method.tradition,
        method.civilization,
        method.questionStyle,
        getMethodCognition(method.id)?.questionGrammar,
        getMethodCognition(method.id)?.causalityModel,
        getMethodCognition(method.id)?.uncertaintyMode,
        ...(getMethodCognition(method.id)?.bestFor ?? []),
        ...method.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!q || searchable.includes(q));
    });
  }, [query, status]);

  const readyCount = DIVINATION_METHODS.filter((method) => method.status === "ready").length;
  const previewCount = DIVINATION_METHODS.filter((method) => method.status === "preview").length;
  const plannedCount = DIVINATION_METHODS.filter((method) => method.status === "planned").length;
  const grouped = useMemo(() => buildMethodGroups(filtered, groupMode), [filtered, groupMode]);

  return (
    <Page wide className="methods-page">
      <section className="method-directory-hero">
        <p className="method-kicker">SYMBOL SYSTEMS</p>
        <h1>象征系统图书馆</h1>
        <p>
          这里不是工具货架，而是不同文明处理不确定性的索引：它们如何提问、如何理解因果、如何给出边界。
        </p>
      </section>

      <section className="method-control-panel" aria-label="象征系统筛选">
        <div className="method-stats" aria-label="象征系统开发状态">
          <Stat label="可用" value={readyCount} />
          <Stat label="参考预览" value={previewCount} />
          <Stat label="待开发" value={plannedCount} />
        </div>
        <div className="method-filters">
          <label className="method-search">
            <span>搜索系统</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入八字、时机、心理、天体周期、礼俗确认..."
            />
          </label>
          <div className="method-status-tabs" role="tablist" aria-label="状态筛选">
            <FilterButton current={status} value="all" onChange={setStatus}>全部</FilterButton>
            <FilterButton current={status} value="ready" onChange={setStatus}>可用</FilterButton>
            <FilterButton current={status} value="preview" onChange={setStatus}>参考预览</FilterButton>
            <FilterButton current={status} value="planned" onChange={setStatus}>待开发</FilterButton>
          </div>
          <div className="method-status-tabs" role="tablist" aria-label="分组方式">
            <GroupButton current={groupMode} value="all" onChange={setGroupMode}>全部</GroupButton>
            <GroupButton current={groupMode} value="civilization" onChange={setGroupMode}>文明</GroupButton>
            <GroupButton current={groupMode} value="causality" onChange={setGroupMode}>因果</GroupButton>
            <GroupButton current={groupMode} value="uncertainty" onChange={setGroupMode}>不确定性</GroupButton>
            <GroupButton current={groupMode} value="domain" onChange={setGroupMode}>问题类型</GroupButton>
          </div>
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-results">
        <div className="section-heading">
          <p>{groupMode === "all" ? (status === "all" ? "ALL METHODS" : status.toUpperCase()) : "GROUPED VIEW"}</p>
          <h2 id="method-results">{filtered.length} 种象征系统</h2>
        </div>
        {grouped.map((group) => (
          <div key={group.id} className="method-group">
            {groupMode !== "all" && (
              <div className="method-group__heading">
                <div>
                  <p>{group.kicker}</p>
                  <h3>{group.title}</h3>
                </div>
                {group.description && <span>{group.description}</span>}
              </div>
            )}
            <div className="method-grid">
              {group.methods.map((method, index) => (
                <MethodCard
                  key={method.id}
                  index={index}
                  locale={culturalPrefs.locale}
                  compact={method.status === "planned"}
                  {...method}
                />
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="empty-note">没有匹配的系统。换一个关键词试试。</p>}
      </section>
      <style>{`
        .method-cognition {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--spacing-xs);
          margin-top: var(--spacing-sm);
        }
        .method-cognition div {
          padding: var(--spacing-sm);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface-elevated);
        }
        .method-cognition span {
          display: block;
          color: var(--color-gold);
          font-size: 0.72rem;
          font-weight: 700;
        }
        .method-cognition p {
          margin: var(--spacing-xs) 0 0;
          color: var(--color-text-secondary);
          font-size: 0.78rem;
          line-height: 1.45;
        }
        .method-boundary {
          border-left: 2px solid var(--color-gold-dim);
          padding-left: var(--spacing-sm);
        }
        .method-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }
        .method-group__heading {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border);
          padding-bottom: var(--spacing-sm);
        }
        .method-group__heading p {
          margin: 0;
          color: var(--color-gold);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .method-group__heading h3 {
          margin: var(--spacing-xs) 0 0;
          font-size: 1.15rem;
        }
        .method-group__heading span {
          max-width: 520px;
          color: var(--color-text-secondary);
          font-size: 0.88rem;
          line-height: 1.5;
        }
        @media (max-width: 760px) {
          .method-cognition { grid-template-columns: 1fr; }
          .method-group__heading {
            align-items: start;
            flex-direction: column;
          }
        }
      `}</style>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function FilterButton({
  current,
  value,
  onChange,
  children,
}: {
  current: StatusFilter;
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={current === value}
      className={current === value ? "active" : ""}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  );
}

function GroupButton({
  current,
  value,
  onChange,
  children,
}: {
  current: GroupMode;
  value: GroupMode;
  onChange: (value: GroupMode) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={current === value}
      className={current === value ? "active" : ""}
      onClick={() => onChange(value)}
    >
      {children}
    </button>
  );
}

type MethodCardProps = (typeof DIVINATION_METHODS)[number] & {
  compact?: boolean;
  index: number;
  locale: ReturnType<typeof getCulturalPrefs>["locale"];
};

function MethodCard({
  id,
  title,
  subtitle,
  tradition,
  civilization,
  culturalNote,
  questionStyle,
  questionGrammar,
  causalityModel,
  uncertaintyMode,
  misuseBoundary,
  status,
  route,
  tags,
  compact,
  index,
  locale,
}: MethodCardProps) {
  const experience = getMethodExperience(id);
  const cognition = getMethodCognition(id);
  const localizedName = getLocalizedMethodName(id, locale);
  const cardStyle = {
    ...methodExperienceStyle(experience),
    "--i": index,
  } as CSSProperties;
  const body = (
    <>
      <div className="method-card__visual" aria-hidden />
      <div className="method-card__glyph" aria-hidden>
        {experience.glyph}
      </div>
      <div className="method-card__body">
        <div className="method-card__top">
          <span>{tradition} · {civilization}</span>
          <i>{STATUS_LABEL[status]}</i>
        </div>
        <strong>{localizedName ?? title}</strong>
        {localizedName && localizedName !== title ? <em>{title}</em> : null}
        <p>{subtitle}</p>
        <p>{culturalNote}</p>
        <p>{questionStyle}</p>
        <div className="method-cognition" aria-label={`${title} 的认知方式`}>
          <div>
            <span>如何提问</span>
            <p>{cognition?.questionGrammar ?? questionGrammar ?? questionStyle}</p>
          </div>
          <div>
            <span>因果模型</span>
            <p>{formatCausality(cognition?.causalityModel ?? causalityModel)}</p>
          </div>
          <div>
            <span>不确定性</span>
            <p>{formatUncertainty(cognition?.uncertaintyMode ?? uncertaintyMode)}</p>
          </div>
        </div>
        <p className="method-boundary">{cognition?.misuseBoundary ?? misuseBoundary ?? "适合作为文化探索与自我反思，不替代专业建议。"}</p>
        <div className="method-card__tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </>
  );

  const className = [
    "method-card",
    "method-card--experience",
    `method-motion--${experience.motion}`,
    compact ? "method-card--compact" : "",
    status === "planned" ? "is-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleEnter = () => {
    unlockAudio();
    playMethodSound(id, "enter");
  };

  if (route) {
    return (
      <Link to={route} className={className} style={cardStyle} onMouseEnter={handleEnter}>
        {body}
      </Link>
    );
  }

  return (
    <article className={className} style={cardStyle} aria-disabled="true">
      {body}
    </article>
  );
}

type MethodGroup = {
  id: string;
  title: string;
  kicker: string;
  description?: string;
  methods: typeof DIVINATION_METHODS;
};

function buildMethodGroups(methods: typeof DIVINATION_METHODS, mode: GroupMode): MethodGroup[] {
  if (mode === "all") {
    return [{ id: "all", title: "全部系统", kicker: "ALL", methods }];
  }

  if (mode === "civilization") {
    return CULTURAL_METHOD_GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      kicker: "CIVILIZATION",
      description: group.description,
      methods: methods.filter((method) => (group.methodIds as readonly string[]).includes(method.id)),
    })).filter((group) => group.methods.length > 0);
  }

  if (mode === "causality") {
    return groupByCognition(methods, "causalityModel", CAUSALITY_LABELS, "CAUSALITY");
  }

  if (mode === "uncertainty") {
    return groupByCognition(methods, "uncertaintyMode", UNCERTAINTY_LABELS, "UNCERTAINTY");
  }

  return QUESTION_DOMAIN_ORDER.map((domain) => ({
    id: domain,
    title: QUESTION_DOMAIN_LABELS[domain],
    kicker: "QUESTION TYPE",
    description: QUESTION_DOMAIN_DESCRIPTIONS[domain],
    methods: methods.filter((method) => getMethodCognition(method.id)?.bestFor.includes(domain)),
  })).filter((group) => group.methods.length > 0);
}

function groupByCognition<K extends "causalityModel" | "uncertaintyMode">(
  methods: typeof DIVINATION_METHODS,
  key: K,
  labels: Partial<Record<string, string>>,
  kicker: string
): MethodGroup[] {
  const map = new Map<string, typeof DIVINATION_METHODS>();
  for (const method of methods) {
    const value = getMethodCognition(method.id)?.[key] ?? method[key] ?? "reflection";
    map.set(value, [...(map.get(value) ?? []), method]);
  }
  return Array.from(map.entries()).map(([id, groupedMethods]) => ({
    id,
    title: labels[id] ?? id,
    kicker,
    methods: groupedMethods,
  }));
}

function formatCausality(model?: CausalityModel): string {
  if (!model) return "以象征、文本或用户叙事建立解释框架。";
  return CAUSALITY_LABELS[model] ?? model;
}

function formatUncertainty(mode?: UncertaintyMode): string {
  if (!mode) return "提供反思材料，而不是确定性承诺。";
  return UNCERTAINTY_LABELS[mode] ?? mode;
}

const CAUSALITY_LABELS: Partial<Record<CausalityModel, string>> = {
  "birth-structure": "出生结构与阶段周期",
  "time-position": "时位、处境与变化条件",
  "celestial-cycle": "天体周期与人生节律",
  "symbolic-projection": "图像符号与心理投射",
  "ritual-confirmation": "礼俗仪式与确认机制",
  "folk-association": "日常痕迹与民俗联想",
  "spatial-flow": "时空方位与资源布局",
  "textual-admonition": "文本劝诫与典故修辞",
};

const UNCERTAINTY_LABELS: Partial<Record<UncertaintyMode, string>> = {
  trend: "趋势倾向",
  timing: "宜动宜守与时机条件",
  "yes-no": "是非确认",
  "psychological-mirroring": "心理显影",
  admonition: "劝诫提示",
  "event-narrative": "事件叙事",
  "strategic-positioning": "策略布局",
  reflection: "反思练习",
};

const QUESTION_DOMAIN_ORDER: QuestionDomain[] = [
  "life-structure",
  "career",
  "relationship",
  "specific-event",
  "timing",
  "inner-state",
  "dream",
  "space",
  "daily-guidance",
];

const QUESTION_DOMAIN_LABELS: Record<QuestionDomain, string> = {
  "life-structure": "长期人生结构",
  career: "事业与选择",
  relationship: "关系与互动",
  "specific-event": "具体事件",
  timing: "行动时机",
  "inner-state": "心理与内在状态",
  dream: "梦境与意象",
  space: "空间与方位",
  "daily-guidance": "日常提醒",
};

const QUESTION_DOMAIN_DESCRIPTIONS: Record<QuestionDomain, string> = {
  "life-structure": "适合观察长期结构、阶段节律和人生主题。",
  career: "适合处理职业方向、资源配置和责任转向。",
  relationship: "适合看亲密、合作、边界和互动模式。",
  "specific-event": "适合聚焦一件具体事情的成败、阻力和线索。",
  timing: "适合判断宜动宜守、等待条件和行动窗口。",
  "inner-state": "适合整理情绪、盲点、投射和自我照护。",
  dream: "适合处理梦中符号、重复意象和醒后情绪。",
  space: "适合观察居住、办公、方位和环境秩序。",
  "daily-guidance": "适合轻量提醒、日签和短周期反思。",
};
