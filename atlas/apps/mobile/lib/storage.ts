import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DreamInterpretation } from "@atlas/api-core";
import type { ReadingReport, UserProfile } from "@atlas/shared-types";

const KEYS = {
  onboardingDone: "@atlas/onboarding_done",
  interests: "@atlas/interests",
  localProfile: "@atlas/local_profile",
  readingHistory: "@atlas/reading_history",
  dreamHistory: "@atlas/dream_history",
} as const;

export async function getOnboardingDone(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.onboardingDone);
  return v === "true";
}

export async function setOnboardingDone(done: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboardingDone, done ? "true" : "false");
}

export async function getInterests(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.interests);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function setInterests(interests: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.interests, JSON.stringify(interests));
}

export async function getLocalProfile(): Promise<Partial<UserProfile> | null> {
  const raw = await AsyncStorage.getItem(KEYS.localProfile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<UserProfile>;
  } catch {
    return null;
  }
}

export async function setLocalProfile(profile: Partial<UserProfile>): Promise<void> {
  const prev = (await getLocalProfile()) ?? {};
  await AsyncStorage.setItem(KEYS.localProfile, JSON.stringify({ ...prev, ...profile }));
}

export async function getReadingHistory(): Promise<ReadingReport[]> {
  const raw = await AsyncStorage.getItem(KEYS.readingHistory);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReadingReport[];
  } catch {
    return [];
  }
}

export async function appendReadingHistory(report: ReadingReport): Promise<void> {
  const prev = await getReadingHistory();
  const next = [report, ...prev.filter((r) => r.readingId !== report.readingId)].slice(0, 100);
  await AsyncStorage.setItem(KEYS.readingHistory, JSON.stringify(next));
}

export async function getDreamHistory(): Promise<DreamInterpretation[]> {
  const raw = await AsyncStorage.getItem(KEYS.dreamHistory);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DreamInterpretation[];
  } catch {
    return [];
  }
}

export async function appendDreamHistory(entry: DreamInterpretation): Promise<void> {
  const prev = await getDreamHistory();
  const next = [entry, ...prev.filter((d) => d.entryId !== entry.entryId)].slice(0, 100);
  await AsyncStorage.setItem(KEYS.dreamHistory, JSON.stringify(next));
}
