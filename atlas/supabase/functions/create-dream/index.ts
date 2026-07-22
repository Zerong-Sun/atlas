import type { DreamEntryInput } from "@atlas/shared-types";
import { MimoGateway } from "@atlas/orchestrator";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { mapDreamEntryRow } from "../_shared/dream.ts";
import { requireUser } from "../_shared/supabase.ts";

const DREAM_TEMPLATES = {
  chinese: "从传统梦占视角，此梦象多与近期心绪与未竟之事相关，宜静观数日。",
  jungian: "象征可能指向阴影整合与个体化进程，可关注梦中重复意象。",
  islamic: "可作为精神反思的契机，宜以感恩与自省回顾梦境带来的感受（非预言）。",
};

const DREAM_INTERPRETER_SKILL = `
你是「诸象」的专业梦境解析师，只能回答梦境解析相关内容。

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
}
`;

type DreamInterpretation = {
  chinese: string;
  jungian: string;
  reflection: string;
  islamic: string;
  degraded: boolean;
  skill: "dream_interpreter_v1";
};

function fallbackInterpretation(degraded = true): DreamInterpretation {
  return {
    chinese: DREAM_TEMPLATES.chinese,
    jungian: DREAM_TEMPLATES.jungian,
    reflection: DREAM_TEMPLATES.islamic,
    islamic: DREAM_TEMPLATES.islamic,
    degraded,
    skill: "dream_interpreter_v1",
  };
}

function sanitizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text.length > 0 ? text.slice(0, 240) : fallback;
}

async function interpretDream(body: DreamEntryInput): Promise<DreamInterpretation> {
  const mimo = new MimoGateway({
    MIMO_API_KEY: Deno.env.get("MIMO_API_KEY") ?? undefined,
    MIMO_API_BASE_URL: Deno.env.get("MIMO_API_BASE_URL") ?? undefined,
    MIMO_API_URL: Deno.env.get("MIMO_API_URL") ?? undefined,
    MIMO_MODEL: Deno.env.get("MIMO_MODEL") ?? undefined,
    LLM_API_KEY: Deno.env.get("LLM_API_KEY") ?? undefined,
    LLM_API_BASE_URL: Deno.env.get("LLM_API_BASE_URL") ?? undefined,
    LLM_API_URL: Deno.env.get("LLM_API_URL") ?? undefined,
    LLM_MODEL: Deno.env.get("LLM_MODEL") ?? undefined,
    OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY") ?? undefined,
    OPENAI_BASE_URL: Deno.env.get("OPENAI_BASE_URL") ?? undefined,
    OPENAI_API_URL: Deno.env.get("OPENAI_API_URL") ?? undefined,
    OPENAI_MODEL: Deno.env.get("OPENAI_MODEL") ?? undefined,
  });

  if (!mimo.isConfigured()) return fallbackInterpretation(true);

  const res = await mimo.complete({
    messages: [
      { role: "system", content: DREAM_INTERPRETER_SKILL },
      {
        role: "user",
        content: JSON.stringify({
          dream: body.text,
          emotions: body.emotions ?? [],
          symbols: body.symbols ?? [],
        }),
      },
    ],
    responseFormat: "json",
    maxTokens: 700,
  });

  if (res.degraded || !res.content) return fallbackInterpretation(true);

  try {
    const parsed = JSON.parse(res.content) as {
      chinese?: unknown;
      jungian?: unknown;
      reflection?: unknown;
      islamic?: unknown;
    };
    const reflection = sanitizeText(parsed.reflection ?? parsed.islamic, DREAM_TEMPLATES.islamic);
    return {
      chinese: sanitizeText(parsed.chinese, DREAM_TEMPLATES.chinese),
      jungian: sanitizeText(parsed.jungian, DREAM_TEMPLATES.jungian),
      reflection,
      islamic: reflection,
      degraded: false,
      skill: "dream_interpreter_v1",
    };
  } catch {
    return fallbackInterpretation(true);
  }
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { id: userId, client } = await requireUser(req);
    const body = (await req.json()) as DreamEntryInput;

    const interpretation = await interpretDream(body);

    const { data, error } = await client
      .from("dream_entries")
      .insert({
        user_id: userId,
        text: body.text,
        emotions: body.emotions ?? [],
        symbols: body.symbols ?? [],
        interpretation,
      })
      .select("*")
      .single();

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse(mapDreamEntryRow(data));
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
