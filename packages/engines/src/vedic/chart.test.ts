import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildVedicChart } from "./chart.ts";
import type { VedicEphemerisData } from "./types.ts";
import { computeVedic } from "./ephemeris.node.ts";

describe("buildVedicChart", () => {
  it("places grahas in whole sign houses", () => {
    const ephemeris: VedicEphemerisData = {
      julianDay: 2451063.5,
      ayanamsa: 23.72,
      ascendantLongitude: 120,
      midheavenLongitude: 30,
      grahaLongitudes: {
        Sun: 60,
        Moon: 317,
        Mars: 10,
        Mercury: 45,
        Jupiter: 200,
        Venus: 80,
        Saturn: 270,
        Rahu: 286,
        Ketu: 106,
      },
    };
    const r = buildVedicChart(ephemeris, { birthDate: "1990-06-15", birthTime: "12:00" });
    assert.equal(r.grahas.length, 9);
    assert.equal(r.houses.length, 12);
    assert.ok(r.moonNakshatra.name);
    assert.ok(r.mahadashaLabel);
    assert.ok(r.antardashaLabel);
    assert.match(r.note, /Whole Sign/);
  });
});

describe("computeVedic (node ephemeris)", () => {
  it("returns sidereal lagna and nine grahas for Beijing noon", () => {
    const r = computeVedic({
      birthDate: "1990-06-15",
      birthTime: "12:00",
      birthLat: 39.9042,
      birthLng: 116.4074,
      timezone: 8,
    });
    assert.ok(r.ascendantSign);
    assert.ok(r.ascendantDegree >= 0);
    assert.equal(r.grahas.length, 9);
    assert.notEqual(r.ascendantSign, "白羊座");
    assert.match(r.summary, /月亮/);
  });
});
