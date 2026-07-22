import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DailyBrief } from "@atlas/shared-types";
import { DailyBriefView } from "@/components/DailyBriefView";
import { DailyColorField, todayIsoDate } from "@/components/DailyColorField";
import { TodayHero } from "@/components/today/TodayHero";
import { TodayLoadingSkeleton } from "@/components/today/TodayLoadingSkeleton";
import { TodayQuickActions } from "@/components/today/TodayQuickActions";
import { Page } from "@/components/ui/Page";
import { fetchDailyBrief } from "@/lib/api/daily";

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

  const shellDate = brief?.date ?? todayIsoDate();

  if (loading) {
    return (
      <DailyColorField date={shellDate} static>
        <Page transparent className="today-page">
          <TodayLoadingSkeleton />
        </Page>
      </DailyColorField>
    );
  }

  if (error) {
    return (
      <DailyColorField date={shellDate} static>
        <Page transparent className="today-page">
          <p className="error-banner" role="alert">
            {error}
          </p>
        </Page>
      </DailyColorField>
    );
  }

  if (!brief) return null;

  return (
    <DailyColorField date={brief.date} serverDayColor={brief.dayColor}>
      <Page transparent className="today-page">
        <TodayHero brief={brief} />
        <TodayQuestion />
        <DailyBriefView brief={brief} />
        <TodayQuickActions />
      </Page>
    </DailyColorField>
  );
}

function TodayQuestion() {
  const question = "我现在真正想改变的，是外部处境，还是自己在处境中的位置？";
  const href = `/ask?q=${encodeURIComponent(question)}`;

  return (
    <section className="today-question" aria-labelledby="today-question-title">
      <p>QUESTION OF THE DAY</p>
      <h2 id="today-question-title">{question}</h2>
      <div className="today-question__lenses">
        <span>周易会问：此时此位是否宜变？</span>
        <span>塔罗会问：你在改变中害怕失去什么？</span>
        <span>八字会问：这是否是阶段节律的触发？</span>
      </div>
      <Link to={href}>放上桌</Link>
      <style>{`
        .today-question {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
        }
        .today-question p {
          margin: 0;
          color: var(--color-gold);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .today-question h2 {
          max-width: 760px;
          margin: 0;
          color: var(--color-text);
          font-family: var(--font-serif);
          font-size: 1.45rem;
          line-height: 1.4;
        }
        .today-question__lenses {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: var(--spacing-sm);
        }
        .today-question__lenses span {
          padding: var(--spacing-sm);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-surface-elevated);
          color: var(--color-text-secondary);
          font-size: 0.88rem;
          line-height: 1.45;
        }
        .today-question a {
          width: fit-content;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--color-gold-dim);
          border-radius: var(--radius-sm);
          color: var(--color-gold);
          text-decoration: none;
          font-weight: 700;
        }
        @media (max-width: 760px) {
          .today-question__lenses { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
