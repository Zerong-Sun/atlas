import { describe, expect, it } from "vitest";
import { castGeomancy } from "@atlas/engines/geomancy";
import { readCoffeeGrounds } from "@atlas/engines/coffee";
import { computeNumerology } from "@atlas/engines/numerology";
import { castMeihua } from "@atlas/engines/meihua";
import { drawOracle } from "@atlas/engines/oracle";
import { readPalmistry } from "@atlas/engines/palmistry";
import { castScryingVision } from "@atlas/engines/scrying";
import { buildVedicChart } from "@atlas/engines/vedic";
import { readXiangmian } from "@atlas/engines/xiangmian";

const READY_ENGINE_IDS = [
  "meihua",
  "vedic",
  "numerology",
  "geomancy",
  "xiangmian",
  "palmistry",
  "oracle",
  "coffee",
  "scrying",
] as const;

describe("ready method engines", () => {
  it("covers all migrated preview method ids", () => {
    expect(READY_ENGINE_IDS).toHaveLength(9);
  });

  it("oracle is deterministic", () => {
    const a = drawOracle({ seed: "oracle-test", spread: "three" });
    const b = drawOracle({ seed: "oracle-test", spread: "three" });
    expect(a.cards.map((c) => c.id)).toEqual(b.cards.map((c) => c.id));
  });

  it("coffee is deterministic", () => {
    const a = readCoffeeGrounds({ seed: "coffee-test" });
    const b = readCoffeeGrounds({ seed: "coffee-test" });
    expect(a.zones.map((z) => z.symbol.id)).toEqual(b.zones.map((z) => z.symbol.id));
  });

  it("scrying is deterministic", () => {
    const a = castScryingVision({ seed: "scry-test", crystalId: "quartz" });
    const b = castScryingVision({ seed: "scry-test", crystalId: "quartz" });
    expect(a.color.name).toBe(b.color.name);
    expect(a.shape.name).toBe(b.shape.name);
  });

  it("numerology computes life path", () => {
    const r = computeNumerology({ birthDate: "1990-06-15", name: "Test" });
    expect(r.lifePath).toBeGreaterThan(0);
    expect(r.destiny).toBeGreaterThan(0);
  });

  it("geomancy is deterministic", () => {
    const a = castGeomancy({ seed: "geo-test" });
    const b = castGeomancy({ seed: "geo-test" });
    expect(a.judge.key).toBe(b.judge.key);
    expect(a.mothers.length).toBe(4);
  });

  it("meihua is deterministic", () => {
    const a = castMeihua({ seed: "mh", mode: "number", numbers: [3, 7] });
    const b = castMeihua({ seed: "mh", mode: "number", numbers: [3, 7] });
    expect(a.upper.name).toBe(b.upper.name);
    expect(a.lower.name).toBe(b.lower.name);
  });

  it("vedic chart builder returns grahas and houses", () => {
    const r = buildVedicChart(
      {
        julianDay: 2451063.5,
        ayanamsa: 23.72,
        ascendantLongitude: 147,
        midheavenLongitude: 57,
        grahaLongitudes: {
          Sun: 60, Moon: 317, Mars: 10, Mercury: 45, Jupiter: 200,
          Venus: 80, Saturn: 270, Rahu: 286, Ketu: 106,
        },
      },
      { birthDate: "1990-06-15", birthTime: "12:00" },
    );
    expect(r.moonSign).toBeTruthy();
    expect(r.moonNakshatra.name).toBeTruthy();
    expect(r.grahas).toHaveLength(9);
    expect(r.houses).toHaveLength(12);
  });

  it("xiangmian reads observations", () => {
    const r = readXiangmian({ observations: ["上停-饱满", "眼神-清亮"] });
    expect(r.readings).toHaveLength(2);
  });

  it("palmistry reads observations", () => {
    const r = readPalmistry({ hand: "right", observations: ["生命线-深长"] });
    expect(r.readings).toHaveLength(1);
  });
});
