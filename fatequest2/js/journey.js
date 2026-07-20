/* 占途 · 千载行纪 2.0 — journey engine (GDD §4/§6)
   Route network + days/par + seeded weather + travel segments with
   encounter cards + towns/bag/trade + companions + tagged case + journal. */
window.FQ = window.FQ || {};
FQ.J = {};

/* ---------- state ---------- */
FQ.J.chapter = () => FQ.CHAPTERS.find(c => c.id === FQ.state.chSel && !c.locked) || FQ.CHAPTERS[0];
FQ.J.selectCh = function (id) {
  const ch = FQ.CHAPTERS.find(c => c.id === id);
  if (!ch) return;
  if (ch.locked) { FQ.toast("🔒 " + FQ.bi(ch, "teaseZh", "teaseEn").slice(0, 40) + "…"); return; }
  FQ.state.chSel = id;
  FQ.save();
  FQ.nav("journey");
};
FQ.J.ensure = function () {
  const ch = FQ.J.chapter();
  let j = FQ.state.journey;
  if (!j || j.v !== 2 || j.ch !== ch.id) {
    j = FQ.state.journey = {
      v: 2, ch: ch.id, at: ch.nodes[0].id, visited: [ch.nodes[0].id],
      edgesDone: [], roadsTaken: (j && j.roadsTaken) || [],
      days: 0, coins: ch.startCoins,
      favor: { chr: 0, isl: 0, con: 0, mazu: 0 },
      bag: (ch.startBag || []).map(x => Object.assign({}, x)),
      comp: { tebrizi: { on: false, fav: 0 }, lin: { on: false, fav: 0 } },
      flags: {}, gates: {}, templeUsed: {}, forecast: {},
      seed: FQ.rand(100000),
      log: [], completed: (j && j.completed) || [], ending: null, caseState: null
    };
    FQ.save();
  }
  return j;
};
FQ.J.node = id => FQ.J.chapter().nodes.find(n => n.id === id);
FQ.J.edgeKey = e => e.from + ">" + e.to;
FQ.J.outEdges = id => FQ.J.chapter().edges.filter(e => e.from === id);
FQ.J.favorTotal = j => Object.values(j.favor).reduce((s, v) => s + v, 0);
FQ.J.bagCount = j => j.bag.length;
FQ.J.hasTool = (j, id) => j.bag.some(b => b.kind === "tool" && b.id === id);
FQ.J.hasToken = (j, id) => j.bag.some(b => b.kind === "token" && b.id === id);
FQ.J.goodsOf = (j, id) => j.bag.find(b => b.kind === "goods" && b.id === id);

/* runtime (per-gate, not persisted) */
FQ.J.g = null;

/* ---------- ambience: drones, weather, phase follow the journey ---------- */
FQ.J.ambient = function (regionId, wx) {
  FQ.AU.drone(regionId);
  FQ._wx = FQ.J.wxToFx(wx);
  FQ.weatherFX.set(FQ._wx);
  FQ.setPhase(FQ.J.ensure().days);
};
FQ.J.wxToFx = wx => ({ storm: "storm", sand: "sand", snow: "snow", wind: "wind", fog: null, clear: null }[wx] || null);
/* leaving journey screens shuts the atmosphere down */
(function () {
  const _nav = FQ.nav;
  FQ.nav = function (screen, param) {
    if (!String(screen).startsWith("journey")) {
      /* music keeps playing — FQ.nav's scene() re-tunes it; only the
         road's own atmosphere layers are torn down here */
      FQ.weatherFX.set(null);
      FQ.clearPhase();
      FQ.fog.detach();
      FQ.cam.stop();
      FQ._wx = null;
    }
    return _nav(screen, param);
  };
})();

/* ---------- weather (§4.3): seeded per in-game day & edge ---------- */
FQ.J.weatherFor = function (edge) {
  const j = FQ.J.ensure();
  const idx = FQ.J.chapter().edges.indexOf(edge);
  const r = FQ.seeded(j.seed * 31 + j.days * 7 + idx * 13);
  const region = FQ.J.node(edge.to).region;
  const climate = Object.assign({}, FQ.JOURNEY_REGIONS[region].climate);
  if (edge.wx) climate[edge.wx] = (climate[edge.wx] || 1) * 2.5;
  const keys = Object.keys(climate);
  return FQ.weightedPick(keys, k => climate[k], r);
};
FQ.WX_ICON = { clear: "☀️", wind: "🍃", fog: "🌫️", storm: "⛈️", sand: "🌪️", snow: "❄️" };

/* ---------- map ---------- */
FQ.J.mapSVG = function () {
  const ch = FQ.J.chapter();
  const j = FQ.J.ensure();
  const R = FQ.JOURNEY_REGIONS;
  const regions = `
    <path d="M20,40 Q120,20 240,70 L250,230 Q140,260 30,220 Z" fill="${R.chr.color}" opacity="0.13"/>
    <path d="M250,70 Q340,110 420,240 L430,330 Q330,330 250,230 Z" fill="${R.isl.color}" opacity="0.13"/>
    <path d="M420,40 Q600,20 780,60 L790,230 Q640,210 430,240 Z" fill="${R.con.color}" opacity="0.13"/>
    <path d="M430,240 Q620,250 790,230 L790,400 Q560,410 430,330 Z" fill="${R.mazu.color}" opacity="0.15"/>
    <text x="90" y="60" class="jrl" fill="${R.chr.color}">${FQ.bi(R.chr, "zh", "en")}</text>
    <text x="300" y="308" class="jrl" fill="${R.isl.color}">${FQ.bi(R.isl, "zh", "en")}</text>
    <text x="560" y="55" class="jrl" fill="${R.con.color}">${FQ.bi(R.con, "zh", "en")}</text>
    <text x="590" y="390" class="jrl" fill="${R.mazu.color}">${FQ.bi(R.mazu, "zh", "en")}</text>`;
  const deco = `
    <g class="jdeco">
      <path d="M470,120 l14,-20 14,20 M492,120 l12,-16 12,16" />
      <path d="M120,300 q10,-8 20,0 q10,8 20,0 M150,320 q10,-8 20,0" />
      <path d="M640,350 q10,-8 20,0 q10,8 20,0 M540,368 q10,-8 20,0" />
      <circle cx="770" cy="330" r="20" /><path d="M770,312 v36 M752,330 h36 M757,317 l26,26 M783,317 l-26,26" />
    </g>`;
  /* edges */
  const cur = j.at;
  const nexts = FQ.J.gatePassed(cur) ? FQ.J.outEdges(cur).map(FQ.J.edgeKey) : [];
  const edges = ch.edges.map(e => {
    const a = FQ.J.node(e.from), b = FQ.J.node(e.to);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18;
    const d = `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
    const done = j.edgesDone.includes(FQ.J.edgeKey(e));
    const open = nexts.includes(FQ.J.edgeKey(e));
    return `<path d="${d}" class="${done ? "jroute-done" : open ? "jroute jroute-open" : "jroute"}"/>`;
  }).join("");
  /* nodes */
  const nodes = ch.nodes.map(n => {
    const visited = j.visited.includes(n.id);
    const reachable = nexts.some(k => k.endsWith(">" + n.id));
    const st = n.id === cur ? "cur" : visited ? "done" : reachable ? "next" : "lock";
    const glyph = n.gate.type === "case" ? "❖" : visited && FQ.J.gatePassed(n.id) ? "✓" : n.type === "side" ? "✧" : "•";
    return `
      <g class="jn ${st}" onclick="FQ.J.tapNode('${n.id}')" style="cursor:${visited || reachable ? "pointer" : "default"}">
        <circle cx="${n.x}" cy="${n.y}" r="12"/>
        <text x="${n.x}" y="${n.y + 4}" class="jni">${glyph}</text>
        <text x="${n.x}" y="${n.y - 19}" class="jnl">${FQ.bi(n, "zh", "en")}</text>
      </g>`;
  }).join("");
  return `
  <div class="jmapwrap" id="jmapwrap">
    <svg viewBox="0 0 820 420" class="jmap" id="jmapsvg" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="812" height="412" rx="14" class="jparch"/>
      ${regions}${deco}${edges}${nodes}
      <text id="jmarker" x="-40" y="-40" font-size="20" style="pointer-events:none"></text>
    </svg>
    <canvas id="jfog" class="jfog"></canvas>
  </div>`;
};
FQ.J.gatePassed = id => { const j = FQ.J.ensure(); return !!j.gates[id]; };
FQ.J.attachFog = function () {
  const cv = document.getElementById("jfog");
  if (!cv) return;
  const j = FQ.J.ensure();
  const holes = j.visited.map(id => { const n = FQ.J.node(id); return { x: n.x, y: n.y, r: 95 }; });
  FQ.fog.attach(cv, holes);
};

/* ---------- main screen ---------- */
FQ.SCREENS.journey = function () {
  const ch = FQ.J.chapter();
  const j = FQ.J.ensure();
  const completed = j.completed.includes(ch.id);
  const compChips = Object.keys(j.comp).filter(k => j.comp[k].on).map(k => {
    const c = FQ.COMPANIONS[k];
    return `<span class="pill" title="${FQ.bi(c, "perkZh", "perkEn")}">${FQ.art("comp-" + k, c.ic)} ${FQ.bi(c, "zh", "en")} ♥${j.comp[k].fav}</span>`;
  }).join("");
  const shelf = FQ.CHAPTERS.map(c => `
    <button class="chtab ${c.id === ch.id ? "on" : ""} ${c.locked ? "locked" : ""}"
      onclick="FQ.J.selectCh('${c.id}')" title="${FQ.bi(c, "taglineZh", "taglineEn")}">
      ${c.locked ? "🔒 " : "📖 "}${FQ.bi(c, "nameZh", "nameEn")}
    </button>`).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.backBtn()}
    <h2>${FQ.t("journey.name")} 🐪</h2>
    <div class="chshelf">${shelf}</div>
    <div class="dim small">${FQ.bi(ch, "nameZh", "nameEn")} · ${FQ.bi(ch, "taglineZh", "taglineEn")}</div>
    <div class="jres">
      <span class="pill">📅 <b>${j.days}</b>/${ch.parDays} ${FQ.t("common.day")}</span>
      <span class="pill">💰 <b>${j.coins}</b></span>
      <span class="pill">🕯️ <b>${FQ.J.favorTotal(j)}</b></span>
      <span class="pill dust">✨ <b>${FQ.state.stardust}</b></span>
      <button class="pill skillbtn" onclick="FQ.nav('journeyBag')">🎒 ${FQ.J.bagCount(j)}/${ch.bagSlots}</button>
      <button class="pill skillbtn" onclick="FQ.nav('journeyLog')">📜 ${j.log.length}</button>
      ${completed ? `<span class="pill gold">✓ ${FQ.t("journey.done")}</span>` : ""}
    </div>
    ${compChips ? `<div class="jres">${compChips}</div>` : ""}
    ${FQ.J.mapSVG()}
    <div id="jpanel"></div>`;
  FQ.J.attachFog();
  const n = FQ.J.node(j.at);
  FQ.J.ambient(n.region, null);
  FQ.J.openNode(j.at);
};

FQ.J.tapNode = function (id) {
  const j = FQ.J.ensure();
  if (j.visited.includes(id)) { FQ.J.openNode(id); return; }
  /* reachable next node? tapping it = travel */
  if (FQ.J.gatePassed(j.at)) {
    const e = FQ.J.outEdges(j.at).find(x => x.to === id);
    if (e) { FQ.J.travelTo(FQ.J.edgeKey(e)); return; }
  }
};

/* ---------- node panel ---------- */
FQ.J.openNode = function (id) {
  const j = FQ.J.ensure();
  const n = FQ.J.node(id);
  const panel = document.getElementById("jpanel");
  if (!panel || !n) return;
  const R = FQ.JOURNEY_REGIONS[n.region];
  const isCur = id === j.at;
  const passed = FQ.J.gatePassed(id);
  let body = "";

  if (n.gate.type === "case" && isCur) {
    body = j.caseState && j.caseState.concluded
      ? `<div class="dim small">✓ ${FQ.t("journey.done")}</div>`
      : `<button class="btn block" onclick="FQ.J.startCase()">${FQ.t("journey.case")} →</button>`;
  } else if (!isCur) {
    body = `<div class="dim small">${passed ? "✓ " + FQ.t("journey.pass") : ""}</div>`;
  } else if (passed) {
    body = FQ.J.travelOptionsHTML(j);
  } else {
    body = FQ.J.gateHTML(n);
  }

  const townHtml = isCur && n.town ? FQ.J.townHTML(n) : "";
  /* 师承: a teacher of this place, still unmet (GDD §4.9) */
  const mentorHtml = isCur ? FQ.Q.pendingAt(id).map(M => `
    <button class="mentor-call" onclick="FQ.Q.meet('${M.method}')">
      <span class="mc-ic">${FQ.art("mentor-" + M.method, M.ic, "big")}</span>
      <span class="mc-txt"><b>${FQ.bi(M, "zh", "en")}</b>
        <span class="dim small">${FQ.t("mentor.here")} · ${FQ.t(M.method + ".name")}</span></span>
      <span class="mc-go">${FQ.t("mentor.meet")}</span>
    </button>`).join("") : "";
  panel.innerHTML = `
    <div class="panel jnode-panel" style="--rc:${R.color}">
      <div class="jreg" style="color:${R.color}">${FQ.bi(R, "zh", "en")}${n.type === "side" ? " · ✧" : ""}</div>
      <h3>${FQ.bi(n, "zh", "en")}</h3>
      <div class="reading dim jexcerpt" style="font-size:.85rem"><span id="jex"></span></div>
      ${mentorHtml}${townHtml}${body}
    </div>`;
  const ex = document.getElementById("jex");
  const text = FQ.t("journey.excerpt") + "：" + FQ.bi(n, "exZh", "exEn");
  if (isCur && !j.flags["ex_" + id]) {
    j.flags["ex_" + id] = 1; FQ.save();
    FQ.typeInto(ex, text, 34);
  } else ex.textContent = text;
  if (isCur && !passed && n.gate.type !== "case" && n.gate.type !== "dreamChoice"
      && FQ.Q.gateOK(n.gate.type)) FQ.J.newGate(n);
  if (isCur && n.gate.onOpen && !j.flags["open_" + id]) {
    j.flags["open_" + id] = 1;
    FQ.save();
    FQ.J.fx(n.gate.onOpen, {});
  }
};

/* ---------- travel options ---------- */
FQ.J.travelOptionsHTML = function (j) {
  const outs = FQ.J.outEdges(j.at);
  if (!outs.length) return "";
  const KIND = { land: "🐪", sea: "⛵", river: "🛶" };
  return `<p class="small gold" style="margin:8px 0 4px">${FQ.t("journey.travel")}</p>` + outs.map(e => {
    const to = FQ.J.node(e.to);
    const key = FQ.J.edgeKey(e);
    const fc = j.forecast[key];
    const risk = e.risk + (j.flags.rushed ? 2 : 0);
    return `
      <button class="btn ghost block jedge" onclick="FQ.J.travelTo('${key}')">
        <span style="flex:1;text-align:left">${KIND[e.kind]} ${FQ.bi(to, "zh", "en")}</span>
        <span class="dim small">${e.days}${FQ.t("common.day")} · ${"▮".repeat(Math.max(0, risk)) || "—"}${fc ? " · " + FQ.WX_ICON[fc] : ""}</span>
      </button>`;
  }).join("");
};

/* ---------- gates with omens (§3.1) ---------- */
FQ.J.newGate = function (n) {
  FQ.J.g = { node: n.id, type: n.gate.type, tries: 0, yinStreak: 0, tebUsed: false };
  FQ.J.commit();
};
FQ.J.commit = function () {
  const g = FQ.J.g;
  let pending = null, pass = false, quality = 0;
  switch (g.type) {
    case "tarotAny": pending = FQ.drawTarot(1)[0]; pass = true; quality = pending.reversed ? 0 : 1; break;
    case "tarotLow": pending = FQ.drawTarot(1)[0]; pass = pending.card.id <= 9; quality = pass ? 1 : -1; break;
    case "diceFire": pending = FQ.rollAstroDice(); pass = ["火", "风"].includes(pending.sign.elemZh); quality = pass ? 1 : -1; break;
    case "diceElem": pending = FQ.rollAstroDice(); pass = ["土", "火"].includes(pending.sign.elemZh); quality = pass ? 1 : -1; break;
    case "diceHouse": pending = FQ.rollAstroDice(); pass = [1, 9, 10].includes(pending.house.n); quality = pass ? 1 : -1; break;
    case "coinYang": pending = FQ.tossCoins(); pass = pending.yang; quality = pass ? 1 : -1; break;
    case "meihua": pending = FQ.meihua(); pass = true;
      quality = (pending.primary.lower.id === "kan" || pending.primary.upper.id === "kan") ? 1 : 0; break;
    case "ichingYang": pending = [0, 0, 0, 0, 0, 0].map(() => FQ.tossCoins()); pass = pending.filter(t => t.yang).length >= 3; quality = pass ? 1 : -1; break;
    case "lot": pending = FQ.drawLot(); pass = pending.g !== "下下"; quality = pass ? 1 : -1; break;
    case "jiaobei": pending = FQ.throwJiaobei(); pass = pending.res.id === "sheng"; quality = pass ? 1 : -1; break;
  }
  g.pending = pending; g.pass = pass;
  const j = FQ.J.ensure();
  let acc = 0.72;
  if (FQ.J.hasTool(j, "crystal") || j.flags.omenBoost) acc = 0.95;
  if (g.type === "jiaobei" && j.comp.lin.on) acc = Math.max(acc, 0.92);
  g.omen = FQ.omenFor(quality, acc);
  FQ.J.renderGate();
};
FQ.J.omenMethod = t => t.startsWith("tarot") ? "tarot" : t.startsWith("dice") ? "dice"
  : t === "ichingYang" || t === "coinYang" ? "iching" : t;
FQ.J.gateHTML = function (n) {
  /* an art you were never taught cannot be practiced — take the hard road */
  if (!FQ.Q.gateOK(n.gate.type)) {
    const need = FQ.Q.gateNeed(n.gate.type);
    return `
      <p class="small" style="margin:8px 0">${FQ.bi(n.gate, "pZh", "pEn")}</p>
      <div class="edged">🔒 ${FQ.t("gate.need", { t: FQ.t(need + ".name") })}</div>
      ${n.gate.edgeZh ? `<div class="center" style="margin-top:10px">
        <button class="btn" onclick="FQ.J.takeEdgeAt('${n.id}')">🌘 ${FQ.bi(n.gate, "edgeZh", "edgeEn")}</button></div>` : ""}`;
  }
  return `
    <p class="small" style="margin:8px 0">${FQ.bi(n.gate, "pZh", "pEn")}</p>
    <div id="jgatezone"></div>`;
};
/* edge road taken without ever attempting the rite */
FQ.J.takeEdgeAt = function (id) {
  FQ.J.g = { node: id, type: FQ.J.node(id).gate.type, tries: 0, yinStreak: 0, tebUsed: false };
  FQ.J.takeEdge();
};
FQ.J.renderGate = function () {
  const zone = document.getElementById("jgatezone");
  const g = FQ.J.g;
  if (!zone || !g) return;
  const n = FQ.J.node(g.node);
  if (n.gate.type === "dreamChoice") return;
  const cost = FQ.J.retryCost();
  const canDust = FQ.state.stardust >= 1;
  zone.innerHTML = `
    ${FQ.omenHTML(FQ.J.omenMethod(g.type), g.omen)}
    <div id="jgate"></div>
    <div class="center" style="margin-top:10px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn" id="jgo" onclick="FQ.J.attempt()">
        ${g.tries === 0 ? FQ.t("common.start") : cost ? FQ.t("journey.retry") : FQ.t("journey.retry.free")}</button>
      ${canDust ? `<button class="btn ghost" onclick="FQ.J.dustReroll()" title="${FQ.t("journey.dust.tip")}">✨ ${FQ.t("journey.dust.re")}</button>` : ""}
    </div>
    <div id="jedgeopt" class="center" style="margin-top:8px"></div>`;
};
FQ.J.dustReroll = function () {
  if (!FQ.spendDust(1)) return;
  FQ.AU.play("omen");
  FQ.J.commit(); /* re-commit fate, fresh omen */
  FQ.toast(FQ.t("journey.dust.done"));
};
FQ.J.retryCost = function () {
  const g = FQ.J.g, j = FQ.J.ensure();
  if (g.tries === 0) return 0;
  if (j.flags.freeRetry) return 0;
  if (g.type === "jiaobei" && j.comp.lin.on && g.tries < 3) return 0;
  return j.coins > 0 ? 1 : 0;
};

FQ.J.attempt = function () {
  const g = FQ.J.g;
  const j = FQ.J.ensure();
  const n = FQ.J.node(g.node);
  const cost = FQ.J.retryCost();
  if (cost) { j.coins -= cost; FQ.save(); }
  g.tries++;
  const out = document.getElementById("jgate");
  const p = g.pending;
  let html = "";

  FQ.AU.play({ tarotAny: "card", tarotLow: "card", diceFire: "dice", diceElem: "dice", diceHouse: "dice",
    coinYang: "coin", meihua: "card", ichingYang: "coin", lot: "shake", jiaobei: "wood" }[g.type] || "card");

  if (g.type === "tarotAny" || g.type === "tarotLow") {
    FQ.collect("tarot", p.card.id, FQ.bi(p.card, "zh", "en"));
    html = `<div class="center result"><div style="font-size:40px" class="${p.reversed ? "revglyph" : ""}">${p.card.sym}</div>
      <b class="gold">${FQ.bi(p.card, "zh", "en")}${p.reversed ? FQ.t("tarot.rev") : ""}</b> <span class="dim small">#${p.card.id}</span></div>`;
  } else if (g.type.startsWith("dice")) {
    html = `<div class="center result">
      <div style="display:flex;gap:14px;justify-content:center;margin:6px 0">
        ${FQ.diceArt("planet", p.planet.en.toLowerCase(), "", p.planet.sym)}
        ${FQ.diceArt("sign", p.sign.id, "", p.sign.sym)}
        ${FQ.diceArt("house", p.house.n, "", "Ⅰ")}
      </div>
      <b class="gold">${FQ.bi(p.planet, "zh", "en")} · ${FQ.bi(p.sign, "zh", "en")} · ${"ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ"[p.house.n - 1]}</b>
      <div class="dim small">${FQ.lang === "zh" ? p.sign.elemZh + "象 · " + p.house.zh : p.sign.elemEn + " · " + p.house.en}</div></div>`;
  } else if (g.type === "coinYang") {
    html = `<div class="center result"><div style="font-size:34px">🪙</div>
      <b class="gold">${p.yang ? (FQ.lang === "zh" ? "阳面" : "Yang — heads") : (FQ.lang === "zh" ? "阴面" : "Yin — tails")}</b></div>`;
  } else if (g.type === "meihua") {
    FQ.collectHexCast(p);
    const hasKan = p.primary.lower.id === "kan" || p.primary.upper.id === "kan";
    if (hasKan) { j.coins += 2; FQ.save(); }
    html = `<div class="result">${FQ.hexLinesHTML(p.lines, p.movingIdx)}
      <div class="center"><b class="gold">${FQ.bi(p.primary, "zh", "en")}</b>
      <div class="small ${hasKan ? "gold" : "dim"}">${hasKan
        ? (FQ.lang === "zh" ? "卦中见坎！寻得雪泉，盘缠 +2" : "Water found! A snow spring — +2 provisions")
        : (FQ.lang === "zh" ? "无坎，且忍渴前行" : "No water in the lines; ride on thirsty")}</div></div></div>`;
  } else if (g.type === "ichingYang") {
    const cast = FQ.resolveCast(p);
    FQ.collectHexCast(cast);
    const yang = cast.lines.filter(x => x === 1).length;
    html = `<div class="result">${FQ.hexLinesHTML(cast.lines, cast.movingIdx)}
      <div class="center"><b class="gold">${FQ.bi(cast.primary, "zh", "en")}</b>
      <span class="dim small"> · ${FQ.lang === "zh" ? "阳爻" : "yang"} ${yang}/6</span></div></div>`;
  } else if (g.type === "lot") {
    html = `<div class="center result"><div class="lotgrade">「${FQ.lang === "zh" ? p.g : p.gEn}」</div>
      <div class="reading" style="text-align:left">${FQ.bi(p, "zh", "en")}</div></div>`;
  } else if (g.type === "jiaobei") {
    html = `<div class="center result"><div style="font-size:34px">🌗</div>
      <b class="gold">${FQ.t(p.res.tKey)}</b></div>`;
    if (p.res.id === "yin") g.yinStreak++; else g.yinStreak = 0;
  }

  if (g.pass) {
    FQ.AU.play("chime"); FQ.buzz(p && p.res && p.res.id === "sheng" ? [20, 40, 20] : 18);
    j.gates[n.id] = "pass";
    j.favor[n.region] = (j.favor[n.region] || 0) + 1;
    j.flags.omenBoost = false;
    if (n.gate.onPass) FQ.J.fx(n.gate.onPass, {});
    FQ.save();
    FQ.gainXP(5);
    html += `<div class="xp-note">✦ ${FQ.t("journey.pass")}</div>`;
    out.innerHTML = html;
    FQ.sparkleAt(innerWidth / 2, innerHeight / 2);
    document.getElementById("jgo").style.display = "none";
    const eo = document.getElementById("jedgeopt");
    if (eo) eo.innerHTML = `<button class="btn" onclick="FQ.nav('journey')">${FQ.t("journey.travel")}</button>`;
  } else {
    FQ.AU.play("bad");
    /* jiaobei dark-thread special (§3.3 双刃: 阴筊指向暗线) */
    const sp = n.gate.special;
    if (sp && sp.when === "yin" && g.yinStreak >= 2 && !j.flags["sp_" + n.id]) {
      j.flags["sp_" + n.id] = 1;
      FQ.J.fx(sp.fx, {});
      html += `<div class="edged">🌒 ${FQ.bi(sp, "zh", "en")}</div>`;
      FQ.J.journalNote("🌒", FQ.bi(sp, "zh", "en"));
    }
    html += `<div class="center dim small" style="margin-top:8px">${FQ.t("journey.fail")}${j.coins === 0 ? " · " + FQ.t("journey.mercy") : ""}</div>`;
    out.innerHTML = html;
    /* tebrizi free re-roll on dice rites (§4.4 perk) */
    const eo = document.getElementById("jedgeopt");
    let extra = "";
    if (g.type.startsWith("dice") && j.comp.tebrizi.on && !g.tebUsed) {
      extra += `<button class="btn ghost sm" onclick="FQ.J.tebReroll()">🧿 ${FQ.t("journey.teb.re")}</button> `;
    }
    /* fail-forward edge option (§3.3) */
    if (n.gate.edgeZh && g.tries >= 1) {
      extra += `<button class="btn ghost sm" onclick="FQ.J.takeEdge()">🌘 ${FQ.bi(n.gate, "edgeZh", "edgeEn")}</button>`;
    }
    if (eo) eo.innerHTML = extra;
    const go = document.getElementById("jgo");
    FQ.J.commitSilent();
    if (go) go.textContent = FQ.J.retryCost() ? FQ.t("journey.retry") : FQ.t("journey.retry.free");
  }
};
/* re-commit without re-rendering the whole gate zone (keeps the reveal up) */
FQ.J.commitSilent = function () {
  const rg = FQ.J.renderGate;
  FQ.J.renderGate = function () {};
  FQ.J.commit();
  FQ.J.renderGate = rg;
  const zone = document.getElementById("jgatezone");
  if (zone) {
    const omen = zone.querySelector(".omen");
    if (omen) omen.outerHTML = FQ.omenHTML(FQ.J.omenMethod(FQ.J.g.type), FQ.J.g.omen);
  }
};
FQ.J.tebReroll = function () {
  const g = FQ.J.g;
  g.tebUsed = true;
  g.tries--; /* free */
  FQ.toast(FQ.t("journey.teb.done"));
  FQ.J.attempt();
};
FQ.J.takeEdge = function () {
  const g = FQ.J.g, j = FQ.J.ensure();
  const n = FQ.J.node(g.node);
  FQ.J.fx(n.gate.edgeFx || [], {});
  j.gates[n.id] = "edge";
  FQ.save();
  FQ.J.journalNote("🌘", FQ.tpl(FQ.JOURNAL_T.gateEdge, { b: FQ.bi(n, "zh", "en") }));
  FQ.toast("🌘 " + FQ.t("journey.edge.taken"));
  FQ.nav("journey");
};

/* dream gate (choices, not chance) */
FQ.J.dreamPick = function (oi) {
  const j = FQ.J.ensure();
  const n = FQ.J.node(j.at);
  const o = n.gate.options[oi];
  FQ.J.fx(o.fx || [], {});
  j.gates[n.id] = "pass";
  j.favor[n.region]++;
  FQ.save();
  FQ.gainXP(5);
  document.getElementById("jgatezone").innerHTML = `
    <div class="reading result">${FQ.bi(o, "rZh", "rEn")}</div>
    <div class="center"><button class="btn" onclick="FQ.nav('journey')">${FQ.t("journey.travel")}</button></div>`;
};
/* patch: dream gate renders options */
(function () {
  const _open = FQ.J.openNode;
  FQ.J.openNode = function (id) {
    _open(id);
    const j = FQ.J.ensure();
    const n = FQ.J.node(id);
    if (id === j.at && !FQ.J.gatePassed(id) && n.gate.type === "dreamChoice") {
      const zone = document.getElementById("jgatezone");
      if (zone) zone.innerHTML = n.gate.options.map((o, oi) => `
        <button class="btn ghost block" style="margin-top:8px" onclick="FQ.J.dreamPick(${oi})">
          ${o.sym} ${FQ.bi(o, "zh", "en")}</button>`).join("");
    }
  };
})();

/* ---------- effects vocabulary (§9.5 effect ops) ---------- */
FQ.tpl = function (t, vars) {
  let s = FQ.bi(t, "zh", "en");
  for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
  return s;
};
FQ.J.fx = function (list) {
  const j = FQ.J.ensure();
  const ch = FQ.J.chapter();
  (list || []).forEach(op => {
    switch (op.op) {
      case "days": j.days += op.v; break;
      case "coins": j.coins = Math.max(0, j.coins + op.v); break;
      case "favor": j.favor[op.civ] = (j.favor[op.civ] || 0) + op.v; break;
      case "favorLocal": { const r = FQ.J.node(j.at).region; j.favor[r] = (j.favor[r] || 0) + op.v; break; }
      case "dust": FQ.gainDust(op.v); break;
      case "flag": j.flags[op.v] = true; break;
      case "join": {
        if (!j.comp[op.v].on) {
          j.comp[op.v].on = true;
          j.flags[op.v === "lin" ? "linAboard" : "tebAboard"] = true;
          const c = FQ.COMPANIONS[op.v];
          setTimeout(() => FQ.toast(`${c.ic} ${FQ.t("journey.comp.join", { t: FQ.bi(c, "zh", "en") })}`), 600);
        }
        break;
      }
      case "cfavor": if (j.comp[op.who]) j.comp[op.who].fav += op.v; break;
      case "token": if (!FQ.J.hasToken(j, op.v) && FQ.J.bagCount(j) < ch.bagSlots) {
        j.bag.push({ kind: "token", id: op.v });
        const tk = FQ.TOKENS[op.v];
        setTimeout(() => FQ.toast(`${tk.ic} ${FQ.t("journey.bag.got", { t: FQ.bi(tk, "zh", "en") })}`), 900);
      } break;
      case "tool": if (FQ.J.bagCount(j) < ch.bagSlots) j.bag.push({ kind: "tool", id: op.v }); break;
      case "goods": {
        const g = FQ.J.goodsOf(j, op.id);
        if (g) g.n += op.v;
        else if (FQ.J.bagCount(j) < ch.bagSlots) j.bag.push({ kind: "goods", id: op.id, n: op.v });
        break;
      }
      case "sellBest": {
        const goods = j.bag.filter(b => b.kind === "goods");
        if (goods.length) {
          const g = goods[0];
          j.coins += 5; g.n--;
          if (g.n <= 0) j.bag.splice(j.bag.indexOf(g), 1);
        }
        break;
      }
      case "forecast": {
        const from = FQ.J.travelCtx ? FQ.J.travelCtx.to : j.at;
        FQ.J.outEdges(from).forEach(e => { j.forecast[FQ.J.edgeKey(e)] = FQ.J.weatherFor(e); });
        j.flags.omenBoost = true;
        break;
      }
    }
  });
  FQ.save();
};

/* ---------- travel segment (§4.3 行进段) ---------- */
FQ.J.travelCtx = null;
FQ.J.travelTo = function (key) {
  const j = FQ.J.ensure();
  if (!FQ.J.gatePassed(j.at)) return;
  const e = FQ.J.chapter().edges.find(x => FQ.J.edgeKey(x) === key);
  if (!e || e.from !== j.at) return;
  if (e.forkId) {
    const rk = e.forkId + ":" + e.to;
    if (!j.roadsTaken.includes(rk)) j.roadsTaken.push(rk);
  }
  const rushed = !!j.flags.rushed;
  if (rushed) { delete j.flags.rushed; }
  FQ.save();
  const wx = j.forecast[key] || FQ.J.weatherFor(e);
  FQ.J.travelCtx = {
    e, key, wx, to: e.to, rushed,
    extraDays: 0, evLines: [],
    encounters: FQ.J.planEncounters(e, wx, rushed),
    idx: 0, skipped: false
  };
  FQ.nav("journeyTravel");
};
/* pick 1–2 encounters; weather may force one (§4.3 天气参与玩法) */
FQ.J.planEncounters = function (e, wx, rushed) {
  const j = FQ.J.ensure();
  const ch = FQ.J.chapter();
  const list = [];
  const risk = e.risk + (rushed ? 2 : 0);
  const pool = ch.encounters.filter(enc => {
    const w = enc.when || {};
    if (w.weather && !w.weather.includes(wx)) return false;
    if (w.kinds && !w.kinds.includes(e.kind)) return false;
    if (w.regions && !w.regions.includes(FQ.J.node(e.to).region) && !w.regions.includes(FQ.J.node(e.from).region)) return false;
    if (w.minRisk && risk < w.minRisk) return false;
    if (w.flags && !w.flags.every(f => j.flags[f])) return false;
    return true;
  });
  /* forced cards: weather events & companion events fire once each */
  pool.filter(x => x.w === 99 && !j.flags["enc_" + x.id + "_" + (x.when.weather ? wx : "f")]).slice(0, 2)
    .forEach(x => { if (list.length < 2) list.push(x); });
  const normal = pool.filter(x => x.w !== 99 && !j.flags["enc_" + x.id]);
  const count = Math.max(1, Math.min(2, list.length + (Math.random() < 0.35 ? 2 : 1))) - list.length;
  for (let i = 0; i < count && normal.length; i++) {
    const pick = FQ.weightedPick(normal, x => x.w);
    normal.splice(normal.indexOf(pick), 1);
    list.push(pick);
  }
  return list.slice(0, 2);
};

FQ.SCREENS.journeyTravel = function () {
  const c = FQ.J.travelCtx;
  if (!c) return FQ.nav("journey");
  const a = FQ.J.node(c.e.from), b = FQ.J.node(c.e.to);
  const KIND = { land: "🐪", sea: "⛵", river: "🛶" };
  document.getElementById("app").innerHTML = `
    <div class="jres" style="margin-top:8px">
      <span class="pill">${KIND[c.e.kind]} ${FQ.bi(a, "zh", "en")} → ${FQ.bi(b, "zh", "en")}</span>
      <span class="pill">${FQ.WX_ICON[c.wx]} ${FQ.t("wx." + c.wx)}</span>
      <span class="pill">📅 +${c.e.days}${FQ.t("common.day")}</span>
      ${c.rushed ? `<span class="pill" style="color:#ff9a8b">⚠️ ${FQ.t("journey.rushed")}</span>` : ""}
    </div>
    ${FQ.J.mapSVG()}
    <div id="jtravelpanel">
      <div class="center" style="margin:8px 0">
        <button class="btn ghost sm" id="jskip" onclick="FQ.J.skipTravel()">${FQ.t("journey.skip")} ⏩</button>
      </div>
    </div>`;
  FQ.J.attachFog();
  FQ.J.ambient(b.region, c.wx);
  FQ.J.runTravel();
};
FQ.J.skipTravel = function () { if (FQ.J.travelCtx) FQ.J.travelCtx.skipped = true; };

FQ.J.runTravel = function () {
  const c = FQ.J.travelCtx;
  const svg = document.getElementById("jmapsvg");
  const marker = document.getElementById("jmarker");
  if (!c || !svg || !marker) return;
  const a = FQ.J.node(c.e.from), b = FQ.J.node(c.e.to);
  const KIND = { land: "🐪", sea: "⛵", river: "🛶" };
  marker.textContent = KIND[c.e.kind];
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 18;
  const posAt = t => [
    (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mx + t * t * b.x,
    (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * my + t * t * b.y
  ];
  /* remaining stops for pending encounters */
  const total = c.encounters.length;
  const from = c.idx === 0 ? 0 : 0.34 * c.idx + 0.06;
  const stops = [];
  for (let i = c.idx; i < total; i++) stops.push(0.34 * (i + 1));
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
  const w = Math.max(300, Math.abs(a.x - b.x) + 200);
  FQ.cam.to(svg, [cx - w / 2, cy - (w * 420 / 820) / 2, w, w * 420 / 820], c.idx === 0 ? 1000 : 400).then(() => {
    const dur = Math.max(400, 6200 * (1 - from));
    const start = performance.now();
    /* timer-driven so the march survives background-tab throttling */
    const step = () => {
      if (!marker.isConnected || FQ.J.travelCtx !== c) return;
      let k = from + (1 - from) * Math.min(1, (performance.now() - start) / dur);
      if (c.skipped) k = stops.length ? stops[0] : 1;
      const [x, y] = posAt(k);
      marker.setAttribute("x", x - 10); marker.setAttribute("y", y + 6);
      if (!c.skipped) FQ.cam.follow(svg, x, y, 340);
      if (stops.length && k >= stops[0] - 0.001) {
        FQ.J.showEncounter(c.encounters[c.idx]);
        return;
      }
      if (k >= 0.999) { FQ.J.arrive(); return; }
      setTimeout(step, 16);
    };
    step();
  });
};
FQ.J.resumeTravel = function () {
  const c = FQ.J.travelCtx;
  if (!c) return;
  c.idx++;
  const panel = document.getElementById("jtravelpanel");
  if (panel) panel.innerHTML = `<div class="center" style="margin:8px 0">
    <button class="btn ghost sm" onclick="FQ.J.skipTravel()">${FQ.t("journey.skip")} ⏩</button></div>`;
  if (c.idx < c.encounters.length) FQ.J.runTravel();
  else { c.skipped = false; FQ.J.runTravel(); }
};

/* ---------- encounters (§4.3 遭遇卡) ---------- */
FQ.J.showEncounter = function (enc) {
  const j = FQ.J.ensure();
  const c = FQ.J.travelCtx;
  if (!enc) return FQ.J.arrive();
  j.flags["enc_" + enc.id + (enc.w === 99 && enc.when.weather ? "_" + c.wx : enc.w === 99 ? "_f" : "")] = true;
  if (enc.w !== 99) j.flags["enc_" + enc.id] = true;
  FQ.save();
  FQ.AU.play(c.wx === "storm" ? "gale" : "step");
  const panel = document.getElementById("jtravelpanel");
  const choices = enc.choices.map((o, i) => {
    let dis = "";
    if (o.needTool && !FQ.J.hasTool(j, o.needTool)) dis = "disabled";
    if (o.needCoins && j.coins < o.needCoins) dis = "disabled";
    if (o.needGoods && !j.bag.some(b => b.kind === "goods")) dis = "disabled";
    const ic = o.ritual ? "🔮 " : o.needTool ? FQ.TOOLS[o.needTool].ic + " " : "";
    return `<button class="btn ghost block encchoice" ${dis} onclick="FQ.J.encPick(${i})">${ic}${FQ.bi(o, "zh", "en")}</button>`;
  }).join("");
  panel.innerHTML = `
    <div class="panel jnode-panel encounter" style="--rc:${FQ.JOURNEY_REGIONS[FQ.J.node(c.to).region].color}">
      <div class="jreg dim">${FQ.t("journey.enc")} · ${FQ.WX_ICON[c.wx]}</div>
      <h3>${enc.ic} ${FQ.bi(enc, "zh", "en")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.bi(enc, "tZh", "tEn")}</div>
      <div id="jenczone">${choices}</div>
    </div>`;
  FQ.J.curEnc = enc;
};
FQ.J.encPick = function (i) {
  const enc = FQ.J.curEnc;
  const o = enc.choices[i];
  const zone = document.getElementById("jenczone");
  const c = FQ.J.travelCtx;
  const doneBtn = `<div class="center" style="margin-top:10px">
    <button class="btn sm" onclick="FQ.J.resumeTravel()">${FQ.t("journey.onward")}</button></div>`;
  const finish = (line, fx, ic) => {
    const before = FQ.J.ensure().days;
    FQ.J.fx(fx || []);
    const dd = FQ.J.ensure().days - before;
    c.extraDays += dd;
    c.evLines.push({ ic: ic || enc.ic, line });
    zone.innerHTML = `<div class="reading result">${line}</div>${doneBtn}`;
  };
  if (!o.ritual) {
    FQ.AU.play("flip");
    finish(FQ.bi(o, "rZh", "rEn"), o.fx);
    return;
  }
  /* divination choice: quick rite with its own suspense beat */
  FQ.AU.play({ jiaobei: "wood", coin1: "coin", tarot1: "card", diceElem: "dice", diceAny: "dice", meihuaWater: "card" }[o.ritual.method] || "card");
  zone.innerHTML = `<div class="center dim">…</div>`;
  setTimeout(() => {
    let pass = false, special = false, glyph = "";
    switch (o.ritual.method) {
      case "jiaobei": { const r = FQ.throwJiaobei(); pass = r.res.id === "sheng"; special = r.res.id === "yin"; glyph = "🌗 " + FQ.t(r.res.tKey); break; }
      case "coin1": { const t = FQ.tossCoins(); pass = t.yang; glyph = "☯ " + (t.yang ? (FQ.lang === "zh" ? "阳爻" : "Yang") : (FQ.lang === "zh" ? "阴爻" : "Yin")); break; }
      case "tarot1": { const d = FQ.drawTarot(1)[0]; pass = !d.reversed; glyph = d.card.sym + " " + FQ.bi(d.card, "zh", "en") + (d.reversed ? FQ.t("tarot.rev") : ""); FQ.collect("tarot", d.card.id, FQ.bi(d.card, "zh", "en")); break; }
      case "diceElem": { const r = FQ.rollAstroDice(); pass = ["土", "火"].includes(r.sign.elemZh); glyph = r.sign.sym + " " + FQ.bi(r.sign, "zh", "en"); break; }
      case "diceAny": { const r = FQ.rollAstroDice(); pass = ["木星", "金星", "太阳"].includes(r.planet.zh) || [5, 9, 10].includes(r.house.n); glyph = r.planet.sym + " " + FQ.bi(r.planet, "zh", "en"); break; }
      case "meihuaWater": { const m = FQ.meihua(); FQ.collectHexCast(m); const ids = [m.primary.lower.id, m.primary.upper.id]; pass = ids.includes("kan") || ids.includes("gen"); glyph = m.primary.lower.sym + m.primary.upper.sym + " " + FQ.bi(m.primary, "zh", "en"); break; }
    }
    const branch = special && o.special ? o.special : pass ? o.pass : o.fail;
    if (pass) { FQ.AU.play("chime"); FQ.buzz(15); } else FQ.AU.play(special ? "hush" : "bad");
    const line = `<b class="gold">${glyph}</b><br>` + (special && o.special ? FQ.bi(o.special, "zh", "en") : FQ.bi(branch, "rZh", "rEn"));
    finish(line, branch.fx, pass ? "✅" : special ? "🌒" : "•");
    FQ.recordReading("journey-enc", 3);
  }, 850);
};

/* ---------- arrival: days, journal, fog reveal ---------- */
FQ.J.arrive = function () {
  const j = FQ.J.ensure();
  const c = FQ.J.travelCtx;
  if (!c) return FQ.nav("journey");
  let legDays = c.e.days + c.extraDays;
  if (c.wx === "wind") legDays = Math.max(1, legDays - 1);
  const startDay = j.days - c.extraDays; /* extras were already applied by fx */
  j.days = startDay + legDays;
  j.at = c.to;
  if (!j.visited.includes(c.to)) j.visited.push(c.to);
  if (!j.edgesDone.includes(c.key)) j.edgesDone.push(c.key);
  delete j.flags.freeRetry;
  /* journal page (§4.6) */
  j.log.push({
    d: startDay, a: c.e.from, b: c.to, k: c.e.kind, wx: c.wx, n: legDays,
    evs: c.evLines.map(x => ({ ic: x.ic, line: x.line.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 90) })),
    comp: Object.keys(j.comp).filter(k => j.comp[k].on)
  });
  FQ.save();
  FQ.checkAchievements();
  FQ.J.travelCtx = null;
  FQ.gainXP(3);
  FQ.nav("journey");
  setTimeout(() => {
    const n = FQ.J.node(c.to);
    FQ.fog.reveal(n.x, n.y);
    FQ.AU.play(c.e.kind === "sea" ? "sail" : "step");
  }, 250);
};
FQ.J.journalNote = function (ic, line) {
  const j = FQ.J.ensure();
  if (!j.log.length) return;
  j.log[j.log.length - 1].evs.push({ ic, line: line.slice(0, 90) });
  FQ.save();
};

/* ---------- towns (§4.5 四键即走) ---------- */
FQ.J.townHTML = function (n) {
  const j = FQ.J.ensure();
  const t = n.town;
  const btns = [];
  if (t.market) btns.push(`<button class="btn ghost sm" onclick="FQ.nav('journeyMarket')">🏪 ${FQ.t("journey.town.market")}</button>`);
  if (t.temple) btns.push(`<button class="btn ghost sm" ${j.templeUsed[n.id] ? "disabled" : ""} onclick="FQ.J.temple()">⛩️ ${FQ.t("journey.town.temple")}</button>`);
  if (t.teahouse) btns.push(`<button class="btn ghost sm" onclick="FQ.J.teahouse()">🍵 ${FQ.t("journey.town.tea")}</button>`);
  if (t.inn) btns.push(`<button class="btn ghost sm" onclick="FQ.J.inn()">🏮 ${FQ.t("journey.town.inn")}</button>`);
  return btns.length ? `<div class="jtown">${btns.join("")}</div>` : "";
};
FQ.J.temple = function () {
  const j = FQ.J.ensure();
  const n = FQ.J.node(j.at);
  if (j.templeUsed[n.id]) return;
  j.templeUsed[n.id] = true;
  const civ = n.town.temple;
  const amount = FQ.J.hasTool(j, "beads") ? 2 : 1;
  j.favor[civ] += amount;
  j.flags.omenBoost = true;
  FQ.save();
  FQ.AU.play("chime");
  FQ.toast(`⛩️ ${FQ.t("journey.temple.done", { n: amount })}`);
  FQ.nav("journey");
};
FQ.J.teahouse = function () {
  const j = FQ.J.ensure();
  if (j.coins < 1) { FQ.toast(FQ.t("tw.coins.short")); return; }
  j.coins--;
  FQ.J.fx([{ op: "forecast" }]);
  FQ.AU.play("buy");
  FQ.toast("🍵 " + FQ.t("journey.tea.done"));
  FQ.nav("journey");
};
FQ.J.inn = function () {
  const j = FQ.J.ensure();
  j.days++;
  delete j.flags.omenBoost;
  FQ.save();
  FQ.toast("🏮 " + FQ.t("journey.inn.done"));
  FQ.nav("journey");
};

/* ---------- market & bag ---------- */
FQ.J.toolStock = { venice: ["compass"], tabriz: ["crystal"], hormuz: ["beads"], hangzhou: ["compass", "crystal", "beads"] };
FQ.SCREENS.journeyMarket = function () {
  const j = FQ.J.ensure();
  const n = FQ.J.node(j.at);
  if (!n.town || !n.town.market) return FQ.nav("journey");
  const prices = FQ.PRICES[n.id] || {};
  const goodsRows = (n.town.market || []).map(gid => {
    const g = FQ.GOODS[gid], p = prices[gid];
    const have = FQ.J.goodsOf(j, gid);
    return `
      <div class="mrow">
        <span style="flex:1">${FQ.art("item-" + gid, g.ic)} ${FQ.bi(g, "zh", "en")} ${have ? `<span class="dim small">×${have.n}</span>` : ""}</span>
        <button class="btn ghost sm" ${j.coins < p.b ? "disabled" : ""} onclick="FQ.J.buyGoods('${gid}')">${FQ.t("journey.buy")} ${p.b}💰</button>
        <button class="btn ghost sm" ${have ? "" : "disabled"} onclick="FQ.J.sellGoods('${gid}')">${FQ.t("journey.sell")} ${p.s}💰</button>
      </div>`;
  }).join("");
  const tools = (FQ.J.toolStock[n.id] || []).filter(tid => !FQ.J.hasTool(j, tid)).map(tid => {
    const t = FQ.TOOLS[tid];
    return `
      <div class="mrow">
        <span style="flex:1">${FQ.art("item-" + tid, t.ic)} ${FQ.bi(t, "zh", "en")} <span class="dim small">${FQ.bi(t, "dZh", "dEn")}</span></span>
        <button class="btn ghost sm" ${j.coins < t.cost ? "disabled" : ""} onclick="FQ.J.buyTool('${tid}')">${t.cost}💰</button>
      </div>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    <button class="back" onclick="FQ.nav('journey')">← ${FQ.bi(n, "zh", "en")}</button>
    <h2>🏪 ${FQ.t("journey.town.market")} · ${FQ.bi(n, "zh", "en")}</h2>
    <div class="jres"><span class="pill">💰 <b>${j.coins}</b></span>
      <span class="pill">🎒 <b>${FQ.J.bagCount(j)}</b>/${FQ.J.chapter().bagSlots}</span></div>
    <div class="panel">${goodsRows || `<span class="dim small">—</span>`}</div>
    ${tools ? `<div class="panel"><h3 class="small gold">${FQ.t("journey.market.tools")}</h3>${tools}</div>` : ""}
    <p class="dim small">${FQ.t("journey.market.tip")}</p>`;
};
FQ.J.buyGoods = function (gid) {
  const j = FQ.J.ensure();
  const p = FQ.PRICES[j.at][gid];
  if (!p || j.coins < p.b) return;
  const have = FQ.J.goodsOf(j, gid);
  if (!have && FQ.J.bagCount(j) >= FQ.J.chapter().bagSlots) { FQ.toast(FQ.t("journey.bag.full")); return; }
  j.coins -= p.b;
  FQ.J.fx([{ op: "goods", id: gid, v: 1 }]);
  FQ.AU.play("buy");
  FQ.nav("journeyMarket");
};
FQ.J.sellGoods = function (gid) {
  const j = FQ.J.ensure();
  const have = FQ.J.goodsOf(j, gid);
  if (!have) return;
  j.coins += FQ.PRICES[j.at][gid].s;
  have.n--;
  if (have.n <= 0) j.bag.splice(j.bag.indexOf(have), 1);
  FQ.save();
  FQ.AU.play("buy");
  FQ.nav("journeyMarket");
};
FQ.J.buyTool = function (tid) {
  const j = FQ.J.ensure();
  const t = FQ.TOOLS[tid];
  if (j.coins < t.cost) return;
  if (FQ.J.bagCount(j) >= FQ.J.chapter().bagSlots) { FQ.toast(FQ.t("journey.bag.full")); return; }
  j.coins -= t.cost;
  j.bag.push({ kind: "tool", id: tid });
  FQ.save();
  FQ.AU.play("buy");
  FQ.toast(`${t.ic} ${FQ.t("journey.bag.got", { t: FQ.bi(t, "zh", "en") })}`);
  FQ.nav("journeyMarket");
};
FQ.SCREENS.journeyBag = function () {
  const j = FQ.J.ensure();
  const ch = FQ.J.chapter();
  const slots = Array.from({ length: ch.bagSlots }, (_, i) => {
    const it = j.bag[i];
    if (!it) return `<div class="bagslot empty">·</div>`;
    const data = it.kind === "tool" ? FQ.TOOLS[it.id] : it.kind === "token" ? FQ.TOKENS[it.id] : FQ.GOODS[it.id];
    const sub = it.kind === "goods" ? `×${it.n}` : it.kind === "tool" ? FQ.bi(data, "dZh", "dEn") : FQ.t("journey.bag.token");
    return `<div class="bagslot k-${it.kind}"><div class="bs-ic">${FQ.art("item-" + it.id, data.ic, "big")}</div>
      <div class="bs-n">${FQ.bi(data, "zh", "en")}</div><div class="bs-s dim">${sub}</div></div>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    <button class="back" onclick="FQ.nav('journey')">←</button>
    <h2>🎒 ${FQ.t("journey.bag")}</h2>
    <p class="dim small">${FQ.t("journey.bag.tip")}</p>
    <div class="baggrid">${slots}</div>`;
};

/* ---------- journal (§4.6 行者日志) ---------- */
FQ.SCREENS.journeyLog = function () {
  const j = FQ.J.ensure();
  const pages = j.log.map((L, i) => {
    const a = FQ.J.node(L.a), b = FQ.J.node(L.b);
    const KIND = { land: { zh: "陆", en: "overland" }, sea: { zh: "海", en: "sea" }, river: { zh: "河", en: "river" } };
    const head = FQ.tpl(FQ.JOURNAL_T.depart, { d: L.d + 1, a: FQ.bi(a, "zh", "en"), b: FQ.bi(b, "zh", "en"), k: FQ.bi(KIND[L.k], "zh", "en") });
    const wx = FQ.bi(FQ.JOURNAL_T.wx[L.wx] || FQ.JOURNAL_T.wx.clear, "zh", "en");
    const arr = FQ.tpl(FQ.JOURNAL_T.arrive, { n: L.n, b: FQ.bi(b, "zh", "en") });
    const evs = (L.evs || []).map(e => `<div class="jlev">${e.ic} ${FQ.esc(e.line)}</div>`).join("");
    return `
      <div class="panel jlpage" style="animation-delay:${i * 60}ms">
        <div class="jlday">${FQ.t("journey.log.page", { n: i + 1 })} · 📅 ${L.d + 1}–${L.d + L.n}</div>
        <div class="jltext">${head} ${wx} ${arr}</div>
        ${evs}
      </div>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    <button class="back" onclick="FQ.nav('journey')">←</button>
    <h2>📜 ${FQ.t("journey.log")}</h2>
    <p class="dim small">${FQ.t("journey.log.tip")}</p>
    ${pages || `<div class="panel dim center">${FQ.t("journey.log.empty")}</div>`}
    ${j.log.length ? `<button class="btn ghost block" onclick="FQ.J.shareLog()">📋 ${FQ.t("journey.log.share")}</button>` : ""}`;
};
FQ.J.shareLog = function () {
  const j = FQ.J.ensure();
  const lines = [FQ.t("journey.name") + " · " + FQ.bi(FQ.J.chapter(), "nameZh", "nameEn")];
  j.log.forEach((L, i) => {
    const a = FQ.J.node(L.a), b = FQ.J.node(L.b);
    lines.push(`${i + 1}. D${L.d + 1} ${FQ.bi(a, "zh", "en")} → ${FQ.bi(b, "zh", "en")} ${FQ.WX_ICON[L.wx]}${(L.evs || []).length ? " · " + L.evs.map(e => e.ic).join("") : ""}`);
  });
  const text = lines.join("\n");
  try { navigator.clipboard.writeText(text); FQ.toast("📋 " + FQ.t("journey.log.copied")); }
  catch (e) { FQ.toast(text.slice(0, 60)); }
};

/* ---------- case 2.0 (§6) ---------- */
FQ.J.startCase = function () {
  const j = FQ.J.ensure();
  if (!j.caseState) {
    const C = FQ.J.chapter().case;
    j.caseState = { clues: [], fu: [], tags: C.freeClue.tags.slice(), testi: [], concluded: false };
    FQ.save();
  }
  FQ.J.renderCase();
};
FQ.J.caseTagHTML = function (tags) {
  return `<span class="ctags">${tags.map(t => `<i>${t}</i>`).join("")}</span>`;
};
FQ.J.renderCase = function () {
  const j = FQ.J.ensure();
  const C = FQ.J.chapter().case;
  const cs = j.caseState;
  const panel = document.getElementById("jpanel");
  const fav = FQ.J.favorTotal(j);

  const clueBlocks = [`
    <div class="reading"><b class="gold">${C.freeClue.ic} ${FQ.bi(C.freeClue, "zh", "en")}</b>${FQ.J.caseTagHTML(C.freeClue.tags)}<br>
      ${FQ.bi(C.freeClue, "cZh", "cEn")}</div>`];
  cs.clues.forEach(id => {
    const m = C.methods.find(x => x.id === id);
    clueBlocks.push(`
      <div class="reading"><b class="gold">${m.ic} ${FQ.t(m.id + ".name")}</b>${FQ.J.caseTagHTML(m.tags)}<br>${FQ.bi(m, "cZh", "cEn")}
      ${cs.fu.includes(id)
        ? `<div class="cfu">↳ ${FQ.bi(m, "fuZh", "fuEn")}${FQ.J.caseTagHTML(m.fuTags)}</div>`
        : fav > 0 && !cs.concluded
          ? `<div><button class="btn ghost sm" onclick="FQ.J.followUp('${id}')">🕯️ ${FQ.t("journey.case.fu")}（−1 🕯️）</button></div>`
          : ""}</div>`);
  });
  cs.testi.forEach(k => {
    const t = C.testimony[k];
    const c = FQ.COMPANIONS[k];
    clueBlocks.push(`
      <div class="reading testi"><b class="gold">${t.ic} ${FQ.bi(c, "zh", "en")} · ${FQ.bi(c, "biasZh", "biasEn")}</b>${FQ.J.caseTagHTML(t.tags)}<br>${FQ.bi(t, "cZh", "cEn")}</div>`);
  });

  let action = "";
  if (!cs.concluded) {
    if (cs.clues.length < 3) {
      action = `
        <p class="small gold">${FQ.t("journey.case.pick")}（${cs.clues.length}/3）</p>
        <div class="jmethods">${C.methods.filter(m => !cs.clues.includes(m.id)).map(m => `
          <button class="btn ghost sm" onclick="FQ.J.pickClue('${m.id}')">${m.ic} ${FQ.t(m.id + ".name")}</button>`).join("")}</div>`;
    } else {
      const testiBtns = Object.keys(C.testimony).filter(k => j.comp[k].on && !cs.testi.includes(k) && j.comp[k].fav >= C.testimony[k].needFavor)
        .map(k => `<button class="btn ghost sm" onclick="FQ.J.hearTestimony('${k}')">${FQ.COMPANIONS[k].ic} ${FQ.t("journey.case.testi", { t: FQ.bi(FQ.COMPANIONS[k], "zh", "en") })}</button>`).join("");
      const opts = C.options.map((o, i) => {
        const met = o.req.filter(t => cs.tags.includes(t));
        const ok = met.length >= 2;
        return `
          <button class="btn ghost block copt" ${ok ? "" : "disabled"} style="margin-top:8px" onclick="FQ.J.conclude(${i})">
            ${FQ.bi(o, "zh", "en")}<br>
            <span class="dim small">${ok ? "✓ " + met.join(" · ") : FQ.t("journey.case.need")}</span>
          </button>`;
      }).join("");
      action = `
        ${testiBtns ? `<div class="jmethods" style="margin-top:8px">${testiBtns}</div>` : ""}
        <p class="small gold" style="margin-top:10px">${FQ.t("journey.case.conclude")}：</p>
        <div class="dim small">${FQ.t("journey.case.tags")}: ${cs.tags.map(t => `「${t}」`).join(" ")}</div>
        ${opts}`;
    }
  }
  panel.innerHTML = `
    <div class="panel jnode-panel" style="--rc:${FQ.JOURNEY_REGIONS.mazu.color}">
      <h3>❖ ${FQ.bi(C, "titleZh", "titleEn")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.bi(C, "introZh", "introEn")}</div>
      ${clueBlocks.join("")}${action}
    </div>`;
};
FQ.J.pickClue = function (id) {
  const j = FQ.J.ensure();
  const cs = j.caseState;
  if (cs.clues.length >= 3 || cs.clues.includes(id)) return;
  cs.clues.push(id);
  const m = FQ.J.chapter().case.methods.find(x => x.id === id);
  m.tags.forEach(t => { if (!cs.tags.includes(t)) cs.tags.push(t); });
  FQ.save();
  FQ.AU.play("card");
  FQ.J.renderCase();
};
FQ.J.followUp = function (id) {
  const j = FQ.J.ensure();
  const cs = j.caseState;
  if (cs.fu.includes(id)) return;
  /* costs 1 favor from the richest civ (§6 追问) */
  const civs = Object.keys(j.favor).sort((a, b) => j.favor[b] - j.favor[a]);
  if (j.favor[civs[0]] <= 0) { FQ.toast(FQ.t("journey.case.nofavor")); return; }
  j.favor[civs[0]]--;
  cs.fu.push(id);
  const m = FQ.J.chapter().case.methods.find(x => x.id === id);
  m.fuTags.forEach(t => { if (!cs.tags.includes(t)) cs.tags.push(t); });
  FQ.save();
  FQ.AU.play("chime");
  FQ.J.renderCase();
};
FQ.J.hearTestimony = function (k) {
  const j = FQ.J.ensure();
  const cs = j.caseState;
  if (cs.testi.includes(k)) return;
  cs.testi.push(k);
  FQ.J.chapter().case.testimony[k].tags.forEach(t => { if (!cs.tags.includes(t)) cs.tags.push(t); });
  FQ.save();
  FQ.AU.play("flip");
  FQ.J.renderCase();
};
FQ.J.conclude = function (i) {
  const j = FQ.J.ensure();
  const ch = FQ.J.chapter();
  const C = ch.case;
  const o = C.options[i];
  const cs = j.caseState;
  cs.concluded = true;
  j.ending = o.id;
  const par = j.days <= ch.parDays;
  const bonus = 20 + o.score * 10 + FQ.J.favorTotal(j) + j.coins + (par ? 15 : 0);
  const dust = 3 + o.score * 2 + Math.floor(FQ.J.favorTotal(j) / 2) + (par ? 3 : 0);
  if (!j.completed.includes(j.ch)) j.completed.push(j.ch);
  FQ.save();
  document.getElementById("jpanel").innerHTML = `
    <div class="panel jnode-panel result" style="--rc:var(--gold)">
      <div class="lotgrade">「${FQ.lang === "zh" ? o.grade : o.gradeEn}」</div>
      <h3>${FQ.bi(o, "zh", "en")}</h3>
      <div class="reading">${FQ.bi(o, "endZh", "endEn")}</div>
      <div class="jres" style="margin-top:10px">
        <span class="pill">📅 ${j.days}/${ch.parDays}${par ? " ✓" : ""}</span>
        <span class="pill dust">✨ +${dust}</span>
        <span class="pill">${FQ.t("xp.gain", { n: bonus })}</span>
      </div>
      <div class="xp-note">${FQ.t("journey.done")}</div>
      <div class="center" style="margin-top:10px">
        <button class="btn ghost sm" onclick="FQ.J.replay()">${FQ.t("journey.replay")}</button>
        <button class="btn sm" onclick="FQ.nav('journeyLog')">📜 ${FQ.t("journey.log")}</button>
      </div>
    </div>`;
  FQ.gainDust(dust, true);
  FQ.recordReading("journey", bonus);
  if (o.score === 3) FQ.confetti();
  FQ.checkAchievements();
};
FQ.J.replay = function () {
  const keep = { completed: FQ.state.journey.completed, roadsTaken: FQ.state.journey.roadsTaken };
  FQ.state.journey = null;
  FQ.save();
  const j = FQ.J.ensure();
  j.completed = keep.completed;
  j.roadsTaken = keep.roadsTaken;
  FQ.save();
  FQ.nav("journey");
};
