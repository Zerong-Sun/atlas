import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ReadingReport } from "@atlas/shared-types";
import { getMethod } from "@atlas/method-data";
import type { MethodCopilotTurn } from "@atlas/method-core";
import type { MethodCopilotReportSnapshot } from "@atlas/method-core";
import { getReadingHistory } from "./storage";

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

async function readArchiveStore(): Promise<ArchiveEntry[]> {
  const raw = await AsyncStorage.getItem(ARCHIVE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ArchiveEntry[];
  } catch {
    return [];
  }
}

async function writeArchiveStore(entries: ArchiveEntry[]): Promise<void> {
  await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function resolveArchiveEntryId(snapshot: MethodCopilotReportSnapshot): string {
  if (snapshot.entryId) return snapshot.entryId;
  return `${snapshot.source}:${snapshot.methodId ?? "na"}:${snapshot.generatedAt ?? "unknown"}`;
}

export async function upsertArchiveFromSnapshot(
  snapshot: MethodCopilotReportSnapshot,
  extras?: { readingReport?: ReadingReport },
): Promise<ArchiveEntry> {
  const id = resolveArchiveEntryId(snapshot);
  const prev = await readArchiveStore();
  const existing = prev.find((entry) => entry.id === id);
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
  const next = [entry, ...prev.filter((item) => item.id !== id)];
  await writeArchiveStore(next);
  return entry;
}

export async function saveArchiveInterpretation(entryId: string, turns: MethodCopilotTurn[]): Promise<void> {
  if (turns.length === 0) return;
  const prev = await readArchiveStore();
  const index = prev.findIndex((entry) => entry.id === entryId);
  if (index < 0) return;
  const next = [...prev];
  next[index] = { ...next[index], interpretation: turns };
  await writeArchiveStore(next);
}

export async function getArchiveEntry(id: string): Promise<ArchiveEntry | null> {
  const stored = (await readArchiveStore()).find((entry) => entry.id === id);
  if (stored) return stored;

  const history = await getReadingHistory();
  const reading = history.find((report) => report.readingId === id);
  if (!reading) return null;

  const summary = reading.sections.find((section) => section.type === "summary")?.content;
  const archive = await readArchiveStore();
  return {
    id: reading.readingId,
    source: "reading",
    methodId: reading.traditions[0] ?? null,
    title: "对照报告",
    summary,
    body: summary ?? reading.consensus,
    createdAt: reading.createdAt,
    readingReport: reading,
    interpretation: archive.find((entry) => entry.id === reading.readingId)?.interpretation,
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

async function mergeArchiveMaps(readings: ReadingReport[]): Promise<ArchiveEntry[]> {
  const byId = new Map<string, ArchiveEntry>();
  const archive = await readArchiveStore();

  for (const report of readings) {
    byId.set(report.readingId, readingToArchiveEntry(report));
  }

  for (const entry of archive) {
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

export async function listArchiveEntries(): Promise<ArchiveEntry[]> {
  return mergeArchiveMaps(await getReadingHistory());
}

export async function listArchiveEntriesWithReadings(readings: ReadingReport[]): Promise<ArchiveEntry[]> {
  const local = await getReadingHistory();
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

export function hasArchiveInterpretation(entry: ArchiveEntry): boolean {
  return Boolean(entry.interpretation?.some((turn) => turn.role === "assistant"));
}
