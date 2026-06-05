import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { to: "/methods", icon: "✦", title: "选择占法", subtitle: "八字 / 塔罗 / 易经 / 更多" },
  { to: "/methods/bazi", icon: "◇", title: "测八字", subtitle: "四柱、十神、流年与古文" },
  { to: "/methods/tarot", icon: "▵", title: "塔罗抽卡", subtitle: "三牌阵与组合解释" },
  { to: "/dream", icon: "☽", title: "解梦", subtitle: "输入梦境，生成专业解析" },
] as const;

export function TodayQuickActions() {
  return (
    <section className="today-quick-actions" aria-label="快捷入口">
      <h2 className="today-quick-actions__title">快捷通道 · SHORTCUTS</h2>
      <div className="today-quick-actions__grid">
        {ACTIONS.map((action, i) => (
          <Link
            key={action.to}
            to={action.to}
            className="today-quick-actions__card"
            style={{ "--i": i } as CSSProperties}
          >
            <span className="today-quick-actions__icon" aria-hidden>
              {action.icon}
            </span>
            <strong>{action.title}</strong>
            <span>{action.subtitle}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
