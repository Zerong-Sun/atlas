/* 占途 · 千载行纪 2.0 — Chapter 1: Marco Polo (GDD §4/§9.5 route-network schema)
   Excerpts adapted from the public-domain Yule translation / 冯承钧译本意译.
   The single chain of 1.0 is now a network: nodes + edges, two forks,
   side nodes carrying companions & clue tokens. */
window.FQ = window.FQ || {};

FQ.JOURNEY_REGIONS = {
  chr:  { zh: "基督之境", en: "Christendom",     color: "#56779b", climate: { clear: 5, wind: 3, fog: 1.5, storm: 0.5 } },
  isl:  { zh: "新月之境", en: "Crescent Lands",  color: "#4d8a70", climate: { clear: 4.5, wind: 2, sand: 2.5, fog: 0.5, storm: 0.5 } },
  con:  { zh: "儒道之境", en: "Confucian Realm", color: "#a8794a", climate: { clear: 4, wind: 2, fog: 2, snow: 1.5, storm: 0.5 } },
  mazu: { zh: "妈祖之海", en: "Mazu's Sea",      color: "#4a8a94", climate: { clear: 4, wind: 2.5, storm: 2, fog: 1.5 } }
};

/* ---------- tradable goods & bag items (§4.2) ---------- */
FQ.GOODS = {
  silk:  { ic: "🧵", zh: "丝绸", en: "Silk" },
  spice: { ic: "🌶️", zh: "香料", en: "Spice" },
  glass: { ic: "🏺", zh: "琉璃", en: "Glass" }
};
/* buy/sell prices per market town — the spread is the trade game */
FQ.PRICES = {
  venice:   { glass: { b: 3, s: 2 }, silk: { b: 9, s: 7 },  spice: { b: 8, s: 6 } },
  tabriz:   { glass: { b: 5, s: 4 }, silk: { b: 6, s: 5 },  spice: { b: 6, s: 5 } },
  hormuz:   { glass: { b: 7, s: 6 }, silk: { b: 7, s: 6 },  spice: { b: 3, s: 2 } },
  hangzhou: { glass: { b: 9, s: 8 }, silk: { b: 3, s: 2 },  spice: { b: 7, s: 6 } },
  quanzhou: { glass: { b: 8, s: 7 }, silk: { b: 5, s: 4 },  spice: { b: 8, s: 7 } }
};
FQ.TOOLS = {
  compass:  { ic: "🧭", zh: "水手罗盘", en: "Mariner's Compass", cost: 6,
              dZh: "雾中迷途不再误期", dEn: "Fog costs you no days" },
  crystal:  { ic: "🔮", zh: "水晶球", en: "Crystal Orb", cost: 8,
              dZh: "预兆几乎必真", dEn: "Omens ring almost always true" },
  beads:    { ic: "📿", zh: "行脚念珠", en: "Pilgrim Beads", cost: 5,
              dZh: "庙宇祈福护佑翻倍", dEn: "Temple blessings doubled" }
};
FQ.TOKENS = {
  lampoil:   { ic: "🏺", zh: "圣墓灯油", en: "Sepulchre Oil" },
  astrolabe: { ic: "🌟", zh: "黄铜星盘", en: "Brass Astrolabe" },
  paiza:     { ic: "🪙", zh: "大汗金牌", en: "The Khan's Paiza" },
  mazucharm: { ic: "🧿", zh: "天妃香符", en: "Mazu Charm" }
};

/* ---------- 舟车 · transport (GDD §4.7) ----------
   Everything here is what a traveler of 1271 could actually have hired —
   plus the three beasts Marco Polo's own book insists were real. `need`
   gates the wondrous ones; dayMul/coin/risk reshape the leg. */
FQ.TRANSPORT = [
  { id: "foot",    ic: "🥾", kinds: ["land"],        dayMul: 1.45, coin: 0, risk: 0,
    zh: "徒步", en: "On foot",
    nZh: "自己的两条腿最可靠，也最慢。", nEn: "Your own two legs: the surest hire, and the slowest." },
  { id: "caravan", ic: "🐪", kinds: ["land"],        dayMul: 1,    coin: 2, risk: 0,
    zh: "驼队", en: "Camel caravan",
    nZh: "商队按站走，宿在驿栈，遇事有人商量。", nEn: "Stage by stage, caravanserai to caravanserai, with company to consult." },
  { id: "mule",    ic: "🐴", kinds: ["land"],        dayMul: 1.15, coin: 1, risk: -1,
    zh: "骡队", en: "Mule train",
    nZh: "山道上骡子比马稳，比驼灵便。", nEn: "On mountain tracks a mule outfoots both horse and camel." },
  { id: "yam",     ic: "🏇", kinds: ["land"],        dayMul: 0.55, coin: 4, risk: 1,
    zh: "驿马（站赤）", en: "Post-horse (the yam)", need: { token: "paiza" },
    nZh: "大汗的站赤：凭金牌换马，一日可行数百里。", nEn: "The Khan's yam: show the paiza, change horses, and eat the miles." },
  { id: "yak",     ic: "🐂", kinds: ["land"],        dayMul: 1.2,  coin: 2, risk: -2,
    zh: "牦牛队", en: "Yak train",
    nZh: "过雪线唯有牦牛不惧薄气。", nEn: "Above the snowline only the yak ignores the thin air." },
  { id: "galley",  ic: "🚣", kinds: ["sea"],         dayMul: 0.9,  coin: 3, risk: 1,
    zh: "桨帆船", en: "Galley",
    nZh: "地中海的桨帆船，无风也能走。", nEn: "A Mediterranean galley makes way even when the wind will not." },
  { id: "dhow",    ic: "⛵", kinds: ["sea"],         dayMul: 1,    coin: 2, risk: 0,
    zh: "缝合帆船", en: "Sewn dhow",
    nZh: "船板以椰索缝合，不用一枚铁钉——波罗说他不敢乘。", nEn: "Planks sewn with coir, not one iron nail — Polo says he would not sail in one." },
  { id: "junk",    ic: "🛳️", kinds: ["sea"],         dayMul: 0.8,  coin: 5, risk: -1,
    zh: "中国大舶", en: "Chinese junk",
    nZh: "四桅十二帆，舱分隔水，破一舱而不沉。", nEn: "Four masts, twelve sails, and bulkheads: one holed compartment will not sink her." },
  { id: "barge",   ic: "🛶", kinds: ["river"],       dayMul: 1.1,  coin: 1, risk: -2,
    zh: "运河漕船", en: "Canal barge",
    nZh: "御河上舟楫相衔，日夜不绝。", nEn: "On the Imperial canal the boats run bow to stern, day and night." },
  /* —— 志异之乘 · the beasts the age believed in —— */
  { id: "roc",     ic: "🦅", kinds: ["land", "sea"], dayMul: 0.25, coin: 0, risk: 4, fant: true,
    zh: "大鹏（鲁克鸟）", en: "The Roc", need: { favor: 3 },
    nZh: "波罗记：其翼展三十步，能攫象升空。以护佑换一程，快得不像人间事。",
    nEn: "Polo records wings thirty paces wide, able to lift an elephant. Trade blessings for a flight no mortal road can match." },
  { id: "griffin", ic: "🦁", kinds: ["land"],        dayMul: 0.4,  coin: 0, risk: 3, fant: true,
    zh: "狮鹫", en: "The Griffin", need: { dust: 2 },
    nZh: "半鹰半狮，守着北地的金矿。以星尘买它一程，它守约。",
    nEn: "Half eagle, half lion, warden of the northern gold. Buy passage in stardust and it keeps the bargain." },
  { id: "serpent", ic: "🐉", kinds: ["sea"],         dayMul: 0.5,  coin: 0, risk: 3, fant: true,
    zh: "海蛇曳舟", en: "Towed by the sea-serpent", need: { token: "mazucharm" },
    nZh: "海图边缘画的那条蛇。船家说，敬过天妃的人，它便曳你一程。",
    nEn: "The serpent drawn at the chart's edge. Sailors say it tows those who have honored the goddess." }
];
FQ.transportFor = kind => FQ.TRANSPORT.filter(t => t.kinds.includes(kind));

/* ---------- companions (§4.4) ---------- */
FQ.COMPANIONS = {
  tebrizi: {
    ic: "🧿", civ: "isl", zh: "星家帖必烈", en: "Tebrizi the Star-Reader",
    bioZh: "大不里士的老星家，读了一辈子星盘，说人的路早写在黄道上——但写的是波斯文。",
    bioEn: "An old astrologer of Tabriz who has read charts all his life; our roads, he says, are written on the zodiac — in Persian.",
    perkZh: "星骰仪式失败时，可免费重掷一次", perkEn: "One free re-roll whenever an astro-dice rite fails",
    biasZh: "宿命之眼", biasEn: "The fatalist eye"
  },
  lin: {
    ic: "⛵", civ: "mazu", zh: "船娘林三娘", en: "Lin Sanniang the Boatwoman",
    bioZh: "泉州船户人家的女儿，浪里生浪里长。她说天妃听得懂所有口音的祷告。",
    bioEn: "Daughter of a Quanzhou boat family, raised on the swells. Mazu, she says, understands prayers in every accent.",
    perkZh: "掷筊前三掷免耗，且预兆更准", perkEn: "First three jiaobei casts free, omens sharper",
    biasZh: "民俗之耳", biasEn: "The folklorist ear"
  }
};

/* ---------- chapter ---------- */
FQ.CHAPTERS = [{
  id: "marco",
  nameZh: "第一章 · 马可·波罗东行", nameEn: "Ch.1 · Marco Polo Goes East",
  taglineZh: "威尼斯 → 泉州，1271–1291", taglineEn: "Venice → Quanzhou, 1271–1291",
  startCoins: 12, parDays: 40, bagSlots: 9,
  startBag: [{ kind: "token", id: "lampoil" }],

  nodes: [
    { id: "venice", region: "chr", x: 78, y: 108, zh: "威尼斯", en: "Venice", type: "port",
      town: { market: ["glass", "silk", "spice"], teahouse: true },
      exZh: "一二七一年，我随父亲与叔父自威尼斯启航，行囊中带着教皇的书信与圣墓的灯油。",
      exEn: "In 1271 we set forth from Venice with my father and uncle, bearing the Pope's letters and oil from the Holy Sepulchre.",
      gate: { type: "tarotAny",
        pZh: "临行仪式：抽取一张守护之牌，愿它伴你万里。",
        pEn: "Rite of departure: draw a patron card to guard your road." } },

    { id: "acre", region: "chr", x: 195, y: 178, zh: "阿卡", en: "Acre", type: "town",
      town: { market: ["glass", "spice"], temple: "chr" },
      exZh: "在阿卡，教廷特使为我们补全了致大汗的文书。自此，前路一直向东。",
      exEn: "At Acre the Legate completed our letters to the Great Khan. From here, the road runs ever eastward.",
      gate: { type: "tarotLow",
        pZh: "圣殿骑士守着东行的关文：抽到大阿卡纳前十号（0–9），方能取信启程。",
        pEn: "The Templars hold the eastward pass: draw Major Arcana 0–9 to earn their trust.",
        edgeZh: "趁夜色缒城而出（−2 盘缠，+1 天，绕开关文）", edgeEn: "Slip the walls by night (−2 coin, +1 day, no papers)",
        edgeFx: [{ op: "coins", v: -2 }, { op: "days", v: 1 }] } },

    { id: "tabriz", region: "isl", x: 282, y: 112, zh: "大不里士", en: "Tabriz", type: "side",
      town: { market: ["silk", "glass"] },
      exZh: "大不里士的市集环城如带，波斯、印度与拂郎的商人皆来此易宝石。",
      exEn: "Tabriz is girdled by markets; merchants of Persia, India and the Franks trade gems within.",
      gate: { type: "diceFire",
        pZh: "老星家帖必烈占你此行：星辰骰得火象或风象，他便收拾星盘与你同路。",
        pEn: "Old Tebrizi casts your road: roll a Fire or Air sign, and he packs his astrolabe to join you.",
        edgeZh: "以一席长谈打动他（+1 天）", edgeEn: "Win him over with a long night's talk (+1 day)",
        edgeFx: [{ op: "days", v: 1 }, { op: "join", v: "tebrizi" }, { op: "token", v: "astrolabe" }],
        onPass: [{ op: "join", v: "tebrizi" }, { op: "token", v: "astrolabe" }, { op: "favor", civ: "isl", v: 1 }] } },

    { id: "hormuz", region: "isl", x: 330, y: 252, zh: "霍尔木兹", en: "Hormuz", type: "port",
      town: { market: ["spice", "silk", "glass"], temple: "isl", teahouse: true },
      exZh: "霍尔木兹热风如焚，商队长说，穿越克尔曼荒漠，须先观星择一个吉日。",
      exEn: "At Hormuz the wind burns like fire. The caravan master will not cross the Kerman waste until the stars name a day.",
      gate: { type: "diceElem",
        pZh: "随波斯商队观星：掷星辰骰，得土象或火象星座，方为宜行之日。",
        pEn: "Read the sky with the caravan: roll an Earth or Fire sign to fix the day of departure.",
        edgeZh: "不待吉日，强行启程（下一程风险 +2，+1 天）", edgeEn: "March without a chosen day (next road risk +2, +1 day)",
        edgeFx: [{ op: "days", v: 1 }, { op: "flag", v: "rushed" }] } },

    { id: "kerman", region: "isl", x: 408, y: 218, zh: "克尔曼荒漠", en: "Kerman Waste", type: "pass",
      exZh: "出克尔曼而东，行七日不见水草，沙丘之下常闻旧驼铃声。",
      exEn: "East of Kerman lie seven days without water or grass; beneath the dunes one hears old camel bells.",
      gate: { type: "diceHouse",
        pZh: "夜宿沙海，掷星辰骰问方位：落在自我、远方或事业之宫，方辨得出北极星。",
        pEn: "Camped in the sand-sea, roll for bearings: the houses of Self, Exploration or Career reveal the pole star.",
        edgeZh: "凭旧驼铃声摸黑前行（−2 盘缠雇听铃人）", edgeEn: "Follow the ghost-bells in the dark (−2 coin for a bell-listener)",
        edgeFx: [{ op: "coins", v: -2 }] } },

    { id: "herat", region: "isl", x: 412, y: 148, zh: "赫拉特商道", en: "Herat Road", type: "town",
      town: { teahouse: true, temple: "isl" },
      exZh: "商道绕经赫拉特，驿站相望，只是路远——商队宁多走十日，不涉沙海一步。",
      exEn: "The caravan road bends through Herat, station by station — traders will ride ten days more sooner than touch the sand-sea.",
      gate: { type: "coinYang",
        pZh: "驿站老掌柜请你掷一枚铜钱定行止：得阳面，商队今日便拔营。",
        pEn: "The old stationmaster has you toss a coin: heads, and the caravan strikes camp today.",
        edgeZh: "自雇小驼队先行（−3 盘缠）", edgeEn: "Hire your own small string of camels (−3 coin)",
        edgeFx: [{ op: "coins", v: -3 }] } },

    { id: "pamir", region: "con", x: 500, y: 150, zh: "帕米尔", en: "Pamir", type: "pass",
      exZh: "帕米尔高处号称世界屋脊，行十二日不见人烟，火焰因严寒而色淡，饭食难熟。",
      exEn: "On the Pamir, the roof of the world, we rode twelve days and saw no dwelling; fire burns pale in that cold, and food will scarcely cook.",
      gate: { type: "meihua",
        pZh: "以驼铃之数起一卦梅花：卦中见坎（水），便能寻得雪泉补给。",
        pEn: "Cast a Plum Blossom hexagram from the camel bells: if Water (☵) appears, you find a snow-fed spring.",
        edgeZh: "忍渴翻越垭口（+2 天）", edgeEn: "Cross the pass thirsty (+2 days)",
        edgeFx: [{ op: "days", v: 2 }] } },

    { id: "shangdu", region: "con", x: 618, y: 92, zh: "上都", en: "Shangdu", type: "court",
      exZh: "上都的大理石宫殿金碧辉煌，大汗于此消夏。谒见之前，礼官命先卜一卦以问吉凶。",
      exEn: "At Shangdu stands the Khan's marble palace, gilded and glorious. Before an audience, the master of rites requires a casting.",
      gate: { type: "ichingYang",
        pZh: "殿前起卦：掷铜钱六次，得阳爻三数以上，方合觐见之仪。",
        pEn: "Cast six lines before the hall: three or more yang lines befit an audience with the Khan.",
        edgeZh: "候至明日吉时再卜（+1 天，免耗重试）", edgeEn: "Wait for tomorrow's auspicious hour (+1 day, free retry)",
        edgeFx: [{ op: "days", v: 1 }, { op: "flag", v: "freeRetry" }] } },

    { id: "khanbaliq", region: "con", x: 668, y: 140, zh: "大都", en: "Khanbaliq", type: "court",
      exZh: "夜宴之上，大汗问起各国风物，又问昨夜之梦。满殿皆静，无人敢妄言。",
      exEn: "At the night banquet the Khan asked of far kingdoms — and then of last night's dreams. The hall fell silent.",
      gate: { type: "dreamChoice",
        pZh: "你昨夜梦见了什么？向大汗直言你的梦。",
        pEn: "What did you dream? Answer the Khan truly.",
        options: [
          { sym: "🕊️", zh: "梦见飞越群山", en: "Flying over mountains",
            rZh: "大汗抚掌：「志在高远，是远行人的梦。」赐盘缠三，并授金牌以驰驿路。", rEn: "The Khan smiles: 'A traveler's dream of high aims.' +3 provisions, and a paiza for the post roads.",
            fx: [{ op: "coins", v: 3 }, { op: "token", v: "paiza" }] },
          { sym: "🌊", zh: "梦见碧海无涯", en: "A boundless green sea",
            rZh: "大汗沉吟：「海路……你终将由海路归乡。」妈祖护佑加一，并授金牌。", rEn: "The Khan muses: 'The sea… you will go home by sea.' +1 Mazu blessing, and a paiza.",
            fx: [{ op: "favor", civ: "mazu", v: 1 }, { op: "token", v: "paiza" }] },
          { sym: "🏮", zh: "梦见故乡灯火", en: "The lamps of home",
            rZh: "大汗默然良久：「莫忘归途，亦莫负此行。」盘缠、护佑各加一，并授金牌。", rEn: "The Khan is long silent: 'Forget not the way home, nor waste the way here.' +1 each, and a paiza.",
            fx: [{ op: "coins", v: 1 }, { op: "favor", civ: "con", v: 1 }, { op: "token", v: "paiza" }] }
        ] } },

    { id: "hangzhou", region: "con", x: 718, y: 196, zh: "行在（杭州）", en: "Kinsay (Hangzhou)", type: "town",
      town: { market: ["silk", "glass", "spice"], teahouse: true, inn: true },
      exZh: "行在城中石桥一万二千座，商货之盛为平生所未见，湖上画舫彻夜有歌。",
      exEn: "In Kinsay stand twelve thousand bridges of stone; such trade I never saw, and song rings all night from the lake barges.",
      gate: { type: "lot",
        pZh: "西湖庙前求一签再登程：非「下下」即可行。",
        pEn: "Draw a temple lot by the West Lake: any grade but the lowest clears the road.",
        edgeZh: "多盘桓一日再求（+1 天，免耗重试）", edgeEn: "Linger a day and draw again (+1 day, free retry)",
        edgeFx: [{ op: "days", v: 1 }, { op: "flag", v: "freeRetry" }] } },

    { id: "quanzhou", region: "mazu", x: 700, y: 262, zh: "泉州（刺桐）", en: "Quanzhou (Zayton)", type: "port",
      town: { market: ["silk", "spice", "glass"], temple: "mazu", teahouse: true, inn: true },
      exZh: "刺桐港帆樯如林，胡椒之盛，百倍于亚历山大。船人说，离港须先在天妃宫掷得圣筊。",
      exEn: "At Zayton the masts stand thick as a forest; for one shipload of pepper at Alexandria, a hundred come here. No ship leaves before Sheng-jiao is cast at the Tianfei temple.",
      gate: { type: "jiaobei",
        pZh: "天妃宫前掷筊问海路平安：得圣筊方可登船。船娘林三娘代你先敬三炷香。",
        pEn: "Cast the moon blocks before Mazu for safe passage: Sheng-jiao grants boarding. Lin Sanniang lights three sticks of incense on your behalf.",
        onOpen: [{ op: "join", v: "lin" }],
        special: { when: "yin",
          zh: "连得阴筊——林三娘领你夜访旧祠，听守祠人讲沉珠旧事。（获得天妃香符，此后掷筊免耗）",
          en: "Twice Yin-jiao — Lin leads you by night to the old shrine, where the keeper tells of a pearl given to the waves. (Mazu Charm gained; casts now free)",
          fx: [{ op: "token", v: "mazucharm" }, { op: "flag", v: "freeRetry" }, { op: "favor", civ: "mazu", v: 1 }] } } },

    { id: "voyage", region: "mazu", x: 598, y: 332, zh: "归航 · 断案", en: "The Voyage Home · Case", type: "case",
      exZh: "一二九一年冬，我们奉命以十四艘四桅巨舶，护送阔阔真公主浮海西行，远嫁波斯。",
      exEn: "In the winter of 1291 we were charged to escort the princess Kokochin over the sea to Persia, with fourteen great four-masted ships.",
      gate: { type: "case" } }
  ],

  /* ---------- edges: the route network (§4.1) ---------- */
  edges: [
    { from: "venice", to: "acre", kind: "sea", days: 4, risk: 1 },
    { from: "acre", to: "tabriz", kind: "land", days: 3, risk: 1, forkId: "persia" },
    { from: "tabriz", to: "hormuz", kind: "land", days: 4, risk: 1 },
    { from: "acre", to: "hormuz", kind: "land", days: 6, risk: 2, forkId: "persia" },
    { from: "hormuz", to: "kerman", kind: "land", days: 3, risk: 3, wx: "sand", forkId: "desert" },
    { from: "kerman", to: "pamir", kind: "land", days: 4, risk: 2, wx: "snow" },
    { from: "hormuz", to: "herat", kind: "land", days: 5, risk: 1, forkId: "desert" },
    { from: "herat", to: "pamir", kind: "land", days: 4, risk: 1 },
    { from: "pamir", to: "shangdu", kind: "land", days: 6, risk: 2, wx: "snow" },
    { from: "shangdu", to: "khanbaliq", kind: "land", days: 2, risk: 0 },
    { from: "khanbaliq", to: "quanzhou", kind: "land", days: 6, risk: 2, forkId: "china" },
    { from: "khanbaliq", to: "hangzhou", kind: "river", days: 5, risk: 0, forkId: "china" },
    { from: "hangzhou", to: "quanzhou", kind: "land", days: 3, risk: 0 },
    { from: "quanzhou", to: "voyage", kind: "sea", days: 2, risk: 1, wx: "storm" }
  ],

  /* ---------- encounter pool (§4.3) — `when` filters, ≥1 divination choice ---------- */
  encounters: [
    { id: "lost", w: 99, when: { weather: ["fog"] }, ic: "🌫️",
      zh: "雾失古道", en: "Lost in the Fog",
      tZh: "浓雾抹去了道路与地平线，驼队在原地打转，人人噤声。",
      tEn: "Fog erases both road and horizon; the caravan circles itself in silence.",
      choices: [
        { zh: "原地扎营，等雾散去（+1 天）", en: "Camp and wait it out (+1 day)", fx: [{ op: "days", v: 1 }],
          rZh: "雾在次日清晨散尽，路重新浮现。", rEn: "By morning the fog thins and the road returns." },
        { zh: "起一爻问方向", en: "Cast a line for bearings", ritual: { method: "coin1" },
          pass: { fx: [], rZh: "阳爻朝东——半个时辰后，前锋望见了熟悉的烽燧。", rEn: "Yang points east — within the hour the vanguard sights a familiar beacon." },
          fail: { fx: [{ op: "days", v: 2 }], rZh: "阴爻沉沉，你们在白雾里多绕了两日。", rEn: "The yin line sinks; two days are lost inside the whiteness." } },
        { zh: "取出罗盘引路", en: "Bring out the compass", needTool: "compass", fx: [],
          rZh: "磁针稳稳指北，商队长看你的眼神多了三分敬意。", rEn: "The needle holds true north; the caravan master eyes you with new respect." }
      ] },
    { id: "seastorm", w: 99, when: { weather: ["storm"], kinds: ["sea"] }, ic: "⛈️",
      zh: "骤起风暴", en: "Storm at Sea",
      tZh: "乌云压桅，浪头一个高过一个，水手们望向你——望向任何能给答案的人。",
      tEn: "Cloud crushes the mast and each wave tops the last; the sailors look to you — to anyone with an answer.",
      choices: [
        { zh: "收帆下碇，避过风头（+2 天）", en: "Strike sail and ride it out (+2 days)", fx: [{ op: "days", v: 2 }],
          rZh: "两日后海面复平，只是耽误了行程。", rEn: "Two days later the sea lies flat again; only time was lost." },
        { zh: "掷筊问天妃", en: "Cast the blocks for Mazu", ritual: { method: "jiaobei" },
          pass: { fx: [{ op: "favor", civ: "mazu", v: 1 }], rZh: "圣筊！舵手大喝转舵，船贴着风暴边缘滑了过去。", rEn: "Sheng-jiao! The helmsman hauls the tiller and the ship slides along the storm's rim." },
          fail: { fx: [{ op: "days", v: 1 }], rZh: "笑筊——天妃莞尔。风暴让路让得慢了些。", rEn: "Xiao-jiao — Mazu only smiles. The storm yields, but slowly." },
          special: { when: "yin", fx: [{ op: "coins", v: 3 }, { op: "days", v: 1 }],
            zh: "阴筊。船被吹进无名小湾——湾底沉船里露出半箱香料。", en: "Yin-jiao. Blown into a nameless cove — a sunken wreck yields half a chest of spice." } }
      ] },
    { id: "sandstorm", w: 99, when: { weather: ["sand"] }, ic: "🌪️",
      zh: "沙暴蔽日", en: "Sandstorm",
      tZh: "天色由金转褐，沙墙自西南压来，驼群卧倒成一线。",
      tEn: "Gold air turns brown; a wall of sand rolls in from the southwest as the camels drop into a line.",
      choices: [
        { zh: "蜷伏驼侧硬熬（+1 天）", en: "Shelter against the camels (+1 day)", fx: [{ op: "days", v: 1 }],
          rZh: "沙暴过后，人人牙缝里都是撒马尔罕。", rEn: "When it passes, everyone's teeth are full of Samarkand." },
        { zh: "掷星辰骰寻废驿", en: "Roll the dice for a ruined station", ritual: { method: "diceElem" },
          pass: { fx: [{ op: "coins", v: 2 }], rZh: "土象！半埋的驿站挡住了风，墙角还有前人留下的水囊。", rEn: "Earth! A half-buried station breaks the wind — with a water-skin left in the corner." },
          fail: { fx: [{ op: "days", v: 1 }, { op: "coins", v: -1 }], rZh: "骰象无凭，你们顶着风损失了一袋口粮。", rEn: "The dice give nothing; a sack of rations is lost to the wind." } }
      ] },
    { id: "bandits", w: 3, when: { kinds: ["land"], minRisk: 2 }, ic: "🐎",
      zh: "马贼盯梢", en: "Riders on the Ridge",
      tZh: "山脊上有一队骑手随行了半日，不远不近，像在称你们的分量。",
      tEn: "Riders pace you along the ridge for half a day — never nearer, never farther, as if weighing you.",
      choices: [
        { zh: "破财免灾（−3 盘缠）", en: "Pay them off (−3 coin)", fx: [{ op: "coins", v: -3 }],
          rZh: "首领掂了掂钱袋，拨马而去。", rEn: "Their chief weighs the purse in his palm, then wheels away." },
        { zh: "起一爻问虚实", en: "Cast a line: bluff or blade?", ritual: { method: "coin1" },
          pass: { fx: [], rZh: "阳爻——虚张声势而已。你们列队而行，骑手们悻悻散去。", rEn: "Yang — a bluff. You ride in close order and the riders melt away." },
          fail: { fx: [{ op: "coins", v: -4 }], rZh: "阴爻不吉。入夜果然失了驮包一件。", rEn: "The yin line bodes ill; a pack goes missing in the night." } },
        { zh: "绕远路避开（+2 天）", en: "Swing wide around (+2 days)", fx: [{ op: "days", v: 2 }],
          rZh: "多走两日，平安无事。", rEn: "Two days longer, and nothing worse." }
      ] },
    { id: "pilgrims", w: 2.4, when: { regions: ["chr", "isl"] }, ic: "🚶",
      zh: "朝圣者同行", en: "Pilgrims on the Road",
      tZh: "一队朝圣者与你们同向而行，晚间围着篝火，请「东方来的占者」看一看前路。",
      tEn: "A band of pilgrims falls in with you; by the fire they ask the 'diviner from the East' to read their road.",
      choices: [
        { zh: "抽一张牌为其解惑", en: "Draw a card for them", ritual: { method: "tarot1" },
          pass: { fx: [{ op: "coins", v: 2 }, { op: "favor", civ: "chr", v: 1 }],
            rZh: "正位好牌。他们千恩万谢，硬塞给你一小袋银币。", rEn: "Upright and kind. They press a small purse on you with many blessings." },
          fail: { fx: [{ op: "favor", civ: "chr", v: 1 }],
            rZh: "逆位。你如实相告，反而赢得敬重——「诚实的占者比吉兆难得」。", rEn: "Reversed. You tell them truly, and win more respect — 'an honest diviner is rarer than a good omen.'" } },
        { zh: "同行三日，听他们唱经（+1 天）", en: "Walk with them three days (+1 day)", fx: [{ op: "days", v: 1 }, { op: "favor", civ: "chr", v: 1 }],
          rZh: "圣歌在山谷里回响，路好像短了。", rEn: "Their hymns echo down the valley; the road feels shorter." },
        { zh: "婉言别过", en: "Part ways politely", fx: [],
          rZh: "各走各路，各有各的圣地。", rEn: "Each to their own road, each to their own shrine." }
      ] },
    { id: "traders", w: 2.2, when: { regions: ["isl", "con"], kinds: ["land", "river"] }, ic: "🐪",
      zh: "对向商队", en: "A Caravan Westbound",
      tZh: "对面来了一支西行商队，领队愿以随身货物相易，还打听东边的关税。",
      tEn: "A westbound caravan halts to trade from the saddle, asking after the tolls ahead.",
      choices: [
        { zh: "买入一担香料（−4 盘缠）", en: "Buy a load of spice (−4 coin)", needCoins: 4,
          fx: [{ op: "coins", v: -4 }, { op: "goods", id: "spice", v: 1 }],
          rZh: "香料入囊，东边的港口会给出好价钱。", rEn: "Spice in the bag — the eastern ports will pay well." },
        { zh: "卖出一件货物", en: "Sell one of your goods", needGoods: true, fx: [{ op: "sellBest" }],
          rZh: "银钱过手，两队人马互道平安。", rEn: "Coin changes hands; both trains wish each other safe roads." },
        { zh: "只交换消息", en: "Trade news only", fx: [{ op: "forecast" }],
          rZh: "领队指着天边：「往东三日有风。」——你记下了。", rEn: "The leader points east: 'Wind, three days out.' You note it down." }
      ] },
    { id: "ferry", w: 2, when: { regions: ["con"], kinds: ["land", "river"] }, ic: "⛴️",
      zh: "渡口摆渡", en: "The River Ferry",
      tZh: "渡船老大蹲在船头抽烟：「一位一文，驼算三位。」",
      tEn: "The ferryman squats at the bow with his pipe: 'One coin a head; a camel counts as three.'",
      choices: [
        { zh: "付渡资（−1 盘缠）", en: "Pay the fare (−1 coin)", fx: [{ op: "coins", v: -1 }],
          rZh: "船桨吱呀，一炷香后已是对岸。", rEn: "Oars creak; one incense-stick later you stand on the far bank." },
        { zh: "帮工换渡（+1 天）", en: "Work your passage (+1 day)", fx: [{ op: "days", v: 1 }],
          rZh: "你们帮着摆了一日渡，老大分了你们两条鱼。", rEn: "A day at the oars earns the crossing — and two fish from the ferryman." }
      ] },
    { id: "snowpass", w: 99, when: { weather: ["snow"] }, ic: "❄️",
      zh: "雪封垭口", en: "Snowbound Pass",
      tZh: "夜里落了大雪，垭口只剩一线白。向导说他认得另一条路，但要价不菲。",
      tEn: "Snow fell all night; the pass is a single white seam. The guide knows another way — at a price.",
      choices: [
        { zh: "雇向导绕行（−2 盘缠）", en: "Pay the guide (−2 coin)", fx: [{ op: "coins", v: -2 }],
          rZh: "小路贴着背风崖，一日便过了山。", rEn: "His path hugs the lee cliff; the mountain is behind you in a day." },
        { zh: "梅花起卦寻径", en: "Plum Blossom for a path", ritual: { method: "meihuaWater" },
          pass: { fx: [], rZh: "卦中见坎！雪下有溪，沿溪谷正好穿过垭口。", rEn: "Water in the cast! A stream runs beneath the snow, and its valley threads the pass." },
          fail: { fx: [{ op: "days", v: 2 }], rZh: "卦不见水。只得等雪松动，误了两日。", rEn: "No water in the lines; you wait two days for the snow to settle." } }
      ] },
    { id: "teafire", w: 1.8, when: { regions: ["con"] }, ic: "🍵",
      zh: "野店茶话", en: "Tea at a Wayside Inn",
      tZh: "赶脚的、贩茶的、说书的挤在一间野店里，火塘上吊着一壶浓茶。",
      tEn: "Muleteers, tea-peddlers and a storyteller crowd one wayside inn; a kettle of dark tea swings above the fire.",
      choices: [
        { zh: "请一圈茶，听路上风声（−1 盘缠）", en: "Stand a round and listen (−1 coin)", fx: [{ op: "coins", v: -1 }, { op: "forecast" }],
          rZh: "说书人压低嗓子，把前路的天气与盘查说了个遍。", rEn: "The storyteller lowers his voice and maps the weather and checkpoints ahead." },
        { zh: "讨碗白水赶路", en: "A bowl of water, then on", fx: [],
          rZh: "茶香留在身后，路还长。", rEn: "The tea's fragrance stays behind; the road is long." }
      ] },
    { id: "wayshrine", w: 1.6, when: {}, ic: "🛕",
      zh: "路旁小庙", en: "A Wayside Shrine",
      tZh: "岔路口立着一座小庙，看不清供的是哪方神明，香炉里积着厚厚的灰。",
      tEn: "At the fork stands a small shrine to a god you cannot name; ash lies deep in its censer.",
      choices: [
        { zh: "上一炷香（−1 盘缠）", en: "Offer incense (−1 coin)", fx: [{ op: "coins", v: -1 }, { op: "favorLocal", v: 1 }],
          rZh: "香烟笔直升起。不管是哪位神明，祂看见你了。", rEn: "The smoke rises straight. Whoever dwells here has seen you." },
        { zh: "合十而过", en: "Bow and pass on", fx: [],
          rZh: "你在心里道了声叨扰。", rEn: "You beg pardon silently and move on." }
      ] },
    { id: "digger", w: 1.5, when: { regions: ["isl", "con"], kinds: ["land"] }, ic: "⛏️",
      zh: "掘宝人", en: "The Relic Digger",
      tZh: "一个掘宝人拦住商队，摊开半张残破的藏宝图：「差一个会看天意的人。」",
      tEn: "A digger bars the road with half a torn map: 'All I lack is someone who can read heaven's will.'",
      choices: [
        { zh: "以星骰合伙问宝", en: "Partner up — roll the dice", ritual: { method: "diceAny" },
          pass: { fx: [{ op: "coins", v: 5 }], rZh: "土中果有一瓮旧钱！掘宝人如约分你一半。", rEn: "A jar of old coin in the earth! He splits it as promised." },
          fail: { fx: [{ op: "days", v: 1 }, { op: "coins", v: -1 }], rZh: "挖了一日只见瓦砾。掘宝人讪讪请你吃了顿饼。", rEn: "A day's digging yields rubble; he buys you flatbread by way of apology." } },
        { zh: "不趟浑水", en: "Leave treasure to the dead", fx: [],
          rZh: "藏宝图的破洞正好破在标记处——你觉得自己赚了。", rEn: "The map's tear runs right through the X. You feel richer already." }
      ] },
    { id: "fireflies", w: 1, when: { weather: ["clear"] }, ic: "✨",
      zh: "萤河夜歇", en: "A River of Fireflies",
      tZh: "夜里宿营，草甸忽然亮起一条流动的萤河，连最累的脚夫都坐起来看。",
      tEn: "At the night camp the meadow kindles into a drifting river of fireflies; even the weariest porter sits up.",
      choices: [
        { zh: "静静看完这一场", en: "Watch until the last light", fx: [{ op: "dust", v: 1 }],
          rZh: "有那么一刻，你觉得整条路都是值得的。", rEn: "For one moment, the whole road feels worth it." },
        { zh: "早些歇息", en: "Turn in early", fx: [],
          rZh: "梦里也有微光明灭。", rEn: "Even in sleep, small lights blink on." }
      ] },
    { id: "lin-event", w: 99, when: { flags: ["linAboard"], kinds: ["sea"] }, ic: "⛵",
      zh: "三娘的家书", en: "Sanniang's Letter",
      tZh: "林三娘在船尾折了一只纸船，放进海里。「替我捎话给阿爹——就说这次的船很稳。」",
      tEn: "At the stern Lin folds a paper boat and sets it on the sea. 'Carry word to my father — tell him this ship rides steady.'",
      choices: [
        { zh: "陪她看纸船漂远", en: "Watch the paper boat drift", fx: [{ op: "cfavor", who: "lin", v: 1 }],
          rZh: "纸船一直没沉。她说这是天妃收信了。", rEn: "The boat never sinks. Mazu, she says, has taken the letter." },
        { zh: "为纸船掷一次筊", en: "Cast the blocks for the boat", ritual: { method: "jiaobei" },
          pass: { fx: [{ op: "cfavor", who: "lin", v: 2 }], rZh: "圣筊落地，三娘笑出了声：「阿爹收到了。」", rEn: "Sheng-jiao — Lin laughs aloud: 'He has it.'" },
          fail: { fx: [{ op: "cfavor", who: "lin", v: 1 }], rZh: "笑筊。「天妃说下次寄点鱼干。」", rEn: "Xiao-jiao. 'Mazu says send dried fish next time.'" } }
      ] },
    { id: "teb-event", w: 99, when: { flags: ["tebAboard"], regions: ["con"], kinds: ["land"] }, ic: "🌟",
      zh: "星家的乡愁", en: "The Star-Reader's Homesickness",
      tZh: "帖必烈夜里独坐，把星盘转了又转。「东方的星图，和我家乡的对不上了。」",
      tEn: "Tebrizi sits apart at night, turning his astrolabe. 'The eastern sky no longer matches the charts of home.'",
      choices: [
        { zh: "陪他重画一张星图", en: "Help him draw a new chart", fx: [{ op: "cfavor", who: "tebrizi", v: 2 }, { op: "days", v: 1 }],
          rZh: "天亮时，新旧两张星图叠在一起——「原来路走得够远，天也会换。」", rEn: "By dawn two charts lie one atop the other. 'Walk far enough,' he says, 'and even heaven changes.'" },
        { zh: "掷星骰宽慰他", en: "Roll the dice to comfort him", ritual: { method: "diceAny" },
          pass: { fx: [{ op: "cfavor", who: "tebrizi", v: 1 }], rZh: "木星入远方之宫。「也罢——远行人认的是同一颗木星。」", rEn: "Jupiter in the house of Exploration. 'Well then — travelers share one Jupiter.'" },
          fail: { fx: [{ op: "cfavor", who: "tebrizi", v: 1 }], rZh: "土星当头。他反而笑了：「连星星都催我认真赶路。」", rEn: "Saturn overhead. He laughs at last: 'Even the stars tell me to mind the road.'" } }
      ] }
  ],

  /* ===== 章末断案 2.0: 沉波之珠 (GDD §6 — tagged clues, follow-ups, testimony) ===== */
  case: {
    titleZh: "沉波之珠", titleEn: "The Pearl Beneath the Waves",
    introZh: "船队驶出泉州七日，遭遇大风。风息之后，献给伊利汗的贡珠竟从封匣中消失了。匣上封漆完好，钥匙只在公主的女官与船队主事手中。副使指认舵手，舵手闭口不言，公主彻夜未眠。你受命查明真相——可借三种占法问事，每法可追问一次。",
    introEn: "Seven days out of Quanzhou, a great storm struck. When it passed, the tribute pearl for the Ilkhan was gone from its sealed casket — seal unbroken, keys held only by the princess's lady and the fleet steward. The envoy accuses the helmsman; the helmsman will not speak; the princess has not slept. Consult three traditions — and press each one once further.",
    /* the envoy's accusation is a free opening clue — enough rope to be wrong with */
    freeClue: { ic: "🗣️", zh: "副使的指控", en: "The Envoy's Accusation",
      cZh: "波斯副使咬定：「除了掌舵的老江湖，谁有胆子动贡匣？他惯走这条水路，知道哪里能销赃！」",
      cEn: "The Persian envoy insists: 'Who but that old river-hand would dare the casket? He knows this route — and where such things are sold!'",
      tags: ["畏惧", "船上"] },
    methods: [
      { id: "tarot", ic: "🔮", tags: ["自愿", "献祭"],
        cZh: "塔罗现「倒吊人」正位：一次自愿的牺牲、一次倒转的奉献——有人为了更大的东西，交出了贵重之物。",
        cEn: "The Tarot shows the Hanged Man upright: a willing sacrifice, an offering inverted — someone gave up a treasure for something greater.",
        fuZh: "追问「是谁的手？」——再抽得「女祭司」：一双沉默的、掌着方向的手。",
        fuEn: "Pressing 'whose hand?' draws the High Priestess: silent hands, hands that hold a course.",
        fuTags: ["舵手"] },
      { id: "iching", ic: "☯", tags: ["海中", "人心"],
        cZh: "起卦得「涣」：风行水上，凝滞消散。卦辞不指向贪取，而指向「散之于水，以聚人心」。",
        cEn: "The cast yields Huan, Dispersion: wind over water. It speaks not of theft, but of 'giving to the water, to regather the hearts of men.'",
        fuZh: "追问变爻，之卦为「节」：以制度自守——此人行事有分寸，非为私利。",
        fuEn: "The moving line yields Jie, Limitation: measured conduct — this was no private gain.",
        fuTags: ["非恶"] },
      { id: "jiaobei", ic: "🌗", tags: ["海中", "非恶"],
        cZh: "你代舵手问天妃：「珠可还在船上？」——连得两个阴筊。再问「珠在海中？」——圣筊落地。",
        cEn: "You ask Mazu for the helmsman: 'Is the pearl aboard?' — twice Yin-jiao. 'Is it in the sea?' — Sheng-jiao falls.",
        fuZh: "追问「投珠之人可是掌舵人？」——圣筊应声而落，干脆利落。",
        fuEn: "Pressing 'was it the helmsman's hand?' — Sheng-jiao falls at once, clean and sure.",
        fuTags: ["舵手"] },
      { id: "astrodice", ic: "🎲", tags: ["守密", "人心"],
        cZh: "星辰骰掷出：月亮 · 天蝎 · 第十二宫——隐匿、深水、不可言说之事。有人在守一个秘密，但未必是恶意。",
        cEn: "The dice fall: Moon, Scorpio, the Twelfth House — hiddenness, deep water, the unspeakable. Someone keeps a secret, not surely a wicked one.",
        fuZh: "追问动机，再掷得金星入第十二宫：这秘密是出于爱护，为了保全谁。",
        fuEn: "Pressing for motive: Venus in the Twelfth — a secret kept out of love, to shelter someone.",
        fuTags: ["自愿"] },
      { id: "dream", ic: "🌙", tags: ["海中", "献祭"],
        cZh: "公主说出她风暴当夜的梦：一颗明珠沉入碧波，化作一盏灯，风浪随之平息。",
        cEn: "The princess tells her dream from the night of the storm: a pearl sank into green waves, became a lantern, and the sea grew calm.",
        fuZh: "追问灯的模样——「是船灯。挂在舵楼上的那一盏。」",
        fuEn: "Pressing about the lantern — 'A ship's lantern. The one that hangs at the steering house.'",
        fuTags: ["舵手"] }
    ],
    /* companion testimony (§4.4 证词偏见 — same facts, opposite readings) */
    testimony: {
      tebrizi: { needFavor: 2, ic: "🧿", tags: ["海中", "守密"],
        cZh: "帖必烈观星后断言：「珠入海宫，此乃天数。土星临水宿——它注定要沉，谁的手都只是天意的手套。」",
        cEn: "Tebrizi reads the sky and rules: 'The pearl entered the sea-palace by decree. Saturn stood in the water-mansions — it was fated to sink; any hand was only heaven's glove.'" },
      lin: { needFavor: 2, ic: "⛵", tags: ["献祭", "人心"],
        cZh: "林三娘打听了水手舱：「风暴最凶那夜，有人看见舵楼供了三炷香。船家献重宝赎全船，是老规矩——只是没人敢说破。」",
        cEn: "Lin asks around the crew berths: 'At the storm's worst, incense burned in the steering house. A shipmaster ransoming all hands with his dearest treasure — that is the old custom no one names aloud.'" }
    },
    options: [
      { id: "envoy", req: ["畏惧", "船上"],
        zh: "波斯副使畏惧海盗，私藏了贡珠", en: "The Persian envoy hid the pearl, fearing pirates",
        grade: "下下", gradeEn: "Ill", score: 0,
        endZh: "副使被搜身问罪，一无所获。使团颜面尽失，行程在猜忌中继续。抵达波斯后，珠终未寻回，你的名字被史官轻轻略过。",
        endEn: "The envoy is searched and shamed; nothing is found. The mission sails on in suspicion. The pearl is never found, and the chroniclers pass over your name in silence." },
      { id: "helmsman", req: ["舵手", "献祭", "自愿", "海中"],
        zh: "老舵手在风暴之夜，将珠献给了妈祖", en: "The helmsman offered the pearl to Mazu in the storm",
        grade: "上上", gradeEn: "Supreme", score: 3,
        endZh: "舵手终于开口：巨浪压顶之夜，他启开封匣暗扣，以船上最贵重之物投海祭天妃——「船上三百条性命，重过一颗珠。」公主闻之，取出自己的东珠补入贡匣：「以此珠谢那盏灯。」船队安然抵达波斯。史载：贡礼无缺，海路无恙。",
        endEn: "The helmsman speaks at last: at the storm's height he opened the casket's hidden clasp and gave the ship's greatest treasure to Mazu — 'Three hundred lives weigh more than one pearl.' The princess places her own pearl in the casket: 'For the lantern in the waves.' The fleet reaches Persia; the chronicles record the tribute complete, the sea-road safe." },
      { id: "clerk", req: ["守密", "人心"],
        zh: "贡珠从未上船——泉州港吏调了包", en: "The pearl never sailed — a Quanzhou clerk switched it",
        grade: "中平", gradeEn: "Even", score: 1,
        endZh: "文书发回泉州彻查，一名港吏含冤下狱。半年后真相大白时，船队早已远去。你查案的方向不算全错——珠确实不在船上——只是错认了让它离开的手。",
        endEn: "Word is sent back to Quanzhou; a clerk is wrongly jailed. The truth surfaces half a year later, long after the fleet has gone. You were half right — the pearl was not aboard — but wrong about the hand that let it go." }
    ]
  }
}];

/* ============================================================
   Chapter 2 · Ibn Battuta's Rihla — the Islamic eye on the same world.
   LOCKED interface chapter (schema-complete skeleton per GDD §9.5):
   route, regions and gate types are sketched so the content pipeline
   can fill it without engine changes. Both travelogues end at Zayton —
   the two books meet at the same harbor, seen through different eyes. */
FQ.CHAPTERS.push({
  id: "ibn", locked: true,
  nameZh: "第二章 · 白图泰万里行纪", nameEn: "Ch.2 · Ibn Battuta's Rihla",
  taglineZh: "丹吉尔 → 泉州，1325–1349", taglineEn: "Tangier → Quanzhou, 1325–1349",
  teaseZh: "以新月之眼重看同一个世界：晨祷的钟点代替暮钟，观星台代替圣殿骑士的关文——直到刺桐港，两本游记在同一座码头相遇。",
  teaseEn: "The same world through the crescent's eye: dawn prayers for vespers, observatories for Templar passes — until at Zayton, two travelogues meet on one quay.",
  startCoins: 12, parDays: 46, bagSlots: 9,
  startBag: [{ kind: "token", id: "lampoil" }],
  nodes: [
    { id: "ib-tangier", region: "isl", x: 60, y: 150, zh: "丹吉尔", en: "Tangier", type: "port",
      exZh: "一三二五年，我辞别双亲，独自离开丹吉尔，此去朝觐，路远得连鸟也要歇三次。",
      exEn: "In 1325 I left Tangier and my parents, alone, bound for the pilgrimage — a road so long the birds rest thrice.",
      gate: { type: "diceElem", pZh: "出行前观星择日。", pEn: "Read the stars before setting out." } },
    { id: "ib-cairo", region: "isl", x: 200, y: 200, zh: "开罗", en: "Cairo", type: "town",
      town: { market: ["spice", "glass"], temple: "isl", teahouse: true },
      exZh: "开罗为诸城之母，尼罗河上千帆如叶。", exEn: "Cairo, mother of cities; a thousand sails on the Nile like leaves.",
      gate: { type: "diceHouse", pZh: "爱资哈尔的星家为你定行止。", pEn: "Al-Azhar's astronomers fix your going." } },
    { id: "ib-mecca", region: "isl", x: 320, y: 250, zh: "麦加", en: "Mecca", type: "shrine",
      exZh: "朝觐既毕，心却指向更远的东方。", exEn: "The pilgrimage done, the heart pointed farther east.",
      gate: { type: "dreamChoice", pZh: "圣寺一夜，梦会指路（伊本·西林解梦传统）。", pEn: "A night's dream points the road (the Ibn Sirin tradition).", options: [] } },
    { id: "ib-delhi", region: "con", x: 500, y: 190, zh: "德里", en: "Delhi", type: "court",
      exZh: "苏丹以重金留客，客却夜夜梦见海。", exEn: "The Sultan pays gold to keep his guest; the guest dreams nightly of the sea.",
      gate: { type: "coinYang", pZh: "宫廷去留，掷币问心。", pEn: "Stay or sail — toss and ask your heart." } },
    { id: "ib-calicut", region: "mazu", x: 560, y: 300, zh: "卡利卡特", en: "Calicut", type: "port",
      exZh: "中国大船十二帆，桅顶挂着看不懂的旗。", exEn: "Chinese junks of twelve sails, flags at the mast I could not read.",
      gate: { type: "jiaobei", pZh: "登中国船前，随船民问一问海神。", pEn: "Before boarding, ask the sea-god with the crew." } },
    { id: "ib-quanzhou", region: "mazu", x: 700, y: 262, zh: "泉州（刺桐）", en: "Quanzhou (Zayton)", type: "case",
      exZh: "刺桐港中，有威尼斯人留下的账本残页——两本游记，原来到过同一座码头。",
      exEn: "In Zayton harbor, a torn Venetian ledger page — two travelogues, it turns out, touched the same quay.",
      gate: { type: "case" } }
  ],
  edges: [
    { from: "ib-tangier", to: "ib-cairo", kind: "land", days: 6, risk: 1 },
    { from: "ib-cairo", to: "ib-mecca", kind: "land", days: 5, risk: 1, forkId: "hejaz" },
    { from: "ib-cairo", to: "ib-delhi", kind: "sea", days: 9, risk: 2, forkId: "hejaz" },
    { from: "ib-mecca", to: "ib-delhi", kind: "land", days: 8, risk: 2 },
    { from: "ib-delhi", to: "ib-calicut", kind: "land", days: 5, risk: 1 },
    { from: "ib-calicut", to: "ib-quanzhou", kind: "sea", days: 10, risk: 2, wx: "storm" }
  ],
  encounters: [],
  case: { titleZh: "刺桐再会", titleEn: "Reunion at Zayton",
    introZh: "（第二章内容由游记管线填充——本章为接口占位。）",
    introEn: "(Chapter 2 content arrives via the travelogue pipeline — this is the interface skeleton.)",
    methods: [], options: [] }
});

/* journal sentence templates (§4.6) — {vars} filled by journey.js */
FQ.JOURNAL_T = {
  depart: { zh: "第{d}日，自{a}启程，取道{k}往{b}。", en: "Day {d}. We left {a}, taking the {k} road toward {b}." },
  wx: {
    clear: { zh: "是日天青。", en: "The sky held clear." },
    wind:  { zh: "顺风，帆饱如弦。", en: "A tailwind filled every sail and stride." },
    fog:   { zh: "大雾终日不散。", en: "Fog sat on the road all day." },
    storm: { zh: "途中遇风暴。", en: "A storm found us on the way." },
    sand:  { zh: "沙暴自西南来。", en: "Sand came in from the southwest." },
    snow:  { zh: "雪落无声。", en: "Snow fell without a sound." }
  },
  arrive: { zh: "行{n}日，抵{b}。", en: "After {n} days we reached {b}." },
  gatePass: { zh: "于{b}以{m}问吉，得允而行。", en: "At {b} the {m} rite gave its blessing, and we passed." },
  gateEdge: { zh: "{b}之仪未谐，遂另辟蹊径。", en: "The rite at {b} withheld its favor; we found another way." },
  camp:  { zh: "同行者言笑，途中诸事记于此页。", en: "Company and chance along the way are set down on this page." }
};
