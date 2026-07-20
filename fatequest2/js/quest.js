/* 师承 engine — the growth line. Arts are locked until a teacher on the
   road teaches them; roads that demand an unlearned art force the hard way. */
window.FQ = window.FQ || {};
FQ.Q = {};

FQ.Q.knows = m => FQ.state.learned.includes(m);
FQ.Q.learn = function (method) {
  if (FQ.Q.knows(method)) return;
  FQ.state.learned.push(method);
  FQ.state.lineage.push({ m: method, day: FQ.state.journey ? FQ.state.journey.days : 0 });
  FQ.save();
  FQ.checkAchievements();
};
/* a gate is workable only if its art is known (free gates always are) */
FQ.Q.gateOK = function (type) {
  if (FQ.FREE_GATES.includes(type)) return true;
  const need = FQ.GATE_METHOD[type];
  return !need || FQ.Q.knows(need);
};
FQ.Q.gateNeed = type => FQ.FREE_GATES.includes(type) ? null : FQ.GATE_METHOD[type];
/* pending mentors at a node the traveler has reached */
FQ.Q.pendingAt = nodeId => FQ.mentorsAt(nodeId).filter(x => !FQ.Q.knows(x.method));

/* ---------- mentor encounter ---------- */
FQ.Q.meet = function (method) {
  const back = String(FQ.current.screen).startsWith("journey") ? "journey" : "home";
  FQ.Q.cur = { mentor: FQ.mentorFor(method), tries: 0, phase: "intro", passed: false, back };
  FQ.AU.scene && FQ.AU.scene("ritual");
  FQ.nav("trial");
};

FQ.SCREENS.trial = function () {
  const q = FQ.Q.cur;
  if (!q) return FQ.nav("home");
  const M = q.mentor;
  const app = document.getElementById("app");

  if (q.phase === "intro") {
    app.innerHTML = `
      <div class="trial-stage">
        <div class="tr-place">${FQ.bi(M, "civZh", "civEn")}</div>
        <div class="tr-portrait">${FQ.art("mentor-" + M.method, M.ic, "big")}</div>
        <h2 class="tr-name">${FQ.bi(M, "zh", "en")}</h2>
        <div class="tr-speech"><span id="tr-say"></span></div>
        <div class="tr-task">◈ ${FQ.bi(M.trial, "taskZh", "taskEn")}</div>
        <button class="btn tr-go" onclick="FQ.Q.begin()">${FQ.t("trial.begin")}</button>
      </div>`;
    FQ.typeInto(document.getElementById("tr-say"), FQ.bi(M, "introZh", "introEn"), 42);
    return;
  }
  if (q.phase === "grad") {
    app.innerHTML = `
      <div class="trial-stage">
        <div class="tr-seal">✦</div>
        <h2 class="tr-name gold">${FQ.t("trial.learned", { t: FQ.t(M.method + ".name") })}</h2>
        <div class="tr-speech">${FQ.bi(M, "gradZh", "gradEn")}</div>
        <div class="tr-unlock">${M.ic} ${FQ.t(M.method + ".name")} · ${FQ.t("trial.unlocked")}</div>
        <button class="btn tr-go" onclick="FQ.Q.close()">${FQ.t("trial.done")}</button>
      </div>`;
    FQ.confetti();
    return;
  }
  /* phase: work — the trial itself */
  app.innerHTML = `
    <div class="trial-stage work">
      <div class="tr-place">${FQ.bi(M, "civZh", "civEn")} · ${FQ.bi(M, "zh", "en")}</div>
      <div class="tr-task">◈ ${FQ.bi(M.trial, "taskZh", "taskEn")}</div>
      <div id="tr-work"></div>
      <div id="tr-out"></div>
    </div>`;
  FQ.Q.renderWork();
};

FQ.Q.begin = function () { FQ.Q.cur.phase = "work"; FQ.AU.play("card"); FQ.nav("trial"); };
FQ.Q.close = function () {
  const back = FQ.Q.cur && FQ.Q.cur.back;
  FQ.Q.cur = null;
  FQ.nav(back || "home");
};

/* ---------- the trials themselves ---------- */
FQ.Q.renderWork = function () {
  const q = FQ.Q.cur, k = q.mentor.trial.kind;
  const w = document.getElementById("tr-work");
  const B = (label, fn) => `<button class="btn" onclick="${fn}">${label}</button>`;
  const map = {
    tarotDraw:   () => `<div class="lenfan"><div class="lencard" id="tw0" onclick="FQ.Q.act()"><div class="lface lback">✦</div><div class="lface lfront"></div></div></div>
                        <div class="center dim small">${FQ.t("trial.tap")}</div>`,
    lenPair:     () => `<div class="lenfan">${[0,1,2].map(i => `<div class="lencard" id="lc${i}"><div class="lface lback">✦</div><div class="lface lfront"></div></div>`).join("")}</div>
                        <div class="center">${B(FQ.t("trial.draw"), "FQ.Q.act()")}</div>`,
    runeDraw:    () => `<div class="bag" onclick="FQ.Q.act()">👝</div><div class="center dim small">${FQ.t("runes.shake")}</div>`,
    diceRoll:    () => `<div class="dicerow"><div class="die" id="q1">☉</div><div class="die" id="q2">♈</div><div class="die" id="q3">Ⅰ</div></div>
                        <div class="center">${B(FQ.t("astrodice.roll"), "FQ.Q.act()")}</div>`,
    westernCast: () => `<div class="panel"><label class="f">${FQ.t("bazi.date")}<input type="date" id="q-date" value="1254-09-15"></label></div>
                        <div class="center">${B(FQ.t("common.reveal"), "FQ.Q.act()")}</div>`,
    meihuaCast:  () => `<div class="center">${B(FQ.t("meihua.now"), "FQ.Q.act()")}</div>`,
    ichingCast:  () => `<div class="coins"><div class="coin"><span>乾</span></div><div class="coin"><span>坤</span></div><div class="coin"><span>易</span></div></div>
                        <div class="center">${B(FQ.t("iching.toss"), "FQ.Q.act()")}</div>`,
    dreamTell:   () => `<div class="panel"><textarea id="q-dream" rows="2" placeholder="${FQ.t("dream.ph")}"></textarea></div>
                        <div class="center">${B(FQ.t("dream.go"), "FQ.Q.act()")}</div>`,
    baziCast:    () => `<div class="panel"><label class="f">${FQ.t("bazi.date")}<input type="date" id="q-date" value="1254-09-15"></label></div>
                        <div class="center">${B(FQ.t("bazi.cast"), "FQ.Q.act()")}</div>`,
    jiaobeiCast: () => `<div class="blocks"><div class="block" id="qb1"><i></i></div><div class="block" id="qb2"><i></i></div></div>
                        <div class="center">${B(FQ.t("jiaobei.throw"), "FQ.Q.act()")}</div>`
  };
  w.innerHTML = (map[k] || map.tarotDraw)();
};

FQ.Q.act = function () {
  const q = FQ.Q.cur, M = q.mentor, k = M.trial.kind;
  q.tries++;
  const out = document.getElementById("tr-out");
  let pass = false, html = "";

  if (k === "tarotDraw") {
    const d = FQ.drawTarot(1)[0];
    FQ.collect("tarot", d.card.id, FQ.bi(d.card, "zh", "en"));
    const el = document.getElementById("tw0");
    if (el) { el.querySelector(".lfront").innerHTML = `<div class="qglyph">${d.card.sym}</div>`; el.classList.add("flipped"); }
    pass = true;
    html = `<div class="reading"><b class="gold">${FQ.bi(d.card, "zh", "en")}${d.reversed ? FQ.t("tarot.rev") : ""}</b><br>
      ${d.reversed ? FQ.bi(d.card, "rvZh", "rvEn") : FQ.bi(d.card, "upZh", "upEn")}</div>`;
  } else if (k === "lenPair") {
    const cards = FQ.drawLenormand(3);
    cards.forEach((c, i) => {
      const el = document.getElementById("lc" + i);
      if (el) { el.querySelector(".lfront").innerHTML = `<img src="assets/decks/lenormand/${c.f}.jpg" alt="">`; el.classList.add("flipped"); }
      FQ.collect("len", c.n, FQ.bi(c, "zh", "en"));
    });
    pass = true;
    html = `<div class="reading"><b class="gold">${cards[0].n} ${FQ.bi(cards[0], "zh", "en")} + ${cards[1].n} ${FQ.bi(cards[1], "zh", "en")}</b><br>
      ${FQ.bi(cards[0], "mZh", "mEn")} ${FQ.bi(cards[1], "mZh", "mEn")}</div>`;
  } else if (k === "runeDraw") {
    const rs = FQ.drawRunes(3);
    rs.forEach(r => FQ.collect("rune", r.id, FQ.bi(r, "zh", "en")));
    pass = true;
    html = `<div class="runerow">${rs.map((r, i) => `<div class="rune" style="animation-delay:${i * 120}ms"><div class="rg">${r.g}</div><div class="rn">${r.en}</div></div>`).join("")}</div>`;
  } else if (k === "diceRoll") {
    const r = FQ.rollAstroDice();
    ["q1", "q2", "q3"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = i === 0 ? FQ.diceArt("planet", r.planet.en.toLowerCase(), "", r.planet.sym)
        : i === 1 ? FQ.diceArt("sign", r.sign.id, "", r.sign.sym)
        : FQ.diceArt("house", r.house.n, "", "Ⅰ");
    });
    pass = true;
    html = `<div class="reading">${FQ.bi(r.planet, "zh", "en")} · ${FQ.bi(r.sign, "zh", "en")} · ${FQ.bi(r.house, "zh", "en")}</div>`;
  } else if (k === "westernCast") {
    const v = document.getElementById("q-date").value;
    if (!v) return;
    const [, m, d] = v.split("-").map(Number);
    const z = FQ.sunSign(m, d);
    pass = true;
    html = `<div class="center result"><div class="constellation">${z.sym}</div><b class="gold">${FQ.bi(z, "zh", "en")}</b></div>`;
  } else if (k === "meihuaCast") {
    const c = FQ.meihua();
    FQ.collectHexCast(c);
    pass = true;
    html = `<div class="result">${FQ.hexLinesHTML(c.lines, c.movingIdx)}<div class="center"><b class="gold">${FQ.bi(c.primary, "zh", "en")}</b></div></div>`;
  } else if (k === "ichingCast") {
    const t = [0,0,0,0,0,0].map(() => FQ.tossCoins());
    const c = FQ.resolveCast(t);
    FQ.collectHexCast(c);
    const yang = c.lines.filter(x => x === 1).length;
    pass = yang >= 3;
    html = `<div class="result">${FQ.hexLinesHTML(c.lines, c.movingIdx)}
      <div class="center"><b class="gold">${FQ.bi(c.primary, "zh", "en")}</b> <span class="dim small">${FQ.lang === "zh" ? "阳爻" : "yang"} ${yang}/6</span></div></div>`;
  } else if (k === "dreamTell") {
    const txt = document.getElementById("q-dream").value.trim();
    const hits = txt ? FQ.readDream(txt) : [];
    pass = hits.length > 0;
    html = pass
      ? `<div class="reading"><b class="gold">${hits[0].sym} ${FQ.bi(hits[0], "zh", "en")}</b><br>${FQ.bi(hits[0], "zhouZh", "zhouEn")}</div>`
      : `<div class="reading dim">${FQ.t("dream.none")}</div>`;
  } else if (k === "baziCast") {
    const v = document.getElementById("q-date").value;
    if (!v) return;
    const r = FQ.bazi(v, 8);
    pass = true;
    html = `<div class="center result"><b class="gold elem-${r.dayMaster.elem}">${FQ.t("bazi.daymaster")} ${r.dayMaster.zh}</b>
      <div class="reading" style="text-align:left">${FQ.bi(FQ.DAYMASTER_NOTES[r.dayMaster.elem], "zh", "en")}</div></div>`;
  } else if (k === "jiaobeiCast") {
    const r = FQ.throwJiaobei();
    ["qb1", "qb2"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove("toss"); void el.offsetWidth; el.classList.add("toss"); setTimeout(() => el.classList.toggle("flat", r.blocks[i]), 700); }
    });
    pass = r.res.id === "sheng";
    html = `<div class="center result"><b class="gold">${FQ.t(r.res.tKey)}</b><div class="reading" style="text-align:left">${FQ.bi(r.res, "dZh", "dEn")}</div></div>`;
  }

  FQ.AU.play(pass ? "chime" : "bad");
  if (pass) {
    out.innerHTML = html + `<div class="xp-note">✦ ${FQ.t("trial.pass")}</div>`;
    setTimeout(() => {
      FQ.Q.learn(M.method);
      FQ.gainXP(25);
      q.phase = "grad";
      FQ.nav("trial");
    }, 1500);
  } else {
    const mercy = q.tries >= 3;
    out.innerHTML = html + `<div class="center dim small" style="margin-top:8px">${mercy ? FQ.t("trial.mercy") : FQ.t("trial.again", { n: q.tries })}</div>`;
    if (mercy) {
      setTimeout(() => {
        FQ.Q.learn(M.method);
        FQ.gainXP(15);
        q.phase = "grad";
        FQ.nav("trial");
      }, 1600);
    }
  }
};

/* ---------- 传承 screen ---------- */
FQ.SCREENS.lineage = function () {
  const rows = FQ.MENTORS.map(M => {
    const got = FQ.Q.knows(M.method);
    const place = FQ.CHAPTERS[0].nodes.find(n => n.id === M.at);
    return `
      <div class="panel linrow ${got ? "got" : ""}">
        <div class="lin-ic">${FQ.art("mentor-" + M.method, M.ic, "big")}</div>
        <div style="flex:1">
          <b class="${got ? "gold" : ""}">${got ? FQ.bi(M, "zh", "en") : "· · ·"}</b>
          <div class="dim small">${got
            ? FQ.t(M.method + ".name") + " · " + FQ.bi(M, "civZh", "civEn")
            : FQ.t("lineage.hint", { p: place ? FQ.bi(place, "zh", "en") : "?" })}</div>
          ${got ? `<div class="lin-say">${FQ.bi(M, "gradZh", "gradEn")}</div>` : ""}
        </div>
        ${got ? `<button class="btn ghost sm" onclick="FQ.nav('${M.method}')">${FQ.t("lineage.use")}</button>` : `<span class="pill off">🔒</span>`}
      </div>`;
  }).join("");
  document.getElementById("app").innerHTML = `
    ${FQ.backBtn()}
    <h2>✦ ${FQ.t("lineage.title")}</h2>
    <p class="dim small">${FQ.t("lineage.sub", { n: FQ.state.learned.length, t: FQ.MENTORS.length })}</p>
    ${rows}`;
};
