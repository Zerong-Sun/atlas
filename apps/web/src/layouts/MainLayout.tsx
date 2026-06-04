import { NavLink, Outlet } from "react-router-dom";
import { useMockApi } from "@/lib/api/client";
import { colors, spacing } from "@/theme/tokens";

const NAV = [
  { to: "/", label: "今日", end: true },
  { to: "/ask", label: "提问" },
  { to: "/dream", label: "梦境" },
  { to: "/profile", label: "档案" },
  { to: "/library", label: "书库" },
] as const;

export function MainLayout() {
  const mock = useMockApi();

  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        跳到主内容
      </a>
      <header className="topbar">
        <span className="brand">诸象 Atlas</span>
        {mock && <span className="mock-badge">演示模式</span>}
      </header>

      <Outlet />

      <nav className="bottom-nav" aria-label="主导航">
        {NAV.map(({ to, label, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={"end" in rest ? rest.end : false}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
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
          color: ${colors.ink};
        }
        .skip-link:focus { left: 8px; top: 8px; }
        .shell { min-height: 100vh; background: ${colors.ink}; padding-bottom: 72px; }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${spacing.md}px ${spacing.lg}px;
          border-bottom: 1px solid ${colors.border};
          position: sticky;
          top: 0;
          z-index: 10;
          background: ${colors.ink};
        }
        .brand { font-weight: 600; letter-spacing: 0.08em; color: ${colors.gold}; }
        .mock-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid ${colors.goldDim};
          color: ${colors.gold};
        }
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          background: ${colors.surface};
          border-top: 1px solid ${colors.border};
          padding: ${spacing.sm}px 0 calc(${spacing.sm}px + env(safe-area-inset-bottom));
          z-index: 20;
        }
        .nav-link {
          flex: 1;
          text-align: center;
          padding: ${spacing.sm}px;
          font-size: 13px;
          color: ${colors.textMuted};
        }
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
          .nav-link { flex: none; }
        }
      `}</style>
    </div>
  );
}
