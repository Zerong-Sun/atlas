import {
  aggregateDreamTrend,
  buildDreamFallbackInterpretation,
  DREAM_FALLBACK_TEMPLATES,
  mapDreamEntryRow,
  type DreamInterpretation,
  type DreamTrend,
} from "@atlas/api-core";
import type { DreamEntryInput } from "@atlas/shared-types";
import { llmComplete } from "../llm";
import { appendDreamHistory, getDreamHistory } from "../storage";
import { invokeFunction, invokeFunctionGet } from "../supabase";
import { EDGE, useMockApi } from "./shared";

export type { DreamInterpretation, DreamTrend };

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
      DREAM_FALLBACK_TEMPLATES.reflection,
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
    input as unknown as Record<string, unknown>,
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
