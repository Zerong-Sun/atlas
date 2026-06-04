import { useEffect, useState } from "react";
import type { DailyBrief } from "@atlas/shared-types";
import { DailyBriefView } from "@/components/DailyBriefView";
import { Page } from "@/components/ui/Page";
import { fetchDailyBrief } from "@/lib/api/daily";
import { colors } from "@/theme/tokens";

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

  return <Page>{brief && <DailyBriefView brief={brief} />}</Page>;
}
