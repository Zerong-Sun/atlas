/* 占途 · 千载行纪 — journey mode engine (loads after app.js) */
window.FQ = window.FQ || {};
FQ.J = {};

/* ---------- state ---------- */
FQ.J.ensure = function () {
  const ch = FQ.CHAPTERS[0];
  if (!FQ.state.journey || FQ.state.journey.ch !== ch.id) {
    FQ.state.journey = Object.assign({
      ch: ch.id, node: 0, coins: ch.startCoins,
      hp: 5, hpMax: 5,
      favor: { chr: 0, isl: 0, con: 0, mazu: 0 },
      gates: [], ending: null,
      quests: {}, stories: [], bag: [],
      completed: (FQ.state.journey && FQ.state.journey.completed) || []
    }, FQ.state.journey && FQ.state.journey.ch === ch.id ? FQ.state.journey : {});
    FQ.save();
  }
  const j = FQ.state.journey;
  if (j.hp == null) { j.hp = 5; j.hpMax = 5; }
  if (!j.quests) j.quests = {};
  if (!j.stories) j.stories = [];
  if (!j.bag) j.bag = [];
  return j;
};
FQ.J.chapter = () => FQ.CHAPTERS[0];
FQ.J.favorTotal = j => Object.values(j.favor).reduce((s, v) => s + v, 0);
FQ.J.tmp = { tries: 0, passed: false, result: null };

/* ---------- map ---------- */
FQ.J.mapSVG = function () {
  const ch = FQ.J.chapter();
  const j = FQ.J.ensure();
  const R = FQ.JOURNEY_REGIONS;
  /* region blobs (stylized old-map washes) */
  const regions = `
    <path d="M20,40 Q120,20 240,70 L250,230 Q140,260 30,220 Z" fill="${R.chr.color}" opacity="0.13"/>
    <path d="M250,70 Q340,110 420,240 L430,330 Q330,330 250,230 Z" fill="${R.isl.color}" opacity="0.13"/>
    <path d="M420,40 Q600,20 780,60 L790,230 Q640,210 430,240 Z" fill="${R.con.color}" opacity="0.13"/>
    <path d="M430,240 Q620,250 790,230 L790,400 Q560,410 430,330 Z" fill="${R.mazu.color}" opacity="0.15"/>
    <text x="90" y="60" class="jrl" fill="${R.chr.color}">${FQ.bi(R.chr, "zh", "en")}</text>
    <text x="300" y="300" class="jrl" fill="${R.isl.color}">${FQ.bi(R.isl, "zh", "en")}</text>
    <text x="560" y="55" class="jrl" fill="${R.con.color}">${FQ.bi(R.con, "zh", "en")}</text>
    <text x="590" y="390" class="jrl" fill="${R.mazu.color}">${FQ.bi(R.mazu, "zh", "en")}</text>`;
  /* decorations */
  const deco = `
    <g class="jdeco">
      <path d="M470,120 l14,-20 14,20 M492,120 l12,-16 12,16" />
      <path d="M120,300 q10,-8 20,0 q10,8 20,0 M150,320 q10,-8 20,0" />
      <path d="M640,350 q10,-8 20,0 q10,8 20,0 M540,368 q10,-8 20,0" />
      <circle cx="770" cy="330" r="20" /><path d="M770,312 v36 M752,330 h36 M757,317 l26,26 M783,317 l-26,26" />
    </g>`;
  /* route */
  const pts = ch.nodes.map(n => `${n.x},${n.y}`).join(" ");
  const doneCount = j.node;
  const donePts = ch.nodes.slice(0, Math.min(doneCount + 1, ch.nodes.length)).map(n => `${n.x},${n.y}`).join(" ");
  /* nodes */
  const nodes = ch.nodes.map((n, i) => {
    const st = i < j.node ? "done" : i === j.node ? "cur" : "lock";
    const glyph = n.gate.type === "case" ? "❖" : st === "done" ? "✓" : i + 1;
    return `
      <g class="jn ${st}" onclick="FQ.J.openNode(${i})" style="cursor:${i <= j.node ? "pointer" : "default"}">
        <circle cx="${n.x}" cy="${n.y}" r="13"/>
        <text x="${n.x}" y="${n.y + 4}" class="jni">${glyph}</text>
        <text x="${n.x}" y="${n.y - 20}" class="jnl">${FQ.bi(n, "zh", "en")}</text>
      </g>`;
  }).join("");
  return `
  <svg viewBox="0 0 820 420" class="jmap" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="812" height="412" rx="14" class="jparch"/>
    ${regions}${deco}
    <polyline points="${pts}" class="jroute"/>
    <polyline points="${donePts}" class="jroute-done"/>
    ${nodes}
  </svg>`;
};

/* ---------- screen ---------- */
FQ.SCREENS.journey = function () {
  const ch = FQ.J.chapter();
  const j = FQ.J.ensure();
  FQ.J.tmp = { tries: 0, passed: false, result: null };
  const completed = j.completed.includes(ch.id);
  document.getElementById("app").innerHTML = `
    ${FQ.backBtn()}
    <h2>${FQ.t("journey.name")} 🐪</h2>
    <div class="dim small">${FQ.bi(ch, "nameZh", "nameEn")} · ${FQ.bi(ch, "taglineZh", "taglineEn")}</div>
    <div class="jres">
      <span class="pill">❤️ <b>${j.hp}/${j.hpMax}</b></span>
      <span class="pill">💰 ${FQ.t("journey.coins")} <b>${j.coins}</b></span>
      <span class="pill">🕯️ ${FQ.t("journey.favor")} <b>${FQ.J.favorTotal(j)}</b></span>
      <span class="pill">${FQ.t("journey.progress")} <b>${Math.min(j.node, ch.nodes.length)}/${ch.nodes.length}</b></span>
      ${completed ? `<span class="pill gold">✓ ${FQ.t("journey.done")}</span>` : ""}
    </div>
    ${FQ.J.mapSVG()}
    <div id="jpanel"></div>`;
  FQ.J.openNode(Math.min(j.node, ch.nodes.length - 1));
};

FQ.J.openNode = function (i) {
  const ch = FQ.J.chapter();
  const j = FQ.J.ensure();
  if (i > j.node) return;
  const n = ch.nodes[i];
  const panel = document.getElementById("jpanel");
  const past = i < j.node;
  let body = "";
  if (past) {
    body = `<div class="dim small">✓ ${FQ.t("journey.pass")}</div>`;
  } else if (n.gate.type === "case") {
    body = `<button class="btn block" onclick="FQ.J.startCase()">${FQ.t("journey.case")} →</button>`;
  } else {
    body = `
      <p class="small" style="margin:8px 0">${FQ.bi(n.gate, "pZh", "pEn")}</p>
      <div id="jgate"></div>
      <div class="center" style="margin-top:10px">
        <button class="btn" id="jgo" onclick="FQ.J.attempt()">${FQ.t("common.start")}</button>
      </div>`;
  }
  panel.innerHTML = `
    <div class="panel jnode-panel" style="--rc:${FQ.JOURNEY_REGIONS[n.region].color}">
      <div class="jreg" style="color:${FQ.JOURNEY_REGIONS[n.region].color}">
        ${FQ.bi(FQ.JOURNEY_REGIONS[n.region], "zh", "en")}</div>
      <h3>${FQ.bi(n, "zh", "en")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.t("journey.excerpt")}:${FQ.bi(n, "exZh", "exEn")}</div>
      ${body}
    </div>`;
};

/* ---------- gates ---------- */
FQ.J.cost = function () {
  const j = FQ.J.ensure();
  if (FQ.J.tmp.tries === 0) return 0;
  const gate = FQ.J.chapter().nodes[j.node].gate;
  if (gate.type === "jiaobei" && FQ.J.tmp.tries < 3) return 0;
  return j.coins > 0 ? 1 : 0; /* mercy rule: broke = free */
};

FQ.J.attempt = function () {
  const j = FQ.J.ensure();
  const n = FQ.J.chapter().nodes[j.node];
  const g = n.gate;
  const cost = FQ.J.cost();
  if (cost) { j.coins -= cost; FQ.save(); }
  FQ.J.tmp.tries++;
  const out = document.getElementById("jgate");
  let html = "", pending = null, gateType = g.type;

  if (g.type === "tarotAny" || g.type === "tarotLow") {
    pending = FQ.drawTarot(1)[0];
    FQ.collect("tarot", pending.card.id, FQ.bi(pending.card, "zh", "en"));
    html = `<div class="center result"><div style="font-size:40px">${pending.card.sym}</div>
      <b class="gold">${FQ.bi(pending.card, "zh", "en")}</b> <span class="dim small">#${pending.card.id}</span></div>`;
  } else if (g.type === "diceElem") {
    pending = FQ.rollAstroDice();
    html = `<div class="center result"><div style="font-size:36px">${pending.planet.sym}${pending.sign.sym}</div>
      <b class="gold">${FQ.bi(pending.planet, "zh", "en")} · ${FQ.bi(pending.sign, "zh", "en")}</b>
      <span class="dim small">(${FQ.lang === "zh" ? pending.sign.elemZh : pending.sign.elemEn})</span></div>`;
  } else if (g.type === "meihua") {
    pending = FQ.meihua();
    FQ.collectHexCast(pending);
    html = `<div class="result">${FQ.hexLinesHTML(pending.lines, pending.movingIdx)}
      <div class="center"><b class="gold">${FQ.bi(pending.primary, "zh", "en")}</b></div></div>`;
  } else if (g.type === "ichingYang") {
    const tosses = [0, 0, 0, 0, 0, 0].map(() => FQ.tossCoins());
    pending = tosses;
    const cast = FQ.resolveCast(tosses);
    FQ.collectHexCast(cast);
    const yang = cast.lines.filter(x => x === 1).length;
    html = `<div class="result">${FQ.hexLinesHTML(cast.lines, cast.movingIdx)}
      <div class="center"><b class="gold">${FQ.bi(cast.primary, "zh", "en")}</b>
      <span class="dim small"> · ${FQ.lang === "zh" ? "阳爻" : "yang"} ${yang}/6</span></div></div>`;
  } else if (g.type === "jiaobei") {
    pending = FQ.throwJiaobeiSeq ? FQ.throwJiaobeiSeq(3) : FQ.throwJiaobei();
    if (!pending.seq) pending.seq = [pending.res.id, pending.res.id, pending.res.id];
    html = `<div class="center result"><div style="font-size:34px">🌗</div>
      <b class="gold">${(pending.seq || [pending.res.id]).map(id => FQ.t("jiaobei." + id)).join(" · ")}</b></div>`;
  }

  const key = FQ.outcomeKey(gateType, pending);
  const oc = FQ.resolveOutcome(n.id, key);
  if (oc) {
    FQ.J.applyOutcomeFx(oc.fx || []);
    html += `<div class="oc-omen reading">${FQ.bi(oc, "omenZh", "omenEn")}</div>`;
    html += `<div class="oc-story">${FQ.bi(oc, "storyZh", "storyEn")}</div>`;
    html += FQ.J.fxSummaryHTML(oc.fx || []);
  }

  FQ.J.tmp.passed = true;
  j.favor[n.region]++;
  if (!j.gates.includes(n.id)) j.gates.push(n.id);
  FQ.save();
  FQ.gainXP(5);
  html += `<div class="xp-note">✦ ${FQ.t("journey.pass")}</div>
    <div class="center" style="margin-top:8px">
      <button class="btn" onclick="FQ.J.travel()">${FQ.t("journey.travel")}</button></div>`;
  document.getElementById("jgo").style.display = "none";
  FQ.sparkleAt(innerWidth / 2, innerHeight / 2);
  out.innerHTML = html;
};

FQ.J.fxSummaryHTML = function (fx) {
  if (!fx || !fx.length) return "";
  return `<div class="oc-fx">${fx.map(op => op.op + (op.v != null ? op.v : "")).join(" · ")}</div>`;
};
FQ.J.applyOutcomeFx = function (list) {
  const j = FQ.J.ensure();
  (list || []).forEach(op => {
    if (op.op === "coins") j.coins = Math.max(0, j.coins + op.v);
    else if (op.op === "hp") j.hp = Math.min(j.hpMax || 5, Math.max(0, (j.hp || 5) + op.v));
    else if (op.op === "favor") j.favor[op.civ] = (j.favor[op.civ] || 0) + op.v;
    else if (op.op === "favorLocal") j.favor[FQ.J.chapter().nodes[j.node].region] = (j.favor[FQ.J.chapter().nodes[j.node].region] || 0) + op.v;
    else if (op.op === "story" && op.v && !j.stories.includes(op.v)) j.stories.push(op.v);
    else if (op.op === "quest") j.quests[op.v] = op.act === "complete" ? "done" : "active";
    else if (op.op === "token" || op.op === "goods" || op.op === "tool") {
      j.bag.push({ kind: op.op === "goods" ? "goods" : op.op, id: op.id || op.v, n: op.v || 1 });
    } else if (op.op === "lose") {
      if (op.kind === "goods" || op.kind === "token") {
        const ix = j.bag.findIndex(b => b.kind === op.kind);
        if (ix >= 0) j.bag.splice(ix, 1);
      } else j.coins = Math.max(0, j.coins - 1);
    }
  });
  if (j.hp <= 0) { j.hp = 1; j.coins = Math.max(0, j.coins - 1); FQ.toast(FQ.lang === "zh" ? "力竭休整" : "Forced rest"); }
  FQ.save();
};

FQ.J.dreamPick = function (oi) {
  const j = FQ.J.ensure();
  const n = FQ.J.chapter().nodes[j.node];
  const key = "dream:" + oi;
  const oc = FQ.resolveOutcome(n.id, key);
  if (oc) FQ.J.applyOutcomeFx(oc.fx || []);
  else if (n.gate.options && n.gate.options[oi]) {
    const o = n.gate.options[oi];
    j.coins += o.coins || 0; j.favor[n.region] += o.favor || 0;
  }
  j.favor[n.region]++;
  if (!j.gates.includes(n.id)) j.gates.push(n.id);
  FQ.save();
  FQ.gainXP(5);
  const dreams = [
    ["🕊️", "飞越雪峰", "Flying the snow peaks"], ["✨", "井中星斗", "Stars in a well"],
    ["🔥", "燃烧的桥", "A burning bridge"], ["📜", "无字天书", "A sky-book without words"],
    ["🐪", "驼铃成雨", "Camel-bells as rain"], ["🪞", "镜中故人", "An old friend in glass"],
    ["🚢", "沉船灯火", "Lamps of a sunken ship"], ["🦅", "白鹰落腕", "A white hawk on the wrist"],
    ["🏜️", "沙中城门", "A city gate in sand"], ["🌊", "潮退露路", "Tide leaves a road"],
    ["🥁", "鼓楼三通", "Three drum-tower beats"], ["🐴", "纸马夜奔", "Paper horses at night"],
    ["⛵", "盐船低语", "Salt-boats whispering"], ["💎", "玉碎又圆", "Jade breaks, then rounds"],
    ["🪨", "无名祭石", "A nameless offering-stone"], ["🏠", "归帆先到", "The home-sail arrives first"]
  ];
  document.getElementById("jgate").innerHTML = `
    <div class="oc-omen reading">${oc ? FQ.bi(oc, "omenZh", "omenEn") : dreams[oi][1]}</div>
    <div class="oc-story reading">${oc ? FQ.bi(oc, "storyZh", "storyEn") : (n.gate.options && n.gate.options[oi] ? FQ.bi(n.gate.options[oi], "rZh", "rEn") : "")}</div>
    ${FQ.J.fxSummaryHTML(oc && oc.fx)}
    <div class="center"><button class="btn" onclick="FQ.J.travel()">${FQ.t("journey.travel")}</button></div>`;
};

FQ.J.travel = function () {
  const j = FQ.J.ensure();
  j.node++; FQ.save();
  FQ.nav("journey");
};

/* dream gate renders options instead of a start button */
const _openNode = FQ.J.openNode;
FQ.J.openNode = function (i) {
  _openNode(i);
  const j = FQ.J.ensure();
  const n = FQ.J.chapter().nodes[i];
  if (i === j.node && n.gate.type === "dreamChoice") {
    const gate = document.getElementById("jgate");
    const go = document.getElementById("jgo");
    if (go) go.style.display = "none";
    const dreams = [
      ["🕊️", "飞越雪峰", "Flying the snow peaks"], ["✨", "井中星斗", "Stars in a well"],
      ["🔥", "燃烧的桥", "A burning bridge"], ["📜", "无字天书", "A sky-book without words"],
      ["🐪", "驼铃成雨", "Camel-bells as rain"], ["🪞", "镜中故人", "An old friend in glass"],
      ["🚢", "沉船灯火", "Lamps of a sunken ship"], ["🦅", "白鹰落腕", "A white hawk on the wrist"],
      ["🏜️", "沙中城门", "A city gate in sand"], ["🌊", "潮退露路", "Tide leaves a road"],
      ["🥁", "鼓楼三通", "Three drum-tower beats"], ["🐴", "纸马夜奔", "Paper horses at night"],
      ["⛵", "盐船低语", "Salt-boats whispering"], ["💎", "玉碎又圆", "Jade breaks, then rounds"],
      ["🪨", "无名祭石", "A nameless offering-stone"], ["🏠", "归帆先到", "The home-sail arrives first"]
    ];
    const useMatrix = FQ.OUTCOMES && FQ.OUTCOMES[n.id] && Object.keys(FQ.OUTCOMES[n.id]).length >= 16;
    if (gate) gate.innerHTML = `<div class="jdreams">` + (useMatrix ? dreams : n.gate.options).map((o, oi) => {
      const sym = useMatrix ? o[0] : o.sym;
      const zh = useMatrix ? o[1] : o.zh;
      const en = useMatrix ? o[2] : o.en;
      return `<button class="btn ghost block" style="margin-top:8px" onclick="FQ.J.dreamPick(${oi})">${sym} ${FQ.lang === "zh" ? zh : en}</button>`;
    }).join("") + `</div>`;
  }
};

/* ---------- case ---------- */
FQ.J.cs = null;
FQ.J.startCase = function () {
  FQ.J.cs = { clues: [], concluded: false };
  FQ.J.renderCase();
};
FQ.J.renderCase = function () {
  const C = FQ.J.chapter().case;
  const cs = FQ.J.cs;
  const panel = document.getElementById("jpanel");
  const cluesHtml = cs.clues.map(id => {
    const m = C.methods.find(x => x.id === id);
    return `<div class="reading"><b class="gold">${m.ic} ${FQ.t("journey.clue")}</b><br>${FQ.bi(m, "cZh", "cEn")}</div>`;
  }).join("");
  let action;
  if (cs.clues.length < 3) {
    action = `
      <p class="small gold">${FQ.t("journey.case.pick")} (${cs.clues.length}/3)</p>
      <div class="jmethods">${C.methods.filter(m => !cs.clues.includes(m.id)).map(m => `
        <button class="btn ghost sm" onclick="FQ.J.pickClue('${m.id}')">${m.ic} ${FQ.t(m.id + ".name")}</button>`).join("")}
      </div>`;
  } else if (!cs.concluded) {
    action = `
      <p class="small gold">${FQ.t("journey.case.conclude")}:</p>
      ${C.options.map((o, i) => `
        <button class="btn ghost block" style="margin-top:8px" onclick="FQ.J.conclude(${i})">${FQ.bi(o, "zh", "en")}</button>`).join("")}`;
  }
  panel.innerHTML = `
    <div class="panel jnode-panel" style="--rc:${FQ.JOURNEY_REGIONS.mazu.color}">
      <h3>❖ ${FQ.bi(C, "titleZh", "titleEn")}</h3>
      <div class="reading dim" style="font-size:.85rem">${FQ.bi(C, "introZh", "introEn")}</div>
      ${cluesHtml}${action || ""}
    </div>`;
};
FQ.J.pickClue = function (id) {
  if (FQ.J.cs.clues.length >= 3 || FQ.J.cs.clues.includes(id)) return;
  FQ.J.cs.clues.push(id);
  FQ.J.renderCase();
};
FQ.J.conclude = function (i) {
  const C = FQ.J.chapter().case;
  const o = C.options[i];
  const j = FQ.J.ensure();
  FQ.J.cs.concluded = true;
  j.ending = o.id;
  const bonus = 20 + o.score * 10 + FQ.J.favorTotal(j) + j.coins;
  if (!j.completed.includes(j.ch)) j.completed.push(j.ch);
  j.node = FQ.J.chapter().nodes.length;
  FQ.save();
  document.getElementById("jpanel").innerHTML = `
    <div class="panel jnode-panel result" style="--rc:var(--gold)">
      <div class="lotgrade">「${FQ.lang === "zh" ? o.grade : o.gradeEn}」</div>
      <h3>${FQ.bi(o, "zh", "en")}</h3>
      <div class="reading">${FQ.bi(o, "endZh", "endEn")}</div>
      <div class="xp-note">${FQ.t("journey.done")} · ${FQ.t("xp.gain", { n: bonus })}</div>
      <div class="center" style="margin-top:10px">
        <button class="btn ghost sm" onclick="FQ.J.replay()">${FQ.t("journey.replay")}</button>
        <button class="btn sm" onclick="FQ.nav('home')">${FQ.t("common.back").replace("← ", "")}</button>
      </div>
    </div>`;
  FQ.recordReading("journey", bonus);
  if (o.score === 3) FQ.confetti();
};
FQ.J.replay = function () {
  const ch = FQ.J.chapter();
  const completed = FQ.state.journey.completed;
  FQ.state.journey = {
    ch: ch.id, node: 0, coins: ch.startCoins,
    favor: { chr: 0, isl: 0, con: 0, mazu: 0 },
    gates: [], ending: null, completed
  };
  FQ.save();
  FQ.nav("journey");
};
