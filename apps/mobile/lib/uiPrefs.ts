import AsyncStorage from "@react-native-async-storage/async-storage";

export const UI_PREFS_KEY = "atlas.ui.prefs";

export type UiPrefs = {
  mysticMotion: boolean;
  classicMode: boolean;
  safeMode: boolean;
};

export const DEFAULT_UI_PREFS: UiPrefs = {
  mysticMotion: true,
  classicMode: true,
  safeMode: true,
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
    };
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}

export async function saveUiPrefs(prefs: UiPrefs): Promise<void> {
  await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
}
