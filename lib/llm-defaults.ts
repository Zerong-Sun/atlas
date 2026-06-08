export const DEFAULT_LLM_BASE_URL = "https://api.deepseek.com/v1";
export const DEFAULT_LLM_MODEL = "deepseek-v4-flash";

/** Hostnames allowed for client-provided LLM base URLs (SSRF guard). */
export const ALLOWED_LLM_HOSTS = new Set([
  "api.deepseek.com",
  "api.openai.com",
  "openrouter.ai",
  "api.together.xyz",
  "api.groq.com",
  "api.mistral.ai",
  "api.anthropic.com",
  "generativelanguage.googleapis.com",
  "token-plan-cn.xiaomimimo.com",
]);

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /^\[::1\]$/,
  /^::1$/,
];

export function normalizeLlmBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export function isAllowedLlmBaseUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeLlmBaseUrl(url));
    if (parsed.protocol !== "https:") return false;
    if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) return false;
    if (parsed.hostname.endsWith(".local")) return false;
    return ALLOWED_LLM_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export function resolveLlmBaseUrl(candidate?: string | null): string {
  const normalized = normalizeLlmBaseUrl(candidate || DEFAULT_LLM_BASE_URL);
  return isAllowedLlmBaseUrl(normalized) ? normalized : DEFAULT_LLM_BASE_URL;
}
