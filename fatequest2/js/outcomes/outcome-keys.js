/* Outcome matrix: symbol → key → omen/story/fx (GDD dual-edge results) */
window.FQ = window.FQ || {};
FQ.OUTCOMES = FQ.OUTCOMES || {};

FQ.ELEM_EN = { "火": "fire", "土": "earth", "风": "air", "水": "water" };
FQ.JB_FACES = ["sheng", "xiao", "yin"];
FQ.COIN_SEQ_LEN = 4;

/* ---------- expected key spaces ---------- */
FQ.outcomeKeysFor = function (gateType) {
  if (gateType === "tarotAny" || gateType === "tarotLow") {
    return FQ.TAROT.map(c => "tarot:" + c.id);
  }
  if (gateType === "ichingYang" || gateType === "meihua") {
    return FQ.HEXAGRAMS.map(h => "hex:" + h.n);
  }
  if (gateType.startsWith("dice")) {
    const keys = [];
    (FQ.DICE_PLANETS || []).forEach((p, pi) => {
      ["火", "土", "风", "水"].forEach(el => keys.push("dice:" + pi + ":" + FQ.ELEM_EN[el]));
    });
    return keys;
  }
  if (gateType === "lot") {
    return (FQ.LOTS || []).map((l, i) => "lot:" + (l.id != null ? l.id : i));
  }
  if (gateType === "jiaobei") {
    const faces = FQ.JB_FACES, keys = [];
    for (const a of faces) for (const b of faces) for (const c of faces) keys.push("jiaobei:" + a + "-" + b + "-" + c);
    return keys;
  }
  if (gateType === "coinYang") {
    const keys = [], n = FQ.COIN_SEQ_LEN, total = 1 << n;
    for (let i = 0; i < total; i++) {
      let s = "";
      for (let b = 0; b < n; b++) s += (i >> b) & 1 ? "Y" : "N";
      keys.push("coin:" + s);
    }
    return keys;
  }
  if (gateType === "dreamChoice") {
    return Array.from({ length: 16 }, (_, i) => "dream:" + i);
  }
  return [];
};

/* ---------- key from ritual payload ---------- */
FQ.outcomeKey = function (gateType, payload) {
  if (!payload) return null;
  if (gateType === "tarotAny" || gateType === "tarotLow") {
    return "tarot:" + payload.card.id;
  }
  if (gateType === "meihua") {
    return "hex:" + payload.primary.n;
  }
  if (gateType === "ichingYang") {
    const cast = Array.isArray(payload) ? FQ.resolveCast(payload) : payload;
    return "hex:" + (cast.primary || cast).n;
  }
  if (gateType.startsWith("dice")) {
    const pi = FQ.DICE_PLANETS.indexOf(payload.planet);
    const el = FQ.ELEM_EN[payload.sign.elemZh] || "fire";
    return "dice:" + (pi < 0 ? 0 : pi) + ":" + el;
  }
  if (gateType === "lot") {
    const i = FQ.LOTS.indexOf(payload);
    const id = payload.id != null ? payload.id : (i >= 0 ? i : 0);
    return "lot:" + id;
  }
  if (gateType === "jiaobei") {
    const seq = payload.seq || [payload.res.id];
    while (seq.length < 3) seq.push(FQ.throwJiaobei().res.id);
    return "jiaobei:" + seq.slice(0, 3).join("-");
  }
  if (gateType === "coinYang") {
    const seq = payload.seq || [(payload.yang ? "Y" : "N")];
    while (seq.length < FQ.COIN_SEQ_LEN) seq.push(Math.random() < 0.5 ? "Y" : "N");
    return "coin:" + seq.slice(0, FQ.COIN_SEQ_LEN).join("");
  }
  if (gateType === "dreamChoice") {
    return "dream:" + (payload.idx != null ? payload.idx : 0);
  }
  return null;
};

FQ.resolveOutcome = function (nodeId, key) {
  const table = FQ.OUTCOMES[nodeId];
  if (!table || !key) return null;
  return table[key] || null;
};

FQ.validateOutcomes = function () {
  const report = [];
  const chs = FQ.CHAPTERS || [];
  chs.forEach(ch => {
    (ch.nodes || []).forEach(n => {
      if (!n.gate || n.gate.type === "case") return;
      const need = FQ.outcomeKeysFor(n.gate.type);
      const table = FQ.OUTCOMES[n.id] || {};
      const keys = Object.keys(table);
      const missing = need.filter(k => !table[k]);
      const ops = new Set(["days", "coins", "favor", "favorLocal", "dust", "flag", "join", "cfavor",
        "token", "tool", "goods", "sellBest", "forecast", "hp", "lose", "path", "story", "quest"]);
      let bad = 0;
      keys.forEach(k => {
        const e = table[k];
        if (!e || !e.omenZh || !e.omenEn || !e.storyZh || !e.storyEn) bad++;
        (e.fx || []).forEach(op => { if (!ops.has(op.op)) bad++; });
      });
      report.push({
        id: n.id, type: n.gate.type, count: keys.length,
        ok: keys.length >= 16 && missing.length === 0 && bad === 0,
        missing: missing.length, bad
      });
    });
  });
  return report;
};
