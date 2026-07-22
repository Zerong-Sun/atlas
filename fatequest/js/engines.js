/* Deterministic divination engines */
window.FQ = window.FQ || {};

FQ.rand = n => Math.floor(Math.random() * n);
FQ.pick = arr => arr[FQ.rand(arr.length)];

/* seeded PRNG (mulberry32) for stable daily results */
FQ.seeded = function (seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
FQ.dayKey = d => { d = d || new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

/* ---------- Tarot ---------- */
FQ.drawTarot = function (count) {
  const deck = FQ.TAROT.map((c, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = FQ.rand(i + 1); [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, count).map(i => ({ card: FQ.TAROT[i], reversed: Math.random() < 0.3 }));
};

/* ---------- I-Ching coin toss ----------
   3 coins: heads=3 tails=2 → 6 old-yin(moving), 7 yang, 8 yin, 9 old-yang(moving) */
FQ.tossCoins = function () {
  const coins = [0, 0, 0].map(() => (Math.random() < 0.5 ? 2 : 3));
  const sum = coins[0] + coins[1] + coins[2];
  return { coins, sum, yang: sum % 2 === 1, moving: sum === 6 || sum === 9 };
};
FQ.resolveCast = function (tosses) { /* tosses: 6 results bottom-up */
  const lines = tosses.map(t => (t.yang ? 1 : 0));
  const primary = FQ.hexFromLines(lines);
  const movingIdx = tosses.map((t, i) => (t.moving ? i : -1)).filter(i => i >= 0);
  let changed = null;
  if (movingIdx.length) {
    const clines = lines.slice();
    movingIdx.forEach(i => { clines[i] = 1 - clines[i]; });
    changed = FQ.hexFromLines(clines);
  }
  return { lines, primary, movingIdx, changed };
};

/* ---------- Meihua (plum blossom) ----------
   numbers → upper/lower trigram + moving line; source: now or a free number */
FQ.meihua = function (num) {
  let a, b, c;
  if (num === undefined || num === null || num === "") {
    const d = new Date();
    a = d.getFullYear() + d.getMonth() + 1 + d.getDate();
    b = a + d.getHours();
    c = a + b + d.getMinutes();
  } else {
    const s = String(num).replace(/\D/g, "") || "1";
    const half = Math.ceil(s.length / 2);
    a = parseInt(s.slice(0, half), 10);
    b = parseInt(s.slice(half), 10) || a;
    c = a + b + new Date().getHours();
  }
  /* trigram numbers use 先天 order 乾1兑2离3震4巽5坎6艮7坤8 = FQ.TRIGRAMS index+1 */
  const upperIdx = ((a - 1) % 8 + 8) % 8;
  const lowerIdx = ((b - 1) % 8 + 8) % 8;
  const moving = ((c - 1) % 6 + 6) % 6; /* 0..5 bottom-up */
  const lines = FQ.TRIGRAMS[lowerIdx].lines.concat(FQ.TRIGRAMS[upperIdx].lines);
  const primary = FQ.hexFromLines(lines);
  const clines = lines.slice(); clines[moving] = 1 - clines[moving];
  const changed = FQ.hexFromLines(clines);
  return { lines, primary, movingIdx: [moving], changed };
};

/* ---------- BaZi (Four Pillars, simplified) ----------
   Day pillar anchored: 1949-10-01 was 甲子 day (index 0 of 60). */
FQ.SEX_CYCLE = i => ({ stem: FQ.STEMS[i % 10], branch: FQ.BRANCHES[i % 12] });
FQ.bazi = function (dateStr, hour) {
  const [Y, M, D] = dateStr.split("-").map(Number);
  /* day pillar via days since anchor (UTC to dodge DST) */
  const days = Math.round((Date.UTC(Y, M - 1, D) - Date.UTC(1949, 9, 1)) / 86400000);
  const dayIdx = ((days % 60) + 60) % 60;
  const day = FQ.SEX_CYCLE(dayIdx);

  /* solar year starts ~Feb 4 (立春) */
  const solarY = (M > 2 || (M === 2 && D >= 4)) ? Y : Y - 1;
  const yStem = ((solarY - 4) % 10 + 10) % 10;
  const yBranch = ((solarY - 4) % 12 + 12) % 12;
  const year = { stem: FQ.STEMS[yStem], branch: FQ.BRANCHES[yBranch] };

  /* month branch by approximate solar-term dates; 寅 starts the cycle */
  const TERMS = [[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,8],[9,8],[10,8],[11,7],[12,7],[1,6]];
  let mi = 11; /* default 丑 month (Jan 6 – Feb 3) */
  for (let i = 0; i < 12; i++) {
    const [tm, td] = TERMS[i];
    const next = TERMS[(i + 1) % 12];
    const after = (M > tm || (M === tm && D >= td));
    const before = (M < next[0] || (M === next[0] && D < next[1]));
    if (i < 11 ? (after && before) : (after || before)) { mi = i; break; }
  }
  const mBranch = (2 + mi) % 12; /* 寅=2 */
  /* 五虎遁: month stem from year stem */
  const firstMStem = [2, 4, 6, 8, 0][yStem % 5]; /* 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲 */
  const mStem = (firstMStem + mi) % 10;
  const month = { stem: FQ.STEMS[mStem], branch: FQ.BRANCHES[mBranch] };

  /* hour pillar; branch: 23–1 = 子 …; 五鼠遁 from day stem */
  let hourP = null;
  if (hour !== "" && hour !== null && hour !== undefined) {
    const h = Number(hour);
    const hBranch = Math.floor(((h + 1) % 24) / 2);
    const firstHStem = [0, 2, 4, 6, 8][dayIdx % 10 % 5];
    const hStem = (firstHStem + hBranch) % 10;
    hourP = { stem: FQ.STEMS[hStem], branch: FQ.BRANCHES[hBranch] };
  }

  const pillars = [year, month, day].concat(hourP ? [hourP] : []);
  const counts = { "木": 0, "火": 0, "土": 0, "金": 0, "水": 0 };
  pillars.forEach(p => { counts[p.stem.elem]++; counts[p.branch.elem]++; });
  return { year, month, day, hour: hourP, counts, dayMaster: day.stem };
};

/* ---------- Western zodiac ---------- */
FQ.sunSign = function (m, d) {
  for (const z of FQ.ZODIAC) {
    const [fm, fd] = z.from, [tm, td] = z.to;
    if (fm <= tm) {
      if ((m === fm && d >= fd) || (m === tm && d <= td) || (m > fm && m < tm)) return z;
    } else { /* capricorn wraps the year */
      if ((m === fm && d >= fd) || (m === tm && d <= td)) return z;
    }
  }
  return FQ.ZODIAC[0];
};
FQ.starNote = function (sign) {
  const r = FQ.seeded(FQ.dayKey() * 37 + FQ.ZODIAC.indexOf(sign));
  const focus = FQ.STAR_FOCUS[Math.floor(r() * FQ.STAR_FOCUS.length)];
  const advice = FQ.STAR_ADVICE[Math.floor(r() * FQ.STAR_ADVICE.length)];
  const lucky = Math.floor(r() * 9) + 1;
  return { focus, advice, lucky };
};

/* ---------- Runes / dice / jiaobei / dream / lots ---------- */
FQ.drawRunes = function (n) {
  const bag = FQ.RUNES.map((_, i) => i);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = FQ.rand(i + 1); [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag.slice(0, n).map(i => FQ.RUNES[i]);
};
FQ.rollAstroDice = function () {
  return {
    planet: FQ.pick(FQ.DICE_PLANETS),
    sign: FQ.pick(FQ.ZODIAC),
    house: FQ.pick(FQ.DICE_HOUSES)
  };
};
FQ.throwJiaobei = function () {
  const a = Math.random() < 0.5, b = Math.random() < 0.5; /* true = flat side up */
  const blocks = [a, b];
  const res = (a !== b) ? FQ.JIAOBEI[0] : (a ? FQ.JIAOBEI[1] : FQ.JIAOBEI[2]);
  return { blocks, res };
};
FQ.throwJiaobeiSeq = function (n) {
  n = n || 3;
  const casts = [];
  for (let i = 0; i < n; i++) casts.push(FQ.throwJiaobei());
  return { casts, seq: casts.map(c => c.res.id), res: casts[casts.length - 1].res, blocks: casts[casts.length - 1].blocks };
};
FQ.tossCoinSeq = function (n) {
  n = n || (FQ.COIN_SEQ_LEN || 4);
  const tosses = [];
  for (let i = 0; i < n; i++) tosses.push(FQ.tossCoins());
  const seq = tosses.map(t => (t.yang ? "Y" : "N"));
  return { tosses, seq, yang: tosses.filter(t => t.yang).length >= Math.ceil(n / 2) };
};
FQ.readDream = function (text) {
  const t = (text || "").toLowerCase();
  const hits = [];
  FQ.DREAMS.forEach(d => {
    if (d.keys.some(k => t.includes(k.toLowerCase()))) hits.push(d);
  });
  return hits.slice(0, 4);
};
FQ.drawLot = function () {
  const r = FQ.seeded(FQ.dayKey() * 101 + (FQ.state ? FQ.state.readings : 0));
  /* mild positive skew, like real lot cylinders */
  const weights = [2, 3, 4, 4, 3, 1];
  let total = weights.reduce((s, w) => s + w, 0), x = r() * total;
  for (let i = 0; i < FQ.LOTS.length; i++) {
    x -= weights[i];
    if (x <= 0) return FQ.LOTS[i];
  }
  return FQ.LOTS[3];
};
