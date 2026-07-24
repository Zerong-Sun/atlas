/* 《远行之书》· ui — the shell.
   One render function, one screen at a time, all state in BOF.state. Screens:
   title · roll · map · city · event · travel · learn · saves · book. */
window.BOF = window.BOF || {};
BOF.UI = {};

BOF.UI.screen = "title";
BOF.UI.param = null;

BOF.UI.root = () => document.getElementById("app");

BOF.UI.go = function (screen, param) {
  BOF.UI.screen = screen;
  BOF.UI.param = param || null;
  BOF.UI.render();
  window.scrollTo(0, 0);
};

BOF.UI.toast = function (msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(BOF.UI._t);
  BOF.UI._t = setTimeout(() => el.classList.remove("show"), 2400);
};

const zhq = () => BOF.lang() === "zh";

/* ---------- render ---------- */
BOF.UI.render = function () {
  const root = BOF.UI.root();
  if (!root) return;
  const S = BOF.UI.SCREENS[BOF.UI.screen] || BOF.UI.SCREENS.title;
  document.body.dataset.screen = BOF.UI.screen;
  root.innerHTML = S();
  if (BOF.UI.screen === "map") BOF.MAP.attach();
  BOF.UI.paintDock();
};

BOF.UI.paintDock = function () {
  const dock = document.getElementById("bof-dock");
  if (!dock) return;
  const playing = !!(BOF.state && BOF.state.who);
  dock.hidden = !playing || ["title", "roll", "travel", "learn"].includes(BOF.UI.screen);
  if (dock.hidden) return;
  const on = k => BOF.UI.screen === k ? "on" : "";
  dock.innerHTML = `
    <button class="${on("city")}" onclick="BOF.UI.go('city')">🏙️<span>${zhq() ? "城" : "City"}</span></button>
    <button class="${on("map")}" onclick="BOF.UI.go('map')">🗺️<span>${zhq() ? "舆图" : "Map"}</span></button>
    <button class="${on("book")}" onclick="BOF.UI.go('book')">📖<span>${zhq() ? "行纪" : "Book"}</span></button>
    <button class="${on("saves")}" onclick="BOF.UI.go('saves')">💾<span>${zhq() ? "存档" : "Saves"}</span></button>`;
};

/* the standing bar: day, purse, standing, arts */
BOF.UI.hud = function () {
  const s = BOF.state;
  const c = BOF.DB.city(s.at);
  const zh = zhq();
  return `
    <div class="hud">
      <span class="pill">📅 <b>${s.days}</b> ${zh ? "天" : "d"} · ${BOF.ROLL.yearNow()}</span>
      <span class="pill">💰 <b>${s.coins}</b></span>
      <span class="pill">🕯️ <b>${s.rep.city[s.at] || 0}</b></span>
      <span class="pill">✒️ <b>${s.learned.length}</b>/${Object.keys(BOF.DB.divinations).length}</span>
      <span class="pill">🗺️ <b>${s.visitedCities.length}</b>/${s.knownCities.length}</span>
      ${c ? `<span class="pill here">${BOF.esc(BOF.bi(c.name))}</span>` : ""}
    </div>`;
};

BOF.UI.SCREENS = {};

/* ===== title ===== */
BOF.UI.SCREENS.title = function () {
  const zh = zhq();
  const has = BOF.hasSave();
  const problems = BOF.DB.problems.length;
  return `
    <div class="title-screen">
      <div class="t-orn">✦ ◆ ✦</div>
      <h1 class="t-logo">${zh ? "远行之书" : "The Book of Far Roads"}</h1>
      <div class="t-sub">${zh ? "THE BOOK OF FAR ROADS · 千载行纪" : "远行之书 · 1253–1453"}</div>
      <p class="t-tag">${zh
        ? "你不是去征服世界，而是去理解世界。"
        : "You are not here to conquer the world. You are here to understand it."}</p>
      ${has ? `<button class="btn t-start" onclick="BOF.UI.resume()">${zh ? "接着走" : "Continue"}</button>` : ""}
      <button class="btn ${has ? "ghost" : ""} t-start" onclick="BOF.ROLL.begin();BOF.UI.go('roll')">
        ${zh ? "抽取行者" : "Draw a traveler"}
      </button>
      <button class="btn ghost sm" onclick="BOF.UI.go('saves')">${zh ? "存档" : "Saved games"}</button>
      <div class="t-opts">
        <button class="pill" onclick="BOF.UI.setLang(BOF.lang()==='zh'?'en':'zh')">🀄 ${zh ? "EN" : "中文"}</button>
      </div>
      ${problems ? `<div class="t-warn">⚠ ${problems} ${zh ? "条数据问题（见控制台）" : "data problems — see console"}</div>` : ""}
      <div class="t-foot">${zh
        ? "娱乐与文明探索 · 占卜内容不作现实指引"
        : "For play and cultural curiosity. Divination here is not life advice."}</div>
    </div>`;
};

BOF.UI.resume = function () {
  if (!BOF.load()) { BOF.UI.toast(zhq() ? "没有存档" : "No save"); return; }
  BOF.UI.go("city");
};

BOF.UI.setLang = function (l) {
  if (window.FQ) { FQ.lang = l; try { FQ.state.lang = l; FQ.save(); } catch (e) {} }
  BOF.UI.render();
};

/* ===== roll ===== */
BOF.UI.SCREENS.roll = function () {
  const c = BOF.ROLL.cur;
  if (!c) { BOF.ROLL.begin(); return ""; }
  const zh = zhq();
  const era = BOF.ROLL.eraOf(c.birth.y);
  const bars = BOF.DB.meta.fateBars.map(b => {
    const raw = c.fate[b.id];
    const adj = c.archetype ? BOF.ROLL.withArchetype(c.fate, c.archetype)[b.id] : raw;
    const d = adj - raw;
    return `
      <div class="rl-bar">
        <span class="rl-bar-n">${BOF.esc(BOF.bi(b.name))}</span>
        <span class="rl-bar-t"><i style="width:${adj / 31 * 100}%"></i></span>
        <b>${adj}</b>${d ? `<span class="rl-delta ${d > 0 ? "up" : "down"}">${d > 0 ? "+" : ""}${d}</span>` : ""}
        <span class="dim small rl-bar-note">${BOF.esc(BOF.bi(b.note))}</span>
      </div>`;
  }).join("");

  const grade = c.archetype
    ? BOF.ROLL.gradeOf(BOF.ROLL.withArchetype(c.fate, c.archetype))
    : c.grade;

  const cards = Object.values(BOF.DB.archetypes).map(a => {
    const start = BOF.DB.city(a.start);
    const known = (a.knownCities || []).map(id => BOF.bi(BOF.DB.city(id).name)).join(" · ");
    const on = c.archetype && c.archetype.id === a.id;
    return `
      <button class="rl-card ${on ? "on" : ""}" onclick="BOF.ROLL.choose('${a.id}')">
        ${BOF.ART.img(a.art, "rl-card-face")}
        <div class="rl-card-body">
          <b>${BOF.esc(BOF.bi(a.name))}</b>
          <p class="rl-card-portrait">${BOF.esc(BOF.bi(a.portrait))}</p>
          <p class="rl-card-obsession">「${BOF.esc(BOF.bi(a.obsession))}」</p>
          <div class="rl-card-meta">
            <span class="pill">${zh ? "起点" : "Start"}: ${BOF.esc(BOF.bi(start.name))}</span>
            <span class="pill">${zh ? "已知" : "Knows"}: ${BOF.esc(known)}</span>
            <span class="pill">💰 ${a.startKit.coins}</span>
          </div>
        </div>
      </button>`;
  }).join("");

  return `
    <div class="rl-screen">
      <button class="back" onclick="BOF.UI.go('title')">${zh ? "← 回书案" : "← Back to the desk"}</button>
      <h2>${zh ? "抽取行者" : "Draw a traveler"}</h2>

      <section class="rl-sec">
        <div class="rl-sec-h">${zh ? "一 · 生辰" : "I · Birth"}</div>
        <div class="rl-birth">
          <div class="rl-date">${c.birth.iso}</div>
          <p class="rl-era">${BOF.esc(BOF.bi(era))}</p>
          <button class="btn ghost sm" onclick="BOF.ROLL.reroll()" ${c.rerolls <= 0 ? "disabled" : ""}>
            ${zh ? "重抽" : "Draw again"} (${c.rerolls})
          </button>
        </div>
      </section>

      <section class="rl-sec">
        <div class="rl-sec-h">${zh ? "二 · 命格" : "II · Fate"}</div>
        <div class="rl-bars">${bars}</div>
        <div class="rl-grade">${zh ? "综评" : "Grade"}: <b>${BOF.esc(BOF.bi(grade))}</b></div>
        <p class="dim small rl-grade-note">${BOF.esc(BOF.bi(BOF.DB.meta.gradeNote))}</p>
      </section>

      <section class="rl-sec">
        <div class="rl-sec-h">${zh ? "三 · 身份与起点" : "III · Who you are, and where that puts you"}</div>
        <div class="rl-cards">${cards}</div>
      </section>

      ${c.archetype ? `
        <div class="rl-confirm">
          <div class="rl-confirm-txt">${zh
            ? "确定之后，你将在" + BOF.esc(BOF.bi(BOF.DB.city(c.archetype.start).name)) + "醒来。"
            : "Confirm, and you wake in " + BOF.esc(BOF.bi(BOF.DB.city(c.archetype.start).name)) + "."}</div>
          <button class="btn block" onclick="BOF.ROLL.confirm()">${zh ? "就是他 · 出发" : "This one · depart"} →</button>
        </div>` : `<p class="dim center rl-hint">${zh ? "选一位行者。" : "Choose a traveler."}</p>`}
    </div>`;
};

/* ===== map ===== */
BOF.UI.SCREENS.map = function () {
  return `${BOF.UI.hud()}${BOF.MAP.render()}`;
};

/* ===== city ===== */
BOF.UI.SCREENS.city = function () {
  const s = BOF.state;
  if (!s || !s.at) return BOF.UI.SCREENS.title();
  const c = BOF.DB.city(s.at);
  const zh = zhq();
  const geo = BOF.DB.mapCities[c.map] || {};

  const sites = BOF.EV.sitesOf(s.at).map(x => `
    <button class="ct-site ${x.done ? "done" : ""} ${x.locked ? "locked" : ""}"
            ${x.done || x.locked ? "" : `onclick="BOF.EV.open('${x.id}')"`}>
      ${BOF.ART.img(x.ev.art, "ct-site-art")}
      <span class="ct-site-t">
        <b>${BOF.esc(BOF.bi(x.ev.title))}</b>
        <span class="dim small">${x.done ? (zh ? "已探" : "explored")
          : x.locked ? BOF.UI.gateWhy(x.why) : (zh ? "可探" : "unexplored")}</span>
      </span>
    </button>`).join("");

  const teach = BOF.EV.teacherHere();
  const teachHTML = teach ? `
    <button class="ct-teacher" onclick="BOF.LEARN.open('${teach.art.id}')">
      ${BOF.ART.img(teach.teacher.art, "ct-teacher-face")}
      <span class="ct-teacher-t">
        <b>${BOF.esc(BOF.bi(teach.teacher.name))}</b>
        <span class="dim small">${zh ? "在此授" : "teaches"} 「${BOF.esc(BOF.bi(teach.art.name))}」</span>
      </span>
      <span class="ct-go">${zh ? "拜师" : "Study"} →</span>
    </button>` : "";

  const deps = BOF.EV.departures();
  const depHTML = deps.length ? deps.map(d => `
    <button class="ct-dep" onclick="BOF.TRAVEL.plan('${d.route.id}','${d.to.id}')">
      <span>${d.route.kind === "sea" ? "⛵" : d.route.kind === "river" ? "🛶" : "🐪"}
        <b>${BOF.esc(BOF.bi(d.to.name))}</b></span>
      <span class="dim small">${d.route.days}${zh ? "天" : "d"} · ${zh ? "险" : "risk"} ${d.route.risk}</span>
    </button>`).join("")
    : `<p class="dim small">${zh
        ? "你不知道从这里出发的任何一条路。去探探这座城，或者找人问。"
        : "You know of no road out of here. Explore the city, or ask someone."}</p>`;

  const market = c.market ? `
    <div class="ct-sec">
      <div class="ct-sec-h">${zh ? "市集" : "Market"}</div>
      <div class="ct-goods">${(c.market.goods || []).map(g => {
        const gd = BOF.DB.good(g);
        return `<span class="pill">${BOF.esc(BOF.bi(gd && gd.name))}</span>`;
      }).join("")}</div>
      <div class="dim small">${zh ? "结算" : "Settles in"}: ${BOF.esc(BOF.bi(
        (BOF.DB.currencies[c.market.currency] || {}).name))}</div>
    </div>` : "";

  return `
    ${BOF.UI.hud()}
    <div class="ct-screen">
      <div class="ct-head">
        ${BOF.ART.img(c.art, "ct-hero")}
        <div class="ct-medieval">${BOF.esc(geo.medieval || "")}</div>
        <h2>${BOF.esc(BOF.bi(c.name))}</h2>
        <div class="dim small">${BOF.esc(geo.modern || "")} · ${BOF.esc(c.tier)} · ${BOF.esc(c.band)}</div>
        <p class="ct-brief">${BOF.esc(BOF.bi(c.brief))}</p>
      </div>

      ${teachHTML}

      <div class="ct-sec">
        <div class="ct-sec-h">${zh ? "探索点" : "Places"}</div>
        <div class="ct-sites">${sites}</div>
      </div>

      ${market}

      <div class="ct-sec">
        <div class="ct-sec-h">${zh ? "出城" : "Roads out"}</div>
        <div class="ct-deps">${depHTML}</div>
        <button class="btn ghost block" onclick="BOF.UI.go('map')">${zh ? "看舆图" : "Open the map"} 🗺️</button>
      </div>
    </div>`;
};

BOF.UI.gateWhy = function (why) {
  const zh = zhq();
  return ({
    faith: zh ? "此处不对你开放" : "not open to you",
    flag: zh ? "时机未到" : "not yet",
    rep: zh ? "此地尚不信你" : "they do not trust you yet",
    language: zh ? "语言不通" : "you lack the language",
    art: zh ? "尚未习得所需之术" : "you lack the art"
  })[why] || (zh ? "暂不可去" : "closed");
};

/* ===== event ===== */
BOF.UI.SCREENS.event = function () {
  const cur = BOF.EV.cur;
  if (!cur) return BOF.UI.SCREENS.city();
  const zh = zhq();
  const ev = cur.event;

  if (cur.phase === "body") {
    const choices = BOF.EV.choicesOf(ev).map(v => `
      <button class="ev-choice ${v.blocked ? "blocked" : ""}"
              onclick="BOF.EV.pick(${v.i})">
        <span class="ev-choice-l">${BOF.esc(BOF.bi(v.ch.label))}</span>
        <span class="ev-choice-tags">
          ${v.ch.needs && v.ch.needs.coins ? `<span class="tag">💰 ${v.ch.needs.coins}</span>` : ""}
          ${v.timeCost ? `<span class="tag">📅 ${v.timeCost}</span>` : ""}
          ${v.art ? `<span class="tag art">✒️ ${BOF.esc(BOF.bi(v.art.name))}</span>` : ""}
          ${v.blocked ? `<span class="tag no">🔒 ${BOF.esc(BOF.bi(v.why))}</span>` : ""}
        </span>
      </button>`).join("");
    return `
      ${BOF.UI.hud()}
      <div class="ev-screen">
        ${BOF.ART.img(ev.art, "ev-art")}
        <h2 class="ev-title">${BOF.esc(BOF.bi(ev.title))}</h2>
        <p class="ev-body">${BOF.esc(BOF.bi(ev.body))}</p>
        <div class="ev-choices">${choices}</div>
      </div>`;
  }

  /* outcome — the half that used to be missing */
  const r = cur.roll;
  const receipts = cur.receipts.map(x => `
    <span class="ev-rc ${x.big ? "big" : ""}">${x.ic} ${BOF.esc(BOF.bi(x))}</span>`).join("");
  return `
    ${BOF.UI.hud()}
    <div class="ev-screen outcome">
      <div class="ev-picked">${zh ? "你选择了" : "You chose"}：${BOF.esc(BOF.bi(cur.choice.label))}</div>
      ${r ? `<div class="ev-roll ${r.ok ? "pass" : "fail"}">
        ${BOF.esc(BOF.bi(r.art.name))} · ${r.ok ? (zh ? "应验" : "it held") : (zh ? "不应" : "it did not")}
        <span class="dim small">(${Math.round(r.p * 100)}%)</span></div>` : ""}
      <p class="ev-body result">${BOF.esc(BOF.bi(cur.branch.text))}</p>
      ${receipts ? `<div class="ev-receipts">${receipts}</div>`
                 : `<div class="ev-receipts dim small">${zh ? "什么也没有改变。" : "Nothing changed."}</div>`}
      <button class="btn block" onclick="BOF.EV.close()">${zh ? "继续" : "Go on"} →</button>
    </div>`;
};

/* ===== travel / learn delegate to their modules ===== */
BOF.UI.SCREENS.travel = () => BOF.TRAVEL.screenHTML();
BOF.UI.SCREENS.learn = () => BOF.LEARN.screenHTML();

/* ===== saves ===== */
BOF.UI.SCREENS.saves = function () {
  const zh = zhq();
  const playing = !!(BOF.state && BOF.state.who);
  const rows = BOF.slotList().map(x => {
    if (x.empty) {
      return `<div class="sv-slot empty">
        <div class="sv-n">${x.n}</div>
        <div class="sv-body dim">${zh ? "空" : "empty"}</div>
        ${playing ? `<button class="btn sm" onclick="BOF.UI.saveSlot(${x.n})">${zh ? "存入" : "Save"}</button>` : ""}
      </div>`;
    }
    const when = new Date(x.touched).toLocaleString();
    return `<div class="sv-slot">
      <div class="sv-n">${x.n}</div>
      <div class="sv-body">
        <b>${BOF.esc(x.who)}</b>
        <div class="dim small">${BOF.esc(BOF.bi(x.city) || "—")} · ${zh ? "第" : "day"} ${x.days} ${zh ? "天" : ""}
          · 🗺️${x.cities} · ✒️${x.arts} · 💰${x.coins}</div>
        <div class="dim small">${BOF.esc(when)}</div>
      </div>
      <div class="sv-btns">
        <button class="btn sm" onclick="BOF.UI.loadSlot(${x.n})">${zh ? "读取" : "Load"}</button>
        ${playing ? `<button class="btn sm ghost" onclick="BOF.UI.saveSlot(${x.n})">${zh ? "覆盖" : "Overwrite"}</button>` : ""}
        <button class="btn sm ghost" onclick="BOF.UI.clearSlot(${x.n})">${zh ? "删除" : "Delete"}</button>
      </div>
    </div>`;
  }).join("");

  return `
    <div class="sv-screen">
      <button class="back" onclick="BOF.UI.go('${playing ? "city" : "title"}')">${zh ? "← 返回" : "← Back"}</button>
      <h2>${zh ? "存档" : "Saved games"}</h2>
      <p class="dim small">${zh
        ? "行程自动保存。手动槽位供你留住某一刻，或者试另一条路。"
        : "Your journey autosaves. The slots are for keeping a moment, or trying another road."}</p>
      <div class="sv-slots">${rows}</div>
    </div>`;
};

BOF.UI.saveSlot = function (n) {
  BOF.UI.toast(BOF.saveToSlot(n)
    ? (zhq() ? "已存入槽位 " + n : "Saved to slot " + n)
    : (zhq() ? "存档失败" : "Save failed"));
  BOF.UI.render();
};
BOF.UI.loadSlot = function (n) {
  if (!BOF.loadFromSlot(n)) { BOF.UI.toast(zhq() ? "读取失败" : "Load failed"); return; }
  BOF.UI.toast(zhq() ? "已读取" : "Loaded");
  BOF.UI.go("city");
};
BOF.UI.clearSlot = function (n) {
  if (!confirm(zhq() ? "删除槽位 " + n + "？" : "Delete slot " + n + "?")) return;
  BOF.clearSlot(n);
  BOF.UI.render();
};

/* ===== book: the journal, codex, bag, and the way to stop writing ===== */
BOF.UI._bookTab = "log";
BOF.UI.SCREENS.book = function () {
  const s = BOF.state;
  const zh = zhq();
  const tab = BOF.UI._bookTab;
  const tabs = [["log", zh ? "行纪" : "Journal"], ["bag", zh ? "行囊" : "Pack"],
                ["arts", zh ? "所学" : "Arts"], ["codex", zh ? "图鉴" : "Codex"]]
    .map(([k, n]) => `<button class="bk-tab ${tab === k ? "on" : ""}"
      onclick="BOF.UI._bookTab='${k}';BOF.UI.render()">${n}</button>`).join("");

  let body = "";
  if (tab === "log") {
    body = s.log.length ? s.log.slice().reverse().map(l => {
      const c = BOF.DB.city(l.city);
      return `<div class="bk-log">
        <span class="bk-log-d">${zh ? "第" : "d"}${l.day}</span>
        <span class="bk-log-ic">${l.ic}</span>
        <span class="bk-log-t"><b class="dim">${BOF.esc(BOF.bi(c && c.name))}</b> ${BOF.esc(l.text)}</span>
      </div>`;
    }).join("") : `<p class="dim">${zh ? "还没有写下什么。" : "Nothing written yet."}</p>`;
  } else if (tab === "bag") {
    const items = s.bag.map(b => {
      if (b.kind === "goods") {
        const g = BOF.DB.good(b.id);
        return `<div class="bk-item">${BOF.ART.img(g && g.art, "bk-item-art")}
          <b>${BOF.esc(BOF.bi(g && g.name))}</b> <span class="dim">×${b.n}</span></div>`;
      }
      return `<div class="bk-item"><b>${BOF.esc(BOF.FX.itemName(b.id))}</b></div>`;
    }).join("");
    body = `<div class="bk-purse">💰 <b>${s.coins}</b>
      ${BOF.esc(BOF.bi((BOF.DB.currencies[s.currency] || {}).name))}</div>
      <div class="bk-items">${items || `<p class="dim">${zh ? "空的。" : "Empty."}</p>`}</div>
      <div class="bk-langs">${zh ? "语言" : "Languages"}: ${s.languages.map(BOF.esc).join(" · ") || "—"}</div>`;
  } else if (tab === "arts") {
    body = Object.values(BOF.DB.divinations).map(a => {
      const got = s.learned.includes(a.id);
      const offered = s.offered.includes(a.id);
      const where = BOF.DB.learnPlaces(a.id).map(c => BOF.bi(c.name)).join(" / ");
      return `<div class="bk-art ${got ? "got" : ""}">
        <b>${got ? BOF.esc(BOF.bi(a.name)) : "· · ·"}</b>
        <span class="dim small">${got
          ? (a.effects || []).map(e => e.stat + " " + (e.delta > 0 ? "+" : "") + e.delta).join(" · ")
          : offered ? (zh ? "有人愿意教 · " : "someone will teach you · ") + where
                    : (zh ? "可在 " + where + " 求师" : "a teacher at " + where)}</span>
      </div>`;
    }).join("");
  } else {
    body = s.codex.length
      ? `<div class="bk-codex">${s.codex.map(x => `<span class="pill">${BOF.esc(x)}</span>`).join("")}</div>`
      : `<p class="dim">${zh ? "图鉴还空着。" : "The codex is empty."}</p>`;
  }

  return `
    ${BOF.UI.hud()}
    <div class="bk-screen">
      <div class="bk-tabs">${tabs}</div>
      <div class="bk-body">${body}</div>
      <button class="btn ghost block bk-stop" onclick="BOF.END.offer()">
        ${zh ? "停下书写…" : "Put down the pen…"}
      </button>
    </div>`;
};

/* ===== boot ===== */
BOF.UI.boot = async function () {
  const root = BOF.UI.root();
  if (root) root.innerHTML = `<div class="boot">${zhq() ? "正在展开地图…" : "Unrolling the map…"}</div>`;
  try {
    await Promise.all([BOF.DB.load(), BOF.ART.loadAliases()]);
  } catch (e) {
    console.error(e);
    if (root) root.innerHTML = `<div class="boot err">${BOF.esc(e.message)}</div>`;
    return;
  }
  BOF.load();
  BOF.UI.go("title");
};
