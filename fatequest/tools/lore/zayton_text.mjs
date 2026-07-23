#!/usr/bin/env node
/**
 * Zayton vertical slice — English lead text (docs/PLAN.md §2).
 *
 * Voice follows LORE_PIPELINE.md §4: the observational register of the
 * Yule-Cordier translation — "you must know that...", second person, present
 * tense, no modern vocabulary, no interiority. Text derived from the chapter
 * carries origin:"source"; the sea-goddess temple is authored, because Polo
 * does not describe it, and it is labelled as such in the data.
 *
 * Chinese: only the short strings (titles, choice labels) are set here.
 * Long-form Chinese arrives through the review-translation pass; until then
 * I18n falls back to English rather than showing raw keys.
 *
 * Usage: node tools/lore/zayton_text.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// ---------------------------------------------------------------- English
const EN = {
  // --- entry ---------------------------------------------------------------
  "ev.zayton.entry.title": "The Haven of Zayton",
  "ev.zayton.entry.body":
    "Five days south-east of Fuju, through valleys of camphor trees and a "
    + "constant succession of towns, the road brings you down to the water, and "
    + "you see why men speak of this place as they do. The haven of Zayton is "
    + "frequented by all the ships of India, which bring hither spicery and "
    + "every kind of costly ware; and you must know that for one shiploads of "
    + "pepper that goes to Alexandria for Christendom, there come a hundred "
    + "such to this haven, aye and more too. The masts stand so thick along the "
    + "water that a man might take them for a burnt forest. At the head of the "
    + "quay the Great Kaan's clerks keep their tables, and there is no coming "
    + "ashore with goods that does not pass beneath their brushes.",
  "ev.zayton.entry.choice.customs": "Declare your goods to the Kaan's clerks",
  "ev.zayton.entry.choice.slip": "Go up by the fishermen's steps instead",
  "ev.zayton.entry.choice.ask_ships": "Ask a boatman what all these ships are",

  // --- harbour -------------------------------------------------------------
  "ev.zayton.harbour.title": "The Quay",
  "ev.zayton.harbour.body":
    "The quay runs the length of the water and is never quiet. Pepper comes "
    + "ashore in sacks the height of a man; there are pearls weighed out in "
    + "little brass scales, and lignaloes and sandalwood stacked like cordwood. "
    + "You must know that the merchant pays dearly here: the Kaan takes a tithe "
    + "of everything, ten in the hundred, and the ship's charge on top of it — "
    + "thirty in the hundred on small wares, forty on bulky goods, and four and "
    + "forty on pepper. Between the freight and the Kaan's due a man pays out "
    + "a good half of what his cargo is worth. And yet on the other half he "
    + "makes so great a profit that he is always glad to come back with more.",
  "ev.zayton.harbour.choice.pepper": "Buy a sack of pepper at the quayside price",
  "ev.zayton.harbour.choice.monsoon": "Stand the pilots a drink and ask about the winds",
  "ev.zayton.harbour.choice.watch": "Spend the day watching the ships come in",

  // --- foreign quarter -----------------------------------------------------
  "ev.zayton.fanfang.title": "The Foreign Quarter",
  "ev.zayton.fanfang.body":
    "The merchants of India and of Persia and of the Arab lands have their own "
    + "street here, and their own houses of prayer, and they have had them long "
    + "enough that their grandsons are buried in this soil. Persian and Arabic "
    + "and the local tongue are bargained in under one roof, and a man who has "
    + "none of the three will find his purse lighter than his understanding. "
    + "Nobody in the quarter finds any of this remarkable, which is itself the "
    + "most remarkable thing about it.",
  "ev.zayton.fanfang.choice.persian": "Ask the Persian traders about the sea road",
  "ev.zayton.fanfang.choice.interpreter": "Pay a lad of the quarter to interpret for a season",
  "ev.zayton.fanfang.choice.silk": "Buy a bolt of silk from a Manzi weaver",

  // --- sea-goddess temple (authored) ---------------------------------------
  "ev.zayton.mazu.title": "The Temple of the Sea",
  "ev.zayton.mazu.body":
    "Above the anchorage stands a temple to a goddess of the sea, and no "
    + "shipmaster of this coast puts out without going up to it first. They burn "
    + "paper there, and set out a dish of rice and a cup of wine, and shake a "
    + "bamboo cylinder of numbered slips until one falls; the slip is carried to "
    + "an old woman by the door, who reads what is written against that number. "
    + "The sailors do not call this fortune-telling. They call it asking.",
  "ev.zayton.mazu.choice.offer": "Make an offering before you sail",
  "ev.zayton.mazu.choice.lots": "Shake the cylinder and draw a slip",
  "ev.zayton.mazu.choice.watch": "Stand at the back and watch",

  // --- mentor --------------------------------------------------------------
  "ev.zayton.mentor.title": "The Woman Who Reads the Slips",
  "ev.zayton.mentor.body":
    "The old woman at the temple door has read slips for forty years and can "
    + "tell you the name of every shipmaster who ignored one. She will teach the "
    + "reading to anyone who sits with her long enough and gives what he can to "
    + "the temple; but she says plainly that the slips do not tell a man what "
    + "will happen. They tell him what he has not yet considered.",
  "ev.zayton.mentor.choice.learn": "Sit with her, and learn to read the slips",
  "ev.zayton.mentor.choice.ask": "Ask only how the reading is done",

  // --- codex ---------------------------------------------------------------
  "codex.cx-zayton-tithe.name": "The Kaan's Tithe",
  "codex.cx-zayton-tithe.body":
    "Ten in the hundred on all merchandise landed at Zayton, including precious "
    + "stones and pearls — the Great Kaan takes tithe of everything. With the "
    + "ship's freight added, a merchant pays out half his cargo's worth before "
    + "he has sold a grain of it.",
  "codex.cx-hundred-shiploads.name": "A Hundred Shiploads",
  "codex.cx-hundred-shiploads.body":
    "For every shipload of pepper that reaches Alexandria bound for Christendom, "
    + "a hundred come in to Zayton. It is one of the two greatest havens in the "
    + "world for commerce.",
  "codex.cx-pepper-freight.name": "Freight Rates at Zayton",
  "codex.cx-pepper-freight.body":
    "Thirty in the hundred on small wares, forty on lignaloes and sandalwood "
    + "and other bulky goods, and four and forty on pepper.",
  "codex.cx-fanfang.name": "The Foreign Quarter",
  "codex.cx-fanfang.body":
    "A street of the port given over to the merchants of India, Persia and the "
    + "Arab lands, with their own houses of prayer standing within hearing of "
    + "the sea-goddess's gongs.",
  "codex.cx-sea-goddess.name": "The Goddess of the Sea",
  "codex.cx-sea-goddess.body":
    "A goddess of this coast to whom shipmasters go before sailing. Her temple "
    + "keeps a cylinder of numbered slips; a slip is drawn and read against a "
    + "book of verses.",
  "codex.cx-lots.name": "Reading the Slips",
  "codex.cx-lots.body":
    "The cylinder is shaken until a single numbered slip falls out. The number "
    + "is read against a book of verses. The verse does not answer the question "
    + "asked; it names the thing the asker had not weighed.",
  "codex.cx-monsoon.name": "The Monsoon",
  "codex.cx-monsoon.body":
    "The wind of the Indian sea turns with the seasons. Ships out of Zayton for "
    + "the Indies wait upon it, and a master who sails against it does not come "
    + "back to say so.",

  // --- stickers ------------------------------------------------------------
  "sticker.st-zayton-haven.name": "The Burnt Forest of Masts",
  "sticker.st-zayton-silk.name": "A Bolt of Manzi Silk",
  "sticker.st-zayton-mazu.name": "Smoke at the Sea-Temple",

  // --- shrine / market labels ---------------------------------------------
  "city.zayton.shrine.name": "The Temple of the Sea",
  "city.zayton.market.name": "The Quay at Zayton",
  "npc.npc-zayton-mentor.name": "The Woman Who Reads the Slips",
  "npc.npc-zayton-mentor.omen":
    "She has read slips for forty years, and remembers every master who ignored one.",
};

// ------------------------------------------------------------------ Chinese
// Short strings only. Long-form prose waits for the review-translation pass
// (LORE_PIPELINE.md §4); until it lands, I18n falls back to the English above.
const ZH = {
  "ev.zayton.entry.title": "刺桐港",
  "ev.zayton.entry.choice.customs": "向大汗的税吏报关",
  "ev.zayton.entry.choice.slip": "改从渔人石阶上岸",
  "ev.zayton.entry.choice.ask_ships": "问船夫这些船都是哪里来的",

  "ev.zayton.harbour.title": "码头",
  "ev.zayton.harbour.choice.pepper": "按码头价买一袋胡椒",
  "ev.zayton.harbour.choice.monsoon": "请领航们喝一杯，打听风信",
  "ev.zayton.harbour.choice.watch": "整日看船进港",

  "ev.zayton.fanfang.title": "番坊",
  "ev.zayton.fanfang.choice.persian": "向波斯商人打听海路",
  "ev.zayton.fanfang.choice.interpreter": "雇坊里少年做一季通译",
  "ev.zayton.fanfang.choice.silk": "向蛮子织工买一匹绢",

  "ev.zayton.mazu.title": "天妃宫",
  "ev.zayton.mazu.choice.offer": "出海前上一炷香",
  "ev.zayton.mazu.choice.lots": "摇筒求一签",
  "ev.zayton.mazu.choice.watch": "站在后面看",

  "ev.zayton.mentor.title": "解签的老妇",
  "ev.zayton.mentor.choice.learn": "随她坐下，学解签",
  "ev.zayton.mentor.choice.ask": "只问签是怎么解的",

  "codex.cx-zayton-tithe.name": "大汗的什一税",
  "codex.cx-hundred-shiploads.name": "百倍之船",
  "codex.cx-pepper-freight.name": "刺桐运价",
  "codex.cx-fanfang.name": "番坊",
  "codex.cx-sea-goddess.name": "海上女神",
  "codex.cx-lots.name": "解签",
  "codex.cx-monsoon.name": "季风",

  "sticker.st-zayton-haven.name": "如焚林之桅",
  "sticker.st-zayton-silk.name": "蛮子绢一匹",
  "sticker.st-zayton-mazu.name": "天妃宫的香烟",

  "city.zayton.shrine.name": "天妃宫",
  "city.zayton.market.name": "刺桐码头",
  "npc.npc-zayton-mentor.name": "解签的老妇",
};

function merge(file, add) {
  const p = join(ROOT, "content/i18n", file);
  const cur = JSON.parse(readFileSync(p, "utf8"));
  let n = 0;
  for (const [k, v] of Object.entries(add)) {
    if (cur[k] !== v) { cur[k] = v; n++; }
  }
  const sorted = Object.fromEntries(Object.keys(cur).sort().map((k) => [k, cur[k]]));
  writeFileSync(p, JSON.stringify(sorted, null, 2) + "\n");
  return n;
}

console.log(`en: ${merge("en.json", EN)} strings written`);
console.log(`zh: ${merge("zh.json", ZH)} strings written (short only; long-form pending translation)`);
console.log(`   ${Object.keys(EN).length - Object.keys(ZH).length} keys await Chinese long-form`);
