import { describe, it } from "node:test";
import assert from "node:assert";
import { CitationVerifier } from "./citation-verifier.js";
import { DEFAULT_MOCK_CORPUS } from "./hybrid-retrieval.js";

describe("CitationVerifier", () => {
  it("rejects chunk_id not in retrieval whitelist", () => {
    const verifier = new CitationVerifier();
    const allowed = new Set(["chunk-bazi-1"]);
    const result = verifier.verify(
      [
        {
          chunkId: "chunk-forged",
          original: "x",
          translationZh: "y",
          application: "结合您的问题，测试",
          traceId: "t1",
        },
      ],
      allowed,
      DEFAULT_MOCK_CORPUS,
      "t1"
    );
    assert.equal(result.valid.length, 0);
    assert.equal(result.rejected[0]?.reason, "chunk_not_in_retrieval");
  });

  it("accepts valid citation with matching application", () => {
    const verifier = new CitationVerifier();
    const allowed = new Set(["chunk-iching-1"]);
    const record = DEFAULT_MOCK_CORPUS.find((c) => c.chunkId === "chunk-iching-1")!;
    const result = verifier.verify(
      [
        {
          chunkId: "chunk-iching-1",
          original: record.original,
          translationZh: record.translationZh,
          application: `结合您的问题，${record.original}`,
          traceId: "t2",
        },
      ],
      allowed,
      DEFAULT_MOCK_CORPUS,
      "t2"
    );
    assert.equal(result.valid.length, 1);
  });
});
