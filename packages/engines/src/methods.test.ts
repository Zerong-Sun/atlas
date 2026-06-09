import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { drawLenormand } from "./lenormand.js";
import { throwJiaobei, throwJiaobeiSession } from "./jiaobei.js";
import { drawRunes } from "./runes.js";
import { rollAstrodice } from "./astrodice.js";
import { drawOracle } from "./oracle.js";
import { readCoffeeGrounds } from "./coffee.js";
import { castScryingVision } from "./scrying.js";
import { computeNumerology } from "./numerology.js";
import { castGeomancy } from "./geomancy.js";
import { castMeihua } from "./meihua.js";
import { computeVedic } from "./vedic.js";
import { readXiangmian } from "./xiangmian.js";
import { readPalmistry } from "./palmistry.js";
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

describe("throwJiaobei", () => {
  it("returns deterministic outcome for fixed seed", () => {
    const a = throwJiaobei({ seed: "jb-1", throwIndex: 1 });
    const b = throwJiaobei({ seed: "jb-1", throwIndex: 1 });
    assert.deepEqual(a.cups, b.cups);
    assert.equal(a.outcome, b.outcome);
  });

  it("stops session on yin or laugh cup", () => {
    for (let i = 0; i < 80; i++) {
      const session = throwJiaobeiSession({ seed: `stop-${i}`, maxThrows: 3 });
      const last = session.throws[session.throws.length - 1];
      if (last?.outcome === "yin" || last?.outcome === "laugh") {
        assert.equal(session.shouldStop, true);
        return;
      }
    }
    assert.ok(true);
  });
});

describe("drawRunes", () => {
  it("returns deterministic spread for fixed seed", () => {
    const a = drawRunes({ seed: "rune-seed", spread: "three" });
    const b = drawRunes({ seed: "rune-seed", spread: "three" });
    assert.equal(a.runes.map((r) => r.id).join(","), b.runes.map((r) => r.id).join(","));
    assert.equal(a.runes.length, 3);
  });
});

describe("rollAstrodice", () => {
  it("returns deterministic roll for fixed seed", () => {
    const a = rollAstrodice({ seed: "dice-seed" });
    const b = rollAstrodice({ seed: "dice-seed" });
    assert.equal(a.planet.id, b.planet.id);
    assert.equal(a.sign.id, b.sign.id);
    assert.equal(a.house.id, b.house.id);
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

describe("drawOracle", () => {
  it("returns deterministic spread for fixed seed", () => {
    const a = drawOracle({ seed: "oracle-seed", spread: "three" });
    const b = drawOracle({ seed: "oracle-seed", spread: "three" });
    assert.equal(a.cards.map((c) => c.id).join(","), b.cards.map((c) => c.id).join(","));
    assert.equal(a.cards.length, 3);
  });
});

describe("readCoffeeGrounds", () => {
  it("returns deterministic zones for fixed seed", () => {
    const a = readCoffeeGrounds({ seed: "coffee-seed" });
    const b = readCoffeeGrounds({ seed: "coffee-seed" });
    assert.deepEqual(a.zones.map((z) => z.symbol.id), b.zones.map((z) => z.symbol.id));
  });
});

describe("castScryingVision", () => {
  it("returns deterministic vision for fixed seed", () => {
    const a = castScryingVision({ seed: "scry-seed", crystalId: "quartz" });
    const b = castScryingVision({ seed: "scry-seed", crystalId: "quartz" });
    assert.equal(a.color.name, b.color.name);
    assert.equal(a.shape.name, b.shape.name);
  });
});

describe("computeNumerology", () => {
  it("computes core numbers", () => {
    const r = computeNumerology({ birthDate: "1990-06-15", name: "Alex" });
    assert.ok(r.lifePath >= 1);
    assert.ok(r.destiny >= 1);
    assert.ok(r.summary.includes("生命路径"));
  });
});

describe("castGeomancy", () => {
  it("returns deterministic chart for fixed seed", () => {
    const a = castGeomancy({ seed: "geomancy-seed" });
    const b = castGeomancy({ seed: "geomancy-seed" });
    assert.equal(a.judge.key, b.judge.key);
    assert.equal(a.mothers.length, 4);
  });
});

describe("castMeihua", () => {
  it("returns deterministic trigrams for fixed input", () => {
    const a = castMeihua({ seed: "meihua", mode: "number", numbers: [5, 8] });
    const b = castMeihua({ seed: "meihua", mode: "number", numbers: [5, 8] });
    assert.equal(a.upper.name, b.upper.name);
    assert.equal(a.lower.name, b.lower.name);
  });
});

describe("computeVedic", () => {
  it("returns moon sign and nakshatra", () => {
    const r = computeVedic({ birthDate: "1990-06-15", birthTime: "12:00" });
    assert.ok(r.moonSign);
    assert.ok(r.moonNakshatra.name);
    assert.ok(r.summary.includes("月亮"));
  });
});

describe("readXiangmian", () => {
  it("maps observations to readings", () => {
    const r = readXiangmian({ observations: ["上停-饱满"] });
    assert.equal(r.readings.length, 1);
    assert.ok(r.summary);
  });
});

describe("readPalmistry", () => {
  it("maps observations to readings", () => {
    const r = readPalmistry({ hand: "right", observations: ["生命线-深长"] });
    assert.equal(r.readings.length, 1);
    assert.ok(r.summary);
  });
});
