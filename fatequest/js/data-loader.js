/* v3 data loader — fetch SYSTEM_TABLES into FQ.DB */
window.FQ = window.FQ || {};

FQ.DB = null;
FQ.DB_READY = null;

FQ.TABLE_FILES = [
  "cities", "routes", "transports", "events", "goods",
  "divinations", "retainers", "archetypes", "endings", "codex"
];

FQ.indexById = function (arr) {
  const m = Object.create(null);
  (arr || []).forEach(row => { if (row && row.id) m[row.id] = row; });
  return m;
};

FQ.loadTables = async function () {
  if (FQ.DB) return FQ.DB;
  if (FQ.DB_READY) return FQ.DB_READY;
  FQ.DB_READY = (async () => {
    const base = "assets/data/";
    const pack = {};
    await Promise.all(FQ.TABLE_FILES.map(async name => {
      const res = await fetch(base + name + ".json");
      if (!res.ok) throw new Error("Failed to load " + name + ".json");
      pack[name] = await res.json();
    }));
    FQ.DB = {
      cities: pack.cities,
      routes: pack.routes,
      transports: pack.transports,
      events: pack.events,
      goods: pack.goods,
      divinations: pack.divinations,
      retainers: pack.retainers,
      archetypes: pack.archetypes,
      endings: pack.endings,
      codex: pack.codex,
      city: FQ.indexById(pack.cities),
      route: FQ.indexById(pack.routes),
      transport: FQ.indexById(pack.transports),
      event: FQ.indexById(pack.events),
      good: FQ.indexById(pack.goods),
      divination: FQ.indexById(pack.divinations),
      retainer: FQ.indexById(pack.retainers),
      archetype: FQ.indexById(pack.archetypes),
      ending: FQ.indexById(pack.endings),
      codexEntry: FQ.indexById(pack.codex)
    };
    return FQ.DB;
  })().catch(err => {
    FQ.DB_READY = null;
    throw err;
  });
  return FQ.DB_READY;
};

FQ.T = function (obj) {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  return FQ.lang === "en" ? (obj.en || obj.zh || "") : (obj.zh || obj.en || "");
};

/* mentors / v2 helpers use FQ.bi(obj, zhKey, enKey) */
if (!FQ.bi) {
  FQ.bi = function (obj, zhKey, enKey) {
    if (!obj) return "";
    return FQ.lang === "en" ? (obj[enKey] || obj[zhKey] || "") : (obj[zhKey] || obj[enKey] || "");
  };
}
