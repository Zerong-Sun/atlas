import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { client } = await requireUser(req);
    const url = new URL(req.url);
    const tradition = url.searchParams.get("tradition");
    const q = url.searchParams.get("q");

    let conceptsQuery = client.from("concept_index").select("*").limit(50);
    if (tradition) conceptsQuery = conceptsQuery.eq("tradition", tradition);
    if (q) conceptsQuery = conceptsQuery.ilike("label_zh", `%${q}%`);

    const [concepts, intros, sources] = await Promise.all([
      conceptsQuery,
      client.from("tradition_intros").select("*"),
      client.from("sources").select("id, title, tradition, source_type").limit(20),
    ]);

    return jsonResponse({
      concepts: concepts.data ?? [],
      traditionIntros: intros.data ?? [],
      sources: sources.data ?? [],
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
