/**
 * Atlas mobile BFF — Supabase Edge Functions with mock fallback.
 *
 * Spec names → deployed function folders:
 * - create-reading
 * - interpret-dream → create-dream
 * - daily-brief
 * - library-list → get-library (GET)
 */
import type {
  DailyBrief,
  DreamEntryInput,
  QuestionInput,
  ReadingReport,
  Tradition,
  UserProfile,
} from "@atlas/shared-types";
import {
  buildMockReading,
  MOCK_DAILY_BRIEF,
  MOCK_DREAM_TREND,
  MOCK_LIBRARY_ENTRIES,
  MOCK_PORTRAIT,
  MOCK_PROFILE,
  MOCK_READING_HISTORY,
} from "./mock/data";
import { invokeFunction, invokeFunctionGet, isSupabaseConfigured } from "./supabase";

export const EDGE = {
  createReading: "create-reading",
  listReadings: "list-readings",
  interpretDream: "create-dream",
  dailyBrief: "daily-brief",
  libraryList: "get-library",
  profile: "profile",
} as const;

export function useMockApi(): boolean {
  return !isSupabaseConfigured;
}

export interface DreamInterpretation {
  entryId: string;
  chinese: string;
  jungian: string;
  reflection: string;
  createdAt: string;
}

export interface DreamTrend {
  periodDays: number;
  topSymbols: { symbol: string; count: number }[];
  summary: string;
}

export interface LibraryEntry {
  id: string;
  slug: string;
  labelZh: string;
  tradition: Tradition;
  definitionZh: string;
}

type LibraryApiResponse = {
  concepts?: Array<{
    id: string;
    slug?: string;
    label_zh: string;
    tradition: Tradition;
    definition_zh?: string;
  }>;
};

type ListReadingsResponse = {
  readings?: ReadingReport[];
};

export type ProfileUpdateInput = Partial<
  Pick<
    UserProfile,
    | "displayName"
    | "birthDate"
    | "birthTime"
    | "birthPlace"
    | "birthLat"
    | "birthLng"
    | "timezone"
    | "disabledTraditions"
    | "onboardingCompleted"
  >
> & { interests?: string[] };

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function mapDreamRow(row: Record<string, unknown>): DreamInterpretation {
  const interp = (row.interpretation ?? {}) as Record<string, string>;
  return {
    entryId: String(row.id ?? `dream-${Date.now()}`),
    chinese: interp.chinese ?? "",
    jungian: interp.jungian ?? "",
    reflection: interp.islamic ?? interp.reflection ?? "",
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapLibraryResponse(data: LibraryApiResponse): LibraryEntry[] {
  return (data.concepts ?? []).map((c) => ({
    id: c.id,
    slug: c.slug ?? c.id,
    labelZh: c.label_zh,
    tradition: c.tradition,
    definitionZh: c.definition_zh ?? "",
  }));
}

/** POST create-reading */
export async function createReading(input: QuestionInput): Promise<ReadingReport> {
  if (useMockApi()) {
    await delay(800);
    return buildMockReading(input.text, input.traditions);
  }
  const data = await invokeFunction<ReadingReport>(EDGE.createReading, {
    text: input.text,
    category: input.category,
    traditions: input.traditions,
  });
  return data ?? buildMockReading(input.text, input.traditions);
}

/** Local / future: reading history — mock when no list endpoint */
export async function listReadings(): Promise<ReadingReport[]> {
  if (useMockApi()) return [...MOCK_READING_HISTORY];
  const data = await invokeFunctionGet<ListReadingsResponse>(EDGE.listReadings);
  if (data?.readings?.length) return data.readings;
  return [...MOCK_READING_HISTORY];
}

/** POST interpret-dream (create-dream) */
export async function interpretDream(input: DreamEntryInput): Promise<DreamInterpretation> {
  if (useMockApi()) {
    await delay(600);
    return {
      entryId: `dream-${Date.now()}`,
      chinese: `【中国梦占】梦中「${input.symbols.join("、") || "意象"}」或象征内心流转与待启之门；情绪「${input.emotions.join("、") || "平和"}」提示近期宜留意边界感。`,
      jungian: `【荣格简释】符号可能对应集体原型中的「过渡」主题，建议记录三日内的重复意象。`,
      reflection: `【精神反思】可将此梦视为自我觉察的邀请，而非命运预告。`,
      createdAt: new Date().toISOString(),
    };
  }
  const data = await invokeFunction<Record<string, unknown>>(EDGE.interpretDream, {
    text: input.text,
    emotions: input.emotions,
    symbols: input.symbols,
  });
  if (data) return mapDreamRow(data);
  return {
    entryId: `dream-${Date.now()}`,
    chinese: "解读暂不可用，请稍后重试。",
    jungian: "",
    reflection: "",
    createdAt: new Date().toISOString(),
  };
}

/** Seven-day dream trend — mock until edge endpoint exists */
export async function fetchDreamTrend(): Promise<DreamTrend> {
  if (useMockApi()) return { ...MOCK_DREAM_TREND };
  return { ...MOCK_DREAM_TREND };
}

/** POST daily-brief */
export async function fetchDailyBrief(date?: string): Promise<DailyBrief> {
  if (useMockApi()) {
    return { ...MOCK_DAILY_BRIEF, date: date ?? MOCK_DAILY_BRIEF.date };
  }
  const data = await invokeFunction<DailyBrief>(EDGE.dailyBrief, { date });
  return data ?? { ...MOCK_DAILY_BRIEF, date: date ?? MOCK_DAILY_BRIEF.date };
}

/** GET library-list (get-library) */
export async function listLibrary(opts?: {
  tradition?: Tradition;
  query?: string;
}): Promise<LibraryEntry[]> {
  if (useMockApi()) {
    let items = [...MOCK_LIBRARY_ENTRIES];
    if (opts?.tradition) items = items.filter((e) => e.tradition === opts.tradition);
    if (opts?.query) {
      const q = opts.query.toLowerCase();
      items = items.filter(
        (e) => e.labelZh.includes(opts.query!) || e.definitionZh.toLowerCase().includes(q)
      );
    }
    return items;
  }
  const params: Record<string, string> = {};
  if (opts?.tradition) params.tradition = opts.tradition;
  if (opts?.query) params.q = opts.query;
  const data = await invokeFunctionGet<LibraryApiResponse>(EDGE.libraryList, params);
  const mapped = data ? mapLibraryResponse(data) : [];
  if (mapped.length > 0) return mapped;
  let items = [...MOCK_LIBRARY_ENTRIES];
  if (opts?.tradition) items = items.filter((e) => e.tradition === opts.tradition);
  if (opts?.query) {
    const q = opts.query.toLowerCase();
    items = items.filter(
      (e) => e.labelZh.includes(opts.query!) || e.definitionZh.toLowerCase().includes(q)
    );
  }
  return items;
}

export async function fetchProfile(): Promise<UserProfile> {
  if (useMockApi()) return { ...MOCK_PROFILE };
  const data = await invokeFunctionGet<UserProfile>(EDGE.profile);
  return data ?? { ...MOCK_PROFILE };
}

export async function updateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  if (useMockApi()) {
    return {
      ...MOCK_PROFILE,
      ...input,
      onboardingCompleted: input.onboardingCompleted ?? MOCK_PROFILE.onboardingCompleted,
    };
  }
  const data = await invokeFunction<UserProfile>(EDGE.profile, input as Record<string, unknown>);
  return data ?? { ...MOCK_PROFILE, ...input };
}

export async function fetchPortraitSummary(): Promise<Record<string, string>> {
  if (useMockApi()) return { ...MOCK_PORTRAIT };
  return { ...MOCK_PORTRAIT };
}
