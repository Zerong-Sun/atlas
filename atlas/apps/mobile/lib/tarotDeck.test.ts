import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getTarotCardAssetId, resolveTarotCard, TAROT_DECK } from "./tarotDeck.ts";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { interpretTarot } from "@atlas/engines/tarot";

describe("tarotDeck", () => {
  it("resolves major arcana by Chinese name", () => {
    const card = resolveTarotCard("愚者");
    assert.equal(card.name, "愚者");
    assert.equal(card.id, "fool");
  });

  it("resolves aliased names from engines", () => {
    const card = resolveTarotCard("隐者");
    assert.equal(card.name, "隐者");
  });

  it("resolves the local bundled image key", () => {
    assert.equal(getTarotCardAssetId("魔术师"), "magician");
  });

  it("includes 78 cards in full deck", () => {
    assert.equal(TAROT_DECK.length, 78);
    assert.equal(new Set(TAROT_DECK.map((card) => card.id)).size, 78);
    for (const card of TAROT_DECK) {
      assert.ok(existsSync(decodeURIComponent(new URL(`../../../packages/method-data/assets/tarot/${card.id}.webp`, import.meta.url).pathname)), card.id);
    }
  });

  it("bundles exactly the cards in the deck", () => {
    const source = readFileSync(fileURLToPath(new URL("./tarotAssets.ts", import.meta.url).href), "utf8");
    const mappings = [...source.matchAll(/"([^"]+)": require\("[^"]+\/([^/]+)\.webp"\)/g)];
    assert.equal(mappings.length, 78);
    assert.deepEqual(new Set(mappings.map((match) => match[1])), new Set(TAROT_DECK.map((card) => card.id)));
    assert.ok(mappings.every((match) => match[1] === match[2]));
  });

  it("uses the card's concrete meaning in the generated scenario", () => {
    const card = resolveTarotCard("正义");
    const reading = interpretTarot([{ ...card, position: "现在/核心", reversed: false }]);
    assert.ok(reading.scenarioSections[0]?.content.includes(card.upright));
  });
});
