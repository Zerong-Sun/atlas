import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createDrawSequence } from "@atlas/method-core/drawSequence";
import { createRequestGate } from "./requestGate";
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
it("rejects rapid duplicate draws through shuffle and reveal, then allows a new draw", () => {
  const phases: string[] = [];
  const sequence = createDrawSequence((p) => phases.push(p));
  const draw = vi.fn();
  expect(sequence.run({ onShuffleComplete: draw })).toBe(true);
  expect(sequence.run({ onShuffleComplete: draw })).toBe(false);
  vi.advanceTimersByTime(820);
  expect(draw).toHaveBeenCalledTimes(1);
  expect(sequence.run({ onShuffleComplete: draw })).toBe(false);
  vi.advanceTimersByTime(680);
  expect(phases).toEqual(["shuffling", "drawing", "revealed"]);
  expect(sequence.isBusy()).toBe(false);
  expect(vi.getTimerCount()).toBe(0);
});
it("cancel/reset prevents callbacks from a previous sequence", () => {
  const phase = vi.fn(); const draw = vi.fn();
  const sequence = createDrawSequence(phase);
  sequence.run({ onShuffleComplete: draw }); sequence.reset(); vi.runAllTimers();
  expect(draw).not.toHaveBeenCalled(); expect(phase).toHaveBeenLastCalledWith("idle");
  sequence.run({ onShuffleComplete: draw }); sequence.cancel(); vi.runAllTimers();
  expect(draw).not.toHaveBeenCalled();
});
it("reduced motion returns a result without timers, and errors release the lock", () => {
  const sequence = createDrawSequence(vi.fn()); const draw = vi.fn(); const onError = vi.fn();
  sequence.run({ onShuffleComplete: draw, reducedMotion: true });
  expect(draw).toHaveBeenCalledTimes(1); expect(vi.getTimerCount()).toBe(0);
  sequence.run({ onShuffleComplete: () => { throw new Error("failed"); }, onError, reducedMotion: true });
  expect(sequence.isBusy()).toBe(false); expect(onError).toHaveBeenCalledTimes(1);
});
it("a reset inside the draw callback cannot schedule a stale reveal", () => {
  const phase = vi.fn(); const sequence = createDrawSequence(phase);
  sequence.run({ onShuffleComplete: () => sequence.reset() }); vi.runAllTimers();
  expect(phase).toHaveBeenLastCalledWith("idle"); expect(vi.getTimerCount()).toBe(0);
});
it("isolates responses after navigation and does not unlock a newer request", () => {
  const gate = createRequestGate(); const old = gate.begin()!;
  expect(gate.begin()).toBeNull(); gate.reset(); const current = gate.begin()!;
  expect(gate.isCurrent(old)).toBe(false); gate.finish(old); expect(gate.begin()).toBeNull();
  expect(gate.isCurrent(current)).toBe(true); gate.finish(current); expect(gate.begin()).not.toBeNull();
});
it.each(["shuffling", "drawing", "revealed"])("cancellation during %s notification cannot run another callback", (stage) => {
  const draw = vi.fn(); const revealed = vi.fn();
  const sequence = createDrawSequence((p) => { if (p === stage) sequence.cancel(); });
  sequence.run({ onShuffleComplete: draw, onRevealed: revealed }); vi.runAllTimers();
  expect(draw).toHaveBeenCalledTimes(stage === "shuffling" ? 0 : 1);
  expect(revealed).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0); expect(sequence.isBusy()).toBe(false);
});
it("contains a failing stage notification and releases the synchronous lock", () => {
  const onError = vi.fn(); const sequence = createDrawSequence(() => { throw new Error("stage"); });
  expect(() => sequence.run({ onShuffleComplete: vi.fn(), onError })).not.toThrow();
  expect(onError).toHaveBeenCalledTimes(1); expect(sequence.isBusy()).toBe(false); expect(vi.getTimerCount()).toBe(0);
});
it("does not run start side effects for a rejected duplicate", () => {
  const sequence = createDrawSequence(vi.fn()); const start = vi.fn();
  sequence.run({ onStarted: start, onShuffleComplete: vi.fn() });
  sequence.run({ onStarted: start, onShuffleComplete: vi.fn() });
  expect(start).toHaveBeenCalledTimes(1); sequence.cancel();
});
