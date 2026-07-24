/* 《远行之书》· fx — the effects instruction set.
   Data says what happens; this file is the only thing that knows how.
   Every op returns a receipt line, so the player always sees the consequence
   of the option they picked — the missing half of the old broken chain. */
window.BOF = window.BOF || {};
BOF.FX = {};

BOF.lang = () => (window.FQ && FQ.lang) || "zh";
BOF.bi = (o, zh, en) => {
  if (!o) return "";
  if (zh) return BOF.lang() === "zh" ? (o[zh] || o[en] || "") : (o[en] || o[zh] || "");
  return BOF.lang() === "zh" ? (o.zh || o.en || "") : (o.en || o.zh || "");
};

/* clamp fate bars to the 0–31 the design fixes them at */
const clamp31 = v => Math.max(0, Math.min(31, v));

/* ---------- the instruction set ---------- */
BOF.FX.OPS = {
  coins(s, op) {
    s.coins = Math.max(0, s.coins + op.v);
    return { ic: op.v > 0 ? "💰" : "💸", zh: (op.v > 0 ? "得" : "花") + Math.abs(op.v) + "钱",
             en: (op.v > 0 ? "+" : "−") + Math.abs(op.v) + " coin" };
  },
  days(s, op) {
    s.days += op.v;
    return { ic: "📅", zh: "过了 " + op.v + " 天", en: op.v + " day" + (op.v > 1 ? "s" : "") + " pass" };
  },
  fate(s, op) {
    s.fate[op.id] = clamp31((s.fate[op.id] || 0) + op.v);
    const bar = (BOF.DB.meta.fateBars || []).find(b => b.id === op.id);
    const nm = bar ? BOF.bi(bar.name) : op.id;
    return { ic: "✦", zh: nm + (op.v > 0 ? " +" : " ") + op.v, en: nm + (op.v > 0 ? " +" : " ") + op.v };
  },
  rep(s, op) {
    const k = op.city ? "city" : "band";
    const id = op.city || op.band;
    s.rep[k][id] = (s.rep[k][id] || 0) + op.v;
    const where = op.city ? BOF.bi(BOF.DB.city(op.city) && BOF.DB.city(op.city).name) : op.band;
    return { ic: "🕯️", zh: where + "声望 " + (op.v > 0 ? "+" : "") + op.v,
             en: "Standing in " + where + " " + (op.v > 0 ? "+" : "") + op.v };
  },
  goods(s, op) {
    const g = BOF.DB.good(op.id);
    const held = s.bag.find(b => b.kind === "goods" && b.id === op.id);
    if (held) held.n += op.v;
    else s.bag.push({ kind: "goods", id: op.id, n: op.v });
    const after = s.bag.find(b => b.kind === "goods" && b.id === op.id);
    if (after && after.n <= 0) s.bag.splice(s.bag.indexOf(after), 1);
    return { ic: "📦", zh: BOF.bi(g && g.name) + " ×" + op.v, en: BOF.bi(g && g.name) + " ×" + op.v };
  },
  item(s, op) {
    if (!s.bag.some(b => b.kind === "item" && b.id === op.id)) {
      s.bag.push({ kind: "item", id: op.id, n: 1 });
    }
    return { ic: "🎒", zh: "得「" + BOF.FX.itemName(op.id) + "」", en: "Acquired: " + BOF.FX.itemName(op.id) };
  },
  flag(s, op) {
    s.flags[op.id] = true;
    return null;   /* flags are bookkeeping; the player sees their effects, not them */
  },
  language(s, op) {
    if (!s.languages.includes(op.id)) {
      s.languages.push(op.id);
      return { ic: "🗣️", zh: "语言：" + op.id, en: "Language: " + op.id };
    }
    return null;
  },
  codex(s, op) {
    if (!s.codex.includes(op.id)) {
      s.codex.push(op.id);
      return { ic: "📖", zh: "图鉴新条", en: "New codex entry" };
    }
    return null;
  },
  sticker(s, op) {
    if (!s.stickers.includes(op.id)) {
      s.stickers.push(op.id);
      return { ic: "🏷️", zh: "纪念贴纸", en: "Souvenir sticker" };
    }
    return null;
  },
  /* —— the two that make the map grow (GDD §5.1 / P2) —— */
  revealCity(s, op) {
    if (s.knownCities.includes(op.id)) return null;
    s.knownCities.push(op.id);
    const c = BOF.DB.city(op.id);
    return { ic: "🗺️", big: true,
             zh: "地图上出现了：" + BOF.bi(c && c.name), en: "The map gains: " + BOF.bi(c && c.name) };
  },
  revealRoute(s, op) {
    if (s.knownRoutes.includes(op.id)) return null;
    s.knownRoutes.push(op.id);
    const r = BOF.DB.route(op.id);
    if (!r) return null;
    /* knowing a road implies knowing both its ends */
    [r.from, r.to].forEach(c => { if (!s.knownCities.includes(c)) s.knownCities.push(c); });
    const a = BOF.DB.city(r.from), b = BOF.DB.city(r.to);
    return { ic: "🛤️", big: true,
             zh: "记下一条路：" + BOF.bi(a && a.name) + " ↔ " + BOF.bi(b && b.name),
             en: "A road noted: " + BOF.bi(a && a.name) + " ↔ " + BOF.bi(b && b.name) };
  },
  /* a teacher is willing — but you still have to pass their trial */
  offerLearn(s, op) {
    if (s.learned.includes(op.id) || s.offered.includes(op.id)) return null;
    s.offered.push(op.id);
    const a = BOF.DB.art(op.id);
    return { ic: "✒️", big: true,
             zh: "有人愿意教你「" + BOF.bi(a && a.name) + "」", en: "Someone will teach you " + BOF.bi(a && a.name) };
  },
  goto(s, op) {
    BOF.FX.pendingGoto = op.id;
    return null;
  }
};

BOF.FX.ITEM_NAMES = {
  "sepulchre-oil": { zh: "圣墓灯油", en: "Sepulchre oil" },
  "papal-letters": { zh: "教皇书信", en: "The Pope's letters" },
  "letter-of-introduction": { zh: "介绍信", en: "Letter of introduction" },
  "sealed-contract": { zh: "盖印契约", en: "Sealed contract" },
  "bill-of-exchange": { zh: "汇票", en: "Bill of exchange" },
  "pilot-book": { zh: "航海指南", en: "Pilot's book" },
  "star-tables": { zh: "星表", en: "Star tables" },
  "sea-chart": { zh: "海图", en: "Sea chart" },
  "road-notes": { zh: "路况笔记", en: "Road notes" },
  "shipping-table": { zh: "船期表", en: "Shipping table" },
  "chain-of-names": { zh: "名单", en: "The chain of names" },
  "list-of-names": { zh: "送行名录", en: "List of names" },
  "ijaza": { zh: "学业许可", en: "Ijaza" },
  "paiza": { zh: "大汗金牌", en: "The Khan's paiza" },
  "chao-note": { zh: "交钞", en: "Chao note" },
  "water-skins": { zh: "水囊", en: "Water skins" },
  "calicut-docket": { zh: "古里免验单", en: "Calicut docket" },
  "quarter-credit": { zh: "番坊赊帖", en: "Quarter credit slip" },
  "royal-letter": { zh: "国书", en: "Royal letter" },
  "psalter": { zh: "圣咏集", en: "Psalter" },
  "fleet-tally": { zh: "船队勘合", en: "Fleet tally" },
  "sailing-chart": { zh: "针路图", en: "Sailing chart" },
  "mazu-charm": { zh: "天妃香符", en: "Mazu charm" }
};
BOF.FX.itemName = id => {
  const n = BOF.FX.ITEM_NAMES[id];
  return n ? BOF.bi(n) : id;
};

/* ---------- run a list ---------- */
BOF.FX.apply = function (effects) {
  const s = BOF.state;
  const receipts = [];
  BOF.FX.pendingGoto = null;
  (effects || []).forEach(op => {
    const fn = BOF.FX.OPS[op.op];
    if (!fn) { console.warn("[BOF.FX] unknown op", op); return; }
    const r = fn(s, op);
    if (r) receipts.push(r);
  });
  BOF.save();
  return receipts;
};

/* ---------- requirements ---------- */
/* what a choice demands before it may be picked; returns null if satisfied */
BOF.FX.unmet = function (needs) {
  if (!needs) return null;
  const s = BOF.state;
  if (needs.coins != null && s.coins < needs.coins) {
    return { zh: "需盘缠 " + needs.coins, en: "Needs " + needs.coins + " coin" };
  }
  if (needs.item && !s.bag.some(b => b.kind === "item" && b.id === needs.item)) {
    return { zh: "需「" + BOF.FX.itemName(needs.item) + "」", en: "Needs " + BOF.FX.itemName(needs.item) };
  }
  if (needs.language && !s.languages.includes(needs.language)) {
    return { zh: "需通" + needs.language + "语", en: "Needs " + needs.language };
  }
  if (needs.flag && !s.flags[needs.flag]) {
    return { zh: "时机未到", en: "Not yet" };
  }
  if (needs.art && !s.learned.includes(needs.art)) {
    const a = BOF.DB.art(needs.art);
    return { zh: "需习「" + BOF.bi(a && a.name) + "」", en: "Needs " + BOF.bi(a && a.name) };
  }
  if (needs.days != null && needs.days > 0) return null;  /* time is always payable */
  return null;
};

/* ---------- divination checks ---------- */
/* An art you know shifts the odds; an art you do not know is simply not
   offered. Confidence comes from the art, the relevant fate bar and standing. */
BOF.FX.divCheck = function (artId) {
  const s = BOF.state;
  const a = BOF.DB.art(artId);
  if (!a) return { ok: Math.random() < 0.5, p: 0.5 };
  let p = a.confidence || 0.6;
  const barFor = { route: "travel", timing: "travel", risk: "travel",
                   person: "rapport", identity: "rapport", trade: "wealth" };
  const bar = barFor[a.question] || "travel";
  p += ((s.fate[bar] || 0) - 15) / 60;          /* ±0.26 across the bar */
  const rep = (s.rep.city[s.at] || 0);
  p += Math.max(-0.08, Math.min(0.08, rep / 100));
  p = Math.max(0.15, Math.min(0.92, p));
  return { ok: Math.random() < p, p: p, art: a, bar: bar };
};
