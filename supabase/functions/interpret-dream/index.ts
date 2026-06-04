import type { DreamEntryInput } from "@atlas/shared-types";
import { MimoGateway } from "@atlas/orchestrator";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireUser } from "../_shared/supabase.ts";

const DREAM_TEMPLATES = {
  chinese: "从传统梦占视角，此梦象多与近期心绪与未竟之事相关，宜静观数日。",
  jungian: "象征可能指向阴影整合与个体化进程，可关注梦中重复意象。",
  islamic: "可作为精神反思的契机，宜以感恩与自省回顾梦境带来的感受（非预言）。",
};

const DREAM_INTERPRETER_SKILL = `
你是「诸象」的专业梦境解析师，只能回答梦境解析相关内容。
只解析用户提供的梦境、情绪与意象；不回答无关问题；不做确定预言；不提供医疗、法律、投资结论。
若涉及创伤、持续噩梦、自伤或现实危险，温和建议寻求现实支持或专业帮助。
返回严格 JSON：{"chinese":"","jungian":"","islamic":""}。每段120字以内，中文，专业、克制、具体。
`;

async function interpretWithMimo(body: DreamEntryInput): Promise<{
  chinese: string;
  jungian: string;
  islamic: string;
  degraded: boolean;
}> {
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

  if (!mimo.isConfigured()) {
    return { ...DREAM_TEMPLATES, degraded: true };
  }

  const res = await mimo.complete({
    messages: [
      {
        role: "system",
        content: DREAM_INTERPRETER_SKILL,
      },
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
    maxTokens: 512,
  });

  if (res.degraded || !res.content) {
    return { ...DREAM_TEMPLATES, degraded: true };
  }

  try {
    const parsed = JSON.parse(res.content) as {
      chinese?: string;
      jungian?: string;
      islamic?: string;
    };
    return {
      chinese: parsed.chinese ?? DREAM_TEMPLATES.chinese,
      jungian: parsed.jungian ?? DREAM_TEMPLATES.jungian,
      islamic: parsed.islamic ?? DREAM_TEMPLATES.islamic,
      degraded: false,
    };
  } catch {
    return { ...DREAM_TEMPLATES, degraded: true };
  }
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { id: userId, client } = await requireUser(req);
    const body = (await req.json()) as DreamEntryInput;

    const interpretation = await interpretWithMimo(body);

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
    return jsonResponse(data);
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
