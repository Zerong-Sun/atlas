import { beforeEach, expect, it, vi } from "vitest";
import { getLocalProfile, isReadingReport } from "./storage";
import { getArchiveEntry } from "./archive";
const data = new Map<string, string>();
beforeEach(() => {
  data.clear(); vi.stubGlobal("localStorage", { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) });
});
const report = { readingId: "id", createdAt: "2026-10-24", consensus: "", divergence: "", traditions: ["tarot"], citations: [], sections: [] };
it.each([
  { questionFrame: { domains: "bad" } }, { questionTranslations: [null] },
  { structuredFacts: { facts: {} } }, { structuredFacts: [{ tradition: "tarot", computedAt: "now", facts: [] }] },
  { sections: [{ type: "summary", title: "", content: "", metadata: [] }] },
])("rejects malformed nested report structures: %j", (partial) => expect(isReadingReport({ ...report, ...partial })).toBe(false));
it("keeps old reports without optional extended metadata readable", () => expect(isReadingReport(report)).toBe(true));
it.each([{ highlights: [null] }, { sections: [null] }, { relatedTerms: {} }, { diagram: {} }])("rejects malformed archived assistant fields: %j", (partial) => {
  data.set("atlas:archive", JSON.stringify([{ id: "id", source: "method", methodId: "tarot", title: "", body: "", createdAt: "2026-10-24", interpretation: [{ role: "assistant", content: "", ...partial }] }]));
  expect(getArchiveEntry("id")).toBeNull();
});
it("rejects a portrait containing an object where React expects text", async () => {
  data.set("atlas:local_profile", JSON.stringify({ portraitSummary: { traditions: {}, consensus: {} } }));
  expect(await getLocalProfile()).toEqual({});
});
