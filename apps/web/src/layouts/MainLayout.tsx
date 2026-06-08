import { lazy, Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { CosmicBackdrop } from "@/components/CosmicBackdrop";
const MethodCopilot = lazy(() =>
  import("@/components/MethodCopilot").then((m) => ({ default: m.MethodCopilot })),
);
import { MethodCopilotProvider, useMethodCopilot } from "@/context/MethodCopilotContext";
import { getMethodExperience } from "@/data/methodExperiences";
import { isMethodCopilotRoute, methodIdFromPathname } from "@/lib/methodFromRoute";
import { colors, spacing } from "@/theme/tokens";

const NAV = [
  { to: "/", icon: "◐", label: "今日", end: true },
  { to: "/methods", icon: "✦", label: "占法" },
  { to: "/dream", icon: "☽", label: "解梦" },
  { to: "/profile", icon: "◎", label: "档案" },
  { to: "/settings", icon: "⚙", label: "设置" },
] as const;

function isTodayRoute(pathname: string) {
  return pathname === "/" || pathname === "/today";
}

function MainLayoutShell() {
  const { pathname } = useLocation();
  const today = isTodayRoute(pathname);
  const copilotRoute = isMethodCopilotRoute(pathname);
  const { open: copilotOpen, openCopilot } = useMethodCopilot();
  const copilotMethodId = methodIdFromPathname(pathname);
  const copilotExperience = getMethodExperience(copilotMethodId ?? "methods");

  return (
    <div
      className={[
        "shell",
        today ? "shell--today" : "shell--mist",
        copilotRoute && copilotOpen ? "shell--copilot-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CosmicBackdrop />
      <a href="#main-content" className="skip-link">
        跳到主内容
      </a>
      <header className="topbar">
        <span className="brand">诸象 Atlas</span>
        <div className="topbar-end">
          {copilotRoute && (
            <button
              type="button"
              className="method-copilot-topbar-btn"
              onClick={() => openCopilot()}
              aria-label="打开占法解说"
            >
              {copilotExperience.glyph} 解说
            </button>
          )}
          {today && <span className="obs-log-label">OBSERVATION LOG</span>}
        </div>
      </header>

      <Outlet />

      {copilotRoute ? (
        <Suspense fallback={null}>
          <MethodCopilot />
        </Suspense>
      ) : null}

      <nav className="bottom-nav" aria-label="主导航">
        {NAV.map(({ to, icon, label, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={"end" in rest ? rest.end : false}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            <span className="nav-link__icon" aria-hidden>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <style>{`
        .skip-link {
          position: absolute;
          left: -9999px;
          top: 0;
          z-index: 100;
          padding: 8px 16px;
          background: ${colors.gold};
          color: ${colors.night};
        }
        .skip-link:focus { left: 8px; top: 8px; }
        .shell {
          min-height: 100vh;
          padding-bottom: 72px;
          position: relative;
        }
        .shell--mist {
          background: ${colors.night};
        }
        .shell--mist::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 100% 40% at 50% 0%, rgba(154, 171, 184, 0.08), transparent 60%);
          z-index: 0;
        }
        .cosmic-backdrop {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1;
          opacity: 0.82;
          mix-blend-mode: screen;
        }
        .shell--today {
          background: transparent;
        }
        .shell > header,
        .shell > main,
        .shell > nav {
          position: relative;
          z-index: 2;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${spacing.md}px;
          padding: ${spacing.md}px ${spacing.lg}px;
          border-bottom: 1px solid var(--glass-border, rgba(42, 53, 72, 0.8));
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .shell--today .topbar,
        .shell--today .bottom-nav {
          background: var(--glass-bg, rgba(11, 16, 32, 0.55));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-color: var(--glass-border, rgba(196, 165, 116, 0.22));
        }
        .shell--mist .topbar {
          background: ${colors.night};
          border-bottom-color: ${colors.border};
        }
        .shell--mist .bottom-nav {
          background: ${colors.surface};
          border-top: 1px solid ${colors.border};
        }
        .topbar-end {
          display: flex;
          align-items: center;
          gap: ${spacing.sm}px;
        }
        .brand { font-weight: 600; letter-spacing: 0.08em; color: ${colors.gold}; }
        .obs-log-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          color: ${colors.mistMuted};
        }
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          padding: ${spacing.sm}px 0 calc(${spacing.sm}px + env(safe-area-inset-bottom));
          z-index: 20;
        }
        .shell > .bottom-nav {
          position: fixed;
        }
        .nav-link {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: ${spacing.sm}px;
          font-size: 13px;
          color: ${colors.textMuted};
        }
        .nav-link__icon {
          font-size: 16px;
          line-height: 1;
        }
        .shell--today .nav-link { color: ${colors.mistMuted}; }
        .nav-link.active { color: ${colors.gold}; font-weight: 600; }
        @media (min-width: 900px) {
          .bottom-nav {
            top: 0;
            bottom: auto;
            left: 0;
            width: 88px;
            height: 100vh;
            flex-direction: column;
            justify-content: flex-start;
            padding-top: 80px;
            border-top: none;
            border-right: 1px solid ${colors.border};
          }
          .shell { padding-left: 88px; padding-bottom: 0; }
          .shell--today .bottom-nav { border-right-color: var(--glass-border); }
          .nav-link { flex: none; }
        }
      `}</style>
    </div>
  );
}

export function MainLayout() {
  return (
    <MethodCopilotProvider>
      <MainLayoutShell />
    </MethodCopilotProvider>
  );
}
