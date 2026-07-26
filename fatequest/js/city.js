/* v3 city explore — events from events.json */
window.FQ = window.FQ || {};

FQ.CITY = {};

FQ.SCREENS.world = function () {
  FQ.loadTables().then(() => {
    const w = FQ.ensureWorld();
    if (!w.at || !w.archetype) { FQ.nav("chargen"); return; }
    if (w.stopped) { FQ.CITY.showEnding(); return; }
    if (FQ.DB && w.at && !FQ.DB.city[w.at]) {
      FQ.toast(FQ.lang === "zh" ? "存档位置无效，重新开局" : "Save position invalid");
      FQ.state.world = null;
      FQ.save();
      FQ.nav("chargen");
      return;
    }
    FQ.CITY.renderHub();
  }).catch(err => {
    document.getElementById("app").innerHTML = `<div class="panel"><p>${FQ.esc(String(err))}</p>
      <p class="dim small">${FQ.lang === "zh" ? "请用本地静态服务器打开（勿用 file://）" : "Serve over http, not file://"}</p></div>`;
  });
};

FQ.CITY.hud = function () {
  const w = FQ.ensureWorld();
  const city = FQ.DB.city[w.at];
  return `
    ${FQ.hudHTML()}
    <div class="panel" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <span class="pill">📍 <b>${city ? FQ.T(city.name) : w.at}</b></span>
      <span class="pill">💰 ${w.coins}</span>
      <span class="pill">📅 ${w.days}d</span>
      <span class="pill">🎒 ${w.bag.length}/${w.bagSlots}</span>
      <button class="pill skillbtn" onclick="FQ.CITY.openMap()">${FQ.lang === "zh" ? "舆图" : "Map"}</button>
      <button class="pill skillbtn" onclick="FQ.CITY.openBag()">${FQ.lang === "zh" ? "行囊" : "Bag"}</button>
      <button class="pill skillbtn" onclick="FQ.CITY.stopWrite()">${FQ.lang === "zh" ? "停笔" : "Stop"}</button>
    </div>`;
};

FQ.CITY.renderHub = function () {
  const w = FQ.ensureWorld();
  const city = FQ.DB.city[w.at];
  if (!city) {
    document.getElementById("app").innerHTML = FQ.CITY.hud() + `<div class="panel"><p>Unknown city ${FQ.esc(w.at)}</p></div>`;
    return;
  }
  const entryDone = !!w.flags["entry:" + city.id];
  const sites = (city.sites || []).map(sid => {
    const ev = FQ.DB.event[sid];
    const ic = FQ.exploreArt(city.id, sid, null, "inline");
    return `<button class="btn ghost block" style="margin-top:6px" onclick="FQ.CITY.runEvent('${sid}')">
      <span class="explore-ic">${ic}</span>${ev ? FQ.T(ev.title) : sid}</button>`;
  }).join("");
  const mentorBtn = city.mentor
    ? `<button class="btn ghost block" style="margin-top:6px" onclick="FQ.CITY.meetMentor('${city.mentor}')">${FQ.lang === "zh" ? "拜访导师" : "Mentor"}</button>`
    : "";
  const marketIc = FQ.exploreArt(city.id, "market", "🧺", "inline");
  const shrineIc = FQ.exploreArt(city.id, "faith", "🕌", "inline");
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      ${FQ.cityEntryArt(city.id, "full")}
      <h2>${FQ.T(city.name)}</h2>
      <p class="dim small">${FQ.cultureArt(city.culture, "inline")} ${city.band} · ${city.culture}</p>
      ${!entryDone
        ? `<button class="btn block" onclick="FQ.CITY.runEvent('${city.entryEvent}')">${FQ.lang === "zh" ? "入城见闻" : "Arrival"}</button>`
        : `<p class="dim small">${FQ.lang === "zh" ? "已入城" : "Arrived"}</p>`}
      <div style="margin-top:12px"><b>${FQ.lang === "zh" ? "探索" : "Explore"}</b>${sites || "<p class='dim'>（序章城无满配探索点）</p>"}</div>
      <button class="btn ghost block" style="margin-top:6px" onclick="FQ.CITY.openMarket()"><span class="explore-ic">${marketIc}</span>${FQ.lang === "zh" ? "市集" : "Market"}</button>
      <button class="btn ghost block" style="margin-top:6px" onclick="FQ.CITY.openShrine()"><span class="explore-ic">${shrineIc}</span>${FQ.lang === "zh" ? "信仰场所" : "Shrine"}</button>
      ${mentorBtn}
      <button class="btn block" style="margin-top:14px" onclick="FQ.TRAVEL.open()">${FQ.lang === "zh" ? "选择出路 →" : "Choose a road →"}</button>
    </div>`;
};

FQ.CITY.runEvent = function (id) {
  const ev = FQ.DB.event[id];
  if (!ev) { FQ.toast("missing event"); return; }
  const w = FQ.ensureWorld();
  const hero = ev.kind === "entry"
    ? FQ.cityEntryArt(w.at, "full")
    : `<div class="center" style="margin-bottom:8px">${FQ.exploreArt(w.at, id, null, "big")}</div>`;
  const choices = (ev.choices || []).map((ch, i) => {
    const need = ch.needs;
    let disabled = false;
    if (need && need.language && !w.languages.includes(need.language)) disabled = true;
    return `<button class="btn ghost block" style="margin-top:6px" ${disabled ? "disabled" : ""}
      onclick="FQ.CITY.pickChoice('${id}',${i})">${FQ.T(ch.label)}</button>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      ${hero}
      <h2>${FQ.T(ev.title)}</h2>
      <p>${FQ.T(ev.body)}</p>
      ${choices}
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button>
    </div>`;
};

FQ.CITY.pickChoice = function (eid, idx) {
  const ev = FQ.DB.event[eid];
  const ch = ev.choices[idx];
  const w = FQ.ensureWorld();

  const finish = (result, ctx) => {
    if (!result.ok) {
      FQ.toast(result.blocked === "bag_full"
        ? (FQ.lang === "zh" ? "行囊已满" : "Bag full")
        : (FQ.lang === "zh" ? "无法执行" : "Cannot apply"));
      return;
    }
    const summary = result.summary || [];
    if (ev.kind === "entry") w.flags["entry:" + w.at] = true;
    if (!w.visited.includes(w.at)) w.visited.push(w.at);
    FQ.worldNote("·", FQ.T(ev.title) + (summary.length ? " · " + summary.join(" ") : ""));
    FQ.save();
    if (ctx.goto) {
      if (ctx.goto === "mentor") {
        const city = FQ.DB.city[w.at];
        if (city && city.mentor) return FQ.CITY.meetMentor(city.mentor);
      } else if (String(ctx.goto).startsWith("event:")) {
        return FQ.CITY.runEvent(String(ctx.goto).slice(6));
      } else if (FQ.DB.event[ctx.goto]) {
        return FQ.CITY.runEvent(ctx.goto);
      }
    }
    document.getElementById("app").innerHTML = `
      ${FQ.CITY.hud()}
      <div class="panel">
        <h2>${FQ.T(ch.label)}</h2>
        <p class="dim">${summary.join(" · ") || (FQ.lang === "zh" ? "无事发生" : "Nothing marked")}</p>
        <button class="btn block" onclick="FQ.CITY.renderHub()">${FQ.lang === "zh" ? "继续" : "Continue"}</button>
      </div>`;
  };

  if (ch.divination) {
    FQ.RITUAL.begin({
      divId: ch.divination,
      title: FQ.T(ch.label),
      onDone(pass, cast) {
        const ctx = {};
        const branch = pass ? ch.pass : ch.fail;
        if (branch && branch.text) FQ.toast(FQ.T(branch.text));
        const result = FQ.applyEffects(branch ? branch.effects : [], ctx);
        finish(result, ctx);
      }
    });
    return;
  }
  const ctx = {};
  const result = FQ.applyEffects(ch.effects || [], ctx);
  finish(result, ctx);
};

FQ.CITY.openMarket = function () {
  const w = FQ.ensureWorld();
  const city = FQ.DB.city[w.at];
  const goods = (city.market && city.market.goods) || [];
  const rows = goods.map(gid => {
    const g = FQ.DB.good[gid];
    const price = 6 + (gid.length % 5);
    const ic = typeof FQ.goodsArt === "function" ? FQ.goodsArt(gid, "📦", "inline") : "📦";
    return `<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0">
      <span>${ic} ${g ? FQ.T(g.name) : gid}</span>
      <button class="btn ghost sm" onclick="FQ.CITY.buy('${gid}',${price})">${price}💰</button>
    </div>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2><span class="explore-ic">${FQ.exploreArt(city.id, "market", "🧺", "inline")}</span>${FQ.lang === "zh" ? "市集" : "Market"}</h2>
      ${rows || "<p class='dim'>—</p>"}
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button>
    </div>`;
};

FQ.CITY.buy = function (gid, price) {
  const w = FQ.ensureWorld();
  if (w.coins < price) { FQ.toast(FQ.lang === "zh" ? "银两不足" : "Not enough coin"); return; }
  const slot = w.bag.find(b => b.kind === "goods" && b.id === gid);
  if (!slot && w.bag.length >= w.bagSlots) {
    FQ.toast(FQ.lang === "zh" ? "行囊已满" : "Bag full");
    return;
  }
  const res = FQ.applyEffects([{ op: "coins", value: -price }, { op: "goods", id: gid, value: 1 }]);
  if (!res.ok) {
    FQ.toast(FQ.lang === "zh" ? "无法购入" : "Cannot buy");
    return;
  }
  FQ.toast(FQ.lang === "zh" ? "购入" : "Bought");
  FQ.CITY.openMarket();
};

FQ.CITY.openShrine = function () {
  const w = FQ.ensureWorld();
  const city = FQ.DB.city[w.at];
  const faith = city.shrine && city.shrine.faith;
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2><span class="explore-ic">${FQ.exploreArt(city.id, "faith", "🕌", "inline")}</span>${FQ.lang === "zh" ? "信仰场所" : "Shrine"}</h2>
      <p class="dim">${faith ? FQ.faithArt(faith, "inline") + " " + faith : "—"}</p>
      <button class="btn block" onclick="FQ.CITY.bless()">${FQ.lang === "zh" ? "祈福（−1💰）" : "Bless (−1)"}</button>
      ${faith ? `<button class="btn ghost block" style="margin-top:6px" onclick="FQ.CITY.convertFaith('${faith}')">${FQ.lang === "zh" ? "依从本地信仰" : "Adopt local faith"}</button>` : ""}
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button>
    </div>`;
};

FQ.CITY.bless = function () {
  const w = FQ.ensureWorld();
  if (w.coins < 1) { FQ.toast(FQ.lang === "zh" ? "银两不足" : "Not enough coin"); return; }
  FQ.applyEffects([{ op: "fate", stat: "rapport", value: 1 }, { op: "coins", value: -1 }]);
  FQ.toast(FQ.lang === "zh" ? "祈福" : "Blessed");
  FQ.CITY.renderHub();
};

FQ.CITY.convertFaith = function (faith) {
  const w = FQ.ensureWorld();
  if (w.faith === faith) { FQ.toast(FQ.lang === "zh" ? "已是此信仰" : "Already this faith"); return; }
  FQ.applyEffects([{ op: "faith", value: faith }]);
  FQ.toast(FQ.lang === "zh" ? "身份已改" : "Faith changed");
  FQ.CITY.renderHub();
};

FQ.CITY.meetMentor = function (rid) {
  const r = FQ.DB.retainer[rid];
  const div = (FQ.DB.divinations || []).find(d => d.teacher === rid);
  const w = FQ.ensureWorld();
  const already = div && (
    w.learned.includes(div.id) || w.learned.includes("jiaobei") && div.id === "lot" ||
    w.learned.includes("lot") && div.id === "jiaobei" ||
    (FQ.state.learned || []).includes(div.id) ||
    (FQ.state.learned || []).includes("jiaobei") && div.id === "lot"
  );
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <div class="mentor-face">${FQ.mentorArt(rid, div && div.id, "🧙", "big")}</div>
      <h2>${r ? FQ.T(r.name) : rid}</h2>
      <p class="dim">${r ? FQ.T(r.omen) : ""}</p>
      ${div && !already
        ? `<button class="btn block" onclick="FQ.CITY.learn('${div.id}','${rid}')">${FQ.lang === "zh" ? "请教学艺 · " : "Learn · "}${FQ.T(div.name)}</button>`
        : `<p class="dim">${already ? (FQ.lang === "zh" ? "已学" : "Already learned") : (FQ.lang === "zh" ? "此处无可学 MVP 占法" : "No MVP art here")}</p>`}
      <button class="btn ghost block" style="margin-top:8px" onclick="FQ.applyEffects([{op:'recruit',value:'${rid}'}]);FQ.toast('${FQ.lang === "zh" ? "同行" : "Joined"}');FQ.CITY.renderHub()">
        ${FQ.lang === "zh" ? "请求同行" : "Ask to travel together"}</button>
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button>
    </div>`;
};

FQ.CITY.learn = function (divId, rid) {
  FQ.RITUAL.beginLearn(divId, rid);
};

FQ.CITY.openBag = function () {
  const w = FQ.ensureWorld();
  const rows = w.bag.map(b => {
    const name = b.kind === "goods" && FQ.DB.good[b.id] ? FQ.T(FQ.DB.good[b.id].name) : b.id;
    const ic = b.kind === "goods" && typeof FQ.goodsArt === "function"
      ? FQ.goodsArt(b.id, "📦", "inline")
      : "📦";
    return `<div>${ic} ${name} ×${b.n || 1}</div>`;
  }).join("") || `<p class="dim">${FQ.lang === "zh" ? "空" : "Empty"}</p>`;
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel"><h2>${FQ.lang === "zh" ? "行囊" : "Bag"}</h2>${rows}
      <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button></div>`;
};

FQ.CITY.openMap = function () {
  FQ.nav("worldMap");
};

FQ.CITY.stopWrite = function () {
  FQ.CITY.showEnding(true);
};

FQ.CITY.showEnding = function (forceStop) {
  const w = FQ.ensureWorld();
  const stop = (FQ.DB.endings || []).find(e => e.layer === 1) || FQ.DB.endings[0];
  const hidden = FQ.checkEndings();
  const ending = hidden || stop;
  if (forceStop || !w.endingId) {
    w.stopped = true;
    w.endingId = ending.id;
    FQ.save();
  }
  const shown = (FQ.DB.ending && FQ.DB.ending[w.endingId]) || ending;
  document.getElementById("app").innerHTML = `
    ${FQ.CITY.hud()}
    <div class="panel">
      <h2>${FQ.T(shown.name)}</h2>
      <p>${FQ.renderEpilogue(shown)}</p>
      <button class="btn block" onclick="FQ.nav('title')">${FQ.lang === "zh" ? "回到书案" : "Back to desk"}</button>
      <button class="btn ghost block" style="margin-top:8px" onclick="FQ.state.world=null;FQ.save();FQ.CG.step=0;FQ.CG.redraws=3;FQ.CG.birth=null;FQ.CG.fate=null;FQ.nav('chargen')">
        ${FQ.lang === "zh" ? "新的远行" : "New journey"}</button>
    </div>`;
};

FQ.SCREENS.worldMap = function () {
  FQ.loadTables().then(() => {
    const w = FQ.ensureWorld();
    if (w.stopped) { FQ.CITY.showEnding(); return; }
    const nodes = (FQ.DB.cities || []).filter(c => w.unlockedCities.includes(c.id) || c.id === w.at);
    const dots = nodes.map(c => {
      const here = c.id === w.at;
      return `<button class="pill skillbtn" style="margin:4px${here ? ";outline:2px solid gold" : ""}"
        onclick="FQ.CITY.tapMapCity('${c.id}')">${FQ.T(c.name)}${here ? " ★" : ""}</button>`;
    }).join("");
    const fog = (FQ.DB.cities || []).length - nodes.length;
    const roads = (w.unlockedRoutes || []).map(id => {
      const r = FQ.DB.route[id];
      if (!r) return "";
      return `<div class="dim small">${FQ.T(FQ.DB.city[r.from].name)} → ${FQ.T(FQ.DB.city[r.to].name)}</div>`;
    }).join("");
    document.getElementById("app").innerHTML = `
      ${FQ.CITY.hud()}
      <div class="panel">
        <h2>${FQ.lang === "zh" ? "舆图（雾中）" : "Map (fog)"}</h2>
        <p class="dim small">${FQ.lang === "zh" ? "已显" : "Revealed"} ${nodes.length} · ${FQ.lang === "zh" ? "仍隐" : "Hidden"} ${fog}</p>
        <div>${dots}</div>
        <p class="dim small" style="margin-top:12px">${FQ.lang === "zh" ? "已知路线" : "Known routes"}</p>
        ${roads || "<p class='dim'>—</p>"}
        <button class="btn ghost sm" style="margin-top:12px" onclick="FQ.CITY.renderHub()">←</button>
      </div>`;
  }).catch(err => {
    document.getElementById("app").innerHTML = `<div class="panel"><p>${FQ.esc(String(err))}</p></div>`;
  });
};

FQ.CITY.tapMapCity = function (id) {
  const w = FQ.ensureWorld();
  if (id === w.at) { FQ.CITY.renderHub(); return; }
  if (!w.unlockedCities.includes(id)) { FQ.toast(FQ.lang === "zh" ? "地图未开" : "Still fogged"); return; }
  const route = (FQ.DB.routes || []).find(r =>
    w.unlockedRoutes.includes(r.id) &&
    ((r.from === w.at && r.to === id) || (r.to === w.at && r.from === id)));
  if (route) FQ.TRAVEL.pickRoute(route.id, route.from === w.at ? route.to : route.from);
  else FQ.toast(FQ.lang === "zh" ? "无直达路，请从城内出路走" : "No direct road — use city exits");
};
