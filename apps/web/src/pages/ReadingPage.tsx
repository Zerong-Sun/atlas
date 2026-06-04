import { Link, useLocation, useParams } from "react-router-dom";
import type { ReadingReport } from "@atlas/shared-types";
import { ReadingResultView } from "@/components/ReadingResultView";
import { Page } from "@/components/ui/Page";
import { getReadingHistory } from "@/lib/storage";
import { colors } from "@/theme/tokens";

export function ReadingPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateReport = (location.state as { report?: ReadingReport } | null)?.report;
  const report =
    stateReport ?? getReadingHistory().find((r) => r.readingId === id) ?? null;

  if (!report) {
    return (
      <Page title="对照报告">
        <p>未找到报告</p>
        <Link to="/ask" style={{ color: colors.gold }}>
          返回提问
        </Link>
      </Page>
    );
  }

  return (
    <Page title="对照报告" wide>
      <ReadingResultView report={report} />
    </Page>
  );
}
