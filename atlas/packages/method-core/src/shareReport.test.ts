import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatReportForShare } from "./shareReport.ts";

describe("formatReportForShare", () => {
  it("includes title, body, and footer", () => {
    const text = formatReportForShare({
      source: "method",
      methodId: "lot",
      title: "签诗 · 第1签",
      summary: "平顺",
      body: "签文正文",
    });
    assert.match(text, /签诗 · 第1签/);
    assert.match(text, /签文正文/);
    assert.match(text, /诸象 Atlas/);
  });

  it("appends interpretation turns", () => {
    const text = formatReportForShare(
      {
        source: "method",
        methodId: "iching",
        title: "周易",
        body: "卦辞",
      },
      {
        interpretation: [{ role: "user", content: "什么意思？" }, { role: "assistant", content: "象征变化" }],
      },
    );
    assert.match(text, /AI 解读/);
    assert.match(text, /象征变化/);
  });
});
