import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tradition, UserProfile } from "@atlas/shared-types";

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
    disabledTraditions: (data.disabled_traditions ?? []) as Tradition[],
    onboardingCompleted: data.onboarding_completed ?? false,
    corpusVersionPin: data.corpus_version_pin ?? undefined,
  };
}
