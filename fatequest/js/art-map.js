/* M4 art stems — city/explore aliases + placeholders.
   Missing files fall through FQ.art → emoji; replace webp at same stem later. */
window.FQ = window.FQ || {};

/** Table city id → entry art stem (no .webp) */
FQ.CITY_ENTRY = {
  venice: "city-venice-entry",
  acre: "city-acre-entry",
  tabriz: "city-tauris-entry",
  baghdad: "city-baldacum-entry",
  hormuz: "city-hormos-entry",
  balkh: "city-balc-entry",
  samarkand: "city-samarcanda-entry",
  kashgar: "city-cascar-entry",
  khotan: "city-cotan-entry",
  lop: "city-lop-entry",
  khanbaliq: "city-cambaluc-entry",
  quanzhou: "city-zayton-entry",
  shangdu: "scene-shangdu-palace",
  hangzhou: "scene-hangzhou-lake"
};

/** When dedicated entry missing, show this band/load under the slot (placeholder). */
FQ.CITY_ENTRY_BAND = {
  tangier: "scene-band-west-mosque",
  cairo: "scene-band-west-riverport",
  damascus: "scene-band-west-bazaar",
  mecca: "load-mosque",
  delhi: "scene-band-india-bazaar",
  calicut: "scene-band-india-port",
  shangdu: "scene-band-china-yamen",
  hangzhou: "scene-band-china-canal"
};

/** Table city id → explore filename city token */
FQ.EXPLORE_CITY = {
  venice: "venice",
  acre: "acre",
  tabriz: "tauris",
  baghdad: "baldacum",
  hormuz: "hormos",
  balkh: "balc",
  samarkand: "samarcanda",
  kashgar: "cascar",
  khotan: "cotan",
  lop: "lop",
  khanbaliq: "cambaluc",
  quanzhou: "zayton"
};

FQ.FATE_RANK_STEM = {
  "上上": "fate-rank-shangshang", Supreme: "fate-rank-shangshang",
  "上": "fate-rank-shangzhong", High: "fate-rank-shangzhong",
  "中上": "fate-rank-zhongshang", "Upper Mid": "fate-rank-zhongshang",
  "中": "fate-rank-zhongzhong", Mid: "fate-rank-zhongzhong",
  "中下": "fate-rank-zhongxia", "Lower Mid": "fate-rank-zhongxia",
  "下": "fate-rank-xiazhong", Low: "fate-rank-xiazhong",
  "下下": "fate-rank-xiaxia", Lowest: "fate-rank-xiaxia"
};

FQ.cityEntryStem = function (cityId) {
  return FQ.CITY_ENTRY[cityId] || ("city-" + cityId + "-entry");
};

FQ.cityEntryArt = function (cityId, cls) {
  const stem = FQ.cityEntryStem(cityId);
  const band = FQ.CITY_ENTRY_BAND[cityId];
  const img = FQ.art(stem, "🏛", cls || "full");
  if (!band) return `<div class="city-hero">${img}</div>`;
  return `<div class="city-hero city-hero-band" style="background-image:url('assets/art/${band}.webp')">${img}</div>`;
};

FQ.exploreKind = function (eventId) {
  const id = String(eventId || "");
  if (/market|bazaar/.test(id)) return "market";
  if (/faith|temple|shrine|mosque/.test(id)) return "temple";
  return "inn";
};

FQ.exploreStem = function (cityId, eventId) {
  const token = FQ.EXPLORE_CITY[cityId];
  if (!token) return null;
  return "explore-" + FQ.exploreKind(eventId) + "-" + token;
};

FQ.exploreArt = function (cityId, eventId, fallback, cls) {
  const kind = FQ.exploreKind(eventId);
  const fb = fallback || (kind === "market" ? "🧺" : kind === "temple" ? "🕌" : "🏕");
  const stem = FQ.exploreStem(cityId, eventId);
  if (!stem) return `<span class="art ${cls || ""}">${fb}</span>`;
  return FQ.art(stem, fb, cls || "inline");
};

FQ.cultureArt = function (culture, cls) {
  const map = {
    latin: "culture-latin", islamic: "culture-islamic",
    eastasia: "culture-eastasia", chinese: "culture-eastasia",
    indianocean: "culture-indianocean", steppe: "culture-steppe"
  };
  return FQ.art(map[culture] || ("culture-" + culture), "🌍", cls);
};

FQ.faithArt = function (faith, cls) {
  return FQ.art("faith-" + faith, "✦", cls);
};

FQ.fateBarArt = function (stat, cls) {
  const stem = ({
    travel: "fate-bar-travel",
    rapport: "fate-bar-rapport",
    wealth: "fate-bar-wealth",
    wealth_luck: "fate-bar-wealth"
  })[stat] || ("fate-bar-" + stat);
  return FQ.art(stem, "▮", cls);
};

FQ.fateRankArt = function (rankLabel, cls) {
  const stem = FQ.FATE_RANK_STEM[rankLabel] || "fate-rank-zhongzhong";
  return FQ.art(stem, rankLabel, cls || "inline");
};

FQ.mentorArt = function (retainerId, divId, fallback, cls) {
  const div = divId && FQ.DB && FQ.DB.divination && FQ.DB.divination[divId];
  const method = div && (div.engine || div.id);
  const face = (FQ.MENTOR_FACE && method && FQ.MENTOR_FACE[method])
    || (method ? "mentor-" + method : null)
    || "mentor-iching";
  return FQ.art(face, fallback || "🧙", cls || "big");
};
