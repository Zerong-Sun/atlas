import { DEFAULT_CULTURAL_PROFILE, type AtlasLocale, type CulturalLens, type TerminologyMode } from "@atlas/method-data";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UI_PREFS_KEY = "atlas.ui.prefs";

export type UiPrefs = {
  mysticMotion: boolean;
  classicMode: boolean;
  safeMode: boolean;
  locale: AtlasLocale;
  culturalLens: CulturalLens;
  terminology: TerminologyMode;
};

export const DEFAULT_UI_PREFS: UiPrefs = {
  mysticMotion: true,
  classicMode: true,
  safeMode: true,
  locale: DEFAULT_CULTURAL_PROFILE.locale,
  culturalLens: DEFAULT_CULTURAL_PROFILE.lens,
  terminology: DEFAULT_CULTURAL_PROFILE.terminology,
};

export async function getUiPrefs(): Promise<UiPrefs> {
  try {
    const raw = await AsyncStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { ...DEFAULT_UI_PREFS };
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      mysticMotion: parsed.mysticMotion ?? DEFAULT_UI_PREFS.mysticMotion,
      classicMode: parsed.classicMode ?? DEFAULT_UI_PREFS.classicMode,
      safeMode: parsed.safeMode ?? DEFAULT_UI_PREFS.safeMode,
      locale: parsed.locale ?? DEFAULT_UI_PREFS.locale,
      culturalLens: parsed.culturalLens ?? DEFAULT_UI_PREFS.culturalLens,
      terminology: parsed.terminology ?? DEFAULT_UI_PREFS.terminology,
    };
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}

export async function saveUiPrefs(prefs: UiPrefs): Promise<void> {
  await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
}
