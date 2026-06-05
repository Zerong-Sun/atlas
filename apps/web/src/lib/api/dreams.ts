import type { DreamEntryInput } from "@atlas/shared-types";
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
