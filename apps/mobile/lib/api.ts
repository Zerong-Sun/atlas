/** Barrel re-exports — prefer domain modules (`@/lib/api/readings`, etc.) for tree-shaking. */
export { EDGE, delay, useMockApi } from "./api/shared";
export { createReading, listReadings } from "./api/readings";
export {
  createDreamEntry,
  fetchDreamTrend,
  interpretDream,
  listDreams,
  type DreamInterpretation,
  type DreamTrend,
} from "./api/dreams";
export { fetchDailyBrief } from "./api/daily";
export { browseLibrary, listLibrary, type LibraryEntry } from "./api/library";
export {
  fetchPortraitSummary,
  fetchProfile,
  generatePortrait,
  updateProfile,
  type ProfileUpdateInput,
} from "./api/profile";
export { generatePortraitLocal } from "./api/portrait";
