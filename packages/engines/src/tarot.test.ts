import { describe, it } from "node:test";
import assert from "node:assert";
import { drawTarotSpread } from "./tarot.js";

describe("drawTarotSpread", () => {
  it("is deterministic for same seed", () => {
    const a = drawTarotSpread("reading-abc");
    const b = drawTarotSpread("reading-abc");
    assert.deepEqual(a.cards, b.cards);
  });

  it("draws three cards", () => {
    const r = drawTarotSpread("seed-1");
    const cards = r.cards as unknown[];
    assert.equal(cards.length, 3);
  });

  it("golden: known seed yields fixed spread", () => {
    const r = drawTarotSpread("reading-golden-v1");
    const cards = r.cards as Array<{ name: string; position: string }>;
    assert.equal(cards.length, 3);
    assert.deepEqual(
      cards.map((c) => c.name),
      ["太阳", "圣杯四", "圣杯国王"],
    );
  });

  it("supports spread selection", () => {
    const r = drawTarotSpread({ seed: "spread-test", spreadId: "one-card" });
    assert.equal(r.cards.length, 1);
    assert.equal(r.spreadId, "one-card");
  });
});
