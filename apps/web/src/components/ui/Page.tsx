import type { ReactNode } from "react";
import { colors, spacing } from "@/theme/tokens";

type Props = {
  children: ReactNode;
  title?: string;
  wide?: boolean;
  /** Transparent background for today color field */
  transparent?: boolean;
  className?: string;
};

export function Page({ children, title, wide, transparent, className }: Props) {
  const classes = [
    "page",
    wide && "wide",
    transparent && "page--transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main id="main-content" className={classes}>
      {title && <h1 className="page-title">{title}</h1>}
      {children}
      <style>{`
        .page {
          max-width: ${wide ? "960px" : "720px"};
          margin: 0 auto;
          padding: ${spacing.lg}px ${spacing.md}px ${spacing.xxl}px;
          min-height: calc(100vh - 64px);
        }
        .page--transparent {
          background: transparent;
        }
        .page-title {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin: 0 0 ${spacing.lg}px;
          color: ${colors.text};
        }
        @media (max-width: 640px) {
          .page { padding: ${spacing.md}px ${spacing.sm}px ${spacing.xl}px; }
          .page-title { font-size: 24px; }
        }
      `}</style>
    </main>
  );
}
