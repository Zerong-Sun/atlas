#!/usr/bin/env node
/**
 * Turns the raw chapter dumps into lore files with the same shape as
 * marco-polo-lore.json, so the three new travellers plug into the pipeline the
 * Polo corpus already uses (docs/LORE_PIPELINE.md).
 *
 *   Ibn Battuta   — 1325-1354, Tangier to China via Mecca. The Islamic-world
 *                   voice GDD §16.5 defers to chapter two.
 *   Ibn Fadlan    — 921-922, Baghdad to the Volga Bulghars. The northern/steppe
 *                   voice; Polo barely covers the Ponent.
 *   Ibn Jubayr    — 1183-1185, Granada to Mecca and back. A pilgrim's account,
 *                   month by month.
 *
 * Classification mirrors GDD §16.2: a chapter is a PLACE if its title names
 * settlements, a STORY otherwise. Band is inferred from the place names, since
 * none of these sources carry one.
 *
 *   node tools/lore/build_lore.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const BOOKS = join(ROOT, "assets/books");

const SOURCES = [
  { id: "ibn-battuta", raw: "_ibn_battuta_chapters_raw.json", txt: "03_The_Travels_of_Ibn_Battuta.txt",
    title: "The Travels of Ibn Battuta", years: "1325-1354" },
  { id: "ibn-fadlan", raw: "_ibn_fadlan_chapters_raw.json", txt: "04_Ibn_Fadlan_and_the_Land_of_Darkness.txt",
    title: "Ibn Fadlan and the Land of Darkness", years: "921-922" },
  { id: "ibn-jubayr", raw: "_ibn_jubayr_chapters_raw.json", txt: "05_The_Travels_of_Ibn_Jubayr.txt",
    title: "The Travels of Ibn Jubayr", years: "1183-1185" },
];

// Place-name fragments -> band. Deliberately conservative: an unmatched chapter
// becomes a story rather than being filed in the wrong region.
const BAND_HINTS = {
  west_asia: ["baghd", "baudas", "damasc", "dimashq", "aleppo", "mosul", "basra", "kufa", "tabriz",
              "mecca", "makka", "medina", "madina", "jedda", "jidda", "hijaz", "yemen", "aden",
              "hormuz", "shiraz", "isfahan", "persia", "iraq", "syria", "jerusalem", "acre", "tyre"],
  central_asia: ["bukhara", "bokhara", "samarkand", "samarqand", "khwarizm", "khiva", "transoxian",
                 "balkh", "khurasan", "khorasan", "merv", "ghazna", "kabul", "kashgar", "turkistan"],
  steppe: ["bulghar", "khazar", "volga", "kipchak", "qipchaq", "saray", "astrakhan", "crimea",
           "rus", "russia", "ghuzz", "bashghird", "pecheneg", "tartar", "golden horde", "darkness"],
  china: ["china", "cathay", "khansa", "zaytun", "canton", "sin al-sin", "peking", "khanbaliq"],
  india: ["india", "hind", "delhi", "dihli", "malabar", "calicut", "gujarat", "sind", "cambay",
          "coromandel", "ceylon", "sarandib", "maldiv"],
  maritime_asia: ["sumatra", "java", "malacca", "malay", "spice island", "champa"],
  europe: ["granada", "andalus", "spain", "sicily", "constantin", "greek", "rome", "genoa", "venice"],
  africa: ["cairo", "misr", "alexandria", "iskandar", "maghrib", "tangier", "tanjier", "fez", "fas",
           "tunis", "tripoli", "nile", "abyssin", "mali", "timbuktu", "sudan", "zanzibar", "kilwa"],
};

const slug = (s) => String(s).toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

/** Settlement-ish titles become places; everything else is narrative. */
function isPlace(title) {
  const t = String(title);
  if (/^(the )?(chronicle|opening|introduction|preface|prologue|note)/i.test(t)) return false;
  if (/month of|year of|concerning the (customs|manners|religion)/i.test(t)) return false;
  // These sources title place chapters as dash-joined itineraries.
  if (t.includes("—") || t.includes("--")) return true;
  return /\b(city|town|province|kingdom|country|island|port|road to|departure from|arrival)\b/i.test(t);
}

function bandOf(text) {
  const t = String(text).toLowerCase();
  let best = null, bestHits = 0;
  for (const [band, hints] of Object.entries(BAND_HINTS)) {
    let hits = 0;
    for (const h of hints) if (t.includes(h)) hits++;
    if (hits > bestHits) { bestHits = hits; best = band; }
  }
  // `africa` is not one of the game's seven bands; the Maghrib and Egypt sit
  // with west_asia for gameplay purposes until a chapter-two band exists.
  if (best === "africa") best = "west_asia";
  return best ?? "west_asia";
}

/** Chapter text lives in the .txt; the raw JSON carries only offsets/titles. */
function sliceBodies(records, fullText) {
  const marks = [];
  for (const r of records) {
    const t = String(r.chapterTitle ?? r.title ?? "");
    if (!t) continue;
    const at = fullText.indexOf(t);
    marks.push({ rec: r, at: at >= 0 ? at + t.length : -1 });
  }
  const found = marks.filter((m) => m.at >= 0).sort((a, b) => a.at - b.at);
  for (let i = 0; i < found.length; i++) {
    const end = i + 1 < found.length ? found[i + 1].at : Math.min(found[i].at + 24000, fullText.length);
    found[i].rec._body = fullText.slice(found[i].at, end)
      .replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  return found.length;
}

let totalPlaces = 0, totalStories = 0;
const dry = process.argv.includes("--dry");

for (const src of SOURCES) {
  const rawPath = join(BOOKS, src.raw);
  const txtPath = join(BOOKS, src.txt);
  if (!existsSync(rawPath) || !existsSync(txtPath)) {
    console.log(`  ! ${src.id}: missing ${existsSync(rawPath) ? src.txt : src.raw}`);
    continue;
  }
  const rawDoc = JSON.parse(readFileSync(rawPath, "utf8"));
  const records = Array.isArray(rawDoc) ? rawDoc : (rawDoc.chapters ?? Object.values(rawDoc)[0]);
  const fullText = readFileSync(txtPath, "utf8");

  const matched = sliceBodies(records, fullText);

  const places = [], stories = [];
  for (const r of records) {
    const title = String(r.chapterTitle ?? r.title ?? "").trim();
    const body = String(r._body ?? r.rawBody ?? r.body ?? "").trim();
    if (!title || body.length < 200) continue;
    const entry = {
      id: slug(title),
      title,
      band: bandOf(title + " " + body.slice(0, 1200)),
      body,
      source: {
        book: src.id,
        chapterId: String(r.id ?? r.chapter ?? slug(title)),
        chapterTitle: title,
        section: r.section ?? r.part ?? null,
      },
      zhStatus: "pending",
    };
    if (isPlace(title)) {
      entry.placeNames = title.split(/[—–-]{1,2}/).map((x) => x.trim()).filter(Boolean).slice(0, 12);
      places.push(entry);
    } else {
      stories.push(entry);
    }
  }

  const bands = {};
  for (const e of [...places, ...stories]) bands[e.band] = (bands[e.band] ?? 0) + 1;

  const out = {
    meta: {
      book: src.id,
      title: src.title,
      years: src.years,
      note: "Public-domain translation. Chapter bodies sliced from the plain text by tools/lore/build_lore.mjs.",
      generated: new Date().toISOString().slice(0, 10),
    },
    bands: Object.keys(bands).sort(),
    places,
    stories,
  };

  console.log(`  ${src.id}: ${records.length} chapters -> ${places.length} places, ${stories.length} stories`
    + `  (bodies matched ${matched}/${records.length})`);
  console.log(`     bands: ${Object.entries(bands).map(([k, v]) => `${k}:${v}`).join("  ")}`);

  if (!dry) {
    writeFileSync(join(BOOKS, `${src.id}-lore.json`), JSON.stringify(out, null, 1) + "\n");
  }
  totalPlaces += places.length;
  totalStories += stories.length;
}

console.log(`\n${dry ? "[dry] " : ""}total: ${totalPlaces} places, ${totalStories} stories`);
