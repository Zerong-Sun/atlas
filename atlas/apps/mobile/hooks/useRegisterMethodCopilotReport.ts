import { useEffect } from "react";
import type { ReadingReport } from "@atlas/shared-types";
import type { MethodCopilotReportSnapshot } from "@atlas/method-core";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { upsertArchiveFromSnapshot } from "@/lib/archive";

export function useRegisterMethodCopilotReport(
  snapshot: MethodCopilotReportSnapshot | null,
  extras?: { readingReport?: ReadingReport },
) {
  const { setReport } = useMethodCopilot();
  const readingReport = extras?.readingReport;

  useEffect(() => {
    setReport(snapshot);
    if (snapshot) {
      void upsertArchiveFromSnapshot(snapshot, readingReport ? { readingReport } : undefined);
    }
    return () => setReport(null);
  }, [snapshot, setReport, readingReport]);
}
