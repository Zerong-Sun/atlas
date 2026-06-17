import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTarotCardImageUri, resolveTarotCard, TAROT_DECK } from "./tarotDeck.ts";

describe("tarotDeck", () => {
  it("resolves major arcana by Chinese name", () => {
    const card = resolveTarotCard("愚者");
    assert.equal(card.name, "愚者");
    assert.match(card.image, /commons\.wikimedia\.org/);
  });

  it("resolves aliased names from engines", () => {
    const card = resolveTarotCard("隐者");
    assert.equal(card.name, "隐者");
  });

  it("returns commons image uri helper", () => {
    const uri = getTarotCardImageUri("魔术师");
    assert.match(uri, /RWS_Tarot_01_Magician\.jpg/);
  });

  it("includes 78 cards in full deck", () => {
    assert.equal(TAROT_DECK.length, 78);
  });
});
