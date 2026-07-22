import { isSupabaseConfigured } from "../supabase";

export const EDGE = {
  createReading: "create-reading",
  listReadings: "list-readings",
  interpretDream: "create-dream",
  listDreams: "list-dreams",
  dreamTrend: "dream-trend",
  dailyBrief: "daily-brief",
  libraryList: "get-library",
  profile: "profile",
  generatePortrait: "generate-portrait",
} as const;

export function useMockApi(): boolean {
  return !isSupabaseConfigured;
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
