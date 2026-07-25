/* v3 five-beat ritual shell — omen → act → suspense → reveal → afterglow */
window.FQ = window.FQ || {};

FQ.RITUAL = {
  _job: null
};

/** Cast MVP engine; returns { pass, label, detail, method } */
FQ.RITUAL.castEngine = function (divId) {
  const id = divId === "jiaobei" ? "lot" : divId;
  let pass = false;
  let label = id;
  let detail = "";
  if (id === "iching" && FQ.tossCoins && FQ.resolveCast) {
    const tosses = [0, 1, 2, 3, 4, 5].map(() => FQ.tossCoins());
    const cast = FQ.resolveCast(tosses);
    const yang = cast.lines.filter(Boolean).length;
    pass = yang >= 3;
    label = cast.primary ? (FQ.lang === "zh" ? cast.primary.zh : cast.primary.en) || cast.primary.name || "卦" : "易";
    detail = pass
      ? (FQ.lang === "zh" ? "阳爻盛，宜行。" : "Yang prevails — go.")
      : (FQ.lang === "zh" ? "阴爻重，宜缓。" : "Yin weighs — wait.");
  } else if (id === "astrodice" && FQ.rollAstroDice) {
    const roll = FQ.rollAstroDice();
    const elem = (roll && roll.sign && (roll.sign.elemZh || roll.sign.elemEn || roll.sign.elem)) || "";
    pass = /火|土|Fire|Earth/i.test(String(elem));
    if (roll && roll.planet && roll.sign) {
      label = (roll.planet.zh || roll.planet.en || "") + "·" + (roll.sign.zh || roll.sign.en || "");
    }
    detail = pass
      ? (FQ.lang === "zh" ? "土火之象，宜行陆路。" : "Earth and fire: take the land road.")
      : (FQ.lang === "zh" ? "水风之象，问海慎行。" : "Water and air: be wary of the sea.");
  } else if ((id === "lot" || id === "jiaobei") && FQ.drawLot) {
    const lot = FQ.drawLot();
    const rank = (lot && lot.g) || "";
    pass = /上|中吉|小吉|Supreme|Great|Good|Fair/i.test(String(rank)) && !/下下|Testing/i.test(String(rank));
    if (/下下|Testing/.test(String(rank))) pass = false;
    if (/上上|上吉|Supreme|Great/.test(String(rank))) pass = true;
    label = lot ? ((FQ.lang === "zh" ? lot.g : lot.gEn) + " · " + (FQ.lang === "zh" ? lot.zh : lot.en).slice(0, 24)) : "签";
    detail = pass
      ? (FQ.lang === "zh" ? "上签：路开。" : "High lot: the road opens.")
      : (FQ.lang === "zh" ? "下签：宜止。" : "Low lot: better stop.");
  } else if (FQ.throwJiaobei) {
    const j = FQ.throwJiaobei();
    const res = j && j.res;
    pass = res && res.id === "sheng";
    label = res ? (FQ.t(res.tKey) || res.id) : "杯";
    detail = pass ? (FQ.lang === "zh" ? "圣杯。" : "Sheng.") : (FQ.lang === "zh" ? "笑杯/阴杯。" : "Xiao/Yin.");
  } else {
    pass = FQ.rollDivination(id);
    detail = pass ? (FQ.lang === "zh" ? "吉。" : "Auspicious.") : (FQ.lang === "zh" ? "凶。" : "Ill.");
  }
  return { pass, label, detail, method: id };
};

/**
 * Start five-beat ritual for an event choice.
 * opts: { divId, onDone(pass, cast), title }
 */
FQ.RITUAL.begin = function (opts) {
  const divId = opts.divId;
  const div = FQ.DB && FQ.DB.divination && (FQ.DB.divination[divId] || FQ.DB.divination[divId === "jiaobei" ? "lot" : divId]);
  if (FQ.RITUAL._timer) { clearTimeout(FQ.RITUAL._timer); FQ.RITUAL._timer = null; }
  FQ.RITUAL._job = { opts: opts || {}, divId, div, beat: 0, cast: null };
  FQ.RITUAL.renderBeat();
};

FQ.RITUAL.renderBeat = function () {
  const job = FQ.RITUAL._job;
  if (!job) return;
  const beat = job.beat;
  const names = FQ.lang === "zh"
    ? ["预兆", "操作", "悬念", "揭示", "余韵"]
    : ["Omen", "Act", "Suspense", "Reveal", "Afterglow"];
  let body = "";
  let btn = "";

  if (beat === 0) {
    const hint = Math.random() < 0.55 ? 1 : (Math.random() < 0.5 ? -1 : 0);
    const omenBlock = (FQ.omenHTML && FQ.t)
      ? FQ.omenHTML(job.divId === "lot" ? "jiaobei" : job.divId, FQ.omenFor(hint))
      : `<p class="ritual-omen">${FQ.lang === "zh" ? "香烟升起，问途之心先定。" : "Incense rises; set the question of the road."}</p>`;
    body = omenBlock;
    btn = `<button class="btn block ritual-act" onclick="FQ.RITUAL.advance()">${FQ.lang === "zh" ? "进入操作" : "Begin"}</button>`;
  } else if (beat === 1) {
    body = FQ.RITUAL.actUI(job.divId);
    btn = ""; /* actUI provides its own confirm */
  } else if (beat === 2) {
    body = `<p class="ritual-suspense dim">${FQ.lang === "zh" ? "铜铃未落……" : "The bell has not yet fallen…"}</p>
      <div class="ritual-pulse"></div>`;
    btn = `<button class="btn block" onclick="FQ.RITUAL.advance()">${FQ.lang === "zh" ? "看结果" : "Reveal"}</button>`;
    FQ.RITUAL._timer = setTimeout(() => {
      FQ.RITUAL._timer = null;
      if (FQ.RITUAL._job && FQ.RITUAL._job.beat === 2) FQ.RITUAL.advance();
    }, 900);
  } else if (beat === 3) {
    if (!job.cast) job.cast = FQ.RITUAL.castEngine(job.divId);
    const c = job.cast;
    body = `<h3>${FQ.esc(c.label)}</h3><p>${FQ.esc(c.detail)}</p>
      <p class="pill">${c.pass ? (FQ.lang === "zh" ? "吉 · 路可开" : "Auspicious") : (FQ.lang === "zh" ? "凶 · 宜缓" : "Ill omen")}</p>`;
    btn = `<button class="btn block" onclick="FQ.RITUAL.advance()">${FQ.lang === "zh" ? "余韵" : "Afterglow"}</button>`;
  } else {
    const c = job.cast || { pass: false };
    body = `<p class="dim">${FQ.lang === "zh" ? "烟散。卦意已写入旅途。" : "Smoke clears. The reading enters the road."}</p>`;
    btn = `<button class="btn block" onclick="FQ.RITUAL.finish()">${FQ.lang === "zh" ? "继续" : "Continue"}</button>`;
    /* apply table effects on pass before finish UI settles (skip for mentor learn trials) */
    if (!job._fxApplied && !(job.opts && job.opts.skipTableFx)) {
      job._fxApplied = true;
      FQ.applyDivinationTableEffects(job.divId, c.pass, FQ.TRAVEL._pending && FQ.TRAVEL._pending.routeId);
    }
  }

  const app = document.getElementById("app");
  app.innerHTML = `
    ${(FQ.CITY && FQ.CITY.hud) ? FQ.CITY.hud() : ""}
    <div class="panel ritual-shell beat-${beat}">
      <p class="dim small">${names[beat]} · ${beat + 1}/5</p>
      <h2>${optsTitle(job)}</h2>
      ${body}
      ${btn}
    </div>`;
};

function optsTitle(job) {
  if (job.opts && job.opts.title) return FQ.esc(job.opts.title);
  const div = job.div;
  return div ? FQ.T(div.name) : job.divId;
}

FQ.RITUAL.actUI = function (divId) {
  const id = divId === "jiaobei" ? "lot" : divId;
  if (id === "iching") {
    return `<p>${FQ.lang === "zh" ? "连点六次掷铜钱成卦" : "Tap six times to cast coins"}</p>
      <p id="ritual-act-prog" class="dim">0 / 6</p>
      <button class="btn block" id="ritual-tap" onclick="FQ.RITUAL.tapIching()">🪙</button>`;
  }
  if (id === "astrodice") {
    return `<p>${FQ.lang === "zh" ? "摇动星骰三次" : "Shake the astral dice thrice"}</p>
      <p id="ritual-act-prog" class="dim">0 / 3</p>
      <button class="btn block" onclick="FQ.RITUAL.tapDice()">🎲</button>`;
  }
  return `<p>${FQ.lang === "zh" ? "摇签筒至心安" : "Shake the lot tube until the heart settles"}</p>
    <p id="ritual-act-prog" class="dim">0 / 4</p>
    <button class="btn block ritual-shake" onclick="FQ.RITUAL.tapLot()">🎋</button>`;
};

FQ.RITUAL._taps = 0;
FQ.RITUAL.tapIching = function () {
  FQ.RITUAL._taps = (FQ.RITUAL._taps || 0) + 1;
  const el = document.getElementById("ritual-act-prog");
  if (el) el.textContent = FQ.RITUAL._taps + " / 6";
  if (FQ.AU && FQ.AU.wood) FQ.AU.wood();
  if (FQ.RITUAL._taps >= 6) { FQ.RITUAL._taps = 0; FQ.RITUAL.advance(); }
};
FQ.RITUAL.tapDice = function () {
  FQ.RITUAL._taps = (FQ.RITUAL._taps || 0) + 1;
  const el = document.getElementById("ritual-act-prog");
  if (el) el.textContent = FQ.RITUAL._taps + " / 3";
  if (FQ.RITUAL._taps >= 3) { FQ.RITUAL._taps = 0; FQ.RITUAL.advance(); }
};
FQ.RITUAL.tapLot = function () {
  FQ.RITUAL._taps = (FQ.RITUAL._taps || 0) + 1;
  const el = document.getElementById("ritual-act-prog");
  if (el) el.textContent = FQ.RITUAL._taps + " / 4";
  const btn = document.querySelector(".ritual-shake");
  if (btn) btn.classList.add("shake");
  setTimeout(() => btn && btn.classList.remove("shake"), 200);
  if (FQ.RITUAL._taps >= 4) { FQ.RITUAL._taps = 0; FQ.RITUAL.advance(); }
};

FQ.RITUAL.advance = function () {
  const job = FQ.RITUAL._job;
  if (!job) return;
  if (FQ.RITUAL._timer) { clearTimeout(FQ.RITUAL._timer); FQ.RITUAL._timer = null; }
  if (job.beat === 2 && !job.cast) job.cast = FQ.RITUAL.castEngine(job.divId);
  job.beat += 1;
  if (job.beat > 4) return FQ.RITUAL.finish();
  FQ.RITUAL.renderBeat();
};

FQ.RITUAL.finish = function () {
  if (FQ.RITUAL._timer) { clearTimeout(FQ.RITUAL._timer); FQ.RITUAL._timer = null; }
  const job = FQ.RITUAL._job;
  FQ.RITUAL._job = null;
  FQ.RITUAL._taps = 0;
  if (!job) return;
  const pass = !!(job.cast && job.cast.pass);
  if (typeof job.opts.onDone === "function") job.opts.onDone(pass, job.cast);
};

/** Mentor learn minigame — pay first, then act; success grants art */
FQ.RITUAL.beginLearn = function (divId, rid) {
  const w = FQ.ensureWorld();
  const div = FQ.DB.divination[divId];
  const cost = (div && div.cost && div.cost.coins) || 2;
  if (w.coins < cost) { FQ.toast(FQ.lang === "zh" ? "银两不足" : "Not enough coin"); return; }
  FQ.RITUAL.begin({
    divId,
    skipTableFx: true,
    title: FQ.lang === "zh" ? "拜师试手 · " + FQ.T(div.name) : "Trial · " + FQ.T(div.name),
    onDone(pass) {
      if (!pass) {
        FQ.applyEffects([{ op: "coins", value: -Math.min(1, cost) }, { op: "days", value: 1 }]);
        FQ.toast(FQ.lang === "zh" ? "未通，再试（耗一日）" : "Not yet — try again (−1 day)");
        return FQ.CITY.meetMentor(rid);
      }
      const res = FQ.applyEffects([
        { op: "learnDivination", value: divId },
        { op: "recruit", value: rid },
        { op: "coins", value: -cost }
      ]);
      if (!res.ok) FQ.toast(FQ.lang === "zh" ? "无法学习" : "Cannot learn");
      else FQ.toast(FQ.lang === "zh" ? "已学会" : "Learned");
      FQ.CITY.renderHub();
    }
  });
};
