import { beforeEach, describe, expect, it, vi } from "vitest";
import { arrayOf, isString, readSnapshot, writeSnapshot, getStorageNotice } from "./persistentStore";
import { getInterests, getLocalProfile, getOnboardingDone, getReadingHistory, setLocalProfile } from "./storage";

const data = new Map<string, string>();
let key = "";
const validate = arrayOf(isString);
beforeEach(() => {
  data.clear(); key = `test-${Math.random()}`;
  vi.stubGlobal("localStorage", {
    getItem: vi.fn((k: string) => data.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => { data.set(k, v); }),
  });
});
describe("versioned local snapshots", () => {
  it("loads legacy records and upgrades only on a write", () => {
    data.set(key, '["old"]');
    expect(readSnapshot(key, [], validate)).toEqual(["old"]);
    expect(data.get(key)).toBe('["old"]');
    expect(writeSnapshot(key, ["new"], validate)).toBe(true);
    expect(JSON.parse(data.get(key)!)).toEqual({ version: 1, data: ["new"] });
    expect(data.get(`${key}:backup`)).toBe('["old"]');
  });
  it("recovers a corrupt primary from the last valid backup and does not replace it with corrupt bytes", () => {
    writeSnapshot(key, ["first"], validate);
    writeSnapshot(key, ["second"], validate);
    data.set(key, '{broken');
    expect(readSnapshot(key, [], validate)).toEqual(["first"]);
    writeSnapshot(key, ["third"], validate);
    expect(JSON.parse(data.get(`${key}:backup`)!).data).toEqual(["first"]);
  });
  it.each(['null', '{}', '[null]', '[123]', '{"version":1,"data":{}}'])("rejects malformed shapes: %s", (raw) => {
    data.set(key, raw);
    expect(readSnapshot(key, [], validate)).toEqual([]);
    expect(data.get(key)).toBe(raw);
  });
  it("preserves unknown versions even when older code attempts a write", () => {
    const raw = '{"version":99,"data":["future"]}';
    data.set(key, raw);
    expect(readSnapshot(key, [], validate)).toEqual([]);
    expect(writeSnapshot(key, ["replacement"], validate)).toBe(false);
    expect(data.get(key)).toBe(raw);
  });
  it("retains unsaved values in this session on quota failure without losing the disk copy", () => {
    data.set(key, '["on-disk"]');
    vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error("QuotaExceededError"); });
    expect(writeSnapshot(key, ["unsaved"], validate)).toBe(false);
    expect(readSnapshot(key, [], validate)).toEqual(["unsaved"]);
    expect(data.get(key)).toBe('["on-disk"]');
    expect(getStorageNotice()).toContain("本地保存失败");
  });
  it("survives disabled storage", () => {
    vi.mocked(localStorage.getItem).mockImplementation(() => { throw new Error("SecurityError"); });
    expect(readSnapshot(key, [], validate)).toEqual([]);
    expect(writeSnapshot(key, ["session"], validate)).toBe(false);
    expect(readSnapshot(key, [], validate)).toEqual(["session"]);
  });
  it("protects real readers from valid JSON with wrong types", async () => {
    data.set("atlas:reading_history", "[null]");
    data.set("atlas:interests", "{}");
    data.set("atlas:local_profile", "null");
    data.set("atlas:onboarding_done", "1");
    expect(getReadingHistory()).toEqual([]);
    expect(await getInterests()).toEqual([]);
    expect(await getLocalProfile()).toEqual({});
    expect(await getOnboardingDone()).toBe(true);
  });
  it("merges concurrent profile updates without losing fields", async () => {
    await Promise.all([setLocalProfile({ displayName: "Test" }), setLocalProfile({ birthDate: "2000-01-01" })]);
    expect(await getLocalProfile()).toEqual({ displayName: "Test", birthDate: "2000-01-01" });
  });
});
it("saves the primary even if only backup creation exceeds quota", () => {
  writeSnapshot(key, ["old"], validate);
  vi.mocked(localStorage.setItem).mockImplementation((k, value) => {
    const next = new Map(data); next.set(k, value);
    if ([...next.values()].join("").length > 40) throw new Error("QuotaExceededError");
    data.set(k, value);
  });
  expect(writeSnapshot(key, ["new"], validate)).toBe(true);
  expect(JSON.parse(data.get(key)!).data).toEqual(["new"]);
  expect(getStorageNotice()).toContain("无法更新恢复备份");
});
it("does not rotate the last-good backup when saving identical data", () => {
  writeSnapshot(key, ["old"], validate); writeSnapshot(key, ["new"], validate);
  const backup = data.get(`${key}:backup`);
  writeSnapshot(key, ["new"], validate);
  expect(data.get(`${key}:backup`)).toBe(backup);
});
it("keeps edits to future-version records available during this session", () => {
  const future = '{"version":99,"data":["future"]}'; data.set(key, future);
  writeSnapshot(key, ["session"], validate);
  expect(readSnapshot(key, [], validate)).toEqual(["session"]); expect(data.get(key)).toBe(future);
});
it("clears recovered read warnings without clearing pending write warnings", async () => {
  vi.resetModules(); const store = await import("./persistentStore");
  data.set(key, "bad"); store.readSnapshot(key, [], validate);
  expect(store.getStorageNotice()).toContain("无法读取");
  data.set(key, '["fixed"]'); store.readSnapshot(key, [], validate);
  expect(store.getStorageNotice()).toBe("");
  vi.mocked(localStorage.setItem).mockImplementation(() => { throw new Error("quota"); });
  store.writeSnapshot(key, ["pending"], validate); store.readSnapshot(key, [], validate);
  expect(store.getStorageNotice()).toContain("本地保存失败");
});
it("persists the session copy and clears failure notices when storage becomes writable again", async () => {
  vi.resetModules(); const store = await import("./persistentStore");
  data.set(key, '["disk"]');
  vi.mocked(localStorage.setItem).mockImplementationOnce(() => { throw new Error("quota"); });
  expect(store.writeSnapshot(key, ["pending"], validate)).toBe(false);
  expect(store.readSnapshot(key, [], validate)).toEqual(["pending"]);
  expect(store.writeSnapshot(key, ["pending"], validate)).toBe(true);
  expect(JSON.parse(data.get(key)!).data).toEqual(["pending"]);
  expect(store.getStorageNotice()).toBe("");
});
