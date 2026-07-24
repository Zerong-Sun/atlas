/* 《远行之书》· db — the table loader and index.
   Every table in assets/data/ is loaded once, indexed by id, and validated.
   The validator is not decoration: the story used to break because a choice
   could resolve to nothing, so a choice without an outcome is a load error,
   not a silent no-op. */
window.BOF = window.BOF || {};

BOF.DB = {
  ready: false,
  cities: {}, routes: {}, transports: {}, events: {},
  divinations: {}, teachers: {}, goods: {}, currencies: {},
  archetypes: {}, endings: {}, worldmap: null,
  meta: {},
  problems: []
};

BOF.DB.byId = function (rows, key) {
  const out = {};
  (rows || []).forEach(r => { out[r[key || "id"]] = r; });
  return out;
};

BOF.DB.load = async function () {
  if (BOF.DB.ready) return BOF.DB;
  /* `no-cache` so an edited table shows up on reload instead of being served
     from the disk cache — the tables are the content, and they change often */
  const get = async f => {
    const res = await fetch("assets/data/" + f, { cache: "no-cache" });
    if (!res.ok) throw new Error("cannot load " + f + " (" + res.status + ")");
    return res.json();
  };
  const [wm, cities, routes, transports, evW, evE, div, goods, arch, endings] =
    await Promise.all([
      get("worldmap.json"), get("cities.json"), get("routes.json"),
      get("transports.json"), get("events-west.json"), get("events-east.json"),
      get("divinations.json"), get("goods.json"), get("archetypes.json"),
      get("endings.json")
    ]);

  BOF.DB.worldmap = wm;
  BOF.DB.cities = BOF.DB.byId(cities.cities);
  BOF.DB.routes = BOF.DB.byId(routes.routes);
  BOF.DB.transports = BOF.DB.byId(transports.transports);
  BOF.DB.events = BOF.DB.byId(evW.events.concat(evE.events));
  BOF.DB.divinations = BOF.DB.byId(div.divinations);
  BOF.DB.teachers = BOF.DB.byId(div.teachers);
  BOF.DB.goods = BOF.DB.byId(goods.goods);
  BOF.DB.currencies = BOF.DB.byId(goods.currencies);
  BOF.DB.archetypes = BOF.DB.byId(arch.archetypes);
  BOF.DB.endings = BOF.DB.byId(endings.endings);
  BOF.DB.meta = {
    birthWindow: arch.birthWindow, fateBars: arch.fateBars,
    grades: arch.grades, gradeNote: arch.gradeNote
  };

  /* map lookup: worldmap city id → the row the map draws */
  BOF.DB.mapCities = BOF.DB.byId(wm.cities);
  /* and back: worldmap id → playable city id, so a map click finds the city */
  BOF.DB.cityByMap = {};
  Object.values(BOF.DB.cities).forEach(c => { BOF.DB.cityByMap[c.map] = c.id; });

  BOF.DB.validate();
  BOF.DB.ready = true;
  return BOF.DB;
};

/* ---------- validation ---------- */
BOF.DB.validate = function () {
  const P = BOF.DB.problems = [];
  const bad = (where, msg) => P.push(where + ": " + msg);
  const D = BOF.DB;

  Object.values(D.cities).forEach(c => {
    if (!D.mapCities[c.map]) bad(c.id, "map id '" + c.map + "' not in worldmap.json");
    if (!D.events[c.entry]) bad(c.id, "entry event '" + c.entry + "' missing");
    (c.sites || []).forEach(s => {
      if (!D.events[s]) bad(c.id, "site event '" + s + "' missing");
    });
    if (c.teaches && !D.divinations[c.teaches]) bad(c.id, "teaches unknown art '" + c.teaches + "'");
    if (c.mentor && !D.teachers[c.mentor]) bad(c.id, "mentor '" + c.mentor + "' missing");
    (c.market ? c.market.goods : []).forEach(g => {
      if (!D.goods[g]) bad(c.id, "market good '" + g + "' missing");
    });
    if (c.specialty && !D.goods[c.specialty]) bad(c.id, "specialty '" + c.specialty + "' missing");
  });

  Object.values(D.routes).forEach(r => {
    if (!D.cities[r.from]) bad(r.id, "from '" + r.from + "' is not a city");
    if (!D.cities[r.to]) bad(r.id, "to '" + r.to + "' is not a city");
    (r.modes || []).forEach(m => {
      if (!D.transports[m]) bad(r.id, "mode '" + m + "' missing");
    });
  });

  Object.values(D.events).forEach(e => {
    if (e.city && !D.cities[e.city]) bad(e.id, "city '" + e.city + "' missing");
    if (!e.choices || !e.choices.length) bad(e.id, "has no choices");
    (e.choices || []).forEach((ch, i) => {
      const tag = e.id + " choice#" + (ch.id || i);
      /* the rule that keeps the story from dropping */
      const plain = ch.then && ch.then.text;
      const forked = ch.pass && ch.fail && ch.pass.text && ch.fail.text;
      if (!plain && !forked) bad(tag, "resolves to nothing — needs `then`, or `pass` + `fail`");
      if (ch.divination && !D.divinations[ch.divination]) bad(tag, "unknown art '" + ch.divination + "'");
      [ch.then, ch.pass, ch.fail].forEach(br => {
        (br && br.effects || []).forEach(op => BOF.DB.checkOp(tag, op, bad));
      });
    });
  });

  Object.values(D.divinations).forEach(d => {
    if (!d.effects || !d.effects.length) bad(d.id, "has no effects — an art that changes nothing is decoration");
    if (!d.minigame) bad(d.id, "has no minigame — learning must cost something");
    (d.learnAt || []).forEach(c => {
      if (!D.cities[c]) bad(d.id, "learnAt city '" + c + "' missing");
    });
  });

  Object.values(D.archetypes).forEach(a => {
    if (!D.cities[a.start]) bad(a.id, "start city '" + a.start + "' missing");
    (a.knownCities || []).forEach(c => {
      if (!D.cities[c]) bad(a.id, "knownCity '" + c + "' missing");
    });
    (a.knownRoutes || []).forEach(r => {
      if (!D.routes[r]) bad(a.id, "knownRoute '" + r + "' missing");
    });
    (a.endings || []).forEach(e => {
      if (!D.endings[e]) bad(a.id, "ending '" + e + "' missing");
    });
  });

  if (P.length) {
    console.warn("[BOF.DB] " + P.length + " data problem(s):");
    P.forEach(p => console.warn("  · " + p));
  }
  return P;
};

/* an effect op must name something that exists, or it silently does nothing */
BOF.DB.checkOp = function (tag, op, bad) {
  const D = BOF.DB;
  switch (op.op) {
    case "revealCity": if (!D.cities[op.id]) bad(tag, "revealCity unknown '" + op.id + "'"); break;
    case "revealRoute": if (!D.routes[op.id]) bad(tag, "revealRoute unknown '" + op.id + "'"); break;
    case "goods": if (!D.goods[op.id]) bad(tag, "goods unknown '" + op.id + "'"); break;
    case "offerLearn": if (!D.divinations[op.id]) bad(tag, "offerLearn unknown '" + op.id + "'"); break;
    case "coins": case "days": case "fate": case "rep": case "flag":
    case "item": case "codex": case "sticker": case "language": case "goto":
      break;
    default: bad(tag, "unknown effect op '" + op.op + "'");
  }
};

/* ---------- lookups the rest of the game uses ---------- */
BOF.DB.city = id => BOF.DB.cities[id];
BOF.DB.route = id => BOF.DB.routes[id];
BOF.DB.event = id => BOF.DB.events[id];
BOF.DB.art = id => BOF.DB.divinations[id];
BOF.DB.good = id => BOF.DB.goods[id];

/* every route touching a city, in either direction */
BOF.DB.routesAt = function (cityId) {
  return Object.values(BOF.DB.routes)
    .filter(r => r.from === cityId || r.to === cityId);
};
/* the far end of a route seen from `cityId` */
BOF.DB.otherEnd = (route, cityId) => route.from === cityId ? route.to : route.from;

/* where an art can be learned, as city rows */
BOF.DB.learnPlaces = function (artId) {
  const a = BOF.DB.art(artId);
  return (a && a.learnAt || []).map(BOF.DB.city).filter(Boolean);
};
