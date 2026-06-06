import { describe, it } from "node:test";
import assert from "node:assert";
import { castIChing } from "./iching.js";

describe("castIChing", () => {
  it("returns primary and changing hexagram", () => {
    const r = castIChing("test-seed");
    const primary = r.primary as { number: number; name: string };
    assert.ok(primary.number >= 1 && primary.number <= 64);
    assert.ok(primary.name);
  });

  it("golden: known seed yields fixed hexagrams", () => {
    const r = castIChing("reading-golden-v1");
    const primary = r.primary as { number: number; name: string };
    const changing = r.changing as { number: number; name: string };
    assert.equal(primary.number, 16);
    assert.equal(primary.name, "豫");
    assert.equal(changing.number, 44);
    assert.equal(changing.name, "姤");
  });
});
