/* Juice layer — modern motion wrapped around ancient ritual.
   Ink-swirl background, Balatro-style card tilt, screen shake,
   count-up scoring, floating numbers, and the FQ.art asset-slot
   helper (user artwork in assets/art/, emoji fallback until then). */
window.FQ = window.FQ || {};

/* ---------- art slots ----------
   FQ.art("sym-sun", "☀️")  →  <img assets/art/sym-sun.webp>  or the emoji.
   Missing files are remembered so we never re-request or flicker. */
FQ._artMiss = new Set();
FQ.art = function (name, fallback, cls) {
  if (FQ._artMiss.has(name)) return `<span class="art ${cls || ""}">${fallback}</span>`;
  return `<span class="art ${cls || ""}"><img src="assets/art/${name}.webp" alt=""
    onerror="FQ.artMiss(this,'${name}',this.parentNode)" data-fb="${FQ.esc(fallback)}"></span>`;
};
FQ.artMiss = function (img, name, parent) {
  FQ._artMiss.add(name);
  const fb = img.getAttribute("data-fb") || "✦";
  parent.textContent = fb;
};

/* Emoji → manuscript icon via assets/art/ART_EMOJI_MAP.json (stem without .webp).
   FQ.emo("✨") → art image or the emoji if unmapped / missing file. */
FQ.EMO_MAP = null;
FQ._emoLoading = null;
FQ.loadEmoMap = function () {
  if (FQ.EMO_MAP) return Promise.resolve(FQ.EMO_MAP);
  if (FQ._emoLoading) return FQ._emoLoading;
  FQ._emoLoading = fetch("assets/art/ART_EMOJI_MAP.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((m) => { FQ.EMO_MAP = m || {}; return FQ.EMO_MAP; })
    .catch(() => { FQ.EMO_MAP = {}; return FQ.EMO_MAP; });
  return FQ._emoLoading;
};
FQ.emoStem = function (emoji) {
  const map = FQ.EMO_MAP || {};
  if (map[emoji]) return map[emoji];
  const bare = String(emoji || "").replace(/\uFE0F/g, "").replace(/\u200D/g, "");
  return map[bare] || map[bare + "\uFE0F"] || null;
};
FQ.emo = function (emoji, cls) {
  const stem = FQ.emoStem(emoji);
  if (!stem) return `<span class="art ${cls || ""}">${emoji}</span>`;
  return FQ.art(stem, emoji, cls);
};
/* Replace pictographs inside a plain string with <img> art slots. */
FQ.rich = function (text, cls) {
  if (text == null) return "";
  const s = String(text);
  const re = /(?:[\u{1F300}-\u{1FAFF}]|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2B00-\u2BFF]|[✦✧◆◇✓⛶❖☯])(?:\uFE0F)?/gu;
  return s.replace(re, (m) => FQ.emo(m, cls || "inline"));
};
FQ.hydrateEmo = function (root) {
  (root || document).querySelectorAll("[data-emo]").forEach((el) => {
    const e = el.getAttribute("data-emo");
    if (!e) return;
    el.innerHTML = FQ.emo(e, el.getAttribute("data-emo-class") || "");
  });
};
FQ.loadEmoMap().then(() => FQ.hydrateEmo());

/* ---------- 图标替换 · every emoji becomes painted art ----------
   assets/art/ART_EMOJI_MAP.json maps each emoji the UI uses to a drawn
   icon. A MutationObserver swaps them wherever they appear, so no call
   site has to know; if a plate is missing the img restores the emoji. */
FQ.EMO = null;
FQ.EMO_RE = null;
FQ._emoBusy = false;
/* the map points at six realm plates that were never drawn — send those
   emoji to the nearest medallion that exists, so nothing falls back to raw */
FQ.EMO_ALIAS = {
  "realm-tarot": "ic-trump-01-magician",
  "realm-western": "ic-extra-glowing-star",
  "realm-astrodice": "ic-misc-comet",
  "realm-jiaobei": "ic-ritual-crescent",
  "realm-meihua": "ic-misc-seed",
  "realm-lenormand": "ic-ritual-scroll",
  "item-beads": "ic-ritual-pouch"
};

fetch("assets/art/ART_EMOJI_MAP.json")
  .then(r => r.json())
  .then(map => {
    FQ.EMO = map;
    /* longest first so 变体选择器 sequences win over their bare code points */
    const keys = Object.keys(map).sort((a, b) => b.length - a.length)
      .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    FQ.EMO_RE = new RegExp("(" + keys.join("|") + ")", "g");
    FQ.emojify(document.body);
    FQ.emoWatch();
  })
  .catch(() => {});

const EMO_SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, SVG: 1, TITLE: 1, OPTION: 1 };
FQ.emojify = function (root) {
  if (!FQ.EMO_RE || !root) return;
  FQ._emoBusy = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || n.nodeValue.length > 4000) return NodeFilter.FILTER_REJECT;
        const p = n.parentNode;
        if (!p || EMO_SKIP[p.nodeName] || p.closest("svg")) return NodeFilter.FILTER_REJECT;
        return FQ.EMO_RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const hits = [];
    let node;
    while ((node = walker.nextNode())) hits.push(node);
    hits.forEach(t => {
      const frag = document.createDocumentFragment();
      let last = 0;
      const s = t.nodeValue;
      FQ.EMO_RE.lastIndex = 0;
      let m;
      while ((m = FQ.EMO_RE.exec(s))) {
        if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        const img = document.createElement("img");
        img.className = "emo";
        img.alt = m[1];
        img.dataset.e = m[1];
        const file = FQ.EMO[m[1]];
        img.src = "assets/art/" + (FQ.EMO_ALIAS[file] || file) + ".webp";
        img.onerror = function () { this.replaceWith(document.createTextNode(this.dataset.e)); };
        frag.appendChild(img);
        last = m.index + m[1].length;
      }
      if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  } catch (e) {}
  FQ._emoBusy = false;
};
FQ.emoWatch = function () {
  const obs = new MutationObserver(muts => {
    if (FQ._emoBusy) return;
    const roots = new Set();
    muts.forEach(m => {
      if (m.type === "childList") m.addedNodes.forEach(n => {
        if (n.nodeType === 1) roots.add(n);
        else if (n.nodeType === 3 && n.parentNode) roots.add(n.parentNode);
      });
    });
    if (roots.size) roots.forEach(r => FQ.emojify(r));
  });
  obs.observe(document.body, { childList: true, subtree: true });
};

/* ---------- illuminated card faces ----------
   A manuscript card drawn as SVG: parchment ground, double rules with
   corner fleurons, a rayed medallion for the glyph, a titled banner, and
   a wax pip for power. Zero assets; a user image in the medallion slot
   (assets/art/sym-*.webp) layers on top when present. */
FQ.CIV_INK = { tarot: "#9a6b84", iching: "#55806d", runes: "#7e8b94",
  chr: "#56779b", isl: "#4d8a70", con: "#a8794a", mazu: "#4a8a94", curse: "#5d5468" };

/* Tarot trump → painted symbol art, where the two sets overlap */
FQ.TAROT_ART = { 0: "fool", 8: "strength", 9: "hermit", 10: "wheel", 13: "death",
  16: "tarot-tower", 17: "star", 18: "moon", 19: "sun" };
/* the full painted deck (assets/decks/tarot/) — all twenty-two trumps */
FQ.TAROT_DECK = ["fool", "magician", "high-priestess", "empress", "emperor", "hierophant",
  "lovers", "chariot", "strength", "hermit", "wheel", "justice", "hanged-man", "death",
  "temperance", "devil", "tower", "star", "moon", "sun", "judgement", "world"];
FQ.tarotPlate = id => FQ.TAROT_DECK[id] ? `assets/decks/tarot/tarot-${FQ.TAROT_DECK[id]}-full.webp` : null;
/* hexagram plates 1–30 (assets/decks/iching/) */
FQ.ICHING_DECK = ["the-creative", "the-receptive", "difficulty-at-the-beginning", "youthful-folly",
  "waiting", "conflict", "the-army", "holding-together", "small-taming", "treading", "peace",
  "standstill", "fellowship", "great-possession", "modesty", "enthusiasm", "following",
  "work-on-the-decayed", "approach", "contemplation", "biting-through", "grace", "splitting-apart",
  "return", "innocence", "great-taming", "nourishment", "great-excess", "the-abysmal", "the-clinging"];
FQ.hexPlate = n => FQ.ICHING_DECK[n - 1]
  ? `assets/decks/iching/iching-${String(n).padStart(2, "0")}-${FQ.ICHING_DECK[n - 1]}-full.webp` : null;

/* a painted plate shown as a card, with the engraved face as its backstop */
FQ.plateCard = function (src, o) {
  return `
    <div class="cf-stack has-plate">
      ${FQ.cardFaceSVG({ glyph: o.glyph, civ: o.civ, rev: o.rev, bare: true })}
      <img class="cf-img" src="${src}" alt=""
        onerror="this.parentNode.classList.remove('has-plate');this.remove()">
      <div class="cf-banner">${FQ.esc(o.name || "")}</div>
    </div>`;
};

/* An illuminated card: painted plate when the art exists, engraved SVG when
   it doesn't; the name banner, effect strip and wax pip always sit on top. */
FQ.illumCard = function (o) {
  const art = o.art ? `<img class="cf-img" src="assets/art/sym-${o.art}-full.webp" alt=""
    onerror="this.parentNode.classList.remove('has-art');this.remove()">` : "";
  return `
    <div class="cf-stack ${o.art ? "has-art" : ""}">
      ${FQ.cardFaceSVG({ glyph: o.glyph, civ: o.civ, rev: o.rev, bare: true })}
      ${art}
      ${o.sub ? `<div class="cf-strip">${o.sub}</div>` : ""}
      <div class="cf-banner">${FQ.esc(o.name || "")}</div>
      ${o.power !== undefined ? `<div class="cf-pip">${o.power}</div>` : ""}
    </div>`;
};

FQ.cardFaceSVG = function (o) {
  const ink = FQ.CIV_INK[o.civ] || "#9a6b84";
  const id = "cf" + Math.random().toString(36).slice(2, 8);
  const glyph = o.glyph || "✦";
  const name = FQ.esc(o.name || "");
  const sub = FQ.esc(o.sub || "");
  const fleuron = (x, y, r) => `
    <g transform="translate(${x},${y}) rotate(${r})" fill="none" stroke="url(#g${id})" stroke-width="1.1" opacity=".85">
      <path d="M0,7 C0,3 3,0 7,0"/><path d="M0,11 C0,5 5,0 11,0"/>
      <circle cx="6.5" cy="6.5" r="1.5" fill="url(#g${id})" stroke="none"/>
    </g>`;
  return `
  <svg class="cardface" viewBox="0 0 100 150" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f7efdc"/><stop offset=".5" stop-color="#e3cfa2"/><stop offset="1" stop-color="#bda476"/>
      </linearGradient>
      <linearGradient id="p${id}" x1="0" y1="0" x2=".3" y2="1">
        <stop offset="0" stop-color="${ink}" stop-opacity=".55"/>
        <stop offset="1" stop-color="#17150e" stop-opacity=".95"/>
      </linearGradient>
      <radialGradient id="m${id}" cx=".5" cy=".42" r=".6">
        <stop offset="0" stop-color="${ink}" stop-opacity=".85"/>
        <stop offset="1" stop-color="#12100b" stop-opacity=".9"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="100" height="150" fill="url(#p${id})"/>
    <rect x="3.5" y="3.5" width="93" height="143" rx="4" fill="none" stroke="url(#g${id})" stroke-width="1.4" opacity=".9"/>
    <rect x="6.5" y="6.5" width="87" height="137" rx="3" fill="none" stroke="url(#g${id})" stroke-width=".5" opacity=".55"/>
    ${fleuron(8, 8, 0)}${fleuron(92, 8, 90)}${fleuron(92, 142, 180)}${fleuron(8, 142, 270)}
    <g opacity=".5">${Array.from({ length: 12 }, (_, i) =>
      `<line x1="50" y1="56" x2="${50 + Math.cos(i * 0.5236) * 40}" y2="${56 + Math.sin(i * 0.5236) * 40}"
        stroke="url(#g${id})" stroke-width=".4" opacity=".5"/>`).join("")}</g>
    <circle cx="50" cy="56" r="27" fill="url(#m${id})" stroke="url(#g${id})" stroke-width="1.2"/>
    <circle cx="50" cy="56" r="30.5" fill="none" stroke="url(#g${id})" stroke-width=".4" opacity=".6"/>
    <text x="50" y="56" text-anchor="middle" dominant-baseline="central" font-size="30"
      ${o.rev ? 'transform="rotate(180 50 56)"' : ""}>${glyph}</text>
    <path d="M12,98 H88" stroke="url(#g${id})" stroke-width=".6" opacity=".7"/>
    <path d="M50,94 l4,4 -4,4 -4,-4 Z" fill="url(#g${id})" opacity=".9"/>
    ${o.bare ? "" : `
    <text x="50" y="112" text-anchor="middle" font-size="10" font-family="Songti SC, Georgia, serif"
      fill="url(#g${id})" letter-spacing=".5">${name}</text>
    ${sub ? `<foreignObject x="9" y="117" width="82" height="28">
      <div xmlns="http://www.w3.org/1999/xhtml" class="cf-sub">${sub}</div></foreignObject>` : ""}
    ${o.power !== undefined ? `
      <circle cx="84" cy="134" r="10" fill="#b3402e" stroke="#e3c3ae" stroke-width="1.4"/>
      <text x="84" y="134.5" text-anchor="middle" dominant-baseline="central" font-size="10"
        font-weight="700" fill="#f7efdc">${o.power}</text>` : ""}`}
  </svg>`;
};

/* ---------- ink-swirl background (the Balatro backdrop, in ink) ---------- */
(function () {
  const cv = document.getElementById("swirl");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let t = 0, last = 0;
  const BLOBS = [
    { r: 0.42, o: 0.55, sp: 0.05, hue: "24, 42, 33" },   /* forest ink */
    { r: 0.55, o: 0.85, sp: -0.033, hue: "38, 60, 76" }, /* slate sky */
    { r: 0.36, o: 0.35, sp: 0.075, hue: "70, 60, 46" },  /* warm umber */
    { r: 0.62, o: 1.1, sp: 0.022, hue: "88, 78, 62" }    /* cloud light, faint */
  ];
  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  addEventListener("resize", resize);
  resize();
  (function frame(ts) {
    requestAnimationFrame(frame);
    if (ts - last < 33) return; /* ~30fps is plenty for fog-slow motion */
    last = ts;
    t += 0.0035;
    const w = cv.width, h = cv.height, cx = w / 2, cy = h * 0.42;
    const R = Math.max(w, h);
    ctx.clearRect(0, 0, w, h);
    BLOBS.forEach((b, i) => {
      const a = t * (1 + b.sp * 10) + i * 2.1;
      const x = cx + Math.cos(a) * R * 0.18 * b.o;
      const y = cy + Math.sin(a * 0.8) * R * 0.14 * b.o;
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * b.r);
      g.addColorStop(0, `rgba(${b.hue}, 0.16)`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
  })(0);
})();

/* ---------- pointer tilt: cards follow the hand ---------- */
(function () {
  let cur = null;
  const MAX = 9;
  document.addEventListener("pointermove", e => {
    const card = e.target.closest && e.target.closest(".twcard, .twsym");
    if (cur && cur !== card) { cur.style.setProperty("--rx", "0deg"); cur.style.setProperty("--ry", "0deg"); cur = null; }
    if (!card) return;
    cur = card;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ry", (px * MAX * 2).toFixed(1) + "deg");
    card.style.setProperty("--rx", (-py * MAX * 2).toFixed(1) + "deg");
  }, { passive: true });
  document.addEventListener("pointerdown", () => {}, { passive: true });
})();

/* ---------- screen shake ---------- */
FQ.shake = function (el) {
  el = el || document.getElementById("app");
  if (!el) return;
  el.classList.remove("shaking");
  void el.offsetWidth;
  el.classList.add("shaking");
  setTimeout(() => el.classList.remove("shaking"), 500);
};

/* ---------- count-up number (score ticks like a slot machine) ---------- */
FQ.countUp = function (el, to, ms) {
  if (!el) return;
  const from = parseInt(el.textContent, 10) || 0;
  const steps = Math.max(1, Math.abs(to - from));
  const stepMs = Math.max(30, Math.min(110, (ms || 600) / steps));
  let v = from;
  (function tick() {
    if (!el.isConnected) return;
    v += Math.sign(to - from);
    el.textContent = v;
    el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    if (v !== to) setTimeout(tick, stepMs);
  })();
};

/* ---------- floating score numbers ---------- */
FQ.popNum = function (text, x, y, color) {
  const d = document.createElement("div");
  d.className = "popnum";
  d.textContent = text;
  d.style.left = (x || innerWidth / 2) - 20 + "px";
  d.style.top = (y || innerHeight * 0.4) + "px";
  d.style.color = color || "var(--gold-hi)";
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1150);
};
