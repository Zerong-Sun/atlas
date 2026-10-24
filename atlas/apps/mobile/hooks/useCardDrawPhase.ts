import { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import { createDrawSequence } from "@atlas/method-core/drawSequence";
import { useFocusEffect } from "expo-router";
import { getUiPrefs } from "@/lib/uiPrefs";

export type CardDrawPhase = "idle" | "shuffling" | "drawn" | "revealed";
export function useCardDrawPhase() {
  const [phase, setPhase] = useState<CardDrawPhase>("idle");
  const [reducedMotion, setReducedMotion] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const sequence = useRef<ReturnType<typeof createDrawSequence> | null>(null);
  if (!sequence.current) sequence.current = createDrawSequence((stage) => setPhase(stage === "drawing" ? "drawn" : stage));
  useFocusEffect(useCallback(() => {
    let active = true;
    void getUiPrefs().then((prefs) => { if (active) setMotionEnabled(prefs.mysticMotion); });
    return () => { active = false; if (sequence.current?.isBusy()) sequence.current.reset(); };
  }, []));
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReducedMotion(value);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => { active = false; subscription.remove(); sequence.current?.cancel(); };
  }, []);
  const runDraw = useCallback((opts: { onStarted?: () => void; onShuffleComplete: () => void; shuffleMs?: number; revealMs?: number }) =>
    sequence.current!.run({ ...opts, shuffleMs: opts.shuffleMs ?? 800, revealMs: opts.revealMs ?? 400,
      reducedMotion: reducedMotion || !motionEnabled,
      onError: (error) => console.error("[draw] 抽牌未完成", error),
    }), [reducedMotion, motionEnabled]);
  return { phase, isBusy: phase === "shuffling" || phase === "drawn", runDraw, resetPhase: sequence.current.reset };
}
