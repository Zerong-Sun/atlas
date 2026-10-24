import { afterEach, beforeEach, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({ canvas: {} as unknown, cleanup: undefined as undefined | (() => void) }));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useRef: () => ({ current: fixture.canvas }),
  useEffect: (effect: () => (() => void)) => { fixture.cleanup = effect(); },
}));
import { CosmicBackdrop } from "../components/CosmicBackdrop";
import { applyMotionPreference } from "./motionPrefs";

let media: EventTarget & { matches: boolean };
let doc: EventTarget & { hidden: boolean; documentElement: { dataset: Record<string, string> } };
let win: EventTarget & { innerWidth: number; innerHeight: number };
let frames: Map<number, FrameRequestCallback>;
let ctx: { clearRect: ReturnType<typeof vi.fn> };
beforeEach(() => {
  frames = new Map(); let next = 0;
  media = Object.assign(new EventTarget(), { matches: false });
  doc = Object.assign(new EventTarget(), { hidden: false, documentElement: { dataset: {} } });
  win = Object.assign(new EventTarget(), {
    innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
    matchMedia: () => media,
    requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++next, callback); return next; },
    cancelAnimationFrame: (id: number) => { frames.delete(id); },
  });
  ctx = { clearRect: vi.fn() };
  Object.assign(ctx, { setTransform: vi.fn(), createRadialGradient: () => ({ addColorStop: vi.fn() }),
    fillRect: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn() });
  fixture.canvas = { getContext: () => ctx, style: {}, dataset: {} };
  vi.stubGlobal("window", win); vi.stubGlobal("document", doc);
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: vi.fn() });
});
afterEach(() => { fixture.cleanup?.(); vi.unstubAllGlobals(); });
it("removes the animation loop when the application disables motion and redraws on resize", () => {
  CosmicBackdrop(); expect(frames.size).toBe(1);
  applyMotionPreference(false); expect(frames.size).toBe(0);
  const draws = ctx.clearRect.mock.calls.length;
  win.dispatchEvent(new Event("resize"));
  expect(ctx.clearRect.mock.calls.length).toBe(draws + 1); expect(frames.size).toBe(0);
  applyMotionPreference(true); expect(frames.size).toBe(1);
});
it("responds to system reduced motion changes and background visibility without duplicate loops", () => {
  CosmicBackdrop();
  doc.hidden = true; doc.dispatchEvent(new Event("visibilitychange")); expect(frames.size).toBe(0);
  doc.hidden = false; doc.dispatchEvent(new Event("visibilitychange")); expect(frames.size).toBe(1);
  media.matches = true; media.dispatchEvent(new Event("change")); expect(frames.size).toBe(0);
  media.matches = false; media.dispatchEvent(new Event("change")); expect(frames.size).toBe(1);
  win.dispatchEvent(new Event("resize")); expect(frames.size).toBe(1);
  fixture.cleanup?.(); expect(frames.size).toBe(0);
  win.dispatchEvent(new Event("resize")); expect(frames.size).toBe(0);
});
