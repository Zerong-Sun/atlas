import { beforeEach, expect, it, vi } from "vitest";
let osc: { disconnect: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; onended?: () => void };
let gain: { disconnect: ReturnType<typeof vi.fn> };
beforeEach(() => {
  vi.resetModules();
  osc = { disconnect: vi.fn(), stop: vi.fn() };
  gain = { disconnect: vi.fn() };
  Object.assign(osc, { frequency: { value: 0 }, connect: vi.fn(), start: vi.fn() });
  Object.assign(gain, { connect: vi.fn(), gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } });
  vi.stubGlobal("localStorage", { getItem: () => { throw Error("SecurityError"); }, setItem: () => { throw Error("SecurityError"); } });
  vi.stubGlobal("document", { hidden: false });
  vi.stubGlobal("window", { AudioContext: class {
    state = "running"; currentTime = 0; destination = {};
    createOscillator() { return osc; } createGain() { return gain; }
  } });
});
it("cleans up ended sound nodes even when storage is unavailable", async () => {
  const sound = await import("./methodSounds");
  sound.unlockAudio(); sound.playMethodSound("tarot", "complete");
  expect(osc.stop).toHaveBeenCalled(); osc.onended?.();
  expect(osc.disconnect).toHaveBeenCalledOnce(); expect(gain.disconnect).toHaveBeenCalledOnce();
});
it("muting stops current sounds and background actions do not play sounds", async () => {
  const sound = await import("./methodSounds");
  sound.unlockAudio(); sound.playMethodSound("tarot", "action");
  osc.stop.mockClear(); sound.setRitualSoundsEnabled(false); expect(osc.stop).toHaveBeenCalledOnce();
  osc.stop.mockClear(); sound.playMethodSound("tarot", "complete"); expect(osc.stop).not.toHaveBeenCalled();
  sound.setRitualSoundsEnabled(true); vi.stubGlobal("document", { hidden: true });
  sound.playMethodSound("tarot", "complete"); expect(osc.stop).not.toHaveBeenCalled();
});
