import {
  DEFAULT_LLM_BASE_URL,
  DEFAULT_LLM_MODEL,
  getLlmSettings,
  isAllowedLlmBaseUrl,
  type LlmSettings,
} from "./llmSettings";

const MIMO_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1";
const MIMO_API_KEY = process.env.EXPO_PUBLIC_MIMO_API_KEY;
const MIMO_MODEL = "mimo-v2.5";
const LLM_TIMEOUT_MS = 60_000;

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

export interface LlmConnectionTestResult {
  ok: boolean;
  message: string;
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

async function resolveLlmConfig(overrides?: Partial<LlmSettings>): Promise<{
  apiKey: string;
  baseUrl: string;
  model: string;
} | null> {
  const stored = await getLlmSettings();
  const apiKey = overrides?.apiKey?.trim() || stored?.apiKey || MIMO_API_KEY || "";
  if (!apiKey) return null;

  const baseUrl = normalizeBaseUrl(
    overrides?.baseUrl?.trim() || stored?.baseUrl || (MIMO_API_KEY ? MIMO_BASE_URL : DEFAULT_LLM_BASE_URL),
  );
  const model = overrides?.model?.trim() || stored?.model || (MIMO_API_KEY ? MIMO_MODEL : DEFAULT_LLM_MODEL);

  if (!isAllowedLlmBaseUrl(baseUrl)) return null;
  return { apiKey, baseUrl, model };
}

function extractContent(data: { choices?: Array<{ message?: { content?: string } }> }): string {
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

export async function llmComplete(options: LlmCompletionOptions): Promise<LlmCompletionResult> {
  const config = await resolveLlmConfig();
  if (!config) {
    console.warn("[llm] missing API key");
    return { content: "", degraded: true };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
    const res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: options.messages,
        max_tokens: options.maxTokens ?? 700,
        ...(options.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn("[llm] request failed:", res.status);
      return { content: "", degraded: true };
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = extractContent(data);
    return { content, degraded: !content };
  } catch (e) {
    console.warn("[llm] request error:", e);
    return { content: "", degraded: true };
  }
}

export async function testLlmConnection(overrides?: Partial<LlmSettings>): Promise<LlmConnectionTestResult> {
  const config = await resolveLlmConfig(overrides);
  if (!config) return { ok: false, message: "请先填写 API Key。" };

  const res = await llmComplete({
    messages: [
      { role: "system", content: "Reply with JSON: {\"ok\":true}" },
      { role: "user", content: "ping" },
    ],
    responseFormat: "json",
    maxTokens: 32,
  });

  if (res.degraded || !res.content) {
    return { ok: false, message: "连接失败，请检查 API Key、Base URL 与模型名称。" };
  }
  return { ok: true, message: "连接成功。" };
}
