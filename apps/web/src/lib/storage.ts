import type { DreamInterpretation } from "@atlas/api-core";
import type { ReadingReport } from "@atlas/shared-types";

export interface TarotDrawHistoryItem {
  id: string;
  time: string;
  question: string;
  spread: string;
  spreadId: string;
  scenario?: string;
  cards: Array<{ name: string; position: string; reversed: boolean }>;
}

export interface TarotSenseRecord {
  cardId: string;
  cardName: string;
  fields: Record<string, string>;
  updatedAt: string;
}

export interface QimenBoardHistoryItem {
  id: string;
  time: string;
  question: string;
  juMethod: "chaibu" | "zhirun";
  dun: string;
  ju: number;
  summary: string;
}

const KEYS = {
  onboarding: "atlas:onboarding_done",
  profile: "atlas:local_profile",
  interests: "atlas:interests",
  readings: "atlas:reading_history",
  dreams: "atlas:dream_history",
  tarotDrawHistory: "atlas:tarot_draw_history",
  tarotSenseRecords: "atlas:tarot_sense_records",
  qimenBoardHistory: "atlas:qimen_board_history",
} as const;

export async function getOnboardingDone(): Promise<boolean> {
  return localStorage.getItem(KEYS.onboarding) === "1";
}

export async function setOnboardingDone(done: boolean): Promise<void> {
  localStorage.setItem(KEYS.onboarding, done ? "1" : "0");
}

export async function getLocalProfile(): Promise<Record<string, unknown>> {
  const raw = localStorage.getItem(KEYS.profile);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function setLocalProfile(partial: Record<string, unknown>): Promise<void> {
  const prev = await getLocalProfile();
  localStorage.setItem(KEYS.profile, JSON.stringify({ ...prev, ...partial }));
}

export async function getInterests(): Promise<string[]> {
  const raw = localStorage.getItem(KEYS.interests);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function setInterests(ids: string[]): Promise<void> {
  localStorage.setItem(KEYS.interests, JSON.stringify(ids));
}

export function getReadingHistory(): ReadingReport[] {
  const raw = localStorage.getItem(KEYS.readings);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReadingReport[];
  } catch {
    return [];
  }
}

export function appendReadingHistory(report: ReadingReport): void {
  const prev = getReadingHistory();
  const next = [report, ...prev.filter((r) => r.readingId !== report.readingId)].slice(0, 100);
  localStorage.setItem(KEYS.readings, JSON.stringify(next));
}

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getTarotDrawHistory(): TarotDrawHistoryItem[] {
  return readJson(KEYS.tarotDrawHistory, []);
}

export function appendTarotDrawHistory(item: TarotDrawHistoryItem): void {
  const next = [item, ...getTarotDrawHistory().filter((h) => h.id !== item.id)].slice(0, 50);
  localStorage.setItem(KEYS.tarotDrawHistory, JSON.stringify(next));
}

export function getTarotSenseRecords(): Record<string, TarotSenseRecord> {
  return readJson(KEYS.tarotSenseRecords, {});
}

export function saveTarotSenseRecord(record: TarotSenseRecord): void {
  const prev = getTarotSenseRecords();
  localStorage.setItem(KEYS.tarotSenseRecords, JSON.stringify({ ...prev, [record.cardId]: record }));
}

export function getQimenBoardHistory(): QimenBoardHistoryItem[] {
  return readJson(KEYS.qimenBoardHistory, []);
}

export function appendQimenBoardHistory(item: QimenBoardHistoryItem): void {
  const next = [item, ...getQimenBoardHistory().filter((h) => h.id !== item.id)].slice(0, 10);
  localStorage.setItem(KEYS.qimenBoardHistory, JSON.stringify(next));
}

export function getDreamHistory(): DreamInterpretation[] {
  return readJson<DreamInterpretation[]>(KEYS.dreams, []);
}

export function appendDreamHistory(entry: DreamInterpretation): void {
  const next = [entry, ...getDreamHistory().filter((d) => d.entryId !== entry.entryId)].slice(0, 100);
  localStorage.setItem(KEYS.dreams, JSON.stringify(next));
}
