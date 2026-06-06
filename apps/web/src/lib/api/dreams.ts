import type { DreamEntryInput } from "@atlas/shared-types";
import { buildDreamContextPrompt, DREAM_INTERPRETER_SKILL } from "@/data/dreamPromptLibrary";
import { matchDreamSymbols } from "@/data/dreamSymbolsLibrary";
import { MOCK_DREAM_TREND } from "../mock/data";
import { llmComplete } from "./llm";

export interface DreamInterpretation {
  entryId: string;
  chinese: string;
  jungian: string;
  reflection: string;
  degraded?: boolean;
  createdAt: string;
}

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

function fallbackInterpretation(): DreamInterpretation {
  return {
    entryId: `dream-${Date.now()}`,
    chinese: DREAM_TEMPLATES.chinese,
    jungian: DREAM_TEMPLATES.jungian,
    reflection: DREAM_TEMPLATES.reflection,
    degraded: true,
    createdAt: new Date().toISOString(),
  };
}

async function interpretDream(input: DreamEntryInput): Promise<DreamInterpretation> {
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

  if (res.degraded || !res.content) return fallbackInterpretation();

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
      chinese: sanitizeText(parsed.chinese, DREAM_TEMPLATES.chinese),
      jungian: sanitizeText(parsed.jungian, DREAM_TEMPLATES.jungian),
      reflection,
      degraded: false,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return fallbackInterpretation();
  }
}

export async function createDreamEntry(input: DreamEntryInput): Promise<DreamInterpretation> {
  return interpretDream(input);
}

export async function fetchDreamTrend(): Promise<typeof MOCK_DREAM_TREND> {
  return { ...MOCK_DREAM_TREND };
}
