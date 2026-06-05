/**
 * Direct MimoToken LLM client for mobile — calls the API directly.
 */

const MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1";
const MIMO_API_KEY = "tp-c0m4kgymh0j7hampgxe9c5py0pou5ipjmm63pzqn2qkspmpk";
const MIMO_MODEL = "mimo-v2.5";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmCompletionOptions {
  messages: LlmMessage[];
  responseFormat?: "json" | "text";
  maxTokens?: number;
}

export interface LlmCompletionResult {
  content: string;
  degraded: boolean;
}

export async function llmComplete(options: LlmCompletionOptions): Promise<LlmCompletionResult> {
  try {
    const res = await fetch(`${MIMO_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MIMO_API_KEY}`,
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: options.messages,
        max_tokens: options.maxTokens ?? 700,
        ...(options.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!res.ok) {
      console.warn("[llm] request failed:", res.status);
      return { content: "", degraded: true };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return { content, degraded: !content };
  } catch (e) {
    console.warn("[llm] request error:", e);
    return { content: "", degraded: true };
  }
}
