import {
  aggregateDreamTrend,
  buildDreamFallbackInterpretation,
  DREAM_FALLBACK_TEMPLATES,
  mapDreamEntryRow,
  type DreamInterpretation,
  type DreamTrend,
} from "@atlas/api-core";
import type { DreamEntryInput } from "@atlas/shared-types";
import { buildDreamContextPrompt, DREAM_INTERPRETER_SKILL } from "@/data/dreamPromptLibrary";
import { matchDreamSymbols } from "@/data/dreamSymbolsLibrary";
import { appendDreamHistory, getDreamHistory } from "../storage";
import { callEdge, EDGE_PATHS, useMockApi } from "./client";
import { llmComplete } from "./llm";

export type { DreamInterpretation, DreamTrend };

function sanitizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text.length > 0 ? text.slice(0, 240) : fallback;
}

async function interpretDreamLocal(input: DreamEntryInput): Promise<DreamInterpretation> {
  const matched = matchDreamSymbols(input.text);
  const symbolContext = buildDreamContextPrompt(matched);
  const res = await llmComplete({
    messages: [
      { role: "system", content: DREAM_INTERPRETER_SKILL + symbolContext },
      {
        role: "user",
        content: JSON.stringify({
          dream: input.text,
          emotions: input.emotions ?? [],
          symbols: input.symbols ?? [],
          libraryMatches: matched.map((s) => s.symbol),
        }),
      },
    ],
    responseFormat: "json",
    maxTokens: 700,
  });

  if (res.degraded || !res.content) return buildDreamFallbackInterpretation(input);

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
    appendDreamHistory(entry);
    return entry;
  }

  const data = await callEdge<DreamInterpretation>(EDGE_PATHS.interpretDream, {
    body: input as unknown as Record<string, unknown>,
  });
  const entry = data ? mapDreamEntryRow(data) : await interpretDreamLocal(input);
  appendDreamHistory(entry);
  return entry;
}

type ListDreamsResponse = { dreams?: DreamInterpretation[] };

export async function listDreams(limit = 20): Promise<DreamInterpretation[]> {
  if (useMockApi()) return getDreamHistory().slice(0, limit);
  const data = await callEdge<ListDreamsResponse>(EDGE_PATHS.listDreams, {
    method: "GET",
    query: { limit: String(limit) },
  });
  if (data?.dreams?.length) return data.dreams.map(mapDreamEntryRow);
  return getDreamHistory().slice(0, limit);
}

export async function fetchDreamTrend(periodDays = 7): Promise<DreamTrend> {
  if (useMockApi()) {
    return aggregateDreamTrend(getDreamHistory(), periodDays);
  }
  const data = await callEdge<DreamTrend>(EDGE_PATHS.dreamTrend, {
    method: "GET",
    query: { days: String(periodDays) },
  });
  return data ?? aggregateDreamTrend(getDreamHistory(), periodDays);
}
