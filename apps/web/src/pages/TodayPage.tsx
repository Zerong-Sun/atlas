import { useEffect, useState } from "react";
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
        <DailyBriefView brief={brief} />
        <TodayQuickActions />
      </Page>
    </DailyColorField>
  );
}
