import type { ReactNode } from "react";

export interface PalaceCell {
  key: string;
  label: string;
  sublabel?: string;
  highlight?: boolean;
  children?: ReactNode;
}

interface PalaceGridProps {
  cells: PalaceCell[];
  columns?: number;
  className?: string;
  ariaLabel?: string;
}

export function PalaceGrid({ cells, columns = 3, className = "", ariaLabel }: PalaceGridProps) {
  return (
    <div
      className={`palace-grid ${className}`.trim()}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      aria-label={ariaLabel}
    >
      {cells.map((cell) => (
        <article key={cell.key} className={cell.highlight ? "palace-grid__cell palace-grid__cell--hi" : "palace-grid__cell"}>
          <span>{cell.label}</span>
          {cell.sublabel && <strong>{cell.sublabel}</strong>}
          {cell.children}
        </article>
      ))}
    </div>
  );
}
