import { useEffect } from "react";
import type { ReadingReport } from "@atlas/shared-types";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { upsertArchiveFromSnapshot } from "@/lib/archive";
import type { MethodCopilotReportSnapshot } from "@/lib/methodReportSnapshot";

export function useRegisterMethodCopilotReport(
  snapshot: MethodCopilotReportSnapshot | null,
  extras?: { readingReport?: ReadingReport },
) {
  const { setReport } = useMethodCopilot();

  useEffect(() => {
    setReport(snapshot);
    if (snapshot) {
      upsertArchiveFromSnapshot(snapshot, extras);
    }
    return () => setReport(null);
  }, [snapshot, setReport, extras?.readingReport]);
}
