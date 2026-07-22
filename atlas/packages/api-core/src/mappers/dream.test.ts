import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregateDreamTrend, mapDreamEntryRow } from "./dream.ts";

test("mapDreamEntryRow maps db row", () => {
  const dto = mapDreamEntryRow({
    id: "abc",
    text: "梦见水",
    symbols: ["水"],
    interpretation: { chinese: "a", jungian: "b", reflection: "c", degraded: false },
    created_at: "2026-06-01T00:00:00Z",
  });
  assert.equal(dto.entryId, "abc");
  assert.equal(dto.chinese, "a");
  assert.equal(dto.reflection, "c");
});

test("aggregateDreamTrend counts symbols", () => {
  const trend = aggregateDreamTrend(
    [
      { symbols: ["水", "门"], createdAt: new Date().toISOString() },
      { symbols: ["水"], emotions: ["焦虑"], createdAt: new Date().toISOString() },
    ],
    7
  );
  assert.ok(trend.topSymbols.find((s) => s.symbol === "水")?.count === 2);
});
