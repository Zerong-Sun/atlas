/* 《远行之书》· worldmap — the map you can actually click.
   Real geometry from assets/data/worldmap.json (built by
   scripts/build_worldmap.py out of fatequest-worldmap + Natural Earth), drawn
   as SVG in the mappa-mundi palette. Cities are <g> elements with hit areas:
   a known city opens its detail card, an unknown one is not drawn at all.
   Everything unknown lies under ink-wash, and the wash retreats as you learn. */
window.BOF = window.BOF || {};
BOF.MAP = {};

BOF.MAP.view = { zoom: 1, x: 0, y: 0 };
BOF.MAP.sel = null;

/* ---------- defs ---------- */
BOF.MAP.defs = function (w, h) {
  return `<defs>
    <linearGradient id="wm-vellum" x1="0" y1="0" x2=".7" y2="1">
      <stop offset="0" stop-color="#e9dbb8"/>
      <stop offset=".45" stop-color="#dfcea4"/>
      <stop offset="1" stop-color="#cbb586"/>
    </linearGradient>
    <radialGradient id="wm-stain" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#a98d55" stop-opacity=".2"/>
      <stop offset="1" stop-color="#a98d55" stop-opacity="0"/>
    </radialGradient>
    <pattern id="wm-sea" width="14" height="10" patternUnits="userSpaceOnUse">
      <path d="M0,8 q3.5,-6 7,0 q3.5,6 7,0" fill="none" stroke="#3f5f6b" stroke-width=".7" opacity=".38"/>
      <path d="M-7,3 q3.5,-6 7,0 q3.5,6 7,0" fill="none" stroke="#3f5f6b" stroke-width=".55" opacity=".22"/>
    </pattern>
    <filter id="wm-ink" x="-6%" y="-6%" width="112%" height="112%">
      <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale=".9" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="wm-lift" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="1" dy="1.6" stdDeviation=".9" flood-color="#4a3a1c" flood-opacity=".42"/>
    </filter>
    <!-- unknown ground lies under this; holes are punched where you have been -->
    <mask id="wm-fog">
      <rect x="0" y="0" width="${w}" height="${h}" fill="#fff"/>
      <g id="wm-fog-holes"></g>
    </mask>
  </defs>`;
};

/* ---------- city marks, one silhouette per culture ---------- */
BOF.MAP.CULTURE_MARK = {
  latin: "M-7,4 h14 v-7 l-7,-5 l-7,5 Z M-1,4 v-4 h2 v4",
  islamic: "M-7,4 h14 v-6 a7,7 0 0 0 -14,0 Z M0,-9 v3",
  east_asia: "M-8,4 h16 l-2,-4 h-12 Z M-9,0 q9,-5 18,0 Z",
  steppe: "M-7,4 h14 l-7,-10 Z",
  indian_ocean: "M-7,4 h14 v-5 h-14 Z M0,-1 v-7 M-4,-8 h8"
};

BOF.MAP.cityMark = function (c, state) {
  const known = state.known, visited = state.visited, here = state.here;
  const path = BOF.MAP.CULTURE_MARK[c.culture] || BOF.MAP.CULTURE_MARK.latin;
  const big = c.tier === "metropolis";
  const sc = big ? 1.25 : c.tier === "town" ? 0.85 : 1;
  const cls = "wm-city" + (here ? " here" : visited ? " visited" : known ? " known" : "");
  const label = BOF.bi(c.name);
  return `
    <g class="${cls}" transform="translate(${c._x},${c._y})"
       tabindex="0" role="button"
       aria-label="${BOF.esc(label)}"
       data-city="${c.id}">
      <circle class="wm-hit" r="16" fill="transparent"/>
      <ellipse cy="5" rx="${8 * sc}" ry="2.4" fill="#4a3a1c" opacity=".22"/>
      <g transform="scale(${sc})" filter="url(#wm-lift)">
        <path d="${path}" fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3"
              stroke-linejoin="round"/>
      </g>
      ${here ? `<circle class="wm-here" r="${13 * sc}"/>` : ""}
      ${visited && !here ? `<path class="wm-tick" d="M-3,7 l2.4,2.4 l5,-5.6"/>` : ""}
      <text class="wm-label" y="${16 * sc}">${BOF.esc(label)}</text>
    </g>`;
};

/* ---------- the whole map ---------- */
BOF.MAP.render = function () {
  const wm = BOF.DB.worldmap;
  const s = BOF.state;
  const W = wm.view.w, H = wm.view.h;

  /* only cities the traveler has heard of appear at all */
  const cities = s.knownCities.map(id => {
    const c = BOF.DB.city(id);
    if (!c) return null;
    const geo = BOF.DB.mapCities[c.map];
    if (!geo) return null;
    return Object.assign({}, c, { _x: geo.x, _y: geo.y });
  }).filter(Boolean);

  const marks = cities.map(c => BOF.MAP.cityMark(c, {
    known: true,
    visited: s.visitedCities.includes(c.id),
    here: s.at === c.id
  })).join("");

  /* known roads, drawn as the great-circle-ish arcs a chart would show */
  const roads = s.knownRoutes.map(rid => {
    const r = BOF.DB.route(rid);
    if (!r) return "";
    const a = cities.find(c => c.id === r.from), b = cities.find(c => c.id === r.to);
    if (!a || !b) return "";
    const mx = (a._x + b._x) / 2, my = (a._y + b._y) / 2 - Math.abs(b._x - a._x) * 0.14;
    const walked = s.visitedCities.includes(r.from) && s.visitedCities.includes(r.to);
    return `<path class="wm-road ${r.kind} ${walked ? "walked" : ""}"
      d="M${a._x},${a._y} Q${mx},${my} ${b._x},${b._y}"
      data-route="${r.id}"/>`;
  }).join("");

  /* the ink-wash over unmapped ground: holes where you have stood */
  const holes = s.visitedCities.map(id => {
    const c = BOF.DB.city(id);
    const geo = c && BOF.DB.mapCities[c.map];
    if (!geo) return "";
    return `<circle cx="${geo.x}" cy="${geo.y}" r="118" fill="#000"/>`;
  }).join("") + s.knownRoutes.map(rid => {
    const r = BOF.DB.route(rid);
    const a = r && BOF.DB.city(r.from), b = r && BOF.DB.city(r.to);
    const ga = a && BOF.DB.mapCities[a.map], gb = b && BOF.DB.mapCities[b.map];
    if (!ga || !gb) return "";
    let out = "";
    for (let t = 0.15; t < 1; t += 0.12) {
      out += `<circle cx="${ga.x + (gb.x - ga.x) * t}" cy="${ga.y + (gb.y - ga.y) * t}" r="64" fill="#000"/>`;
    }
    return out;
  }).join("");

  const land = wm.land.map(d => `<path d="${d}"/>`).join("");
  const lakes = wm.lakes.map(d => `<path d="${d}"/>`).join("");
  const rivers = wm.rivers.map(d => `<path d="${d}"/>`).join("");
  const ranges = wm.ranges.map(r => `<path d="${r.d}"/>`).join("");

  /* sea and region labels, in the medieval names the gazetteer carries */
  const seaLabels = wm.seas.map(x =>
    `<text class="wm-sea-label" x="${x.x}" y="${x.y}">${BOF.esc(x.name)}</text>`).join("");
  const regionLabels = wm.regions.filter(x => x.kind !== "part").map(x =>
    `<text class="wm-region-label" x="${x.x}" y="${x.y}">${BOF.esc(x.name)}</text>`).join("");

  return `
  <div class="wm-wrap" id="wm-wrap">
    <svg id="wm-svg" class="wm-svg" viewBox="0 0 ${W} ${H}"
         preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      ${BOF.MAP.defs(W, H)}
      <rect width="${W}" height="${H}" fill="url(#wm-vellum)"/>
      <rect width="${W}" height="${H}" fill="url(#wm-sea)"/>
      <g opacity=".85">
        <ellipse cx="${W * .2}" cy="${H * .25}" rx="${W * .15}" ry="${H * .2}" fill="url(#wm-stain)"/>
        <ellipse cx="${W * .75}" cy="${H * .7}" rx="${W * .18}" ry="${H * .22}" fill="url(#wm-stain)"/>
      </g>
      <g class="wm-land" filter="url(#wm-ink)">${land}</g>
      <g class="wm-lakes">${lakes}</g>
      <g class="wm-rivers">${rivers}</g>
      <g class="wm-ranges">${ranges}</g>
      <g class="wm-sea-labels">${seaLabels}</g>
      <g class="wm-region-labels">${regionLabels}</g>
      <g class="wm-roads">${roads}</g>
      <g class="wm-cities">${marks}</g>
      <g class="wm-veil" mask="url(#wm-fog)">
        <rect width="${W}" height="${H}" fill="#8a6234" opacity=".5"/>
      </g>
    </svg>
    <div class="wm-tools">
      <button class="wm-btn" onclick="BOF.MAP.zoomBy(1.35)" aria-label="zoom in">＋</button>
      <button class="wm-btn" onclick="BOF.MAP.zoomBy(1/1.35)" aria-label="zoom out">−</button>
      <button class="wm-btn" onclick="BOF.MAP.center()" aria-label="centre on me">◎</button>
    </div>
    <div id="wm-card" class="wm-card" hidden></div>
  </div>`;
};

/* the veil holes have to go in after render, because they live inside a mask */
BOF.MAP.attach = function () {
  const svg = document.getElementById("wm-svg");
  if (!svg) return;
  const s = BOF.state;
  const holes = svg.querySelector("#wm-fog-holes");
  if (holes) {
    let out = "";
    s.visitedCities.forEach(id => {
      const c = BOF.DB.city(id), geo = c && BOF.DB.mapCities[c.map];
      if (geo) out += `<circle cx="${geo.x}" cy="${geo.y}" r="120" fill="#000"/>`;
    });
    s.knownRoutes.forEach(rid => {
      const r = BOF.DB.route(rid);
      const a = r && BOF.DB.city(r.from), b = r && BOF.DB.city(r.to);
      const ga = a && BOF.DB.mapCities[a.map], gb = b && BOF.DB.mapCities[b.map];
      if (!ga || !gb) return;
      for (let t = 0.1; t <= 0.95; t += 0.1) {
        out += `<circle cx="${ga.x + (gb.x - ga.x) * t}" cy="${ga.y + (gb.y - ga.y) * t}" r="70" fill="#000"/>`;
      }
    });
    holes.innerHTML = out;
  }

  /* one delegated handler for click and keyboard — the whole map is operable
     without a mouse */
  svg.addEventListener("click", ev => {
    const g = ev.target.closest("[data-city]");
    if (g) BOF.MAP.openCity(g.dataset.city);
  });
  svg.addEventListener("keydown", ev => {
    if (ev.key !== "Enter" && ev.key !== " ") return;
    const g = ev.target.closest("[data-city]");
    if (g) { ev.preventDefault(); BOF.MAP.openCity(g.dataset.city); }
  });

  BOF.MAP.center();
};

/* ---------- the detail card ---------- */
BOF.MAP.openCity = function (cityId) {
  const s = BOF.state;
  const c = BOF.DB.city(cityId);
  if (!c) return;
  const box = document.getElementById("wm-card");
  if (!box) return;
  BOF.MAP.sel = cityId;

  const visited = s.visitedCities.includes(cityId);
  const here = s.at === cityId;
  const geo = BOF.DB.mapCities[c.map] || {};

  /* the roads you know that touch this city */
  const roads = BOF.DB.routesAt(cityId).filter(r => s.knownRoutes.includes(r.id));
  const fromHere = roads.filter(r => r.from === s.at || r.to === s.at);

  const roadRows = roads.length ? roads.map(r => {
    const other = BOF.DB.city(BOF.DB.otherEnd(r, cityId));
    const modes = (r.modes || []).map(m => {
      const t = BOF.DB.transports[m];
      return t ? BOF.bi(t.name) : m;
    }).join(" · ");
    return `<div class="wm-road-row">
      <b>${BOF.esc(BOF.bi(other && other.name))}</b>
      <span class="dim">${r.days}${BOF.lang() === "zh" ? "天" : "d"} · ${BOF.lang() === "zh" ? "险" : "risk"} ${r.risk}</span>
      <span class="wm-modes">${BOF.esc(modes)}</span>
    </div>`;
  }).join("") : `<p class="dim small">${BOF.lang() === "zh"
      ? "你知道这座城，但不知道通往它的路。找人问。"
      : "You know of this city. You do not know the road to it. Ask someone."}</p>`;

  const go = fromHere.length && !here
    ? fromHere.map(r => `<button class="btn block" onclick="BOF.TRAVEL.plan('${r.id}','${cityId}')">
        ${BOF.lang() === "zh" ? "启程前往" : "Set out for"} ${BOF.esc(BOF.bi(c.name))} →
      </button>`).join("")
    : here
      ? `<button class="btn block" onclick="BOF.UI.go('city')">${BOF.lang() === "zh" ? "你就在此处 · 进城" : "You are here · enter"}</button>`
      : "";

  box.hidden = false;
  box.innerHTML = `
    <button class="wm-card-x" onclick="BOF.MAP.closeCard()" aria-label="close">×</button>
    <div class="wm-card-head">
      <div class="wm-card-medieval">${BOF.esc(geo.medieval || "")}</div>
      <h3>${BOF.esc(BOF.bi(c.name))}</h3>
      <div class="dim small">${BOF.esc(geo.modern || "")} · ${BOF.esc(c.tier)}
        ${visited ? " · " + (BOF.lang() === "zh" ? "到过" : "visited") : ""}</div>
    </div>
    ${BOF.ART.img(c.art, "wm-card-art")}
    <p class="wm-card-brief">${BOF.esc(BOF.bi(c.brief))}</p>
    ${geo.note ? `<p class="dim small wm-card-note">${BOF.esc(geo.note)}</p>` : ""}
    <div class="wm-card-sec">
      <div class="wm-card-h">${BOF.lang() === "zh" ? "已知路线" : "Roads you know"}</div>
      ${roadRows}
    </div>
    ${go}`;
};

BOF.MAP.closeCard = function () {
  const box = document.getElementById("wm-card");
  if (box) { box.hidden = true; box.innerHTML = ""; }
  BOF.MAP.sel = null;
};

/* ---------- pan & zoom ---------- */
BOF.MAP.apply = function () {
  const svg = document.getElementById("wm-svg");
  if (!svg) return;
  const wm = BOF.DB.worldmap;
  const v = BOF.MAP.view;
  const w = wm.view.w / v.zoom, h = wm.view.h / v.zoom;
  const x = Math.max(0, Math.min(wm.view.w - w, v.x - w / 2));
  const y = Math.max(0, Math.min(wm.view.h - h, v.y - h / 2));
  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
};

BOF.MAP.zoomBy = function (k) {
  const v = BOF.MAP.view;
  v.zoom = Math.max(1, Math.min(6, v.zoom * k));
  BOF.MAP.apply();
};

BOF.MAP.center = function (cityId) {
  const s = BOF.state;
  const c = BOF.DB.city(cityId || s.at);
  const geo = c && BOF.DB.mapCities[c.map];
  const wm = BOF.DB.worldmap;
  const v = BOF.MAP.view;
  if (geo) { v.x = geo.x; v.y = geo.y; }
  else { v.x = wm.view.w / 2; v.y = wm.view.h / 2; }
  if (v.zoom < 2.2) v.zoom = 2.2;
  BOF.MAP.apply();
};
