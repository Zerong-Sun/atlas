import type { PortraitSummary, UserProfile } from "@atlas/shared-types";
import { MOCK_PROFILE } from "../mock/data";
import { generatePortraitLocal } from "../portrait";
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
    | "gender"
    | "interests"
    | "disabledTraditions"
    | "onboardingCompleted"
    | "portraitSummary"
  >
>;

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

export async function generatePortrait(profile?: UserProfile): Promise<PortraitSummary> {
  const base = profile ?? (await fetchProfile());
  if (useMockApi()) {
    return generatePortraitLocal(base);
  }
  const data = await callEdge<PortraitSummary>(EDGE_PATHS.generatePortrait, { method: "POST" });
  if (data?.traditions && Object.keys(data.traditions).length > 0) return data;
  return generatePortraitLocal(base);
}

export async function fetchPortraitSummary(profile?: UserProfile): Promise<PortraitSummary> {
  const base = profile ?? (await fetchProfile());
  if (base.portraitSummary?.traditions && Object.keys(base.portraitSummary.traditions).length > 0) {
    return base.portraitSummary;
  }
  return generatePortrait(base);
}
