import { describe, expect, it } from "vitest";
import { buildMethodSeed } from "./methodSeed";

describe("buildMethodSeed", () => {
  it("is stable for the same inputs", () => {
    expect(buildMethodSeed("meihua", ["number", "test", 3, 7])).toBe(
      buildMethodSeed("meihua", ["number", "test", 3, 7]),
    );
  });

  it("differs when inputs change", () => {
    expect(buildMethodSeed("oracle", ["q", "trust", "single", 0])).not.toBe(
      buildMethodSeed("oracle", ["q", "trust", "single", 1]),
    );
  });
});
