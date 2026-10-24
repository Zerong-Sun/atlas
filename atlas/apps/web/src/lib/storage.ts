import { arrayOf, isRecord, isString, readSnapshot, writeSnapshot } from "./persistentStore";
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

const isProfile = (v: unknown): v is Record<string, unknown> => isRecord(v)
  && ["displayName", "birthDate", "birthTime", "birthPlace", "timezone"].every((key) => v[key] === undefined || isString(v[key]))
  && ["birthLat", "birthLng"].every((key) => v[key] === undefined || (typeof v[key] === "number" && Number.isFinite(v[key])))
  && (v.portraitSummary === undefined || (isRecord(v.portraitSummary) && isRecord(v.portraitSummary.traditions)
    && Object.values(v.portraitSummary.traditions).every(isString)
    && ["consensus", "divergence", "generatedAt"].every((key) => v.portraitSummary && isRecord(v.portraitSummary) && (v.portraitSummary[key] === undefined || isString(v.portraitSummary[key])))))
  && (v.interests === undefined || arrayOf(isString)(v.interests))
  && (v.disabledTraditions === undefined || arrayOf(isString)(v.disabledTraditions));
export const isReadingReport = (v: unknown): v is ReadingReport => isRecord(v)
  && isString(v.readingId) && isString(v.createdAt) && isString(v.consensus)
  && isString(v.divergence) && arrayOf(isString)(v.traditions)
  && Array.isArray(v.citations) && v.citations.every((c) => isRecord(c)
    && isString(c.chunkId) && isString(c.original) && isString(c.translationZh)
    && (c.annotationZh === undefined || isString(c.annotationZh))
    && (c.application === undefined || isString(c.application)))
  && Array.isArray(v.sections) && v.sections.every((s) => isRecord(s)
    && isString(s.type) && isString(s.title) && isString(s.content)
    && (s.metadata === undefined || isRecord(s.metadata)))
  && (v.questionFrame === undefined || (isRecord(v.questionFrame)
    && ["rawText", "timeHorizon", "decisionPressure"].every((key) => isString((v.questionFrame as Record<string, unknown>)[key]))
    && ["domains", "sensitivity", "recommendedMethodIds", "discouragedMethodIds"].every((key) => arrayOf(isString)((v.questionFrame as Record<string, unknown>)[key]))
    && typeof v.questionFrame.needsBirthData === "boolean" && typeof v.questionFrame.needsLocation === "boolean"))
  && (v.questionTranslations === undefined || (Array.isArray(v.questionTranslations) && v.questionTranslations.every((t) =>
    isRecord(t) && ["methodId", "methodTitle", "translatedQuestion", "rationale"].every((key) => isString(t[key])))))
  && (v.structuredFacts === undefined || (Array.isArray(v.structuredFacts) && v.structuredFacts.every((f) =>
    isRecord(f) && isString(f.tradition) && isString(f.computedAt) && isRecord(f.facts))));
const isTarotDraw = (v: unknown): v is TarotDrawHistoryItem => isRecord(v)
  && isString(v.id) && isString(v.time) && isString(v.question) && isString(v.spread)
  && isString(v.spreadId) && Array.isArray(v.cards) && v.cards.every((c) => isRecord(c)
    && isString(c.name) && isString(c.position) && typeof c.reversed === "boolean");
const isSense = (v: unknown): v is TarotSenseRecord => isRecord(v)
  && isString(v.cardId) && isString(v.cardName) && isString(v.updatedAt)
  && isRecord(v.fields) && Object.values(v.fields).every(isString);
const isSenseMap = (v: unknown): v is Record<string, TarotSenseRecord> =>
  isRecord(v) && Object.values(v).every(isSense);
const isQimen = (v: unknown): v is QimenBoardHistoryItem => isRecord(v)
  && isString(v.id) && isString(v.time) && isString(v.question) && isString(v.summary)
  && isString(v.dun) && typeof v.ju === "number" && (v.juMethod === "chaibu" || v.juMethod === "zhirun");
const isDream = (v: unknown): v is DreamInterpretation => isRecord(v)
  && isString(v.entryId) && isString(v.createdAt) && isString(v.chinese)
  && isString(v.jungian) && isString(v.reflection)
  && (v.symbols === undefined || arrayOf(isString)(v.symbols));
const isOnboarding = (v: unknown): v is boolean | number => v === true || v === false || v === 0 || v === 1;

export async function getOnboardingDone(): Promise<boolean> {
  return Boolean(readSnapshot(KEYS.onboarding, false, isOnboarding));
}
export async function setOnboardingDone(done: boolean): Promise<void> {
  writeSnapshot(KEYS.onboarding, done, isOnboarding);
}
export async function getLocalProfile(): Promise<Record<string, unknown>> {
  return readSnapshot(KEYS.profile, {}, isProfile);
}
export async function setLocalProfile(partial: Record<string, unknown>): Promise<void> {
  // Keep read/merge/write synchronous, including concurrent calls in one tick.
  const prev = readSnapshot(KEYS.profile, {}, isProfile);
  writeSnapshot(KEYS.profile, { ...prev, ...partial }, isProfile);
}
export async function getInterests(): Promise<string[]> {
  return readSnapshot(KEYS.interests, [], arrayOf(isString));
}
export async function setInterests(ids: string[]): Promise<void> {
  writeSnapshot(KEYS.interests, ids, arrayOf(isString));
}
export function getReadingHistory(): ReadingReport[] {
  return readSnapshot(KEYS.readings, [], arrayOf(isReadingReport));
}
export function appendReadingHistory(report: ReadingReport): void {
  const next = [report, ...getReadingHistory().filter((r) => r.readingId !== report.readingId)].slice(0, 100);
  writeSnapshot(KEYS.readings, next, arrayOf(isReadingReport));
}
export function getTarotDrawHistory(): TarotDrawHistoryItem[] {
  return readSnapshot(KEYS.tarotDrawHistory, [], arrayOf(isTarotDraw));
}
export function appendTarotDrawHistory(item: TarotDrawHistoryItem): void {
  const next = [item, ...getTarotDrawHistory().filter((h) => h.id !== item.id)].slice(0, 50);
  writeSnapshot(KEYS.tarotDrawHistory, next, arrayOf(isTarotDraw));
}
export function getTarotSenseRecords(): Record<string, TarotSenseRecord> {
  return readSnapshot(KEYS.tarotSenseRecords, {}, isSenseMap);
}
export function saveTarotSenseRecord(record: TarotSenseRecord): void {
  writeSnapshot(KEYS.tarotSenseRecords, { ...getTarotSenseRecords(), [record.cardId]: record }, isSenseMap);
}
export function getQimenBoardHistory(): QimenBoardHistoryItem[] {
  return readSnapshot(KEYS.qimenBoardHistory, [], arrayOf(isQimen));
}
export function appendQimenBoardHistory(item: QimenBoardHistoryItem): void {
  const next = [item, ...getQimenBoardHistory().filter((h) => h.id !== item.id)].slice(0, 10);
  writeSnapshot(KEYS.qimenBoardHistory, next, arrayOf(isQimen));
}
export function getDreamHistory(): DreamInterpretation[] {
  return readSnapshot(KEYS.dreams, [], arrayOf(isDream));
}
export function appendDreamHistory(entry: DreamInterpretation): void {
  const next = [entry, ...getDreamHistory().filter((d) => d.entryId !== entry.entryId)].slice(0, 100);
  writeSnapshot(KEYS.dreams, next, arrayOf(isDream));
}
