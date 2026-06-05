/** Shared DTOs for Atlas (诸象) */

export type Tradition = "bazi" | "western" | "tarot" | "iching" | "qimen" | "dream";

export interface StructuredFacts {
  tradition: Tradition;
  computedAt: string;
  facts: Record<string, unknown>;
}

export interface SourceChunkRef {
  chunkId: string;
  sourceId: string;
  tradition: Tradition | string;
  relevance: number;
}

export interface CitationSnapshot {
  chunkId: string;
  original: string;
  translationZh: string;
  annotationZh?: string;
  application?: string;
  traceId: string;
}

export type ReadingSectionType =
  | "summary"
  | "question_restate"
  | "traditions_used"
  | "tradition_analysis"
  | "citations"
  | "consensus"
  | "divergence"
  | "advice"
  | "cautions"
  | "follow_up";

export interface ReadingSection {
  type: ReadingSectionType;
  title: string;
  content: string;
  tradition?: Tradition;
  metadata?: Record<string, unknown>;
}

export interface ReadingReport {
  readingId: string;
  questionId: string;
  traditions: Tradition[];
  sections: ReadingSection[];
  citations: CitationSnapshot[];
  structuredFacts?: StructuredFacts[];
  consensus: string;
  divergence: string;
  degraded: boolean;
  traceId: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  birthLat?: number;
  birthLng?: number;
  timezone?: string;
  disabledTraditions: Tradition[];
  onboardingCompleted: boolean;
  corpusVersionPin?: string;
}

export interface QuestionInput {
  text: string;
  category?: "love" | "career" | "finance" | "family" | "dream" | "health" | "general";
  traditions: Tradition[];
}

export interface DreamEntryInput {
  text: string;
  emotions: string[];
  symbols: string[];
}

/** Server-resolved day color (keyed by userId+date seed) */
export interface DailyBriefDayColor {
  id: string;
  nameEn: string;
  a: string;
  b: string;
}

/** Server-generated slip metadata */
export interface DailyBriefSlip {
  entryId: string;
}

export interface DailyBrief {
  date: string;
  theme: string;
  traditionSummaries: Record<string, string>;
  classicQuote: CitationSnapshot | null;
  suitable: string[];
  avoid: string[];
  /** Resolved server-side from userId+date seed. Falls back to client derivation if absent. */
  dayColor?: DailyBriefDayColor;
  /** Server-generated archive metadata */
  slip?: DailyBriefSlip;
}

export const READING_SECTION_ORDER: ReadingSectionType[] = [
  "summary",
  "question_restate",
  "traditions_used",
  "consensus",
  "divergence",
  "tradition_analysis",
  "citations",
  "advice",
  "cautions",
  "follow_up",
];
