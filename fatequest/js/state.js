/* Gamification: XP, levels, streaks, collection, achievements — localStorage persisted */
window.FQ = window.FQ || {};

FQ.LEVELS = [0, 60, 160, 320, 560, 900, 1400]; /* xp thresholds per title */

const DEFAULT_STATE = {
  xp: 0, readings: 0,
  lang: null,
  streak: 0, lastDaily: null, lastVisit: null, daysVisited: 0,
  methodsTried: [],
  col: { tarot: [], hex: [], rune: [] },
  achv: [],
  journey: null
};

FQ.load = function () {
  try {
    const raw = localStorage.getItem("fatequest");
    FQ.state = raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : { ...DEFAULT_STATE };
  } catch (e) { FQ.state = { ...DEFAULT_STATE }; }
  FQ.state.col = Object.assign({ tarot: [], hex: [], rune: [] }, FQ.state.col);
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
  try { localStorage.setItem("fatequest", JSON.stringify(FQ.state)); } catch (e) {}
};
FQ.reset = function () {
  try { localStorage.removeItem("fatequest"); } catch (e) {}
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
    }, 900);
  }
  FQ.renderHUD && FQ.renderHUD();
};

FQ.recordReading = function (methodId, xp) {
  FQ.state.readings++;
  if (!FQ.state.methodsTried.includes(methodId)) FQ.state.methodsTried.push(methodId);
  FQ.checkAchievements();
  FQ.gainXP(xp);
};

/* collection — returns true if newly lit */
FQ.collect = function (kind, key, label) {
  const arr = FQ.state.col[kind];
  if (arr.includes(key)) return false;
  arr.push(key);
  FQ.save();
  setTimeout(() => FQ.toast("📖 " + FQ.t("new.item", { t: label })), 450);
  FQ.checkAchievements();
  return true;
};
FQ.colCount = function () {
  const c = FQ.state.col;
  return c.tarot.length + c.hex.length + c.rune.length;
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
  { id: "marco",     ic: "🐪", cond: s => !!s.journey && (s.journey.completed || []).includes("marco") }
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
