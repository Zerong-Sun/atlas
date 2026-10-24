const STORAGE_KEY = "atlas-ritual-sounds";
let audioCtx: AudioContext | null = null;
let unlocked = false;
let enabledInSession: boolean | undefined;
const active = new Set<OscillatorNode>();

export function isRitualSoundsEnabled(): boolean {
  if (enabledInSession !== undefined) return enabledInSession;
  try { return localStorage.getItem(STORAGE_KEY) !== "off"; } catch { return true; }
}
export function setRitualSoundsEnabled(enabled: boolean): void {
  enabledInSession = enabled;
  try { localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off"); } catch { /* Session setting still works. */ }
  if (!enabled) active.forEach((osc) => { try { osc.stop(); } catch { /* Already stopped. */ } });
}
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    return audioCtx;
  } catch { return null; }
}
export function unlockAudio(): void {
  if (!isRitualSoundsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  unlocked = true;
  if (ctx.state === "suspended") void ctx.resume().catch(() => { unlocked = false; });
}
type SoundKind = "enter" | "action" | "complete";
const BASE_FREQ: Record<SoundKind, number> = { enter: 220, action: 330, complete: 440 };

/** Optional feedback must never block the user's reading. */
export function playMethodSound(methodId: string, kind: SoundKind): void {
  if (!isRitualSoundsEnabled() || !unlocked || document.hidden) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== "running" || active.size >= 4) return;
  let osc: OscillatorNode | undefined;
  let gain: GainNode | undefined;
  try {
    const hash = methodId.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = kind === "complete" ? "sine" : "triangle";
    osc.frequency.value = BASE_FREQ[kind] + (hash % 120) - 60;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "action" ? 0.12 : 0.35));
    osc.connect(gain);
    gain.connect(ctx.destination);
    active.add(osc);
    const source = osc;
    const envelope = gain;
    osc.onended = () => { source.disconnect(); envelope.disconnect(); active.delete(source); };
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    if (osc) { try { osc.stop(); } catch { /* Not started. */ } osc.disconnect(); active.delete(osc); }
    gain?.disconnect();
  }
}
