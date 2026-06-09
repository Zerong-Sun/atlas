/** Deployed Supabase Edge Function slugs (shared web + mobile). */
export const EDGE_PATHS = {
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

export type EdgePath = (typeof EDGE_PATHS)[keyof typeof EDGE_PATHS];
