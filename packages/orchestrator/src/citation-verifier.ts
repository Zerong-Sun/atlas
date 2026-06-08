import type { CitationSnapshot } from "@atlas/shared-types";
import type { ChunkRecord } from "./hybrid-retrieval.ts";

export interface VerifiableCitation {
  chunkId: string;
  original: string;
  translationZh: string;
  annotationZh?: string;
  application: string;
  traceId: string;
}

export interface VerifyResult {
  valid: CitationSnapshot[];
  rejected: Array<{ chunkId: string; reason: string }>;
}

export class CitationVerifier {
  /** chunk_id must be in retrieval whitelist; application must overlap chunk text */
  verify(
    citations: VerifiableCitation[],
    allowedChunkIds: Set<string>,
    records: ChunkRecord[],
    traceId: string
  ): VerifyResult {
    const valid: CitationSnapshot[] = [];
    const rejected: Array<{ chunkId: string; reason: string }> = [];

    for (const c of citations) {
      if (!allowedChunkIds.has(c.chunkId)) {
        rejected.push({ chunkId: c.chunkId, reason: "chunk_not_in_retrieval" });
        continue;
      }
      const record = records.find((r) => r.chunkId === c.chunkId);
      if (!record) {
        rejected.push({ chunkId: c.chunkId, reason: "chunk_record_missing" });
        continue;
      }
      if (!applicationMatches(c.application, record)) {
        rejected.push({ chunkId: c.chunkId, reason: "application_mismatch" });
        continue;
      }
      valid.push({
        chunkId: c.chunkId,
        original: c.original || record.original,
        translationZh: c.translationZh || record.translationZh,
        annotationZh: c.annotationZh ?? record.annotationZh,
        application: c.application,
        traceId,
      });
    }
    return { valid, rejected };
  }
}

function applicationMatches(application: string, record: ChunkRecord): boolean {
  if (!application || application.length < 4) return false;
  const corpus = [record.original, record.translationZh, record.annotationZh ?? ""].join(" ");
  const normalized = application.replace(/\s/g, "");
  if (corpus.replace(/\s/g, "").includes(normalized.slice(0, 8))) return true;
  if (record.keywords.some((k) => application.includes(k))) return true;
  const zhSnippet = record.translationZh.replace(/\s/g, "").slice(0, 4);
  return zhSnippet.length >= 2 && normalized.includes(zhSnippet);
}
