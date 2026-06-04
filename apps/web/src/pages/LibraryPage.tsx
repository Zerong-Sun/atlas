import { useEffect, useState } from "react";
import type { Tradition } from "@atlas/shared-types";
import { TraditionBadge } from "@/components/design-system";
import { Page } from "@/components/ui/Page";
import { browseLibrary, type LibraryEntry } from "@/lib/api/library";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

export function LibraryPage() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [filter, setFilter] = useState<Tradition | undefined>();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    browseLibrary({ tradition: filter, query: query || undefined })
      .then(setEntries)
      .catch(() => setError("书库加载失败，请稍后重试。"))
      .finally(() => setLoading(false));
  }, [filter, query]);

  const stats = getLibraryStats(entries);

  return (
    <Page title="书库">
      <p className="hint">术语 · 卦义 · 牌义 · 宫位短语</p>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      <input
        className="search"
        placeholder="搜索术语…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="filters">
        <button type="button" className={!filter ? "active" : ""} onClick={() => setFilter(undefined)}>
          全部
        </button>
        {READING_TRADITIONS.map((t) => (
          <TraditionBadge
            key={t}
            tradition={t}
            selected={filter === t}
            onClick={() => setFilter(t)}
          />
        ))}
      </div>

      {!loading && entries.length > 0 && (
        <section className="library-visual" aria-label="书库条目体系分布">
          {READING_TRADITIONS.map((t) => (
            <div key={t} className="library-bar">
              <span>{TRADITION_LABELS[t]}</span>
              <i style={{ height: `${libraryHeight(stats[t], entries.length)}%` }} />
              <em>{stats[t]}</em>
            </div>
          ))}
        </section>
      )}

      {loading && <p className="hint">加载中…</p>}
      {!loading &&
        entries.map((e) => (
        <article key={e.id} className="entry">
          <div className="entry-header">
            <h3>{e.labelZh}</h3>
            <span className="muted">{TRADITION_LABELS[e.tradition]}</span>
          </div>
          <p>{e.definitionZh}</p>
        </article>
        ))}

      <style>{`
        .hint { color: ${colors.textMuted}; font-size: 13px; margin: -${spacing.md}px 0 ${spacing.md}px; }
        .search {
          width: 100%;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
          margin-bottom: ${spacing.md}px;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing.sm}px;
          align-items: center;
          margin-bottom: ${spacing.lg}px;
        }
        .filters button {
          background: none;
          border: none;
          color: ${colors.textMuted};
          font-size: 13px;
        }
        .filters button.active { color: ${colors.gold}; }
        .library-visual {
          height: 148px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: ${spacing.sm}px;
          align-items: end;
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          margin-bottom: ${spacing.lg}px;
        }
        .library-bar {
          height: 100%;
          display: grid;
          grid-template-rows: 20px 1fr 18px;
          gap: ${spacing.xs}px;
          justify-items: center;
          color: ${colors.textMuted};
          font-size: 12px;
        }
        .library-bar i {
          align-self: end;
          width: 100%;
          min-height: 8px;
          border-radius: ${radius.sm}px ${radius.sm}px 0 0;
          background: ${colors.goldDim};
        }
        .library-bar em { font-style: normal; color: ${colors.gold}; }
        .entry {
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border-radius: ${radius.md}px;
          margin-bottom: ${spacing.sm}px;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: ${spacing.md}px;
        }
        .entry h3 { margin: 0; font-size: 18px; }
        .entry p { margin: ${spacing.sm}px 0 0; line-height: 1.5; }
        .muted { color: ${colors.textMuted}; font-size: 13px; }
      `}</style>
    </Page>
  );
}

function getLibraryStats(entries: LibraryEntry[]): Record<Tradition, number> {
  const stats = Object.fromEntries(READING_TRADITIONS.map((t) => [t, 0])) as Record<Tradition, number>;
  for (const entry of entries) {
    if (entry.tradition in stats) stats[entry.tradition] += 1;
  }
  return stats;
}

function libraryHeight(value: number, total: number): number {
  if (total <= 0 || value <= 0) return 8;
  return Math.max(12, Math.round((value / total) * 100));
}
