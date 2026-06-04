import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserProfile } from "@atlas/shared-types";

const KEYS = {
  onboardingDone: "@atlas/onboarding_done",
  interests: "@atlas/interests",
  localProfile: "@atlas/local_profile",
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
  await AsyncStorage.setItem(KEYS.localProfile, JSON.stringify(profile));
}
