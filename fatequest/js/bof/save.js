/* 《远行之书》· save — one autosave plus six manual slots.
   A save holds everything §四 asks for: character, position, map knowledge,
   bag, reputation, retainers, codex and the day count. */
window.BOF = window.BOF || {};

BOF.SAVE = {
  KEY: "bof.save",          /* autosave */
  SLOT: "bof.slot.",        /* manual slots 1..6 */
  SLOTS: 6,
  VERSION: 3
};

BOF.newGame = function () {
  return {
    v: BOF.SAVE.VERSION,
    started: Date.now(), touched: Date.now(),
    /* character */
    who: null,              /* {archetype, name, birth, culture, faith, fate:{...}, grade} */
    /* position */
    at: null,               /* city id */
    days: 0,                /* days elapsed since departure */
    /* map knowledge — the whole point of pillar P2 */
    knownCities: [],        /* city ids you have heard of */
    visitedCities: [],      /* city ids you have stood in */
    knownRoutes: [],        /* route ids you know how to travel */
    /* purse and pack */
    coins: 0, currency: "ducat",
    bag: [],                /* [{kind:'goods'|'item', id, n}] */
    /* standing */
    rep: { city: {}, band: {} },
    faithChanges: 0,
    languages: [],
    /* fate bars, 0–31 */
    fate: { travel: 0, rapport: 0, wealth: 0 },
    /* what you have been taught, and what a teacher has offered */
    learned: [], offered: [],
    /* retainers */
    retainers: [],
    /* records */
    codex: [], stickers: [], flags: {},
    seenEvents: [],
    log: [],                /* [{day, city, ic, text}] */
    ended: null
  };
};

BOF.state = null;

/* ---------- autosave ---------- */
BOF.save = function () {
  if (!BOF.state) return;
  BOF.state.touched = Date.now();
  try { localStorage.setItem(BOF.SAVE.KEY, JSON.stringify(BOF.state)); }
  catch (e) { console.warn("[BOF] autosave failed", e); }
};

BOF.load = function () {
  try {
    const raw = localStorage.getItem(BOF.SAVE.KEY);
    BOF.state = raw ? BOF.migrate(JSON.parse(raw)) : null;
  } catch (e) { BOF.state = null; }
  return BOF.state;
};

BOF.hasSave = function () {
  try { return !!localStorage.getItem(BOF.SAVE.KEY); } catch (e) { return false; }
};

BOF.migrate = function (s) {
  const fresh = BOF.newGame();
  /* fill in anything a older save predates, without clobbering what it has */
  Object.keys(fresh).forEach(k => { if (s[k] === undefined) s[k] = fresh[k]; });
  s.rep = Object.assign({ city: {}, band: {} }, s.rep);
  s.fate = Object.assign({ travel: 0, rapport: 0, wealth: 0 }, s.fate);
  s.v = BOF.SAVE.VERSION;
  return s;
};

/* ---------- manual slots ---------- */
BOF.slotKey = n => BOF.SAVE.SLOT + n;

BOF.slotInfo = function (n) {
  try {
    const raw = localStorage.getItem(BOF.slotKey(n));
    if (!raw) return null;
    const s = JSON.parse(raw);
    const city = BOF.DB.city(s.at);
    return {
      n, touched: s.touched, days: s.days,
      who: s.who ? s.who.name : "—",
      archetype: s.who ? s.who.archetype : null,
      city: city ? city.name : null,
      cities: (s.visitedCities || []).length,
      arts: (s.learned || []).length,
      coins: s.coins
    };
  } catch (e) { return null; }
};

BOF.slotList = function () {
  const out = [];
  for (let i = 1; i <= BOF.SAVE.SLOTS; i++) out.push(BOF.slotInfo(i) || { n: i, empty: true });
  return out;
};

BOF.saveToSlot = function (n) {
  if (!BOF.state) return false;
  BOF.state.touched = Date.now();
  try {
    localStorage.setItem(BOF.slotKey(n), JSON.stringify(BOF.state));
    return true;
  } catch (e) { return false; }
};

BOF.loadFromSlot = function (n) {
  try {
    const raw = localStorage.getItem(BOF.slotKey(n));
    if (!raw) return false;
    BOF.state = BOF.migrate(JSON.parse(raw));
    BOF.save();
    return true;
  } catch (e) { return false; }
};

BOF.clearSlot = function (n) {
  try { localStorage.removeItem(BOF.slotKey(n)); return true; }
  catch (e) { return false; }
};

BOF.deleteSave = function () {
  try { localStorage.removeItem(BOF.SAVE.KEY); } catch (e) {}
  BOF.state = null;
};

/* ---------- the journal ---------- */
BOF.note = function (ic, text) {
  if (!BOF.state) return;
  BOF.state.log.push({
    day: BOF.state.days, city: BOF.state.at, ic: ic || "·", text: text
  });
  if (BOF.state.log.length > 400) BOF.state.log.shift();
};
