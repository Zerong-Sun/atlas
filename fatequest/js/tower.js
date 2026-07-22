/* 命途塔 Tower of Fates — run engine (GDD §5)
   12 floors, ordeals at 4/8/12, caravans at 3/9. Each floor: draw a hand of
   symbols with hidden orientations → play 2 → resonance → settle.
   Cross-civ pair = 对照 Contrast (both ×1.5 + a real culture note);
   same-civ pair = 同源 Kinship (forced upright, +2 power). */
window.FQ = window.FQ || {};
FQ.TW = {};

/* ---------- meta helpers ---------- */
FQ.TW.arch = id => FQ.TOWER_ARCH.find(a => a.id === id);
/* Drop pool: every archetype's starter set is always known to the tower
   (fresh runs can resonate across civilizations from floor one); the six
   advanced symbols must be met in the main-game codex or bought (§5.4). */
FQ.TW.pool = function () {
  const starters = new Set(FQ.TOWER_ARCH.flatMap(a => a.deck));
  return FQ.TOWER_SYMBOLS.filter(s => {
    if (starters.has(s.id) || FQ.state.tower.unlockedSyms.includes(s.id)) return true;
    const link = FQ.TOWER_CODEX_LINK[s.id];
    if (!link) return false;
    if (link[0] === "tarot") return FQ.state.col.tarot.includes(link[1]);
    if (link[0] === "hex") return FQ.state.col.hex.includes(link[1]);
    return FQ.state.col.rune.includes(link[1]);
  }).map(s => s.id);
};
FQ.TW.symCard = function (id, opts) {
  const s = FQ.towerSym(id);
  const cur = FQ.towerIsCurse(id);
  const o = opts || {};
  return `
    <div class="twsym illum ${cur ? "curse" : "civ-" + s.civ} ${o.cls || ""}" ${o.on ? `onclick="${o.on}"` : ""}>
      ${FQ.illumCard({ glyph: s.sym, name: FQ.bi(s, "zh", "en"), civ: cur ? "curse" : s.civ,
        art: cur ? null : id, power: cur ? undefined : s.power })}
    </div>`;
};

/* ---------- run lifecycle ---------- */
FQ.TW.start = function (archId) {
  const a = FQ.TW.arch(archId);
  const ordeals = [];
  const pool = FQ.TOWER_ORDEALS.map(o => o.id);
  while (ordeals.length < 3) {
    const p = pool.splice(FQ.rand(pool.length), 1)[0];
    ordeals.push(p);
  }
  FQ.state.tower.run = {
    arch: a.id, deck: a.deck.slice(), hp: 10, hpMax: 10, coins: 8, shield: 0,
    layer: 1, resCount: 0, ordealsPassed: 0, ordeals, dustRun: 0,
    mods: { omenTrue: 0, omenHide: false, handUp: 0, nextWonder: false, peek: null },
    skillFloor: 0
  };
  FQ.save();
  FQ.nav("towerRun");
};
FQ.TW.abandon = function () {
  if (!confirm(FQ.t("tw.abandon.confirm"))) return;
  FQ.TW.settle(false, true);
};

/* ---------- floor setup ---------- */
FQ.TW.isOrdeal = l => { const r = FQ.state.tower.run; return [4, 8, 12].includes(l); };
FQ.TW.isCaravan = l => [3, 9].includes(l);

FQ.TW.drawEvent = function () {
  const r = FQ.state.tower.run;
  if (r.mods.peek) { const ev = r.mods.peek; r.mods.peek = null; return ev; }
  let list = FQ.TOWER_EVENTS;
  if (r.mods.nextWonder) {
    r.mods.nextWonder = false;
    list = list.filter(e => e.type === "wonder");
  }
  const depth = r.layer / 12;
  const wOf = e => ({
    scenery: 3.4 - depth * 2.2,
    parley: 2 + depth * 1.2,
    peril: 0.9 + depth * 2.6,
    wonder: 0.8
  })[e.type] || 1;
  return FQ.weightedPick(list, wOf);
};

FQ.TW.dealHand = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  const n = Math.min(r.deck.length, 4 + (r.mods.handUp || 0));
  r.mods.handUp = 0;
  const ids = r.deck.slice();
  for (let i = ids.length - 1; i > 0; i--) { const j = FQ.rand(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  t.hand = ids.slice(0, n).map(id => {
    const s = FQ.towerSym(id);
    const rev = !FQ.towerIsCurse(id) && !!s.rv && Math.random() < 0.33;
    return { id, rev, omen: 0 };
  });
  /* curse bites on draw */
  t.biteLog = [];
  t.hand.filter(h => FQ.towerIsCurse(h.id)).forEach(h => {
    const c = FQ.towerSym(h.id);
    c.bite.forEach(op => {
      if (op.op === "omenHide") t.omenHidden = true;
      if (op.op === "pow") t.bitePow = (t.bitePow || 0) + op.v;
      if (op.op === "demand") t.biteDemand = (t.biteDemand || 0) + op.v;
      if (op.op === "coins") { r.coins = Math.max(0, r.coins + op.v); }
    });
    t.biteLog.push(`${c.sym} ${FQ.bi(c, "zh", "en")} · ${FQ.bi(c, "dZh", "dEn")}`);
  });
  /* omens (§3.1): truthful glints, unless hidden */
  const acc = r.mods.omenTrue > 0 ? 1 : 0.75;
  const hidden = t.omenHidden || r.mods.omenHide;
  t.hand.forEach(h => {
    if (FQ.towerIsCurse(h.id) || hidden) { h.omen = 0; return; }
    h.omen = FQ.omenFor(h.rev ? -1 : 1, acc);
  });
  FQ.AU.play("card");
};

FQ.TW.openFloor = function () {
  const r = FQ.state.tower.run;
  FQ.TW.t = { sel: [], phase: "select", flags: {}, log: [], discarded: false };
  const t = FQ.TW.t;
  if (r.mods.omenHide) { t.omenHidden = true; }
  /* the ordeal floors drive the drum harder (§7.2) */
  FQ.AU.scene(FQ.TW.isOrdeal(r.layer) ? "ordeal" : "tower",
    { tarot: "chr", iching: "con", runes: "nor" }[r.arch]);
  if (FQ.TW.isOrdeal(r.layer)) {
    t.ordeal = {
      id: r.ordeals[[4, 8, 12].indexOf(r.layer)],
      round: 1, power: 0, water: 0, life: 0, contrast: 0, met: false, paid: false
    };
    FQ.TW.dealHand();
  } else if (FQ.TW.isCaravan(r.layer)) {
    t.caravan = { offers: FQ.TW.shopOffers() };
  } else {
    t.ev = FQ.TW.drawEvent();
    if (t.ev.type === "wonder") { /* wonders need no hand */ }
    else FQ.TW.dealHand();
  }
  r.mods.omenHide = false;
  FQ.save();
};

FQ.TW.shopOffers = function () {
  const r = FQ.state.tower.run;
  const pool = FQ.TW.pool(r.arch).filter(id => !r.deck.includes(id));
  const offers = [];
  const p = pool.slice();
  while (offers.length < 3 && p.length) offers.push(p.splice(FQ.rand(p.length), 1)[0]);
  return offers;
};

/* ---------- selection & reveal ---------- */
FQ.TW.toggleSel = function (i) {
  const t = FQ.TW.t;
  if (t.phase !== "select") return;
  if (FQ.towerIsCurse(t.hand[i].id)) { FQ.toast(FQ.t("tw.curse.dead")); return; }
  const at = t.sel.indexOf(i);
  if (at >= 0) t.sel.splice(at, 1);
  else { if (t.sel.length >= 2) t.sel.shift(); t.sel.push(i); }
  FQ.AU.play("flip");
  FQ.TW.render();
};

/* Balatro-style redraw: toss the selected cards back, draw as many (1/floor) */
FQ.TW.discard = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (t.phase !== "select") return;
  if (t.discarded) { FQ.toast(FQ.t("tw.discard.used")); return; }
  if (!t.sel.length) { FQ.toast(FQ.t("tw.discard.none")); return; }
  const inHand = t.hand.map(h => h.id);
  const fresh = r.deck.filter(id => !inHand.includes(id));
  const acc = r.mods.omenTrue > 0 ? 1 : 0.75;
  const hidden = t.omenHidden;
  t.sel.sort().forEach(i => {
    if (!fresh.length) return;
    const id = fresh.splice(FQ.rand(fresh.length), 1)[0];
    const s = FQ.towerSym(id);
    const rev = !FQ.towerIsCurse(id) && !!s.rv && Math.random() < 0.33;
    const h = { id, rev, omen: 0 };
    if (!FQ.towerIsCurse(id) && !hidden) h.omen = FQ.omenFor(rev ? -1 : 1, acc);
    t.hand[i] = h;
  });
  t.sel = [];
  t.discarded = true;
  FQ.AU.play("card");
  FQ.TW.render();
};

FQ.TW.reveal = function () {
  const t = FQ.TW.t;
  if (t.phase !== "select" || t.sel.length !== 2) return;
  t.phase = "reveal";
  FQ.AU.play("hush");
  FQ.TW.render();
  /* staggered flips, then the resonance beat */
  setTimeout(() => { FQ.AU.play("flip"); }, 350);
  setTimeout(() => { FQ.AU.play("flip"); FQ.TW.computeResonance(); FQ.TW.render(); }, 800);
};

FQ.TW.computeResonance = function () {
  const t = FQ.TW.t;
  const [a, b] = t.sel.map(i => t.hand[i]);
  const sa = FQ.towerSym(a.id), sb = FQ.towerSym(b.id);
  const noRes = [a, b].some(h => {
    const s = FQ.towerSym(h.id);
    const side = h.rev ? s.rv : s.up;
    return (side || []).some(op => op.op === "noRes");
  });
  if (noRes) t.res = null;
  else if (sa.civ === sb.civ) {
    t.res = "kin";
    a.rev = b.rev = false; /* 同源: forced upright */
    FQ.AU.play("merge");
  } else {
    t.res = "contrast";
    FQ.AU.play("res");
  }
  t.phase = "revealed";
};

/* archetype skill (改运, costs 1 stardust, once per floor) */
FQ.TW.useSkill = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  const a = FQ.TW.arch(r.arch);
  if (r.skillFloor === r.layer) { FQ.toast(FQ.t("tw.skill.used")); return; }
  if (a.skill === "flip") {
    if (t.phase !== "revealed") { FQ.toast(FQ.t("tw.skill.flipwhen")); return; }
    t.flipMode = true; FQ.TW.render(); return;
  }
  if (a.skill === "redraw") {
    if (t.phase !== "select") { FQ.toast(FQ.t("tw.skill.redrawwhen")); return; }
    if (!FQ.spendDust(1)) return;
    r.skillFloor = r.layer; t.sel = [];
    FQ.TW.dealHand(); FQ.TW.render(); return;
  }
  if (a.skill === "purify") {
    const cursed = r.deck.filter(FQ.towerIsCurse);
    if (!cursed.length) { FQ.toast(FQ.t("tw.nocurse")); return; }
    if (!FQ.spendDust(1)) return;
    r.skillFloor = r.layer;
    r.deck.splice(r.deck.indexOf(cursed[0]), 1);
    FQ.toast(FQ.t("tw.purified", { t: FQ.bi(FQ.towerSym(cursed[0]), "zh", "en") }));
    FQ.save(); FQ.TW.render();
  }
};
FQ.TW.flipCard = function (i) {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (!t.flipMode || !t.sel.includes(i)) return;
  if (!FQ.spendDust(1)) { t.flipMode = false; FQ.TW.render(); return; }
  r.skillFloor = r.layer;
  const h = t.hand[i];
  const s = FQ.towerSym(h.id);
  if (s.rv) h.rev = !h.rev;
  t.flipMode = false;
  FQ.AU.play("flip");
  FQ.TW.computeResonance(); /* resonance may change (kin re-uprights) */
  FQ.TW.render();
};

/* ---------- settle ---------- */
FQ.TW.applyOps = function (ops, mult, log) {
  const r = FQ.state.tower.run, t = FQ.TW.t, f = t.flags;
  const scale = v => Math.round(v * (mult || 1) + (v > 0 ? 0.0001 : -0.0001));
  (ops || []).forEach(op => {
    switch (op.op) {
      case "pow": f.pow = (f.pow || 0) + op.v; break;
      case "coins": { const v = scale(op.v); r.coins = Math.max(0, r.coins + v); log.push(`💰 ${v > 0 ? "+" : ""}${v}`); break; }
      case "coinsRand": { const v = scale(op.v[0] + FQ.rand(op.v[1] - op.v[0] + 1)); r.coins = Math.max(0, r.coins + v); log.push(`🎲💰 +${v}`); break; }
      case "hp": { const v = scale(op.v); FQ.TW.hp(v); log.push(`❤️ ${v > 0 ? "+" : ""}${v}`); break; }
      case "shield": { const v = scale(op.v); r.shield += v; log.push(`🛡 +${v}`); break; }
      case "dust": { const v = scale(op.v); r.dustRun += v; log.push(`✨ +${v}`); break; }
      case "reward2x": f.reward2x = true; log.push(FQ.t("tw.fx.reward2x")); break;
      case "stakes": f.stakes = f.stakes === "both" ? "both" : op.v; log.push(FQ.t("tw.fx.stakes." + op.v)); break;
      case "risk": f.risk = (f.risk || 0) + op.v; log.push(`⚠️ ${op.v}`); break;
      case "demand": f.demand = (f.demand || 0) + op.v; log.push(`🎯 ${op.v > 0 ? "+" : ""}${op.v}`); break;
      case "autowin": f.autowin = true; log.push(FQ.t("tw.fx.autowin")); break;
      case "dodge": f.dodge = true; log.push(FQ.t("tw.fx.dodge")); break;
      case "freeze": f.freeze = true; log.push(FQ.t("tw.fx.freeze")); break;
      case "peek": f.peek = true; log.push(FQ.t("tw.fx.peek")); break;
      case "omenHide": r.mods.omenHide = true; log.push(FQ.t("tw.fx.omenhide")); break;
      case "omenTrue": r.mods.omenTrue = Math.max(r.mods.omenTrue, op.v); log.push(FQ.t("tw.fx.omentrue")); break;
      case "handUp": r.mods.handUp += op.v; log.push(FQ.t("tw.fx.handup")); break;
      case "nextWonder": r.mods.nextWonder = true; log.push(FQ.t("tw.fx.wonder")); break;
      case "rerollEvent": f.reroll = true; log.push(FQ.t("tw.fx.reroll")); break;
      case "cleanse": {
        const n = r.deck.filter(FQ.towerIsCurse).length;
        r.deck = r.deck.filter(id => !FQ.towerIsCurse(id));
        log.push(FQ.t("tw.fx.cleanse", { n })); break;
      }
      case "purifyOne": {
        const c = r.deck.find(FQ.towerIsCurse);
        if (c) { r.deck.splice(r.deck.indexOf(c), 1); log.push(FQ.t("tw.fx.purify1", { t: FQ.bi(FQ.towerSym(c), "zh", "en") })); }
        else { FQ.TW.hp(2); log.push("❤️ +2"); }
        break;
      }
      case "discardRand": {
        const own = r.deck.filter(id => !FQ.towerIsCurse(id));
        if (own.length > 2) {
          const id = own[FQ.rand(own.length)];
          r.deck.splice(r.deck.indexOf(id), 1);
          log.push(FQ.t("tw.fx.discard", { t: FQ.bi(FQ.towerSym(id), "zh", "en") }));
        }
        break;
      }
      case "curseRand": {
        const c = FQ.TOWER_CURSES[FQ.rand(FQ.TOWER_CURSES.length)];
        r.deck.push(c.id);
        log.push(FQ.t("tw.fx.cursed", { t: c.sym + " " + FQ.bi(c, "zh", "en") }));
        break;
      }
      case "symbolGift": f.gift = true; break;
      case "noRes": break;
    }
  });
};
FQ.TW.hp = function (v) {
  const r = FQ.state.tower.run;
  if (v < 0 && r.shield > 0) { r.shield--; FQ.toast(FQ.t("tw.shielded")); return; }
  r.hp = Math.min(r.hpMax, r.hp + v);
};

FQ.TW.settleBtn = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (t.phase !== "revealed") return;
  t.phase = "outcome";
  t.flipMode = false;
  const [a, b] = t.sel.map(i => t.hand[i]);
  const sa = FQ.towerSym(a.id), sb = FQ.towerSym(b.id);
  const mult = t.res === "contrast" ? 1.5 : 1;
  const log = t.log;

  if (t.res === "contrast") r.resCount++;
  /* apply both active sides in play order */
  FQ.TW.applyOps(a.rev ? sa.rv : sa.up, mult, log);
  FQ.TW.applyOps(b.rev ? sb.rv : sb.up, mult, log);

  /* power */
  let power = sa.power + sb.power + (t.flags.pow || 0) + (t.bitePow || 0);
  if (t.res === "contrast") power = Math.ceil(power * 1.5);
  if (t.res === "kin") power += 2;
  t.power = Math.max(0, power);

  if (t.ordeal) return FQ.TW.settleOrdealRound(a, b, sa, sb);

  const ev = t.ev;
  if (t.flags.reroll) {
    t.outcome = "reroll";
    setTimeout(() => { FQ.TW.openFloor(); FQ.TW.render(); }, 1200);
    FQ.TW.render(); return;
  }
  if (t.flags.freeze) {
    t.outcome = "freeze";
    FQ.AU.play("chime");
    FQ.TW.render(); return;
  }
  const depthBump = Math.floor((r.layer - 1) / 4);
  const demand = Math.max(0, ev.demand + depthBump + (t.flags.demand || 0) + (t.biteDemand || 0));
  t.demandShown = demand;
  const ok = t.flags.autowin || t.power >= demand;
  t.outcome = ok ? "win" : "lose";
  const risk = Math.max(0, (ev.risk || 0) + (t.flags.risk || 0));
  if (ok) {
    let m = 1;
    if (t.flags.reward2x) m *= 2;
    if (t.flags.stakes === "both") m *= 2;
    FQ.TW.applyOps(ev.win, m, log);
    FQ.AU.play("chime"); FQ.buzz(18);
  } else if (!t.flags.dodge) {
    let m = 1 + risk * 0.4;
    if (t.flags.stakes === "both" || t.flags.stakes === "loss") m *= 2;
    FQ.TW.applyOps(ev.lose, m, log);
    FQ.AU.play("bad"); FQ.buzz([30, 40, 30]);
  } else {
    log.push(FQ.t("tw.fx.dodged"));
    FQ.AU.play("chime");
  }
  if (t.flags.peek) { r.mods.peek = FQ.TW.drawEvent(); r.mods.omenTrue = Math.max(r.mods.omenTrue, 1); }
  FQ.save();
  if (r.hp <= 0) return FQ.TW.settle(false);
  FQ.TW.render();
  FQ.TW.postOutcome();
};

/* score count-up, shake on loss, floating numbers — the reveal's afterglow */
FQ.TW.postOutcome = function () {
  const t = FQ.TW.t;
  const powEl = document.getElementById("twpow");
  if (powEl) FQ.countUp(powEl, t.power, 520);
  const panel = document.querySelector(".twoutcome");
  const rect = panel ? panel.getBoundingClientRect() : null;
  const px = rect ? rect.left + rect.width / 2 : innerWidth / 2;
  const py = rect ? rect.top : innerHeight * 0.4;
  if (t.outcome === "lose") {
    FQ.shake();
    FQ.popNum(FQ.t("tw.lose"), px, py, "#ff8a70");
  } else if (t.outcome === "win") {
    FQ.popNum("⚡" + t.power, px, py, "var(--gold-hi)");
  }
};

/* ---------- ordeal rounds ---------- */
FQ.TW.ordealData = function () { return FQ.TOWER_ORDEALS.find(o => o.id === FQ.TW.t.ordeal.id); };
FQ.TW.settleOrdealRound = function (a, b, sa, sb) {
  const r = FQ.state.tower.run, t = FQ.TW.t, o = t.ordeal;
  o.power += t.power;
  [sa, sb].forEach(s => {
    if (s.elem === "水") o.water++;
    if (["star", "death", "kun", "uruz"].includes(s.id)) o.life++;
  });
  if (a.id === "algiz" && !a.rev) o.water += 2; /* Algiz answers the storm */
  if (b.id === "algiz" && !b.rev) o.water += 2;
  if (t.res === "contrast") o.contrast++;
  /* round skirmish: a light demand check to keep each round tense */
  const demand = 4 + Math.floor(r.layer / 4) + (t.flags.demand || 0) + (t.biteDemand || 0);
  t.demandShown = demand;
  const ok = t.flags.autowin || t.power >= demand;
  t.outcome = ok ? "win" : "lose";
  if (!ok && !t.flags.dodge) { FQ.TW.hp(-1); t.log.push("❤️ −1"); FQ.AU.play("bad"); }
  else FQ.AU.play("chime");
  o.met = FQ.TW.ordealMet();
  FQ.save();
  if (r.hp <= 0) return FQ.TW.settle(false);
  FQ.TW.render();
  FQ.TW.postOutcome();
};
FQ.TW.ordealMet = function () {
  const o = FQ.TW.t.ordeal, r = FQ.state.tower.run;
  switch (FQ.TW.ordealData().check) {
    case "water2": return o.water >= 2;
    case "power12": return o.paid || o.power >= 12;
    case "life9": return o.life >= 1 && o.power >= 9;
    case "contrast1": return o.contrast >= 1;
  }
  return false;
};
FQ.TW.ordealPay = function () {
  const r = FQ.state.tower.run, o = FQ.TW.t.ordeal;
  if (r.coins < 10) { FQ.toast(FQ.t("tw.coins.short")); return; }
  r.coins -= 10; o.paid = true; o.met = true;
  FQ.AU.play("buy");
  FQ.save(); FQ.TW.render();
};
FQ.TW.ordealNext = function () {
  const t = FQ.TW.t, o = t.ordeal, r = FQ.state.tower.run;
  if (o.met || o.round >= 3) {
    /* resolve the ordeal */
    if (o.met) {
      r.ordealsPassed++;
      r.dustRun += 3; r.coins += 6;
      t.ordealDone = "pass";
      FQ.AU.play("levelup"); FQ.confetti(); FQ.buzz([20, 30, 20]);
    } else {
      FQ.TW.hp(-4);
      t.ordealDone = "fail";
      FQ.AU.play("bad");
    }
    FQ.save();
    if (r.hp <= 0) return FQ.TW.settle(false);
    t.phase = "ordealEnd";
    FQ.TW.render();
    return;
  }
  o.round++;
  t.sel = []; t.phase = "select"; t.flags = {}; t.log = [];
  t.bitePow = 0; t.biteDemand = 0; t.omenHidden = false;
  FQ.TW.dealHand();
  FQ.TW.render();
};

/* ---------- rewards & progression ---------- */
FQ.TW.rewardOffers = function () {
  const r = FQ.state.tower.run;
  const pool = FQ.TW.pool(r.arch).filter(id => !r.deck.includes(id));
  const out = [];
  const p = pool.slice();
  while (out.length < 3 && p.length) out.push(p.splice(FQ.rand(p.length), 1)[0]);
  return out;
};
FQ.TW.toReward = function () {
  const t = FQ.TW.t;
  /* wonders pay out inside the event itself — no extra pick */
  if (t.outcome === "win" && t.ev && t.ev.type !== "wonder") {
    t.phase = "reward";
    t.offers = FQ.TW.rewardOffers();
    /* strong rewards may smuggle in a curse (塔之逆位) */
    t.rewardCursed = Math.random() < 0.22 && FQ.state.tower.run.layer >= 3;
    FQ.TW.render();
  } else FQ.TW.nextFloor();
};
FQ.TW.pickReward = function (id) {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (r.deck.filter(x => !FQ.towerIsCurse(x)).length >= 12) {
    t.replaceWith = id; FQ.TW.render(); return;
  }
  r.deck.push(id);
  if (t.rewardCursed) {
    const c = FQ.TOWER_CURSES[FQ.rand(FQ.TOWER_CURSES.length)];
    r.deck.push(c.id);
    FQ.toast(FQ.t("tw.reward.cursed", { t: c.sym + " " + FQ.bi(c, "zh", "en") }));
  }
  FQ.save();
  FQ.TW.nextFloor();
};
FQ.TW.doReplace = function (oldId) {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (FQ.towerIsCurse(oldId)) { FQ.toast(FQ.t("tw.curse.stuck")); return; }
  r.deck.splice(r.deck.indexOf(oldId), 1);
  r.deck.push(t.replaceWith);
  t.replaceWith = null;
  FQ.save();
  FQ.TW.nextFloor();
};
FQ.TW.skipReward = function (kind) {
  const r = FQ.state.tower.run;
  if (kind === "coins") { r.coins += 2; }
  if (kind === "purify") {
    const c = r.deck.find(FQ.towerIsCurse);
    if (c) { r.deck.splice(r.deck.indexOf(c), 1); FQ.toast(FQ.t("tw.purified", { t: FQ.bi(FQ.towerSym(c), "zh", "en") })); }
  }
  FQ.save();
  FQ.TW.nextFloor();
};
FQ.TW.giftPick = function (id) {
  const r = FQ.state.tower.run;
  if (r.deck.filter(x => !FQ.towerIsCurse(x)).length < 12) r.deck.push(id);
  FQ.save();
  FQ.TW.nextFloor();
};

FQ.TW.nextFloor = function () {
  const r = FQ.state.tower.run;
  if (r.mods.omenTrue > 0) r.mods.omenTrue--;
  if (r.layer >= 12) return FQ.TW.settle(true);
  r.layer++;
  FQ.save();
  FQ.TW.openFloor();
  FQ.TW.render();
};

/* caravan 商队 */
FQ.TW.buy = function (kind, id) {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (kind === "sym") {
    const cost = 6 + FQ.towerSym(id).power;
    if (r.coins < cost) { FQ.toast(FQ.t("tw.coins.short")); return; }
    if (r.deck.filter(x => !FQ.towerIsCurse(x)).length >= 12) { FQ.toast(FQ.t("tw.deck.full")); return; }
    r.coins -= cost; r.deck.push(id);
    t.caravan.offers = t.caravan.offers.filter(x => x !== id);
  }
  if (kind === "purify") {
    const c = r.deck.find(FQ.towerIsCurse);
    if (!c) { FQ.toast(FQ.t("tw.nocurse")); return; }
    if (r.coins < 8) { FQ.toast(FQ.t("tw.coins.short")); return; }
    r.coins -= 8; r.deck.splice(r.deck.indexOf(c), 1);
    FQ.toast(FQ.t("tw.purified", { t: FQ.bi(FQ.towerSym(c), "zh", "en") }));
  }
  if (kind === "heal") {
    if (r.coins < 5) { FQ.toast(FQ.t("tw.coins.short")); return; }
    if (r.hp >= r.hpMax) { FQ.toast(FQ.t("tw.hp.full")); return; }
    r.coins -= 5; FQ.TW.hp(3);
  }
  FQ.AU.play("buy");
  FQ.save(); FQ.TW.render();
};

/* ---------- settlement ---------- */
FQ.TW.settle = function (won, abandoned) {
  const r = FQ.state.tower.run;
  const meta = FQ.state.tower;
  const layers = won ? 12 : Math.max(0, r.layer - 1);
  const dust = layers + r.resCount + r.ordealsPassed * 2 + r.dustRun + (won ? 5 : 0);
  meta.runs++; if (won) meta.wins++;
  meta.best = Math.max(meta.best, layers);
  meta.resTotal += r.resCount;
  FQ.TW.last = { won, abandoned, layers, res: r.resCount, ordeals: r.ordealsPassed, dust, arch: r.arch };
  meta.run = null;
  FQ.save();
  FQ.gainDust(dust, true);
  FQ.recordReading("tower", 10 + layers * 2);
  if (won) FQ.confetti();
  FQ.nav("towerEnd");
};

/* ---------- screens ---------- */
FQ.SCREENS.tower = function () {
  const m = FQ.state.tower;
  const run = m.run;
  const featured = FQ.TW.featured();
  const archs = FQ.TOWER_ARCH.map(a => {
    const taught = FQ.Q.knows(a.id);            /* 师承 gates the paths */
    const unlocked = taught && m.unlockedArch.includes(a.id);
    const M = FQ.mentorFor(a.id);
    const place = M && FQ.CHAPTERS[0].nodes.find(n => n.id === M.at);
    return `
    <div class="archcard ${unlocked ? "" : "locked"}" style="--rc:${a.color}">
      <div class="ric">${taught ? FQ.art("arch-" + a.id, a.ic, "big") : "🔒"}</div>
      <b>${FQ.bi(a, "zh", "en")}</b>
      <div class="dim small">${taught ? FQ.bi(a, "skillZh", "skillEn")
        : FQ.t("locked.learn", { p: place ? FQ.bi(place, "zh", "en") : "?" })}</div>
      <div class="twsymrow">${a.deck.map(id => `<span class="minisym civ-${a.id}">${taught ? FQ.towerSym(id).sym : "·"}</span>`).join("")}</div>
      ${unlocked
        ? `<button class="btn sm block" onclick="FQ.TW.start('${a.id}')">${FQ.t("tw.climb")}</button>`
        : taught
          ? `<button class="btn ghost sm block" onclick="FQ.TW.unlockArch('${a.id}')">🔒 ${a.cost} ✨</button>`
          : `<button class="btn ghost sm block" disabled>🔒</button>`}
    </div>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.backBtn()}
    <h2>🗼 ${FQ.t("tw.name")}</h2>
    <p class="dim">${FQ.t("tw.tag")}</p>
    <div class="jres">
      <span class="pill dust">✨ <b>${FQ.state.stardust}</b></span>
      <span class="pill">${FQ.t("tw.best")} <b>${m.best}/12</b></span>
      <span class="pill">${FQ.t("tw.runs")} <b>${m.runs}</b></span>
      <span class="pill">🌈 <b>${m.resTotal}</b></span>
    </div>
    ${run ? `
      <div class="panel jbanner" onclick="FQ.nav('towerRun')">
        <b class="gold">${FQ.t("tw.resume")}</b>
        <div class="dim small">${FQ.t("tw.floor")} ${run.layer}/12 · ❤️${run.hp} · 💰${run.coins}</div>
      </div>` : ""}
    <div class="archrow">${archs}</div>
    <div class="panel">
      <h3>${FQ.t("tw.pool")} <span class="dim small">(${FQ.TW.pool().length}/${FQ.TOWER_SYMBOLS.length})</span></h3>
      <p class="dim small">${FQ.t("tw.pool.tip")}</p>
      ${featured.length ? `
        <p class="small gold" style="margin-top:10px">${FQ.t("tw.featured")}</p>
        <div class="twsymrow">${featured.map(id => `
          <div class="center">
            ${FQ.TW.symCard(id)}
            <button class="btn ghost sm" style="margin-top:6px" onclick="FQ.TW.buySym('${id}')">6 ✨</button>
          </div>`).join("")}
        </div>` : ""}
    </div>
    <div class="footer-note">${FQ.t("tw.rules")}</div>`;
};
FQ.TW.featured = function () {
  const owned = new Set(FQ.TW.pool("tarot").concat(FQ.TW.pool("iching")).concat(FQ.TW.pool("runes")));
  const missing = FQ.TOWER_SYMBOLS.map(s => s.id).filter(id => !owned.has(id));
  const r = FQ.seeded(FQ.dayKey() * 7);
  const out = [];
  const p = missing.slice();
  while (out.length < 3 && p.length) out.push(p.splice(Math.floor(r() * p.length), 1)[0]);
  return out;
};
FQ.TW.buySym = function (id) {
  if (!FQ.spendDust(6)) return;
  FQ.state.tower.unlockedSyms.push(id);
  FQ.save();
  FQ.toast(FQ.t("tw.pool.added", { t: FQ.bi(FQ.towerSym(id), "zh", "en") }));
  FQ.nav("tower");
};
FQ.TW.unlockArch = function (id) {
  const a = FQ.TW.arch(id);
  if (!FQ.spendDust(a.cost)) return;
  FQ.state.tower.unlockedArch.push(id);
  FQ.save();
  FQ.confetti();
  FQ.nav("tower");
};

FQ.SCREENS.towerRun = function () {
  if (!FQ.state.tower.run) return FQ.nav("tower");
  if (!FQ.TW.t || FQ.TW.t.stale) FQ.TW.openFloor();
  FQ.TW.render();
};
FQ.SCREENS.towerEnd = function () {
  const L = FQ.TW.last || { layers: 0, res: 0, ordeals: 0, dust: 0, won: false };
  document.getElementById("app").innerHTML = `
    <div class="panel center result" style="margin-top:40px">
      <div style="font-size:44px">${L.won ? "👑" : L.abandoned ? "🚪" : "🌫️"}</div>
      <h2 class="${L.won ? "gold" : ""}">${FQ.t(L.won ? "tw.victory" : L.abandoned ? "tw.left" : "tw.defeat")}</h2>
      <div class="jres" style="justify-content:center;margin-top:14px">
        <span class="pill">${FQ.t("tw.floor")} <b>${L.layers}/12</b></span>
        <span class="pill">🌈 <b>${L.res}</b></span>
        <span class="pill">⚔️ <b>${L.ordeals}/3</b></span>
      </div>
      <div class="lotgrade" style="margin-top:12px">✨ +${L.dust}</div>
      <div class="dim small">${FQ.t("tw.dust.how")}</div>
      <div style="margin-top:16px;display:flex;gap:10px;justify-content:center">
        <button class="btn" onclick="FQ.nav('tower')">${FQ.t("tw.again")}</button>
        <button class="btn ghost" onclick="FQ.nav('home')">${FQ.t("common.back").replace("← ", "")}</button>
      </div>
    </div>`;
};

/* ---------- run renderer ---------- */
FQ.TW.render = function () {
  const r = FQ.state.tower.run;
  if (!r) return;
  const t = FQ.TW.t;
  const a = FQ.TW.arch(r.arch);
  const track = Array.from({ length: 12 }, (_, i) => {
    const l = i + 1;
    const cls = l < r.layer ? "done" : l === r.layer ? "cur" : "";
    const mark = [4, 8, 12].includes(l) ? "⚔️" : [3, 9].includes(l) ? "🐫" : "";
    return `<span class="twdot ${cls}">${mark || l}</span>`;
  }).join("");
  const skillReady = r.skillFloor !== r.layer && FQ.state.stardust > 0;
  const head = `
    ${FQ.backBtn()}
    <div class="twtrack">${track}</div>
    <div class="jres">
      <span class="pill">❤️ <b>${r.hp}</b>/${r.hpMax}</span>
      <span class="pill">💰 <b>${r.coins}</b></span>
      ${r.shield ? `<span class="pill">🛡 <b>${r.shield}</b></span>` : ""}
      <span class="pill dust">✨ <b>${FQ.state.stardust}</b></span>
      <span class="pill">${a.ic} ${FQ.bi(a, "zh", "en")}</span>
      <button class="pill skillbtn ${skillReady ? "" : "off"}" onclick="FQ.TW.useSkill()"
        title="${FQ.bi(a, "skillZh", "skillEn")}">⚡ ${FQ.t("tw.skill")} · 1✨</button>
      <button class="pill off" onclick="FQ.TW.abandon()">🚪</button>
    </div>`;

  let body = "";
  if (t.caravan) body = FQ.TW.renderCaravan();
  else if (t.ordeal) body = FQ.TW.renderOrdeal();
  else body = FQ.TW.renderEvent();

  document.getElementById("app").innerHTML = head + body + `
    <div class="panel twdeck">
      <div class="small dim">${FQ.t("tw.deck")} (${r.deck.length}/12+)</div>
      <div class="twsymrow">${r.deck.map(id => {
        const s = FQ.towerSym(id);
        return `<span class="minisym ${FQ.towerIsCurse(id) ? "curse" : "civ-" + s.civ}" title="${FQ.bi(s, "zh", "en")}">${s.sym}</span>`;
      }).join("")}</div>
    </div>`;
  window.scrollTo(0, 0);
};

FQ.TW.handHTML = function () {
  const t = FQ.TW.t;
  return `<div class="twhand">` + t.hand.map((h, i) => {
    const s = FQ.towerSym(h.id);
    const isCurse = FQ.towerIsCurse(h.id);
    const revealed = t.phase !== "select" && t.sel.includes(i);
    const selected = t.sel.includes(i);
    const omen = t.phase === "select" && !isCurse && h.omen !== 0
      ? `<span class="twomen ${h.omen > 0 ? "good" : "ill"}">${h.omen > 0 ? "✦" : "◦"}</span>` : "";
    if (isCurse) return `
      <div class="twcard illum curse" onclick="FQ.TW.toggleSel(${i})">
        ${FQ.illumCard({ glyph: s.sym, name: FQ.bi(s, "zh", "en"), sub: FQ.bi(s, "dZh", "dEn"), civ: "curse" })}
      </div>`;
    if (!revealed) return `
      <div class="twcard back ${selected ? "sel" : ""}" onclick="FQ.TW.toggleSel(${i})">
        <div class="twcard-face">${FQ.art("card-back", "✦", "big")}${omen}</div>
      </div>`;
    return `
      <div class="twcard illum open civ-${s.civ} ${h.rev ? "rev" : ""} ${t.flipMode ? "flippable" : ""}"
           onclick="${t.flipMode ? `FQ.TW.flipCard(${i})` : ""}">
        ${FQ.illumCard({ glyph: s.sym, civ: s.civ, rev: h.rev, power: s.power, art: h.id,
          name: FQ.bi(s, "zh", "en") + (h.rev ? FQ.t("tarot.rev") : ""),
          sub: h.rev ? FQ.bi(s, "rvZh", "rvEn") : FQ.bi(s, "upZh", "upEn") })}
      </div>`;
  }).join("") + `</div>`;
};

FQ.TW.resHTML = function () {
  const t = FQ.TW.t;
  if (t.phase === "select" || t.phase === "reveal" || !t.sel.length) return "";
  const [a, b] = t.sel.map(i => FQ.towerSym(t.hand[i].id));
  if (t.res === "kin") return `
    <div class="twres kin">🜂 ${FQ.t("tw.res.kin")} <span class="dim small">${FQ.t("tw.res.kin.d")}</span></div>`;
  if (t.res === "contrast") return `
    <div class="twres contrast">🌈 ${FQ.t("tw.res.contrast")} <span class="dim small">${FQ.t("tw.res.contrast.d")}</span>
      <div class="twnotes">
        <div class="twnote"><b>${a.sym} ${FQ.bi(a, "zh", "en")}</b> · ${FQ.bi(a, "nZh", "nEn")}</div>
        <div class="twnote"><b>${b.sym} ${FQ.bi(b, "zh", "en")}</b> · ${FQ.bi(b, "nZh", "nEn")}</div>
      </div>
    </div>`;
  return `<div class="twres none">☾ ${FQ.t("tw.res.none")}</div>`;
};

FQ.TW.renderEvent = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  const ev = t.ev;
  const TYPE = { scenery: "🍃", parley: "💬", peril: "🎲", wonder: "🌟" };
  const depthBump = Math.floor((r.layer - 1) / 4);

  /* wonders: no play needed */
  if (ev.type === "wonder" && t.phase === "select") {
    t.phase = "revealed"; t.res = null; t.outcome = "win";
    const log = t.log = [];
    t.flags = {};
    FQ.TW.applyOps(ev.win, 1, log);
    if (t.flags.peek) { r.mods.peek = FQ.TW.drawEvent(); r.mods.omenTrue = Math.max(r.mods.omenTrue, 1); }
    t.phase = "outcome";
    FQ.save();
  }

  let zone = "";
  if (t.phase === "select") {
    zone = `
      ${t.biteLog && t.biteLog.length ? `<div class="edged">${t.biteLog.join("<br>")}</div>` : ""}
      ${FQ.TW.handHTML()}
      <div class="center" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="btn" ${t.sel.length === 2 ? "" : "disabled"} onclick="FQ.TW.reveal()">${FQ.t("tw.play2")}</button>
        <button class="btn ghost" ${t.discarded || !t.sel.length ? "disabled" : ""}
          onclick="FQ.TW.discard()" title="${FQ.t("tw.discard.tip")}">🔄 ${FQ.t("tw.discard")}</button>
      </div>`;
  } else if (t.phase === "reveal") {
    zone = `${FQ.TW.handHTML()}<div class="center dim small">…</div>`;
  } else if (t.phase === "revealed") {
    zone = `
      ${FQ.TW.handHTML()}
      ${FQ.TW.resHTML()}
      ${t.flipMode ? `<div class="center small gold">${FQ.t("tw.skill.flip.pick")}</div>` : ""}
      <div class="center" style="margin-top:8px">
        <button class="btn" onclick="FQ.TW.settleBtn()">${FQ.t("tw.settle")}</button>
      </div>`;
  } else if (t.phase === "outcome") {
    const badge = { win: "✅ " + FQ.t("tw.win"), lose: "❌ " + FQ.t("tw.lose"),
      freeze: "🧊 " + FQ.t("tw.frozen"), reroll: "🔄 " + FQ.t("tw.rerolled") }[t.outcome];
    zone = `
      ${t.outcome !== "reroll" && ev.type !== "wonder" ? FQ.TW.handHTML() : ""}
      ${FQ.TW.resHTML()}
      <div class="twoutcome result ${t.outcome}">
        <b class="${t.outcome === "win" ? "gold" : ""}">${badge}</b>
        ${ev.demand ? ` · ⚡<span class="twpow" id="twpow">0</span> <span class="dim small">vs 🎯${t.demandShown}</span>` : ""}
        <div class="twlog">${t.log.map(l => `<div>${l}</div>`).join("")}</div>
      </div>
      ${t.outcome === "reroll" ? "" : `
      <div class="center" style="margin-top:8px">
        <button class="btn" onclick="FQ.TW.toReward()">${t.outcome === "win" && ev.type !== "wonder" ? FQ.t("tw.loot") : FQ.t("tw.next")}</button>
      </div>`}`;
    if (t.outcome === "win" && ev.type === "wonder" && t.flags.gift) {
      const gifts = FQ.TW.rewardOffers().slice(0, 2);
      zone += `<div class="twsymrow center-row">${gifts.map(id => `
        <div class="center">${FQ.TW.symCard(id, { on: `FQ.TW.giftPick('${id}')` })}</div>`).join("")}</div>`;
    }
  } else if (t.phase === "reward") {
    zone = FQ.TW.renderReward();
  }

  return `
    <div class="panel twevent t-${ev.type}">
      <div class="twtype">${TYPE[ev.type]} ${FQ.t("tw.type." + ev.type)} · ${FQ.t("tw.floor")} ${r.layer}</div>
      <h3>${ev.ic} ${FQ.bi(ev, "zh", "en")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.bi(ev, "tZh", "tEn")}</div>
      ${ev.demand ? `<div class="small">🎯 ${FQ.t("tw.demand")} <b class="gold">${Math.max(0, ev.demand + depthBump + (t.biteDemand || 0))}</b>
        ${ev.risk ? ` · ⚠️ ${"▮".repeat(ev.risk)}` : ""}</div>` : ""}
    </div>
    ${zone}`;
};

FQ.TW.renderReward = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  if (t.replaceWith) {
    return `
      <div class="panel">
        <p class="small gold">${FQ.t("tw.replace")}</p>
        <div class="twsymrow">${r.deck.filter(id => !FQ.towerIsCurse(id)).map(id =>
          FQ.TW.symCard(id, { on: `FQ.TW.doReplace('${id}')` })).join("")}</div>
        <button class="btn ghost sm" onclick="FQ.TW.t.replaceWith=null;FQ.TW.nextFloor()">${FQ.t("tw.skip")}</button>
      </div>`;
  }
  const hasCurse = r.deck.some(FQ.towerIsCurse);
  return `
    <div class="panel">
      <p class="small gold">${FQ.t("tw.reward.pick")}${t.rewardCursed ? ` <span class="dim">· ${FQ.t("tw.reward.risk")}</span>` : ""}</p>
      <div class="twsymrow">${(t.offers || []).map(id => FQ.TW.symCard(id, { on: `FQ.TW.pickReward('${id}')` })).join("") || `<span class="dim small">${FQ.t("tw.pool.empty")}</span>`}</div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        ${hasCurse ? `<button class="btn ghost sm" onclick="FQ.TW.skipReward('purify')">🧹 ${FQ.t("tw.reward.purify")}</button>` : ""}
        <button class="btn ghost sm" onclick="FQ.TW.skipReward('coins')">💰 ${FQ.t("tw.reward.coins")}</button>
      </div>
    </div>`;
};

FQ.TW.renderOrdeal = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t, o = t.ordeal;
  const O = FQ.TW.ordealData();
  if (t.phase === "ordealEnd") {
    return `
      <div class="panel twevent t-ordeal">
        <h3>${O.ic} ${FQ.bi(O, "zh", "en")}</h3>
        <div class="twoutcome result">
          <b class="${t.ordealDone === "pass" ? "gold" : ""}">${t.ordealDone === "pass" ? "⚔️ " + FQ.t("tw.ordeal.pass") : "💀 " + FQ.t("tw.ordeal.fail")}</b>
          <div class="dim small">${t.ordealDone === "pass" ? "✨+3 · 💰+6" : "❤️ −4"}</div>
        </div>
        <div class="center"><button class="btn" onclick="FQ.TW.nextFloor()">${FQ.t("tw.next")}</button></div>
      </div>`;
  }
  const progress = { water2: `💧 ${o.water}/2`, power12: `⚡ ${o.power}/12`,
    life9: `🌱 ${o.life}/1 · ⚡ ${o.power}/9`, contrast1: `🌈 ${o.contrast}/1` }[O.check];
  let zone = "";
  if (t.phase === "select") {
    zone = `
      ${t.biteLog && t.biteLog.length ? `<div class="edged">${t.biteLog.join("<br>")}</div>` : ""}
      ${FQ.TW.handHTML()}
      <div class="center" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button class="btn" ${t.sel.length === 2 ? "" : "disabled"} onclick="FQ.TW.reveal()">${FQ.t("tw.play2")}</button>
        <button class="btn ghost" ${t.discarded || !t.sel.length ? "disabled" : ""}
          onclick="FQ.TW.discard()" title="${FQ.t("tw.discard.tip")}">🔄 ${FQ.t("tw.discard")}</button>
        ${O.check === "power12" && !o.paid ? `<button class="btn ghost" onclick="FQ.TW.ordealPay()">💰10 ${FQ.t("tw.ordeal.pay")}</button>` : ""}
      </div>`;
  } else if (t.phase === "reveal") {
    zone = `${FQ.TW.handHTML()}<div class="center dim small">…</div>`;
  } else if (t.phase === "revealed") {
    zone = `
      ${FQ.TW.handHTML()}
      ${FQ.TW.resHTML()}
      ${t.flipMode ? `<div class="center small gold">${FQ.t("tw.skill.flip.pick")}</div>` : ""}
      <div class="center" style="margin-top:8px"><button class="btn" onclick="FQ.TW.settleBtn()">${FQ.t("tw.settle")}</button></div>`;
  } else if (t.phase === "outcome") {
    zone = `
      ${FQ.TW.handHTML()}
      ${FQ.TW.resHTML()}
      <div class="twoutcome result ${t.outcome}">
        <b class="${t.outcome === "win" ? "gold" : ""}">${t.outcome === "win" ? "✅" : "❌"}</b>
        ⚡<span class="twpow" id="twpow">0</span> <span class="dim small">vs 🎯${t.demandShown}</span>
        <div class="twlog">${t.log.map(l => `<div>${l}</div>`).join("")}</div>
        ${o.met ? `<div class="gold small">${FQ.t("tw.ordeal.met")}</div>` : ""}
      </div>
      <div class="center"><button class="btn" onclick="FQ.TW.ordealNext()">
        ${o.met || o.round >= 3 ? FQ.t("tw.ordeal.resolve") : FQ.t("tw.ordeal.round", { n: o.round + 1 })}</button></div>`;
  }
  return `
    <div class="panel twevent t-ordeal">
      <div class="twtype">⚔️ ${FQ.t("tw.type.ordeal")} · ${FQ.t("tw.round")} ${o.round}/3</div>
      <h3>${O.ic} ${FQ.bi(O, "zh", "en")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.bi(O, "tZh", "tEn")}</div>
      <div class="small">🎯 <b class="gold">${FQ.bi(O, "needZh", "needEn")}</b> · ${progress}</div>
    </div>
    ${zone}`;
};

FQ.TW.renderCaravan = function () {
  const r = FQ.state.tower.run, t = FQ.TW.t;
  const hasCurse = r.deck.some(FQ.towerIsCurse);
  return `
    <div class="panel twevent t-caravan">
      <div class="twtype">🐫 ${FQ.t("tw.type.caravan")} · ${FQ.t("tw.floor")} ${r.layer}</div>
      <h3>🐫 ${FQ.t("tw.caravan.title")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.t("tw.caravan.text")}</div>
      <div class="twsymrow">${t.caravan.offers.map(id => `
        <div class="center">
          ${FQ.TW.symCard(id)}
          <button class="btn ghost sm" style="margin-top:6px" onclick="FQ.TW.buy('sym','${id}')">💰${6 + FQ.towerSym(id).power}</button>
        </div>`).join("") || `<span class="dim small">${FQ.t("tw.pool.empty")}</span>`}</div>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
        ${hasCurse ? `<button class="btn ghost sm" onclick="FQ.TW.buy('purify')">🧹 ${FQ.t("tw.caravan.purify")} 💰8</button>` : ""}
        <button class="btn ghost sm" onclick="FQ.TW.buy('heal')">💊 ${FQ.t("tw.caravan.heal")} 💰5</button>
        <button class="btn sm" onclick="FQ.TW.nextFloor()">${FQ.t("tw.caravan.leave")}</button>
      </div>
    </div>`;
};
