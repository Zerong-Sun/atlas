import type { MethodCopilotReportSnapshot } from "@atlas/method-core";
import {
  getArchiveEntry,
  listArchiveEntries,
  upsertArchiveFromSnapshot,
  type ArchiveEntry,
} from "./archive";

export type MethodReadingPayload = {
  methodId: string;
  question?: string;
  inputs?: Record<string, unknown>;
  result: unknown;
};

export type MethodReadingRecord = ArchiveEntry & {
  payload?: MethodReadingPayload;
};

const RICH_REPLAY_METHODS = new Set(["tarot", "lenormand"]);

export function hasRichReplay(entry: ArchiveEntry): boolean {
  return Boolean(entry.payload && RICH_REPLAY_METHODS.has(entry.payload.methodId));
}

export function buildMethodReadingEntryId(methodId: string, timestamp?: number): string {
  return `${methodId}-${timestamp ?? Date.now()}`;
}

export function methodReadingPreview(entry: MethodReadingRecord): string {
  if (entry.summary) return entry.summary;
  if (entry.payload?.question) return entry.payload.question;
  return entry.title;
}

export async function saveMethodReading(
  snapshot: MethodCopilotReportSnapshot,
  payload: MethodReadingPayload,
  extras?: { readingReport?: ArchiveEntry["readingReport"] },
): Promise<MethodReadingRecord> {
  const entry = await upsertArchiveFromSnapshot(snapshot, {
    ...extras,
    payload,
  });
  return entry as MethodReadingRecord;
}

export async function listMethodReadings(opts?: {
  methodId?: string;
  limit?: number;
}): Promise<MethodReadingRecord[]> {
  const entries = await listArchiveEntries();
  const filtered = entries.filter((entry) => {
    if (entry.source === "reading") return false;
    if (!entry.methodId || entry.methodId === "dream") return false;
    if (opts?.methodId && entry.methodId !== opts.methodId) return false;
    return entry.source === "method" || entry.source === "module" || Boolean(entry.payload);
  });
  const limit = opts?.limit ?? filtered.length;
  return filtered.slice(0, limit) as MethodReadingRecord[];
}

export async function getMethodReading(id: string): Promise<MethodReadingRecord | null> {
  const entry = await getArchiveEntry(id);
  return entry as MethodReadingRecord | null;
}
