import { useCallback, useEffect, useRef, useState } from "react";
import { createDrawSequence, type DrawStage } from "@atlas/method-core/drawSequence";
import { shouldReduceMotion } from "@/lib/motionPrefs";

export const CARD_DRAW_TIMING = { shuffleMs: 820, revealMs: 680 } as const;
type RunDrawOptions = { onStarted?: () => void; onShuffleComplete: () => void; onRevealed?: () => void };

export function useCardDrawPhase() {
  const [phase, setPhase] = useState<DrawStage>("idle");
  const sequence = useRef<ReturnType<typeof createDrawSequence>>();
  if (!sequence.current) sequence.current = createDrawSequence(setPhase);
  useEffect(() => () => sequence.current?.cancel(), []);
  const runDraw = useCallback((options: RunDrawOptions) => sequence.current!.run({
    ...options, ...CARD_DRAW_TIMING, reducedMotion: shouldReduceMotion(),
    onError: (error) => console.error("[draw] 抽牌未完成", error),
  }), []);
  return { phase, isBusy: phase === "shuffling" || phase === "drawing", runDraw,
    resetPhase: sequence.current.reset, clearTimers: sequence.current.cancel };
}
