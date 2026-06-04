import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChunkRecord } from "@atlas/orchestrator";
import type { Tradition } from "@atlas/shared-types";

/** Load source_chunks from Supabase for HybridRetrieval; falls back to empty. */
export async function loadCorpusChunks(
  client: SupabaseClient,
  traditions: Tradition[],
  limit = 300
): Promise<ChunkRecord[]> {
  const filtered = traditions.filter((t) => t !== "dream");
  if (filtered.length === 0) return [];

  const { data, error } = await client
    .from("source_chunks")
    .select("id, source_id, tradition, original_text, translation_zh, annotation_zh, keywords")
    .in("tradition", filtered)
    .limit(limit);

  if (error || !data?.length) return [];

  return data.map((row) => ({
    chunkId: row.id,
    sourceId: row.source_id,
    tradition: row.tradition,
    original: row.original_text ?? "",
    translationZh: row.translation_zh ?? "",
    annotationZh: row.annotation_zh ?? undefined,
    keywords: row.keywords ?? [],
  }));
}

/** Deterministic pick from corpus rows using a seed string. */
export function pickChunkBySeed(chunks: ChunkRecord[], seed: string): ChunkRecord | null {
  if (chunks.length === 0) return null;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return chunks[h % chunks.length] ?? null;
}
