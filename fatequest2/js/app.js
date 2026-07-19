/* FateQuest app — screens, rituals, navigation */
window.FQ = window.FQ || {};

FQ.esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const $app = () => document.getElementById("app");
FQ.current = { screen: "home" };

/* ---------- navigation ---------- */
FQ.nav = function (screen, param) {
  FQ.current = { screen, param };
  const render = FQ.SCREENS[screen] || FQ.SCREENS.home;
  $app().innerHTML = "";
  render(param);
  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.nav === screen ||
      (b.dataset.nav === "home" && !["codex", "profile"].includes(screen)));
  });
  window.scrollTo(0, 0);
};

FQ.applyStaticI18n = function () {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = FQ.t(el.dataset.i18n); });
};

/* ---------- shared pieces ---------- */
FQ.hudHTML = function () {
  const pct = Math.round(FQ.levelProgress() * 100);
  return `
  <div class="hud">
    <div class="title">
      <h1>${FQ.t("app.title")} <span class="gold">✦</span></h1>
      <div class="sub">${FQ.t("app.sub")}</div>
    </div>
    <div>
      <span class="pill">${FQ.t("lv.prefix")}${FQ.level() + 1} · <b>${FQ.esc(FQ.levelTitle())}</b></span>
      <div class="xpbar"><i id="xpbar-i" style="width:${pct}%"></i></div>
      <div class="small dim center">${FQ.state.xp} ✧ · ✨ ${FQ.state.stardust}</div>
    </div>
  </div>`;
};
FQ.renderHUD = function () {
  if (FQ.current.screen === "home") FQ.nav("home");
};
FQ.backBtn = () => `<button class="back" onclick="FQ.nav('home')">${FQ.t("common.back")}</button>`;

/* hexagram cast → result HTML (shared by I-Ching & Meihua) */
FQ.hexLinesHTML = function (lines, movingIdx) {
  return `<div class="hexlines">` + lines.map((y, i) => `
    <div class="hline ${y ? "" : "yin"}" style="animation-delay:${i * 60}ms">
      ${y ? "<i></i>" : "<i></i><i></i>"}
      ${movingIdx && movingIdx.includes(i) ? `<span class="mv">●</span>` : ""}
    </div>`).join("") + `</div>`;
};
FQ.hexResultHTML = function (cast) {
  const p = cast.primary;
  let html = `
    ${FQ.hexLinesHTML(cast.lines, cast.movingIdx)}
    <div class="center">
      <div class="hexname">${p.lower.sym}${p.upper.sym} <b class="gold">${FQ.bi(p, "zh", "en")}</b>
        <span class="dim small">#${p.n}</span></div>
      <div class="dim small">${p.upper[FQ.lang === "zh" ? "zh" : "en"]} / ${p.lower[FQ.lang === "zh" ? "zh" : "en"]}</div>
    </div>
    <div class="reading">${FQ.bi(p, "mZh", "mEn")}</div>`;
  if (cast.changed) {
    const c = cast.changed;
    html += `
    <div class="dim small center" style="margin-top:10px">
      ${FQ.t("iching.moving")}: ${cast.movingIdx.map(i => i + 1).join(", ")} →
      ${FQ.t("iching.becomes")} <b class="gold">${FQ.bi(c, "zh", "en")}</b> #${c.n}
    </div>
    <div class="reading dim">${FQ.bi(c, "mZh", "mEn")}</div>`;
  }
  return html;
};
FQ.collectHexCast = function (cast) {
  FQ.collect("hex", cast.primary.n, FQ.bi(cast.primary, "zh", "en"));
  if (cast.changed) FQ.collect("hex", cast.changed.n, FQ.bi(cast.changed, "zh", "en"));
};

/* ---------- screens ---------- */
FQ.SCREENS = {

  /* ===== home / starmap ===== */
  home() {
    const daily = FQ.dailyAvailable();
    const realms = FQ.METHODS.map((m, i) => {
      if (!m.playable) return `
        <div class="realm locked" style="--rc:var(--c-locked);animation-delay:${i * 45}ms"
             onclick="FQ.toast('🔒 ${FQ.t("locked.tip")}')">
          <div class="ric">${m.ic}</div>
          <div class="rt">${FQ.t(m.lockKey)}</div>
          <div class="rs">${FQ.t("locked.tip")}</div>
        </div>`;
      return `
        <div class="realm" style="--rc:${m.color};animation-delay:${i * 45}ms" onclick="FQ.nav('${m.id}')">
          <div class="rciv">${FQ.t(m.id + ".civ")}</div>
          <div class="ric">${FQ.art("realm-" + m.id, m.ic, "big")}</div>
          <div class="rt">${FQ.t(m.id + ".name")}</div>
          <div class="rs">${FQ.t(m.id + ".desc")}</div>
        </div>`;
    }).join("");

    const jn = FQ.state.journey;
    const jdone = jn && (jn.completed || []).includes("marco");
    const jprog = jn && jn.visited ? jn.visited.length : 0;
    $app().innerHTML = `
      ${FQ.hudHTML()}
      <div class="panel jbanner" onclick="FQ.nav('journey')" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:30px">${FQ.art("mode-journey", "🐪", "big")}</div>
        <div style="flex:1">
          <h3 class="gold">${FQ.t("journey.name")}</h3>
          <div class="dim small">${FQ.t("journey.tag")}</div>
        </div>
        <span class="pill">${jdone ? "✓" : jprog + "/12"}</span>
      </div>
      <div class="panel jbanner" onclick="FQ.nav('tower')" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:30px">${FQ.art("mode-tower", "🗼", "big")}</div>
        <div style="flex:1">
          <h3 class="gold">${FQ.t("tw.name")}</h3>
          <div class="dim small">${FQ.t("tw.tag")}</div>
        </div>
        <span class="pill">${FQ.state.tower.run ? "▶ " + FQ.state.tower.run.layer + "/12" : (FQ.state.tower.best ? "⭐" + FQ.state.tower.best : "NEW")}</span>
      </div>
      <div class="panel" style="display:flex;align-items:center;gap:14px">
        <div style="font-size:30px">🏮</div>
        <div style="flex:1">
          <h3>${FQ.t("home.daily")}</h3>
          <div class="dim small">${FQ.t("home.streak")} <b class="gold">${FQ.state.streak}</b> ${FQ.t("common.day")}</div>
        </div>
        <button class="btn sm" ${daily ? "" : "disabled"} onclick="FQ.nav('daily')">
          ${daily ? FQ.t("home.daily") : FQ.t("home.daily.done")}
        </button>
      </div>
      <h2 style="margin:6px 0 12px">${FQ.t("home.realms")}</h2>
      <div class="grid">${realms}</div>
      <div class="footer-note">${FQ.t("footer")}</div>`;
  },

  /* ===== daily lot ===== */
  daily() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("daily.title")} 🏮</h2>
      <p class="dim">${FQ.t("daily.shake")}</p>
      <div class="cylinder" id="cyl" onclick="FQ.doDaily()">
        <div class="sticks"><i></i><i></i><i></i><i></i></div>
      </div>
      <div id="lot-out"></div>`;
  },

  /* ===== tarot ===== */
  tarot() {
    FQ._tarot = { drawn: FQ.drawTarot(3), flipped: 0 };
    const fan = Array.from({ length: 8 }, (_, i) => `
      <div class="tcard" id="fan-${i}" onclick="FQ.tarotPick(${i})">
        <div class="inner">
          <div class="tface tback"></div>
          <div class="tface tfront"></div>
        </div>
      </div>`).join("");
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("tarot.name")} 🔮</h2>
      <p class="dim">${FQ.t("tarot.desc")}</p>
      <p class="small gold center" style="margin-top:10px">${FQ.t("tarot.pick")}</p>
      <div class="fan">${fan}</div>
      <div id="tarot-out"></div>`;
  },

  /* ===== iching ===== */
  iching() {
    FQ._cast = [];
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("iching.name")} ☯</h2>
      <p class="dim">${FQ.t("iching.desc")}</p>
      <div class="coins" id="coins">
        <div class="coin"><span>乾</span></div><div class="coin"><span>坤</span></div><div class="coin"><span>易</span></div>
      </div>
      <div class="center"><button class="btn" id="toss-btn" onclick="FQ.doToss()">${FQ.t("iching.toss")} (1/6)</button></div>
      <div id="cast-lines"></div>
      <div id="cast-out"></div>`;
  },

  /* ===== meihua ===== */
  meihua() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("meihua.name")} 🌸</h2>
      <p class="dim">${FQ.t("meihua.desc")}</p>
      <div class="panel" style="margin-top:14px">
        <button class="btn block" onclick="FQ.doMeihua()">${FQ.t("meihua.now")}</button>
        <div style="display:flex;gap:10px;margin-top:12px">
          <input id="mh-num" inputmode="numeric" placeholder="${FQ.t("meihua.num")}">
          <button class="btn ghost" onclick="FQ.doMeihua(document.getElementById('mh-num').value)">✦</button>
        </div>
      </div>
      <div id="mh-out"></div>`;
  },

  /* ===== bazi ===== */
  bazi() {
    const hours = Array.from({ length: 24 }, (_, h) =>
      `<option value="${h}">${String(h).padStart(2, "0")}:00 – ${String(h).padStart(2, "0")}:59</option>`).join("");
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("bazi.name")} 🏮</h2>
      <p class="dim">${FQ.t("bazi.desc")}</p>
      <div class="panel" style="margin-top:14px">
        <label class="f">${FQ.t("bazi.date")}<input type="date" id="bz-date" value="2000-01-01"></label>
        <label class="f">${FQ.t("bazi.time")}
          <select id="bz-hour"><option value="">— ? —</option>${hours}</select>
        </label>
        <button class="btn block" onclick="FQ.doBazi()">${FQ.t("bazi.cast")}</button>
      </div>
      <div id="bz-out"></div>`;
  },

  /* ===== western ===== */
  western() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("western.name")} ♈</h2>
      <p class="dim">${FQ.t("western.desc")}</p>
      <div class="panel" style="margin-top:14px">
        <label class="f">${FQ.t("bazi.date")}<input type="date" id="ws-date" value="2000-01-01"></label>
        <button class="btn block" onclick="FQ.doWestern()">${FQ.t("common.reveal")}</button>
      </div>
      <div id="ws-out"></div>`;
  },

  /* ===== runes ===== */
  runes() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("runes.name")} ᚠ</h2>
      <p class="dim">${FQ.t("runes.desc")}</p>
      <p class="small gold center" style="margin-top:10px">${FQ.t("runes.shake")}</p>
      <div class="bag" id="bag" onclick="FQ.doRunes()">👝</div>
      <div id="rn-out"></div>`;
  },

  /* ===== dream ===== */
  dream() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("dream.name")} 🌙</h2>
      <p class="dim">${FQ.t("dream.desc")}</p>
      <div class="panel" style="margin-top:14px">
        <textarea id="dm-text" rows="3" placeholder="${FQ.t("dream.ph")}"></textarea>
        <button class="btn block" style="margin-top:12px" onclick="FQ.doDream()">${FQ.t("dream.go")}</button>
      </div>
      <div id="dm-out"></div>`;
  },

  /* ===== astro dice ===== */
  astrodice() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("astrodice.name")} 🎲</h2>
      <p class="dim">${FQ.t("astrodice.desc")}</p>
      <div class="dicerow">
        <div class="die" id="d1">☉<small></small></div>
        <div class="die" id="d2">♈<small></small></div>
        <div class="die" id="d3">Ⅰ<small></small></div>
      </div>
      <div class="center"><button class="btn" onclick="FQ.doDice()">${FQ.t("astrodice.roll")}</button></div>
      <div id="ad-out"></div>`;
  },

  /* ===== jiaobei ===== */
  jiaobei() {
    $app().innerHTML = `
      ${FQ.backBtn()}
      <h2>${FQ.t("jiaobei.name")} 🌗</h2>
      <p class="dim">${FQ.t("jiaobei.desc")}</p>
      <div class="panel" style="margin-top:14px">
        <label class="f">${FQ.t("jiaobei.q")}<input id="jb-q" maxlength="60"></label>
      </div>
      <div class="blocks">
        <div class="block" id="b1"><i></i></div>
        <div class="block" id="b2"><i></i></div>
      </div>
      <div class="center"><button class="btn" onclick="FQ.doJiaobei()">${FQ.t("jiaobei.throw")}</button></div>
      <div id="jb-out"></div>`;
  },

  /* ===== codex ===== */
  codex(tab) {
    tab = tab || "tarot";
    const c = FQ.state.col;
    const total = FQ.TAROT.length + FQ.HEXAGRAMS.length + FQ.RUNES.length;
    const tabs = ["tarot", "hex", "rune"].map(k => `
      <button class="btn sm ${k === tab ? "" : "ghost"}" onclick="FQ.nav('codex','${k}')">
        ${FQ.t("codex." + (k === "hex" ? "hex" : k === "rune" ? "rune" : "tarot"))}
        (${c[k].length}/${k === "tarot" ? 22 : k === "hex" ? 64 : 24})
      </button>`).join("");
    let items = "";
    if (tab === "tarot") {
      items = FQ.TAROT.map(t => {
        const got = c.tarot.includes(t.id);
        return `<div class="citem ${got ? "got" : "miss"}"><div class="ci">${got ? t.sym : "❔"}</div>
          <div class="cn">${got ? FQ.bi(t, "zh", "en") : "· · ·"}</div></div>`;
      }).join("");
    } else if (tab === "hex") {
      items = FQ.HEXAGRAMS.map(h => {
        const got = c.hex.includes(h.n);
        const glyph = String.fromCharCode(0x4DC0 + h.n - 1);
        return `<div class="citem ${got ? "got" : "miss"}"><div class="ci">${got ? glyph : "❔"}</div>
          <div class="cn">${got ? h.n + " " + FQ.bi(h, "zh", "en") : "#" + h.n}</div></div>`;
      }).join("");
    } else {
      items = FQ.RUNES.map(r => {
        const got = c.rune.includes(r.id);
        return `<div class="citem ${got ? "got" : "miss"}"><div class="ci">${got ? r.g : "❔"}</div>
          <div class="cn">${got ? FQ.bi(r, "zh", "en") : "· · ·"}</div></div>`;
      }).join("");
    }
    $app().innerHTML = `
      <h2>${FQ.t("codex.title")} 📖</h2>
      <p class="dim">${FQ.t("codex.sub")} · ${FQ.t("codex.progress")}: <b class="gold">${FQ.colCount()}/${total}</b></p>
      <div class="codextabs" style="margin-top:14px">${tabs}</div>
      <div class="codexgrid">${items}</div>`;
  },

  /* ===== profile ===== */
  profile() {
    const achv = FQ.ACHIEVEMENTS.map(a => {
      const on = FQ.state.achv.includes(a.id);
      return `<div class="achv ${on ? "" : "off"}">
        <div class="ai">${a.ic}</div>
        <div><b>${FQ.t("achv." + a.id)}</b><div class="dim small">${FQ.t("achv." + a.id + ".d")}</div></div>
      </div>`;
    }).join("");
    $app().innerHTML = `
      <h2>${FQ.t("profile.title")} ☯</h2>
      <div class="panel" style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><b>${FQ.t("lv.prefix")}${FQ.level() + 1} · ${FQ.esc(FQ.levelTitle())}</b>
            <div class="dim small">${FQ.state.xp} ✧</div></div>
          <div style="font-size:34px">🧙</div>
        </div>
        <div class="xpbar"><i style="width:${Math.round(FQ.levelProgress() * 100)}%"></i></div>
      </div>
      <div class="panel">
        <h3>${FQ.t("profile.stats")}</h3>
        <div class="dim" style="margin-top:8px">
          ${FQ.t("profile.readings")}: <b class="gold">${FQ.state.readings}</b> ·
          ${FQ.t("home.streak")}: <b class="gold">${FQ.state.streak}</b> ·
          ${FQ.t("profile.days")}: <b class="gold">${FQ.state.daysVisited}</b> ·
          ${FQ.t("codex.progress")}: <b class="gold">${FQ.colCount()}</b><br>
          ✨ <b class="gold">${FQ.state.stardust}</b> ·
          🗼 ${FQ.t("tw.best")}: <b class="gold">${FQ.state.tower.best}/12</b> ·
          🌈 <b class="gold">${FQ.state.tower.resTotal}</b>
        </div>
      </div>
      <div class="panel">
        <h3>${FQ.t("profile.sound")}</h3>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="btn sm ${FQ.state.mute ? "ghost" : ""}" onclick="FQ.AU.setMute(false);FQ.nav('profile')">🔔 ${FQ.t("profile.sound.on")}</button>
          <button class="btn sm ${FQ.state.mute ? "" : "ghost"}" onclick="FQ.AU.setMute(true);FQ.nav('profile')">🔕 ${FQ.t("profile.sound.off")}</button>
        </div>
      </div>
      <div class="panel"><h3>${FQ.t("profile.achv")}</h3>${achv}</div>
      <div class="panel">
        <h3>${FQ.t("profile.lang")}</h3>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button class="btn sm ${FQ.lang === "zh" ? "" : "ghost"}" onclick="FQ.setLang('zh')">中文</button>
          <button class="btn sm ${FQ.lang === "en" ? "" : "ghost"}" onclick="FQ.setLang('en')">English</button>
        </div>
      </div>
      <button class="btn ghost block" onclick="FQ.doReset()">${FQ.t("profile.reset")}</button>
      <div class="footer-note">${FQ.t("footer")}</div>`;
  }
};

/* ---------- ritual actions ---------- */
FQ.doDaily = function () {
  if (!FQ.dailyAvailable()) { FQ.toast(FQ.t("home.daily.done")); return; }
  const cyl = document.getElementById("cyl");
  FQ.AU.play("shake");
  cyl.classList.add("shake");
  setTimeout(() => {
    cyl.classList.remove("shake");
    const lot = FQ.drawLot();
    FQ.markDaily();
    const bonus = 10 + Math.min(FQ.state.streak, 7);
    document.getElementById("lot-out").innerHTML = `
      <div class="lotcard result">
        <div class="lotgrade">「${FQ.lang === "zh" ? lot.g : lot.gEn}」</div>
        <div class="reading">${FQ.bi(lot, "zh", "en")}</div>
        <div class="dim small">${FQ.t("home.streak")}: ${FQ.state.streak} ${FQ.t("common.day")}</div>
        <div class="xp-note">${FQ.t("xp.gain", { n: bonus })}</div>
      </div>`;
    FQ.gainXP(bonus);
    FQ.sparkleAt(innerWidth / 2, innerHeight / 2);
  }, 700);
};

FQ.tarotPick = function (i) {
  const t = FQ._tarot;
  const el = document.getElementById("fan-" + i);
  if (!t || t.flipped >= 3 || el.classList.contains("flipped")) return;
  const pick = t.drawn[t.flipped];
  FQ.AU.play("flip");
  const front = el.querySelector(".tfront");
  front.innerHTML = `<div class="sym">${pick.card.sym}</div>
    <div class="nm">${FQ.bi(pick.card, "zh", "en")}${pick.reversed ? FQ.t("tarot.rev") : ""}</div>`;
  if (pick.reversed) el.classList.add("rev");
  el.classList.add("flipped");
  const r = el.getBoundingClientRect();
  FQ.sparkleAt(r.left + r.width / 2, r.top + r.height / 2, "#9b6bb3");
  t.flipped++;
  FQ.collect("tarot", pick.card.id, FQ.bi(pick.card, "zh", "en"));
  if (t.flipped === 3) setTimeout(FQ.tarotReveal, 800);
};
FQ.tarotReveal = function () {
  const labels = [FQ.t("tarot.past"), FQ.t("tarot.now"), FQ.t("tarot.future")];
  const rows = FQ._tarot.drawn.map((p, i) => `
    <div class="reading"><b class="gold">${labels[i]} · ${FQ.bi(p.card, "zh", "en")}${p.reversed ? FQ.t("tarot.rev") : ""}</b><br>
    ${p.reversed ? FQ.bi(p.card, "rvZh", "rvEn") : FQ.bi(p.card, "upZh", "upEn")}</div>`).join("");
  document.getElementById("tarot-out").innerHTML = `<div class="result">${rows}
    <div class="center"><button class="btn ghost sm" onclick="FQ.nav('tarot')">${FQ.t("common.again")}</button></div></div>`;
  FQ.recordReading("tarot", 15);
};

FQ.doToss = function () {
  if (FQ._cast.length >= 6) return;
  FQ.AU.play("coin");
  const toss = FQ.tossCoins();
  document.querySelectorAll("#coins .coin").forEach((c, i) => {
    c.classList.remove("toss"); void c.offsetWidth; c.classList.add("toss");
    setTimeout(() => { c.querySelector("span").textContent = toss.coins[i] === 3 ? "阳" : "阴"; }, 360);
  });
  FQ._cast.push(toss);
  const n = FQ._cast.length;
  setTimeout(() => {
    document.getElementById("cast-lines").innerHTML =
      FQ.hexLinesHTML(FQ._cast.map(t => (t.yang ? 1 : 0)),
        FQ._cast.map((t, i) => (t.moving ? i : -1)).filter(i => i >= 0));
    const btn = document.getElementById("toss-btn");
    if (n < 6) btn.textContent = `${FQ.t("iching.toss")} (${n + 1}/6)`;
    else {
      btn.style.display = "none";
      const cast = FQ.resolveCast(FQ._cast);
      document.getElementById("cast-out").innerHTML = `
        <div class="result"><h3 class="center gold" style="margin-top:10px">${FQ.t("iching.judg")}</h3>
        ${FQ.hexResultHTML(cast)}
        <div class="center"><button class="btn ghost sm" onclick="FQ.nav('iching')">${FQ.t("common.again")}</button></div></div>`;
      document.getElementById("cast-lines").innerHTML = "";
      FQ.collectHexCast(cast);
      FQ.recordReading("iching", 15);
      FQ.confetti();
    }
  }, 720);
};

FQ.doMeihua = function (num) {
  const cast = FQ.meihua(num);
  document.getElementById("mh-out").innerHTML =
    `<div class="result panel" style="margin-top:14px">${FQ.hexResultHTML(cast)}</div>`;
  FQ.collectHexCast(cast);
  FQ.recordReading("meihua", 12);
};

FQ.doBazi = function () {
  const date = document.getElementById("bz-date").value;
  if (!date) return;
  const hour = document.getElementById("bz-hour").value;
  const r = FQ.bazi(date, hour === "" ? null : hour);
  const labels = [FQ.t("bazi.year"), FQ.t("bazi.month"), FQ.t("bazi.day"), FQ.t("bazi.hour")];
  const cols = [r.year, r.month, r.day, r.hour];
  const pillars = cols.map((p, i) => p ? `
    <div class="pillar" style="animation-delay:${i * 90}ms">
      <div class="pl">${labels[i]}</div>
      <div class="ch elem-${p.stem.elem}">${p.stem.zh}</div>
      <div class="ch elem-${p.branch.elem}">${p.branch.zh}</div>
      <div class="small dim">${FQ.lang === "zh" ? p.branch.animal : p.branch.aEn}</div>
    </div>` : `
    <div class="pillar" style="animation-delay:${i * 90}ms"><div class="pl">${labels[i]}</div>
      <div class="ch dim">?</div><div class="ch dim">?</div><div class="small dim">—</div></div>`).join("");
  const max = Math.max(1, ...Object.values(r.counts));
  const bars = Object.keys(r.counts).map(e => `
    <div class="ebar"><span class="lab elem-${e}">${e} ${FQ.lang === "zh" ? "" : FQ.ELEM_EN[e]}</span>
      <span class="tr"><i style="width:${(r.counts[e] / max) * 100}%;background:${FQ.ELEM_COLORS[e]}"></i></span>
      <b>${r.counts[e]}</b></div>`).join("");
  const dm = FQ.DAYMASTER_NOTES[r.dayMaster.elem];
  document.getElementById("bz-out").innerHTML = `
    <div class="result">
      <div class="pillars">${pillars}</div>
      <div class="panel"><h3>${FQ.t("bazi.elems")}</h3><div class="ebars">${bars}</div>
        <div class="reading">${FQ.t("bazi.daymaster")} <b class="elem-${r.dayMaster.elem}">${r.dayMaster.zh}（${FQ.lang === "zh" ? r.dayMaster.elem : FQ.ELEM_EN[r.dayMaster.elem]}）</b><br>${FQ.bi(dm, "zh", "en")}</div>
        <div class="dim small">${FQ.t("bazi.note")}</div></div>
    </div>`;
  FQ.recordReading("bazi", 20);
  FQ.confetti();
};

FQ.doWestern = function () {
  const v = document.getElementById("ws-date").value;
  if (!v) return;
  const [, m, d] = v.split("-").map(Number);
  const z = FQ.sunSign(m, d);
  const note = FQ.starNote(z);
  document.getElementById("ws-out").innerHTML = `
    <div class="result center">
      <div class="constellation">${z.sym}</div>
      <div class="hexname"><b class="gold">${FQ.bi(z, "zh", "en")}</b></div>
      <div class="dim small">${FQ.t("western.element")}: ${FQ.lang === "zh" ? z.elemZh : z.elemEn} ·
        ${FQ.t("western.ruler")}: ${FQ.lang === "zh" ? z.rulerZh : z.rulerEn}</div>
      <div class="reading" style="text-align:left">
        <b class="gold">${FQ.t("western.today")}</b> · ${FQ.bi(note.focus, "zh", "en")}<br>
        ${FQ.bi(note.advice, "zh", "en")}<br>
        <span class="dim small">Lucky ✦ ${note.lucky}</span></div>
    </div>`;
  FQ.recordReading("western", 10);
};

FQ.doRunes = function () {
  const bag = document.getElementById("bag");
  FQ.AU.play("shake");
  bag.classList.add("shake");
  setTimeout(() => {
    bag.classList.remove("shake");
    const runes = FQ.drawRunes(3);
    document.getElementById("rn-out").innerHTML = `
      <div class="result">
        <div class="runerow">${runes.map((r, i) => `
          <div class="rune" style="animation-delay:${i * 140}ms"><div class="rg">${r.g}</div><div class="rn">${r.en}</div></div>`).join("")}
        </div>
        ${runes.map(r => `<div class="reading"><b class="gold">${r.g} ${FQ.bi(r, "zh", "en")}</b><br>${FQ.bi(r, "mZh", "mEn")}</div>`).join("")}
        <div class="center"><button class="btn ghost sm" onclick="FQ.nav('runes')">${FQ.t("common.again")}</button></div>
      </div>`;
    runes.forEach(r => FQ.collect("rune", r.id, FQ.bi(r, "zh", "en")));
    FQ.recordReading("runes", 12);
  }, 520);
};

FQ.doDream = function () {
  const text = document.getElementById("dm-text").value.trim();
  if (!text) return;
  const hits = FQ.readDream(text);
  let html;
  if (!hits.length) {
    html = `<div class="panel result dim">${FQ.t("dream.none")}</div>`;
  } else {
    html = `
      <div class="result">
        <div class="panel"><h3>${FQ.t("dream.sym")}</h3>
          <div class="symchips">${hits.map((h, i) => `<span class="chip" style="animation-delay:${i * 90}ms">${h.sym} ${FQ.bi(h, "zh", "en")}</span>`).join("")}</div>
          ${hits.map(h => `
            <div class="reading"><b class="gold">${h.sym} ${FQ.bi(h, "zh", "en")}</b><br>
              <b>${FQ.t("dream.zhou")}:</b> ${FQ.bi(h, "zhouZh", "zhouEn")}<br>
              <b>${FQ.t("dream.jung")}:</b> ${FQ.bi(h, "jungZh", "jungEn")}</div>`).join("")}
        </div>
      </div>`;
    FQ.recordReading("dream", 12);
  }
  document.getElementById("dm-out").innerHTML = html;
};

FQ.doDice = function () {
  FQ.AU.play("dice");
  const roll = FQ.rollAstroDice();
  ["d1", "d2", "d3"].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove("roll"); void el.offsetWidth; el.classList.add("roll");
  });
  setTimeout(() => {
    document.getElementById("d1").innerHTML = `${roll.planet.sym}<small>${FQ.bi(roll.planet, "zh", "en")}</small>`;
    document.getElementById("d2").innerHTML = `${roll.sign.sym}<small>${FQ.bi(roll.sign, "zh", "en")}</small>`;
    document.getElementById("d3").innerHTML = `${"ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ"[roll.house.n - 1]}<small>${FQ.bi(roll.house, "zh", "en")}</small>`;
    const line = FQ.lang === "zh"
      ? `${roll.planet.zh}（${roll.planet.kZh}）落在${roll.sign.zh}，照进你的${roll.house.zh}。此刻的答案，与「${roll.house.zh.replace("之宫", "")}」里的「${roll.planet.kZh}」有关。`
      : `${roll.planet.en} (${roll.planet.kEn}) in ${roll.sign.en}, lighting your house of ${roll.house.en} — the answer lives where “${roll.planet.kEn}” meets “${roll.house.en}”.`;
    document.getElementById("ad-out").innerHTML = `<div class="result reading">${line}</div>`;
    FQ.recordReading("astrodice", 8);
  }, 780);
};

FQ.doJiaobei = function () {
  FQ.AU.play("wood");
  const { blocks, res } = FQ.throwJiaobei();
  ["b1", "b2"].forEach((id, i) => {
    const el = document.getElementById(id);
    el.classList.remove("toss"); void el.offsetWidth; el.classList.add("toss");
    setTimeout(() => el.classList.toggle("flat", blocks[i]), 700);
  });
  const q = document.getElementById("jb-q").value.trim();
  setTimeout(() => {
    document.getElementById("jb-out").innerHTML = `
      <div class="result panel">
        ${q ? `<div class="dim small">「${FQ.esc(q)}」</div>` : ""}
        <h3 class="gold" style="margin-top:6px">${FQ.t(res.tKey)}</h3>
        <div class="reading">${FQ.bi(res, "dZh", "dEn")}</div>
      </div>`;
    FQ.recordReading("jiaobei", 6);
    if (res.id === "sheng") FQ.confetti();
  }, 760);
};

/* ---------- misc ---------- */
FQ.setLang = function (l) {
  FQ.lang = l;
  FQ.state.lang = l;
  FQ.save();
  FQ.applyStaticI18n();
  FQ.nav(FQ.current.screen, FQ.current.param);
};
FQ.doReset = function () {
  if (confirm(FQ.t("profile.reset.confirm"))) { FQ.reset(); FQ.applyStaticI18n(); FQ.nav("home"); }
};

/* ---------- boot (after every module has registered) ---------- */
document.addEventListener("DOMContentLoaded", function () {
  FQ.load();
  document.querySelectorAll(".tab").forEach(b =>
    b.addEventListener("click", () => FQ.nav(b.dataset.nav)));
  document.addEventListener("pointerdown", () => FQ.AU && FQ.AU.unlock(), { once: true });
  FQ.applyStaticI18n();
  FQ.nav("home");
});
