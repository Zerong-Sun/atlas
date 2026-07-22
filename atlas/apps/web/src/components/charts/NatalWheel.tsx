interface PlanetPoint {
  label: string;
  longitude: number;
  color?: string;
}

interface NatalWheelProps {
  ascendantLongitude: number;
  planets: PlanetPoint[];
  aspects?: Array<{ a: number; b: number; aspect: string }>;
  size?: number;
}

export function NatalWheel({ ascendantLongitude, planets, size = 280 }: NatalWheelProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const signs = ["白羊", "金牛", "双子", "巨蟹", "狮子", "处女", "天秤", "天蝎", "射手", "摩羯", "水瓶", "双鱼"];

  const toXY = (lon: number, radius = r) => {
    const adjusted = lon - ascendantLongitude - 90;
    const rad = (adjusted * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  return (
    <svg className="natal-wheel" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="本命星盘">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.5" />
      {signs.map((sign, i) => {
        const lon = i * 30;
        const p1 = toXY(lon, r);
        const p2 = toXY(lon, r * 0.65);
        const label = toXY(lon + 15, r * 1.12);
        return (
          <g key={sign}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--color-border)" strokeWidth="0.5" opacity="0.4" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="var(--color-text-muted)">
              {sign}
            </text>
          </g>
        );
      })}
      {planets.map((p) => {
        const { x, y } = toXY(p.longitude, r * 0.82);
        return (
          <g key={p.label}>
            <circle cx={x} cy={y} r="5" fill={p.color ?? "var(--color-gold)"} />
            <text x={x} y={y - 10} textAnchor="middle" fontSize="8" fill="var(--color-text-secondary)">
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
