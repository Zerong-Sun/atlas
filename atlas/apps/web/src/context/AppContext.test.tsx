// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "./AppContext";
import { PortraitPage } from "@/pages/onboarding/PortraitPage";
import { MOCK_PROFILE } from "@/lib/mock/data";
import { getLocalProfile, setLocalProfile } from "@/lib/storage";
import { fetchProfile, updateProfile, fetchPortraitSummary } from "@/lib/api/profile";
vi.mock("@/lib/supabase", () => ({ isSupabaseConfigured: true, ensureAuthSession: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/api/profile", () => ({ fetchProfile: vi.fn(), updateProfile: vi.fn(), fetchPortraitSummary: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
let state: ReturnType<typeof useApp>;
let root: Root;
let host: HTMLDivElement;
function Probe() { state = useApp(); return <span>{state.profile?.displayName}</span>; }
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: unknown) => void; const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; }); return { promise, resolve, reject }; }
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear(); vi.clearAllMocks();
  vi.mocked(fetchProfile).mockImplementation(() => new Promise(() => {}));
  vi.mocked(updateProfile).mockImplementation(() => new Promise(() => {}));
  window.scrollTo = vi.fn();
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
async function mount(children = <Probe />) {
  await act(async () => root.render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><AppProvider>{children}</AppProvider></MemoryRouter>));
}
it("makes local startup, saving and onboarding usable while cloud requests never resolve", async () => {
  await setLocalProfile({ displayName: "本机用户" });
  await mount();
  expect(state.ready).toBe(true); expect(state.profile?.displayName).toBe("本机用户");
  await act(async () => { await state.saveProfile({ displayName: "新名字" }); await state.completeOnboarding(); });
  expect(state.onboardingDone).toBe(true); expect(state.profile?.displayName).toBe("新名字");
  expect(await getLocalProfile()).toMatchObject({ displayName: "新名字", onboardingCompleted: true });
});
it("merges the latest local edits after a delayed cloud refresh", async () => {
  const remote = deferred<typeof MOCK_PROFILE>(); vi.mocked(fetchProfile).mockReturnValue(remote.promise);
  await mount();
  await act(async () => { await state.saveProfile({ displayName: "等待期间的编辑", interests: [] }); });
  await act(async () => remote.resolve({ ...MOCK_PROFILE, displayName: "旧云端名字", interests: ["tarot"] }));
  expect(state.profile?.displayName).toBe("等待期间的编辑"); expect(state.profile?.interests).toEqual([]);
});
it("ignores an older refresh finishing after a newer one", async () => {
  const first = deferred<typeof MOCK_PROFILE>(); const second = deferred<typeof MOCK_PROFILE>();
  vi.mocked(fetchProfile).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  await mount();
  let refreshing!: Promise<void>;
  await act(async () => { refreshing = state.refreshProfile(); });
  await act(async () => { second.resolve({ ...MOCK_PROFILE, displayName: "新请求" }); await refreshing; });
  await act(async () => first.resolve({ ...MOCK_PROFILE, displayName: "旧请求" }));
  expect(state.profile?.displayName).toBe("新请求");
});
it("orders background writes and reports failures without undoing local work", async () => {
  const first = deferred<typeof MOCK_PROFILE>(); vi.mocked(updateProfile).mockReturnValueOnce(first.promise).mockResolvedValueOnce(MOCK_PROFILE);
  await mount();
  await act(async () => { await state.saveProfile({ displayName: "一" }); await state.saveProfile({ displayName: "二" }); });
  expect(updateProfile).toHaveBeenCalledTimes(1);
  await act(async () => first.reject(new Error("offline")));
  expect(updateProfile).toHaveBeenCalledTimes(2); expect(state.profile?.displayName).toBe("二");
  expect(host.textContent).not.toContain("暂未同步");
  vi.mocked(updateProfile).mockRejectedValueOnce(new Error("offline"));
  await act(async () => state.saveProfile({ displayName: "三" }));
  expect(host.textContent).toContain("暂未同步"); expect(await getLocalProfile()).toMatchObject({ displayName: "三" });
});
it("generates and saves the portrait once without a profile-update feedback loop", async () => {
  await setLocalProfile({ birthDate: "1990-01-01" });
  const portrait = { traditions: { bazi: "画像内容" }, consensus: "共同主题内容" };
  vi.mocked(fetchPortraitSummary).mockResolvedValue(portrait);
  // Render after local readiness, as the actual onboarding outlet does.
  function ReadyPortrait() { const app = useApp(); return app.ready ? <PortraitPage /> : null; }
  await mount(<><Probe /><ReadyPortrait /></>);
  expect(fetchPortraitSummary).toHaveBeenCalledTimes(1);
  expect(host.textContent).toContain("画像内容");
  expect(await getLocalProfile()).toMatchObject({ portraitSummary: portrait });
  await act(async () => state.saveProfile({ displayName: "无关编辑" }));
  expect(fetchPortraitSummary).toHaveBeenCalledTimes(1);
});
it("retries unsynced fields together with the next save instead of falsely acknowledging a partial sync", async () => {
  vi.mocked(updateProfile).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(MOCK_PROFILE);
  await mount();
  await act(async () => state.saveProfile({ birthPlace: "本地未同步字段" }));
  await act(async () => state.saveProfile({ displayName: "恢复网络后的编辑" }));
  expect(updateProfile).toHaveBeenLastCalledWith({ birthPlace: "本地未同步字段", displayName: "恢复网络后的编辑" }, true);
  expect(host.textContent).not.toContain("暂未同步");
});
