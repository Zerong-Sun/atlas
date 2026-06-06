import { describe, it } from "node:test";
import assert from "node:assert";
import { computeQimen } from "./qimen.js";

describe("computeQimen", () => {
  it("returns structured chart for fixed timestamp", () => {
    const r = computeQimen({ timestamp: "2024-01-15T10:00:00.000Z", juMethod: "chaibu" });
    assert.equal(r.juMethod, "chaibu");
    assert.ok(["阳遁", "阴遁"].includes(r.dun));
    assert.ok(r.ju >= 1 && r.ju <= 9);
    assert.equal(r.palaces.length, 9);
    assert.ok(r.zhiFu.length > 0);
    assert.ok(r.zhiShi.length > 0);
    assert.ok(r.zhiFuPalace.length > 0);
    assert.ok(r.kongWang.length === 2);
  });

  it("chaibu and zhirun can differ on boundary terms", () => {
    const chaibu = computeQimen({ timestamp: "2024-06-21T08:00:00.000Z", juMethod: "chaibu" });
    const zhirun = computeQimen({ timestamp: "2024-06-21T08:00:00.000Z", juMethod: "zhirun" });
    assert.equal(chaibu.juMethod, "chaibu");
    assert.equal(zhirun.juMethod, "zhirun");
    assert.ok(typeof chaibu.ju === "number" && typeof zhirun.ju === "number");
  });

  it("detects structural flags on palaces", () => {
    const r = computeQimen({ timestamp: "2024-03-10T14:30:00.000Z" });
    assert.ok(Array.isArray(r.ruMu));
    assert.ok(Array.isArray(r.menPo));
    assert.ok(Array.isArray(r.jiXing));
    const flagged = r.palaces.some((p) => p.kongWang !== undefined);
    assert.ok(flagged);
  });
});
