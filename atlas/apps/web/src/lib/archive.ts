import { arrayOf, isRecord, isString, readSnapshot, writeSnapshot } from "./persistentStore";
import type { ReadingReport } from "@atlas/shared-types";
import type { MethodCopilotTurn } from "@/lib/api/methodCopilot";
import type { MethodCopilotReportSnapshot } from "@/lib/methodReportSnapshot";
import { getMethod } from "@/data/divinationMethods";
import { getReadingHistory, isReadingReport } from "@/lib/storage";

export type ArchiveEntry = {
  id: string;
  source: MethodCopilotReportSnapshot["source"];
  methodId: string | null;
  title: string;
  summary?: string;
  body: string;
  createdAt: string;
  readingReport?: ReadingReport;
  interpretation?: MethodCopilotTurn[];
};

const ARCHIVE_KEY = "atlas:archive";
const MAX_ENTRIES = 200;

const isArchiveEntry = (v: unknown): v is ArchiveEntry => isRecord(v)
  && isString(v.id) && ["method", "reading", "module"].includes(String(v.source)) && isString(v.title) && isString(v.body)
  && (v.summary === undefined || isString(v.summary))
  && isString(v.createdAt) && (v.methodId === null || isString(v.methodId))
  && (v.readingReport === undefined || isReadingReport(v.readingReport))
  && (v.interpretation === undefined || (Array.isArray(v.interpretation)
    && v.interpretation.every((t) => isRecord(t) && (t.role === "user" || t.role === "assistant") && isString(t.content)
      && (t.diagram === undefined || isString(t.diagram))
      && (t.relatedTerms === undefined || arrayOf(isString)(t.relatedTerms))
      && (t.highlights === undefined || arrayOf(isString)(t.highlights))
      && (t.degraded === undefined || typeof t.degraded === "boolean")
      && (t.sections === undefined || (Array.isArray(t.sections) && t.sections.every((section) =>
        isRecord(section) && isString(section.title) && isString(section.content)))))));
function readArchiveStore(): ArchiveEntry[] {
  return readSnapshot(ARCHIVE_KEY, [], arrayOf(isArchiveEntry));
}
function writeArchiveStore(entries: ArchiveEntry[]): void {
  writeSnapshot(ARCHIVE_KEY, entries.slice(0, MAX_ENTRIES), arrayOf(isArchiveEntry));
}

export function resolveArchiveEntryId(snapshot: MethodCopilotReportSnapshot): string {
  if (snapshot.entryId) return snapshot.entryId;
  return `${snapshot.source}:${snapshot.methodId ?? "na"}:${snapshot.generatedAt ?? "unknown"}`;
}

export function upsertArchiveFromSnapshot(
  snapshot: MethodCopilotReportSnapshot,
  extras?: { readingReport?: ReadingReport },
): ArchiveEntry {
  const id = resolveArchiveEntryId(snapshot);
  const entries = readArchiveStore();
  const existing = entries.find((entry) => entry.id === id);
  const entry: ArchiveEntry = {
    id,
    source: snapshot.source,
    methodId: snapshot.methodId,
    title: snapshot.title,
    summary: snapshot.summary,
    body: snapshot.body,
    createdAt: snapshot.generatedAt ?? new Date().toISOString(),
    readingReport: extras?.readingReport ?? existing?.readingReport,
    interpretation: existing?.interpretation,
  };
  const next = [entry, ...entries.filter((item) => item.id !== id)];
  writeArchiveStore(next);
  return entry;
}

export function saveArchiveInterpretation(entryId: string, turns: MethodCopilotTurn[]): void {
  if (turns.length === 0) return;
  const prev = readArchiveStore();
  const index = prev.findIndex((entry) => entry.id === entryId);
  if (index < 0) return;
  const next = [...prev];
  next[index] = { ...next[index], interpretation: turns };
  writeArchiveStore(next);
}

export function getArchiveEntry(id: string): ArchiveEntry | null {
  const stored = readArchiveStore().find((entry) => entry.id === id);
  if (stored) return stored;

  const reading = getReadingHistory().find((report) => report.readingId === id);
  if (!reading) return null;

  const summary = reading.sections.find((section) => section.type === "summary")?.content;
  return {
    id: reading.readingId,
    source: "reading",
    methodId: reading.traditions[0] ?? null,
    title: `对照报告`,
    summary,
    body: summary ?? reading.consensus,
    createdAt: reading.createdAt,
    readingReport: reading,
    interpretation: readArchiveStore().find((entry) => entry.id === reading.readingId)?.interpretation,
  };
}

function readingToArchiveEntry(report: ReadingReport, stored?: ArchiveEntry): ArchiveEntry {
  const summary = report.sections.find((section) => section.type === "summary")?.content;
  const question = report.sections.find((section) => section.type === "question_restate")?.content;

  return {
    id: report.readingId,
    source: "reading",
    methodId: report.traditions[0] ?? null,
    title: question?.slice(0, 48) || "提问对照",
    summary: summary ?? report.consensus,
    body: stored?.body ?? summary ?? report.consensus,
    createdAt: report.createdAt,
    readingReport: report,
    interpretation: stored?.interpretation,
  };
}

function mergeArchiveMaps(readings: ReadingReport[]): ArchiveEntry[] {
  const entries = readArchiveStore();
  const storedById = new Map(entries.map((entry) => [entry.id, entry]));
  const byId = new Map<string, ArchiveEntry>();

  for (const report of readings) {
    byId.set(report.readingId, readingToArchiveEntry(report, storedById.get(report.readingId)));
  }

  for (const entry of entries) {
    const existing = byId.get(entry.id);
    if (existing) {
      byId.set(entry.id, {
        ...existing,
        body: entry.body || existing.body,
        summary: entry.summary ?? existing.summary,
        interpretation: entry.interpretation ?? existing.interpretation,
      });
      continue;
    }
    byId.set(entry.id, entry);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function listArchiveEntries(): ArchiveEntry[] {
  return mergeArchiveMaps(getReadingHistory());
}

export function listArchiveEntriesWithReadings(readings: ReadingReport[]): ArchiveEntry[] {
  const local = getReadingHistory();
  const localIds = new Set(local.map((report) => report.readingId));
  const merged = [...local];
  for (const report of readings) {
    if (!localIds.has(report.readingId)) merged.push(report);
  }
  return mergeArchiveMaps(merged);
}

export function archiveEntryLabel(entry: ArchiveEntry): string {
  if (entry.source === "reading") return "提问对照";
  if (entry.methodId === "dream") return "占梦";
  if (entry.source === "module") return "占法预测";
  return getMethod(entry.methodId ?? "")?.title ?? entry.title;
}

export function archiveEntryPath(entry: ArchiveEntry): string {
  if (entry.readingReport || entry.source === "reading") return `/reading/${entry.id}`;
  return `/archive/${entry.id}`;
}

export function hasArchiveInterpretation(entry: ArchiveEntry): boolean {
  return Boolean(entry.interpretation?.some((turn) => turn.role === "assistant"));
}
