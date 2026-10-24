import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const scrollPositions = new Map<string, number>();
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
  const mainRef = useRef<HTMLElement>(null);
  const { key } = useLocation();
  const navigation = useNavigationType();
  useLayoutEffect(() => {
    const main = mainRef.current;
    const updateTitle = () => {
      const heading = title || main?.querySelector("h1, h2")?.textContent?.trim();
      document.title = heading ? `${heading} · 诸象 Atlas` : "诸象 Atlas";
    };
    updateTitle();
    const observer = new MutationObserver(updateTitle);
    if (main) observer.observe(main, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [key, title]);
  useLayoutEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    const target = navigation === "POP" ? scrollPositions.get(key) ?? 0 : 0;
    let restoring = true;
    const remember = () => {
      if (restoring) return;
      scrollPositions.set(key, window.scrollY);
      if (scrollPositions.size > 100) scrollPositions.delete(scrollPositions.keys().next().value!);
    };
    const restore = () => {
      if (!restoring) return;
      window.scrollTo({ top: target, behavior: "instant" });
      if (document.documentElement.scrollHeight - window.innerHeight >= target) restoring = false;
    };
    const stopRestoring = () => { restoring = false; };
    restore();
    // A lazy route may mount before its contents are tall enough to restore a POP.
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(restore);
    if (mainRef.current) observer?.observe(mainRef.current);
    window.addEventListener("scroll", remember, { passive: true });
    window.addEventListener("wheel", stopRestoring, { passive: true });
    window.addEventListener("touchstart", stopRestoring, { passive: true });
    window.addEventListener("keydown", stopRestoring);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", remember);
      window.removeEventListener("wheel", stopRestoring);
      window.removeEventListener("touchstart", stopRestoring);
      window.removeEventListener("keydown", stopRestoring);
      // Do not read scrollY here: React may already have removed the old route,
      // clamping the viewport to zero. Scroll events captured the real position.
    };
  }, [key, navigation]);
  const classes = [
    "page",
    wide && "wide",
    transparent && "page--transparent",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main ref={mainRef} tabIndex={-1} id="main-content" className={classes}>
      {title && <h1 className="page-title">{title}</h1>}
      {children}
      <style>{`
        .page {
          max-width: ${wide ? "1180px" : "720px"};
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
