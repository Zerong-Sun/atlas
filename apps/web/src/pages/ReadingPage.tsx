import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { ReadingReport } from "@atlas/shared-types";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { ReadingResultView } from "@/components/ReadingResultView";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildReadingReportSnapshot } from "@/lib/methodReportSnapshot";
import { getReadingHistory } from "@/lib/storage";
import { colors } from "@/theme/tokens";

export function ReadingPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateReport = (location.state as { report?: ReadingReport } | null)?.report;
  const report =
    stateReport ?? getReadingHistory().find((r) => r.readingId === id) ?? null;

  const copilotReport = useMemo(
    () => (report ? buildReadingReportSnapshot(report) : null),
    [report],
  );
  useRegisterMethodCopilotReport(copilotReport);

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
      <div className="method-result-actions">
        <MethodCopilotTrigger variant="analyze" label="AI 解析对照报告" />
      </div>
      <ReadingResultView report={report} />
    </Page>
  );
}
