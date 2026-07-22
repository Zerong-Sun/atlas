interface CompassRoseProps {
  degree: number;
  onDegreeChange?: (deg: number) => void;
  size?: number;
}

export function CompassRose({ degree, onDegreeChange, size = 220 }: CompassRoseProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  const rad = ((degree - 90) * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  return (
    <div className="compass-rose-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="compass-rose" role="img" aria-label={`罗盘 ${Math.round(degree)} 度`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" />
        {["N", "E", "S", "W"].map((d, i) => {
          const a = ((i * 90 - 90) * Math.PI) / 180;
          const x = cx + (r + 14) * Math.cos(a);
          const y = cy + (r + 14) * Math.sin(a);
          return (
            <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="var(--color-gold)" fontSize="12">
              {d}
            </text>
          );
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--color-gold)" strokeWidth="2" markerEnd="url(#arrow)" />
        <circle cx={cx} cy={cy} r="4" fill="var(--color-gold)" />
      </svg>
      {onDegreeChange && (
        <label className="compass-rose__input">
          <span>坐向度数</span>
          <input
            type="range"
            min={0}
            max={359}
            value={Math.round(degree)}
            onChange={(e) => onDegreeChange(Number(e.target.value))}
          />
          <strong>{Math.round(degree)}°</strong>
        </label>
      )}
    </div>
  );
}
