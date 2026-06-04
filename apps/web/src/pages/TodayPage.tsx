import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DailyBrief } from "@atlas/shared-types";
import { DailyBriefView } from "@/components/DailyBriefView";
import { Page } from "@/components/ui/Page";
import { fetchDailyBrief } from "@/lib/api/daily";
import { colors, radius, spacing } from "@/theme/tokens";

const QUICK_ACTIONS = [
  { to: "/ask", title: "同题多算", subtitle: "塔罗 / 八字 / 占星 / 易经" },
  { to: "/dream", title: "解梦", subtitle: "输入梦境，生成专业解析" },
  { to: "/profile", title: "档案", subtitle: "切换出生资料与姓名" },
  { to: "/library", title: "典籍库", subtitle: "查看引用与体系分布" },
];

export function TodayPage() {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDailyBrief()
      .then(setBrief)
      .catch(() => setError("今日简报加载失败，请刷新页面重试。"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Page>
        <p className="loader" role="status">
          加载今日简报…
        </p>
        <style>{`.loader { margin-top: 80px; text-align: center; color: ${colors.gold}; }`}</style>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <p className="error-banner" role="alert">
          {error}
        </p>
      </Page>
    );
  }

  return (
    <Page>
      {brief && <DailyBriefView brief={brief} />}
      <section className="quick-actions" aria-label="快捷入口">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.to} to={action.to}>
            <strong>{action.title}</strong>
            <span>{action.subtitle}</span>
          </Link>
        ))}
      </section>
      <style>{`
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: ${spacing.sm}px;
          margin-top: ${spacing.lg}px;
        }
        .quick-actions a {
          min-height: 88px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: ${spacing.sm}px;
          padding: ${spacing.md}px;
          border: 1px solid ${colors.border};
          border-radius: ${radius.sm}px;
          background: ${colors.surface};
          color: ${colors.text};
          text-decoration: none;
        }
        .quick-actions a:hover {
          border-color: ${colors.goldDim};
          background: ${colors.goldDim}16;
        }
        .quick-actions strong { color: ${colors.gold}; }
        .quick-actions span { color: ${colors.textMuted}; font-size: 12px; line-height: 1.35; }
        @media (max-width: 760px) {
          .quick-actions { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </Page>
  );
}
