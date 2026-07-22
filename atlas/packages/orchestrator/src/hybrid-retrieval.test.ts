import { describe, it } from "node:test";
import assert from "node:assert";
import { HybridRetrieval } from "./hybrid-retrieval.js";

describe("HybridRetrieval", () => {
  it("returns chunks for matching traditions", () => {
    const r = new HybridRetrieval();
    const result = r.retrieve({
      question: "日主 月令",
      traditions: ["bazi", "iching"],
      topK: 4,
    });
    assert.ok(result.chunks.length > 0);
    assert.ok(result.chunks.every((c) => ["bazi", "iching"].includes(c.tradition as string)));
  });
});
