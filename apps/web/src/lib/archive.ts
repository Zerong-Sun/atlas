import type { ReadingReport } from "@atlas/shared-types";
import type { MethodCopilotTurn } from "@/lib/api/methodCopilot";
import type { MethodCopilotReportSnapshot } from "@/lib/methodReportSnapshot";
import { getMethod } from "@/data/divinationMethods";
import { getReadingHistory } from "@/lib/storage";

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

function readArchiveStore(): ArchiveEntry[] {
  const raw = localStorage.getItem(ARCHIVE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ArchiveEntry[];
  } catch {
    return [];
  }
}

function writeArchiveStore(entries: ArchiveEntry[]): void {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
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
  const existing = readArchiveStore().find((entry) => entry.id === id);
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
  const next = [entry, ...readArchiveStore().filter((item) => item.id !== id)];
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

function readingToArchiveEntry(report: ReadingReport): ArchiveEntry {
  const stored = readArchiveStore().find((entry) => entry.id === report.readingId);
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
  const byId = new Map<string, ArchiveEntry>();

  for (const report of readings) {
    byId.set(report.readingId, readingToArchiveEntry(report));
  }

  for (const entry of readArchiveStore()) {
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
  const localIds = new Set(getReadingHistory().map((report) => report.readingId));
  const merged = [...getReadingHistory()];
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
