import type { UserProfile } from "@atlas/shared-types";
import { MOCK_PROFILE, MOCK_PORTRAIT } from "../mock/data";
import { callEdge, EDGE_PATHS, useMockApi } from "./client";

export type ProfileUpdateInput = Partial<
  Pick<
    UserProfile,
    | "displayName"
    | "birthDate"
    | "birthTime"
    | "birthPlace"
    | "birthLat"
    | "birthLng"
    | "timezone"
    | "disabledTraditions"
    | "onboardingCompleted"
  >
> & { interests?: string[] };

export async function fetchProfile(): Promise<UserProfile> {
  if (useMockApi()) return { ...MOCK_PROFILE };
  const data = await callEdge<UserProfile>(EDGE_PATHS.profile, { method: "GET" });
  return data ?? { ...MOCK_PROFILE };
}

export async function updateProfile(input: ProfileUpdateInput): Promise<UserProfile> {
  if (useMockApi()) {
    return {
      ...MOCK_PROFILE,
      ...input,
      onboardingCompleted: input.onboardingCompleted ?? MOCK_PROFILE.onboardingCompleted,
    };
  }
  const data = await callEdge<UserProfile>(EDGE_PATHS.profile, {
    method: "PATCH",
    body: input as Record<string, unknown>,
  });
  return data ?? { ...MOCK_PROFILE, ...input };
}

export async function fetchPortraitSummary(): Promise<Record<string, string>> {
  if (useMockApi()) return { ...MOCK_PORTRAIT };
  return { ...MOCK_PORTRAIT };
}
