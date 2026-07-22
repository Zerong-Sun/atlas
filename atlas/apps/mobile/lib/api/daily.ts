import type { DailyBrief } from "@atlas/shared-types";
import { MOCK_DAILY_BRIEF } from "../mock/data";
import { invokeFunction } from "../supabase";
import { EDGE, useMockApi } from "./shared";

export async function fetchDailyBrief(date?: string): Promise<DailyBrief> {
  if (useMockApi()) {
    return { ...MOCK_DAILY_BRIEF, date: date ?? MOCK_DAILY_BRIEF.date };
  }
  const data = await invokeFunction<DailyBrief>(EDGE.dailyBrief, { date });
  return data ?? { ...MOCK_DAILY_BRIEF, date: date ?? MOCK_DAILY_BRIEF.date };
}
