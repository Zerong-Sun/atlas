import type { SourceChunkRef, Tradition } from "@atlas/shared-types";

export interface ChunkRecord {
  chunkId: string;
  sourceId: string;
  tradition: string;
  original: string;
  translationZh: string;
  annotationZh?: string;
  keywords: string[];
  /** Mock embedding for vector leg (1536-dim not required in MVP mock) */
  embeddingHint?: string;
}

export interface RetrievalQuery {
  question: string;
  traditions: Tradition[];
  topK?: number;
}

export interface RetrievalResult {
  chunks: SourceChunkRef[];
  records: ChunkRecord[];
}

/** Keyword + mock vector hybrid retrieval (RRF merge) */
export class HybridRetrieval {
  constructor(private readonly corpus: ChunkRecord[] = DEFAULT_MOCK_CORPUS) {}

  retrieve(query: RetrievalQuery): RetrievalResult {
    const topK = query.topK ?? 8;
    const traditions = new Set(query.traditions.filter((t) => t !== "dream"));
    const filtered = this.corpus.filter((c) => traditions.has(c.tradition as Tradition));

    const terms = tokenize(query.question);
    const keywordScores = new Map<string, number>();
    for (const chunk of filtered) {
      let score = 0;
      const hay = [chunk.original, chunk.translationZh, ...chunk.keywords].join(" ");
      for (const term of terms) {
        if (hay.includes(term)) score += 1;
      }
      if (score > 0) keywordScores.set(chunk.chunkId, score);
    }

    const vectorScores = mockVectorScores(query.question, filtered);

    const rrf = new Map<string, number>();
    const mergeRanked = (scores: Map<string, number>, k = 60) => {
      const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
      ranked.forEach(([id], rank) => {
        rrf.set(id, (rrf.get(id) ?? 0) + 1 / (k + rank + 1));
      });
    };
    mergeRanked(keywordScores);
    mergeRanked(vectorScores);

    const sorted = [...rrf.entries()].sort((a, b) => b[1] - a[1]).slice(0, topK);
    const records = sorted
      .map(([id]) => filtered.find((c) => c.chunkId === id))
      .filter((c): c is ChunkRecord => Boolean(c));

    const chunks: SourceChunkRef[] = records.map((r, i) => ({
      chunkId: r.chunkId,
      sourceId: r.sourceId,
      tradition: r.tradition,
      relevance: sorted[i]?.[1] ?? 0,
    }));

    return { chunks, records };
  }
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,，。！？、；：]+/)
    .filter((t) => t.length >= 2);
}

function mockVectorScores(question: string, chunks: ChunkRecord[]): Map<string, number> {
  const q = hashString(question);
  const scores = new Map<string, number>();
  for (const c of chunks) {
    const hint = c.embeddingHint ?? c.translationZh.slice(0, 32);
    const sim = 1 - Math.abs(hashString(hint) - q) / 0xffffffff;
    scores.set(c.chunkId, sim);
  }
  return scores;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const DEFAULT_MOCK_CORPUS: ChunkRecord[] = [
  {
    chunkId: "chunk-bazi-1",
    sourceId: "src-bazi-rules",
    tradition: "bazi",
    original: "日主强弱，以月令为先。",
    translationZh: "判断日主强弱，首先要看出生月份的地支（月令）。",
    keywords: ["日主", "月令", "强弱"],
  },
  {
    chunkId: "chunk-western-1",
    sourceId: "src-western-phrases",
    tradition: "western",
    original: "Sun in sign",
    translationZh: "太阳星座代表核心意志与生命主题。",
    keywords: ["太阳", "星座", "意志"],
  },
  {
    chunkId: "chunk-tarot-1",
    sourceId: "src-tarot-major",
    tradition: "tarot",
    original: "The Fool",
    translationZh: "愚者象征新的开始与信任旅程。",
    keywords: ["愚者", "开始", "冒险"],
  },
  {
    chunkId: "chunk-iching-1",
    sourceId: "src-yijing",
    tradition: "iching",
    original: "元亨利贞。",
    translationZh: "大通顺、利于正固。",
    keywords: ["乾", "元亨利贞"],
  },
  {
    chunkId: "chunk-iching-11",
    sourceId: "src-yijing",
    tradition: "iching",
    original: "小往大来，吉亨。",
    translationZh: "阴消阳长，吉祥亨通。",
    keywords: ["泰", "通泰"],
  },
];
