/* FateQuest service worker — cache-first for the app shell */
const CACHE = "fatequest-v2";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/style.css", "./assets/icon.svg", "./assets/icon-maskable.svg",
  "./js/i18n.js", "./js/data-tarot.js", "./js/data-hexagrams.js",
  "./js/data-runes.js", "./js/data-misc.js", "./js/engines.js",
  "./js/state.js", "./js/fx.js", "./js/app.js",
  "./js/data-journey.js", "./js/journey.js"
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
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
