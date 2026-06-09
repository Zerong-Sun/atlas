import { MimoGateway, PortraitService } from "@atlas/orchestrator";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { loadProfile } from "../_shared/profile.ts";
import { requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { id: userId, client } = await requireUser(req);
    const profile = await loadProfile(client, userId);
    if (!profile?.birthDate) {
      return jsonResponse({ error: "birth_date_required" }, 400);
    }

    const mimo = new MimoGateway({
      MIMO_API_KEY: Deno.env.get("MIMO_API_KEY") ?? undefined,
      MIMO_API_BASE_URL: Deno.env.get("MIMO_API_BASE_URL") ?? undefined,
      MIMO_API_URL: Deno.env.get("MIMO_API_URL") ?? undefined,
      MIMO_MODEL: Deno.env.get("MIMO_MODEL") ?? undefined,
      LLM_API_KEY: Deno.env.get("LLM_API_KEY") ?? undefined,
      LLM_API_BASE_URL: Deno.env.get("LLM_API_BASE_URL") ?? undefined,
      LLM_API_URL: Deno.env.get("LLM_API_URL") ?? undefined,
      LLM_MODEL: Deno.env.get("LLM_MODEL") ?? undefined,
      OPENAI_API_KEY: Deno.env.get("OPENAI_API_KEY") ?? undefined,
      OPENAI_BASE_URL: Deno.env.get("OPENAI_BASE_URL") ?? undefined,
      OPENAI_API_URL: Deno.env.get("OPENAI_API_URL") ?? undefined,
      OPENAI_MODEL: Deno.env.get("OPENAI_MODEL") ?? undefined,
    });

    const service = new PortraitService(mimo);
    const portrait = await service.generate(profile);

    const { error } = await client
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          portrait_summary: portrait,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    if (error) return jsonResponse({ error: error.message }, 400);

    return jsonResponse(portrait);
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
