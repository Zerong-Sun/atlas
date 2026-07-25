/* v3 effect opcode runner — SYSTEM_TABLES vocabulary */
window.FQ = window.FQ || {};

FQ._t = function (obj) {
  if (FQ.T) return FQ.T(obj);
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return (FQ.lang === "en" ? obj.en : obj.zh) || obj.zh || obj.en || "";
};

FQ.ensureWorld = function () {
  if (!FQ.state.world) {
    FQ.state.world = {
      version: 3,
      at: null,
      archetype: null,
      birth: null,
      fate: { travel: 15, rapport: 15, wealth: 15 },
      culture: null,
      faith: null,
      name: null,
      coins: 40,
      currency: "ducat",
      bag: [],
      bagSlots: 12,
      days: 0,
      years: 0,
      visited: [],
      unlockedCities: [],
      unlockedRoutes: [],
      learned: [],
      retainers: [],
      reputation: {},
      flags: {},
      codex: [],
      stickers: [],
      languages: [],
      log: [],
      stopped: false,
      endingId: null
    };
  }
  const w = FQ.state.world;
  w.visited = w.visited || [];
  w.unlockedCities = w.unlockedCities || [];
  w.unlockedRoutes = w.unlockedRoutes || [];
  w.learned = w.learned || [];
  w.retainers = w.retainers || [];
  w.bag = w.bag || [];
  w.flags = w.flags || {};
  w.codex = w.codex || [];
  w.stickers = w.stickers || [];
  w.languages = w.languages || [];
  w.reputation = w.reputation || {};
  w.log = w.log || [];
  return w;
};

FQ.worldNote = function (ic, line) {
  const w = FQ.ensureWorld();
  w.log.unshift({ ic: ic || "·", line, at: w.at, days: w.days });
  if (w.log.length > 80) w.log.length = 80;
};

FQ.applyEffects = function (list, ctx) {
  const w = FQ.ensureWorld();
  const effects = list || [];
  const summary = [];
  const result = { ok: true, summary, blocked: null };

  /* Preflight: refuse spending coins if a following goods add would fail for lack of bag space */
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i];
    if (e && e.op === "goods" && (e.value == null || e.value > 0)) {
      const slot = w.bag.find(b => b.kind === "goods" && b.id === e.id);
      if (!slot && w.bag.length >= w.bagSlots) {
        result.ok = false;
        result.blocked = "bag_full";
        return result;
      }
    }
  }

  for (const e of effects) {
    if (!e || !e.op) continue;
    switch (e.op) {
      case "coins": {
        const next = (w.coins || 0) + (e.value || 0);
        if (e.value < 0 && next < 0) {
          result.ok = false;
          result.blocked = "coins";
          FQ.save();
          return result;
        }
        w.coins = next;
        summary.push((e.value >= 0 ? "+" : "") + e.value + "💰");
        break;
      }
      case "days": {
        const d = e.value || 0;
        w.days = Math.max(0, (w.days || 0) + d);
        w.years = Math.floor(w.days / 365);
        summary.push((d >= 0 ? "+" : "") + d + "日");
        break;
      }
      case "goods": {
        const id = e.id;
        if (!id) break;
        let slot = w.bag.find(b => b.kind === "goods" && b.id === id);
        const n = e.value == null ? 1 : e.value;
        if (n < 0) {
          if (slot) { slot.n += n; if (slot.n <= 0) w.bag = w.bag.filter(b => b !== slot); }
        } else if (slot) slot.n += n;
        else if (w.bag.length < w.bagSlots) w.bag.push({ kind: "goods", id, n });
        else {
          result.ok = false;
          result.blocked = "bag_full";
          break;
        }
        summary.push((FQ.DB && FQ.DB.good[id] ? FQ._t(FQ.DB.good[id].name) : id) + "×" + n);
        break;
      }
      case "item":
        if (e.value && !w.bag.some(b => b.kind === "item" && b.id === e.value)) {
          if (w.bag.length < w.bagSlots) w.bag.push({ kind: "item", id: e.value, n: 1 });
          else { result.ok = false; result.blocked = "bag_full"; break; }
        }
        summary.push("item:" + e.value);
        break;
      case "reputation": {
        const key = (e.scope || "city") + ":" + (e.id || w.at || "world");
        w.reputation[key] = (w.reputation[key] || 0) + (e.value || 0);
        summary.push("声望" + (e.value >= 0 ? "+" : "") + e.value);
        break;
      }
      case "faith":
        if (e.value) w.faith = e.value;
        w.flags.faithChanges = (w.flags.faithChanges || 0) + 1;
        summary.push("信仰→" + e.value);
        break;
      case "language":
        if (e.value && !w.languages.includes(e.value)) w.languages.push(e.value);
        break;
      case "etiquette":
        w.flags["eti:" + (e.value || "local")] = (w.flags["eti:" + (e.value || "local")] || 0) + 1;
        break;
      case "fate": {
        const stat = e.stat || "travel";
        if (!w.fate) w.fate = { travel: 15, rapport: 15, wealth: 15 };
        w.fate[stat] = Math.max(0, Math.min(31, (w.fate[stat] || 15) + (e.value || 0)));
        summary.push(stat + (e.value >= 0 ? "+" : "") + e.value);
        break;
      }
      case "unlockRoute":
        if (e.value && !w.unlockedRoutes.includes(e.value)) {
          w.unlockedRoutes.push(e.value);
          const rt = FQ.DB && FQ.DB.route[e.value];
          if (rt) {
            /* Unlock far end so map fog reveals the destination of this road */
            if (!w.unlockedCities.includes(rt.to)) w.unlockedCities.push(rt.to);
            if (!w.unlockedCities.includes(rt.from)) w.unlockedCities.push(rt.from);
          }
        }
        summary.push("路开");
        break;
      case "revealMap": {
        const v = e.value;
        if (!v) break;
        if (FQ.DB && FQ.DB.route[v]) {
          if (!w.unlockedRoutes.includes(v)) w.unlockedRoutes.push(v);
          const rt = FQ.DB.route[v];
          [rt.from, rt.to].forEach(id => {
            if (!w.unlockedCities.includes(id)) w.unlockedCities.push(id);
          });
        } else if (FQ.DB && FQ.DB.city[v]) {
          if (!w.unlockedCities.includes(v)) w.unlockedCities.push(v);
        } else if (String(v).startsWith("rt-") && !w.unlockedRoutes.includes(v)) {
          w.unlockedRoutes.push(v);
        } else if (!w.unlockedCities.includes(v)) {
          w.unlockedCities.push(v);
        }
        summary.push("图开");
        break;
      }
      case "learnDivination": {
        const id = e.value;
        if (!id) break;
        const aliases = id === "lot" ? ["lot", "jiaobei"] : id === "jiaobei" ? ["jiaobei", "lot"] : [id];
        aliases.forEach(d => {
          if (!w.learned.includes(d)) w.learned.push(d);
          if (FQ.state.learned && !FQ.state.learned.includes(d)) FQ.state.learned.push(d);
        });
        summary.push("学·" + id);
        break;
      }
      case "recruit":
        if (e.value && !w.retainers.includes(e.value)) w.retainers.push(e.value);
        summary.push("募·" + e.value);
        break;
      case "retainerMood":
        w.flags["mood:" + (e.id || "party")] = (w.flags["mood:" + (e.id || "party")] || 0) + (e.value || 0);
        break;
      case "sticker":
        if (e.value && !w.stickers.includes(e.value)) w.stickers.push(e.value);
        break;
      case "codex":
        if (e.value && !w.codex.includes(e.value)) w.codex.push(e.value);
        break;
      case "flag":
        if (e.value) w.flags[e.value] = true;
        break;
      case "goto":
        if (ctx) ctx.goto = e.value;
        break;
      default:
        console.warn("unknown effect op", e.op);
    }
  }
  FQ.save();
  return result;
};

FQ.rollDivination = function (divId) {
  const w = FQ.ensureWorld();
  const known = (w.learned || []).includes(divId) || (FQ.state.learned || []).includes(divId);
  const fate = w.fate || { travel: 15, rapport: 15, wealth: 15 };
  const boost = known ? 0.15 : 0;
  const score = (fate.travel + fate.rapport) / 62 + boost + Math.random() * 0.35;
  return score >= 0.48;
};

FQ.checkEndings = function () {
  if (!FQ.DB) return null;
  const w = FQ.ensureWorld();
  for (const end of FQ.DB.endings) {
    if (end.layer === 1) continue;
    const c = end.conditions || {};
    let ok = true;
    if (Array.isArray(c.visitedCities)) {
      ok = c.visitedCities.every(id => w.visited.includes(id));
    } else if (typeof c.visitedCities === "number") {
      ok = w.visited.length >= c.visitedCities;
    }
    if (ok && c.flags) ok = c.flags.every(f => w.flags[f]);
    if (ok && c.learnedDivinations) {
      ok = c.learnedDivinations.every(d => w.learned.includes(d) || (FQ.state.learned || []).includes(d));
    }
    if (ok && c.routesOpened != null) ok = w.unlockedRoutes.length >= c.routesOpened;
    if (ok && c.netWorth != null) ok = w.coins >= c.netWorth;
    if (ok && c.returnedToStart === false) ok = w.at !== (FQ.DB.archetype[w.archetype] || {}).start;
    if (ok && c.reputationBands != null) {
      const bands = new Set(Object.keys(w.reputation).map(k => k.split(":")[0]));
      ok = bands.size >= c.reputationBands || Object.keys(w.reputation).length >= c.reputationBands;
    }
    if (ok && c.faithChanges != null) ok = (w.flags.faithChanges || 0) >= c.faithChanges;
    if (ok && c.languages != null) ok = w.languages.length >= c.languages;
    if (ok) return end;
  }
  return null;
};

FQ.renderEpilogue = function (ending) {
  const w = FQ.ensureWorld();
  const city = FQ.DB && FQ.DB.city[w.at];
  const arch = FQ.DB && FQ.DB.archetype[w.archetype];
  let text = FQ._t(ending.epilogue);
  const vars = {
    lastCity: city ? FQ._t(city.name) : w.at,
    cities: String(w.visited.length),
    years: String(w.years || Math.floor((w.days || 0) / 365)),
    start: arch ? FQ._t((FQ.DB.city[arch.start] && FQ.DB.city[arch.start].name) || { zh: arch.start, en: arch.start }) : "",
    faith: w.faith || "",
    longestRoute: String(w.unlockedRoutes.length),
    richestTrade: String(w.coins)
  };
  Object.keys(vars).forEach(k => { text = text.replace(new RegExp("\\{" + k + "\\}", "g"), vars[k]); });
  return text;
};
