import { createRng, shuffleWithSeed } from "./seed.ts";
import {
  TAROT_DECK,
  getSpread,
} from "./tarot-deck.ts";
import { pickReversalLayer, buildTarotCombination, type DrawnTarotCard } from "./tarot-interpret.ts";

export type { TarotDeckCard, TarotSpreadDefinition } from "./tarot-deck.ts";
export { TAROT_DECK, TAROT_SPREADS, getSpread, getCardByName } from "./tarot-deck.ts";
export {
  interpretTarot,
  matchPairRules,
  TAROT_PAIR_RULES,
  buildTarotCombination,
} from "./tarot-interpret.ts";

export interface DrawnTarotCardResult {
  id: string;
  name: string;
  arcana: string;
  suit: string;
  element: string;
  reversed: boolean;
  position: string;
  keywords: string[];
  upright: string;
  reversedMeaning: string;
  reversalLayer?: string;
}

export interface TarotSpreadResult {
  spreadId: string;
  spread: string;
  cards: DrawnTarotCardResult[];
  summary: string;
}

export interface DrawTarotOptions {
  seed?: string;
  spreadId?: string;
  includeMinor?: boolean;
  reversalRate?: number;
}

/** @deprecated use drawTarotSpread with options */
export const MAJOR_ARCANA = TAROT_DECK.filter((c) => c.arcana === "major").map((c, id) => ({
  id,
  name: c.name,
  keywords: c.keywords,
}));

export function drawTarotSpread(options: DrawTarotOptions): TarotSpreadResult;
export function drawTarotSpread(seed: string): Record<string, unknown>;
export function drawTarotSpread(seedOrOptions?: string | DrawTarotOptions): TarotSpreadResult | Record<string, unknown> {
  const opts: DrawTarotOptions =
    typeof seedOrOptions === "string" ? { seed: seedOrOptions } : seedOrOptions ?? {};
  const seed = opts.seed ?? String(Date.now());
  const spread = getSpread(opts.spreadId ?? "three-timeline");
  const pool = opts.includeMinor === false
    ? TAROT_DECK.filter((c) => c.arcana === "major")
    : TAROT_DECK;
  const rng = createRng(seed);
  const shuffled = shuffleWithSeed(pool, seed);
  const reversalRate = opts.reversalRate ?? 0.3;

  const drawnCards: DrawnTarotCard[] = spread.positions.map((position, i) => {
    const card = shuffled[i]!;
    const reversed = rng() < reversalRate;
    return { ...card, reversed, position };
  });

  const result: TarotSpreadResult = {
    spreadId: spread.id,
    spread: spread.name,
    cards: drawnCards.map((card) => {
      const layer = card.reversed ? pickReversalLayer(card, rng()) : undefined;
      return {
        id: card.id,
        name: card.name,
        arcana: card.arcana,
        suit: card.suit,
        element: card.element,
        reversed: card.reversed,
        position: card.position,
        keywords: card.reversed ? card.reversedKeywords : card.keywords,
        upright: card.upright,
        reversedMeaning: card.reversedMeaning,
        reversalLayer: layer,
      };
    }),
    summary: buildTarotCombination(drawnCards),
  };

  if (typeof seedOrOptions === "string" && !opts.spreadId) {
    return {
      spread: result.spreadId,
      cards: result.cards.map((c) => ({
        name: c.name,
        reversed: c.reversed,
        position: c.position,
        keywords: c.keywords,
      })),
      summary: result.summary,
    };
  }
  return result;
}
