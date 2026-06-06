import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { drawLenormand } from "./lenormand.js";
import { drawLot, registerLotSigns } from "./lot.js";
import { castLiuyao } from "./liuyao.js";
import { computeFengshui } from "./fengshui.js";
import { computeZiwei } from "./ziwei.js";

describe("drawLenormand", () => {
  it("returns deterministic spread for fixed seed", () => {
    const a = drawLenormand({ seed: "test-seed", spread: "three" });
    const b = drawLenormand({ seed: "test-seed", spread: "three" });
    assert.equal(a.cards.map((c) => c.id).join(","), b.cards.map((c) => c.id).join(","));
    assert.equal(a.cards.length, 3);
  });
});

describe("drawLot", () => {
  it("draws from registered signs", () => {
    registerLotSigns([
      {
        id: "t-1",
        temple: "guanyin",
        number: 1,
        grade: "上签",
        title: "测试",
        poem: ["测"],
        categories: ["general"],
        plainReading: "测试",
        advice: ["测试"],
        safetyNotes: [],
        sourceReference: "test",
      },
    ]);
    const r = drawLot({ seed: "lot-seed", temple: "guanyin" });
    assert.equal(r.sign.id, "t-1");
  });
});

describe("castLiuyao", () => {
  it("computes hexagram from fixed lines", () => {
    const r = castLiuyao({ lines: [7, 8, 7, 8, 7, 8], seed: "fixed" });
    assert.equal(r.lines.length, 6);
    assert.ok(r.primaryName);
    assert.ok(r.worldLine >= 1 && r.worldLine <= 6);
  });
});

describe("computeFengshui", () => {
  it("returns nine palaces", () => {
    const r = computeFengshui({ sittingDegree: 180 });
    assert.equal(r.palaces.length, 9);
    assert.ok(r.sittingMountain);
  });
});

describe("computeZiwei", () => {
  it("builds palace chart for birth date", () => {
    const r = computeZiwei({ birthDate: "1990-05-15", birthTime: "08:30", gender: "male" });
    assert.equal(r.palaces.length, 12);
    assert.ok(r.summary.includes("命宫"));
  });
});
