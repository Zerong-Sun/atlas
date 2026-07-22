import { describe, it } from "node:test";
import assert from "node:assert";
import { computeBazi } from "./bazi.js";
import { interpretBazi } from "./bazi-interpret.js";

describe("computeBazi", () => {
  it("golden: fixed birth returns expected pillars", () => {
    const r = computeBazi({ birthDate: "1990-05-15", birthTime: "08:30" });
    const p = r.pillars as Record<string, string>;
    assert.deepEqual(p, {
      year: "庚午",
      month: "辛巳",
      day: "庚辰",
      hour: "庚辰",
    });
    assert.equal(r.dayMaster, "庚");
    assert.equal(r.zodiac, "马");
  });

  it("requires birth date", () => {
    const r = computeBazi({});
    assert.equal(r.error, "birth_date_required");
  });

  it("returns structured annual fortunes with current year highlighted", () => {
    const r = computeBazi({
      birthDate: "1990-05-15",
      birthTime: "08:30",
      timestamp: "2026-06-05T00:00:00.000Z",
    });
    const years = r.annualFortunes as Array<{ year: number; isCurrent: boolean; pillar: string }>;
    const current = years.find((item) => item.isCurrent);
    assert.equal(current?.year, 2026);
    assert.equal(current?.pillar, "丙午");
  });

  it("includes classics library entries with full text and analysis", () => {
    const r = computeBazi({ birthDate: "1990-05-15", birthTime: "08:30" });
    const classics = r.classics as Array<{ fullText: string; analysis: string }>;
    assert.ok(classics.length > 0);
    assert.ok(classics[0].fullText.length > 0);
    assert.ok(classics[0].analysis.length > 0);
  });

  it("respects gender for major luck direction", () => {
    const male = computeBazi({ birthDate: "1990-05-15", birthTime: "08:30", gender: "male" });
    const female = computeBazi({ birthDate: "1990-05-15", birthTime: "08:30", gender: "female" });
    const maleLuck = male.majorLuck as Array<{ pillar: string }>;
    const femaleLuck = female.majorLuck as Array<{ pillar: string }>;
    assert.notDeepEqual(maleLuck.map((m) => m.pillar), femaleLuck.map((f) => f.pillar));
  });

  it("interpretBazi returns matched rules", () => {
    const chart = computeBazi({ birthDate: "1990-05-15", birthTime: "08:30", gender: "male" });
    const interp = interpretBazi(chart, { selectedYear: 2026 });
    assert.ok(interp.matchedPatterns.length > 0);
    assert.ok(interp.activeDeities.length > 0);
    assert.ok(interp.summary.length > 0);
  });
});
