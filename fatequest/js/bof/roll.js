/* 《远行之书》· roll — the opening draw.
   Four layers, in one flow: birth date → fate bars and grade → archetype
   (which fixes culture, faith and the start city) → confirm and depart.
   Drawing the character IS choosing where the game begins; the two are never
   separate screens. */
window.BOF = window.BOF || {};
BOF.ROLL = {};

BOF.ROLL.cur = null;   /* {birth, fate, grade, archetype, rerolls} */

const DAY = 86400000;

BOF.ROLL.randomBirth = function () {
  const w = BOF.DB.meta.birthWindow;
  const a = Date.parse(w.from), b = Date.parse(w.to);
  const t = a + Math.random() * (b - a);
  const d = new Date(t);
  return {
    iso: d.toISOString().slice(0, 10),
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate()
  };
};

/* The era a birth year lands in — this is what makes the date more than a
   number (GDD §2.2). */
BOF.ROLL.ERAS = [
  { from: 1253, to: 1280, zh: "陆路大开的年代。鲁布鲁克刚从汗廷回来，波罗一家正在准备第二次东行；从黑海到中国，第一次有人能一路走下去。",
    en: "The years the land road opened. Rubruck is just back from the Khan's court and the Polos are preparing their second journey; for the first time a man can walk from the Black Sea to China." },
  { from: 1281, to: 1320, zh: "大汗的和平。站赤通到撒马尔罕，交钞在中国通行，热那亚人在大不里士开了账房。旅行从未这样安全，也从未这样贵。",
    en: "The Khan's peace. The post road reaches Samarkand, paper money circulates in China, and the Genoese keep books in Tabriz. Travel has never been this safe, or this expensive." },
  { from: 1321, to: 1346, zh: "伊本·白图泰的年代。伊斯兰世界从马格里布连到印度，一封介绍信可以带你走三个大洲；德里的苏丹在雇外来人做官。",
    en: "Ibn Battuta's decades. The Muslim world runs unbroken from the Maghrib to India, one letter of introduction carries you across three continents, and the Sultan of Delhi is hiring foreigners." },
  { from: 1347, to: 1370, zh: "黑死病的年代。陆路封锁，港口检疫，物价三月一变。有人因此发了财，更多人死在半路上。",
    en: "The years of the plague. Roads shut, ports quarantined, prices remade every three months. A few grew rich on it; far more died on the road." },
  { from: 1371, to: 1404, zh: "旧网破裂之后。蒙古的和平散了，陆路不再安全，货开始改走海上——季风取代了驿站。",
    en: "After the old net tore. The Mongol peace is gone, the land road is no longer safe, and cargo moves to the sea: the monsoon replaces the post-house." },
  { from: 1405, to: 1433, zh: "宝船的年代。郑和的舰队七下西洋，从南京直到东非；印度洋上一次出现了两百条中国船。",
    en: "The years of the treasure ships. Zheng He's fleets go out seven times, from Nanjing to East Africa; two hundred Chinese sail appear in the Indian Ocean at once." },
  { from: 1434, to: 1453, zh: "最后的窗口。中国的船队停了，君士坦丁堡还剩几年；从东方来的货越来越贵，走陆路的人越来越少。",
    en: "The last window. The Chinese fleets have stopped and Constantinople has a few years left; eastern goods cost more each season and fewer men take the land road." }
];

BOF.ROLL.eraOf = y => BOF.ROLL.ERAS.find(e => y >= e.from && y <= e.to) || BOF.ROLL.ERAS[0];

/* Fate bars: three 0–31 values, generated together so a strong roll in one
   is not free. Sum lands around 45 of a possible 93. */
BOF.ROLL.rollFate = function () {
  const one = () => {
    /* three dice, so the middle is common and the extremes are real */
    let v = 0;
    for (let i = 0; i < 3; i++) v += Math.floor(Math.random() * 11);
    return Math.max(0, Math.min(31, v));
  };
  return { travel: one(), rapport: one(), wealth: one() };
};

BOF.ROLL.gradeOf = function (fate) {
  const avg = (fate.travel + fate.rapport + fate.wealth) / 3;
  const g = (BOF.DB.meta.grades || []).find(x => avg >= x.min);
  return g || { zh: "中中", en: "Middling" };
};

/* An archetype's bonus/malus lands on the rolled bars. */
BOF.ROLL.withArchetype = function (fate, arch) {
  const out = Object.assign({}, fate);
  Object.entries(arch.bonus || {}).forEach(([k, v]) => {
    if (out[k] != null) out[k] = Math.max(0, Math.min(31, out[k] + v));
  });
  Object.entries(arch.malus || {}).forEach(([k, v]) => {
    if (out[k] != null) out[k] = Math.max(0, Math.min(31, out[k] + v));
  });
  return out;
};

BOF.ROLL.begin = function () {
  BOF.ROLL.cur = {
    birth: BOF.ROLL.randomBirth(),
    fate: BOF.ROLL.rollFate(),
    archetype: null,
    rerolls: (BOF.DB.meta.birthWindow.rerolls || 3)
  };
  BOF.ROLL.cur.grade = BOF.ROLL.gradeOf(BOF.ROLL.cur.fate);
  BOF.UI.render();
};

BOF.ROLL.reroll = function () {
  const c = BOF.ROLL.cur;
  if (!c || c.rerolls <= 0) return;
  c.rerolls--;
  c.birth = BOF.ROLL.randomBirth();
  c.fate = BOF.ROLL.rollFate();
  c.grade = BOF.ROLL.gradeOf(c.fate);
  BOF.UI.render();
};

BOF.ROLL.choose = function (archId) {
  const c = BOF.ROLL.cur;
  if (!c) return;
  c.archetype = BOF.DB.archetypes[archId] || null;
  BOF.UI.render();
};

/* Confirm: build the save, seed what this background would already know, and
   walk straight into the start city. */
BOF.ROLL.confirm = function () {
  const c = BOF.ROLL.cur;
  if (!c || !c.archetype) return;
  const a = c.archetype;
  const s = BOF.state = BOF.newGame();

  const fate = BOF.ROLL.withArchetype(c.fate, a);
  s.who = {
    archetype: a.id,
    name: BOF.bi(a.name),
    birth: c.birth.iso,
    birthYear: c.birth.y,
    culture: a.culture,
    faith: a.faith,
    fate: fate,
    grade: BOF.ROLL.gradeOf(fate)
  };
  s.fate = fate;
  s.coins = (a.startKit && a.startKit.coins) || 0;
  s.currency = (a.startKit && a.startKit.currency) || "ducat";
  s.languages = ((a.startKit && a.startKit.languages) || []).slice();
  ((a.startKit && a.startKit.items) || []).forEach(id => {
    s.bag.push({ kind: "item", id, n: 1 });
  });
  ((a.startKit && a.startKit.goods) || []).forEach(id => {
    s.bag.push({ kind: "goods", id, n: 1 });
  });

  /* 2–3 cities this background would have heard of, and the roads it knows —
     everything else on the map has to be earned (P2). */
  s.knownCities = (a.knownCities || [a.start]).slice();
  if (!s.knownCities.includes(a.start)) s.knownCities.unshift(a.start);
  s.knownRoutes = (a.knownRoutes || []).slice();
  /* a known road implies both its ends */
  s.knownRoutes.forEach(rid => {
    const r = BOF.DB.route(rid);
    if (!r) return;
    [r.from, r.to].forEach(cid => {
      if (!s.knownCities.includes(cid)) s.knownCities.push(cid);
    });
  });

  s.days = 0;
  BOF.note("✦", BOF.lang() === "zh"
    ? "生于 " + c.birth.iso + "，" + BOF.bi(a.name) + "。"
    : "Born " + c.birth.iso + ". " + BOF.bi(a.name) + ".");
  BOF.save();
  BOF.ROLL.cur = null;

  /* the draw ends by walking into the city it chose */
  BOF.EV.arrive(a.start);
};

/* the in-game date, for the HUD */
BOF.ROLL.dateNow = function () {
  const s = BOF.state;
  if (!s || !s.who) return "";
  const t = Date.parse(s.who.birth + "T00:00:00Z") + (18 * 365.25 + s.days) * DAY;
  return new Date(t).toISOString().slice(0, 10);
};
BOF.ROLL.yearNow = function () {
  const s = BOF.state;
  if (!s || !s.who) return 0;
  return s.who.birthYear + 18 + Math.floor(s.days / 365.25);
};
