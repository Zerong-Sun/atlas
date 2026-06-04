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
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
    const offset = Number(url.searchParams.get("offset") ?? 0);

    let conceptsQuery = client.from("concept_index").select("*").range(offset, offset + limit - 1);
    if (tradition) conceptsQuery = conceptsQuery.eq("tradition", tradition);
    if (q) conceptsQuery = conceptsQuery.ilike("label_zh", `%${q}%`);

    let chunksQuery = client
      .from("source_chunks")
      .select("id, source_id, tradition, chapter, section, translation_zh, keywords, review_status")
      .range(offset, offset + limit - 1);
    if (tradition) chunksQuery = chunksQuery.eq("tradition", tradition);
    if (q) {
      chunksQuery = chunksQuery.or(
        `translation_zh.ilike.%${q}%,annotation_zh.ilike.%${q}%,chapter.ilike.%${q}%`
      );
    }

    const [concepts, intros, sources, chunks] = await Promise.all([
      conceptsQuery,
      client.from("tradition_intros").select("*"),
      client.from("sources").select("id, title, tradition, source_type, license_note").limit(20),
      chunksQuery,
    ]);

    return jsonResponse({
      concepts: concepts.data ?? [],
      chunks: chunks.data ?? [],
      traditionIntros: intros.data ?? [],
      sources: sources.data ?? [],
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
