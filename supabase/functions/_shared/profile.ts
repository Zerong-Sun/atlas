import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortraitSummary, Tradition, UserProfile } from "@atlas/shared-types";

function mapPortraitSummary(raw: unknown): PortraitSummary | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const traditions =
    o.traditions && typeof o.traditions === "object"
      ? (o.traditions as PortraitSummary["traditions"])
      : undefined;
  if (!traditions || Object.keys(traditions).length === 0) return undefined;
  return {
    traditions,
    consensus: typeof o.consensus === "string" ? o.consensus : undefined,
    divergence: typeof o.divergence === "string" ? o.divergence : undefined,
    generatedAt: typeof o.generatedAt === "string" ? o.generatedAt : undefined,
  };
}

export async function loadProfile(
  client: SupabaseClient,
  userId: string
): Promise<UserProfile | undefined> {
  const { data } = await client.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return undefined;
  return {
    userId: data.user_id,
    displayName: data.display_name ?? undefined,
    birthDate: data.birth_date ?? undefined,
    birthTime: data.birth_time?.slice(0, 5) ?? undefined,
    birthPlace: data.birth_place ?? undefined,
    birthLat: data.birth_lat ?? undefined,
    birthLng: data.birth_lng ?? undefined,
    timezone: data.timezone ?? undefined,
    gender: data.gender === "male" || data.gender === "female" ? data.gender : undefined,
    interests: Array.isArray(data.interests) ? (data.interests as string[]) : undefined,
    disabledTraditions: (data.disabled_traditions ?? []) as Tradition[],
    onboardingCompleted: data.onboarding_completed ?? false,
    corpusVersionPin: data.corpus_version_pin ?? undefined,
    portraitSummary: mapPortraitSummary(data.portrait_summary),
  };
}
