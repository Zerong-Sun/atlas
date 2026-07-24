/* 《远行之书》· learn — 拜师与小游戏.
   Clicking "learn" no longer teaches you anything. Each art has its own
   minigame, built from the shape of that actual practice: you shake a lot
   cylinder, you count yarrow stalks by fours, you place planets in houses
   from testimonies, you pair dream symbols from memory, you strike sand rows
   against a clock, you answer generation-and-conquest. Failing is allowed.
   Walking away is allowed — the art simply stays unlearned. */
window.BOF = window.BOF || {};
BOF.LEARN = {};

BOF.LEARN.cur = null;  /* {art, teacher, phase, round, won, lost, g} */

BOF.LEARN.open = function (artId) {
  const art = BOF.DB.art(artId);
  if (!art) return;
  const teacher = BOF.DB.teachers[art.teacher]
    || Object.values(BOF.DB.teachers).find(t => t.teaches === artId);
  BOF.LEARN.cur = {
    art, teacher, phase: "intro",
    round: 0, won: 0, lost: 0, g: null, attempts: 0
  };
  BOF.UI.go("learn");
};

BOF.LEARN.begin = function () {
  const c = BOF.LEARN.cur;
  if (!c) return;
  c.phase = "work";
  c.round = 0; c.won = 0; c.lost = 0;
  BOF.LEARN.nextRound();
};

BOF.LEARN.leave = function () {
  if (BOF.LEARN.cur) clearTimeout(BOF.LEARN.cur.timer);
  BOF.LEARN.cur = null;
  BOF.UI.go("city");
};

BOF.LEARN.nextRound = function () {
  const c = BOF.LEARN.cur;
  if (!c) return;
  const mg = c.art.minigame;
  if (c.won >= mg.needed) return BOF.LEARN.pass(c);
  if (c.round >= mg.rounds) return BOF.LEARN.fail(c);
  c.round++;
  c.g = BOF.LEARN.GAMES[mg.kind].setup(mg.config || {}, c);
  BOF.UI.render();
  const g = BOF.LEARN.GAMES[mg.kind];
  if (g.start) setTimeout(() => g.start(c), 60);
};

BOF.LEARN.score = function (ok) {
  const c = BOF.LEARN.cur;
  if (!c || c.phase !== "work") return;
  if (ok) c.won++; else c.lost++;
  c.g.result = ok;
  BOF.UI.render();
  clearTimeout(c.timer);
  c.timer = setTimeout(() => {
    /* This fires 1.3s later, by which time the player may have walked out and
       started a different teacher's trial. Act only on the session this timer
       belongs to, or a stale callback grants an art nobody earned. */
    if (BOF.LEARN.cur !== c) return;
    const mg = c.art.minigame;
    if (c.won >= mg.needed) BOF.LEARN.pass(c);
    else if (c.round >= mg.rounds) BOF.LEARN.fail(c);
    else BOF.LEARN.nextRound();
  }, 1300);
};

BOF.LEARN.pass = function (session) {
  const c = session || BOF.LEARN.cur;
  if (!c || BOF.LEARN.cur !== c) return;
  const s = BOF.state;
  if (!s.learned.includes(c.art.id)) {
    s.learned.push(c.art.id);
    const i = s.offered.indexOf(c.art.id);
    if (i >= 0) s.offered.splice(i, 1);
    BOF.note("✒️", BOF.lang() === "zh"
      ? "习得「" + BOF.bi(c.art.name) + "」。"
      : "Learned " + BOF.bi(c.art.name) + ".");
    BOF.save();
  }
  c.phase = "grad";
  BOF.UI.render();
};

BOF.LEARN.fail = function (session) {
  const c = session || BOF.LEARN.cur;
  if (!c || BOF.LEARN.cur !== c) return;
  c.attempts++;
  c.phase = "failed";
  /* time passes whether or not you got it */
  BOF.state.days += 2;
  BOF.save();
  BOF.UI.render();
};

BOF.LEARN.retry = function () {
  const c = BOF.LEARN.cur;
  if (!c) return;
  c.phase = "work"; c.round = 0; c.won = 0; c.lost = 0;
  BOF.LEARN.nextRound();
};

/* ================= the six games ================= */
BOF.LEARN.GAMES = {};

/* ---- 圣签 sortes: stop the swinging stick inside the band ---- */
BOF.LEARN.GAMES.sortes = {
  setup(cfg, c) {
    const shrink = Math.pow(cfg.shrink || 0.82, c.round - 1);
    return {
      band: (cfg.band || 0.17) * shrink,
      speed: (cfg.speed || 1) * (1 + (c.round - 1) * 0.22),
      pos: 0, raf: null, result: null, stopped: false
    };
  },
  start(c) {
    const g = c.g;
    const t0 = performance.now();
    const tick = now => {
      if (!BOF.LEARN.cur || c.g !== g || g.stopped) return;
      const t = (now - t0) / 1000 * g.speed;
      g.pos = (Math.sin(t * 2.1) + 1) / 2;           /* 0..1, eased at the ends */
      const el = document.getElementById("mg-stick");
      if (el) el.style.left = (g.pos * 100) + "%";
      g.raf = requestAnimationFrame(tick);
    };
    g.raf = requestAnimationFrame(tick);
  },
  act(c) {
    const g = c.g;
    if (g.stopped) return;
    g.stopped = true;
    if (g.raf) cancelAnimationFrame(g.raf);
    BOF.LEARN.score(Math.abs(g.pos - 0.5) <= g.band / 2);
  },
  html(c) {
    const g = c.g, zh = BOF.lang() === "zh";
    return `
      <div class="mg mg-sortes">
        <p class="mg-task">${zh ? "签在动。落在中线上才算数。" : "The stick is swinging. It only counts on the centre line."}</p>
        <div class="mg-track">
          <div class="mg-band" style="width:${g.band * 100}%;left:${50 - g.band * 50}%"></div>
          <div class="mg-center"></div>
          <div class="mg-stick" id="mg-stick" style="left:${g.pos * 100}%"></div>
        </div>
        <button class="btn block" onclick="BOF.LEARN.GAMES.sortes.act(BOF.LEARN.cur)"
                ${g.stopped ? "disabled" : ""}>${zh ? "停" : "Stop"}</button>
      </div>`;
  }
};

/* ---- 周易 yarrow: divide the bundle, then count what is left by fours ---- */
BOF.LEARN.GAMES.yarrow = {
  setup(cfg) {
    const total = cfg.stalks || 49;
    /* the player splits; the engine does the ritual and asks for the remainder */
    return { total, split: null, remainder: null, answered: null, result: null };
  },
  split(c, left) {
    const g = c.g;
    if (g.split != null) return;
    g.split = left;
    const right = g.total - left;
    /* the classical move: take one from the right, then count each pile by 4s
       (a remainder of 0 counts as 4) */
    const r2 = right - 1;
    const remL = (left % 4) || 4;
    const remR = (r2 % 4) || 4;
    g.remainder = remL + remR + 1;   /* +1 for the stalk hung between the fingers */
    BOF.UI.render();
  },
  answer(c, n) {
    const g = c.g;
    if (g.answered != null) return;
    g.answered = n;
    BOF.LEARN.score(n === g.remainder);
  },
  html(c) {
    const g = c.g, zh = BOF.lang() === "zh";
    if (g.split == null) {
      const marks = Array.from({ length: 41 }, (_, i) =>
        `<button class="mg-stalk" onclick="BOF.LEARN.GAMES.yarrow.split(BOF.LEARN.cur,${i + 4})"
           style="--i:${i}" aria-label="${i + 4}"></button>`).join("");
      return `
        <div class="mg mg-yarrow">
          <p class="mg-task">${zh ? "四十九根蓍草，随手分作两堆。" : "Forty-nine stalks. Divide the bundle wherever your hand falls."}</p>
          <div class="mg-bundle">${marks}</div>
          <p class="dim small center">${zh ? "点一处分开" : "Tap to divide"}</p>
        </div>`;
    }
    const opts = [4, 5, 8, 9].map(n => `
      <button class="btn ${g.answered === n ? (g.result ? "good" : "bad") : "ghost"}"
              onclick="BOF.LEARN.GAMES.yarrow.answer(BOF.LEARN.cur,${n})"
              ${g.answered != null ? "disabled" : ""}>${n}</button>`).join("");
    return `
      <div class="mg mg-yarrow">
        <p class="mg-task">${zh
          ? "左 " + g.split + "，右 " + (g.total - g.split) + "。右取一挂于指间，两堆各以四揲之，余数并挂一——共余几？"
          : "Left " + g.split + ", right " + (g.total - g.split) + ". Hang one from the right between your fingers, count each pile by fours, and add the hung stalk. What is the total remainder?"}</p>
        <div class="mg-opts">${opts}</div>
        ${g.answered != null ? `<p class="mg-verdict ${g.result ? "good" : "bad"}">${
          g.result ? (zh ? "数对了。" : "Counted right.")
                   : (zh ? "是 " + g.remainder + "。再来。" : "It was " + g.remainder + ". Again.")}</p>` : ""}
      </div>`;
  }
};

/* ---- 八字 fivephase: which phase generates / overcomes which ---- */
BOF.LEARN.GAMES.fivephase = {
  setup(cfg) {
    const ph = cfg.phases;
    const from = ph[Math.floor(Math.random() * ph.length)];
    const mode = Math.random() < 0.5 ? "generates" : "overcomes";
    const right = cfg[mode][from];
    const wrong = ph.filter(p => p !== right && p !== from);
    const opts = [right, wrong[0], wrong[1]].sort(() => Math.random() - 0.5);
    return { cfg, from, mode, right, opts, picked: null, result: null };
  },
  pick(c, p) {
    const g = c.g;
    if (g.picked) return;
    g.picked = p;
    BOF.LEARN.score(p === g.right);
  },
  html(c) {
    const g = c.g, zh = BOF.lang() === "zh";
    const nm = k => BOF.bi(g.cfg.names[k]);
    const verb = g.mode === "generates" ? (zh ? "生" : "generates") : (zh ? "克" : "overcomes");
    const opts = g.opts.map(p => `
      <button class="mg-phase ${p} ${g.picked === p ? (g.result ? "good" : "bad") : ""}
              ${g.picked && p === g.right ? "reveal" : ""}"
              onclick="BOF.LEARN.GAMES.fivephase.pick(BOF.LEARN.cur,'${p}')"
              ${g.picked ? "disabled" : ""}>${BOF.esc(nm(p))}</button>`).join("");
    return `
      <div class="mg mg-fivephase">
        <p class="mg-task">${zh ? "五行之理：" : "Generation and conquest:"}</p>
        <div class="mg-eq"><span class="mg-phase ${g.from} src">${BOF.esc(nm(g.from))}</span>
          <span class="mg-verb">${verb}</span><span class="mg-blank">?</span></div>
        <div class="mg-opts">${opts}</div>
      </div>`;
  }
};

/* ---- 星命 astrolabe: place the wanderers from testimonies ---- */
BOF.LEARN.GAMES.astrolabe = {
  setup(cfg, c) {
    const n = Math.min(3, 2 + Math.floor(c.round / 2));
    const bodies = cfg.bodies.slice().sort(() => Math.random() - 0.5).slice(0, n);
    const houses = [];
    while (houses.length < n) {
      const h = 1 + Math.floor(Math.random() * cfg.houses);
      if (!houses.includes(h)) houses.push(h);
    }
    const truth = {};
    bodies.forEach((b, i) => { truth[b.id] = houses[i]; });

    /* testimonies: one absolute, the rest relative — so it is a deduction */
    const zh = BOF.lang() === "zh";
    const clues = [];
    clues.push(zh
      ? bodies[0].zh + "在第 " + truth[bodies[0].id] + " 宫。"
      : bodies[0].en + " is in house " + truth[bodies[0].id] + ".");
    for (let i = 1; i < bodies.length; i++) {
      const a = bodies[i], prev = bodies[i - 1];
      const d = ((truth[a.id] - truth[prev.id]) % cfg.houses + cfg.houses) % cfg.houses;
      clues.push(zh
        ? a.zh + "在" + prev.zh + "之后第 " + d + " 宫（顺行）。"
        : a.en + " stands " + d + " houses after " + prev.en + ", in the order of the signs.");
    }
    return { cfg, bodies, truth, clues, place: {}, sel: bodies[0].id, result: null, houses: cfg.houses };
  },
  select(c, id) { c.g.sel = id; BOF.UI.render(); },
  put(c, h) {
    const g = c.g;
    if (g.result != null) return;
    Object.keys(g.place).forEach(k => { if (g.place[k] === h) delete g.place[k]; });
    g.place[g.sel] = h;
    const next = g.bodies.find(b => g.place[b.id] == null);
    if (next) g.sel = next.id;
    BOF.UI.render();
  },
  submit(c) {
    const g = c.g;
    if (g.result != null) return;
    const ok = g.bodies.every(b => g.place[b.id] === g.truth[b.id]);
    BOF.LEARN.score(ok);
  },
  html(c) {
    const g = c.g, zh = BOF.lang() === "zh";
    const R = 108, cx = 130, cy = 130;
    const houses = Array.from({ length: g.houses }, (_, i) => {
      const h = i + 1;
      const ang = (i / g.houses) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
      const who = g.bodies.find(b => g.place[b.id] === h);
      return `<g class="mg-house ${who ? "filled" : ""}" transform="translate(${x},${y})"
                onclick="BOF.LEARN.GAMES.astrolabe.put(BOF.LEARN.cur,${h})">
        <circle r="15"/>
        <text class="mg-house-n" y="4">${who ? who.sym : h}</text>
      </g>`;
    }).join("");
    const spokes = Array.from({ length: g.houses }, (_, i) => {
      const ang = (i / g.houses) * Math.PI * 2 - Math.PI / 2;
      return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(ang) * R}" y2="${cy + Math.sin(ang) * R}"/>`;
    }).join("");
    const chips = g.bodies.map(b => `
      <button class="mg-body ${g.sel === b.id ? "on" : ""} ${g.place[b.id] ? "set" : ""}"
              onclick="BOF.LEARN.GAMES.astrolabe.select(BOF.LEARN.cur,'${b.id}')">
        ${b.sym} ${BOF.esc(BOF.bi(b))}${g.place[b.id] ? " · " + g.place[b.id] : ""}
      </button>`).join("");
    const done = g.bodies.every(b => g.place[b.id] != null);
    return `
      <div class="mg mg-astrolabe">
        <p class="mg-task">${zh ? "依所给之兆，把星各归其宫。" : "From the testimonies, set each wanderer in its house."}</p>
        <ul class="mg-clues">${g.clues.map(x => `<li>${BOF.esc(x)}</li>`).join("")}</ul>
        <div class="mg-astro-row">
          <svg viewBox="0 0 260 260" class="mg-wheel">
            <circle cx="${cx}" cy="${cy}" r="${R}" class="mg-wheel-ring"/>
            <g class="mg-spokes">${spokes}</g>
            ${houses}
          </svg>
          <div class="mg-bodies">${chips}</div>
        </div>
        <button class="btn block" ${done && g.result == null ? "" : "disabled"}
                onclick="BOF.LEARN.GAMES.astrolabe.submit(BOF.LEARN.cur)">
          ${zh ? "定盘" : "Fix the chart"}</button>
      </div>`;
  }
};

/* ---- 梦占 oneiro: memorise symbol→meaning, then pair them back ---- */
BOF.LEARN.GAMES.oneiro = {
  setup(cfg) {
    const pairs = cfg.pairs.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    return {
      cfg, pairs,
      shown: pairs.slice().sort(() => Math.random() - 0.5),
      meanings: pairs.slice().sort(() => Math.random() - 0.5),
      phase: "peek", answers: {}, sel: null, result: null
    };
  },
  start(c) {
    const g = c.g;
    setTimeout(() => {
      if (!BOF.LEARN.cur || c.g !== g) return;
      g.phase = "recall";
      BOF.UI.render();
    }, (g.cfg.peek || 4200));
  },
  choose(c, symIdx) { c.g.sel = symIdx; BOF.UI.render(); },
  assign(c, meanIdx) {
    const g = c.g;
    if (g.sel == null || g.result != null) return;
    Object.keys(g.answers).forEach(k => { if (g.answers[k] === meanIdx) delete g.answers[k]; });
    g.answers[g.sel] = meanIdx;
    g.sel = null;
    BOF.UI.render();
  },
  submit(c) {
    const g = c.g;
    if (g.result != null) return;
    const ok = g.shown.every((p, i) => {
      const m = g.answers[i];
      return m != null && g.meanings[m].sym === p.sym;
    });
    BOF.LEARN.score(ok);
  },
  html(c) {
    const g = c.g, zh = BOF.lang() === "zh";
    if (g.phase === "peek") {
      return `
        <div class="mg mg-oneiro peek">
          <p class="mg-task">${zh ? "记住。象与义要在心里配得上号。" : "Remember them. Symbol and meaning must pair in the mind."}</p>
          <div class="mg-pairs">${g.pairs.map(p => `
            <div class="mg-pair"><span class="mg-sym">${p.sym}</span>
              <span class="mg-sym-n">${BOF.esc(BOF.bi(p))}</span>
              <span class="mg-mean">${BOF.esc(BOF.bi(p, "mZh", "mEn"))}</span></div>`).join("")}</div>
          <div class="mg-timer"><i></i></div>
        </div>`;
    }
    const syms = g.shown.map((p, i) => `
      <button class="mg-sym-btn ${g.sel === i ? "on" : ""} ${g.answers[i] != null ? "set" : ""}"
              onclick="BOF.LEARN.GAMES.oneiro.choose(BOF.LEARN.cur,${i})">
        <span class="mg-sym">${p.sym}</span><span>${BOF.esc(BOF.bi(p))}</span>
      </button>`).join("");
    const means = g.meanings.map((p, i) => {
      const taken = Object.values(g.answers).includes(i);
      const forSym = Object.keys(g.answers).find(k => g.answers[k] === i);
      return `<button class="mg-mean-btn ${taken ? "taken" : ""}"
              onclick="BOF.LEARN.GAMES.oneiro.assign(BOF.LEARN.cur,${i})">
        ${taken ? `<span class="mg-sym sm">${g.shown[forSym].sym}</span>` : ""}
        ${BOF.esc(BOF.bi(p, "mZh", "mEn"))}</button>`;
    }).join("");
    const done = g.shown.every((p, i) => g.answers[i] != null);
    return `
      <div class="mg mg-oneiro">
        <p class="mg-task">${zh ? "把象与义配回去。" : "Pair each symbol back to its meaning."}</p>
        <div class="mg-oneiro-cols">
          <div class="mg-col">${syms}</div>
          <div class="mg-col wide">${means}</div>
        </div>
        <button class="btn block" ${done && g.result == null ? "" : "disabled"}
                onclick="BOF.LEARN.GAMES.oneiro.submit(BOF.LEARN.cur)">${zh ? "解" : "Read it"}</button>
      </div>`;
  }
};

/* ---- 沙占 raml: strike four rows against the clock, odd/even makes the figure ---- */
BOF.LEARN.GAMES.raml = {
  setup(cfg) {
    const fig = cfg.figures[Math.floor(Math.random() * cfg.figures.length)];
    return {
      cfg, fig, rows: [], marks: [0, 0, 0, 0], row: 0,
      t0: 0, deadline: cfg.window || 1500, over: false, result: null
    };
  },
  start(c) {
    const g = c.g;
    g.t0 = performance.now();
    const tick = () => {
      if (!BOF.LEARN.cur || c.g !== g || g.over) return;
      const left = g.deadline - (performance.now() - g.t0);
      const bar = document.getElementById("mg-raml-bar");
      if (bar) bar.style.width = Math.max(0, left / g.deadline * 100) + "%";
      if (left <= 0) { BOF.LEARN.GAMES.raml.commit(c, true); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
  strike(c) {
    const g = c.g;
    if (g.over) return;
    g.marks[g.row]++;
    const el = document.getElementById("mg-raml-row-" + g.row);
    if (el) el.textContent = "·".repeat(g.marks[g.row]);
  },
  nextRow(c) {
    const g = c.g;
    if (g.over) return;
    if (g.marks[g.row] === 0) return;
    g.row++;
    g.t0 = performance.now();
    if (g.row >= 4) BOF.LEARN.GAMES.raml.commit(c, false);
    else BOF.UI.render();
  },
  commit(c, timeout) {
    const g = c.g;
    if (g.over) return;
    g.over = true;
    const lines = g.marks.map(m => m % 2 === 1 ? 1 : 0);
    const ok = !timeout && lines.every((v, i) => v === g.fig.lines[i]);
    g.made = lines;
    BOF.LEARN.score(ok);
  },
  html(c) {
    const g = c.g, zh = BOF.lang() === "zh";
    const want = g.fig.lines.map(v => v ? "•" : "• •").join("<br>");
    const rows = [0, 1, 2, 3].map(i => `
      <div class="mg-raml-line ${i === g.row ? "on" : ""} ${i < g.row ? "done" : ""}">
        <span class="mg-raml-n">${i + 1}</span>
        <span class="mg-raml-marks" id="mg-raml-row-${i}">${"·".repeat(g.marks[i])}</span>
        ${i < g.row ? `<span class="mg-raml-parity">${g.marks[i] % 2 ? "•" : "• •"}</span>` : ""}
      </div>`).join("");
    return `
      <div class="mg mg-raml">
        <p class="mg-task">${zh
          ? "起「" + g.fig.zh + "」。四行沙点，奇为一点，偶为二点。手要快过念头。"
          : "Raise " + g.fig.en + ". Four rows: odd makes one dot, even makes two. The hand must outrun the thought."}</p>
        <div class="mg-raml-target"><div class="dim small">${zh ? "所命之象" : "The named figure"}</div>
          <div class="mg-fig">${want}</div></div>
        <div class="mg-raml-rows">${rows}</div>
        <div class="mg-raml-timer"><i id="mg-raml-bar"></i></div>
        <div class="mg-raml-btns">
          <button class="btn block" onpointerdown="BOF.LEARN.GAMES.raml.strike(BOF.LEARN.cur)"
                  ${g.over ? "disabled" : ""}>${zh ? "点沙" : "Strike"}</button>
          <button class="btn ghost" onclick="BOF.LEARN.GAMES.raml.nextRow(BOF.LEARN.cur)"
                  ${g.over ? "disabled" : ""}>${zh ? "下一行" : "Next row"} →</button>
        </div>
        ${g.over && g.made ? `<p class="mg-verdict ${g.result ? "good" : "bad"}">${
          zh ? "成象：" + g.made.map(v => v ? "•" : "••").join(" ")
             : "You raised: " + g.made.map(v => v ? "•" : "••").join(" ")}</p>` : ""}
      </div>`;
  }
};

/* ---------- the screen ---------- */
BOF.LEARN.screenHTML = function () {
  const c = BOF.LEARN.cur;
  if (!c) return "";
  const zh = BOF.lang() === "zh";
  const t = c.teacher, art = c.art;
  const face = BOF.ART.img((t && t.art) || art.art, "lr-face");

  if (c.phase === "intro") {
    return `
      <div class="lr-screen">
        <button class="back" onclick="BOF.LEARN.leave()">${zh ? "← 改日再来" : "← Another day"}</button>
        <div class="lr-intro">
          ${face}
          <div class="lr-who">${BOF.esc(BOF.bi(t && t.name))}</div>
          <h2>${BOF.esc(BOF.bi(art.name))}</h2>
          <p class="lr-said">${BOF.esc(BOF.bi(t && t.intro))}</p>
          <p class="lr-desc dim">${BOF.esc(BOF.bi(art.desc))}</p>
          <div class="lr-task">◈ ${BOF.esc(BOF.bi(t && t.task))}</div>
          <div class="lr-terms dim small">${zh
            ? "共 " + art.minigame.rounds + " 次，须成 " + art.minigame.needed + " 次。"
            : art.minigame.needed + " of " + art.minigame.rounds + " must come right."}</div>
          <button class="btn block" onclick="BOF.LEARN.begin()">${zh ? "开始" : "Begin"}</button>
          <button class="btn ghost block" onclick="BOF.LEARN.leave()">${zh ? "不学了" : "Don't learn it"}</button>
        </div>
      </div>`;
  }

  if (c.phase === "grad") {
    return `
      <div class="lr-screen">
        <div class="lr-grad">
          ${face}
          <div class="lr-who">${BOF.esc(BOF.bi(t && t.name))}</div>
          <p class="lr-said">${BOF.esc(BOF.bi(t && t.grad))}</p>
          <div class="lr-learned">✦ ${zh ? "习得" : "Learned"} 「${BOF.esc(BOF.bi(art.name))}」</div>
          <div class="lr-effects">${(art.effects || []).map(e =>
            `<span class="pill">${BOF.esc(e.stat)} ${e.delta > 0 ? "+" : ""}${e.delta}</span>`).join("")}</div>
          <button class="btn block" onclick="BOF.LEARN.leave()">${zh ? "谢过师父" : "Thank the teacher"}</button>
        </div>
      </div>`;
  }

  if (c.phase === "failed") {
    return `
      <div class="lr-screen">
        <div class="lr-fail">
          ${face}
          <p class="lr-said">${zh
            ? "「今天不成。手还没有跟上。」他把东西收起来：「明天再来，或者不来——学不会不丢人，装会才丢人。」"
            : "\"Not today. The hand has not caught up.\" He puts the things away. \"Come tomorrow, or don't. There is no shame in not learning it — only in pretending you have.\""}</p>
          <div class="dim small">${zh ? "过了两天。" : "Two days have passed."}</div>
          <button class="btn block" onclick="BOF.LEARN.retry()">${zh ? "再试一次" : "Try again"}</button>
          <button class="btn ghost block" onclick="BOF.LEARN.leave()">${zh ? "算了" : "Leave it"}</button>
        </div>
      </div>`;
  }

  /* work */
  const mg = art.minigame;
  const game = BOF.LEARN.GAMES[mg.kind];
  const pips = Array.from({ length: mg.rounds }, (_, i) =>
    `<i class="${i < c.won ? "won" : i < c.won + c.lost ? "lost" : ""}"></i>`).join("");
  return `
    <div class="lr-screen work">
      <div class="lr-hud">
        <span class="dim small">${BOF.esc(BOF.bi(art.name))}</span>
        <span class="lr-pips">${pips}</span>
        <span class="dim small">${c.won}/${mg.needed}</span>
      </div>
      ${game.html(c)}
      ${c.g.result != null ? `<div class="lr-verdict ${c.g.result ? "good" : "bad"}">${
        c.g.result ? (zh ? "✦ 成了" : "✦ Right") : (zh ? "✕ 不成" : "✕ Not right")}</div>` : ""}
    </div>`;
};
