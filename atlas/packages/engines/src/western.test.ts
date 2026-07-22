import { describe, it } from "node:test";
import assert from "node:assert";
import { computeWestern } from "./western.js";

describe("computeWestern", () => {
  it("golden: fixed birth returns stable planet signs", () => {
    const r = computeWestern({
      birthDate: "1990-05-15",
      birthTime: "08:30",
      birthLat: 39.9,
      birthLng: 116.4,
    });
    const planets = r.planets as Record<string, { sign: string; degree: number }>;
    assert.ok(planets.Sun);
    assert.ok(planets.Moon);
    assert.equal(planets.Sun.sign, "金牛座");
    assert.equal(planets.Moon.sign, "摩羯座");
    assert.equal(planets.Sun.degree, 21.6);
    const asc = r.ascendant as { sign: string };
    assert.ok(asc.sign);
  });

  it("returns visual chart data with planet list and balances", () => {
    const r = computeWestern({
      birthDate: "1990-05-15",
      birthTime: "08:30",
      birthLat: 39.9,
      birthLng: 116.4,
    });
    const planetList = r.planetList as Array<{ label: string; longitude: number; house: number }>;
    const elementBalance = r.elementBalance as Record<string, number>;
    assert.equal(planetList.length, 10);
    assert.ok(planetList.every((p) => p.longitude >= 0 && p.longitude < 360));
    assert.ok(planetList.every((p) => p.house >= 1 && p.house <= 12));
    assert.equal(Object.values(elementBalance).reduce((sum, count) => sum + count, 0), 10);
  });

  it("requires birth date", () => {
    const r = computeWestern({});
    assert.equal(r.error, "birth_date_required");
  });
});
