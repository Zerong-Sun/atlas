import type { CSSProperties, ReactNode } from "react";

export type FlipCardProps = {
  position: string;
  revealed: boolean;
  reversed?: boolean;
  index?: number;
  placeholder?: boolean;
  backLabel?: string;
  placeholderHint?: string;
  face?: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function FlipCard({
  position,
  revealed,
  reversed = false,
  index = 0,
  placeholder = false,
  backLabel = "抽取中",
  placeholderHint = "等待洗牌",
  face,
  meta,
  className = "",
}: FlipCardProps) {
  if (placeholder) {
    return (
      <article
        className={`spread-card spread-card--placeholder ${className}`.trim()}
        style={{ "--i": index } as CSSProperties}
      >
        <div className="spread-card__inner">
          <div className="spread-card__back">
            <span>{position}</span>
            <strong>待抽取</strong>
          </div>
        </div>
        <div className="spread-card__meta">
          {meta ?? (
            <>
              <span>{position}</span>
              <strong>牌背</strong>
              <i>{placeholderHint}</i>
            </>
          )}
        </div>
      </article>
    );
  }

  const classes = ["spread-card", revealed && "is-revealed", reversed && "is-reversed", className]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="spread-card__inner">
        <div className="spread-card__back">
          <span>{position}</span>
          <strong>{backLabel}</strong>
        </div>
        <div className="spread-card__face">{face}</div>
      </div>
      {meta && <div className="spread-card__meta">{meta}</div>}
    </article>
  );
}
