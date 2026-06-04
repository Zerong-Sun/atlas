import type { UserProfile } from "@atlas/shared-types";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { loadProfile } from "../_shared/profile.ts";
import { requireUser } from "../_shared/supabase.ts";

function toRow(userId: string, body: Partial<UserProfile>) {
  return {
    user_id: userId,
    display_name: body.displayName ?? null,
    birth_date: body.birthDate ?? null,
    birth_time: body.birthTime ?? null,
    birth_place: body.birthPlace ?? null,
    birth_lat: body.birthLat ?? null,
    birth_lng: body.birthLng ?? null,
    timezone: body.timezone ?? "Asia/Shanghai",
    disabled_traditions: body.disabledTraditions ?? [],
    onboarding_completed: body.onboardingCompleted ?? false,
    corpus_version_pin: body.corpusVersionPin ?? null,
    updated_at: new Date().toISOString(),
  };
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
