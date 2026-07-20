/* Atmosphere layers (GDD §7.1) — fog of war, weather particles, day/night
   tint, typewriter text, and the SVG map camera. All canvas, no assets. */
window.FQ = window.FQ || {};

/* ============ fog of war (map layer L5) ============
   A drifting noise-tile fog covers the chapter map; explored nodes keep a
   soft clearing (0.25), the unknown stays thick (0.85). Newly unlocked
   nodes get a 1.2 s swirl-open reveal. */
FQ.fog = (function () {
  let cv = null, ctx = null, tile = null, raf = null;
  let holes = [];               /* {x,y,r} in map viewBox coords (820×420) */
  let reveal = null;            /* {x,y,t0} animated clearing */
  let t = 0;
  const WIND = [14, -4];        /* px per second of drift */

  function makeTile() {
    tile = document.createElement("canvas");
    tile.width = tile.height = 256;
    const c = tile.getContext("2d");
    /* sparse soft wisps — the veil itself stays a flat dark wash */
    for (let i = 0; i < 46; i++) {
      const x = Math.random() * 256, y = Math.random() * 256, r = 24 + Math.random() * 52;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(224,212,184,0.045)");
      g.addColorStop(1, "rgba(224,212,184,0)");
      c.fillStyle = g;
      [-256, 0, 256].forEach(dx => [-256, 0, 256].forEach(dy => { /* seamless wrap */
        c.save(); c.translate(dx, dy); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.restore();
      }));
    }
  }

  function draw() {
    if (!cv || !cv.isConnected) { stop(); return; }
    const w = cv.width, h = cv.height;
    const sx = w / 820, sy = h / 420;
    ctx.clearRect(0, 0, w, h);
    /* base veil: unsurveyed country, washed over in old sepia ink —
       thick enough to hide, thin enough that the vellum still glows */
    ctx.globalAlpha = 0.66;
    ctx.fillStyle = "#241c10";
    ctx.fillRect(0, 0, w, h);
    /* two drifting wisp layers give the veil its slow breath */
    if (!tile) makeTile();
    const off1 = (t * WIND[0]) % 256, off1y = (t * WIND[1]) % 256;
    const off2 = (t * WIND[0] * 0.55) % 256;
    ctx.globalAlpha = 0.9;
    for (let x = -256; x < w + 256; x += 256)
      for (let y = -256; y < h + 256; y += 256) {
        ctx.drawImage(tile, x + off1, y + off1y);
        ctx.drawImage(tile, x - off2, y + off1y * 0.6);
      }
    /* punch explored clearings */
    ctx.globalCompositeOperation = "destination-out";
    holes.forEach(hl => {
      const r = hl.r * sx;
      const g = ctx.createRadialGradient(hl.x * sx, hl.y * sy, 0, hl.x * sx, hl.y * sy, r);
      g.addColorStop(0, "rgba(0,0,0,0.97)");   /* surveyed ground reads clean */
      g.addColorStop(0.62, "rgba(0,0,0,0.8)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(hl.x * sx, hl.y * sy, r, 0, 7); ctx.fill();
    });
    /* swirl reveal */
    if (reveal) {
      const k = Math.min(1, (performance.now() - reveal.t0) / 1200);
      const r = 110 * FQ.ease(k) * sx;
      ctx.save();
      ctx.translate(reveal.x * sx, reveal.y * sy);
      ctx.rotate(k * 3.6);
      for (let i = 0; i < 5; i++) { /* rotating petals opening */
        ctx.rotate(1.256);
        const g = ctx.createRadialGradient(r * 0.25, 0, 0, r * 0.25, 0, r);
        g.addColorStop(0, `rgba(0,0,0,${0.85 * k})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(r * 0.25, 0, r, 0, 7); ctx.fill();
      }
      ctx.restore();
      if (k >= 1) { holes.push({ x: reveal.x, y: reveal.y, r: 92 }); reveal = null; }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    t += 1 / 60;
    raf = requestAnimationFrame(draw);
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; cv = null; }

  return {
    attach(canvas, holeList) {
      stop();
      cv = canvas; ctx = cv.getContext("2d");
      holes = holeList.slice();
      let tries = 0;
      const size = () => {
        if (!cv || !cv.isConnected) return;
        const svg = cv.parentElement.querySelector("svg");
        const box = (svg || cv.parentElement).getBoundingClientRect();
        if (box.width < 4 && tries++ < 60) { raf = requestAnimationFrame(size); return; }
        /* match the SVG's rendered letterbox exactly, whatever the layout */
        const k = Math.min(box.width / 820, box.height / 420) || box.width / 820;
        cv.width = Math.max(4, Math.round(820 * k));
        cv.height = Math.max(4, Math.round(420 * k));
        cv.style.width = cv.width + "px";
        cv.style.height = cv.height + "px";
        raf = requestAnimationFrame(draw);
      };
      size();
    },
    reveal(x, y) { reveal = { x, y, t0: performance.now() }; },
    detach: stop
  };
})();

/* ============ weather particles (map layer L6) ============ */
FQ.weatherFX = (function () {
  let cv, ctx, parts = [], type = null, raf = null, flash = 0;
  function ensure() {
    cv = document.getElementById("weather");
    if (!cv) return false;
    ctx = ctx || cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    return true;
  }
  addEventListener("resize", () => { if (cv && type) { cv.width = innerWidth; cv.height = innerHeight; } });

  const SPAWN = {
    rain:  () => ({ x: Math.random() * innerWidth, y: -12, vx: -1.2, vy: 10 + Math.random() * 5, l: 12, c: "rgba(157,180,232,.4)" }),
    storm: () => ({ x: Math.random() * (innerWidth + 200), y: -12, vx: -4.5, vy: 15 + Math.random() * 6, l: 16, c: "rgba(157,180,232,.5)" }),
    snow:  () => ({ x: Math.random() * innerWidth, y: -8, vx: 0, vy: 0.9 + Math.random() * 0.8, r: 1.4 + Math.random() * 1.8, ph: Math.random() * 6.28, c: "rgba(238,240,250,.7)" }),
    sand:  () => ({ x: -10, y: Math.random() * innerHeight, vx: 5 + Math.random() * 4, vy: (Math.random() - 0.5) * 1.2, r: 0.8 + Math.random() * 1.4, c: "rgba(217,160,91,.35)" }),
    wind:  () => ({ x: -30, y: Math.random() * innerHeight, vx: 7 + Math.random() * 4, vy: 0, l: 26, horiz: true, c: "rgba(255,255,255,.12)" }),
    night: () => ({ x: Math.random() * innerWidth, y: innerHeight * (0.3 + Math.random() * 0.7), vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.4, r: 1.3, glow: true, ph: Math.random() * 6.28, c: "rgba(240,214,120,.8)" })
  };
  const RATE = { rain: 3, storm: 5, snow: 1.4, sand: 2.4, wind: 0.25, night: 0.08 };
  const CAP  = { rain: 130, storm: 200, snow: 90, sand: 110, wind: 14, night: 14 };

  function frame() {
    if (!type) { ctx && ctx.clearRect(0, 0, cv.width, cv.height); raf = null; return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    const mk = SPAWN[type];
    if (mk) for (let i = 0; i < RATE[type]; i++) if (parts.length < CAP[type] && Math.random() < (RATE[type] % 1 || 1)) parts.push(mk());
    if (type === "storm" && Math.random() < 0.004) { flash = 1; FQ.AU && FQ.AU.play("thunder"); }
    if (flash > 0) { ctx.fillStyle = `rgba(220,228,255,${flash * 0.14})`; ctx.fillRect(0, 0, cv.width, cv.height); flash -= 0.08; }
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.ph !== undefined) { p.ph += 0.03; p.x += Math.sin(p.ph) * 0.6; }
      if (p.l) { /* streak */
        ctx.strokeStyle = p.c; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.horiz ? p.l : p.vx * 1.6), p.y - (p.horiz ? 0 : p.l));
        ctx.stroke();
      } else {
        ctx.fillStyle = p.c;
        if (p.glow) { ctx.shadowColor = "#f0d678"; ctx.shadowBlur = 8; }
        ctx.globalAlpha = p.ph !== undefined ? 0.4 + Math.sin(p.ph * 2) * 0.35 : 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
    });
    parts = parts.filter(p => p.x > -60 && p.x < cv.width + 60 && p.y > -40 && p.y < cv.height + 40);
    raf = requestAnimationFrame(frame);
  }
  return {
    set(newType) {
      if (!ensure()) return;
      if (newType === type) return;
      type = newType || null;
      parts = [];
      if (type && !raf) raf = requestAnimationFrame(frame);
    }
  };
})();

/* ============ day/night tint (§7.1 昼夜色调) ============ */
FQ.PHASES = ["dawn", "noon", "dusk", "night"];
FQ.setPhase = function (i) {
  const name = typeof i === "number" ? FQ.PHASES[((i % 4) + 4) % 4] : i;
  document.body.dataset.phase = name || "";
  if (name === "night") FQ.weatherFX && FQ.weatherFX.set(FQ._wx === null || FQ._wx === undefined ? "night" : FQ._wx);
};
FQ.clearPhase = function () { document.body.dataset.phase = ""; };

/* ============ typewriter (§7.4) ============ */
FQ.typeInto = function (el, text, cps) {
  return new Promise(resolve => {
    let i = 0, done = false;
    const finish = () => { if (done) return; done = true; el.textContent = text; el.classList.remove("typing"); resolve(); };
    el.classList.add("typing");
    el.addEventListener("click", finish, { once: true });
    (function step() {
      if (done) return;
      if (!el.isConnected) return finish();
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) finish();
      else setTimeout(step, 1000 / (cps || 30));
    })();
  });
};

/* ============ SVG map camera (§7.1 镜头语言) ============
   Timer-driven (not rAF) so a backgrounded tab still completes its
   tweens — the march must arrive even if nobody is watching. */
FQ.cam = (function () {
  let timer = null;
  function boxOf(svg) { return svg.getAttribute("viewBox").split(/\s+/).map(Number); }
  function clampBox(b) {
    const w = Math.min(820, b[2]), h = Math.min(420, b[3]);
    return [Math.max(0, Math.min(820 - w, b[0])), Math.max(0, Math.min(420 - h, b[1])), w, h];
  }
  return {
    stop() { if (timer) clearTimeout(timer); timer = null; },
    /* tween the viewBox to `to` = [x,y,w,h] */
    to(svg, to, ms) {
      return new Promise(resolve => {
        this.stop();
        const from = boxOf(svg), t0 = performance.now();
        to = clampBox(to);
        const tick = () => {
          if (!svg.isConnected) return resolve();
          const k = Math.min(1, (performance.now() - t0) / ms), e = FQ.ease(k);
          const b = from.map((v, i) => v + (to[i] - v) * e);
          svg.setAttribute("viewBox", b.join(" "));
          if (k < 1) timer = setTimeout(tick, 16); else { timer = null; resolve(); }
        };
        tick();
      });
    },
    /* keep a point centered at given zoom width (no tween — call per frame) */
    follow(svg, cx, cy, w) {
      const h = w * 420 / 820;
      svg.setAttribute("viewBox", clampBox([cx - w / 2, cy - h / 2, w, h]).join(" "));
    },
    reset(svg, ms) { return this.to(svg, [0, 0, 820, 420], ms || 900); }
  };
})();
