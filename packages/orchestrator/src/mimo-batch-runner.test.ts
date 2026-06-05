import { describe, it } from "node:test";
import assert from "node:assert";
import { MimoBatchRunner } from "./mimo-batch-runner.js";
import { MimoGateway, type MimoCompletionOptions } from "./mimo-gateway.js";

class FakeMimo extends MimoGateway {
  async complete(options: MimoCompletionOptions) {
    const prompt = options.messages.at(-1)?.content ?? "";
    return {
      content: `done:${prompt}`,
      degraded: false,
      tokenCost: 10,
    };
  }
}

describe("MimoBatchRunner", () => {
  it("runs tasks and preserves result order", async () => {
    const runner = new MimoBatchRunner(new FakeMimo({ MIMO_API_KEY: "test" }));
    const results = await runner.run(
      [
        { id: "a", prompt: "alpha" },
        { id: "b", prompt: "beta" },
        { id: "c", prompt: "gamma" },
      ],
      { concurrency: 2 }
    );

    assert.deepEqual(results.map((item) => item.id), ["a", "b", "c"]);
    assert.deepEqual(results.map((item) => item.content), ["done:alpha", "done:beta", "done:gamma"]);
    assert.equal(results.every((item) => item.degraded === false), true);
  });
});
