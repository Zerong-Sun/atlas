import {
  DEFAULT_CULTURAL_PROFILE,
  type AtlasLocale,
  type CulturalLens,
  type TerminologyMode,
} from "@atlas/method-data";

const KEY = "atlas:cultural_prefs";

export type WebCulturalPrefs = {
  locale: AtlasLocale;
  culturalLens: CulturalLens;
  terminology: TerminologyMode;
};

export const DEFAULT_WEB_CULTURAL_PREFS: WebCulturalPrefs = {
  locale: DEFAULT_CULTURAL_PROFILE.locale,
  culturalLens: DEFAULT_CULTURAL_PROFILE.lens,
  terminology: DEFAULT_CULTURAL_PROFILE.terminology,
};

export function getCulturalPrefs(): WebCulturalPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_WEB_CULTURAL_PREFS };
    const parsed = JSON.parse(raw) as Partial<WebCulturalPrefs>;
    return {
      locale: parsed.locale ?? DEFAULT_WEB_CULTURAL_PREFS.locale,
      culturalLens: parsed.culturalLens ?? DEFAULT_WEB_CULTURAL_PREFS.culturalLens,
      terminology: parsed.terminology ?? DEFAULT_WEB_CULTURAL_PREFS.terminology,
    };
  } catch {
    return { ...DEFAULT_WEB_CULTURAL_PREFS };
  }
}

export function saveCulturalPrefs(prefs: WebCulturalPrefs): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
