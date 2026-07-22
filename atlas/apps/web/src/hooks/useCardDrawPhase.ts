import { useCallback, useEffect, useRef, useState } from "react";
import type { DrawPhase } from "@/components/charts/CardDrawTable";

export const CARD_DRAW_TIMING = {
  shuffleMs: 820,
  revealMs: 680,
} as const;

type RunDrawOptions = {
  onShuffleComplete: () => void;
  onRevealed?: () => void;
};

export function useCardDrawPhase() {
  const [phase, setPhase] = useState<DrawPhase>("idle");
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isBusy = phase === "shuffling" || phase === "drawing";

  const resetPhase = useCallback(() => {
    clearTimers();
    setPhase("idle");
  }, [clearTimers]);

  const runDraw = useCallback(
    ({ onShuffleComplete, onRevealed }: RunDrawOptions) => {
      if (isBusy) return false;
      clearTimers();
      setPhase("shuffling");

      timersRef.current.push(
        window.setTimeout(() => {
          onShuffleComplete();
          setPhase("drawing");
          timersRef.current.push(
            window.setTimeout(() => {
              setPhase("revealed");
              onRevealed?.();
            }, CARD_DRAW_TIMING.revealMs),
          );
        }, CARD_DRAW_TIMING.shuffleMs),
      );
      return true;
    },
    [clearTimers, isBusy],
  );

  return { phase, setPhase, isBusy, runDraw, resetPhase, clearTimers };
}
