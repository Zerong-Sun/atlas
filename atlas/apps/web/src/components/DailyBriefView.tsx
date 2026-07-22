import type { CSSProperties } from "react";
import type { DailyBrief, Tradition } from "@atlas/shared-types";
import { CitationBlock } from "@/components/design-system";
import { TRADITION_COLORS } from "@/constants/traditions";
import { TRADITION_LABELS } from "@/theme/traditions";
import { colors, resolveDayColor } from "@/theme/tokens";

type Props = { brief: DailyBrief };

export function DailyBriefView({ brief }: Props) {
  const traditions = Object.entries(brief.traditionSummaries);
  const day = resolveDayColor(brief.date);

  return (
    <article className="daily-brief" aria-label="今日观测签条">
      <header className="fortune-slip">
        <p className="archive-mono label-en">FIELD THEME</p>
        <h2 className="theme">{brief.theme}</h2>
      </header>

      <section className="conduct-notes" aria-label="宜忌">
        <div className="conduct-col">
          <span className="archive-mono section-label">FAVORABLE</span>
          <span className="zh-label">宜</span>
          <ul>
            {brief.suitable.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="conduct-col">
          <span className="archive-mono section-label">REFRAIN</span>
          <span className="zh-label">忌</span>
          <ul>
            {brief.avoid.map((s) => (
              <li key={s} className="muted">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="obs-log" aria-labelledby="obs-log-title">
        <h3 id="obs-log-title" className="archive-mono section-label">
          OBSERVATION LOG
        </h3>
        <span className="zh-label">每日诸象</span>
        <ul className="obs-list">
          {traditions.map(([key, value], i) => (
            <li
              key={key}
              className="obs-item"
              style={{ "--i": i } as CSSProperties}
            >
              <span className="obs-item__index" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div
                className="obs-item__body"
                style={{ borderLeftColor: TRADITION_COLORS[key as Tradition] ?? colors.goldDim }}
              >
                <span className="archive-mono trad-label">
                  {TRADITION_LABELS[key as Tradition] ?? key} · NOTE
                </span>
                <p className="obs-body">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {brief.classicQuote && (
        <section className="source-excerpt" aria-labelledby="source-title">
          <h3 id="source-title" className="archive-mono section-label">
            PRIMARY SOURCE
          </h3>
          <p className="zh-label">古籍一句</p>
          <CitationBlock citation={brief.classicQuote} defaultExpanded={false} variant="onDay" />
        </section>
      )}

      <p className="footer-meta archive-mono" aria-hidden>
        COORD · 31.2°N 121.5°E · {day.nameEn.toUpperCase()}
      </p>
    </article>
  );
}
