#!/usr/bin/env node
/* Build runtime Marco Polo lore catalog from assets/books/marco-polo-lore.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "assets/books/marco-polo-lore.json");
const OUT = path.join(ROOT, "js/data-marco-lore.js");

/** nodeId → lore placeId (existing + planned extra stations) */
const NODE_PLACE = {
  venice: null, // prologue stories
  ayas: "lesser-hermenia",
  turkomania: "turcomania",
  acre: null,
  mosul: "mausul",
  baghdad: "baudas",
  tabriz: "tauris",
  alamut: "old-man-of-the-mountain",
  yezd: "great-city-of-yasdi",
  cobinan: "cobinan",
  hormuz: "descent-to-the-city-of-hormos",
  kerman: "kingdom-of-kerman",
  sapurgan: "sapurgan",
  balkh: "balc",
  samarkand: "samarcan",
  badakhshan: "badashan",
  herat: null,
  pamir: "great-river-of-badashan",
  kashgar: "cascar",
  yarkand: "yarcan",
  khotan: "a-province-called-cotan",
  lop: "lop",
  camul: "camul",
  tangut: "great-province-of-tangut",
  campichu: "campichu",
  suhchau: "sukchur",
  gobi: "a-certain-desert",
  karakorum: "caracoron",
  shangdu: "chandu",
  khanbaliq: "cambaluc",
  yangzhou: "cities-of-tiju",
  hangzhou: "great-city-of-kinsay",
  quanzhou: "great-haven-of-zayton",
  voyage: "merchant-ships-of-manzi",
  /* extras (方案 A) */
  georgia: "georgiania",
  greater_armenia: "greater-hermenia",
  camadi: "camadi",
  taican: "taican",
  kashmir: "keshimur",
  pein: "pein",
  charchan: "charchan",
  etzina: "etzina",
  tenduc: "tenduc",
  erguiul: "erguiul",
  sindafu: "city-of-sindafu",
  carajan: "carajan",
  mien: "mien",
  bangala: "bangala",
  saianfu: "very-noble-city-of-saianfu",
  suju: "suju",
  fuzhou: "greatness-of-the-city-of-fuju",
  java: "java",
  seilan: "seilan",
  maabar: "great-province-of-maabar",
  chipangu: "chipangu",
  aden: "aden"
};

/** Short bilingual labels for places (game-facing) */
const PLACE_LABEL = {
  "lesser-hermenia": { zh: "小亚美尼亚", en: "Lesser Hermenia" },
  turcomania: { zh: "突厥蛮尼亚", en: "Turcomania" },
  "greater-hermenia": { zh: "大亚美尼亚", en: "Greater Hermenia" },
  georgiania: { zh: "谷儿只（格鲁吉亚）", en: "Georgiania" },
  mausul: { zh: "摩苏尔", en: "Mausul" },
  baudas: { zh: "报达", en: "Baudas" },
  tauris: { zh: "大不里士", en: "Tauris" },
  "great-city-of-yasdi": { zh: "亚斯迪", en: "Yasdi" },
  "kingdom-of-kerman": { zh: "克尔曼", en: "Kerman" },
  camadi: { zh: "卡马迪废墟", en: "Camadi" },
  "descent-to-the-city-of-hormos": { zh: "忽鲁谟斯", en: "Hormos" },
  cobinan: { zh: "科比南", en: "Cobinan" },
  "a-certain-desert": { zh: "苦漠", en: "A Certain Desert" },
  "old-man-of-the-mountain": { zh: "山中老人", en: "Old Man of the Mountain" },
  sapurgan: { zh: "撒普尔干", en: "Sapurgan" },
  balc: { zh: "巴里黑", en: "Balc" },
  taican: { zh: "塔伊坎", en: "Taican" },
  badashan: { zh: "巴达哈伤", en: "Badashan" },
  keshimur: { zh: "客失迷儿", en: "Keshimur" },
  "great-river-of-badashan": { zh: "巴达哈伤大河", en: "Great River of Badashan" },
  cascar: { zh: "可失合儿", en: "Cascar" },
  samarcan: { zh: "撒马尔罕", en: "Samarcan" },
  yarcan: { zh: "鸦儿看", en: "Yarcan" },
  "a-province-called-cotan": { zh: "忽炭", en: "Cotan" },
  pein: { zh: "培因", en: "Pein" },
  charchan: { zh: "车尔成", en: "Charchan" },
  lop: { zh: "罗布", en: "Lop" },
  "great-province-of-tangut": { zh: "唐古忒", en: "Tangut" },
  camul: { zh: "哈密", en: "Camul" },
  campichu: { zh: "甘州", en: "Campichu" },
  sukchur: { zh: "肃州", en: "Sukchur" },
  etzina: { zh: "亦集乃", en: "Etzina" },
  caracoron: { zh: "哈剌和林", en: "Caracoron" },
  chandu: { zh: "上都", en: "Chandu" },
  cambaluc: { zh: "汗八里", en: "Cambaluc" },
  "cambaluc-2": { zh: "汗八里（续）", en: "Cambaluc (cont.)" },
  tenduc: { zh: "天德", en: "Tenduc" },
  erguiul: { zh: "额里合牙", en: "Erguiul" },
  "city-of-sindafu": { zh: "成都（信都府）", en: "Sindafu" },
  carajan: { zh: "哈剌章", en: "Carajan" },
  mien: { zh: "缅国", en: "Mien" },
  bangala: { zh: "班加剌", en: "Bangala" },
  "very-noble-city-of-saianfu": { zh: "襄阳府", en: "Saianfu" },
  suju: { zh: "苏州", en: "Suju" },
  "great-city-of-kinsay": { zh: "行在（杭州）", en: "Kinsay" },
  "greatness-of-the-city-of-fuju": { zh: "福州", en: "Fuju" },
  "great-haven-of-zayton": { zh: "刺桐（泉州）", en: "Zayton" },
  "merchant-ships-of-manzi": { zh: "蛮子海舶", en: "Ships of Manzi" },
  java: { zh: "爪哇", en: "Java" },
  chipangu: { zh: "日本国", en: "Chipangu" },
  "great-country-called-chamba": { zh: "占城", en: "Chamba" },
  seilan: { zh: "僧伽剌（锡兰）", en: "Seilan" },
  "great-province-of-maabar": { zh: "马八儿", en: "Maabar" },
  aden: { zh: "阿丹", en: "Aden" },
  "cities-of-tiju": { zh: "运河诸城", en: "Cities of Tiju" }
};

function firstSentences(text, maxChars) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxChars) return clean;
  const slice = clean.slice(0, maxChars);
  const m = slice.match(/^[\s\S]*?[.!?。](?=\s|$)/);
  if (m && m[0].length > maxChars * 0.45) return m[0].trim();
  const sp = slice.lastIndexOf(" ");
  return (sp > 40 ? slice.slice(0, sp) : slice).trim();
}

function zhBlurb(placeId, bodyEn) {
  const lab = PLACE_LABEL[placeId] || { zh: placeId };
  const hint = firstSentences(bodyEn, 160);
  return `据《马可·波罗游记》所记「${lab.zh}」：此地风土见闻如下（英文正文见游记全章）。要点——${hint.length > 80 ? "商旅、物产与风俗交织于此。" : "行路者宜细察其俗。"}`;
}

const lore = JSON.parse(fs.readFileSync(SRC, "utf8"));
const placeById = Object.fromEntries(lore.places.map(p => [p.id, p]));
const needed = new Set(Object.values(NODE_PLACE).filter(Boolean));
/* also keep a few companion places for story pooling */
for (const p of lore.places) {
  if (["monastery-of-st-barsamo-on-the-borders-of-tauris", "persia", "eight-kingdoms-of-persia",
    "customs-of-the-tartars", "palace-of-the-great-kaan", "cambaluc-2", "kingdom-of-fuju",
    "great-country-called-chamba"].includes(p.id)) needed.add(p.id);
}

const PLACES = {};
for (const id of needed) {
  const p = placeById[id];
  if (!p) { console.warn("missing place", id); continue; }
  const lab = PLACE_LABEL[id] || { zh: p.placeNames?.[0] || id, en: p.placeNames?.[0] || id };
  PLACES[id] = {
    id,
    title: p.title,
    band: p.band,
    placeNames: p.placeNames || [],
    zh: lab.zh,
    en: lab.en,
    bodyEn: p.body,
    bodyZh: zhBlurb(id, p.body),
    excerptEn: firstSentences(p.body, 720),
    source: p.source || null,
    origin: "source"
  };
}

const STORIES = {};
for (const s of lore.stories) {
  STORIES[s.id] = {
    id: s.id,
    title: s.title,
    band: s.band,
    bodyEn: s.body,
    bodyZh: `游记故事：「${s.title}」。原文见英文全章。`,
    excerptEn: firstSentences(s.body, 720),
    source: s.source || null,
    origin: "source"
  };
}

const payload = {
  meta: {
    book: "marco-polo",
    source: "assets/books/marco-polo-lore.json",
    placeCount: Object.keys(PLACES).length,
    storyCount: Object.keys(STORIES).length,
    note: "English bodies are full Yule text; Chinese blurbs are short hybrid leads pending full translation."
  },
  nodePlace: NODE_PLACE,
  places: PLACES,
  stories: STORIES
};

const js = `/* Auto-generated from marco-polo-lore.json — regenerate via scripts/build-lore-runtime.mjs */
window.FQ = window.FQ || {};
FQ.MARCO_LORE = ${JSON.stringify(payload)};
FQ.lorePlaceId = function (nodeId) {
  const m = FQ.MARCO_LORE && FQ.MARCO_LORE.nodePlace;
  return m && m[nodeId] ? m[nodeId] : null;
};
FQ.lorePlace = function (placeIdOrNodeId) {
  const L = FQ.MARCO_LORE;
  if (!L) return null;
  if (L.places[placeIdOrNodeId]) return L.places[placeIdOrNodeId];
  const pid = FQ.lorePlaceId(placeIdOrNodeId);
  return pid ? L.places[pid] : null;
};
FQ.loreStory = function (storyId) {
  return FQ.MARCO_LORE && FQ.MARCO_LORE.stories[storyId] || null;
};
FQ.loreStoriesForBand = function (band) {
  const L = FQ.MARCO_LORE;
  if (!L) return [];
  return Object.values(L.stories).filter(s => !band || s.band === band);
};
`;

fs.writeFileSync(OUT, js);
console.log("wrote", OUT);
console.log("places", Object.keys(PLACES).length, "stories", Object.keys(STORIES).length, "mapped nodes", Object.keys(NODE_PLACE).length);
