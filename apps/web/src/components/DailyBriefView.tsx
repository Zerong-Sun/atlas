import type { CSSProperties } from "react";
import type { DailyBrief, Tradition } from "@atlas/shared-types";
import { CitationBlock } from "@/components/design-system";
import { TRADITION_LABELS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

type Props = { brief: DailyBrief };

export function DailyBriefView({ brief }: Props) {
  const traditions = Object.entries(brief.traditionSummaries);
  const totalActions = Math.max(brief.suitable.length + brief.avoid.length, 1);

  return (
    <div className="daily-brief">
      <h2 className="theme">{brief.theme}</h2>
      <p className="meta">{brief.date} · 每日诸象</p>

      <section className="overview" aria-label="今日能量概览">
        <div className="ring" style={{ "--suitable": `${(brief.suitable.length / totalActions) * 100}%` } as CSSProperties}>
          <strong>{traditions.length}</strong>
          <span>体系</span>
        </div>
        <div className="overview-bars">
          {traditions.map(([key], index) => (
            <div key={key} className="overview-row">
              <span>{TRADITION_LABELS[key as Tradition] ?? key}</span>
              <i style={{ width: `${68 + index * 8}%` }} />
            </div>
          ))}
        </div>
      </section>

      <div className="cards">
        {traditions.map(([key, value]) => (
          <div key={key} className="card">
            <span className="label">{TRADITION_LABELS[key as Tradition] ?? key}</span>
            <p>{value}</p>
          </div>
        ))}
      </div>

      {brief.classicQuote && (
        <section>
          <h3>古籍一句</h3>
          <CitationBlock citation={brief.classicQuote} defaultExpanded />
        </section>
      )}

      <div className="row">
        <div className="list suitable">
          <span className="label">宜</span>
          {brief.suitable.map((s) => (
            <p key={s}>· {s}</p>
          ))}
        </div>
        <div className="list avoid">
          <span className="label">忌</span>
          {brief.avoid.map((s) => (
            <p key={s} className="muted">
              · {s}
            </p>
          ))}
        </div>
      </div>

      <style>{`
        .daily-brief .theme { font-size: 28px; margin: 0; color: ${colors.text}; }
        .daily-brief .meta { color: ${colors.textMuted}; font-size: 13px; margin: ${spacing.sm}px 0 ${spacing.lg}px; }
        .overview {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: ${spacing.md}px;
          align-items: center;
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          margin-bottom: ${spacing.lg}px;
        }
        .ring {
          width: 112px;
          aspect-ratio: 1;
          border-radius: 50%;
          display: grid;
          place-content: center;
          text-align: center;
          background:
            radial-gradient(circle at center, ${colors.surface} 0 55%, transparent 56%),
            conic-gradient(${colors.consensus} 0 var(--suitable), ${colors.divergence} var(--suitable) 100%);
        }
        .ring strong { font-size: 28px; color: ${colors.gold}; line-height: 1; }
        .ring span { color: ${colors.textMuted}; font-size: 12px; }
        .overview-bars { display: flex; flex-direction: column; gap: ${spacing.sm}px; }
        .overview-row {
          display: grid;
          grid-template-columns: 72px 1fr;
          align-items: center;
          gap: ${spacing.sm}px;
          color: ${colors.textSecondary};
          font-size: 13px;
        }
        .overview-row i {
          display: block;
          height: 8px;
          border-radius: ${radius.full}px;
          background: ${colors.goldDim};
        }
        .daily-brief .cards { display: flex; flex-direction: column; gap: ${spacing.sm}px; }
        .daily-brief .card {
          background: ${colors.surface};
          padding: ${spacing.md}px;
          border-radius: ${radius.md}px;
        }
        .daily-brief .card .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
          margin-bottom: ${spacing.xs}px;
        }
        .daily-brief .card p { margin: 0; line-height: 1.5; }
        .daily-brief section { margin-top: ${spacing.lg}px; }
        .daily-brief h3 { font-size: 20px; margin: 0 0 ${spacing.sm}px; }
        .daily-brief .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${spacing.md}px;
          margin-top: ${spacing.lg}px;
        }
        @media (max-width: 520px) {
          .overview { grid-template-columns: 1fr; }
          .ring { margin: 0 auto; }
          .daily-brief .row { grid-template-columns: 1fr; }
        }
        .daily-brief .list {
          padding: ${spacing.md}px;
          border-radius: ${radius.md}px;
        }
        .daily-brief .suitable { background: ${colors.consensusBg}; }
        .daily-brief .avoid { background: ${colors.divergenceBg}; }
        .daily-brief .list .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: ${spacing.xs}px;
        }
        .daily-brief .list p { margin: 4px 0; }
        .daily-brief .muted { color: ${colors.textSecondary}; }
      `}</style>
    </div>
  );
}
