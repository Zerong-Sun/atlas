import type { DailyBrief } from "@atlas/shared-types";
import { MOCK_DAILY_BRIEF } from "../mock/data";
import { callEdge, EDGE_PATHS, useMockApi } from "./client";

export async function fetchDailyBrief(date?: string): Promise<DailyBrief> {
  const d = date ?? new Date().toISOString().slice(0, 10);
  if (useMockApi()) {
    return { ...MOCK_DAILY_BRIEF, date: d };
  }
  const data = await callEdge<DailyBrief>(EDGE_PATHS.dailyBrief, {
    method: "GET",
    query: { date: d },
  });
  return data ?? { ...MOCK_DAILY_BRIEF, date: d };
}
