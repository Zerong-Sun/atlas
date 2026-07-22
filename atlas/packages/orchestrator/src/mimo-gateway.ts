/** Mimo API gateway — server-side only; degrades without API key or on failure */

export interface MimoMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MimoCompletionOptions {
  messages: MimoMessage[];
  responseFormat?: "json" | "text";
  maxTokens?: number;
}

export interface MimoCompletionResult {
  content: string;
  degraded: boolean;
  tokenCost?: number;
}

export class MimoGateway {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(env?: {
    MIMO_API_KEY?: string;
    MIMO_API_BASE_URL?: string;
    MIMO_API_URL?: string;
    MIMO_MODEL?: string;
    LLM_API_KEY?: string;
    LLM_API_BASE_URL?: string;
    LLM_API_URL?: string;
    LLM_MODEL?: string;
    OPENAI_API_KEY?: string;
    OPENAI_BASE_URL?: string;
    OPENAI_API_URL?: string;
    OPENAI_MODEL?: string;
  }) {
    const fromProcess =
      typeof process !== "undefined"
        ? (process.env as {
            MIMO_API_KEY?: string;
            MIMO_API_BASE_URL?: string;
            MIMO_API_URL?: string;
            MIMO_MODEL?: string;
            LLM_API_KEY?: string;
            LLM_API_BASE_URL?: string;
            LLM_API_URL?: string;
            LLM_MODEL?: string;
            OPENAI_API_KEY?: string;
            OPENAI_BASE_URL?: string;
            OPENAI_API_URL?: string;
            OPENAI_MODEL?: string;
          })
        : {};
    const cfg = env ?? fromProcess;
    this.apiKey = cfg.MIMO_API_KEY ?? cfg.LLM_API_KEY ?? cfg.OPENAI_API_KEY;
    this.baseUrl = (
      cfg.MIMO_API_BASE_URL ??
      cfg.MIMO_API_URL ??
      cfg.LLM_API_BASE_URL ??
      cfg.LLM_API_URL ??
      cfg.OPENAI_BASE_URL ??
      cfg.OPENAI_API_URL ??
      "https://token-plan-cn.xiaomimimo.com/v1"
    )
      .replace(/\/chat\/completions\/?$/, "")
      .replace(/\/$/, "");
    this.model = cfg.MIMO_MODEL ?? cfg.LLM_MODEL ?? cfg.OPENAI_MODEL ?? "mimo-v2.5";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async complete(options: MimoCompletionOptions): Promise<MimoCompletionResult> {
    if (!this.apiKey) {
      return { content: "", degraded: true };
    }

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: options.messages,
          max_tokens: options.maxTokens ?? 2048,
          ...(options.responseFormat === "json" ? { response_format: { type: "json_object" } } : {}),
        }),
      });

      if (!res.ok) {
        return { content: "", degraded: true };
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      const tokenCost = data.usage?.total_tokens;
      return { content, degraded: !content, tokenCost };
    } catch {
      return { content: "", degraded: true };
    }
  }
}
