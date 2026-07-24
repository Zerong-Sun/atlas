/* 《远行之书》· event — the choice→consequence loop.
   The old bug was that picking an option ended the scene. Here every pick
   runs through one path: resolve → apply effects → SHOW the outcome text and
   a receipt of what changed → offer the way onward. The scene never closes
   without telling you what your choice did. */
window.BOF = window.BOF || {};
BOF.EV = {};

BOF.EV.cur = null;   /* {event, phase:'body'|'outcome', choice, branch, receipts} */

/* is this event allowed to run right now? */
BOF.EV.gated = function (ev) {
  const s = BOF.state, w = ev.when;
  if (ev.once && s.seenEvents.includes(ev.id)) return "seen";
  if (!w) return null;
  if (w.faiths && !w.faiths.includes(s.who.faith)) return "faith";
  if (w.notFaiths && w.notFaiths.includes(s.who.faith)) return "faith";
  if (w.flags && !w.flags.every(f => s.flags[f])) return "flag";
  if (w.notFlags && w.notFlags.some(f => s.flags[f])) return "flag";
  if (w.minReputation != null && (s.rep.city[s.at] || 0) < w.minReputation) return "rep";
  if (w.language && !s.languages.includes(w.language)) return "language";
  if (w.learned && !w.learned.every(a => s.learned.includes(a))) return "art";
  return null;
};

/* the entry event that actually applies to this arrival */
BOF.EV.entryFor = function (cityId) {
  const cands = Object.values(BOF.DB.events)
    .filter(e => e.kind === "entry" && e.city === cityId);
  return cands.find(e => !BOF.EV.gated(e)) || null;
};

/* the sites of a city, with their state, for the city screen */
BOF.EV.sitesOf = function (cityId) {
  const c = BOF.DB.city(cityId);
  return (c.sites || []).map(id => {
    const ev = BOF.DB.event(id);
    const gate = ev ? BOF.EV.gated(ev) : "missing";
    return { ev, id, done: gate === "seen", locked: gate && gate !== "seen", why: gate };
  }).filter(x => x.ev);
};

/* ---------- running one event ---------- */
BOF.EV.open = function (eventId) {
  const ev = BOF.DB.event(eventId);
  if (!ev) { console.warn("[BOF.EV] no such event", eventId); return false; }
  BOF.EV.cur = { event: ev, phase: "body", choice: null, branch: null, receipts: [] };
  BOF.UI.render();
  return true;
};

/* the choices as the UI should draw them: playable, blocked-with-reason, or
   divination-flavoured */
BOF.EV.choicesOf = function (ev) {
  const s = BOF.state;
  return (ev.choices || []).map((ch, i) => {
    const unmet = BOF.FX.unmet(ch.needs);
    const art = ch.divination ? BOF.DB.art(ch.divination) : null;
    /* an art you were never taught is not an option you can pick */
    const artMissing = !!ch.divination && !s.learned.includes(ch.divination);
    return {
      i, ch, art, artMissing,
      blocked: !!unmet || artMissing,
      why: unmet || (artMissing
        ? { zh: "未习「" + BOF.bi(art && art.name) + "」", en: "You have not learned " + BOF.bi(art && art.name) }
        : null),
      timeCost: ch.needs && ch.needs.days || 0
    };
  });
};

BOF.EV.pick = function (i) {
  const cur = BOF.EV.cur;
  if (!cur || cur.phase !== "body") return;
  const ch = cur.event.choices[i];
  if (!ch) return;

  const view = BOF.EV.choicesOf(cur.event)[i];
  if (view.blocked) {
    BOF.UI.toast(BOF.bi(view.why));
    return;
  }

  /* resolve the branch */
  let branch, roll = null;
  if (ch.divination) {
    roll = BOF.FX.divCheck(ch.divination);
    branch = roll.ok ? ch.pass : ch.fail;
  } else {
    branch = ch.then;
  }
  /* db.js guarantees this exists — belt and braces so a bad hand-edit is loud */
  if (!branch || !branch.text) {
    console.error("[BOF.EV] choice resolved to nothing:", cur.event.id, ch.id);
    BOF.UI.toast(BOF.lang() === "zh" ? "此处剧本缺失，已记录。" : "Missing script here — logged.");
    return;
  }

  const receipts = BOF.FX.apply(branch.effects);
  const s = BOF.state;
  if (cur.event.once && !s.seenEvents.includes(cur.event.id)) s.seenEvents.push(cur.event.id);
  BOF.note(cur.event.kind === "entry" ? "🚪" : "◈", BOF.bi(branch.text));

  cur.phase = "outcome";
  cur.choice = ch;
  cur.branch = branch;
  cur.roll = roll;
  cur.receipts = receipts;
  BOF.save();
  BOF.UI.render();
};

/* leaving the outcome — a `goto` chains straight into the next event, which is
   how a site can start a two-part scene without ever dropping the thread */
BOF.EV.close = function () {
  const next = BOF.FX.pendingGoto;
  BOF.FX.pendingGoto = null;
  BOF.EV.cur = null;
  if (next && BOF.DB.event(next)) { BOF.EV.open(next); return; }
  BOF.UI.go("city");
};

/* ---------- arrival ---------- */
/* Standing in a city for the first time: mark it, then run its entry event.
   Everything a city does hangs off this, so arrival can never be a dead end. */
BOF.EV.arrive = function (cityId) {
  const s = BOF.state;
  s.at = cityId;
  if (!s.knownCities.includes(cityId)) s.knownCities.push(cityId);
  const first = !s.visitedCities.includes(cityId);
  if (first) s.visitedCities.push(cityId);

  const c = BOF.DB.city(cityId);
  BOF.note("🏙️", BOF.lang() === "zh" ? "抵达" + BOF.bi(c.name) : "Arrived at " + BOF.bi(c.name));

  /* arriving teaches you the roads that leave from here — you can see the gate
     even before you know where it goes */
  BOF.DB.routesAt(cityId).forEach(r => {
    if (!s.knownRoutes.includes(r.id)) return;   /* known roads stay known */
  });
  BOF.save();

  const entry = BOF.EV.entryFor(cityId);
  if (first && entry) BOF.EV.open(entry.id);
  else BOF.UI.go("city");
};

/* ---------- the city's own doings ---------- */
/* A teacher in this city whose art you have been offered but not learned. */
BOF.EV.teacherHere = function () {
  const s = BOF.state;
  const c = BOF.DB.city(s.at);
  if (!c || !c.teaches) return null;
  if (s.learned.includes(c.teaches)) return null;
  const t = BOF.DB.teachers[c.mentor];
  const art = BOF.DB.art(c.teaches);
  if (!t || !art) return null;
  return { teacher: t, art: art, offered: s.offered.includes(c.teaches) };
};

/* Everything reachable from where you stand: a known road, whose far end you
   also know. An unknown road is not shown — the map comes from asking. */
BOF.EV.departures = function () {
  const s = BOF.state;
  return BOF.DB.routesAt(s.at)
    .filter(r => s.knownRoutes.includes(r.id))
    .map(r => {
      const toId = BOF.DB.otherEnd(r, s.at);
      return { route: r, to: BOF.DB.city(toId), known: s.knownCities.includes(toId) };
    })
    .filter(d => d.to);
};
