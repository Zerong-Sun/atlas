import type { PortraitSummary, UserProfile } from "@atlas/shared-types";
import { MOCK_PROFILE } from "../mock/data";
import { invokeFunction, invokeFunctionGet } from "../supabase";
import { EDGE, useMockApi } from "./shared";

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
  const data = await invokeFunctionGet<UserProfile>(EDGE.profile);
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
  const data = await invokeFunction<UserProfile>(EDGE.profile, input as Record<string, unknown>);
  return data ?? { ...MOCK_PROFILE, ...input };
}

export async function generatePortrait(profile?: UserProfile): Promise<PortraitSummary> {
  const base = profile ?? (await fetchProfile());
  const { generatePortraitLocal } = await import("./portrait");
  if (useMockApi()) return generatePortraitLocal(base);
  const data = await invokeFunction<PortraitSummary>(EDGE.generatePortrait, {});
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
