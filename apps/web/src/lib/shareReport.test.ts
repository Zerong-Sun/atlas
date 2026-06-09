import { describe, expect, it } from "vitest";
import { formatReportForShare } from "./shareReport";

describe("formatReportForShare", () => {
  it("includes title, summary, body, and footer", () => {
    const text = formatReportForShare({
      source: "method",
      methodId: "tarot",
      title: "塔罗牌阵",
      summary: "趋势向好",
      body: "问题：事业\n牌阵：三牌",
    });
    expect(text).toContain("塔罗牌阵");
    expect(text).toContain("趋势向好");
    expect(text).toContain("问题：事业");
    expect(text).toContain("诸象 Atlas");
  });

  it("includes AI interpretation and page url when provided", () => {
    const text = formatReportForShare(
      {
        source: "method",
        methodId: "iching",
        title: "周易卦象",
        body: "本卦：乾",
      },
      {
        pageUrl: "https://example.com/archive/abc",
        interpretation: [
          { role: "user", content: "请解析" },
          {
            role: "assistant",
            content: "",
            sections: [{ title: "总览", content: "阳气上升" }],
          },
        ],
      },
    );
    expect(text).toContain("AI 解读");
    expect(text).toContain("问：请解析");
    expect(text).toContain("【总览】");
    expect(text).toContain("https://example.com/archive/abc");
  });
});
