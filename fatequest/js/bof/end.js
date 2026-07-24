/* 《远行之书》· end — 停笔.
   Layer 1 is always available: any city, any day. Layers 2 and 3 fire when
   their conditions hold at the moment you stop. The epilogue interpolates from
   the save, so it reports the road you actually walked. */
window.BOF = window.BOF || {};
BOF.END = {};

BOF.END.vars = function () {
  const s = BOF.state;
  const city = id => BOF.bi((BOF.DB.city(id) || {}).name);
  const arch = BOF.DB.archetypes[s.who.archetype] || {};
  const richest = s.bag.filter(b => b.kind === "goods")
    .sort((a, b) => (BOF.DB.good(b.id).far[1] || 0) - (BOF.DB.good(a.id).far[1] || 0))[0];
  return {
    cities: s.visitedCities.length,
    routes: s.knownRoutes.length,
    arts: s.learned.length,
    years: Math.max(1, Math.round(s.days / 365.25)),
    start: city(arch.start),
    lastCity: city(s.at),
    faithChanges: s.faithChanges,
    languages: s.languages.length,
    bands: Object.keys(s.rep.band).length,
    faith: s.who.faith,
    richestTrade: richest ? BOF.bi(BOF.DB.good(richest.id).name) : (BOF.lang() === "zh" ? "一船空舱" : "an empty hold"),
    stayed: s.flags["khan-audience"]
      ? (BOF.lang() === "zh" ? "留了下来" : "stayed")
      : (BOF.lang() === "zh" ? "启程回西方" : "turned back west")
  };
};

BOF.END.met = function (e) {
  const s = BOF.state, v = BOF.END.vars(), c = e.conditions || {};
  if (c.visited && !c.visited.every(x => s.visitedCities.includes(x))) return false;
  if (c.flags && !c.flags.every(f => s.flags[f])) return false;
  if (c.cities != null && v.cities < c.cities) return false;
  if (c.routes != null && v.routes < c.routes) return false;
  if (c.bands != null && v.bands < c.bands) return false;
  if (c.languages != null && v.languages < c.languages) return false;
  if (c.faithChanges != null) {
    if (c.faithChanges === 0 ? s.faithChanges !== 0 : s.faithChanges < c.faithChanges) return false;
  }
  if (c.pilgrimages != null && (s.flags.pilgrimageCount || 0) < c.pilgrimages) return false;
  if (c.netWorth != null && BOF.END.worth() < c.netWorth) return false;
  if (c.codexPct != null && s.codex.length / 40 < c.codexPct) return false;
  if (c.reputationForeign != null) {
    const own = BOF.DB.archetypes[s.who.archetype].culture;
    const best = Object.entries(s.rep.city).filter(([id]) => {
      const city = BOF.DB.city(id);
      return city && city.culture !== own;
    }).reduce((m, [, v2]) => Math.max(m, v2), 0);
    if (best < c.reputationForeign) return false;
  }
  if (c.returnedToStart === false) {
    const start = BOF.DB.archetypes[s.who.archetype].start;
    if (s.at === start && s.visitedCities.length > 1) return false;
  }
  return true;
};

BOF.END.worth = function () {
  const s = BOF.state;
  return s.coins + s.bag.filter(b => b.kind === "goods").reduce((n, b) => {
    const g = BOF.DB.good(b.id);
    return n + (g ? (g.far[0] + g.far[1]) / 2 * b.n : 0);
  }, 0);
};

/* which ending you would get if you stopped now */
BOF.END.resolve = function () {
  const all = Object.values(BOF.DB.endings);
  const hits = all.filter(e => e.layer > 1 && BOF.END.met(e))
    .sort((a, b) => b.layer - a.layer);
  return hits[0] || BOF.DB.endings["end-put-down-the-pen"];
};

BOF.END.fill = function (tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
};

BOF.END.offer = function () {
  const zh = BOF.lang() === "zh";
  const e = BOF.END.resolve();
  const ok = confirm(zh
    ? "在此停笔？你的游记会就此写完，存档保留。"
    : "Put down the pen here? Your book is finished as it stands; the save is kept.");
  if (!ok) return;
  BOF.END.finish(e);
};

BOF.END.finish = function (e) {
  const s = BOF.state;
  const vars = BOF.END.vars();
  s.ended = {
    id: e.id, layer: e.layer,
    name: BOF.bi(e.name),
    text: BOF.END.fill(BOF.bi(e.epilogue), vars),
    at: s.at, day: s.days
  };
  if (e.sticker && !s.stickers.includes(e.sticker)) s.stickers.push(e.sticker);
  BOF.note("✦", BOF.bi(e.name));
  BOF.save();
  BOF.UI.go("ending");
};

BOF.UI.SCREENS = BOF.UI.SCREENS || {};
BOF.UI.SCREENS.ending = function () {
  const s = BOF.state;
  const zh = BOF.lang() === "zh";
  if (!s || !s.ended) return BOF.UI.SCREENS.title();
  const v = BOF.END.vars();
  return `
    <div class="end-screen">
      <div class="end-orn">✦ ◆ ✦</div>
      <div class="dim small">${zh ? "第 " + s.ended.layer + " 层结局" : "Layer " + s.ended.layer}</div>
      <h1 class="end-name">${BOF.esc(s.ended.name)}</h1>
      <p class="end-text">${BOF.esc(s.ended.text)}</p>
      <div class="end-stats">
        <div><b>${v.cities}</b><span>${zh ? "座城" : "cities"}</span></div>
        <div><b>${v.routes}</b><span>${zh ? "条路" : "roads"}</span></div>
        <div><b>${v.arts}</b><span>${zh ? "种占法" : "arts"}</span></div>
        <div><b>${v.years}</b><span>${zh ? "年" : "years"}</span></div>
      </div>
      <button class="btn block" onclick="BOF.UI.go('book')">${zh ? "重读行纪" : "Read the journal"}</button>
      <button class="btn ghost block" onclick="BOF.ROLL.begin();BOF.UI.go('roll')">${zh ? "另抽一位行者" : "Draw another traveler"}</button>
    </div>`;
};
