import type { ReactNode } from "react";
import { colors, radius, spacing } from "@/theme/tokens";

type Props = {
  title?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
};

export function Button({ title, children, onClick, disabled, loading, type = "button" }: Props) {
  const label = children ?? title ?? "";
  return (
    <button
      type={type}
      className="atlas-btn"
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? "请稍候…" : label}
      <style>{`
        .atlas-btn {
          width: 100%;
          padding: ${spacing.md}px ${spacing.lg}px;
          border: 1px solid ${colors.goldDim};
          border-radius: ${radius.md}px;
          background: ${colors.surfaceElevated};
          color: ${colors.gold};
          font-weight: 600;
        }
        .atlas-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .atlas-btn:not(:disabled):hover { background: ${colors.goldDim}22; }
      `}</style>
    </button>
  );
}
