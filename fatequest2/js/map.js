/* 世界舆图 · The Mappa Mundi renderer (GDD §7.1 revised)
   Drawn the way a 13th-century cartographer would: parchment ground,
   mountains in profile rather than plan, walled-town vignettes whose
   architecture changes with the civilization, seas in scale-and-wave,
   portolan rhumb lines from a compass rose, wind heads at the border,
   and the beasts that travelers swore were out there.
   Everything is procedural SVG; painted plates layer on when supplied
   (see assets/art/ART_TODO_MAP.md). */
window.FQ = window.FQ || {};
FQ.MAP = {};

/* ---------- defs: parchment, cultural ornament, relief, patterns ---------- */
FQ.MAP.defs = function () {
  return `
  <defs>
    <!-- parchment ground -->
    <linearGradient id="mp-vellum" x1="0" y1="0" x2=".7" y2="1">
      <stop offset="0"   stop-color="#e9dbb8"/>
      <stop offset=".45" stop-color="#dfceA4" style="stop-color:#dfcea4"/>
      <stop offset="1"   stop-color="#cbb586"/>
    </linearGradient>
    <radialGradient id="mp-stain" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#a98d55" stop-opacity=".22"/>
      <stop offset="1" stop-color="#a98d55" stop-opacity="0"/>
    </radialGradient>
    <!-- sea: medieval scale-and-wave -->
    <pattern id="mp-sea" width="14" height="10" patternUnits="userSpaceOnUse">
      <path d="M0,8 q3.5,-6 7,0 q3.5,6 7,0" fill="none" stroke="#3f5f6b" stroke-width=".7" opacity=".5"/>
      <path d="M-7,3 q3.5,-6 7,0 q3.5,6 7,0" fill="none" stroke="#3f5f6b" stroke-width=".55" opacity=".32"/>
    </pattern>
    <!-- 基督之境: quatrefoil lattice (gothic tracery) -->
    <pattern id="mp-orn-chr" width="26" height="26" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#3c5a7a" stroke-width=".7" opacity=".38">
        <circle cx="13" cy="13" r="4.6"/>
        <path d="M13,4 a4.6,4.6 0 0 1 0,9.2 a4.6,4.6 0 0 1 0,-9.2 M4,13 a4.6,4.6 0 0 1 9.2,0 a4.6,4.6 0 0 1 -9.2,0"/>
        <path d="M0,0 L26,26 M26,0 L0,26" stroke-width=".3" opacity=".5"/>
      </g>
    </pattern>
    <!-- 新月之境: girih eight-point star tessellation -->
    <pattern id="mp-orn-isl" width="24" height="24" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#3f7a5f" stroke-width=".7" opacity=".42">
        <path d="M12,2 L15,9 L22,12 L15,15 L12,22 L9,15 L2,12 L9,9 Z"/>
        <path d="M12,5.5 L14,10 L18.5,12 L14,14 L12,18.5 L10,14 L5.5,12 L10,10 Z" stroke-width=".45"/>
        <path d="M0,0 L4,4 M24,0 L20,4 M0,24 L4,20 M24,24 L20,20" stroke-width=".4"/>
      </g>
    </pattern>
    <!-- 儒道之境: 祥云 cloud scroll + 回纹 meander -->
    <pattern id="mp-orn-con" width="30" height="22" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#8a6234" stroke-width=".75" opacity=".4">
        <path d="M3,14 q0,-5 5,-5 q1.5,-4 6,-3 q4,-2 6,2 q5,0 5,5"/>
        <path d="M8,14 a2.6,2.6 0 1 1 5.2,0 M16,14 a2.2,2.2 0 1 1 4.4,0" stroke-width=".5"/>
        <path d="M0,20 h4 v-3 h3 v3 h4" stroke-width=".45" opacity=".7"/>
      </g>
    </pattern>
    <!-- 妈祖之海: fish-scale (鱼鳞纹) -->
    <pattern id="mp-orn-mazu" width="16" height="9" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#2f6f78" stroke-width=".7" opacity=".42">
        <path d="M0,9 a8,8 0 0 1 16,0"/>
        <path d="M-8,4.5 a8,8 0 0 1 16,0 M8,4.5 a8,8 0 0 1 16,0" opacity=".6"/>
      </g>
    </pattern>
    <!-- ink hatching for terrain shadow -->
    <pattern id="mp-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="#5a4423" stroke-width=".6" opacity=".55"/>
    </pattern>
    <!-- 3D relief: terrain lifts off the vellum -->
    <filter id="mp-relief" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="1.4" dy="2.2" stdDeviation="1.1" flood-color="#4a3a1c" flood-opacity=".45"/>
    </filter>
    <filter id="mp-emboss" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b"/>
      <feSpecularLighting in="b" surfaceScale="2.5" specularConstant=".7" specularExponent="16"
        lighting-color="#fff8e2" result="sp"><feDistantLight azimuth="315" elevation="52"/></feSpecularLighting>
      <feComposite in="sp" in2="SourceAlpha" operator="in" result="spc"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="spc"/></feMerge>
    </filter>
    <filter id="mp-inkbleed" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- city vignette symbols, one architecture per civilization -->
    <symbol id="mp-town-chr" viewBox="0 0 40 34">
      <g fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3" stroke-linejoin="round">
        <rect x="6" y="16" width="28" height="16"/>
        <path d="M6,16 h28 M8,16 v-3 h3 v3 M15,16 v-3 h3 v3 M22,16 v-3 h3 v3 M29,16 v-3 h3 v3"/>
        <path d="M17,32 v-8 a3,3 0 0 1 6,0 v8 Z" fill="#4a3a1c" opacity=".55"/>
        <path d="M28,16 v-9 h6 v9 Z"/><path d="M31,7 l0,-6 l3,3 Z" fill="#8a6234"/>
      </g>
    </symbol>
    <symbol id="mp-town-isl" viewBox="0 0 40 34">
      <g fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3" stroke-linejoin="round">
        <rect x="4" y="18" width="32" height="14"/>
        <path d="M12,18 a8,8 0 0 1 16,0 Z"/>
        <path d="M20,10 v-4" stroke-width="1"/><circle cx="20" cy="5" r="1.6" fill="#8a6234"/>
        <rect x="30" y="8" width="5" height="10"/><path d="M30,8 h5 l-2.5,-4 Z" fill="#8a6234"/>
        <path d="M18,32 v-7 a2,2 0 0 1 4,0 v7 Z" fill="#4a3a1c" opacity=".55"/>
      </g>
    </symbol>
    <symbol id="mp-town-con" viewBox="0 0 40 34">
      <g fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3" stroke-linejoin="round">
        <rect x="7" y="20" width="26" height="12"/>
        <path d="M3,20 q17,-7 34,0 Z" fill="#8a6234"/>
        <path d="M8,13 q12,-5 24,0 Z" fill="#8a6234"/>
        <rect x="14" y="13" width="12" height="7"/>
        <path d="M17,32 v-7 h6 v7 Z" fill="#4a3a1c" opacity=".55"/>
      </g>
    </symbol>
    <symbol id="mp-town-mazu" viewBox="0 0 40 34">
      <g fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1.3" stroke-linejoin="round">
        <path d="M6,28 h28 l-4,4 h-20 Z"/>
        <path d="M20,28 v-22" stroke-width="1.4"/>
        <path d="M20,7 q10,4 8,15 l-8,0 Z"/><path d="M20,10 q-8,4 -6,13 l6,0 Z"/>
        <path d="M2,32 q6,-3 12,0 q6,3 12,0 q6,-3 12,0" fill="none" stroke-width="1"/>
      </g>
    </symbol>
    <!-- terrain symbols, medieval profile convention -->
    <symbol id="mp-mtn" viewBox="0 0 40 22">
      <g stroke="#4a3a1c" stroke-width="1.2" stroke-linejoin="round">
        <path d="M2,21 L11,5 L20,21 Z" fill="#dcc79a"/>
        <path d="M14,21 L24,2 L34,21 Z" fill="#e7d5ab"/>
        <path d="M24,2 L28,9 L24,8 L21,12 Z" fill="#fdf6e2" stroke="none"/>
        <path d="M24,2 L20,21 L34,21 Z" fill="url(#mp-hatch)" opacity=".5" stroke="none"/>
        <path d="M11,5 L8,21 L20,21 Z" fill="url(#mp-hatch)" opacity=".38" stroke="none"/>
      </g>
    </symbol>
    <symbol id="mp-dune" viewBox="0 0 40 14">
      <g fill="#e3cf9f" stroke="#8a6234" stroke-width="1">
        <path d="M1,13 q9,-11 18,-3 q7,6 20,3 Z"/>
        <path d="M6,10 q6,-4 11,0" fill="none" stroke-width=".6" opacity=".7"/>
      </g>
    </symbol>
    <symbol id="mp-tree" viewBox="0 0 14 18">
      <g stroke="#4a3a1c" stroke-width="1" fill="#cbbb84">
        <path d="M7,18 v-5"/><path d="M7,1 q6,7 0,12 q-6,-5 0,-12 Z"/>
      </g>
    </symbol>
  </defs>`;
};

/* ---------- decorative bands, winds, rose ---------- */
FQ.MAP.windHead = function (x, y, rot, name) {
  return `<g transform="translate(${x},${y}) rotate(${rot})" opacity=".62">
    <circle r="7" fill="#e6d6ae" stroke="#4a3a1c" stroke-width="1"/>
    <path d="M-3,-2 a1,1 0 0 1 2,0 M1,-2 a1,1 0 0 1 2,0" stroke="#4a3a1c" stroke-width=".8" fill="none"/>
    <path d="M-2.5,2 q2.5,2.5 5,0" stroke="#4a3a1c" stroke-width=".9" fill="none"/>
    <path d="M7,0 q7,-2 13,0 q-7,2 -13,0" fill="#4a3a1c" opacity=".5"/>
    <title>${name}</title></g>`;
};
FQ.MAP.rose = function (x, y, r) {
  const pts = (n, len) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return `${x + Math.cos(a) * len},${y + Math.sin(a) * len}`;
  });
  const p8 = pts(8, r), p8i = pts(8, r * 0.3);
  const star = p8.map((p, i) => `${i ? "L" : "M"}${p} L${p8i[(i + 1) % 8]}`).join(" ") + " Z";
  return `<g class="mp-rose">
    <circle cx="${x}" cy="${y}" r="${r * 1.18}" fill="#e9dbb8" fill-opacity=".5" stroke="#4a3a1c" stroke-width=".9"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.95}" fill="none" stroke="#8a6234" stroke-width=".5"/>
    <path d="${star}" fill="#4a3a1c" fill-opacity=".78" stroke="#4a3a1c" stroke-width=".5"/>
    <path d="M${x},${y - r * 1.05} L${x - r * 0.16},${y} L${x},${y + r * 1.05} L${x + r * 0.16},${y} Z" fill="#b3402e" opacity=".85"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.12}" fill="#e9dbb8" stroke="#4a3a1c" stroke-width=".5"/>
    <text x="${x}" y="${y - r * 1.32}" text-anchor="middle" font-size="7" fill="#4a3a1c" font-family="Georgia,serif">SEPTENTRIO</text>
  </g>`;
};
/* portolan rhumb lines radiating from the rose */
FQ.MAP.rhumbs = function (x, y, len) {
  return `<g opacity=".16" stroke="#4a3a1c" stroke-width=".45">` +
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return `<line x1="${x}" y1="${y}" x2="${x + Math.cos(a) * len}" y2="${y + Math.sin(a) * len}"/>`;
    }).join("") + `</g>`;
};

/* ---------- the beasts travelers reported ---------- */
FQ.MAP.beast = function (kind, x, y, s) {
  const g = (inner) => `<g transform="translate(${x},${y}) scale(${s})" fill="none"
    stroke="#4a3a1c" stroke-width="1.4" stroke-linecap="round" opacity=".72">${inner}</g>`;
  if (kind === "serpent") return g(`
    <path d="M-26,4 q7,-11 14,0 q7,11 14,0 q7,-11 14,0"/>
    <path d="M28,2 q5,-3 8,1 q-4,4 -8,1 Z" fill="#4a3a1c"/>
    <path d="M-26,4 q-5,3 -8,-1" />`);
  if (kind === "roc") return g(`
    <path d="M-20,0 q10,-12 20,-2 q10,-10 20,2 q-10,4 -20,0 q-10,4 -20,0 Z" fill="#4a3a1c" fill-opacity=".2"/>
    <circle cx="0" cy="-2" r="2.4" fill="#4a3a1c"/>
    <path d="M0,0 q-2,7 2,10"/>`);
  if (kind === "whale") return g(`
    <path d="M-18,2 q10,-10 26,-2 q-6,7 -26,2 Z" fill="#4a3a1c" fill-opacity=".18"/>
    <path d="M8,0 q4,-8 8,-8 M10,1 q6,-6 10,-5" />
    <path d="M-18,2 q-6,-4 -8,-8 q7,2 8,8 Z" fill="#4a3a1c" fill-opacity=".2"/>`);
  return g(`<circle r="6"/>`);
};

/* ---------- the whole map ---------- */
FQ.MAP.render = function (opt) {
  const ch = opt.chapter, j = opt.state, R = FQ.JOURNEY_REGIONS;
  const M = ch.mapArt || FQ.MAP.DEFAULT_ART;
  const regionPoly = {
    chr:  "M18,34 Q120,16 246,66 L256,232 Q140,262 26,222 Z",
    isl:  "M252,66 Q344,110 424,240 L432,332 Q330,332 252,232 Z",
    con:  "M424,36 Q604,16 786,58 L794,232 Q640,212 432,240 Z",
    mazu: "M432,240 Q622,252 794,232 L794,404 Q560,414 432,332 Z"
  };
  const regions = Object.keys(regionPoly).map(k => `
    <g class="mp-region">
      <path d="${regionPoly[k]}" fill="${R[k].color}" fill-opacity=".13"/>
      <path d="${regionPoly[k]}" fill="url(#mp-orn-${k})"/>
      <path d="${regionPoly[k]}" fill="none" stroke="${R[k].color}" stroke-width="1.1"
        stroke-opacity=".45" stroke-dasharray="6 4" filter="url(#mp-inkbleed)"/>
    </g>`).join("");

  /* seas */
  const seas = `
    <g class="mp-sea">
      <path d="M432,240 Q622,252 794,232 L794,404 Q560,414 432,332 Z" fill="url(#mp-sea)"/>
      <path d="M18,34 Q120,16 246,66 L256,232 Q140,262 26,222 Z" fill="none"/>
      <path d="M60,236 q220,26 200,64" fill="none" stroke="#3f5f6b" stroke-width=".8" opacity=".3"/>
    </g>`;

  /* terrain, drawn in profile and lifted off the page */
  const terrain = (M.terrain || []).map(t => {
    const w = { mtn: 46, dune: 44, tree: 15 }[t.k] * (t.s || 1);
    const h = { mtn: 25, dune: 16, tree: 19 }[t.k] * (t.s || 1);
    return `<use href="#mp-${t.k}" x="${t.x - w / 2}" y="${t.y - h}" width="${w}" height="${h}"/>`;
  }).join("");

  /* beasts */
  const beasts = (M.beasts || []).map(b => FQ.MAP.beast(b.k, b.x, b.y, b.s || 1)).join("");

  /* routes */
  const cur = j.at;
  const nexts = FQ.J.gatePassed(cur) ? FQ.J.outEdges(cur).map(FQ.J.edgeKey) : [];
  const edges = ch.edges.map(e => {
    const a = FQ.J.node(e.from), b = FQ.J.node(e.to);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18;
    const d = `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    const done = j.edgesDone.includes(FQ.J.edgeKey(e));
    const open = nexts.includes(FQ.J.edgeKey(e));
    return `<path d="${d}" class="${done ? "mp-route done" : open ? "mp-route open" : "mp-route"}"/>`;
  }).join("");

  /* city vignettes */
  const nodes = ch.nodes.map(n => {
    const visited = j.visited.includes(n.id);
    const reachable = nexts.some(k => k.endsWith(">" + n.id));
    const st = n.id === cur ? "cur" : visited ? "done" : reachable ? "next" : "lock";
    const arch = { chr: "chr", isl: "isl", con: "con", mazu: "mazu" }[n.region];
    const big = ["court", "port"].includes(n.type);
    const w = big ? 34 : 26, h = w * 0.85;
    return `
      <g class="mp-city ${st}" onclick="FQ.J.tapNode('${n.id}')"
         style="cursor:${visited || reachable ? "pointer" : "default"}">
        <ellipse cx="${n.x}" cy="${n.y + 2}" rx="${w * .5}" ry="3.4" fill="#4a3a1c" opacity=".2"/>
        <use href="#mp-town-${arch}" x="${n.x - w / 2}" y="${n.y - h}" width="${w}" height="${h}"
          filter="url(#mp-relief)"/>
        ${st === "cur" ? `<circle cx="${n.x}" cy="${n.y - h / 2}" r="${w * .62}" class="mp-here"/>` : ""}
        ${st === "done" ? `<path d="M${n.x - 4},${n.y + 5} l3,3 l6,-7" class="mp-tick"/>` : ""}
        <text x="${n.x}" y="${n.y + 15}" class="mp-label">${FQ.bi(n, "zh", "en")}</text>
      </g>`;
  }).join("");

  const winds = [
    [70, 22, 90, "Aquilo"], [410, 16, 90, "Septentrio"], [750, 22, 90, "Boreas"],
    [22, 210, 0, "Zephyrus"], [800, 210, 180, "Subsolanus"],
    [120, 400, 270, "Africus"], [430, 410, 270, "Auster"], [700, 402, 270, "Notus"]
  ].map(w => FQ.MAP.windHead(w[0], w[1], w[2], w[3])).join("");

  return `
  <svg viewBox="0 0 820 420" class="jmap mappa" id="jmapsvg"
       preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    ${FQ.MAP.defs()}
    <rect x="0" y="0" width="820" height="420" fill="url(#mp-vellum)"/>
    <g opacity=".9">
      <ellipse cx="150" cy="90" rx="120" ry="70" fill="url(#mp-stain)"/>
      <ellipse cx="640" cy="330" rx="150" ry="90" fill="url(#mp-stain)"/>
      <ellipse cx="380" cy="220" rx="90" ry="60" fill="url(#mp-stain)" opacity=".7"/>
    </g>
    ${seas}${regions}
    ${FQ.MAP.rhumbs(742, 336, 300)}
    <g filter="url(#mp-emboss)">${terrain}</g>
    ${beasts}
    <g class="mp-routes">${edges}</g>
    ${nodes}
    <!-- the travelling party rides this glyph along the route (journey.js) -->
    <text id="jmarker" x="-40" y="-40" font-size="22" style="pointer-events:none"
      filter="url(#mp-relief)"></text>
    ${FQ.MAP.rose(742, 336, 22)}
    ${winds}
    <g class="mp-frame">
      <rect x="5" y="5" width="810" height="410" rx="3"/>
      <rect x="10" y="10" width="800" height="400" rx="2"/>
      <rect x="13.5" y="13.5" width="793" height="393"/>
    </g>
    <g class="mp-cartouche" transform="translate(24,372)">
      <path d="M0,0 h214 l10,10 v14 l-10,10 H0 l-10,-10 v-14 Z"/>
      <text x="107" y="21" text-anchor="middle" class="mp-title">${FQ.bi(ch, "nameZh", "nameEn")}</text>
    </g>
  </svg>`;
};

/* fallback furniture if a chapter ships no map art description */
FQ.MAP.DEFAULT_ART = {
  terrain: [
    { k: "tree", x: 60, y: 92, s: 1 }, { k: "tree", x: 96, y: 78, s: .8 },
    { k: "mtn", x: 150, y: 150, s: .8 }, { k: "tree", x: 214, y: 130, s: .9 },
    { k: "dune", x: 330, y: 212, s: 1.1 }, { k: "dune", x: 392, y: 232, s: 1 },
    { k: "dune", x: 300, y: 250, s: .8 },
    { k: "mtn", x: 470, y: 168, s: 1.35 }, { k: "mtn", x: 522, y: 152, s: 1.15 },
    { k: "mtn", x: 428, y: 186, s: .9 },
    { k: "mtn", x: 640, y: 74, s: .75 }, { k: "tree", x: 700, y: 118, s: .85 },
    { k: "tree", x: 736, y: 176, s: .9 }
  ],
  beasts: [
    { k: "serpent", x: 560, y: 386, s: 1 },
    { k: "whale", x: 690, y: 300, s: .9 },
    { k: "roc", x: 500, y: 92, s: .85 }
  ]
};
