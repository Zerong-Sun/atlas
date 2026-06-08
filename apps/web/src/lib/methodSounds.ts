const STORAGE_KEY = "atlas-ritual-sounds";
const UNLOCK_KEY = "atlas-audio-unlocked";

let audioCtx: AudioContext | null = null;

export function isRitualSoundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== "off";
}

export function setRitualSoundsEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  sessionStorage.setItem(UNLOCK_KEY, "1");
}

function isUnlocked(): boolean {
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

type SoundKind = "enter" | "action" | "complete";

const BASE_FREQ: Record<SoundKind, number> = {
  enter: 220,
  action: 330,
  complete: 440,
};

/** Short synthesized ritual tone — no external audio files required. */
export function playMethodSound(methodId: string, kind: SoundKind): void {
  if (!isRitualSoundsEnabled() || !isUnlocked()) return;

  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  const hash = methodId.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0);
  const detune = (hash % 120) - 60;
  const base = BASE_FREQ[kind];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind === "complete" ? "sine" : "triangle";
  osc.frequency.value = base + detune;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "action" ? 0.12 : 0.35));
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}
