export interface HexLine {
  position: number;
  isYang: boolean;
  isMoving?: boolean;
  label?: string;
  meta?: string;
}

interface HexagramLinesProps {
  lines: HexLine[];
  title?: string;
}

export function HexagramLines({ lines, title }: HexagramLinesProps) {
  const ordered = [...lines].sort((a, b) => b.position - a.position);
  return (
    <div className="hex-lines-chart" aria-label={title ?? "六爻卦象"}>
      {title && <h3>{title}</h3>}
      <ol>
        {ordered.map((line) => (
          <li key={line.position} className={line.isMoving ? "hex-line hex-line--moving" : "hex-line"}>
            <span className="hex-line__pos">{line.position}爻</span>
            <span className={`hex-line__bar ${line.isYang ? "hex-line__bar--yang" : "hex-line__bar--yin"}`}>
              {line.isYang ? "———" : "— —"}
            </span>
            {(line.label || line.meta) && (
              <span className="hex-line__meta">
                {line.label}
                {line.meta && <em>{line.meta}</em>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
