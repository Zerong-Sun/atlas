/* Ambient starfield + celebration particles */
window.FQ = window.FQ || {};

(function () {
  const cv = document.getElementById("stars");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let stars = [];
  function resize() {
    cv.width = innerWidth; cv.height = innerHeight;
    const n = Math.min(140, Math.floor(innerWidth * innerHeight / 9000));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: Math.random() * 1.4 + 0.3,
      tw: Math.random() * 6.28,
      sp: 0.008 + Math.random() * 0.02,
      drift: 0.02 + Math.random() * 0.05
    }));
  }
  addEventListener("resize", resize);
  resize();
  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars) {
      s.tw += s.sp;
      s.y -= s.drift;
      if (s.y < -2) s.y = cv.height + 2;
      const a = 0.35 + Math.sin(s.tw) * 0.3;
      ctx.globalAlpha = Math.max(0.08, a);
      ctx.fillStyle = "#e6dcc4";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  })();
})();

(function () {
  const cv = document.getElementById("fx");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  let parts = [];
  function resize() { cv.width = innerWidth; cv.height = innerHeight; }
  addEventListener("resize", resize);
  resize();

  FQ.confetti = function () {
    const colors = ["#e3cfa2", "#7fa3bd", "#b3402e", "#6f9683", "#efe7d5"];
    for (let i = 0; i < 70; i++) {
      parts.push({
        x: cv.width / 2 + (Math.random() - 0.5) * 160,
        y: cv.height * 0.58,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 9 - 3,
        r: 3 + Math.random() * 4,
        c: colors[i % colors.length],
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.3,
        life: 90 + Math.random() * 40
      });
    }
  };
  FQ.sparkleAt = function (x, y, color) {
    for (let i = 0; i < 14; i++) {
      parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 1,
        r: 1.5 + Math.random() * 2.5,
        c: color || "#f0c75e",
        rot: 0, vr: 0,
        life: 34 + Math.random() * 22
      });
    }
  };

  (function tick() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18;
      p.rot += p.vr; p.life--;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    });
    parts = parts.filter(p => p.life > 0 && p.y < cv.height + 40);
    requestAnimationFrame(tick);
  })();
})();
