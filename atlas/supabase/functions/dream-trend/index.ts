import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { aggregateDreamTrend } from "../_shared/dream.ts";
import { requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { id: userId, client } = await requireUser(req);
    const url = new URL(req.url);
    const periodDays = Math.min(Math.max(Number(url.searchParams.get("days") ?? "7"), 1), 30);

    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from("dream_entries")
      .select("symbols, emotions, created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse(aggregateDreamTrend(data ?? [], periodDays));
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
