/* FateQuest service worker — network-first for the shell (dev-friendly),
   cache fallback for offline play. Art in assets/art/ is cached as it loads. */
const CACHE = "fatequest-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./css/style.css", "./assets/icon.svg", "./assets/icon-maskable.svg",
  /* —— 《远行之书》 book.html: engine, styles and the eight tables —— */
  "./book.html", "./css/bof.css",
  "./js/bof/art.js", "./js/bof/db.js", "./js/bof/save.js", "./js/bof/fx.js",
  "./js/bof/event.js", "./js/bof/roll.js", "./js/bof/worldmap.js",
  "./js/bof/travel.js", "./js/bof/learn.js", "./js/bof/ui.js", "./js/bof/end.js",
  "./assets/data/worldmap.json", "./assets/data/cities.json",
  "./assets/data/routes.json", "./assets/data/transports.json",
  "./assets/data/events-west.json", "./assets/data/events-east.json",
  "./assets/data/divinations.json", "./assets/data/goods.json",
  "./assets/data/archetypes.json", "./assets/data/endings.json",
  "./assets/data/art-aliases.json",
  "./js/i18n.js", "./js/data-tarot.js", "./js/data-hexagrams.js",
  "./js/data-runes.js", "./js/data-lenormand.js", "./js/data-mentors.js",
  "./js/data-scenes.js", "./js/data-misc.js",
  "./js/data-lore.js", "./js/data-marco-lore.js", "./js/data-lore-zh-trunk.js",
  "./js/data-quests-stories.js",
  "./js/engines.js", "./js/state.js", "./js/fx.js", "./js/audio.js", "./js/atmo.js",
  "./js/app.js", "./js/juice.js", "./js/scene.js", "./js/quest.js",
  "./js/data-journey.js", "./js/data-journey-extra.js", "./js/data-secret-paths.js",
  "./js/outcomes/lots-expanded.js", "./js/outcomes/outcome-keys.js",
  "./js/outcomes/marco-chr.js", "./js/outcomes/marco-isl.js",
  "./js/outcomes/marco-con.js", "./js/outcomes/marco-mazu.js",
  "./js/map.js", "./js/journey.js",
  "./js/data-tower.js", "./js/tower.js",
  "./assets/art/ART_EMOJI_MAP.json"
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
      /* offline: serve the cached copy, else fall back to whichever shell the
         request belongs to — book.html and index.html are separate entries */
      caches.match(e.request).then(hit => hit
        || caches.match(e.request.url.includes("book") ? "./book.html" : "./index.html"))
    )
  );
});
