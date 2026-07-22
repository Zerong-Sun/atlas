import type { DreamInterpretation, DreamTrend } from "../mappers/dream.ts";

export const DREAM_FALLBACK_TEMPLATES = {
  chinese: "从传统梦占视角，此梦象多与近期心绪与未竟之事相关，宜静观数日。",
  jungian: "象征可能指向阴影整合与个体化进程，可关注梦中重复意象。",
  reflection: "可作为精神反思的契机，宜以感恩与自省回顾梦境带来的感受（非预言）。",
} as const;

export const MOCK_DREAM_TREND: DreamTrend = {
  periodDays: 7,
  topSymbols: [
    { symbol: "水", count: 3 },
    { symbol: "门", count: 2 },
    { symbol: "路", count: 2 },
  ],
  summary: "近七日梦境重复「水」「门」意象，或指向情绪流动与抉择关口。",
};

export function buildDreamFallbackInterpretation(input?: {
  text?: string;
  emotions?: string[];
  symbols?: string[];
}): DreamInterpretation {
  return {
    entryId: `dream-${Date.now()}`,
    text: input?.text,
    emotions: input?.emotions ?? [],
    symbols: input?.symbols ?? [],
    chinese: DREAM_FALLBACK_TEMPLATES.chinese,
    jungian: DREAM_FALLBACK_TEMPLATES.jungian,
    reflection: DREAM_FALLBACK_TEMPLATES.reflection,
    degraded: true,
    createdAt: new Date().toISOString(),
  };
}
