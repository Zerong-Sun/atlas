import type { CSSProperties, ReactNode } from "react";

export type DrawPhase = "idle" | "shuffling" | "drawing" | "revealed";

type DeckAnimationProps = {
  phase: DrawPhase;
  labels?: Partial<Record<DrawPhase, string>>;
};

export function DeckAnimation({ phase, labels }: DeckAnimationProps) {
  const label =
    phase === "shuffling"
      ? (labels?.shuffling ?? "SHUFFLING")
      : phase === "drawing"
        ? (labels?.drawing ?? "DRAWING")
        : (labels?.idle ?? "DECK");

  return (
    <div className="deck-animation" aria-hidden>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} style={{ "--i": index } as CSSProperties} />
      ))}
      <strong>{label}</strong>
    </div>
  );
}

type CardDrawTableProps = {
  phase: DrawPhase;
  spreadCount: number;
  children: ReactNode;
  className?: string;
  spreadClassName?: string;
  deckLabels?: Partial<Record<DrawPhase, string>>;
};

export function CardDrawTable({
  phase,
  spreadCount,
  children,
  className = "",
  spreadClassName = "",
  deckLabels,
}: CardDrawTableProps) {
  const rootClass = ["tarot-table", `tarot-table--${phase}`, className].filter(Boolean).join(" ");
  const spreadClass = ["tarot-spread", spreadClassName].filter(Boolean).join(" ");

  return (
    <div className={rootClass} aria-live="polite">
      <DeckAnimation phase={phase} labels={deckLabels} />
      <div className={spreadClass} style={{ "--spread-count": spreadCount } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
