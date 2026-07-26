/* v3 character draw — birth, fate bars, archetype, start city */
window.FQ = window.FQ || {};

FQ.FATE_RANKS = [
  { min: 28, zh: "上上", en: "Supreme" },
  { min: 24, zh: "上", en: "High" },
  { min: 20, zh: "中上", en: "Upper Mid" },
  { min: 16, zh: "中", en: "Mid" },
  { min: 12, zh: "中下", en: "Lower Mid" },
  { min: 8, zh: "下", en: "Low" },
  { min: 0, zh: "下下", en: "Lowest" }
];

FQ.rankOf = function (n) {
  for (const r of FQ.FATE_RANKS) if (n >= r.min) return FQ.lang === "en" ? r.en : r.zh;
  return FQ.lang === "en" ? "Lowest" : "下下";
};

FQ.randomBirth = function () {
  const y = 1253 + Math.floor(Math.random() * 200);
  const m = 1 + Math.floor(Math.random() * 12);
  const d = 1 + Math.floor(Math.random() * 28);
  return { y, m, d, iso: y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0") };
};

FQ.randomFate = function () {
  const roll = () => 8 + Math.floor(Math.random() * 20);
  return { travel: roll(), rapport: roll(), wealth: roll() };
};

FQ.CG = { step: 0, redraws: 3, birth: null, fate: null, archId: null };

FQ.SCREENS.chargen = function () {
  FQ.loadTables().then(() => FQ.CG.render()).catch(err => {
    document.getElementById("app").innerHTML = `<div class="panel"><p>数据加载失败：${FQ.esc(String(err))}</p>
      <button class="btn" onclick="FQ.nav('title')">←</button></div>`;
  });
};

FQ.CG.render = function () {
  const step = FQ.CG.step || 0;
  if (step === 0) return FQ.CG.stepBirth();
  if (step === 1) return FQ.CG.stepFate();
  if (step === 2) return FQ.CG.stepArch();
  return FQ.CG.stepStart();
};

FQ.CG.stepBirth = function () {
  if (!FQ.CG.birth) FQ.CG.birth = FQ.randomBirth();
  const b = FQ.CG.birth;
  document.getElementById("app").innerHTML = `
    ${FQ.hudHTML()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "生辰抽取" : "Birth Draw"}</h2>
      <div class="cg-wheel">${FQ.art("fate-wheel", "☯", "big")}</div>
      <p class="dim">${FQ.lang === "zh" ? "1253–1453 年间的一天" : "A day between 1253 and 1453"}</p>
      <div class="center" style="font-size:1.6rem;margin:18px 0">${b.iso}</div>
      <p class="dim small">${FQ.lang === "zh" ? "可重抽" : "Redraws left"}：${FQ.CG.redraws}</p>
      <button class="btn block" ${FQ.CG.redraws <= 0 ? "disabled" : ""} onclick="FQ.CG.redrawBirth()">${FQ.lang === "zh" ? "重抽生辰" : "Redraw"}</button>
      <button class="btn block" style="margin-top:8px" onclick="FQ.CG.step=1;FQ.CG.render()">${FQ.lang === "zh" ? "确认生辰 →" : "Confirm →"}</button>
    </div>`;
};

FQ.CG.redrawBirth = function () {
  if (FQ.CG.redraws <= 0) return;
  FQ.CG.redraws--;
  FQ.CG.birth = FQ.randomBirth();
  FQ.CG.render();
};

FQ.CG.stepFate = function () {
  if (!FQ.CG.fate) FQ.CG.fate = FQ.randomFate();
  const f = FQ.CG.fate;
  const row = (k, zh, en) => {
    const rank = FQ.rankOf(f[k]);
    return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0">
      <span><span class="cg-fate-ic">${FQ.fateBarArt(k, "inline")}</span>${FQ.lang === "zh" ? zh : en}</span>
      <b>${f[k]} · ${FQ.fateRankArt(rank, "inline")} ${rank}</b>
    </div>
    <div class="xpbar"><i style="width:${Math.round(f[k] / 31 * 100)}%"></i></div>`;
  };
  document.getElementById("app").innerHTML = `
    ${FQ.hudHTML()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "命格" : "Fate Bars"}</h2>
      ${row("travel", "远行运", "Travel")}
      ${row("rapport", "交涉运", "Rapport")}
      ${row("wealth", "财货运", "Wealth")}
      <button class="btn block" style="margin-top:16px" onclick="FQ.CG.step=2;FQ.CG.render()">${FQ.lang === "zh" ? "确认命格 →" : "Confirm →"}</button>
    </div>`;
};

FQ.CG.stepArch = function () {
  const list = (FQ.DB.archetypes || []).map(a => `
    <button class="artrow" onclick="FQ.CG.pickArch('${a.id}')">
      <span class="ar-seal">${FQ.cultureArt(a.culture, "big")}</span>
      <span class="ar-txt"><b>${FQ.T(a.name)}</b>
        <span class="dim small">${FQ.faithArt(a.faith, "inline")} ${FQ.T(a.obsession)}</span></span>
    </button>`).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.hudHTML()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "旅行执念" : "Obsession"}</h2>
      <div class="artlist">${list}</div>
    </div>`;
};

FQ.CG.pickArch = function (id) {
  FQ.CG.archId = id;
  FQ.CG.step = 3;
  FQ.CG.render();
};

FQ.CG.stepStart = function () {
  const a = FQ.DB.archetype[FQ.CG.archId];
  const start = a.start;
  const city = FQ.DB.city[start];
  document.getElementById("app").innerHTML = `
    ${FQ.hudHTML()}
    <div class="panel">
      <h2>${FQ.lang === "zh" ? "起点" : "Starting City"}</h2>
      ${FQ.cityEntryArt(start, "full")}
      <p>${FQ.T(city.name)}</p>
      <p class="dim small">${FQ.cultureArt(a.culture, "inline")} ${FQ.faithArt(a.faith, "inline")} · ${FQ.T(a.obsession)}</p>
      <button class="btn block" onclick="FQ.CG.commit()">${FQ.lang === "zh" ? "开始远行" : "Begin the Road"}</button>
    </div>`;
};

FQ.CG.commit = function () {
  const a = FQ.DB.archetype[FQ.CG.archId];
  const w = FQ.ensureWorld();
  w.archetype = a.id;
  w.birth = FQ.CG.birth;
  w.fate = FQ.CG.fate;
  w.culture = a.culture;
  w.faith = a.faith;
  w.name = FQ.T(a.name);
  w.coins = a.startKit.coins;
  w.currency = a.startKit.currency;
  w.languages = (a.startKit.languages || []).slice();
  w.bag = [];
  (a.startKit.goods || []).forEach(id => w.bag.push({ kind: "goods", id, n: 1 }));
  (a.startKit.items || []).forEach(id => w.bag.push({ kind: "item", id, n: 1 }));
  w.at = a.start;
  w.visited = [a.start];
  w.unlockedCities = [a.start];
  w.unlockedRoutes = [];
  w.learned = [];
  w.days = 0;
  w.stopped = false;
  w.endingId = null;
  /* Apply archetype fate modifiers */
  if (a.bonus) {
    Object.keys(a.bonus).forEach(k => {
      if (w.fate[k] != null) w.fate[k] = Math.max(0, Math.min(31, w.fate[k] + a.bonus[k]));
    });
  }
  if (a.malus) {
    Object.keys(a.malus).forEach(k => {
      if (w.fate[k] != null) w.fate[k] = Math.max(0, Math.min(31, w.fate[k] + a.malus[k]));
    });
  }
  /* Seed ONLY direct outbound routes from start — do not reveal destination cities yet (fog).
     Player learns the far end via explore revealMap / unlockRoute. */
  (FQ.DB.routes || []).forEach(r => {
    if (r.from === a.start) {
      if (!w.unlockedRoutes.includes(r.id)) w.unlockedRoutes.push(r.id);
    }
  });
  FQ.worldNote("✦", FQ.lang === "zh" ? "远行开始于 " + FQ.T(FQ.DB.city[a.start].name) : "The road begins at " + FQ.T(FQ.DB.city[a.start].name));
  FQ.save();
  FQ.nav("world");
};
