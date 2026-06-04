import type { CitationSnapshot, ReadingReport, ReadingSection, Tradition } from "@atlas/shared-types";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireUser } from "../_shared/supabase.ts";

type ReadingRow = {
  id: string;
  question_id: string | null;
  traditions: string[];
  structured_facts: ReadingReport["structuredFacts"];
  consensus: string | null;
  divergence: string | null;
  degraded: boolean | null;
  trace_id: string;
  created_at: string;
};

type SectionRow = {
  reading_id: string;
  section_type: ReadingSection["type"];
  title: string;
  content: string;
  tradition: Tradition | null;
  sort_order: number;
  metadata: Record<string, unknown> | null;
};

type CitationRow = {
  reading_id: string;
  chunk_id: string;
  original_text: string | null;
  translation_zh: string | null;
  annotation_zh: string | null;
  application: string | null;
  trace_id: string;
};

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const { client } = await requireUser(req);
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);

    const { data: readings, error: readingsError } = await client
      .from("readings")
      .select("id, question_id, traditions, structured_facts, consensus, divergence, degraded, trace_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (readingsError) return jsonResponse({ error: readingsError.message }, 400);
    if (!readings?.length) return jsonResponse({ readings: [] });

    const readingIds = readings.map((r) => r.id);
    const [sectionsResult, citationsResult] = await Promise.all([
      client
        .from("reading_sections")
        .select("reading_id, section_type, title, content, tradition, sort_order, metadata")
        .in("reading_id", readingIds)
        .order("sort_order", { ascending: true }),
      client
        .from("citation_snapshots")
        .select("reading_id, chunk_id, original_text, translation_zh, annotation_zh, application, trace_id")
        .in("reading_id", readingIds),
    ]);

    if (sectionsResult.error) return jsonResponse({ error: sectionsResult.error.message }, 400);
    if (citationsResult.error) return jsonResponse({ error: citationsResult.error.message }, 400);

    const sectionsByReading = groupByReadingId(sectionsResult.data ?? []);
    const citationsByReading = groupByReadingId(citationsResult.data ?? []);

    const reports = (readings as ReadingRow[]).map((row) =>
      mapReadingReport(
        row,
        (sectionsByReading.get(row.id) ?? []) as SectionRow[],
        (citationsByReading.get(row.id) ?? []) as CitationRow[]
      )
    );

    return jsonResponse({ readings: reports });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonResponse({ error: String(e) }, 500);
  }
});

function groupByReadingId<T extends { reading_id: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    grouped.set(row.reading_id, [...(grouped.get(row.reading_id) ?? []), row]);
  }
  return grouped;
}

function mapReadingReport(
  row: ReadingRow,
  sections: SectionRow[],
  citations: CitationRow[]
): ReadingReport {
  return {
    readingId: row.id,
    questionId: row.question_id ?? "",
    traditions: row.traditions as Tradition[],
    sections: sections.map(mapSection),
    citations: citations.map(mapCitation),
    structuredFacts: row.structured_facts ?? [],
    consensus: row.consensus ?? "",
    divergence: row.divergence ?? "",
    degraded: row.degraded ?? false,
    traceId: row.trace_id,
    createdAt: row.created_at,
  };
}

function mapSection(row: SectionRow): ReadingSection {
  return {
    type: row.section_type,
    title: row.title,
    content: row.content,
    tradition: row.tradition ?? undefined,
    metadata: row.metadata ?? undefined,
  };
}

function mapCitation(row: CitationRow): CitationSnapshot {
  return {
    chunkId: row.chunk_id,
    original: row.original_text ?? "",
    translationZh: row.translation_zh ?? "",
    annotationZh: row.annotation_zh ?? undefined,
    application: row.application ?? undefined,
    traceId: row.trace_id,
  };
}
