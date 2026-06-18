import assert from "node:assert";
import { describe, it } from "node:test";
import { DIVINATION_METHODS } from "./divinationMethods.ts";
import { getMethodCognition } from "./methodCognition.ts";

describe("method cognition", () => {
  it("covers all ready methods", () => {
    const missing = DIVINATION_METHODS
      .filter((method) => method.status === "ready")
      .filter((method) => !getMethodCognition(method.id))
      .map((method) => method.id);

    assert.deepEqual(missing, []);
  });

  it("provides usable comparative fields", () => {
    for (const method of DIVINATION_METHODS.filter((item) => item.status === "ready")) {
      const cognition = getMethodCognition(method.id);
      assert.ok(cognition, method.id);
      assert.ok(cognition.questionGrammar.length > 8, method.id);
      assert.ok(cognition.bestFor.length > 0, method.id);
      assert.ok(cognition.requiredInputs.length > 0, method.id);
      assert.ok(cognition.misuseBoundary.length > 8, method.id);
    }
  });
});
