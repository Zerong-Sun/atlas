import { beforeEach, expect, it, vi } from "vitest";
import { listArchiveEntriesWithReadings, upsertArchiveFromSnapshot, saveArchiveInterpretation, getArchiveEntry } from "./archive";
import type { ReadingReport } from "@atlas/shared-types";
const data = new Map<string, string>();
beforeEach(() => {
  data.clear();
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((k: string) => data.get(k) ?? null),
    setItem: vi.fn((k: string, value: string) => { data.set(k, value); }),
  });
});
const report = (i: number): ReadingReport => ({
  readingId: `r-${i}`, questionId: `q-${i}`, traditions: ["tarot"], sections: [], citations: [],
  consensus: "summary", divergence: "difference", degraded: true, traceId: "test", createdAt: "2026-10-24T10:00:00Z",
});
it("merges 100 reports with a constant number of archive reads", () => {
  const reports = Array.from({ length: 100 }, (_, i) => report(i));
  data.set("atlas:reading_history", JSON.stringify(reports.slice(0, 50)));
  data.set("atlas:archive", "[]");
  const merged = listArchiveEntriesWithReadings(reports);
  expect(merged).toHaveLength(100);
  const calls = vi.mocked(localStorage.getItem).mock.calls;
  expect(calls.filter(([key]) => key === "atlas:archive")).toHaveLength(1);
  expect(calls.filter(([key]) => key === "atlas:reading_history")).toHaveLength(1);
});
it("preserves interpretation when refreshing a snapshot and survives a reload from serialized storage", () => {
  const snapshot = { source: "method" as const, methodId: "tarot", entryId: "draw-test", title: "Test", body: "body", generatedAt: "2026-10-24T10:00:00Z" };
  upsertArchiveFromSnapshot(snapshot);
  saveArchiveInterpretation("draw-test", [{ role: "assistant", content: "saved interpretation" }]);
  upsertArchiveFromSnapshot({ ...snapshot, body: "updated body" });
  const restored = getArchiveEntry("draw-test");
  expect(restored?.body).toBe("updated body");
  expect(restored?.interpretation?.[0].content).toBe("saved interpretation");
});
it("rejects damaged archive entries before a page tries to render them", () => {
  data.set("atlas:archive", '[{"id":"bad","interpretation":{}}]');
  expect(getArchiveEntry("bad")).toBeNull();
});
