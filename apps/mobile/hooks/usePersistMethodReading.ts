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
  /** When false, only registers copilot context without writing archive (e.g. replay screens). */
  persist?: boolean;
};

export function usePersistMethodReading({
  snapshot,
  payload,
  ready = true,
  readingReport,
  entryId,
  persist = true,
}: Options) {
  const { setReport } = useMethodCopilot();
  const savedRef = useRef<string | null>(null);
  const bodyRef = useRef(snapshot?.body);

  useEffect(() => {
    if (snapshot?.body !== bodyRef.current) {
      bodyRef.current = snapshot?.body;
      savedRef.current = null;
    }
  }, [snapshot?.body]);

  useEffect(() => {
    if (!snapshot || !ready) {
      setReport(null);
      return;
    }

    const enriched: MethodCopilotReportSnapshot = entryId
      ? { ...snapshot, entryId }
      : snapshot;

    setReport(enriched);

    if (!persist) {
      return () => setReport(null);
    }

    const saveKey = enriched.entryId ?? `${enriched.methodId}-${enriched.generatedAt ?? "na"}`;
    if (savedRef.current === saveKey) {
      return () => setReport(null);
    }
    savedRef.current = saveKey;

    void upsertArchiveFromSnapshot(enriched, {
      readingReport,
      payload: payload ?? undefined,
    });

    return () => setReport(null);
  }, [snapshot, payload, ready, readingReport, entryId, persist, setReport]);

  useEffect(() => {
    if (!entryId) return;
    savedRef.current = null;
  }, [entryId]);
}
