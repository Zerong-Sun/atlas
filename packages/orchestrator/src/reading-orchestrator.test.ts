import { describe, it } from "node:test";
import assert from "node:assert";
import { ReadingOrchestrator } from "./reading-orchestrator.js";
import { MimoGateway } from "./mimo-gateway.js";

describe("ReadingOrchestrator", () => {
  it("produces 10-section report with degraded mimo", async () => {
    const orch = new ReadingOrchestrator({
      mimo: new MimoGateway({ MIMO_API_KEY: undefined }),
    });
    const report = await orch.generate({
      questionId: "q-1",
      question: {
        text: "今年事业是否适合跳槽？",
        traditions: ["bazi", "tarot", "iching"],
      },
      profile: {
        userId: "u-1",
        birthDate: "1990-05-15",
        birthTime: "08:30",
        disabledTraditions: [],
        onboardingCompleted: true,
      },
    });

    assert.equal(report.sections.length, 10);
    assert.ok(report.consensus);
    assert.ok(report.divergence);
    assert.equal(report.degraded, true);
    assert.equal(report.traditions.length, 3);
  });
});
