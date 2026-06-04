import type { Tradition } from "@atlas/shared-types";
import { TRADITION_COLORS, TRADITION_LABELS } from "@/constants/traditions";

type Props = {
  tradition: Tradition;
  selected?: boolean;
  onClick?: () => void;
};

export function TraditionBadge({ tradition, selected, onClick }: Props) {
  const accent = TRADITION_COLORS[tradition];
  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className="tradition-badge"
      onClick={onClick}
      style={{
        borderColor: accent,
        backgroundColor: selected ? `${accent}33` : "var(--surface)",
      }}
      aria-pressed={onClick ? selected : undefined}
    >
      <span className="tradition-badge__dot" style={{ backgroundColor: accent }} />
      {TRADITION_LABELS[tradition]}
    </Tag>
  );
}
