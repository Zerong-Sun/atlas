/** Barrel re-exports — prefer domain modules (`@/lib/api/readings`, etc.) for tree-shaking. */
export { EDGE, delay, useMockApi } from "./shared";
export { createReading, listReadings } from "./readings";
export {
  createDreamEntry,
  fetchDreamTrend,
  interpretDream,
  listDreams,
  type DreamInterpretation,
  type DreamTrend,
} from "./dreams";
export { fetchDailyBrief } from "./daily";
export { browseLibrary, listLibrary, type LibraryEntry } from "./library";
export {
  fetchPortraitSummary,
  fetchProfile,
  generatePortrait,
  updateProfile,
  type ProfileUpdateInput,
} from "./profile";
