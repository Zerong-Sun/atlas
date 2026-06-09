import { useCallback, useState } from "react";
import { useTimedCallback } from "./useTimedCallback";

export type CardDrawPhase = "idle" | "shuffling" | "drawn" | "revealed";

export function useCardDrawPhase() {
  const [phase, setPhase] = useState<CardDrawPhase>("idle");
  const { schedule, clearTimers } = useTimedCallback();

  const isBusy = phase === "shuffling";

  const runDraw = useCallback(
    (opts: { onShuffleComplete: () => void; shuffleMs?: number; revealMs?: number }) => {
      clearTimers();
      setPhase("shuffling");
      schedule(() => {
        opts.onShuffleComplete();
        setPhase("drawn");
        schedule(() => setPhase("revealed"), opts.revealMs ?? 400);
      }, opts.shuffleMs ?? 800);
    },
    [clearTimers, schedule],
  );

  const resetPhase = useCallback(() => {
    clearTimers();
    setPhase("idle");
  }, [clearTimers]);

  return { phase, isBusy, runDraw, resetPhase };
}
