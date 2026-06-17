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

export type PortraitGender = "male" | "female";

export interface PortraitSummary {
  traditions: Partial<Record<Tradition, string>>;
  consensus?: string;
  divergence?: string;
  generatedAt?: string;
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
  gender?: PortraitGender;
  interests?: string[];
  disabledTraditions: Tradition[];
  onboardingCompleted: boolean;
  corpusVersionPin?: string;
  portraitSummary?: PortraitSummary;
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

/** Method module ids (separate from Tradition reading pipeline) */
export type MethodId =
  | "ziwei"
  | "liuyao"
  | "fengshui"
  | "lenormand"
  | "lot"
  | "western";

export type LotTemple = "guanyin" | "guandi" | "mazu" | "mixed";

export type LenormandSpread = "three" | "five" | "nine" | "grand";

export interface LiuyaoInput {
  seed?: string;
  timestamp?: string;
  /** Pre-cast lines: 6=老阳, 7=少阳, 8=少阴, 9=老阴 */
  lines?: number[];
  questionCategory?: "career" | "love" | "finance" | "health" | "general";
}

export interface FengshuiInput {
  /** Sitting direction in degrees (0=north, 90=east) */
  sittingDegree?: number;
  /** 24-mountain name e.g. 子山午向 */
  sittingMountain?: string;
  birthYear?: number;
  timestamp?: string;
}

export interface LenormandInput {
  seed?: string;
  spread?: LenormandSpread;
  question?: string;
}

export type RuneSpread = "single" | "three" | "nine";

export interface RunesInput {
  seed?: string;
  spread?: RuneSpread;
  question?: string;
  allowReversed?: boolean;
}

export interface AstrodiceInput {
  seed?: string;
  question?: string;
}

export type OracleSpread = "single" | "three";

export interface OracleInput {
  seed?: string;
  question?: string;
  spread?: OracleSpread;
  theme?: string;
}

export interface CoffeeInput {
  seed?: string;
  question?: string;
}

export interface ScryingInput {
  seed?: string;
  question?: string;
  crystalId?: string;
}

export interface NumerologyInput {
  birthDate?: string;
  name?: string;
  referenceYear?: number;
}

export interface GeomancyInput {
  seed?: string;
  question?: string;
  mothers?: boolean[][];
  questionType?: "general" | "self" | "relationship" | "career" | "home" | "money" | "travel" | "health" | "study";
}

export type MeihuaMode = "number" | "time";

export interface MeihuaInput {
  seed?: string;
  question?: string;
  mode?: MeihuaMode;
  numbers?: number[];
  timestamp?: string;
}

export interface VedicInput {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  birthLat?: number;
  birthLng?: number;
  /** Hours east of UTC (e.g. 8 for China Standard Time) */
  timezone?: number;
}

export interface XiangmianInput {
  question?: string;
  observations?: string[];
}

export interface PalmistryInput {
  question?: string;
  hand?: "left" | "right" | "both";
  observations?: string[];
}

export interface LotInput {
  seed?: string;
  temple?: LotTemple;
}

export interface ZiweiInput {
  birthDate?: string;
  birthTime?: string;
  gender?: "male" | "female";
  calendar?: "solar" | "lunar";
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

/** Rule matching & interpret DTOs (三术专库接入) */
export type QimenJuMethod = "chaibu" | "zhirun";

export interface MatchedRuleEvidence {
  label: string;
  detail: string;
}

export interface MatchedRule {
  id: string;
  name: string;
  confidence: number;
  evidence: MatchedRuleEvidence[];
  libraryRef?: string;
  category?: string;
  level?: string;
  meaning?: string;
  actionHint?: string;
}

export interface TimingWindow {
  label: string;
  range: string;
  basis: string;
}

export interface DirectionAdvice {
  palace: string;
  direction: string;
  spatial: string;
  action: string;
  people: string;
  timing: string;
}

export interface QimenInterpretResult {
  matchedPatterns: MatchedRule[];
  relations: MatchedRule[];
  timingWindows: TimingWindow[];
  directionAdvice?: DirectionAdvice;
  usefulGod?: string;
  summary: string;
}

export interface BaziInterpretResult {
  matchedCombos: MatchedRule[];
  matchedPatterns: MatchedRule[];
  activeDeities: MatchedRule[];
  luckInteractions: MatchedRule[];
  classicHits: MatchedRule[];
  summary: string;
}

export interface TarotInterpretResult {
  pairMatches: MatchedRule[];
  scenarioSections: Array<{ title: string; content: string }>;
  cardReadings: Array<{
    cardId: string;
    name: string;
    position: string;
    reversed: boolean;
    upright: string;
    reversalLayer?: string;
    reversalDetail?: string;
  }>;
  summary: string;
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
