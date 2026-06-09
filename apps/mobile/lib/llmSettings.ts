import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "atlas.llm.settings";

export const DEFAULT_LLM_BASE_URL = "https://api.deepseek.com/v1";
export const DEFAULT_LLM_MODEL = "deepseek-v4-flash";

const ALLOWED_LLM_HOSTS = new Set([
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
];

export interface LlmSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function normalizeLlmBaseUrl(url: string): string {
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

export function validateLlmSettings(settings: Partial<LlmSettings>): string | null {
  if (!settings.apiKey?.trim()) return "请先填写 API Key。";
  const baseUrl = normalizeLlmBaseUrl(settings.baseUrl || DEFAULT_LLM_BASE_URL);
  if (!isAllowedLlmBaseUrl(baseUrl)) {
    return "Base URL 须为 HTTPS，且使用受支持的 LLM 服务商域名。";
  }
  if (!settings.model?.trim()) return "请填写模型名称。";
  return null;
}

export async function getLlmSettings(): Promise<LlmSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LlmSettings>;
    if (!parsed.apiKey?.trim()) return null;
    const baseUrl = normalizeLlmBaseUrl(parsed.baseUrl || DEFAULT_LLM_BASE_URL);
    if (!isAllowedLlmBaseUrl(baseUrl)) return null;
    return {
      apiKey: parsed.apiKey.trim(),
      baseUrl,
      model: parsed.model?.trim() || DEFAULT_LLM_MODEL,
    };
  } catch {
    return null;
  }
}

export async function getLlmSettingsForForm(): Promise<LlmSettings> {
  const stored = await getLlmSettings();
  return (
    stored ?? {
      apiKey: "",
      baseUrl: DEFAULT_LLM_BASE_URL,
      model: DEFAULT_LLM_MODEL,
    }
  );
}

export async function saveLlmSettings(settings: LlmSettings): Promise<void> {
  const error = validateLlmSettings(settings);
  if (error) throw new Error(error);
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiKey: settings.apiKey.trim(),
      baseUrl: normalizeLlmBaseUrl(settings.baseUrl || DEFAULT_LLM_BASE_URL),
      model: settings.model.trim() || DEFAULT_LLM_MODEL,
    }),
  );
}

export async function clearLlmSettings(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function isLlmConfigured(): Promise<boolean> {
  const stored = await getLlmSettings();
  if (stored?.apiKey) return true;
  return Boolean(process.env.EXPO_PUBLIC_MIMO_API_KEY);
}
