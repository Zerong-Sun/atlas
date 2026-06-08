/**
 * LLM client — always calls same-origin /api/llm (Vite proxy in dev, Vercel/CF Function in prod).
 */

import {
  DEFAULT_LLM_BASE_URL,
  DEFAULT_LLM_MODEL,
  normalizeLlmBaseUrl,
  resolveLlmBaseUrl,
} from "@atlas/llm-defaults";
import { getLlmSettings, type LlmSettings } from "@/lib/llmSettings";

const LLM_PROXY_URL = "/api/llm";
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

type LlmChoice = {
  message?: {
    content?: string | null;
    reasoning_content?: string | null;
  };
  finish_reason?: string | null;
};

type LlmCompletionResponse = {
  model?: string;
  choices?: LlmChoice[];
  error?: { message?: string };
};

function extractChoiceContent(choice?: LlmChoice): string {
  const message = choice?.message;
  if (!message) return "";
  return (message.content?.trim() || message.reasoning_content?.trim() || "");
}

/** DeepSeek V4 defaults to thinking mode; disable for short probes and structured output. */
function deepSeekRequestExtras(config: { model: string; baseUrl: string }): Record<string, unknown> {
  try {
    const host = new URL(normalizeLlmBaseUrl(config.baseUrl)).hostname;
    const isDeepSeek = host === "api.deepseek.com" || config.model.startsWith("deepseek-");
    return isDeepSeek ? { thinking: { type: "disabled" } } : {};
  } catch {
    return config.model.startsWith("deepseek-") ? { thinking: { type: "disabled" } } : {};
  }
}

function devEnvApiKey(): string {
  return import.meta.env.DEV ? (import.meta.env.VITE_LLM_API_KEY ?? "") : "";
}

function resolveLlmConfig(overrides?: Partial<LlmSettings>): {
  apiKey: string;
  baseUrl: string;
  model: string;
} | null {
  const stored = getLlmSettings();
  const apiKey = overrides?.apiKey?.trim() || stored?.apiKey || devEnvApiKey();
  if (!apiKey) return null;

  const baseUrl = resolveLlmBaseUrl(
    overrides?.baseUrl?.trim() ||
      stored?.baseUrl ||
      (import.meta.env.DEV ? import.meta.env.VITE_LLM_API_BASE_URL : undefined),
  );

  const model =
    overrides?.model?.trim() ||
    stored?.model ||
    (import.meta.env.DEV ? import.meta.env.VITE_LLM_MODEL : undefined) ||
    DEFAULT_LLM_MODEL;

  return { apiKey, baseUrl, model };
}

function friendlyLlmError(status: number): string {
  if (status === 401 || status === 403) return "API Key 无效或无权访问。";
  if (status === 404) return "接口地址不存在，请检查 Base URL。";
  if (status === 413) return "请求体过大。";
  if (status === 429) return "请求过于频繁或额度不足。";
  if (status >= 500) return "LLM 服务暂时不可用，请稍后重试。";
  return `连接失败（HTTP ${status}）。`;
}

async function llmFetch(
  body: Record<string, unknown>,
  config: { apiKey: string; baseUrl: string },
): Promise<Response> {
  return fetch(LLM_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      "X-LLM-Base-URL": normalizeLlmBaseUrl(config.baseUrl || DEFAULT_LLM_BASE_URL),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
}

export async function llmComplete(options: LlmCompletionOptions): Promise<LlmCompletionResult> {
  const config = resolveLlmConfig();
  if (!config) {
    console.warn("[llm] missing API key");
    return { content: "", degraded: true };
  }

  try {
    const res = await llmFetch(
      {
        model: config.model,
        messages: options.messages,
        max_tokens: options.maxTokens ?? 700,
        ...(options.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
        ...deepSeekRequestExtras(config),
      },
      config,
    );

    if (!res.ok) {
      console.warn("[llm] request failed:", res.status, await res.text());
      return { content: "", degraded: true };
    }

    const data = (await res.json()) as LlmCompletionResponse;
    const content = extractChoiceContent(data.choices?.[0]);
    return { content, degraded: !content };
  } catch (e) {
    console.warn("[llm] request error:", e);
    return { content: "", degraded: true };
  }
}

export async function testLlmConnection(
  overrides?: Partial<LlmSettings>,
): Promise<LlmConnectionTestResult> {
  const config = resolveLlmConfig(overrides);
  if (!config) {
    return { ok: false, message: "请先填写 API Key。" };
  }

  try {
    const res = await llmFetch(
      {
        model: config.model,
        messages: [{ role: "user", content: "Reply with exactly: pong" }],
        max_tokens: 64,
        ...deepSeekRequestExtras(config),
      },
      config,
    );

    if (!res.ok) {
      console.warn("[llm] test failed:", res.status, await res.text());
      return { ok: false, message: friendlyLlmError(res.status) };
    }

    const data = (await res.json()) as LlmCompletionResponse;
    const choice = data.choices?.[0];
    const content = extractChoiceContent(choice);
    if (!content) {
      const finishReason = choice?.finish_reason;
      if (finishReason === "length") {
        return {
          ok: false,
          message:
            "模型有响应但输出被截断。若使用 thinking 模型，请改用 deepseek-chat，或换更大的 max_tokens。",
        };
      }
      const upstreamError = data.error?.message;
      if (upstreamError) {
        return { ok: false, message: upstreamError };
      }
      return {
        ok: false,
        message:
          "已连接但模型未返回内容。DeepSeek V4 默认开启 thinking 模式，请确认模型为 deepseek-v4-flash 或 deepseek-chat，Base URL 为 https://api.deepseek.com/v1。",
      };
    }

    return { ok: true, message: "连接成功，LLM 可用。" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("timeout") || message.includes("aborted")) {
      return { ok: false, message: "请求超时，请检查网络或 Base URL。" };
    }
    return { ok: false, message: `请求错误：${message}` };
  }
}
