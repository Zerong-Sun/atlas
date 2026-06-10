import { useEffect, useRef } from "react";
import type { ReadingReport } from "@atlas/shared-types";
import type { MethodCopilotReportSnapshot } from "@atlas/method-core";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { upsertArchiveFromSnapshot } from "@/lib/archive";
import type { MethodReadingPayload } from "@/lib/methodReadings";

type Options = {
  snapshot: MethodCopilotReportSnapshot | null;
  payload?: MethodReadingPayload | null;
  ready?: boolean;
  readingReport?: ReadingReport;
  entryId?: string;
};

export function usePersistMethodReading({
  snapshot,
  payload,
  ready = true,
  readingReport,
  entryId,
}: Options) {
  const { setReport } = useMethodCopilot();
  const savedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot || !ready) {
      setReport(null);
      return;
    }

    const enriched: MethodCopilotReportSnapshot = entryId
      ? { ...snapshot, entryId }
      : snapshot;

    setReport(enriched);

    const saveKey = `${enriched.entryId ?? enriched.methodId}-${enriched.generatedAt}`;
    if (savedRef.current === saveKey) return;
    savedRef.current = saveKey;

    void upsertArchiveFromSnapshot(enriched, {
      readingReport,
      payload: payload ?? undefined,
    });

    return () => setReport(null);
  }, [snapshot, payload, ready, readingReport, entryId, setReport]);
}
