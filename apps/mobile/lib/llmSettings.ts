import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_LLM_BASE_URL,
  DEFAULT_LLM_MODEL,
  isAllowedLlmBaseUrl,
  normalizeLlmBaseUrl,
} from "@atlas/llm-defaults";

const STORAGE_KEY = "atlas.llm.settings";

export { DEFAULT_LLM_BASE_URL, DEFAULT_LLM_MODEL, isAllowedLlmBaseUrl };

export interface LlmSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
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
  return Boolean(process.env.EXPO_PUBLIC_LLM_API_KEY || process.env.EXPO_PUBLIC_MIMO_API_KEY);
}
