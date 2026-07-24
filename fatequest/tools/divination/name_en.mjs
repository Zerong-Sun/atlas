#!/usr/bin/env node
/**
 * Adds English names to the tarot and hexagram tables.
 *
 * Both tables carried a Chinese `name` and nothing else, and
 * `build_p3_content.mjs` wrote that Chinese straight into `en.json` — so an
 * English player was shown 愚者, and worse, sentences like
 * "愚者 upright: energy flows", which is not text in any language.
 *
 * Two decisions worth stating:
 *
 *   Tarot is generated, not transcribed. The deck is perfectly regular — 22
 *   trumps and four suits of Ace..Ten, Page, Knight, Queen, King — so writing
 *   out 78 strings by hand only creates 78 chances to typo one. The 22 trumps
 *   are the one irregular part and are listed.
 *
 *   Hexagrams get pinyin plus a plain gloss written here, NOT the familiar
 *   English titles. "The Creative", "The Receptive" and the rest are Wilhelm's
 *   renderings, and his translation is still in copyright. Pinyin is the name
 *   itself and belongs to nobody.
 *
 *   node tools/divination/name_en.mjs [--write]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const WRITE = process.argv.includes("--write");

// -------------------------------------------------------------- tarot

const TRUMPS = ["The Fool", "The Magician", "The High Priestess", "The Empress",
  "The Emperor", "The Hierophant", "The Lovers", "The Chariot", "Strength",
  "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man", "Death",
  "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun",
  "Judgement", "The World"];

const RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Page", "Knight", "Queen", "King"];

const SUITS = { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" };

function tarotEn(id) {
  const [suit, n] = [id.replace(/-\d+$/, ""), Number(id.match(/(\d+)$/)?.[1])];
  if (suit === "major") return TRUMPS[n];
  const s = SUITS[suit];
  return s && RANKS[n] ? `${RANKS[n]} of ${s}` : null;
}

// ---------------------------------------------------------- hexagrams

/**
 * King Wen order, pinyin with tone marks, plus a one-word gloss.
 *
 * The gloss is deliberately plain — "Force", "Field", "Waiting" — rather than
 * evocative. A hexagram name is a handle for a reading, and an English player
 * who sees "Qián · Force" can hold onto it; one who sees a small poem has been
 * given an interpretation before the divination has said anything.
 */
const HEX = [
  ["Qián", "Force"], ["Kūn", "Field"], ["Zhūn", "Sprouting"], ["Méng", "Enfolding"],
  ["Xū", "Waiting"], ["Sòng", "Dispute"], ["Shī", "The Host"], ["Bǐ", "Grouping"],
  ["Xiǎo Xù", "Small Restraint"], ["Lǚ", "Treading"], ["Tài", "Peace"], ["Pǐ", "Obstruction"],
  ["Tóng Rén", "Fellowship"], ["Dà Yǒu", "Great Holding"], ["Qiān", "Modesty"], ["Yù", "Readiness"],
  ["Suí", "Following"], ["Gǔ", "Repair"], ["Lín", "Approach"], ["Guān", "Viewing"],
  ["Shì Kè", "Biting Through"], ["Bì", "Adornment"], ["Bō", "Stripping"], ["Fù", "Returning"],
  ["Wú Wàng", "Without Falsehood"], ["Dà Xù", "Great Restraint"], ["Yí", "Nourishing"],
  ["Dà Guò", "Great Excess"], ["Kǎn", "The Abyss"], ["Lí", "Radiance"],
  ["Xián", "Influence"], ["Héng", "Constancy"], ["Dùn", "Retreat"], ["Dà Zhuàng", "Great Vigour"],
  ["Jìn", "Advance"], ["Míng Yí", "Darkening Light"], ["Jiā Rén", "The Household"], ["Kuí", "Divergence"],
  ["Jiǎn", "Obstruction"], ["Xiè", "Release"], ["Sǔn", "Decrease"], ["Yì", "Increase"],
  ["Guài", "Resolution"], ["Gòu", "Encounter"], ["Cuì", "Gathering"], ["Shēng", "Ascending"],
  ["Kùn", "Confinement"], ["Jǐng", "The Well"], ["Gé", "Revolution"], ["Dǐng", "The Cauldron"],
  ["Zhèn", "Thunder"], ["Gèn", "Stillness"], ["Jiàn", "Gradual Progress"], ["Guī Mèi", "The Marrying Maiden"],
  ["Fēng", "Abundance"], ["Lǚ", "The Traveller"], ["Xùn", "The Gentle"], ["Duì", "The Joyous"],
  ["Huàn", "Dispersion"], ["Jié", "Limitation"], ["Zhōng Fú", "Inner Truth"], ["Xiǎo Guò", "Small Excess"],
  ["Jì Jì", "Already Across"], ["Wèi Jì", "Not Yet Across"],
];

// ------------------------------------------------------------------ run

const files = [
  { path: join(ROOT, "content/tables/divination/tarot_cards.json"), kind: "tarot" },
  { path: join(ROOT, "content/tables/divination/hexagrams.json"), kind: "hex" },
];

let added = 0, missing = [];
for (const f of files) {
  const doc = JSON.parse(readFileSync(f.path, "utf8"));
  for (const r of doc.records) {
    const en = f.kind === "tarot"
      ? tarotEn(r.id)
      : (HEX[r.index] ? `${HEX[r.index][0]} · ${HEX[r.index][1]}` : null);
    if (!en) { missing.push(r.id); continue; }
    if (r.nameEn !== en) { r.nameEn = en; added++; }
  }
  if (WRITE) writeFileSync(f.path, JSON.stringify(doc, null, 2) + "\n");
}

console.log(`英文名 ${added} 条${WRITE ? "已写入" : "（未写入，加 --write）"}`);
if (missing.length) {
  console.error(`没有对应英文名：${missing.join(", ")}`);
  process.exit(1);
}
