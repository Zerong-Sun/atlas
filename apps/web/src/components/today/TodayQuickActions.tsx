import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

const ACTIONS = [
  { to: "/ask", icon: "✦", title: "进入对照台", subtitle: "把同一个问题交给多种文明视角" },
  { to: "/methods", icon: "◇", title: "象征系统", subtitle: "按提问方式、因果模型和边界浏览" },
  { to: "/methods/tarot", icon: "▵", title: "塔罗抽卡", subtitle: "图像、心理与叙事反思" },
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
