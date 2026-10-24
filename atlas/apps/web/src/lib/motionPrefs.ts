const KEY = "atlas.motion.v1";
const EVENT = "atlas:motion-change";
export function getMotionEnabled(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function shouldReduceMotion(): boolean {
  return document.documentElement.dataset.atlasMotion === "off"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
export function applyMotionPreference(enabled: boolean): void {
  document.documentElement.dataset.atlasMotion = enabled ? "on" : "off";
  try { localStorage.setItem(KEY, enabled ? "on" : "off"); } catch { /* Session preference still applies. */ }
  window.dispatchEvent(new Event(EVENT));
}
export function subscribeMotionPreference(listener: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY && event.key !== null) return;
    document.documentElement.dataset.atlasMotion = getMotionEnabled() ? "on" : "off";
    listener();
  };
  media.addEventListener("change", listener);
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    media.removeEventListener("change", listener);
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
