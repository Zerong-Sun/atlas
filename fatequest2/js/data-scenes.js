/* 场景本 · the scene book — who keeps each door, and what they say.
   Town buildings and arrivals stop being buttons on a card and become
   short exchanges with someone who lives there. */
window.FQ = window.FQ || {};

/* backdrop id per node (assets/art/scene-<id>.webp) */
FQ.SCENE_BG = {
  venice: "venice-quay", acre: "acre-wall", tabriz: "tabriz-bazaar",
  hormuz: "hormuz-port", kerman: "kerman-dunes", herat: "herat-road",
  pamir: "pamir-pass", shangdu: "shangdu-palace", khanbaliq: "khanbaliq-hall",
  hangzhou: "hangzhou-lake", quanzhou: "quanzhou-harbor", voyage: "voyage-sea"
};
FQ.SCENE_BG_REGION = { chr: "region-chr", isl: "region-isl", con: "region-con", mazu: "region-mazu" };

/* the keepers of the four town doors, by civilization */
FQ.KEEPERS = {
  market: {
    chr:  { zh: "布商 乔凡尼", en: "Giovanni the Draper", npc: "market-chr", ic: "🧺",
      lZh: "「威尼斯的规矩：先看货，再问价，最后才讲交情。」", lEn: "'Venetian order: see the goods, then ask the price, and only then speak of friendship.'" },
    isl:  { zh: "香料贩 优素福", en: "Yusuf the Spicer", npc: "market-isl", ic: "🧺",
      lZh: "「你闻——这一把胡椒，走到威尼斯就是一匹马的价。」", lEn: "'Smell it. This handful of pepper is worth a horse by the time it reaches Venice.'" },
    con:  { zh: "丝行掌柜 周三", en: "Zhou the Silk Broker", npc: "market-con", ic: "🧺",
      lZh: "「客官要生丝还是熟绢？西边来的客人多半分不清，你可别。」", lEn: "'Raw silk or finished? Most westerners cannot tell. Do not be most westerners.'" },
    mazu: { zh: "船货牙人 阿海", en: "Ah-Hai, Cargo Broker", npc: "market-mazu", ic: "🧺",
      lZh: "「刺桐港的价钱一日三变，你昨天听的行情，今天已经是旧话。」", lEn: "'Zayton's prices turn thrice a day. Yesterday's rate is already an old story.'" }
  },
  temple: {
    chr:  { zh: "执事修士", en: "The Brother Sacristan", npc: "temple-chr", ic: "⛪",
      lZh: "「远行的人在此点一盏灯，是为了回来时还认得路。」", lEn: "'Travelers light a lamp here so the road still knows them when they return.'" },
    isl:  { zh: "清真寺看守 阿卜杜勒", en: "Abdul, Keeper of the Mosque", npc: "temple-isl", ic: "🕌",
      lZh: "「先净手，再祈祷。路上的尘土可以带走，心里的不能。」", lEn: "'Wash first, then pray. Take the road's dust with you; do not take the other kind.'" },
    con:  { zh: "道观知客", en: "The Taoist Steward", npc: "temple-con", ic: "☯",
      lZh: "「问天不如问己。既然来了，就替你上一炷香罢。」", lEn: "'Better to ask yourself than heaven. Still — since you have come, I will burn one stick for you.'" },
    mazu: { zh: "天妃宫庙祝", en: "The Tianfei Shrine-Keeper", npc: "temple-mazu", ic: "🏮",
      lZh: "「出海的都来这儿。她不保你不遇风，只保你遇了风还找得着岸。」", lEn: "'Everyone bound seaward comes here. She does not promise no storm — only that you find the shore after it.'" }
  },
  teahouse: {
    chr:  { zh: "酒馆老板娘", en: "The Tavern Mistress", npc: "tea-chr", ic: "🍷",
      lZh: "「一杯酒换一句实话。东边过来的商队昨夜宿在这儿，我什么都听见了。」", lEn: "'A cup for a true word. A caravan from the east slept here last night, and I heard all of it.'" },
    isl:  { zh: "驿栈茶博士", en: "The Caravanserai Tea-Master", npc: "tea-isl", ic: "🫖",
      lZh: "「坐。骆驼要歇，人也要歇。你想知道前边的路，我这儿人比路多。」", lEn: "'Sit. Camels rest; so do men. You want the road ahead — I have more men here than the road has miles.'" },
    con:  { zh: "野店说书人", en: "The Wayside Storyteller", npc: "tea-con", ic: "🍵",
      lZh: "「一文钱一段书。我讲的未必真，可关口盘查的事，我从没说错过。」", lEn: "'One coin a tale. My stories may lie, but I have never been wrong about a checkpoint.'" },
    mazu: { zh: "码头茶棚阿婆", en: "The Quayside Tea Granny", npc: "tea-mazu", ic: "🍵",
      lZh: "「风信要问老船工，别问那些穿绸的。喝完这碗我讲给你听。」", lEn: "'Ask old sailors about the winds, not the men in silk. Finish the bowl and I will tell you.'" }
  },
  inn: {
    chr:  { zh: "客栈掌柜", en: "The Innkeeper", npc: "inn-chr", ic: "🛏️",
      lZh: "「一夜一文，草料另算。你的骡子比你还累。」", lEn: "'A coin a night, fodder extra. Your mule is wearier than you are.'" },
    isl:  { zh: "驿栈主人", en: "The Caravanserai Master", npc: "inn-isl", ic: "🛏️",
      lZh: "「三日之内，宿食不取分文——这是商道的老规矩。」", lEn: "'Three days' bed and board, without charge. That is the old law of the road.'" },
    con:  { zh: "行馆管事", en: "The Post-House Steward", npc: "inn-con", ic: "🏮",
      lZh: "「凭金牌的住上房，凭文书的住通铺，什么都没有的住马厩。」", lEn: "'Paiza takes the upper room, papers take the common floor, nothing takes the stable.'" },
    mazu: { zh: "船家客栈老板", en: "The Sailors' Inn Keeper", npc: "inn-mazu", ic: "🏮",
      lZh: "「歇一日，等个好风信，比抢三日路都划算。」", lEn: "'Rest a day and wait for a fair wind. It beats stealing three days of road.'" }
  }
};

/* what the building does, said in the keeper's own words */
FQ.KEEPER_ACT = {
  market:   { zh: "看看货色 →", en: "Look over the goods →" },
  temple:   { zh: "上一炷香 →", en: "Offer incense →" },
  teahouse: { zh: "请一圈茶，打听前路（−1 盘缠）", en: "Stand a round and ask the road (−1 coin)" },
  inn:      { zh: "歇一日（+1 天）", en: "Rest a day (+1 day)" },
  leave:    { zh: "改日再来", en: "Another time" }
};
