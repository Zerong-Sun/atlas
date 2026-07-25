/* v3 travel — pick route/transport, resolve road event, arrive */
window.FQ = window.FQ || {};

FQ.TRAVEL = {};

FQ.TRAVEL.open = function () {
  const w = FQ.ensureWorld();
  const outs = (FQ.DB.routes || []).filter(r =>
    (r.from === w.at || r.to === w.at) && w.unlockedRoutes.includes(r.id));
  if (!outs.length) {
    FQ.toast(FQ.lang === "zh" ? "尚无已解锁出路——先探索打听" : "No unlocked roads — explore first");
    return FQ.CITY.renderHub();
  }
  const rows = outs.map(r => {
    const dest = r.from === w.at ? r.to : r.from;
    const city = FQ.DB.city[dest];
    const risk = FQ.effectiveRouteRisk ? FQ.effectiveRouteRisk(r) : r.risk;
    const riskNote = risk !== r.risk ? ` →${risk}` : "";
    return `<button class="btn ghost block" style="margin-top:6px" onclick="FQ.TRAVEL.pickRoute('${r.id}','${dest}')">
      → ${city ? FQ.T(city.name) : dest} · ${r.days}d · risk ${r.risk}${riskNote}</button>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "出路" : "Roads"}</h2>
      ${rows}
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button>
    </div>`;
};

FQ.TRAVEL.pickRoute = function (routeId, destId) {
  const r = FQ.DB.route[routeId];
  const modes = (r.modes || []).map(mid => {
    const t = FQ.DB.transport[mid];
    if (!t) return "";
    const days = Math.max(1, Math.round(r.days * (t.dayMul || 1)));
    const need = (t.needs || []).length ? ` 🔒${t.needs.join(",")}` : "";
    return `<button class="btn ghost block" style="margin-top:6px" onclick="FQ.TRAVEL.go('${routeId}','${destId}','${mid}')">
      ${FQ.T(t.name)} · ${days}d · ${t.cost || 0}💰${need}</button>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "交通" : "Transport"}</h2>
      ${modes}
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.TRAVEL.open()">←</button>
    </div>`;
};

FQ.TRAVEL.go = function (routeId, destId, modeId) {
  const r = FQ.DB.route[routeId];
  const t = FQ.DB.transport[modeId];
  const w = FQ.ensureWorld();
  const needs = t.needs || [];
  const hasNeed = id => w.bag.some(b => b.id === id || b.id === id + "-silk");
  if (needs.length && !needs.every(hasNeed)) {
    FQ.toast(FQ.lang === "zh" ? "缺少通行之物：" + needs.join(",") : "Missing: " + needs.join(","));
    return;
  }
  const dayMod = ((w.routeMods && w.routeMods[routeId] && w.routeMods[routeId].days) || 0)
    + ((w.routeMods && w.routeMods._global && w.routeMods._global.days) || 0);
  const days = Math.max(1, Math.round(r.days * (t.dayMul || 1)) + dayMod);
  const cost = (t.cost || 0) + (r.cost || 0);
  if (w.coins < cost) { FQ.toast(FQ.lang === "zh" ? "盘缠不足" : "Not enough coin"); return; }
  FQ.applyEffects([{ op: "coins", value: -cost }, { op: "days", value: days }]);

  const pool = (r.encounters || []).map(id => FQ.DB.event[id]).filter(Boolean);
  const generic = (FQ.DB.events || []).filter(e => e.kind === "road" && /^ev-road-(bandits|storm|caravan)$/.test(e.id));
  const candidates = pool.length ? pool : generic;
  /* Higher effective risk → slightly likelier to keep a hostile-flavoured encounter when pool mixed */
  const risk = FQ.effectiveRouteRisk ? FQ.effectiveRouteRisk(r) : (r.risk || 0);
  let enc = null;
  if (candidates.length) {
    enc = candidates[Math.floor(Math.random() * candidates.length)];
    if (risk >= 4 && Math.random() < 0.35) {
      const harsh = candidates.find(e => /bandit|storm|沙|盗|风暴/i.test(FQ.T(e.title) + FQ.T(e.body)));
      if (harsh) enc = harsh;
    }
  }

  FQ.TRAVEL._pending = { routeId, destId, encId: enc && enc.id };
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "在路上…" : "On the road…"}</h2>
      <p class="dim">${FQ.T(t.name)} · ${days}${FQ.lang === "zh" ? "日" : " days"} · risk ${risk}</p>
      <p>${FQ.lang === "zh" ? "驼铃与尘土（动画占位）" : "Bells and dust (animation placeholder)"}</p>
      <button class="btn block" onclick="FQ.TRAVEL.resolveEncounter()">${FQ.lang === "zh" ? "继续" : "Continue"}</button>
    </div>`;
};

FQ.TRAVEL.resolveEncounter = function () {
  const p = FQ.TRAVEL._pending;
  if (!p || !p.encId) return FQ.TRAVEL.arrive();
  const ev = FQ.DB.event[p.encId];
  if (!ev) return FQ.TRAVEL.arrive();
  const choices = (ev.choices || []).map((ch, i) =>
    `<button class="btn ghost block" style="margin-top:6px" onclick="FQ.TRAVEL.encPick(${i})">${FQ.T(ch.label)}</button>`
  ).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2>${FQ.T(ev.title)}</h2>
      <p>${FQ.T(ev.body)}</p>
      ${choices}
    </div>`;
};

FQ.TRAVEL.encPick = function (idx) {
  const p = FQ.TRAVEL._pending;
  const ev = FQ.DB.event[p.encId];
  const ch = ev.choices[idx];
  if (ch.divination) {
    FQ.RITUAL.begin({
      divId: ch.divination,
      title: FQ.T(ch.label),
      onDone(pass) {
        const branch = pass ? ch.pass : ch.fail;
        FQ.applyEffects(branch ? branch.effects : [], { routeId: p.routeId });
        FQ.worldNote("🐪", FQ.T(ev.title) + (pass ? " · 吉" : " · 凶"));
        FQ.TRAVEL.arrive();
      }
    });
    return;
  }
  FQ.applyEffects(ch.effects || [], { routeId: p.routeId });
  FQ.worldNote("🐪", FQ.T(ev.title));
  FQ.TRAVEL.arrive();
};

FQ.TRAVEL.arrive = function () {
  const p = FQ.TRAVEL._pending;
  const w = FQ.ensureWorld();
  if (p && p.destId) {
    w.at = p.destId;
    if (!w.visited.includes(p.destId)) w.visited.push(p.destId);
    if (!w.unlockedCities.includes(p.destId)) w.unlockedCities.push(p.destId);
    /* Keep the traveled route unlocked; do NOT auto-unlock sibling corridor edges
       (fog must come from revealMap / unlockRoute / explore). */
    if (p.routeId && !w.unlockedRoutes.includes(p.routeId)) w.unlockedRoutes.push(p.routeId);
    FQ.worldNote("🏙", FQ.lang === "zh" ? "抵达 " + FQ.T(FQ.DB.city[p.destId].name) : "Arrived at " + FQ.T(FQ.DB.city[p.destId].name));
  }
  FQ.TRAVEL._pending = null;
  FQ.save();
  FQ.CITY.renderHub();
};
