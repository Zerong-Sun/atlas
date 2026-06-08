import type { DrawnTarotCardResult } from "./tarot.ts";
import type { DrawnTarotCard } from "./tarot-interpret.ts";

/** Map engine draw results to interpretTarot input. */
export function toInterpretTarotCards(cards: DrawnTarotCardResult[]): DrawnTarotCard[] {
  return cards.map((c) => ({
    id: c.id,
    name: c.name,
    arcana: c.arcana as "major" | "minor",
    suit: c.suit,
    element: c.element,
    upright: c.upright,
    reversedMeaning: c.reversedMeaning,
    keywords: c.keywords,
    reversedKeywords: c.keywords,
    advice: "",
    reversed: c.reversed,
    position: c.position,
    reversalLayer: c.reversalLayer,
  }));
}
