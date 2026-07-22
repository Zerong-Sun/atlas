/* Extra Marco stations from Yule lore (方案 A · ~20 places).
   Appended onto CHAPTERS[0] after data-journey.js loads. */
window.FQ = window.FQ || {};

FQ.JOURNEY_EXTRA_NODES = [
  { id: "georgia", region: "chr", x: 210, y: 125, zh: "谷儿只（格鲁吉亚）", en: "Georgiania", type: "side",
    town: { market: ["silk"], temple: "chr" },
    exZh: "出突厥蛮牧场而东，进入谷儿只人的山地王国。波罗写道：其王勇武，城堡据险，油泉冒地而出—— lit 可燃，商旅以为奇观。山路多关卡，银与盐都能买路。",
    exEn: "East of the Turkoman pastures lies Georgiania. Polo writes of valiant kings, cliff-castles, and oil that springs from the earth and burns — a wonder to caravans. Mountain gates take silver or salt alike.",
    factsZh: "谷儿只：险城、油泉与基督堂并存。短途商队以盐块过关；夜宿问刀是否入鞘。",
    factsEn: "Georgiania: cliff towns, oil springs, and churches. Short caravans pass gates with salt-blocks; hosts ask if knives stay sheathed.",
    gate: { type: "coinYang", pZh: "关吏掷币问过关：阳面半税。", pEn: "The gate clerk tosses for the toll: heads, half-duty.",
      edgeZh: "付全税赶路（−2 盘缠）", edgeEn: "Pay full toll (−2 coin)", edgeFx: [{ op: "coins", v: -2 }],
      onPass: [{ op: "coins", v: -1 }, { op: "favor", civ: "chr", v: 1 }] } },

  { id: "greater_armenia", region: "chr", x: 188, y: 155, zh: "大亚美尼亚", en: "Greater Hermenia", type: "side",
    town: { market: ["spice", "silk"], temple: "chr" },
    exZh: "大亚美尼亚的高原风硬，诺亚方舟的传说挂在亚拉腊山影里。波罗记其城邑与物产，也记战火如何反复刮过这块高地。",
    exEn: "Greater Hermenia's plateau wind is hard; Noah's ark hangs in tales under Ararat's shadow. Polo records towns and goods — and how war repeatedly scours the heights.",
    factsZh: "大亚美尼亚：羊毛、盐与朝圣路。教堂钟声与商队驼铃抢答同一片风。",
    factsEn: "Greater Hermenia: wool, salt, and pilgrimage roads. Church bells and camel-bells answer the same wind.",
    gate: { type: "tarotLow", pZh: "修士请你抽牌问山路：前十号方得祝祷。", pEn: "Monks ask a draw for the mountain road: Majors 0–9 earn a blessing.",
      edgeZh: "不抽牌，雇向导（−2 盘缠）", edgeEn: "Skip the draw; hire a guide (−2 coin)", edgeFx: [{ op: "coins", v: -2 }] } },

  { id: "camadi", region: "isl", x: 355, y: 235, zh: "卡马迪废墟", en: "Camadi (ruins)", type: "pass",
    exZh: "下忽鲁谟斯的路上，卡马迪只剩废墟。波罗说此地曾繁华，后毁于战乱；沙掩街巷，旅人仍循旧井取水。",
    exEn: "On the descent to Hormos, Camadi is ruin. Polo says it thrived once, then war unmade it; sand covers streets, yet travelers still find the old wells.",
    factsZh: "卡马迪：废墟与旧井。日里少停，夜里不答陌生呼唤。",
    factsEn: "Camadi: ruins and old wells. Scarce pause by day; answer no strange call by night.",
    gate: { type: "diceHouse", pZh: "在废墟掷骰问井：得远方或自我之宫，方辨真水。", pEn: "Cast among ruins for the well: Exploration or Self names true water.",
      edgeZh: "付向导找井（−1 盘缠）", edgeEn: "Pay a guide for the well (−1 coin)", edgeFx: [{ op: "coins", v: -1 }] } },

  { id: "taican", region: "isl", x: 455, y: 155, zh: "塔伊坎", en: "Taican", type: "pass",
    town: { market: ["spice"] },
    exZh: "巴里黑与巴达哈伤之间，塔伊坎以盐山与市集闻名。波罗详记盐如何切块交易，像切石头一样。",
    exEn: "Between Balkh and Badashan, Taican is famed for salt mountains and its market. Polo details how salt is cut in blocks and traded like stone.",
    factsZh: "塔伊坎：盐块即货币。瓜果换盐，盐换过山的脚力。",
    factsEn: "Taican: salt-blocks are coin. Melons buy salt; salt buys legs over the pass.",
    gate: { type: "lot", pZh: "盐市神龛求签：吉签则盐价优惠。", pEn: "Draw a lot at the salt shrine: a fair slip softens the price.",
      edgeZh: "原价买盐赶路（−1 盘缠）", edgeEn: "Buy salt at full price (−1 coin)", edgeFx: [{ op: "coins", v: -1 }],
      onPass: [{ op: "coins", v: 1 }] } },

  { id: "kashmir", region: "isl", x: 510, y: 175, zh: "客失迷儿", en: "Keshimur (Kashmir)", type: "side",
    town: { market: ["silk", "spice"], teahouse: true },
    exZh: "巴达哈伤以南的高山国，波罗记其偶像、气候与隐修者。谷深雪重，宝石与传说同出一脉。",
    exEn: "South of Badashan, the high kingdom of Keshimur — Polo notes idols, climate, and hermits. Deep valleys, heavy snow; gems and legends share one vein.",
    factsZh: "客失迷儿：羊毛披肩、宝石与山寺。问路先问雪线。",
    factsEn: "Keshimur: wool shawls, gems, and hill shrines. Ask the snow-line before the road.",
    gate: { type: "meihua", pZh: "山寺请你起梅花一卦问雪。", pEn: "A hill shrine asks a Plum Blossom cast for the snow.",
      edgeZh: "付香火绕行（−1 盘缠）", edgeEn: "Leave incense and skirt (−1 coin)", edgeFx: [{ op: "coins", v: -1 }],
      onPass: [{ op: "favor", civ: "isl", v: 1 }, { op: "dust", v: 1 }] } },

  { id: "pein", region: "con", x: 560, y: 210, zh: "培因", en: "Pein", type: "pass",
    town: { market: ["silk", "spice"] },
    exZh: "于阗以东的培因，波罗记玉河与土产。沙路漫长，城小而玉贵。",
    exEn: "East of Cotan lies Pein — Polo records jade rivers and local goods. Long sand-roads; a small town where jade is dear.",
    factsZh: "培因：玉按色论价。水窖比客栈更先找。",
    factsEn: "Pein: jade priced by color. Find cisterns before inns.",
    gate: { type: "coinYang", pZh: "玉商掷币定价。", pEn: "The jade dealer tosses for the price.",
      edgeZh: "不买玉，只问水（免费）", edgeEn: "Skip jade; ask only for water", edgeFx: [] } },

  { id: "charchan", region: "con", x: 590, y: 225, zh: "车尔成", en: "Charchan", type: "pass",
    exZh: "培因与罗布之间，车尔成多沙与碱。波罗写行人如何辨识旧路痕迹，以免陷入软沙。",
    exEn: "Between Pein and Lop, Charchan is sand and alkali. Polo tells how travelers read old track-marks lest soft sand take them.",
    factsZh: "车尔成：碱滩与旧辙。午歇，夜行。",
    factsEn: "Charchan: alkali flats and old ruts. Rest at noon; march by night.",
    gate: { type: "diceElem", pZh: "向导请你为风向掷骰。", pEn: "The guide asks a dice cast for the wind.",
      edgeZh: "雇双驼（−2 盘缠）", edgeEn: "Hire a second camel (−2 coin)", edgeFx: [{ op: "coins", v: -2 }] } },

  { id: "etzina", region: "con", x: 640, y: 145, zh: "亦集乃", en: "Etzina", type: "side",
    town: { market: ["silk"], temple: "con" },
    exZh: "甘州以北的亦集乃，波罗记其城与入漠之路。再往北便是大漠与哈剌和林方向。",
    exEn: "North of Campichu lies Etzina — Polo notes the town and the road into the desert toward Caracoron.",
    factsZh: "亦集乃：出关前最后的茶与炭。",
    factsEn: "Etzina: last tea and charcoal before the waste.",
    gate: { type: "ichingYang", pZh: "关庙求易：阳爻多则宜北行。", pEn: "Cast at the gate shrine: many yang lines favor the north road.",
      edgeZh: "歇一日再走（+1 天）", edgeEn: "Rest a day (+1 day)", edgeFx: [{ op: "days", v: 1 }] } },

  { id: "tenduc", region: "con", x: 700, y: 95, zh: "天德", en: "Tenduc", type: "side",
    town: { market: ["silk", "glass"] },
    exZh: "往上都的路上，天德一带基督徒与偶像崇拜者杂居——波罗对此着墨甚多，也记其物产与王统传说。",
    exEn: "On the road to Chandu, Tenduc mixes Christians and idolaters — Polo dwells on this, and on goods and royal legends.",
    factsZh: "天德：十字与佛寺同城。丝、毡与驿马。",
    factsEn: "Tenduc: Cross and abbey in one town. Silk, felt, and post-horses.",
    gate: { type: "tarotAny", pZh: "景教徒请你抽一牌问同路。", pEn: "Nestorians ask a card for companions on the road.",
      edgeZh: "独自赶驿（免费）", edgeEn: "Ride the yam alone", edgeFx: [] } },

  { id: "erguiul", region: "con", x: 655, y: 120, zh: "额里合牙", en: "Erguiul", type: "side",
    exZh: "河西走廊侧翼的额里合牙，波罗记麝香兽与土产。山风烈，商队少停。",
    exEn: "Flanking the Hexi Corridor, Erguiul — Polo notes musk-beasts and local goods. Hard wind; caravans scarce linger.",
    factsZh: "额里合牙：麝香、大黄。价高货稀。",
    factsEn: "Erguiul: musk and rhubarb. Dear goods, thin stock.",
    gate: { type: "diceFire", pZh: "药商请你掷火象问货真。", pEn: "The physic-dealer casts Fire for authenticity.",
      edgeZh: "不买药（免费）", edgeEn: "Buy no physic", edgeFx: [],
      onPass: [{ op: "goods", id: "rhubarb", v: 1 }] } },

  { id: "sindafu", region: "con", x: 720, y: 210, zh: "成都（信都府）", en: "Sindafu (Chengdu)", type: "town",
    town: { market: ["silk", "spice", "glass"], temple: "con", teahouse: true, inn: true },
    exZh: "波罗笔下的信都府桥多水阔，丝与茶的气味混在江上。由此可折向西南入哈剌章。",
    exEn: "Polo's Sindafu is bridges and broad water; silk and tea-smell ride the river. From here one may turn southwest into Carajan.",
    factsZh: "成都：桥市、茶馆、蜀锦。水程比陆程便宜。",
    factsEn: "Sindafu: bridge-markets, tea-shops, Shu brocade. Water cheaper than land.",
    gate: { type: "lot", pZh: "江边庙求签问西南路。", pEn: "A riverside lot for the southwest road.",
      edgeZh: "只做买卖", edgeEn: "Trade only", edgeFx: [],
      onPass: [{ op: "favor", civ: "con", v: 1 }] } },

  { id: "carajan", region: "con", x: 700, y: 255, zh: "哈剌章（云南）", en: "Carajan", type: "town",
    town: { market: ["spice", "jade"], temple: "con" },
    exZh: "哈剌章多金齿与奇俗，波罗记蛇、金与战事。再南可闻缅国象阵之风。",
    exEn: "Carajan of gold-teeth and strange customs — Polo records serpents, gold, and wars. Farther south one hears of Mien's elephants.",
    factsZh: "哈剌章：金、马、盐井。口音杂，茶马同市。",
    factsEn: "Carajan: gold, horses, salt-wells. Mixed tongues; tea and horses share one market.",
    gate: { type: "diceAny", pZh: "土司帐前掷星骰问南行。", pEn: "Cast before the local lord for the south road.",
      edgeZh: "改道回成都（+1 天）", edgeEn: "Turn back to Sindafu (+1 day)", edgeFx: [{ op: "days", v: 1 }] } },

  { id: "mien", region: "mazu", x: 690, y: 295, zh: "缅国", en: "Mien", type: "side",
    exZh: "波罗详记缅国象战与金塔。湿热之气与哈剌章不同，象阵的尘土能吞没半日的太阳。",
    exEn: "Polo details Mien's elephant battles and golden towers. The wet heat differs from Carajan; elephant-dust can swallow half a day's sun.",
    factsZh: "缅国：象牙、金箔、雨季。问战事先问雨。",
    factsEn: "Mien: ivory, gold leaf, monsoon. Ask the rain before you ask the war.",
    gate: { type: "dreamChoice", pZh: "金塔外一夜，梦境问你所见。", pEn: "A night by the golden tower — what did the dream show?",
      options: [] } },

  { id: "bangala", region: "mazu", x: 665, y: 310, zh: "班加剌", en: "Bangala", type: "side",
    exZh: "缅国邻近的班加剌，波罗记其物产与人烟。水路纵横，米与布的气味盖过香料。",
    exEn: "Near Mien lies Bangala — Polo notes goods and crowds. Waterways everywhere; rice and cloth outsmell spice.",
    factsZh: "班加剌：米、棉、河道渡口。渡资用米亦可。",
    factsEn: "Bangala: rice, cotton, ferry-crossings. Rice may pay the fare.",
    gate: { type: "jiaobei", pZh: "渡口船户掷筊问开船。", pEn: "Ferrymen cast moon-blocks for casting off.",
      edgeZh: "另雇小舟（−2 盘缠）", edgeEn: "Hire a skiff (−2 coin)", edgeFx: [{ op: "coins", v: -2 }] } },

  { id: "saianfu", region: "con", x: 755, y: 185, zh: "襄阳府", en: "Saianfu", type: "town",
    town: { market: ["silk", "glass"], temple: "con" },
    exZh: "波罗大书襄阳久攻之事与抛石机。城坚，水阔，南人北人的胜负曾在此胶着。",
    exEn: "Polo dwells on the long siege of Saianfu and the mangonels. Hard walls, broad water; north and south once stuck here.",
    factsZh: "襄阳：城防、造船、江防军粮。茶贵于酒的日子常见。",
    factsEn: "Saianfu: walls, shipyards, river-army grain. Days when tea outprices wine are common.",
    gate: { type: "ichingYang", pZh: "城隍庙求易问水路。", pEn: "Cast at the city-god for the water road.",
      edgeZh: "走陆路绕行（+1 天）", edgeEn: "Take the land detour (+1 day)", edgeFx: [{ op: "days", v: 1 }] } },

  { id: "suju", region: "con", x: 780, y: 230, zh: "苏州", en: "Suju", type: "town",
    town: { market: ["silk", "spice"], teahouse: true },
    exZh: "苏州桥多如石琴键，波罗赞其富庶近于行在。丝船挤河，茶烟入巷。",
    exEn: "Suju's bridges are like stone keys; Polo praises a wealth near Kinsay's. Silk-boats crowd the canals; tea-smoke fills lanes.",
    factsZh: "苏州：丝绸、园林巷、船娘号子。一文钱一碗茶。",
    factsEn: "Suju: silk, garden lanes, boatwomen's calls. One cash a bowl of tea.",
    gate: { type: "coinYang", pZh: "船娘掷币问摆渡。", pEn: "A boatwoman tosses for the ferry.",
      edgeZh: "走岸路（+1 天）", edgeEn: "Walk the bank (+1 day)", edgeFx: [{ op: "days", v: 1 }] } },

  { id: "fuzhou", region: "mazu", x: 790, y: 270, zh: "福州", en: "Fuju (Fuzhou)", type: "port",
    town: { market: ["spice", "silk"], temple: "mazu", teahouse: true },
    exZh: "福州城大港深，波罗记其商盛。由此南下可趋刺桐，海风已带盐味。",
    exEn: "Fuju is large and deep-harbored; Polo notes busy trade. Southward lies Zayton; the wind already tastes of salt.",
    factsZh: "福州：海船、漆器、鱼干。离港前多问天妃。",
    factsEn: "Fuju: sea-ships, lacquer, dried fish. Ask Tianfei before casting off.",
    gate: { type: "jiaobei", pZh: "天妃殿前掷筊。", pEn: "Cast moon-blocks before Tianfei.",
      edgeZh: "改走陆路去泉州（+1 天）", edgeEn: "Take land to Quanzhou (+1 day)", edgeFx: [{ op: "days", v: 1 }] } },

  { id: "java", region: "mazu", x: 820, y: 330, zh: "爪哇", en: "Java", type: "side",
    exZh: "海路南望爪哇，波罗记其大与香料。浪高，牙人价一日三改。",
    exEn: "South by sea lies Java — Polo notes its size and spice. High waves; brokers change the rate thrice a day.",
    factsZh: "爪哇：胡椒、沉香。季风不对不开船。",
    factsEn: "Java: pepper and aloeswood. No monsoon, no sailing.",
    gate: { type: "diceElem", pZh: "船主观星掷骰问季风。", pEn: "The master casts for the monsoon.",
      edgeZh: "等下一季风（+2 天）", edgeEn: "Wait the next monsoon (+2 days)", edgeFx: [{ op: "days", v: 2 }] } },

  { id: "chipangu", region: "mazu", x: 805, y: 200, zh: "日本国", en: "Chipangu", type: "side",
    exZh: "波罗传闻中的日本国多金，大汗远征曾挫于此。海雾厚，故事比海图多。",
    exEn: "Polo's Chipangu is fabled rich in gold; the Khan's expedition faltered there. Thick fog; more tales than charts.",
    factsZh: "日本国：传闻金多。实路少人走通。",
    factsEn: "Chipangu: tales of gold. Few real roads completed.",
    gate: { type: "dreamChoice", pZh: "雾夜梦见金屋还是怒潮？", pEn: "In fog, dream of gold halls or angry tide?",
      options: [] } },

  { id: "seilan", region: "mazu", x: 600, y: 340, zh: "僧伽剌（锡兰）", en: "Seilan (Ceylon)", type: "side",
    town: { market: ["spice", "glass"] },
    exZh: "锡兰岛宝石与佛迹并称，波罗记其山寺与王统。回帆常在此补淡水。",
    exEn: "Seilan is gems and Buddhist traces; Polo notes mountain shrines and kings. Homebound sails often take water here.",
    factsZh: "僧伽剌：红宝石、肉桂、寺灯。",
    factsEn: "Seilan: rubies, cinnamon, shrine-lamps.",
    gate: { type: "lot", pZh: "山寺求签问回帆。", pEn: "A mountain lot for the homeward sail.",
      edgeZh: "只取淡水", edgeEn: "Take water only", edgeFx: [],
      onPass: [{ op: "favor", civ: "mazu", v: 1 }] } },

  { id: "maabar", region: "mazu", x: 560, y: 355, zh: "马八儿", en: "Maabar", type: "side",
    town: { market: ["spice", "silk"] },
    exZh: "印度东南的马八儿，波罗记珍珠渔与风俗。岸热，浪白，牙人嗓门比海鸥还尖。",
    exEn: "Maabar on India's southeast — Polo notes pearl-fisheries and customs. Hot shore, white surf; brokers louder than gulls.",
    factsZh: "马八儿：珍珠、棉布、湿风。",
    factsEn: "Maabar: pearls, cotton, wet wind.",
    gate: { type: "diceHouse", pZh: "采珠人前掷宫位问海。", pEn: "Cast houses before the pearl-divers for the sea.",
      edgeZh: "不下水，只买成珠（−3 盘缠）", edgeEn: "Buy finished pearls (−3 coin)", edgeFx: [{ op: "coins", v: -3 }] } },

  { id: "aden", region: "isl", x: 280, y: 300, zh: "阿丹", en: "Aden", type: "port",
    town: { market: ["spice", "glass"], temple: "isl" },
    exZh: "阿丹港锁红海口，波罗记其商道与马匹贸易。热风硬，淡水贵。",
    exEn: "Aden locks the Red Sea mouth; Polo notes trade roads and horses. Hard heat; dear water.",
    factsZh: "阿丹：马、乳香、红海税。",
    factsEn: "Aden: horses, frankincense, Red Sea dues.",
    gate: { type: "coinYang", pZh: "税吏掷币问关税。", pEn: "The customs clerk tosses for the duty.",
      edgeZh: "付全税（−2 盘缠）", edgeEn: "Pay full duty (−2 coin)", edgeFx: [{ op: "coins", v: -2 }] } }
];

FQ.JOURNEY_EXTRA_EDGES = [
  { from: "ayas", to: "georgia", kind: "land", days: 2, risk: 1 },
  { from: "turkomania", to: "georgia", kind: "land", days: 2, risk: 1 },
  { from: "georgia", to: "mosul", kind: "land", days: 3, risk: 1 },
  { from: "ayas", to: "greater_armenia", kind: "land", days: 2, risk: 1 },
  { from: "greater_armenia", to: "tabriz", kind: "land", days: 3, risk: 1 },
  { from: "kerman", to: "camadi", kind: "land", days: 2, risk: 2, wx: "sand" },
  { from: "camadi", to: "hormuz", kind: "land", days: 2, risk: 1 },
  { from: "balkh", to: "taican", kind: "land", days: 2, risk: 1 },
  { from: "taican", to: "badakhshan", kind: "land", days: 2, risk: 1 },
  { from: "badakhshan", to: "kashmir", kind: "land", days: 3, risk: 2, wx: "snow" },
  { from: "kashmir", to: "kashgar", kind: "land", days: 4, risk: 2, wx: "snow" },
  { from: "khotan", to: "pein", kind: "land", days: 2, risk: 1, wx: "sand" },
  { from: "pein", to: "charchan", kind: "land", days: 2, risk: 2, wx: "sand" },
  { from: "charchan", to: "lop", kind: "land", days: 2, risk: 2, wx: "sand" },
  { from: "campichu", to: "etzina", kind: "land", days: 2, risk: 1 },
  { from: "etzina", to: "karakorum", kind: "land", days: 3, risk: 2, wx: "sand" },
  { from: "etzina", to: "gobi", kind: "land", days: 2, risk: 1, wx: "sand" },
  { from: "campichu", to: "erguiul", kind: "land", days: 2, risk: 1 },
  { from: "erguiul", to: "suhchau", kind: "land", days: 2, risk: 0 },
  { from: "gobi", to: "tenduc", kind: "land", days: 2, risk: 1 },
  { from: "tenduc", to: "shangdu", kind: "land", days: 2, risk: 0 },
  { from: "khanbaliq", to: "sindafu", kind: "land", days: 5, risk: 1 },
  { from: "sindafu", to: "carajan", kind: "land", days: 4, risk: 2 },
  { from: "carajan", to: "mien", kind: "land", days: 3, risk: 2 },
  { from: "mien", to: "bangala", kind: "land", days: 2, risk: 1 },
  { from: "yangzhou", to: "saianfu", kind: "river", days: 3, risk: 1 },
  { from: "saianfu", to: "hangzhou", kind: "river", days: 3, risk: 0 },
  { from: "hangzhou", to: "suju", kind: "river", days: 1, risk: 0 },
  { from: "suju", to: "hangzhou", kind: "river", days: 1, risk: 0 },
  { from: "hangzhou", to: "fuzhou", kind: "land", days: 3, risk: 1 },
  { from: "fuzhou", to: "quanzhou", kind: "sea", days: 2, risk: 1 },
  { from: "quanzhou", to: "java", kind: "sea", days: 5, risk: 2, wx: "storm" },
  { from: "java", to: "quanzhou", kind: "sea", days: 5, risk: 2, wx: "storm" },
  { from: "quanzhou", to: "chipangu", kind: "sea", days: 6, risk: 3, wx: "storm" },
  { from: "voyage", to: "seilan", kind: "sea", days: 4, risk: 1 },
  { from: "seilan", to: "maabar", kind: "sea", days: 2, risk: 1 },
  { from: "maabar", to: "aden", kind: "sea", days: 5, risk: 2 },
  { from: "aden", to: "hormuz", kind: "sea", days: 4, risk: 1 }
];

(function applyJourneyExtra() {
  const ch = FQ.CHAPTERS && FQ.CHAPTERS[0];
  if (!ch) return;
  const have = new Set((ch.nodes || []).map(n => n.id));
  (FQ.JOURNEY_EXTRA_NODES || []).forEach(n => {
    if (!have.has(n.id)) { ch.nodes.push(n); have.add(n.id); }
  });
  const ek = new Set((ch.edges || []).map(e => e.from + ">" + e.to));
  (FQ.JOURNEY_EXTRA_EDGES || []).forEach(e => {
    const k = e.from + ">" + e.to;
    if (!ek.has(k)) { ch.edges.push(e); ek.add(k); }
  });
})();

/* Default market prices for towns that have market but no FQ.PRICES entry.
   Spreads mirror nearby regional hubs so buy/sell never hits undefined. */
(function fillMissingPrices() {
  if (!FQ.PRICES) FQ.PRICES = {};
  const byRegion = {
    chr: { glass: { b: 4, s: 3 }, silk: { b: 8, s: 6 }, spice: { b: 7, s: 5 } },
    isl: { glass: { b: 5, s: 4 }, silk: { b: 6, s: 5 }, spice: { b: 4, s: 3 } },
    con: { glass: { b: 7, s: 6 }, silk: { b: 4, s: 3 }, spice: { b: 6, s: 5 } },
    mazu: { glass: { b: 8, s: 7 }, silk: { b: 5, s: 4 }, spice: { b: 8, s: 6 } }
  };
  const overrides = {
    ayas: byRegion.chr,
    turkomania: { glass: { b: 5, s: 3 }, silk: { b: 7, s: 5 }, spice: { b: 6, s: 4 } },
    acre: byRegion.chr,
    georgia: byRegion.chr,
    greater_armenia: byRegion.chr,
    cobinan: byRegion.isl,
    taican: { glass: { b: 5, s: 4 }, silk: { b: 5, s: 4 }, spice: { b: 3, s: 2 } },
    kashmir: byRegion.isl,
    badakhshan: { glass: { b: 6, s: 5 }, silk: { b: 5, s: 4 }, spice: { b: 5, s: 4 } },
    yarkand: { glass: { b: 6, s: 5 }, silk: { b: 5, s: 4 }, spice: { b: 5, s: 4 } },
    pein: { glass: { b: 6, s: 5 }, silk: { b: 4, s: 3 }, spice: { b: 5, s: 4 } },
    camul: byRegion.con,
    campichu: byRegion.con,
    etzina: byRegion.con,
    tenduc: byRegion.con,
    sindafu: { glass: { b: 7, s: 6 }, silk: { b: 3, s: 2 }, spice: { b: 6, s: 5 } },
    carajan: { glass: { b: 6, s: 5 }, silk: { b: 5, s: 4 }, spice: { b: 5, s: 3 } },
    saianfu: byRegion.con,
    suju: { glass: { b: 8, s: 7 }, silk: { b: 3, s: 2 }, spice: { b: 6, s: 5 } },
    fuzhou: byRegion.mazu,
    seilan: { glass: { b: 7, s: 6 }, silk: { b: 6, s: 5 }, spice: { b: 4, s: 3 } },
    maabar: { glass: { b: 7, s: 6 }, silk: { b: 5, s: 4 }, spice: { b: 3, s: 2 } },
    aden: { glass: { b: 6, s: 5 }, silk: { b: 6, s: 5 }, spice: { b: 3, s: 2 } }
  };
  Object.keys(overrides).forEach(id => {
    if (!FQ.PRICES[id]) FQ.PRICES[id] = overrides[id];
  });
  /* any remaining market towns still missing prices */
  const chs = FQ.CHAPTERS || [];
  chs.forEach(ch => {
    (ch.nodes || []).forEach(n => {
      if (!n.town || !n.town.market || FQ.PRICES[n.id]) return;
      FQ.PRICES[n.id] = byRegion[n.region] || byRegion.isl;
    });
  });
})();
