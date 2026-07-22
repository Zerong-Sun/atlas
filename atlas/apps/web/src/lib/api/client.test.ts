import { describe, expect, it } from "vitest";
import { EDGE_PATHS, useMockApi } from "./client";

describe("useMockApi", () => {
  it("returns true when Supabase env is missing in test", () => {
    expect(useMockApi()).toBe(true);
  });
});

describe("EDGE_PATHS", () => {
  it("keeps persisted reading history on the real list endpoint", () => {
    expect(EDGE_PATHS.listReadings).toBe("list-readings");
  });
});
