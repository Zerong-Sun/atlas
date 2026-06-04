import { describe, it } from "node:test";
import assert from "node:assert";
import { computeBazi } from "./bazi.js";

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
});
