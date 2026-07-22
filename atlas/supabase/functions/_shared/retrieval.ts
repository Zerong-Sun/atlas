import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChunkRecord } from "@atlas/orchestrator";
import type { Tradition } from "@atlas/shared-types";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，。！？、；：]+/)
    .filter((t) => t.length >= 2);
}

function scoreChunk(chunk: ChunkRecord, terms: string[]): number {
  if (terms.length === 0) return 1;
  const hay = [chunk.original, chunk.translationZh, ...(chunk.keywords ?? [])].join(" ").toLowerCase();
  return terms.reduce((score, term) => (hay.includes(term) ? score + 1 : score), 0);
}

function mapRow(row: {
  id: string;
  source_id: string;
  tradition: string;
  original_text: string | null;
  translation_zh: string | null;
  annotation_zh: string | null;
  keywords: string[] | null;
}): ChunkRecord {
  return {
    chunkId: row.id,
    sourceId: row.source_id,
    tradition: row.tradition,
    original: row.original_text ?? "",
    translationZh: row.translation_zh ?? "",
    annotationZh: row.annotation_zh ?? undefined,
    keywords: row.keywords ?? [],
  };
}

/** Load source_chunks from Supabase; ranks by question keywords when query provided. */
export async function loadCorpusChunks(
  client: SupabaseClient,
  traditions: Tradition[],
  opts?: { query?: string; limit?: number }
): Promise<ChunkRecord[]> {
  const filtered = traditions.filter((t) => t !== "dream");
  if (filtered.length === 0) return [];

  const limit = opts?.limit ?? 500;
  const { data, error } = await client
    .from("source_chunks")
    .select("id, source_id, tradition, original_text, translation_zh, annotation_zh, keywords")
    .in("tradition", filtered)
    .limit(limit);

  if (error || !data?.length) return [];

  const records = data.map(mapRow);
  const terms = tokenize(opts?.query ?? "");
  if (terms.length === 0) return records;

  return [...records]
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, terms) }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, Math.min(limit, 80))
    .map((item) => item.chunk);
}

/** Vector similarity search when embeddings are populated (pgvector). */
export async function searchCorpusByEmbedding(
  client: SupabaseClient,
  traditions: Tradition[],
  embedding: number[],
  limit = 12
): Promise<ChunkRecord[]> {
  const filtered = traditions.filter((t) => t !== "dream");
  if (filtered.length === 0 || embedding.length === 0) return [];

  const { data, error } = await client.rpc("match_source_chunks", {
    query_embedding: embedding,
    match_traditions: filtered,
    match_count: limit,
  });

  if (error || !data?.length) return [];

  return data.map((row: {
    id: string;
    source_id: string;
    tradition: string;
    original_text: string | null;
    translation_zh: string | null;
    annotation_zh: string | null;
    keywords: string[] | null;
  }) => mapRow(row));
}

async function fetchQueryEmbedding(text: string): Promise<number[] | null> {
  const key = Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("LLM_API_KEY");
  const base =
    Deno.env.get("OPENAI_BASE_URL") ??
    Deno.env.get("LLM_API_BASE_URL") ??
    "https://api.openai.com/v1";
  if (!key || !text.trim()) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("EMBEDDING_MODEL") ?? "text-embedding-3-small",
        input: text.slice(0, 2000),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/** Hybrid keyword + vector retrieval with RRF merge. Falls back to keyword-only. */
export async function retrieveCorpusChunks(
  client: SupabaseClient,
  traditions: Tradition[],
  opts?: { query?: string; limit?: number }
): Promise<ChunkRecord[]> {
  const query = opts?.query ?? "";
  const limit = opts?.limit ?? 80;
  const keywordChunks = await loadCorpusChunks(client, traditions, { query, limit });
  if (!query.trim()) return keywordChunks;

  const embedding = await fetchQueryEmbedding(query);
  const vectorChunks = embedding
    ? await searchCorpusByEmbedding(client, traditions, embedding, 24)
    : [];

  const byId = new Map<string, ChunkRecord>();
  for (const chunk of [...keywordChunks, ...vectorChunks]) {
    byId.set(chunk.chunkId, chunk);
  }
  const records = [...byId.values()];
  const terms = tokenize(query);

  const keywordScores = new Map<string, number>();
  for (const chunk of records) {
    const score = scoreChunk(chunk, terms);
    if (score > 0) keywordScores.set(chunk.chunkId, score);
  }

  const vectorScores = new Map<string, number>();
  vectorChunks.forEach((chunk, rank) => {
    vectorScores.set(chunk.chunkId, vectorChunks.length - rank);
  });

  const rrf = new Map<string, number>();
  const mergeRanked = (scores: Map<string, number>, k = 60) => {
    const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    ranked.forEach(([id, _score], rank) => {
      rrf.set(id, (rrf.get(id) ?? 0) + 1 / (k + rank + 1));
    });
  };
  mergeRanked(keywordScores);
  mergeRanked(vectorScores);

  const merged = [...rrf.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => byId.get(id)!)
    .filter(Boolean)
    .slice(0, Math.min(limit, 80));

  return merged.length > 0 ? merged : keywordChunks;
}

/** Deterministic pick from corpus rows using a seed string. */
export function pickChunkBySeed(chunks: ChunkRecord[], seed: string): ChunkRecord | null {
  if (chunks.length === 0) return null;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return chunks[h % chunks.length] ?? null;
}
