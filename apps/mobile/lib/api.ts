/**
 * Atlas mobile BFF — Supabase Edge Functions with mock fallback.
 *
 * Spec names → deployed function folders:
 * - create-reading
 * - interpret-dream → create-dream
 * - daily-brief
 * - library-list → get-library (GET)
 */
import {
  aggregateDreamTrend,
  buildDreamFallbackInterpretation,
  DREAM_FALLBACK_TEMPLATES,
  mapDreamEntryRow,
  type DreamInterpretation,
  type DreamTrend,
} from "@atlas/api-core";
import type {
  DailyBrief,
  DreamEntryInput,
  PortraitSummary,
  QuestionInput,
  ReadingReport,
  Tradition,
  UserProfile,
} from "@atlas/shared-types";
import {
  buildMockReading,
  MOCK_DAILY_BRIEF,
  MOCK_LIBRARY_ENTRIES,
  MOCK_PROFILE,
  MOCK_READING_HISTORY,
} from "./mock/data";
import { generatePortraitLocal } from "./portrait";
import { llmComplete } from "./llm";
import {
  appendDreamHistory,
  appendReadingHistory,
  getDreamHistory,
  getReadingHistory,
} from "./storage";
import { invokeFunction, invokeFunctionGet, isSupabaseConfigured } from "./supabase";

export const EDGE = {
  createReading: "create-reading",
  listReadings: "list-readings",
  interpretDream: "create-dream",
  listDreams: "list-dreams",
  dreamTrend: "dream-trend",
  dailyBrief: "daily-brief",
  libraryList: "get-library",
  profile: "profile",
  generatePortrait: "generate-portrait",
} as const;

export function useMockApi(): boolean {
  return !isSupabaseConfigured;
}

export type { DreamInterpretation, DreamTrend };

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
    | "gender"
    | "interests"
    | "disabledTraditions"
    | "onboardingCompleted"
    | "portraitSummary"
  >
>;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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
    const report = buildMockReading(input.text, input.traditions);
    await appendReadingHistory(report);
    return report;
  }
  const data = await invokeFunction<ReadingReport>(EDGE.createReading, {
    text: input.text,
    category: input.category,
    traditions: input.traditions,
  });
  const report = data ?? buildMockReading(input.text, input.traditions);
  await appendReadingHistory(report);
  return report;
}

export async function listReadings(): Promise<ReadingReport[]> {
  if (useMockApi()) {
    const local = await getReadingHistory();
    return local.length > 0 ? local : [...MOCK_READING_HISTORY];
  }
  const data = await invokeFunctionGet<ListReadingsResponse>(EDGE.listReadings);
  if (data?.readings?.length) return data.readings;
  const local = await getReadingHistory();
  return local.length > 0 ? local : [...MOCK_READING_HISTORY];
}

const DREAM_INTERPRETER_SKILL = `你是「诸象」的专业梦境解析师，只能回答梦境解析相关内容。

工作边界：
- 只解析用户提供的梦境、情绪与意象，不回答与梦境无关的问题。
- 不宣称梦境是确定预言，不给医疗、法律、投资等专业结论。
- 不恐吓用户，不制造宿命论；把梦视为心理、文化与精神反思材料。
- 如果梦境涉及创伤、持续噩梦、自伤或现实危险，温和建议寻求现实支持或专业帮助。

输出风格：
- 中文，专业、克制、具体。
- 结合用户梦中意象、情绪和符号，不空泛套话。
- 返回严格 JSON，不要 Markdown，不要额外解释。

JSON schema:
{
  "chinese": "传统梦占/文化象征视角，120字以内",
  "jungian": "荣格/心理象征视角，120字以内",
  "reflection": "现实反思与可执行建议，120字以内"
}`;

function sanitizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text.length > 0 ? text.slice(0, 240) : fallback;
}

async function interpretDreamLocal(input: DreamEntryInput): Promise<DreamInterpretation> {
  const res = await llmComplete({
    messages: [
      { role: "system", content: DREAM_INTERPRETER_SKILL },
      {
        role: "user",
        content: JSON.stringify({
          dream: input.text,
          emotions: input.emotions ?? [],
          symbols: input.symbols ?? [],
        }),
      },
    ],
    responseFormat: "json",
    maxTokens: 700,
  });

  if (res.degraded || !res.content) {
    return buildDreamFallbackInterpretation(input);
  }

  try {
    const parsed = JSON.parse(res.content) as {
      chinese?: unknown;
      jungian?: unknown;
      reflection?: unknown;
      islamic?: unknown;
    };
    const reflection = sanitizeText(
      parsed.reflection ?? parsed.islamic,
      DREAM_FALLBACK_TEMPLATES.reflection
    );
    return {
      entryId: `dream-${Date.now()}`,
      text: input.text,
      emotions: input.emotions ?? [],
      symbols: input.symbols ?? [],
      chinese: sanitizeText(parsed.chinese, DREAM_FALLBACK_TEMPLATES.chinese),
      jungian: sanitizeText(parsed.jungian, DREAM_FALLBACK_TEMPLATES.jungian),
      reflection,
      degraded: false,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return buildDreamFallbackInterpretation(input);
  }
}

export async function createDreamEntry(input: DreamEntryInput): Promise<DreamInterpretation> {
  if (useMockApi()) {
    const entry = await interpretDreamLocal(input);
    await appendDreamHistory(entry);
    return entry;
  }
  const data = await invokeFunction<DreamInterpretation>(
    EDGE.interpretDream,
    input as unknown as Record<string, unknown>
  );
  const entry = data ? mapDreamEntryRow(data) : await interpretDreamLocal(input);
  await appendDreamHistory(entry);
  return entry;
}

export async function interpretDream(input: DreamEntryInput): Promise<DreamInterpretation> {
  return createDreamEntry(input);
}

type ListDreamsResponse = { dreams?: DreamInterpretation[] };

export async function listDreams(limit = 20): Promise<DreamInterpretation[]> {
  if (useMockApi()) {
    const local = await getDreamHistory();
    return local.slice(0, limit);
  }
  const data = await invokeFunctionGet<ListDreamsResponse>(EDGE.listDreams, { limit: String(limit) });
  if (data?.dreams?.length) return data.dreams.map(mapDreamEntryRow);
  return (await getDreamHistory()).slice(0, limit);
}

export async function fetchDreamTrend(periodDays = 7): Promise<DreamTrend> {
  if (useMockApi()) {
    return aggregateDreamTrend(await getDreamHistory(), periodDays);
  }
  const data = await invokeFunctionGet<DreamTrend>(EDGE.dreamTrend, { days: String(periodDays) });
  return data ?? aggregateDreamTrend(await getDreamHistory(), periodDays);
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

export async function generatePortrait(profile?: UserProfile): Promise<PortraitSummary> {
  const base = profile ?? (await fetchProfile());
  if (useMockApi()) return generatePortraitLocal(base);
  const data = await invokeFunction<PortraitSummary>(EDGE.generatePortrait, {});
  if (data?.traditions && Object.keys(data.traditions).length > 0) return data;
  return generatePortraitLocal(base);
}

export async function fetchPortraitSummary(profile?: UserProfile): Promise<PortraitSummary> {
  const base = profile ?? (await fetchProfile());
  if (base.portraitSummary?.traditions && Object.keys(base.portraitSummary.traditions).length > 0) {
    return base.portraitSummary;
  }
  return generatePortrait(base);
}
