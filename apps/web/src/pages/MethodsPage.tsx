import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  DIVINATION_METHODS,
  getLocalizedMethodName,
  type CausalityModel,
  type MethodStatus,
  type UncertaintyMode,
} from "@/data/divinationMethods";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";
import { playMethodSound, unlockAudio } from "@/lib/methodSounds";
import { Page } from "@/components/ui/Page";
import { getCulturalPrefs } from "@/lib/culturalPrefs";

type StatusFilter = "all" | MethodStatus;

const STATUS_LABEL: Record<MethodStatus, string> = {
  ready: "可用",
  preview: "参考预览",
  planned: "待开发",
};

export function MethodsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
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
        method.questionGrammar,
        method.causalityModel,
        method.uncertaintyMode,
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
        </div>
      </section>

      <section className="method-section" aria-labelledby="method-results">
        <div className="section-heading">
          <p>{status === "all" ? "ALL METHODS" : status.toUpperCase()}</p>
          <h2 id="method-results">{filtered.length} 种象征系统</h2>
        </div>
        <div className="method-grid">
          {filtered.map((method, index) => (
            <MethodCard
              key={method.id}
              index={index}
              locale={culturalPrefs.locale}
              compact={method.status === "planned"}
              {...method}
            />
          ))}
        </div>
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
        @media (max-width: 760px) {
          .method-cognition { grid-template-columns: 1fr; }
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
            <p>{questionGrammar ?? questionStyle}</p>
          </div>
          <div>
            <span>因果模型</span>
            <p>{formatCausality(causalityModel)}</p>
          </div>
          <div>
            <span>不确定性</span>
            <p>{formatUncertainty(uncertaintyMode)}</p>
          </div>
        </div>
        <p className="method-boundary">{misuseBoundary ?? "适合作为文化探索与自我反思，不替代专业建议。"}</p>
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
