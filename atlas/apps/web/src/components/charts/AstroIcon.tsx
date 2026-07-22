import { getAstrodiceIconUrl, type AstrodiceIconKind } from "@/data/astrodiceIcons";

type AstroIconProps = {
  kind: AstrodiceIconKind;
  id: string;
  rolling?: boolean;
  size?: "die" | "inline";
  className?: string;
};

export function AstroIcon({ kind, id, rolling, size = "die", className }: AstroIconProps) {
  if (rolling) {
    return <span className={`astrodice-icon astrodice-icon--rolling ${className ?? ""}`}>…</span>;
  }

  const src = getAstrodiceIconUrl(kind, id);
  if (!src) {
    return <span className={`astrodice-icon astrodice-icon--fallback ${className ?? ""}`}>?</span>;
  }

  return (
    <span
      className={`astrodice-icon astrodice-icon--${kind} astrodice-icon--${size} ${className ?? ""}`}
      aria-hidden
    >
      <img src={src} alt="" />
    </span>
  );
}
