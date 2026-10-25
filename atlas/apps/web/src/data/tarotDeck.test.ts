import { describe, expect, it } from "vitest";
import { interpretTarot } from "@atlas/engines/tarot";
import { TAROT_DECK } from "./tarotDeck";

describe("local tarot deck", () => {
  it("maps every card to a distinct bundled image", () => {
    expect(TAROT_DECK).toHaveLength(78);
    expect(new Set(TAROT_DECK.map((card) => card.id)).size).toBe(78);
    expect(TAROT_DECK.every((card) => typeof card.image === "string" && card.image.includes(".webp"))).toBe(true);
    expect(new Set(TAROT_DECK.map((card) => card.image)).size).toBe(78);
  });

  it("uses the card's concrete meaning in the generated scenario", () => {
    const card = TAROT_DECK.find((item) => item.id === "justice")!;
    const reading = interpretTarot([{ ...card, position: "现在/核心", reversed: false }]);
    expect(reading.scenarioSections[0]?.content).toContain(card.upright);
  });
});
