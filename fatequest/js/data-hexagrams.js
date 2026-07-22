/* I-Ching: 8 trigrams + 64 hexagrams (King Wen order) — bilingual one-line imagery */
window.FQ = window.FQ || {};

/* trigram lines are bottom-up: 1 = yang, 0 = yin */
FQ.TRIGRAMS = [
  { id: "qian", zh: "乾", en: "Heaven",   sym: "☰", lines: [1,1,1], elem: "金" },
  { id: "dui",  zh: "兑", en: "Lake",     sym: "☱", lines: [1,1,0], elem: "金" },
  { id: "li",   zh: "离", en: "Fire",     sym: "☲", lines: [1,0,1], elem: "火" },
  { id: "zhen", zh: "震", en: "Thunder",  sym: "☳", lines: [1,0,0], elem: "木" },
  { id: "xun",  zh: "巽", en: "Wind",     sym: "☴", lines: [0,1,1], elem: "木" },
  { id: "kan",  zh: "坎", en: "Water",    sym: "☵", lines: [0,1,0], elem: "水" },
  { id: "gen",  zh: "艮", en: "Mountain", sym: "☶", lines: [0,0,1], elem: "土" },
  { id: "kun",  zh: "坤", en: "Earth",    sym: "☷", lines: [0,0,0], elem: "土" }
];

/* King Wen number = KW_TABLE[lowerTrigramIndex][upperTrigramIndex]
   (indices follow FQ.TRIGRAMS order: 乾兑离震巽坎艮坤) */
FQ.KW_TABLE = [
  [ 1, 43, 14, 34,  9,  5, 26, 11],
  [10, 58, 38, 54, 61, 60, 41, 19],
  [13, 49, 30, 55, 37, 63, 22, 36],
  [25, 17, 21, 51, 42,  3, 27, 24],
  [44, 28, 50, 32, 57, 48, 18, 46],
  [ 6, 47, 64, 40, 59, 29,  4,  7],
  [33, 31, 56, 62, 53, 39, 52, 15],
  [12, 45, 35, 16, 20,  8, 23,  2]
];

/* n = King Wen number; zh/en names; mZh/mEn = one-line imagery */
FQ.HEXAGRAMS = [
  { n:1,  zh:"乾",   en:"The Creative",            mZh:"天行健，自强不息，大道正当运行。",   mEn:"Pure creative force; persevere with vigor." },
  { n:2,  zh:"坤",   en:"The Receptive",           mZh:"厚德载物，以柔顺承接万物。",         mEn:"Receptive earth; carry all with devotion." },
  { n:3,  zh:"屯",   en:"Difficulty at the Beginning", mZh:"草木初生，艰难中孕育生机。",     mEn:"Sprouting through stones; hard but alive." },
  { n:4,  zh:"蒙",   en:"Youthful Folly",          mZh:"童蒙求教，虚心方得启明。",           mEn:"Ask humbly; the fog of youth will lift." },
  { n:5,  zh:"需",   en:"Waiting",                 mZh:"云上于天，静候时机，饮食宴乐。",     mEn:"Clouds gather; nourish yourself and wait." },
  { n:6,  zh:"讼",   en:"Conflict",                mZh:"天水违行，争讼不如中止。",           mEn:"Contention drains; settle early." },
  { n:7,  zh:"师",   en:"The Army",                mZh:"地中有水，纪律成军，众志可用。",     mEn:"Discipline gathers strength for the cause." },
  { n:8,  zh:"比",   en:"Holding Together",        mZh:"水行地上，亲附盟友，众心归一。",     mEn:"Alliance and belonging; draw close." },
  { n:9,  zh:"小畜", en:"Small Taming",            mZh:"密云不雨，小有积蓄，耐心蓄力。",     mEn:"Dense clouds, no rain yet; small gains add up." },
  { n:10, zh:"履",   en:"Treading",                mZh:"履虎尾而不咬，谨慎前行则吉。",       mEn:"Tread carefully — even on the tiger's tail." },
  { n:11, zh:"泰",   en:"Peace",                   mZh:"天地交泰，上下相通，诸事亨通。",     mEn:"Heaven and earth commune; all flows well." },
  { n:12, zh:"否",   en:"Standstill",              mZh:"天地不交，闭塞之时，守静待变。",     mEn:"Blocked channels; keep still and endure." },
  { n:13, zh:"同人", en:"Fellowship",              mZh:"与人同心，其利断金。",               mEn:"Fellowship in the open; shared aims prevail." },
  { n:14, zh:"大有", en:"Great Possession",        mZh:"火在天上，光照四方，大有所成。",     mEn:"Fire in heaven; great holdings, shared brightly." },
  { n:15, zh:"谦",   en:"Modesty",                 mZh:"地中有山，谦谦君子，有终有吉。",     mEn:"A mountain within the earth; modesty crowns all." },
  { n:16, zh:"豫",   en:"Enthusiasm",              mZh:"雷出地奋，顺势而动，乐而有备。",     mEn:"Thunder bursts from earth; joyful readiness." },
  { n:17, zh:"随",   en:"Following",               mZh:"泽中有雷，随时而动，随善而从。",     mEn:"Follow what is right, and rest in season." },
  { n:18, zh:"蛊",   en:"Work on the Decayed",     mZh:"整饬旧弊，正本清源之时。",           mEn:"Repair what was spoiled; mend the roots." },
  { n:19, zh:"临",   en:"Approach",                mZh:"泽上有地，君临而教思无穷。",         mEn:"A benevolent approach; lead by caring." },
  { n:20, zh:"观",   en:"Contemplation",           mZh:"风行地上,登台观象，先看后动。",      mEn:"Ascend the tower; observe before acting." },
  { n:21, zh:"噬嗑", en:"Biting Through",          mZh:"咬合而通，果断处置梗阻。",           mEn:"Bite through the obstacle; decide firmly." },
  { n:22, zh:"贲",   en:"Grace",                   mZh:"山下有火，文饰之美，质胜于华。",     mEn:"Adornment glows, yet substance rules." },
  { n:23, zh:"剥",   en:"Splitting Apart",         mZh:"山附于地，剥落之时，不宜有往。",     mEn:"Erosion at the base; do not push forward." },
  { n:24, zh:"复",   en:"Return",                  mZh:"一阳来复，冬尽春回，转机初现。",     mEn:"The light returns; a turning point stirs." },
  { n:25, zh:"无妄", en:"Innocence",               mZh:"天下雷行，不妄为则无咎。",           mEn:"Act without guile; innocence protects." },
  { n:26, zh:"大畜", en:"Great Taming",            mZh:"山中藏天，厚积而后大发。",           mEn:"Great storing; strength held ripens power." },
  { n:27, zh:"颐",   en:"Nourishment",             mZh:"观颐自养，谨言语，节饮食。",         mEn:"Mind what nourishes — words and food alike." },
  { n:28, zh:"大过", en:"Great Excess",            mZh:"栋梁过重，非常之时行非常之事。",     mEn:"The beam sags; extraordinary times, bold moves." },
  { n:29, zh:"坎",   en:"The Abysmal",             mZh:"重重险水，守信笃行可渡。",           mEn:"Repeated gorges; sincerity carries through." },
  { n:30, zh:"离",   en:"The Clinging",            mZh:"日月丽天，依附光明而行。",           mEn:"Cling to clarity; brightness doubled." },
  { n:31, zh:"咸",   en:"Influence",               mZh:"山上有泽，两情相感，虚心相受。",     mEn:"Mutual attraction; receive with an open heart." },
  { n:32, zh:"恒",   en:"Duration",                mZh:"雷风相与，恒久不易之道。",           mEn:"Endure; constancy is its own reward." },
  { n:33, zh:"遁",   en:"Retreat",                 mZh:"天下有山，及时退避，退亦是进。",     mEn:"Timely retreat is also advance." },
  { n:34, zh:"大壮", en:"Great Power",             mZh:"雷在天上，力壮更须守正。",           mEn:"Great vigor; power needs rightness." },
  { n:35, zh:"晋",   en:"Progress",                mZh:"明出地上，昼日三接，进升之象。",     mEn:"The sun climbs; promotion and advance." },
  { n:36, zh:"明夷", en:"Darkening of the Light",  mZh:"明入地中，晦时藏锋，内明外柔。",     mEn:"Light wounded; veil brilliance, keep faith." },
  { n:37, zh:"家人", en:"The Family",              mZh:"风自火出，正家而天下定。",           mEn:"Order at the hearth steadies the world." },
  { n:38, zh:"睽",   en:"Opposition",              mZh:"火泽相违，小事尚可，求同存异。",     mEn:"Estrangement; seek accord in small things." },
  { n:39, zh:"蹇",   en:"Obstruction",             mZh:"山上有水，路阻宜返，反求诸己。",     mEn:"The pass is blocked; turn inward for the way." },
  { n:40, zh:"解",   en:"Deliverance",             mZh:"雷雨作而百果甲坼，困局松解。",       mEn:"The storm breaks the knot; release comes." },
  { n:41, zh:"损",   en:"Decrease",                mZh:"损下益上，有舍方有得。",             mEn:"Decrease with sincerity; loss becomes gain." },
  { n:42, zh:"益",   en:"Increase",                mZh:"风雷相助，损上益下，利有攸往。",     mEn:"Increase flows downward; act on the good wind." },
  { n:43, zh:"夬",   en:"Breakthrough",            mZh:"泽上于天，果决宣示，去疾务尽。",     mEn:"Resolute breakthrough; name it aloud." },
  { n:44, zh:"姤",   en:"Coming to Meet",          mZh:"天下有风，不期而遇，慎其所遇。",     mEn:"An unexpected meeting; weigh it well." },
  { n:45, zh:"萃",   en:"Gathering",               mZh:"泽上于地，万物荟萃，聚而有序。",     mEn:"Gathering together; order the assembly." },
  { n:46, zh:"升",   en:"Pushing Upward",          mZh:"地中生木，积小以高大。",             mEn:"A tree grows in the earth; rise step by step." },
  { n:47, zh:"困",   en:"Oppression",              mZh:"泽无水困，穷且益坚，言少行笃。",     mEn:"The lake runs dry; endure, act, spare words." },
  { n:48, zh:"井",   en:"The Well",                mZh:"井养而不穷，修井以惠人。",           mEn:"The well serves all; tend the source." },
  { n:49, zh:"革",   en:"Revolution",              mZh:"泽中有火，天时已至，革故鼎新。",     mEn:"Molting season; reform when the day is ripe." },
  { n:50, zh:"鼎",   en:"The Cauldron",            mZh:"鼎烹养贤，去旧立新之器。",           mEn:"The cauldron nourishes; refine the new order." },
  { n:51, zh:"震",   en:"The Arousing",            mZh:"洊雷震惊百里，惊而后有持。",         mEn:"Thunder upon thunder; shock, then compose." },
  { n:52, zh:"艮",   en:"Keeping Still",           mZh:"兼山艮止，当止则止，静得其所。",     mEn:"Mountain stillness; stop where stopping is due." },
  { n:53, zh:"渐",   en:"Gradual Progress",        mZh:"山上有木，循序渐进，如鸿渐陆。",     mEn:"The wild goose advances by stages." },
  { n:54, zh:"归妹", en:"The Marrying Maiden",     mZh:"雷泽归妹，位次未正，宜守分寸。",     mEn:"An eager match; mind your standing." },
  { n:55, zh:"丰",   en:"Abundance",               mZh:"雷电皆至，丰盛之极，日中则昃。",     mEn:"Fullness at noon — savor it, and note the tilt." },
  { n:56, zh:"旅",   en:"The Wanderer",            mZh:"山上有火，行旅在外，柔顺自持。",     mEn:"A traveler's fire; stay modest on foreign ground." },
  { n:57, zh:"巽",   en:"The Gentle",              mZh:"随风巽入，柔而能入，申命行事。",     mEn:"Gentle wind seeps everywhere; persist softly." },
  { n:58, zh:"兑",   en:"The Joyous",              mZh:"丽泽相悦，朋友讲习，和悦而正。",     mEn:"Joined lakes; joy shared and upright." },
  { n:59, zh:"涣",   en:"Dispersion",              mZh:"风行水上，涣散冰释，凝聚人心。",     mEn:"Wind over water; dissolve rigidity, regather hearts." },
  { n:60, zh:"节",   en:"Limitation",              mZh:"泽上有水，节以制度，不伤财不害民。", mEn:"Set measures like joints of bamboo — not bitter ones." },
  { n:61, zh:"中孚", en:"Inner Truth",             mZh:"泽上有风，信及豚鱼，诚可动物。",     mEn:"Inner truth moves even fishes and pigs." },
  { n:62, zh:"小过", en:"Small Excess",            mZh:"山上有雷，小事可过，大事勿越。",     mEn:"Small crossings only; keep the bird low." },
  { n:63, zh:"既济", en:"After Completion",        mZh:"水在火上，既济之后，慎终如始。",     mEn:"Done — yet guard the ending like a beginning." },
  { n:64, zh:"未济", en:"Before Completion",       mZh:"火在水上，未济将济，审慎辨物。",     mEn:"Not yet across; step as the fox on ice." }
];

FQ.hexByNumber = function (n) { return FQ.HEXAGRAMS[n - 1]; };

/* lines: array of 6 (bottom-up, 1 yang / 0 yin) → hexagram record */
FQ.hexFromLines = function (lines) {
  const idx = tri => FQ.TRIGRAMS.findIndex(t =>
    t.lines[0] === tri[0] && t.lines[1] === tri[1] && t.lines[2] === tri[2]);
  const lower = idx(lines.slice(0, 3));
  const upper = idx(lines.slice(3, 6));
  const n = FQ.KW_TABLE[lower][upper];
  return { n, lower: FQ.TRIGRAMS[lower], upper: FQ.TRIGRAMS[upper], ...FQ.hexByNumber(n) };
};
