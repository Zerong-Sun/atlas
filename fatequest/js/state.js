/* Gamification: XP, levels, streaks, collection, achievements, stardust — localStorage persisted */
window.FQ = window.FQ || {};

FQ.LEVELS = [0, 60, 160, 320, 560, 900, 1400]; /* xp thresholds per title */

const DEFAULT_STATE = {
  xp: 0, readings: 0,
  lang: null,
  streak: 0, lastDaily: null, lastVisit: null, daysVisited: 0,
  methodsTried: [],
  col: { tarot: [], hex: [], rune: [], len: [] },
  achv: [],
  /* 师承: the arts you have actually been taught (tarot is the starting kit) */
  learned: ["tarot"], lineage: [],
  /* 2.0 — stardust (改运资源, cross-mode, GDD §3.2/§8) */
  stardust: 3, dustDay: null, dustToday: 0,
  mute: false,
  /* 2.0 — tower meta progress (GDD §5.4) */
  tower: { runs: 0, wins: 0, best: 0, resTotal: 0,
           unlockedArch: ["tarot"], unlockedSyms: [], run: null },
  journey: null
};

FQ.load = function () {
  try {
    /* unified key `fatequest`; fall back to legacy `fatequest2` once */
    const raw = localStorage.getItem("fatequest") || localStorage.getItem("fatequest2");
    FQ.state = raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : JSON.parse(JSON.stringify(DEFAULT_STATE));
  } catch (e) { FQ.state = JSON.parse(JSON.stringify(DEFAULT_STATE)); }
  FQ.state.col = Object.assign({ tarot: [], hex: [], rune: [], len: [] }, FQ.state.col);
  if (!Array.isArray(FQ.state.learned) || !FQ.state.learned.length) FQ.state.learned = ["tarot"];
  if (!Array.isArray(FQ.state.lineage)) FQ.state.lineage = [];
  FQ.state.tower = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE.tower)), FQ.state.tower);
  if (FQ.state.lang) FQ.lang = FQ.state.lang;
  else FQ.lang = (navigator.language || "zh").startsWith("zh") ? "zh" : "en";
  /* visit tracking */
  const today = FQ.dayKey();
  if (FQ.state.lastVisit !== today) {
    FQ.state.lastVisit = today;
    FQ.state.daysVisited = (FQ.state.daysVisited || 0) + 1;
  }
  FQ.save();
};
FQ.save = function () {
  try {
    localStorage.setItem("fatequest", JSON.stringify(FQ.state));
    localStorage.removeItem("fatequest2"); /* drop legacy key after migrate */
  } catch (e) {}
};
FQ.reset = function () {
  try {
    localStorage.removeItem("fatequest");
    localStorage.removeItem("fatequest2");
  } catch (e) {}
  FQ.load();
};

FQ.level = function () {
  let lv = 0;
  FQ.LEVELS.forEach((th, i) => { if (FQ.state.xp >= th) lv = i; });
  return lv;
};
FQ.levelTitle = function () {
  const titles = FQ.I18N[FQ.lang].titles;
  return titles[Math.min(FQ.level(), titles.length - 1)];
};
FQ.levelProgress = function () {
  const lv = FQ.level();
  const cur = FQ.LEVELS[lv];
  const next = FQ.LEVELS[lv + 1];
  if (next === undefined) return 1;
  return (FQ.state.xp - cur) / (next - cur);
};

FQ.gainXP = function (n) {
  const before = FQ.level();
  FQ.state.xp += n;
  FQ.save();
  FQ.toast(FQ.t("xp.gain", { n }));
  if (FQ.level() > before) {
    setTimeout(() => {
      FQ.toast("✨ " + FQ.t("levelup", { t: FQ.levelTitle() }));
      FQ.confetti && FQ.confetti();
      FQ.AU && FQ.AU.play("levelup");
    }, 900);
  }
  FQ.renderHUD && FQ.renderHUD();
};

/* ---- stardust 星尘 (GDD §3.2: scarce, cross-mode; never sold) ---- */
FQ.gainDust = function (n, silent) {
  if (n <= 0) return;
  FQ.state.stardust += n;
  FQ.save();
  if (!silent) FQ.toast(FQ.t("dust.gain", { n }));
  FQ.checkAchievements();
  FQ.renderHUD && FQ.renderHUD();
};
FQ.spendDust = function (n) {
  if (FQ.state.stardust < n) { FQ.toast(FQ.t("dust.none")); return false; }
  FQ.state.stardust -= n;
  FQ.save();
  FQ.renderHUD && FQ.renderHUD();
  return true;
};
/* duplicate codex encounters distill a little stardust (cap/day, GDD §8) */
FQ.dustFromDup = function () {
  const today = FQ.dayKey();
  if (FQ.state.dustDay !== today) { FQ.state.dustDay = today; FQ.state.dustToday = 0; }
  if (FQ.state.dustToday >= 5) return;
  FQ.state.dustToday++;
  FQ.gainDust(1, true);
};

FQ.recordReading = function (methodId, xp) {
  FQ.state.readings++;
  if (!FQ.state.methodsTried.includes(methodId)) FQ.state.methodsTried.push(methodId);
  FQ.checkAchievements();
  FQ.gainXP(xp);
};

/* collection — returns true if newly lit; duplicates distill stardust */
FQ.collect = function (kind, key, label) {
  const arr = FQ.state.col[kind];
  if (arr.includes(key)) { FQ.dustFromDup(); return false; }
  arr.push(key);
  FQ.save();
  setTimeout(() => FQ.toast("📖 " + FQ.t("new.item", { t: label })), 450);
  FQ.checkAchievements();
  return true;
};
FQ.colCount = function () {
  const c = FQ.state.col;
  return c.tarot.length + c.hex.length + c.rune.length + (c.len || []).length;
};

/* daily lot */
FQ.dailyAvailable = function () { return FQ.state.lastDaily !== FQ.dayKey(); };
FQ.markDaily = function () {
  const today = FQ.dayKey();
  const y = new Date(); y.setDate(y.getDate() - 1);
  FQ.state.streak = (FQ.state.lastDaily === FQ.dayKey(y)) ? FQ.state.streak + 1 : 1;
  FQ.state.lastDaily = today;
  FQ.save();
  FQ.checkAchievements();
};

/* achievements */
FQ.ACHIEVEMENTS = [
  { id: "first",     ic: "🌱", cond: s => s.readings >= 1 },
  { id: "collector", ic: "📖", cond: s => FQ.colCount() >= 30 },
  { id: "streak7",   ic: "🕯️", cond: s => s.streak >= 7 },
  { id: "all6",      ic: "🧭", cond: s => s.methodsTried.length >= 6 },
  { id: "hex64",     ic: "☯",  cond: s => s.col.hex.length >= 64 },
  { id: "marco",     ic: "🐪", cond: s => !!s.journey && (s.journey.completed || []).includes("marco") },
  /* 2.0 */
  { id: "tower4",    ic: "🗼", cond: s => s.tower.best >= 4 },
  { id: "tower12",   ic: "👑", cond: s => s.tower.wins >= 1 },
  { id: "res10",     ic: "🌈", cond: s => s.tower.resTotal >= 10 },
  { id: "dust50",    ic: "✨", cond: s => s.stardust >= 50 },
  { id: "bothroads", ic: "🗺️", cond: s => !!s.journey && (s.journey.roadsTaken || []).length >= 2 },
  { id: "chronicle", ic: "📜", cond: s => !!s.journey && (s.journey.log || []).length >= 8 },
  { id: "student",   ic: "✒️", cond: s => s.learned.length >= 3 },
  { id: "polyglot",  ic: "🕊️", cond: s => s.learned.length >= 6 },
  { id: "lineage10", ic: "🎓", cond: s => s.learned.length >= 10 }
];
FQ.checkAchievements = function () {
  FQ.ACHIEVEMENTS.forEach(a => {
    if (!FQ.state.achv.includes(a.id) && a.cond(FQ.state)) {
      FQ.state.achv.push(a.id);
      FQ.save();
      setTimeout(() => {
        FQ.toast("🏆 " + FQ.t("achv." + a.id));
        FQ.confetti && FQ.confetti();
      }, 1400);
    }
  });
};

/* toast helper */
FQ.toastTimer = null;
FQ.toast = function (msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(FQ.toastTimer);
  FQ.toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
};
