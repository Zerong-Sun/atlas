import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { DIVINATION_METHODS, type MethodStatus } from "@/data/divinationMethods";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";
import { playMethodSound, unlockAudio } from "@/lib/methodSounds";
import { Page } from "@/components/ui/Page";

type StatusFilter = "all" | MethodStatus;

const STATUS_LABEL: Record<MethodStatus, string> = {
  ready: "可用",
  preview: "参考预览",
  planned: "待开发",
};

export function MethodsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DIVINATION_METHODS.filter((method) => {
      const matchesStatus = status === "all" || method.status === status;
      const searchable = [method.title, method.subtitle, method.tradition, ...method.tags].join(" ").toLowerCase();
      return matchesStatus && (!q || searchable.includes(q));
    });
  }, [query, status]);

  const readyCount = DIVINATION_METHODS.filter((method) => method.status === "ready").length;
  const previewCount = DIVINATION_METHODS.filter((method) => method.status === "preview").length;
  const plannedCount = DIVINATION_METHODS.filter((method) => method.status === "planned").length;

  return (
    <Page wide className="methods-page">
      <section className="method-directory-hero">
        <p className="method-kicker">METHOD INDEX</p>
        <h1>选择一种占法</h1>
        <p>
          今日只是入口。八字、塔罗、占梦与后续所有占卜方法彼此并列，像一组可不断扩展的仪式工具。
        </p>
      </section>

      <section className="method-control-panel" aria-label="占法筛选">
        <div className="method-stats" aria-label="占法开发状态">
          <Stat label="可用" value={readyCount} />
          <Stat label="参考预览" value={previewCount} />
          <Stat label="待开发" value={plannedCount} />
        </div>
        <div className="method-filters">
          <label className="method-search">
            <span>搜索占法</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入八字、塔罗、星占、卡牌..."
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
          <h2 id="method-results">{filtered.length} 种占法</h2>
        </div>
        <div className="method-grid">
          {filtered.map((method, index) => (
            <MethodCard
              key={method.id}
              index={index}
              compact={method.status === "planned"}
              {...method}
            />
          ))}
        </div>
        {filtered.length === 0 && <p className="empty-note">没有匹配的占法。换一个关键词试试。</p>}
      </section>
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
};

function MethodCard({ id, title, subtitle, tradition, status, route, tags, compact, index }: MethodCardProps) {
  const experience = getMethodExperience(id);
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
          <span>{tradition}</span>
          <i>{STATUS_LABEL[status]}</i>
        </div>
        <strong>{title}</strong>
        <p>{subtitle}</p>
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
