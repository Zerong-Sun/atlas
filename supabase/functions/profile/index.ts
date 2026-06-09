import type { PortraitSummary, UserProfile } from "@atlas/shared-types";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { loadProfile } from "../_shared/profile.ts";
import { requireUser } from "../_shared/supabase.ts";

function toRow(userId: string, body: Partial<UserProfile> & { interests?: string[] }) {
  const row: Record<string, unknown> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  if (body.displayName !== undefined) row.display_name = body.displayName ?? null;
  if (body.birthDate !== undefined) row.birth_date = body.birthDate ?? null;
  if (body.birthTime !== undefined) row.birth_time = body.birthTime ?? null;
  if (body.birthPlace !== undefined) row.birth_place = body.birthPlace ?? null;
  if (body.birthLat !== undefined) row.birth_lat = body.birthLat ?? null;
  if (body.birthLng !== undefined) row.birth_lng = body.birthLng ?? null;
  if (body.timezone !== undefined) row.timezone = body.timezone ?? "Asia/Shanghai";
  if (body.gender !== undefined) row.gender = body.gender ?? null;
  if (body.interests !== undefined) row.interests = body.interests ?? [];
  if (body.disabledTraditions !== undefined) row.disabled_traditions = body.disabledTraditions ?? [];
  if (body.onboardingCompleted !== undefined) row.onboarding_completed = body.onboardingCompleted ?? false;
  if (body.corpusVersionPin !== undefined) row.corpus_version_pin = body.corpusVersionPin ?? null;
  if (body.portraitSummary !== undefined) row.portrait_summary = body.portraitSummary ?? null;
  return row;
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;

  try {
    const { id: userId, client } = await requireUser(req);

    if (req.method === "GET") {
      const profile = await loadProfile(client, userId);
      return jsonResponse(profile ?? { userId, disabledTraditions: [], onboardingCompleted: false });
    }

    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      const body = (await req.json()) as Partial<UserProfile>;
      const row = toRow(userId, body);
      const { data, error } = await client
        .from("profiles")
        .upsert(row, { onConflict: "user_id" })
        .select("*")
        .single();
      if (error) return jsonResponse({ error: error.message }, 400);
      const profile = await loadProfile(client, userId);
      return jsonResponse(profile ?? data);
    }

    if (req.method === "DELETE") {
      const { error } = await client.from("profiles").delete().eq("user_id", userId);
      if (error) return jsonResponse({ error: error.message }, 400);
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
