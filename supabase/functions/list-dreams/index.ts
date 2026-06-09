import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { mapDreamEntryRow } from "../_shared/dream.ts";
import { requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { id: userId, client } = await requireUser(req);
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);

    const { data, error } = await client
      .from("dream_entries")
      .select("id, text, emotions, symbols, interpretation, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return jsonResponse({ error: error.message }, 400);
    return jsonResponse({ dreams: (data ?? []).map(mapDreamEntryRow) });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
