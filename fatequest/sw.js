/* FateQuest service worker — v3 PWA shell */
const CACHE = "fatequest-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/style.css", "./assets/icon.svg", "./assets/icon-maskable.svg",
  "./js/i18n.js", "./js/data-tarot.js", "./js/data-hexagrams.js",
  "./js/data-runes.js", "./js/data-lenormand.js", "./js/data-mentors.js",
  "./js/data-scenes.js", "./js/data-misc.js",
  "./js/data-lore.js", "./js/data-marco-lore.js", "./js/data-lore-zh-trunk.js",
  "./js/data-quests-stories.js",
  "./js/engines.js", "./js/state.js",
  "./js/data-loader.js", "./js/effects.js", "./js/chargen.js", "./js/city.js", "./js/travel.js",
  "./js/fx.js", "./js/audio.js", "./js/atmo.js",
  "./js/app.js", "./js/juice.js", "./js/scene.js", "./js/quest.js",
  "./js/map.js", "./js/data-goods.js",
  "./assets/art/ART_EMOJI_MAP.json",
  "./assets/art/GOODS_ART_MAP.json",
  "./assets/data/cities.json", "./assets/data/routes.json", "./assets/data/transports.json",
  "./assets/data/events.json", "./assets/data/goods.json", "./assets/data/divinations.json",
  "./assets/data/retainers.json", "./assets/data/archetypes.json", "./assets/data/endings.json",
  "./assets/data/glossary.json"
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
