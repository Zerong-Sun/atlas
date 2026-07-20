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
