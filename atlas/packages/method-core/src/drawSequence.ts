/** Platform-independent ritual sequence. The synchronous lock prevents same-tick re-entry. */
export type DrawStage = "idle" | "shuffling" | "drawing" | "revealed";
export function createDrawSequence(onStage: (stage: DrawStage) => void) {
  let busy = false;
  let generation = 0;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const cancel = () => {
    generation += 1;
    timers.forEach(clearTimeout);
    timers.clear();
    busy = false;
  };
  const reset = () => { cancel(); onStage("idle"); };
  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(() => { timers.delete(id); fn(); }, delay);
    timers.add(id);
  };
  const run = (options: {
    onStarted?: () => void;
    onShuffleComplete: () => void;
    onRevealed?: () => void;
    onError?: (error: unknown) => void;
    shuffleMs?: number;
    revealMs?: number;
    reducedMotion?: boolean;
  }): boolean => {
    if (busy) return false;
    busy = true;
    const current = ++generation;
    const guarded = (fn: () => void) => () => {
      if (current !== generation) return;
      try { fn(); } catch (error) {
        if (current === generation) {
          cancel();
          try { onStage("idle"); } catch { /* Preserve the original callback failure. */ }
        }
        options.onError?.(error);
      }
    };
    const reveal = guarded(() => {
      onStage("revealed");
      if (current !== generation) return;
      options.onRevealed?.();
      if (current === generation) busy = false;
    });
    const draw = guarded(() => {
      options.onShuffleComplete();
      if (current !== generation) return;
      onStage("drawing");
      if (current !== generation) return;
      if (options.reducedMotion) reveal();
      else schedule(reveal, options.revealMs ?? 680);
    });
    guarded(() => {
      options.onStarted?.();
      if (current !== generation) return;
      onStage("shuffling");
      if (current !== generation) return;
      if (options.reducedMotion) draw();
      else schedule(draw, options.shuffleMs ?? 820);
    })();
    return true;
  };
  return { run, reset, cancel, isBusy: () => busy };
}
