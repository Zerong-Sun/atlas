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
  selectedKey?: string;
  onCellClick?: (key: string) => void;
}

export function PalaceGrid({
  cells,
  columns = 3,
  className = "",
  ariaLabel,
  selectedKey,
  onCellClick,
}: PalaceGridProps) {
  return (
    <div
      className={`palace-grid ${className}`.trim()}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      aria-label={ariaLabel}
    >
      {cells.map((cell) => {
        const selected = selectedKey === cell.key;
        const classNames = [
          "palace-grid__cell",
          cell.highlight ? "palace-grid__cell--hi" : "",
          selected ? "palace-grid__cell--selected" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const inner = (
          <>
            <span>{cell.label}</span>
            {cell.sublabel && <strong>{cell.sublabel}</strong>}
            {cell.children}
          </>
        );
        if (onCellClick) {
          return (
            <button
              key={cell.key}
              type="button"
              className={classNames}
              onClick={() => onCellClick(cell.key)}
              aria-pressed={selected}
            >
              {inner}
            </button>
          );
        }
        return (
          <article key={cell.key} className={classNames}>
            {inner}
          </article>
        );
      })}
    </div>
  );
}
