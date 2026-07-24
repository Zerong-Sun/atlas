/* 《远行之书》· travel — §六 的四拍：
   择舟车 → 看城市简介 → 确定出发 → 出行动画 → 抵达。
   Nothing is committed until the confirm button; the animation is the only
   thing between paying the fare and arriving. */
window.BOF = window.BOF || {};
BOF.TRAVEL = {};

BOF.TRAVEL.plan = function (routeId, toId) {
  const r = BOF.DB.route(routeId);
  if (!r) return;
  const s = BOF.state;
  const to = toId || BOF.DB.otherEnd(r, s.at);
  if (BOF.DB.otherEnd(r, s.at) !== to) return;   /* not a road from here */
  BOF.TRAVEL.cur = { route: r, to: to, mode: null, step: "mode" };
  BOF.MAP.closeCard();
  BOF.UI.go("travel");
};

/* Which conveyances this road offers, and whether you may take each. */
BOF.TRAVEL.modes = function () {
  const cur = BOF.TRAVEL.cur;
  const s = BOF.state;
  const r = cur.route;
  return (r.modes || []).map(id => {
    const t = BOF.DB.transports[id];
    if (!t) return null;
    const days = Math.max(1, Math.round(r.days * t.dayMul));
    const cost = Math.round(r.cost * (1 + t.cost / 10) + t.cost);
    const risk = Math.max(0, r.risk + t.risk);
    let why = null;
    if (s.coins < cost) {
      why = { zh: "盘缠不足（需 " + cost + "）", en: "Not enough coin (needs " + cost + ")" };
    } else if ((t.needs || []).includes("permit")
               && !s.bag.some(b => b.kind === "item" && b.id === t.permit)) {
      why = { zh: "需" + BOF.FX.itemName(t.permit), en: "Needs the " + BOF.FX.itemName(t.permit) };
    } else if ((t.needs || []).includes("faith")
               && !["islam", "latin", "orthodox"].includes(s.who.faith)) {
      why = { zh: "此队只收同信仰者", en: "This band takes only its own" };
    }
    return { t, days, cost, risk, blocked: !!why, why, cargo: t.cargo, wait: t.wait || 0 };
  }).filter(Boolean);
};

/* Season: a road out of its window is not forbidden, it is punished — that is
   what makes the monsoon a real constraint rather than a wall. */
BOF.TRAVEL.season = function () {
  const cur = BOF.TRAVEL.cur;
  const r = cur.route;
  if (!r.season || !r.season.open) return { ok: true };
  const month = ((Math.floor(BOF.state.days / 30.4) % 12) + 12) % 12 + 1;
  const open = r.season.open.includes(month);
  const bonus = (r.season.bonus || []).includes(month);
  return {
    ok: open, bonus, month,
    note: open
      ? (bonus ? { zh: "正当风信，此时最快。", en: "The wind is exactly right; this is the fast season." }
               : { zh: "在通航期内。", en: "Within the sailing season." })
      : { zh: "过了风信。船家肯走，但要多花一倍时间，风险加倍。",
          en: "Out of season. A master will take you — for twice the days and twice the risk." }
  };
};

BOF.TRAVEL.pickMode = function (modeId) {
  const cur = BOF.TRAVEL.cur;
  if (!cur) return;
  const m = BOF.TRAVEL.modes().find(x => x.t.id === modeId);
  if (!m || m.blocked) { if (m) BOF.UI.toast(BOF.bi(m.why)); return; }
  cur.mode = m;
  cur.step = "brief";     /* → 展示城市简介 */
  BOF.UI.render();
};

BOF.TRAVEL.back = function () {
  const cur = BOF.TRAVEL.cur;
  if (!cur) return BOF.UI.go("city");
  if (cur.step === "brief") { cur.step = "mode"; cur.mode = null; BOF.UI.render(); }
  else BOF.UI.go("city");
};

/* the reckoning shown on the brief, and used on departure */
BOF.TRAVEL.reckon = function () {
  const cur = BOF.TRAVEL.cur;
  const se = BOF.TRAVEL.season();
  let days = cur.mode.days + (cur.mode.wait || 0);
  let risk = cur.mode.risk;
  if (!se.ok) { days = Math.round(days * 2); risk += 2; }
  else if (se.bonus) days = Math.max(1, Math.round(days * 0.85));
  /* road-luck shortens the road a little */
  const luck = (BOF.state.fate.travel - 15) / 100;
  days = Math.max(1, Math.round(days * (1 - luck * 0.5)));
  return { days, risk, cost: cur.mode.cost, season: se };
};

/* ---------- 确定出发 ---------- */
BOF.TRAVEL.depart = function () {
  const cur = BOF.TRAVEL.cur;
  if (!cur || !cur.mode) return;
  const s = BOF.state;
  const R = BOF.TRAVEL.reckon();
  if (s.coins < R.cost) { BOF.UI.toast(BOF.lang() === "zh" ? "盘缠不足" : "Not enough coin"); return; }

  s.coins -= R.cost;
  s.days += R.days;
  BOF.save();

  cur.reckon = R;
  cur.step = "moving";
  BOF.UI.render();
  BOF.TRAVEL.animate();
};

/* ---------- 出行动画 ----------
   The party crawls the road on the map while the days tick over. It is skippable
   — the button is there from the first frame — but it is the only place the
   journey is a duration rather than a number. */
BOF.TRAVEL.animate = function () {
  const cur = BOF.TRAVEL.cur;
  const svg = document.getElementById("tv-svg");
  const marker = document.getElementById("tv-marker");
  const counter = document.getElementById("tv-days");
  if (!cur || !marker) { BOF.TRAVEL.finish(); return; }

  const from = BOF.DB.city(BOF.state.at), to = BOF.DB.city(cur.to);
  const a = BOF.DB.mapCities[from.map], b = BOF.DB.mapCities[to.map];
  const total = cur.reckon.days;
  const dur = Math.min(4200, 900 + total * 26);
  const t0 = performance.now();
  cur.skipped = false;

  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.14;
  const at = t => {
    const u = 1 - t;
    return {
      x: u * u * a.x + 2 * u * t * mx + t * t * b.x,
      y: u * u * a.y + 2 * u * t * my + t * t * b.y
    };
  };

  const step = now => {
    if (!BOF.TRAVEL.cur || BOF.TRAVEL.cur !== cur || cur.skipped) return;
    const k = Math.min(1, (now - t0) / dur);
    const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;   /* easeInOutQuad */
    const p = at(e);
    marker.setAttribute("transform", `translate(${p.x},${p.y})`);
    if (counter) counter.textContent = Math.round(e * total);
    if (k < 1) requestAnimationFrame(step);
    else setTimeout(BOF.TRAVEL.finish, 420);
  };
  requestAnimationFrame(step);
  /* rAF is paused while the tab is in the background, which would strand the
     party mid-voyage. This timer is not throttled the same way, so the journey
     always completes even if nobody is watching it. */
  clearTimeout(cur.guard);
  cur.guard = setTimeout(BOF.TRAVEL.finish, dur + 1200);
};

/* skipping finishes immediately — it must not wait on a frame that may never
   come (see the guard above) */
BOF.TRAVEL.skip = function () {
  const cur = BOF.TRAVEL.cur;
  if (!cur) return;
  cur.skipped = true;
  BOF.TRAVEL.finish();
};

BOF.TRAVEL.finish = function () {
  const cur = BOF.TRAVEL.cur;
  if (!cur || cur.done) return;
  cur.done = true;
  clearTimeout(cur.guard);
  const to = cur.to, R = cur.reckon, mode = cur.mode;

  /* what the road did to you on the way */
  const s = BOF.state;
  const lines = [];
  const bad = Math.random() < Math.min(0.5, R.risk * 0.09);
  if (bad) {
    const kind = ["toll", "spoil", "theft"][Math.floor(Math.random() * 3)];
    if (kind === "toll" && s.coins > 0) {
      const n = Math.max(1, Math.round(R.cost * 0.3));
      s.coins = Math.max(0, s.coins - n);
      lines.push(BOF.lang() === "zh" ? "路上有人收了 " + n + " 的过路钱。" : "Someone took " + n + " in tolls on the way.");
    } else if (kind === "spoil" && s.bag.some(b => b.kind === "goods")) {
      const g = s.bag.find(b => b.kind === "goods");
      g.n -= 1;
      if (g.n <= 0) s.bag.splice(s.bag.indexOf(g), 1);
      const gd = BOF.DB.good(g.id);
      lines.push(BOF.lang() === "zh" ? "一件" + BOF.bi(gd && gd.name) + "在路上坏了。"
                                     : "One lot of " + BOF.bi(gd && gd.name) + " spoiled on the road.");
    } else {
      s.days += 2;
      lines.push(BOF.lang() === "zh" ? "迷了两天路。" : "Two days lost finding the way.");
    }
  } else {
    lines.push(BOF.lang() === "zh" ? "一路无事。" : "Nothing happened on the road.");
  }

  const toCity = BOF.DB.city(to);
  BOF.note(mode.t.art ? "🐪" : "🐪", BOF.lang() === "zh"
    ? BOF.bi(mode.t.name) + "行 " + R.days + " 天，至" + BOF.bi(toCity.name) + "。" + lines[0]
    : R.days + " days by " + BOF.bi(mode.t.name) + " to " + BOF.bi(toCity.name) + ". " + lines[0]);

  BOF.TRAVEL.cur = null;
  BOF.save();
  BOF.EV.arrive(to);
};

/* ---------- screens ---------- */
BOF.TRAVEL.screenHTML = function () {
  const cur = BOF.TRAVEL.cur;
  if (!cur) return "";
  const zh = BOF.lang() === "zh";
  const from = BOF.DB.city(BOF.state.at), to = BOF.DB.city(cur.to);

  if (cur.step === "mode") return BOF.TRAVEL.modeHTML(from, to, zh);
  if (cur.step === "brief") return BOF.TRAVEL.briefHTML(from, to, zh);
  return BOF.TRAVEL.movingHTML(from, to, zh);
};

BOF.TRAVEL.modeHTML = function (from, to, zh) {
  const cur = BOF.TRAVEL.cur;
  const se = BOF.TRAVEL.season();
  const rows = BOF.TRAVEL.modes().map(m => `
    <button class="tv-mode ${m.blocked ? "blocked" : ""}"
            ${m.blocked ? "" : `onclick="BOF.TRAVEL.pickMode('${m.t.id}')"`}>
      <span class="tv-mode-ic">${BOF.ART.img(m.t.art, "tv-mode-art")}</span>
      <span class="tv-mode-txt">
        <b>${BOF.esc(BOF.bi(m.t.name))}</b>
        <span class="dim small">${BOF.esc(BOF.bi(m.t.note))}</span>
        ${m.blocked ? `<span class="tv-why">🔒 ${BOF.esc(BOF.bi(m.why))}</span>` : ""}
      </span>
      <span class="tv-mode-num">
        <span>📅 ${m.days}${m.wait ? " +" + m.wait : ""}</span>
        <span>💰 ${m.cost}</span>
        <span>⚠ ${m.risk}</span>
        <span>📦 ${m.cargo}</span>
      </span>
    </button>`).join("");

  return `
    <div class="tv-screen">
      <button class="back" onclick="BOF.UI.go('city')">${zh ? "← 不走了" : "← Not yet"}</button>
      <div class="tv-head">
        <div class="dim small">${zh ? "择舟车" : "Choose your conveyance"}</div>
        <h2>${BOF.esc(BOF.bi(from.name))} → ${BOF.esc(BOF.bi(to.name))}</h2>
        <div class="tv-season ${se.ok ? (se.bonus ? "good" : "") : "warn"}">
          ${se.ok ? (se.bonus ? "🌬️ " : "⛵ ") : "⚠ "}${BOF.esc(BOF.bi(se.note))}
        </div>
      </div>
      <div class="tv-modes">${rows}</div>
    </div>`;
};

BOF.TRAVEL.briefHTML = function (from, to, zh) {
  const cur = BOF.TRAVEL.cur;
  const R = BOF.TRAVEL.reckon();
  const geo = BOF.DB.mapCities[to.map] || {};
  const visited = BOF.state.visitedCities.includes(to.id);

  return `
    <div class="tv-screen">
      <button class="back" onclick="BOF.TRAVEL.back()">${zh ? "← 改走法" : "← Change conveyance"}</button>
      <div class="tv-brief">
        ${BOF.ART.img(to.art, "tv-brief-art")}
        <div class="tv-brief-medieval">${BOF.esc(geo.medieval || "")}</div>
        <h2>${BOF.esc(BOF.bi(to.name))}</h2>
        <div class="dim small">${BOF.esc(geo.modern || "")} · ${BOF.esc(to.tier)}
          ${visited ? " · " + (zh ? "你到过这里" : "you have been here") : " · " + (zh ? "未曾到过" : "never seen")}</div>
        <p class="tv-brief-text">${BOF.esc(BOF.bi(to.brief))}</p>
        ${cur.route.brief ? `<p class="dim small tv-road-text">${BOF.esc(BOF.bi(cur.route.brief))}</p>` : ""}
        <div class="tv-reckon">
          <div><b>${R.days}</b><span>${zh ? "天" : "days"}</span></div>
          <div><b>${R.cost}</b><span>${zh ? "盘缠" : "fare"}</span></div>
          <div><b>${R.risk}</b><span>${zh ? "风险" : "risk"}</span></div>
          <div><b>${BOF.esc(BOF.bi(cur.mode.t.name))}</b><span>${zh ? "行法" : "by"}</span></div>
        </div>
        ${!R.season.ok ? `<div class="tv-season warn">⚠ ${BOF.esc(BOF.bi(R.season.note))}</div>` : ""}
        <button class="btn block tv-go" onclick="BOF.TRAVEL.depart()">
          ${zh ? "确定出发" : "Set out"} →
        </button>
      </div>
    </div>`;
};

BOF.TRAVEL.movingHTML = function (from, to, zh) {
  const cur = BOF.TRAVEL.cur;
  const wm = BOF.DB.worldmap;
  const a = BOF.DB.mapCities[from.map], b = BOF.DB.mapCities[to.map];
  /* a viewBox framing just this leg, so the crawl is legible */
  const pad = 130;
  const x = Math.min(a.x, b.x) - pad, y = Math.min(a.y, b.y) - pad;
  const w = Math.abs(b.x - a.x) + pad * 2, h = Math.abs(b.y - a.y) + pad * 2;
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.14;

  const land = wm.land.map(d => `<path d="${d}"/>`).join("");
  const rivers = wm.rivers.map(d => `<path d="${d}"/>`).join("");

  return `
    <div class="tv-screen moving">
      <div class="tv-move-head">
        <span class="pill">${BOF.esc(BOF.bi(from.name))} → ${BOF.esc(BOF.bi(to.name))}</span>
        <span class="pill">${BOF.ART.img(cur.mode.t.art, "tv-pill-art")} ${BOF.esc(BOF.bi(cur.mode.t.name))}</span>
        <span class="pill">📅 <b id="tv-days">0</b>/${cur.reckon.days}</span>
      </div>
      <svg id="tv-svg" class="tv-svg" viewBox="${x} ${y} ${w} ${h}"
           preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        ${BOF.MAP.defs(wm.view.w, wm.view.h)}
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wm-vellum)"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wm-sea)"/>
        <g class="wm-land">${land}</g>
        <g class="wm-rivers">${rivers}</g>
        <path class="tv-track" d="M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}"/>
        <g class="wm-city visited" transform="translate(${a.x},${a.y})">
          <path d="${BOF.MAP.CULTURE_MARK[from.culture] || BOF.MAP.CULTURE_MARK.latin}"
                fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3"/>
          <text class="wm-label" y="16">${BOF.esc(BOF.bi(from.name))}</text>
        </g>
        <g class="wm-city known" transform="translate(${b.x},${b.y})">
          <path d="${BOF.MAP.CULTURE_MARK[to.culture] || BOF.MAP.CULTURE_MARK.latin}"
                fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3"/>
          <text class="wm-label" y="16">${BOF.esc(BOF.bi(to.name))}</text>
        </g>
        <g id="tv-marker" class="tv-marker" transform="translate(${a.x},${a.y})">
          <circle r="9" class="tv-marker-halo"/>
          <circle r="4.5" class="tv-marker-dot"/>
        </g>
      </svg>
      <div class="tv-move-foot">
        <div class="tv-road-line">${BOF.esc(BOF.bi(cur.route.brief))}</div>
        <button class="btn ghost sm" onclick="BOF.TRAVEL.skip()">${zh ? "快进" : "Skip"} ⏭</button>
      </div>
    </div>`;
};
