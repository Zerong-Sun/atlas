/* FateQuest 2.0 service worker — network-first for the shell (dev-friendly),
   cache fallback for offline play. Art in assets/art/ is cached as it loads. */
const CACHE = "fatequest2-v1";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/style.css", "./assets/icon.svg", "./assets/icon-maskable.svg",
  "./js/i18n.js", "./js/data-tarot.js", "./js/data-hexagrams.js",
  "./js/data-runes.js", "./js/data-misc.js", "./js/engines.js",
  "./js/state.js", "./js/fx.js", "./js/audio.js", "./js/atmo.js",
  "./js/app.js", "./js/juice.js",
  "./js/data-journey.js", "./js/journey.js",
  "./js/data-tower.js", "./js/tower.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  /* network-first keeps updates flowing; the cache answers when offline */
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(hit => hit || caches.match("./index.html"))
    )
  );
});
