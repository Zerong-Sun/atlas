import {
  aggregateDreamTrend,
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

const DREAM_TEMPLATES = {
  chinese: "从传统梦占视角，此梦象多与近期心绪与未竟之事相关，宜静观数日。",
  jungian: "象征可能指向阴影整合与个体化进程，可关注梦中重复意象。",
  reflection: "可作为精神反思的契机，宜以感恩与自省回顾梦境带来的感受（非预言）。",
};

function sanitizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text.length > 0 ? text.slice(0, 240) : fallback;
}

function fallbackInterpretation(input?: DreamEntryInput): DreamInterpretation {
  return {
    entryId: `dream-${Date.now()}`,
    text: input?.text,
    emotions: input?.emotions ?? [],
    symbols: input?.symbols ?? [],
    chinese: DREAM_TEMPLATES.chinese,
    jungian: DREAM_TEMPLATES.jungian,
    reflection: DREAM_TEMPLATES.reflection,
    degraded: true,
    createdAt: new Date().toISOString(),
  };
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

  if (res.degraded || !res.content) return fallbackInterpretation(input);

  try {
    const parsed = JSON.parse(res.content) as {
      chinese?: unknown;
      jungian?: unknown;
      reflection?: unknown;
      islamic?: unknown;
    };
    const reflection = sanitizeText(parsed.reflection ?? parsed.islamic, DREAM_TEMPLATES.reflection);
    return {
      entryId: `dream-${Date.now()}`,
      text: input.text,
      emotions: input.emotions ?? [],
      symbols: input.symbols ?? [],
      chinese: sanitizeText(parsed.chinese, DREAM_TEMPLATES.chinese),
      jungian: sanitizeText(parsed.jungian, DREAM_TEMPLATES.jungian),
      reflection,
      degraded: false,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return fallbackInterpretation(input);
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
