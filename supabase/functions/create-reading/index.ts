import { MimoGateway, ReadingOrchestrator, SEED_CORPUS_FALLBACK } from "@atlas/orchestrator";
import type { QuestionInput, Tradition } from "@atlas/shared-types";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { loadProfile } from "../_shared/profile.ts";
import { loadCorpusChunks } from "../_shared/retrieval.ts";
import { requireUser } from "../_shared/supabase.ts";

async function rollbackReading(client: Awaited<ReturnType<typeof requireUser>>["client"], readingId: string) {
  await client.from("readings").delete().eq("id", readingId);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { id: userId, client } = await requireUser(req);
    const body = (await req.json()) as QuestionInput & { questionId?: string };
    const traditions = (body.traditions ?? ["bazi", "western", "tarot", "iching"]).filter(
      (t) => t !== "dream"
    ) as Tradition[];

    const { data: questionRow, error: qErr } = await client
      .from("questions")
      .insert({
        user_id: userId,
        text: body.text,
        category: body.category ?? "general",
        traditions,
      })
      .select("id")
      .single();
    if (qErr) return jsonResponse({ error: qErr.message }, 400);

    const profile = await loadProfile(client, userId);
    const corpus = await loadCorpusChunks(client, traditions, { query: body.text, limit: 500 });
    const corpusRecords = corpus.length > 0 ? corpus : SEED_CORPUS_FALLBACK;
    const orch = new ReadingOrchestrator({
      mimo: new MimoGateway({
        MIMO_API_KEY: Deno.env.get("MIMO_API_KEY"),
        MIMO_API_BASE_URL: Deno.env.get("MIMO_API_BASE_URL"),
      }),
    });

    const started = Date.now();
    const report = await orch.generate({
      questionId: questionRow.id,
      question: { text: body.text, category: body.category, traditions },
      profile,
      corpus: corpusRecords,
    });
    const latencyMs = Date.now() - started;

    const { data: readingRow, error: rErr } = await client
      .from("readings")
      .insert({
        id: report.readingId,
        user_id: userId,
        question_id: questionRow.id,
        traditions: report.traditions,
        structured_facts: report.structuredFacts ?? [],
        consensus: report.consensus,
        divergence: report.divergence,
        degraded: report.degraded,
        trace_id: report.traceId,
        latency_ms: latencyMs,
      })
      .select("id")
      .single();
    if (rErr) return jsonResponse({ error: rErr.message }, 400);

    const sections = report.sections.map((s, i) => ({
      reading_id: readingRow.id,
      section_type: s.type,
      title: s.title,
      content: s.content,
      tradition: s.tradition ?? null,
      sort_order: i,
      metadata: s.metadata ?? {},
    }));
    const { error: sectionsErr } = await client.from("reading_sections").insert(sections);
    if (sectionsErr) {
      await rollbackReading(client, readingRow.id);
      return jsonResponse({ error: sectionsErr.message }, 400);
    }

    const citations = report.citations
      .filter((c) => isUuid(c.chunkId))
      .map((c) => ({
        reading_id: readingRow.id,
        chunk_id: c.chunkId,
        original_text: c.original,
        translation_zh: c.translationZh,
        annotation_zh: c.annotationZh ?? null,
        application: c.application ?? null,
        trace_id: c.traceId,
      }));
    if (citations.length > 0) {
      const { error: citationsErr } = await client.from("citation_snapshots").insert(citations);
      if (citationsErr) {
        await rollbackReading(client, readingRow.id);
        return jsonResponse({ error: citationsErr.message }, 400);
      }
    }

    return jsonResponse(report);
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});
