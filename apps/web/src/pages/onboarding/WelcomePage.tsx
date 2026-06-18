import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
import { colors, spacing } from "@/theme/tokens";

const AUTO_ENTER_MS = 4200;

export function WelcomePage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    navigate("/onboarding/interests", { replace: true });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void enter();
    }, AUTO_ENTER_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`welcome${leaving ? " welcome--leaving" : ""}`}>
      <CosmicBackdrop />
      <div className="welcome__content">
        <p className="welcome__brand">诸象 Atlas</p>
        <h1 className="welcome__tagline">
          融合全球命理、占卜、占梦与古籍证据的 AI 对照解读。
        </h1>
        <p className="welcome__hint">
          今日页查看每日之问 · 底部导航进入象征系统、解梦与档案 · 提问即可获得多体系对照解读
        </p>
        <button type="button" className="welcome__enter" onClick={enter} disabled={leaving}>
          {leaving ? "进入中…" : "开始引导"}
        </button>
      </div>
      <style>{`
        .welcome {
          position: relative;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: ${spacing.xxl}px ${spacing.lg}px;
          background: linear-gradient(135deg, ${colors.night} 0%, ${colors.nightElevated} 55%, ${colors.ink} 100%);
          overflow: hidden;
          transition: opacity 0.45s ease;
        }
        .welcome--leaving {
          opacity: 0;
        }
        .welcome__content {
          position: relative;
          z-index: 1;
          max-width: 520px;
          animation: welcome-rise 0.7s ease both;
        }
        .welcome__brand {
          margin: 0 0 ${spacing.md}px;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${colors.gold};
        }
        .welcome__tagline {
          margin: 0 0 ${spacing.lg}px;
          font-family: var(--font-serif);
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 600;
          line-height: 1.45;
          letter-spacing: 0.02em;
          color: ${colors.text};
        }
        .welcome__hint {
          margin: 0 0 ${spacing.xl}px;
          font-size: 0.8125rem;
          line-height: 1.7;
          color: ${colors.textMuted};
        }
        .welcome__enter {
          padding: 12px 28px;
          border: 1px solid ${colors.goldDim};
          border-radius: var(--radius-md);
          background: transparent;
          color: ${colors.gold};
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .welcome__enter:hover:not(:disabled) {
          background: rgba(196, 165, 116, 0.1);
          border-color: ${colors.gold};
        }
        .welcome__enter:disabled {
          opacity: 0.6;
          cursor: default;
        }
        @keyframes welcome-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .welcome__content { animation: none; }
          .welcome--leaving { transition: none; }
        }
        @media (max-width: 640px) {
          .welcome {
            padding: ${spacing.xl}px ${spacing.md}px;
            align-items: flex-end;
            padding-bottom: calc(${spacing.xxl}px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
    </div>
  );
}
