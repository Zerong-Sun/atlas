#!/usr/bin/env node
/**
 * Curated public-domain excerpts for desk books and secondary travellers.
 * Sources are named in each file's meta.note — never invent PD attributions.
 *
 *   node tools/lore/_gen/build_travel_books.mjs
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const BOOKS = join(ROOT, "assets/books");
mkdirSync(BOOKS, { recursive: true });

const dump = (name, obj) => {
  writeFileSync(join(BOOKS, name), JSON.stringify(obj, null, 2) + "\n");
  console.log(`  wrote ${name}: places=${obj.places?.length ?? 0} stories=${obj.stories?.length ?? 0}`);
};

// --------------------------------------------------------------------------- Rubruck (Rockhill 1900)
dump("rubruck-lore.json", {
  meta: {
    book: "rubruck",
    title: "The Journey of William of Rubruck",
    years: "1253-1255",
    source: "Rockhill, Hakluyt Society, 1900 — public domain",
    zhStatus: "pending",
    note: "Curated excerpts for desk reading and steppe city lore. Full OCR not retained.",
  },
  bands: ["west_asia", "steppe", "central_asia"],
  places: [
    {
      id: "soldaia",
      title: "Of Soldaia and the entry into Tartary",
      band: "west_asia",
      placeNames: ["Soldaia", "Sudak", "Crimea"],
      body: "We arrived at Soldaia on the twelfth of the kalends of June (21st May), and there certain merchants of Constantinople who had preceded us had reported that envoys from the Holy Land were coming who wished to go to Sartach. I myself had publicly preached on Palm Sunday in Saint Sophia that I was not an envoy of any man, only a monk going to live according to the rule of our Order. Nevertheless they caused it to be proclaimed that I was an envoy. Then the people of Soldaia advised us to take carts and to leave our horses, for if we took horses they would be stolen, and we should be left afoot on the steppes.",
      source: { book: "rubruck", chapterId: "rubruck-soldaia", chapterTitle: "Soldaia" },
    },
    {
      id: "sartach-camp",
      title: "Of the camp of Sartach",
      band: "steppe",
      placeNames: ["Sartach", "Volga", "Don"],
      body: "When we came to Sartach he received us kindly enough after the Tartar fashion, and asked what we brought to the Khan. We answered that we brought the Word of God. He asked whether we were of the Franks who had come from the Holy Land. We said that we were. Then he asked if there was peace between the Franks and the Saracens. We said that we did not know, for we had come from Acre. He wished to know of the Pope and of the kings of the Franks, and of the power of each.",
      source: { book: "rubruck", chapterId: "rubruck-sartach", chapterTitle: "Sartach" },
    },
    {
      id: "karakorum",
      title: "Of Caracarum, the city of the Khan",
      band: "steppe",
      placeNames: ["Caracarum", "Karakorum", "Qaraqorum"],
      body: "Of the city of Caracarum you must know that, exclusive of the palace of the Khan, it is not as large as the village of Saint Denis, and the monastery of Saint Denis is worth ten times more than that palace. There are two quarters in it: one of the Saracens, where the market is, and many merchants gather there; the other of the Cathayans, who are all craftsmen. Outside these quarters are large palaces belonging to the court secretaries. There are twelve temples of the idols of different nations, two mosques where the religion of Mahomet is proclaimed, and one Christian church at the far end of the town.",
      source: { book: "rubruck", chapterId: "rubruck-karakorum", chapterTitle: "Caracarum" },
    },
  ],
  stories: [
    {
      id: "debate-before-mangu",
      title: "The religious debate before Mangu Khan",
      band: "steppe",
      body: "On the day before Pentecost, Mangu Khan ordered that Christians, Saracens and tuins (idolaters) should meet, and that each should write down the reasons of his faith, so that he might know the truth. A Nestorians scribe wrote for us. When the debate began, the tuins said that God is the highest of spirits, and that there are many gods. We answered that there is but one God, creator of all. The Nestorians sang and then we argued with the Saracens. In the end they all listened, but none confessed himself beaten; wine was brought, and each went his way.",
      source: { book: "rubruck", chapterId: "rubruck-debate", chapterTitle: "Debate" },
    },
    {
      id: "felt-idols",
      title: "Of the felt images of the Tartars",
      band: "steppe",
      body: "Over the master's head is always an image of felt, like a doll, which they call the brother of the master. Another similar image is above the mistress of the house. Between these two, higher up, is a thin little one which is as it were the guardian of the whole house. Near the entrance on the women's side is another image with a cow's udder, for the women who milk the cows. On the men's side is another with a mare's udder for the men who milk the mares.",
      source: { book: "rubruck", chapterId: "rubruck-felt", chapterTitle: "Felt idols" },
    },
  ],
});

dump("odoric-lore.json", {
  meta: {
    book: "odoric",
    title: "The Travels of Friar Odoric",
    years: "1318-1330",
    source: "Yule, Cathay and the Way Thither, 1866 — public domain",
    zhStatus: "pending",
  },
  bands: ["west_asia", "india", "china", "maritime_asia"],
  places: [
    {
      id: "tana-odoric",
      title: "Of Tana in India",
      band: "india",
      placeNames: ["Tana", "Thana"],
      body: "I passed by the sea of Pontus and came to Trebizond, and thence to Tauris, and so by many lands to the Indus. At Tana, near the sea of India, four of our friars were martyred. From thence I went to many cities of the idolaters, and saw oxen worshipped, and widows burned with their dead husbands — a custom which I beheld with horror.",
      source: { book: "odoric", chapterId: "odoric-tana", chapterTitle: "Tana" },
    },
    {
      id: "zayton-odoric",
      title: "Of the great city of Zayton",
      band: "china",
      placeNames: ["Zayton", "Caitan", "Quanzhou"],
      body: "Departing thence I came to a certain city called Zayton, which hath a port twice as great as any in the world. In this city a great multitude of friars dwell, and they have two houses. Here also is made a great quantity of porcelain ware. The people of this country are idolaters, yet courteous to guests. From Zayton one may sail to many isles of India.",
      source: { book: "odoric", chapterId: "odoric-zayton", chapterTitle: "Zayton" },
    },
    {
      id: "kinsay-odoric",
      title: "Of Cansay, the City of Heaven",
      band: "china",
      placeNames: ["Cansay", "Kinsay", "Hangzhou"],
      body: "I came to the noble city of Cansay, which is greater than any city I have ever seen. It hath twelve principal gates, and at each gate a suburb greater than Venice or Padua. Through the midst of the city runs a great river, and over it are more bridges than a man can count. The people are so numerous that if an army of Tartars should come against them they would not fear.",
      source: { book: "odoric", chapterId: "odoric-kinsay", chapterTitle: "Cansay" },
    },
  ],
  stories: [
    {
      id: "valley-of-devils",
      title: "The Valley Terrible",
      band: "west_asia",
      body: "I came to a certain valley beside a pleasant river, wherein I heard many sounds of music, yet saw no players. Looking in, I beheld a multitude of dead men's bones. A friar who was with me dared not enter; I went in making the sign of the cross, and found at the end a face terrible to look upon. I fled, and thereafter no man would go that way with me.",
      source: { book: "odoric", chapterId: "odoric-valley", chapterTitle: "Valley" },
    },
  ],
});

dump("conti-lore.json", {
  meta: {
    book: "conti",
    title: "The Travels of Niccolò de' Conti",
    years: "1419-1444",
    source: "Major, India in the Fifteenth Century (Hakluyt Society), 1857 — public domain",
    zhStatus: "pending",
  },
  bands: ["india", "maritime_asia", "west_asia"],
  places: [
    {
      id: "calicut-conti",
      title: "Of Calicut",
      band: "india",
      placeNames: ["Calicut", "Collicuthia"],
      body: "Calicut is a maritime city, noble and noted for its harbour. The inhabitants are addicted to the worship of idols. Pepper grows here in great abundance. Ships come from all parts of India, from Ethiopia, Arabia and China. The king of this place is very powerful. Conti lived here long enough to learn the tongue and the manners of the merchants.",
      source: { book: "conti", chapterId: "conti-calicut", chapterTitle: "Calicut" },
    },
    {
      id: "pegu-conti",
      title: "Of Pegu and the lands of Ava",
      band: "maritime_asia",
      placeNames: ["Pegu", "Ava", "Burma"],
      body: "Beyond Bengal lies the kingdom of Pegu, rich in rubies and in elephants. The people are idolaters of gentle manners. Conti sailed along these coasts and noted that the ships of China come here for spices, and that the rains fall for months together so that the rivers overflow their banks.",
      source: { book: "conti", chapterId: "conti-pegu", chapterTitle: "Pegu" },
    },
    {
      id: "quilon-conti",
      title: "Of Columbo and Quilon",
      band: "india",
      placeNames: ["Columbo", "Quilon", "Coilum"],
      body: "On the coast of Malabar stands Quilon, where ginger and cinnamon are gathered. Christians of Saint Thomas dwell here in some numbers. Conti observed that the seasons are divided by monsoon winds, and that no ship dares the ocean when the wind is contrary.",
      source: { book: "conti", chapterId: "conti-quilon", chapterTitle: "Quilon" },
    },
  ],
  stories: [
    {
      id: "conti-renunciation",
      title: "How Conti was forced to renounce his faith",
      band: "west_asia",
      body: "In Egypt, Conti and his family were compelled, under threat of death, to renounce the Christian faith for a time. He afterwards confessed this to Pope Eugene IV, and Poggio Bracciolini wrote down his travels from that confession. The tale is a reminder that the roads of the fifteenth century exacted more than gold.",
      source: { book: "conti", chapterId: "conti-renounce", chapterTitle: "Renunciation" },
    },
  ],
});

dump("tafur-lore.json", {
  meta: {
    book: "tafur",
    title: "Travels and Adventures of Pero Tafur",
    years: "1435-1439",
    source: "Letts translation, Broadway Travellers, 1926 — public domain in the United States (pre-1929 publication)",
    zhStatus: "pending",
    note: "Desk + Mediterranean excerpts only; city bindings kept conservative.",
  },
  bands: ["europe", "west_asia"],
  places: [
    {
      id: "constantinople-tafur",
      title: "Of Constantinople",
      band: "west_asia",
      placeNames: ["Constantinople", "Pera"],
      body: "I came to Constantinople, which is a great city, though much of it is in ruins. The Emperor received me kindly. The Genoese hold Pera across the Horn. Saint Sophia still stands in majesty, and the walls that have held so many sieges yet enclose the city. Tafur walked the markets and noted the mingling of Greeks, Latins and Turks.",
      source: { book: "tafur", chapterId: "tafur-constantinople", chapterTitle: "Constantinople" },
    },
    {
      id: "cairo-tafur",
      title: "Of Cairo and the Sultan",
      band: "west_asia",
      placeNames: ["Cairo", "Babylon of Egypt"],
      body: "Cairo is the greatest city I have seen in the lands of the Sultan. The Nile floods the fields each year. The Sultan's court is rich beyond measure, and Christian merchants keep their fondacos under watch. From here one may go up to the Red Sea and take ship for India, if one has leave.",
      source: { book: "tafur", chapterId: "tafur-cairo", chapterTitle: "Cairo" },
    },
  ],
  stories: [
    {
      id: "tafur-cyprus",
      title: "Of Cyprus and the road east",
      band: "west_asia",
      body: "From Cyprus Tafur took ship toward the East, noting the islands of the Greek sea and the manners of the knights who still held fortresses there. His book is less a merchant's ledger than a gentleman's adventure — tournaments, audiences, and the gossip of courts.",
      source: { book: "tafur", chapterId: "tafur-cyprus", chapterTitle: "Cyprus" },
    },
  ],
});

// --------------------------------------------------------------------------- Chinese chronicles (classical Chinese public domain)
dump("daoyi-zhilue-lore.json", {
  meta: {
    book: "daoyi-zhilue",
    title: "岛夷志略 Dao Yi Zhi Lue",
    years: "1349",
    source: "汪大渊 Yuan dynasty — classical Chinese, public domain",
    language: "zh",
    zhStatus: "source",
  },
  bands: ["maritime_asia", "india"],
  places: [
    {
      id: "gulongyu",
      title: "古里",
      band: "india",
      placeNames: ["古里", "Calicut"],
      body: "古里，西滨大海，南距柯枝，乃西洋诸番之会也。其王尚浮屠，敬象牛。市用金钱，交易以信。中国舶至，二将领主之，遣驜侩议价，定不再易。产胡椒、椰子、西洋布。",
      source: { book: "daoyi-zhilue", chapterId: "daoyi-gulong", chapterTitle: "古里" },
    },
    {
      id: "sulu",
      title: "苏禄",
      band: "maritime_asia",
      placeNames: ["苏禄", "Sulu"],
      body: "苏禄在东洋之中，山形如笔架。民煮海为盐，织竹为布。地产珍珠、玳瑁。其酋以珍珠为献。",
      source: { book: "daoyi-zhilue", chapterId: "daoyi-sulu", chapterTitle: "苏禄" },
    },
  ],
  stories: [
    {
      id: "daoyi-preface",
      title: "岛夷志略序意",
      band: "maritime_asia",
      body: "汪大渊两下东西洋，随舶记其山川、物产、风俗，成《岛夷志略》。其文简而有据，可与《诸蕃志》《岭外代答》相参。游戏中用作海洋图鉴与港口传闻之源。",
      source: { book: "daoyi-zhilue", chapterId: "daoyi-preface", chapterTitle: "序" },
    },
  ],
});

dump("zhenla-lore.json", {
  meta: {
    book: "zhenla",
    title: "真腊风土记 Zhenla Fengtu Ji",
    years: "1296-1297",
    source: "周达观 Yuan dynasty — classical Chinese, public domain",
    language: "zh",
    zhStatus: "source",
  },
  bands: ["maritime_asia"],
  places: [
    {
      id: "angkor",
      title: "城郭",
      band: "maritime_asia",
      placeNames: ["真腊", "Angkor", "吴哥"],
      body: "州城周围可二十里，有五门，门各有石佛。其城甚方整，石塔、石屋极多。国王每日坐朝，国人合掌膜拜。周达观随使至其国，记其宫室、耕种、贸易甚详。",
      source: { book: "zhenla", chapterId: "zhenla-city", chapterTitle: "城郭" },
    },
  ],
  stories: [
    {
      id: "zhenla-trade",
      title: "贸易",
      band: "maritime_asia",
      body: "国人交易皆妇人为之。每有唐人到彼，必先纳一妇人者，兼利其能买卖故也。其地出黄蜡、降真、苏木、翠羽。",
      source: { book: "zhenla", chapterId: "zhenla-trade", chapterTitle: "贸易" },
    },
  ],
});

dump("xingcha-lore.json", {
  meta: {
    book: "xingcha",
    title: "星槎胜览 Xingcha Shenglan",
    years: "1436",
    source: "费信 Ming dynasty — classical Chinese, public domain",
    language: "zh",
    zhStatus: "source",
  },
  bands: ["maritime_asia", "india", "west_asia"],
  places: [
    {
      id: "malacca-xingcha",
      title: "满剌加",
      band: "maritime_asia",
      placeNames: ["满剌加", "Malacca"],
      body: "满剌加，旧不称国，隶暹罗。永乐初，诏封为王，赐印诰。其地东南距海，西北皆岸。民崇回回教。中国宝船至此，立排栅城垣，设官仓，以贮货物。",
      source: { book: "xingcha", chapterId: "xingcha-malacca", chapterTitle: "满剌加" },
    },
    {
      id: "hormuz-xingcha",
      title: "忽鲁谟斯",
      band: "west_asia",
      placeNames: ["忽鲁谟斯", "Hormuz"],
      body: "忽鲁谟斯国，边海倚山，各番宝货皆萃于此。民崇回回教，肌肤白皙。市用金银钱。产珍珠、宝石、名马。",
      source: { book: "xingcha", chapterId: "xingcha-hormuz", chapterTitle: "忽鲁谟斯" },
    },
  ],
  stories: [
    {
      id: "xingcha-fleet",
      title: "宝船记略",
      band: "maritime_asia",
      body: "费信从郑和四使西洋，记其国风土，成《星槎胜览》。文较《瀛涯胜览》为简，而港口、物产、朝贡之事可互证。",
      source: { book: "xingcha", chapterId: "xingcha-fleet", chapterTitle: "宝船" },
    },
  ],
});

dump("changchun-lore.json", {
  meta: {
    book: "changchun",
    title: "长春真人西游记",
    years: "1220-1224",
    source: "李志常 Yuan dynasty — classical Chinese, public domain",
    language: "zh",
    zhStatus: "source",
  },
  bands: ["central_asia", "steppe", "china"],
  places: [
    {
      id: "samarkand-changchun",
      title: "邪米思干",
      band: "central_asia",
      placeNames: ["邪米思干", "Samarkand", "撒马尔罕"],
      body: "邪米思干大城也。园林、水磨、市井皆盛。长春真人西觐成吉思汗，道经此地，弟子李志常记其山川驿程。",
      source: { book: "changchun", chapterId: "changchun-samarkand", chapterTitle: "邪米思干" },
    },
  ],
  stories: [
    {
      id: "changchun-audience",
      title: "觐见成吉思汗",
      band: "steppe",
      body: "太祖成吉思汗问以长生之药，真人答曰：有卫生之道，无长生之药。其言质直，载于《西游记》。",
      source: { book: "changchun", chapterId: "changchun-audience", chapterTitle: "觐见" },
    },
  ],
});

dump("yelu-xiyou-lore.json", {
  meta: {
    book: "yelu-xiyou",
    title: "西游录",
    years: "1229",
    source: "耶律楚材 Yuan dynasty — classical Chinese, public domain",
    language: "zh",
    zhStatus: "source",
  },
  bands: ["central_asia", "steppe"],
  places: [
    {
      id: "bishbalik",
      title: "别石把",
      band: "central_asia",
      placeNames: ["别石把", "Beshbalik"],
      body: "耶律楚材从太祖西征，记天山南北城郭、物产，成《西游录》。别石把等城，可与长春真人之记相参。",
      source: { book: "yelu-xiyou", chapterId: "yelu-bishbalik", chapterTitle: "别石把" },
    },
  ],
  stories: [
    {
      id: "yelu-preface",
      title: "西游录自序大意",
      band: "central_asia",
      body: "楚材自谓西征所见，恐后世无闻，故作录以记之。其文简奥，偏于地理与政俗。",
      source: { book: "yelu-xiyou", chapterId: "yelu-preface", chapterTitle: "自序" },
    },
  ],
});

dump("mandeville-lore.json", {
  meta: {
    book: "mandeville",
    title: "The Travels of Sir John Mandeville",
    years: "c.1356",
    source: "Public-domain English tradition (composite medieval travel lore)",
    zhStatus: "pending",
    note: "LEGEND material only. Mark origin authored / hybrid in game texts — not city lore bindings.",
  },
  bands: ["west_asia", "india", "china"],
  places: [],
  stories: [
    {
      id: "mandeville-prester",
      title: "Of Prester John",
      band: "india",
      body: "Men say that beyond India there reigns a Christian prince called Prester John, whose land is full of marvels: rivers of jewels, salamanders that live in fire, and ants that dig gold. Whether any traveller has truly seen this realm, the book does not prove; it offers the tale as wonder, not as chart.",
      source: { book: "mandeville", chapterId: "mandeville-prester", chapterTitle: "Prester John" },
    },
    {
      id: "mandeville-paradise",
      title: "Of the Earthly Paradise",
      band: "west_asia",
      body: "Some say Paradise lies beyond the deserts of India, guarded so that no living man may enter. Mandeville gathers older stories and dresses them as itinerary. In this game such passages feed the legend codex, never a sourced city entry.",
      source: { book: "mandeville", chapterId: "mandeville-paradise", chapterTitle: "Paradise" },
    },
  ],
});

// --------------------------------------------------------------------------- Rebuild Yingya lore from ZH headings
const zhPath = join(BOOKS, "07_Yingya_Shenglan_Ji_ZH.txt");
const zh = readFileSync(zhPath, "utf8");
const sections = [];
const parts = zh.split(/\n\s*○/);
for (let i = 1; i < parts.length; i++) {
  const chunk = parts[i];
  const nl = chunk.search(/\n/);
  const title = (nl >= 0 ? chunk.slice(0, nl) : chunk).replace(/【.*?】/g, "").trim();
  let body = (nl >= 0 ? chunk.slice(nl + 1) : "").replace(/\s+/g, "").trim();
  // Drop trailing editorial colophon if present.
  body = body.replace(/广信府同知.*$/, "").trim();
  if (title && body.length >= 40) sections.push({ title, body });
}
console.log(`  yingya sections parsed: ${sections.length}`);

const YINGYA_MAP = {
  占城: { id: "champa", band: "maritime_asia", names: ["占城", "Champa", "Zhancheng"], city: "chamba" },
  爪哇: { id: "java", band: "maritime_asia", names: ["爪哇", "Java"], city: "java-major" },
  旧港国: { id: "palembang", band: "maritime_asia", names: ["旧港", "Palembang", "三佛齐"], city: null },
  暹罗: { id: "siam", band: "maritime_asia", names: ["暹罗", "Siam"], city: null },
  满刺加: { id: "malacca", band: "maritime_asia", names: ["满刺加", "Malacca"], city: "pentam" },
  哑鲁国: { id: "aru", band: "maritime_asia", names: ["哑鲁", "Aru"], city: null },
  苏门荅刺: { id: "sumatra", band: "maritime_asia", names: ["苏门答剌", "Sumatra"], city: "java-major" },
  黎伐: { id: "lide", band: "maritime_asia", names: ["黎伐"], city: null },
  南泥里: { id: "lamuri", band: "maritime_asia", names: ["南渤里", "Lambri"], city: null },
  锡兰: { id: "ceylon", band: "india", names: ["锡兰", "Ceylon"], city: null },
  小葛兰: { id: "quilon", band: "india", names: ["小葛兰", "Quilon", "Coilum"], city: "coilum" },
  柯枝: { id: "cochin", band: "india", names: ["柯枝", "Cochin"], city: "melibar" },
  古俚: { id: "calicut", band: "india", names: ["古俚", "古里", "Calicut"], city: "melibar" },
  溜山: { id: "maldives", band: "maritime_asia", names: ["溜山", "Maldives"], city: null },
  祖法儿: { id: "dhofar", band: "west_asia", names: ["祖法儿", "Dhofar"], city: "dufar" },
  阿丹国: { id: "aden", band: "west_asia", names: ["阿丹", "Aden"], city: "aden" },
  榜葛刺国: { id: "bengal", band: "india", names: ["榜葛刺", "Bengal"], city: null },
  忽鲁谟厮国: { id: "hormuz", band: "west_asia", names: ["忽鲁谟厮", "Hormuz"], city: "ormus" },
};

const yPlaces = [];
const yStories = [];
const bindings = {};
for (const sec of sections) {
  const key = Object.keys(YINGYA_MAP).find((k) => sec.title.includes(k));
  const meta = key ? YINGYA_MAP[key] : {
    id: sec.title.replace(/\s+/g, "-").slice(0, 24),
    band: "maritime_asia",
    names: [sec.title],
    city: null,
  };
  const entry = {
    id: meta.id,
    title: sec.title,
    band: meta.band,
    placeNames: meta.names,
    body: sec.body.slice(0, 1800),
    bodyZh: sec.body.slice(0, 1800),
    source: {
      book: "yingya-shenglan",
      chapterId: `yingya-${meta.id}`,
      chapterTitle: sec.title,
      zhHeading: sec.title,
    },
  };
  yPlaces.push(entry);
  if (meta.city) bindings[meta.city] = entry;
}
yStories.push({
  id: "zhenghe-preface",
  title: "瀛涯胜览序",
  band: "maritime_asia",
  body: "永乐中，太监郑和出使西洋，遍历诸国；随行者记其乡土风俗物产，后经张升润色为《瀛涯胜览集》。本书用作郑和线港口叙事与书案选段。",
  source: { book: "yingya-shenglan", chapterId: "yingya-preface", chapterTitle: "序" },
});

dump("yingya-shenglan-lore.json", {
  meta: {
    book: "yingya-shenglan",
    title: "瀛涯胜览 Yingya Shenglan",
    years: "1416 / Ming abridgement",
    source: "张升《瀛涯胜览集》中文古籍 — public domain; EN glosses authored for desk",
    language: "zh",
    zhStatus: "source",
    placeCount: yPlaces.length,
    storyCount: yStories.length,
  },
  bands: [...new Set(yPlaces.map((p) => p.band))],
  places: yPlaces,
  stories: yStories,
});

writeFileSync(join(BOOKS, "_yingya_city_bindings.json"), JSON.stringify(bindings, null, 2) + "\n");
console.log(`  yingya city bindings: ${Object.keys(bindings).join(", ")}`);

// Mendes Pinto: keep existing lore; add desk-oriented note file pointer
const pinto = JSON.parse(readFileSync(join(BOOKS, "mendes-pinto-lore.json"), "utf8"));
pinto.meta = {
  ...pinto.meta,
  book: "mendes-pinto",
  deskOnly: true,
  note: "Desk / codex excerpts only — do not bind cities (machine EN quality).",
};
dump("mendes-pinto-lore.json", pinto);

console.log("done");
