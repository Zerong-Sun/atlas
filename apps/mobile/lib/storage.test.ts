import assert from "node:assert/strict";
import test from "node:test";

/** Mirrors appendReadingHistory slice/dedupe rules from storage.ts */
function appendHistory<T extends { readingId: string }>(prev: T[], report: T, cap = 100): T[] {
  return [report, ...prev.filter((r) => r.readingId !== report.readingId)].slice(0, cap);
}

test("reading history append dedupes by readingId and caps at 100", () => {
  let history: Array<{ readingId: string }> = [];
  for (let i = 0; i < 102; i += 1) {
    history = appendHistory(history, { readingId: `r-${i}` });
  }
  assert.equal(history.length, 100);
  assert.equal(history[0]?.readingId, "r-101");
  assert.ok(!history.some((r) => r.readingId === "r-0"));
});

test("reading history append replaces existing id in place", () => {
  const first = appendHistory([], { readingId: "a" });
  const second = appendHistory(first, { readingId: "b" });
  const replaced = appendHistory(second, { readingId: "a" });
  assert.deepEqual(
    replaced.map((r) => r.readingId),
    ["a", "b"],
  );
});
