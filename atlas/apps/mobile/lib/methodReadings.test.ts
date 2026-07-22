import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMethodReadingEntryId, hasRichReplay, methodReadingPreview } from "./methodReadings.ts";
import type { MethodReadingRecord } from "./methodReadings.ts";

describe("methodReadings", () => {
  it("builds stable entry id prefix", () => {
    const id = buildMethodReadingEntryId("tarot", 12345);
    assert.equal(id, "tarot-12345");
  });

  it("previews summary then question then title", () => {
    const withSummary: MethodReadingRecord = {
      id: "tarot-1",
      source: "method",
      methodId: "tarot",
      title: "塔罗",
      summary: "整体顺利",
      body: "body",
      createdAt: new Date().toISOString(),
      payload: { methodId: "tarot", question: "事业如何", result: {} },
    };
    assert.equal(methodReadingPreview(withSummary), "整体顺利");

    const withQuestion: MethodReadingRecord = {
      ...withSummary,
      summary: undefined,
    };
    assert.equal(methodReadingPreview(withQuestion), "事业如何");
  });

  it("detects rich replay for card methods", () => {
    assert.equal(
      hasRichReplay({
        id: "tarot-1",
        source: "method",
        methodId: "tarot",
        title: "塔罗",
        body: "body",
        createdAt: new Date().toISOString(),
        payload: { methodId: "tarot", result: {} },
      }),
      true,
    );
    assert.equal(
      hasRichReplay({
        id: "bazi-1",
        source: "method",
        methodId: "bazi",
        title: "八字",
        body: "body",
        createdAt: new Date().toISOString(),
        payload: { methodId: "bazi", result: {} },
      }),
      false,
    );
  });
});
