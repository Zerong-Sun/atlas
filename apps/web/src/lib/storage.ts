import type { ReadingReport } from "@atlas/shared-types";

const KEYS = {
  onboarding: "atlas:onboarding_done",
  profile: "atlas:local_profile",
  interests: "atlas:interests",
  readings: "atlas:reading_history",
} as const;

export async function getOnboardingDone(): Promise<boolean> {
  return localStorage.getItem(KEYS.onboarding) === "1";
}

export async function setOnboardingDone(done: boolean): Promise<void> {
  localStorage.setItem(KEYS.onboarding, done ? "1" : "0");
}

export async function getLocalProfile(): Promise<Record<string, unknown>> {
  const raw = localStorage.getItem(KEYS.profile);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function setLocalProfile(partial: Record<string, unknown>): Promise<void> {
  const prev = await getLocalProfile();
  localStorage.setItem(KEYS.profile, JSON.stringify({ ...prev, ...partial }));
}

export async function getInterests(): Promise<string[]> {
  const raw = localStorage.getItem(KEYS.interests);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function setInterests(ids: string[]): Promise<void> {
  localStorage.setItem(KEYS.interests, JSON.stringify(ids));
}

export function getReadingHistory(): ReadingReport[] {
  const raw = localStorage.getItem(KEYS.readings);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReadingReport[];
  } catch {
    return [];
  }
}

export function appendReadingHistory(report: ReadingReport): void {
  const prev = getReadingHistory();
  const next = [report, ...prev.filter((r) => r.readingId !== report.readingId)].slice(0, 100);
  localStorage.setItem(KEYS.readings, JSON.stringify(next));
}
