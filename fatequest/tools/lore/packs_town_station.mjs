#!/usr/bin/env node
/**
 * P6 · Authored deepening packs for the 61 town/station cities.
 *
 * Each pack: one standing site (`ev-<city>-a`) + one followup
 * (`ev-<city>-a-followup`). Site choices 0/1 queue the followup, choice 2 is
 * instant. Register: Yule-Cordier observational, second person, present tense,
 * no modern vocabulary, no interiority (LORE_PIPELINE §4). Corpus-grounded
 * packs cite the source chapter in `lore`; the 19 cities without a corpus
 * ref are `origin: "authored"` (checked-weak evidence) and stay observational.
 *
 * Effect ops: days / coins / goods / codex / reputation (city|band) /
 * fate (travel|rapport|wealth) / reveal_map (city or route id) / queue_event.
 * Goods purchases carry a coin cost — the sell-gate (Playtest #2 ratchet)
 * keeps granted goods out of same-city minting.
 */
export const PACKS = [
  // ─── Spike: charchan (town, corpus v1-b1-c038) ────────────────────
  {
    city: "charchan",
    tier: "town",
    zhName: "车尔臣（且末）",
    enName: "Charchan",
    lore: {
      placeId: "charchan",
      origin: "source",
      ref: { book: "marco-polo", chapterId: "v1-b1-c038" },
    },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Charchan: The Jasper Sifters by the Bitter Water", "车尔臣：苦水边的玉工"],
      body: [
        "Beside the rivers that bring down jasper and chalcedony, the sifters of Charchan work the gravel with wooden sieves and say little. The province is all sand, and most of the water is bitter and bad; only at some places is it fresh and sweet. They tell you that when an army passes through the land the people take their wives, children and cattle two or three days' journey into the sandy waste, and the wind covers their track before the sun sets.",
        "车尔臣的河床盛产碧玉与玉髓，玉工们持木筛你的名字在砾石间淘洗，言语甚少。省境皆是流沙，水味多苦咸，唯数处得甘泉。他们告诉你：大军过境时，百姓携妻儿牲畜遁入沙海两三日之程，日落之前，风已将足迹抹平。",
      ],
      choices: [
        ["Buy a jasper stone at the sifters' price", "按玉工之价买下一块碧玉"],
        ["Ask the days across the sand to Lop", "问过沙至罗卜的路程与日数"],
        ["Drink the bitter water and mark the road onward", "饮一口苦水，记下前路"],
      ],
      results: [
        ["The sifters weigh the stone for you at their fixed price. The jasper will fetch its worth in Cathay, and the account of Charchan goes with it.", "玉工按定价为你称石。这块碧玉在契丹自有其价，车尔臣的记述也随它同行。"],
        ["They count the days on their fingers: five through the sand, water bitter all the way, and at the end of those days a place where the water is sweet — that is Lop. Lop is now on your map.", "他们屈指计数：过沙须五日，沿途之水皆苦，五日期尽处有一地水甘——那便是罗卜。罗卜已上你的舆图。"],
        ["You drink the bitter water and find it drinkable after all. The way ahead is noted, and you go on the lighter for the knowing.", "你尝了苦水，发觉尚可入口。前路已记，心中也因这知晓而轻了几分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1200, reason: "bought-jasper-at-charchan-sifters-price" },
        { op: "goods", id: "jade", value: 1, reason: "bought-jasper-at-charchan-sifters-price" },
        { op: "codex", value: "cx-charchan", reason: "learned-the-jasper-sifters-of-charchan" },
        { op: "queue_event", value: "ev-charchan-a-followup", reason: "charchan-a-followup" },
      ],
      [
        { op: "reveal_map", value: "lop", reason: "sifters-counted-the-days-to-lop" },
        { op: "codex", value: "cx-charchan", reason: "learned-the-sand-road-to-lop" },
        { op: "queue_event", value: "ev-charchan-a-followup", reason: "charchan-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "drank-the-bitter-water-of-charchan" },
        { op: "fate", id: "rapport", value: 1, reason: "measured-the-bitter-water-road" },
      ],
    ],
    followup: {
      title: ["Charchan: The Sifters' Word on the Wind", "车尔臣：风沙掩迹之说"],
      body: [
        "A sifter who has hidden from two armies lays his sieve aside and speaks. He says the jasper goes by caravan into Cathay, where it fetches great prices, and that the secret of this land is not the stone but the wind — a man who knows the sand can vanish before a troop's eyes, and the track is gone by morning. He asks whether you mean to carry stone, or knowledge.",
        "一位曾两度避过大军的玉工放下筛子开口。他说碧玉随商队入契丹，在那里价极昂；而此地的秘密不在石，在风——识得流沙的人可在军前消失，待到天明，踪迹已无。他问你此行要带走的是石头，还是见识。",
      ],
      choices: [
        ["Buy a second jasper stone at the sifters' honest share", "按玉工的公道份额再买下一块碧玉"],
        ["Ask which wells stay sweet between here and Pein", "问通往髣城的路上何处有甘泉"],
        ["Sit a day and learn the sifters' trick of the hiding wind", "留一日，学玉工借风掩迹的技艺"],
      ],
      results: [
        ["He sells you a second jasper stone at the sifters' honest share. The stone will sell in Cathay, and the repeat price is the sifter's own measure.", "他按公道份额卖给你第二块碧玉。此石到契丹可售，回头客之价正是玉工自己的尺度。"],
        ["He marks the sweet wells in the dust: three between here and Pein, the rest bitter. Pein is no longer a blank on your map.", "他在尘土上标出甘泉：往髣城途中仅三口，余者皆苦。髣城不再是你舆图上的空白。"],
        ["You spend a day learning how the sand takes a track before the eye. The knowledge costs time, and in Charchan your name now carries a little more weight.", "你花一日学沙如何趁眼未及便掩去足迹。这技艺耗费时日，在车尔臣你的名字却多了一分分量。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -800, reason: "bought-chalcedony-at-charchan-sifters-price" },
        { op: "goods", id: "jade", value: 1, reason: "bought-chalcedony-for-the-cathay-road" },
        { op: "codex", value: "cx-charchan", reason: "carried-chalcedony-for-the-cathay-road" },
      ],
      [
        { op: "reveal_map", value: "pein", reason: "sifter-named-the-sweet-wells-to-pein" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-sweet-wells-of-the-sand" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-hiding-wind" },
        { op: "reputation", value: 1, scope: "city", id: "charchan", reason: "studied-with-the-jasper-sifters" },
        { op: "codex", value: "cx-charchan", reason: "learned-the-sifters-trick-of-the-wind" },
      ],
    ],
  },
  // ─── Spike: samara (station, authored) ────────────────────────────
  {
    city: "samara",
    tier: "station",
    zhName: "须文那",
    enName: "Samara",
    lore: {
      origin: "authored",
      disposition: "checked-weak",
      note: "已查：弱证据（单次提及）；维持 authored。",
    },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Samara: The Watering Ground of the Long Ships", "须文那：长船取水之处"],
      body: [
        "On the shore where the long ships put in for water, the shoremen of Samara draw your boat up on the sand and ask your business. They say the bay is busy when the monsoon turns, and that pepper and camphor are carried down from the hills to these sheds between the tides. The roads inland are few, and the men who know them charge nothing to name them — only an ear for the telling.",
        "长船在此取水的岸边，须文那的水手把你的船拖上沙滩，问你来意。他们说季风转向时海湾最忙，胡椒与樟脑从山中运到潮汐之间的棚下。通往内陆的路不多，识路之人点名不收分文——只要一双肯听的耳朵。",
      ],
      choices: [
        ["Buy a bundle of pepper at the shore price", "按岸价买下一捆胡椒"],
        ["Ask the shoremen the roads inland from the bay", "问水手海湾通往内陆的路"],
        ["Draw water and go on the same tide", "取水之后，随这一潮离去"],
      ],
      results: [
        ["The shoremen weigh the pepper at their fixed price. The bundle is sealed against the damp, and the account of Samara goes with it.", "水手按定价为你称胡椒。捆束已封好防潮，须文那的记述也随它同行。"],
        ["They name the roads inland as if they were tides: one to the pepper hills, one to the kingdom beyond. The way to Chamba and Mien is on your map.", "他们像说潮汐一样报出内陆之路：一条往胡椒山，一条往其后的王国。通往占城与湄南的路已上你的舆图。"],
        ["You draw water and leave with the tide. The bay is behind you, and the next course is already set.", "你取水随潮而去。海湾已在身后，下一段航程已定。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -600, reason: "bought-pepper-at-samara-shore-price" },
        { op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-samara-shore-price" },
        { op: "codex", value: "cx-samara", reason: "samara-book-entry" },
        { op: "queue_event", value: "ev-samara-a-followup", reason: "samara-a-followup" },
      ],
      [
        { op: "reveal_map", value: "chamba", reason: "shoremen-named-the-road-to-chamba" },
        { op: "reveal_map", value: "mien", reason: "shoremen-named-the-road-to-mien" },
        { op: "queue_event", value: "ev-samara-a-followup", reason: "samara-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watered-and-left-with-the-tide" },
        { op: "fate", id: "rapport", value: 1, reason: "sailed-with-the-tide-from-samara" },
      ],
    ],
    followup: {
      title: ["Samara: The Shoremen's Tide Book", "须文那：水手的潮册"],
      body: [
        "In the shade of the sheds an old shoreman who has counted forty monsoons opens his tide book and lays it on the sand. He says a ship that misses the turning tide waits half a month, and a traveller who misses the road into the hills waits longer — the pepper comes down by the bundle, and the camphor only when the moon is right. He asks what your cargo will bear.",
        "棚下阴凉处，一位数过四十季风的老水手翻开他的潮册摊在沙上。他说错过转潮的船要等半月，错过进山之路的旅人等得更久——胡椒一捆捆下山，樟脑只在月相合宜时才有。他问你的货舱能承什么。",
      ],
      choices: [
        ["Buy camphor sealed for the monsoon road", "买下封好走季风路的樟脑"],
        ["Ask the tide and the days to the next harbour", "问潮汐与至下一港口的日数"],
        ["Sit with the shoremen till the tide turns", "与水手们坐到潮转"],
      ],
      results: [
        ["He sells you camphor at his fixed price, sealed in leaf. The cargo will hold to the next monsoon port.", "他按定价卖给你樟脑，叶封完好。这批货可撑到下一处季风港。"],
        ["He reads the days to the next harbour from his book: the tide, the passage, the weather. Pentam and Cail are marked on your map.", "他从册中读出下一港的日数：潮、程、天气。奔达与加异勒已标上你的舆图。"],
        ["You sit with the shoremen through the turn of the tide. The talk is of ships and cargoes, and in Samara your name now carries a little more weight.", "你与水手们坐到潮转。话里皆是船与货，在须文那你的名字也多了几分分量。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-camphor-at-samara-tide-book-price" },
        { op: "goods", id: "camphor", value: 1, reason: "bought-camphor-sealed-for-the-monsoon-road" },
      ],
      [
        { op: "reveal_map", value: "pentam", reason: "shoreman-read-the-days-to-pentam" },
        { op: "reveal_map", value: "cail", reason: "shoreman-read-the-days-to-cail" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-tide-book" },
      ],
      [
        { op: "days", value: 1, reason: "waited-out-the-tide" },
        { op: "reputation", value: 1, scope: "city", id: "samara", reason: "sat-with-the-shoremen" },
      ],
    ],
  },
  // ─── B1 china · 1/2 ───────────────────────────────────────────────
  {
    city: "cacanfu",
    tier: "town",
    zhName: "河间府",
    enName: "Cacanfu",
    lore: { placeId: "cities-of-cacanfu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c060" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Cacanfu: The River Loom and the Ferry Ledger", "河间府：河畔织机与渡口账册"],
      body: [
        "At the head of a great river that carries merchandise to Cambaluc, the weavers of Cacanfu work silk and gold into stuffs on the quay-side looms. A ferry clerk who has counted every boat for twenty years sits over his ledger and says the city's wealth is in the thread and the water both — buy from the loom without hearing the river, and you will pay the price of a man who knows neither.",
        "在通往汗八里的大河上源，河间府的织工在岸边织机上织绸与金线。一位数了二十年渡船的账房坐在账册前说，此城之富在丝线亦在水路——不知河情的买主，付的是两者皆不知晓的价钱。",
      ],
      choices: [
        ["Buy a bolt of silk-and-gold at the loom price", "按织机之价买下一匹绸金织物"],
        ["Ask the ferry clerk the water road toward Cambaluc", "问渡口账房通往汗八里的水路"],
        ["Watch the looms a day and note the river's measure", "看一日织机，记下河水的尺度"],
      ],
      results: [
        ["He weighs the bolt for you at the loom's fixed price. The stuff will hold its worth in Cambaluc, and the account of Cacanfu goes with it.", "他按织机定价为你称布。这匹织物到汗八里仍值其价，河间府的记述也随它同行。"],
        ["He reads the ferries and the tolls from his ledger: Chinangli and Linju below, Cambaluc above. The water road north is on your map.", "他从账册上读出渡口与关卡：下游长芦与陵州，上游汗八里。北去的水路已上你的舆图。"],
        ["You spend a day among the looms and the ferries. The river's measure is noted, and a small turn of fortune favours you.", "你在织机与渡船之间过了一日。河水的尺度已记，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1200, reason: "bought-silk-and-gold-at-cacanfu-loom-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-and-gold-at-cacanfu-loom" },
        { op: "codex", value: "cx-cacanfu", reason: "learned-the-river-looms-of-cacanfu" },
        { op: "queue_event", value: "ev-cacanfu-a-followup", reason: "cacanfu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "chinangli", reason: "ferry-clerk-named-the-down-river-road" },
        { op: "reveal_map", value: "linju", reason: "ferry-clerk-named-linju" },
        { op: "codex", value: "cx-cacanfu", reason: "learned-the-water-road-to-cambaluc" },
        { op: "queue_event", value: "ev-cacanfu-a-followup", reason: "cacanfu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-looms-of-cacanfu" },
        { op: "fate", id: "wealth", value: 1, reason: "measured-the-river-of-cacanfu" },
      ],
    ],
    followup: {
      title: ["Cacanfu: The Clerk's Second Page", "河间府：账房的第二页"],
      body: [
        "The ferry clerk turns back a page of his ledger and lays it before you. He says the river remembers every toll between this city and Cambaluc, and that the stuffs woven here are carried down to Chinangli and Linju, and up to the great city where the Kaan's court pays in paper. He asks whether you mean to trade in thread or in water.",
        "账房把账册翻回一页摊在你面前。他说这条河记得河间到汗八里之间的每一道关卡；此地织的织物，或下长芦与陵州，或上大都，宫廷以交钞偿付。他问你此行要买卖的是丝线，还是水路。",
      ],
      choices: [
        ["Buy salt packed for the canal road", "买下封好走运河路的盐"],
        ["Ask him to name the days to Cambaluc and Chandu", "问他到汗八里与上都要几日"],
        ["Sit a while over the ledger and hear the river's tolls", "在账册边坐一会儿，听河上的关卡"],
      ],
      results: [
        ["He sells you salt at a price the canal boats accept. The salt of Changlu is packed and ready for the water.", "他按运河船认的价钱卖给你盐。长芦之盐已包好待行。"],
        ["Cambaluc and Chandu are named with the days between. The two great cities are no longer only names.", "汗八里与上都连同其间的日子被点名。两座大都城不再只是名字。"],
        ["You sit a while over the ledger. The tolls and the river's moods are noted, and in Cacanfu your name now carries a little more weight.", "你在账册边坐了一会儿。关卡与河性已记，你的名字在河间府也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -350, reason: "bought-changlu-salt-for-the-canal-road" },
        { op: "goods", id: "salt", value: 1, reason: "bought-changlu-salt-at-cacanfu" },
        { op: "codex", value: "cx-cacanfu", reason: "carried-porcelain-for-the-canal" },
      ],
      [
        { op: "reveal_map", value: "cambaluc", reason: "clerk-named-the-days-to-cambaluc" },
        { op: "reveal_map", value: "chandu", reason: "clerk-named-the-days-to-chandu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-tolls-to-the-two-capitals" },
      ],
      [
        { op: "days", value: 1, reason: "studied-the-ferry-ledger" },
        { op: "reputation", value: 1, scope: "city", id: "cacanfu", reason: "sat-over-the-river-ledger" },
      ],
    ],
  },
  {
    city: "cachanfu",
    tier: "town",
    zhName: "河中府（蒲州）",
    enName: "Cachanfu",
    lore: { placeId: "cachanfu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c040" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Cachanfu: The Ferrymen of the Great River", "河中府：大河的渡夫"],
      body: [
        "At the great river that no bridge can span, the ferrymen of Cachanfu work the boats that carry ginger and silk from bank to bank. An old boatman who knows the crossings says the river reaches to the encircling ocean and will not be crossed except where the current is known — and that game is so plentiful here that a man may buy three pheasants for a groat of silver.",
        "在无桥可渡的大河上，河中府的渡夫驾船载运姜与丝，往来两岸。一位识得渡口的老船夫说，此河直通环宇大海，非识水势者不能渡——而此地野味极丰，一枚银格罗便能买得三只野鸡。",
      ],
      choices: [
        ["Buy ginger at the riverside market price", "按河市之价买下生姜"],
        ["Ask the boatman the crossings toward Saianfu", "问船夫通往襄阳的渡口"],
        ["Watch the river a day from the ferry landing", "在渡口看一日河水"],
      ],
      results: [
        ["He sells you ginger at a fair weight. The root will keep on the road, and the account of Cachanfu goes with it.", "他按公道分量卖给你姜。此根可存于行路，河中府的记述也随它同行。"],
        ["He names the crossings: Saianfu by the southern ford, Sindafu by the western. Both are on your map now.", "他点出渡口：襄阳走南渡，成都走西渡。两者都已上你的舆图。"],
        ["You watch the river a day from the landing. The current's measure is noted, and a small turn of fortune favours you.", "你在渡口看了一日河水。水势之度已记，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -450, reason: "bought-ginger-at-cachanfu-riverside-price" },
        { op: "goods", id: "ginger", value: 1, reason: "bought-ginger-at-cachanfu" },
        { op: "codex", value: "cx-cachanfu", reason: "learned-the-great-river-crossings" },
        { op: "queue_event", value: "ev-cachanfu-a-followup", reason: "cachanfu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "saianfu", reason: "boatman-named-the-southern-ford" },
        { op: "reveal_map", value: "sindafu", reason: "boatman-named-the-western-ford" },
        { op: "codex", value: "cx-cachanfu", reason: "mapped-the-ferries-of-the-great-river" },
        { op: "queue_event", value: "ev-cachanfu-a-followup", reason: "cachanfu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-great-river" },
        { op: "fate", id: "wealth", value: 1, reason: "measured-the-current-of-cachanfu" },
      ],
    ],
    followup: {
      title: ["Cachanfu: The Boatman's Second Word", "河中府：船夫的第二句话"],
      body: [
        "The boatman hauls his boat up on the bank and speaks low. He says the river has drowned more merchants than the mountains have robbed, and that a traveller who reads the water can cross in a morning where another waits a week. He marks the fords and the eddies on a scrap of cloth, and asks where you mean to go with your cargo.",
        "船夫把船拖上岸，压低声音说。他说这条河淹死的商人多过山贼劫的；识水之人一个早晨便能过河，不识者要等上一周。他在布片上标出渡口与回涡，问你带着货要去哪里。",
      ],
      choices: [
        ["Buy silk at his crossing price for the western road", "按他的渡口价买下丝绸，备西路之用"],
        ["Ask him to mark the road toward Egrigaia", "请他标出通往额里合牙的路"],
        ["Wait a day to learn the crossings by heart", "等一日，把渡口记在心上"],
      ],
      results: [
        ["He sells you silk at a price the western markets will take. The bolt is sealed against the river damp.", "他按西路市集认的价钱卖给你丝。布匹已封好防水气。"],
        ["Egrigaia is marked on your map with the fords between. The Tangut road is no longer a blank.", "额里合牙连同其间的渡口已标上舆图。唐古忒之路不再是空白。"],
        ["You wait a day on the bank. The crossings are learned, and in Cachanfu your name now carries a little more weight.", "你在岸边等了一日。渡口已记心上，在河中府的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1000, reason: "bought-silk-at-cachanfu-crossing-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-for-the-western-road" },
        { op: "codex", value: "cx-cachanfu", reason: "carried-silk-from-the-great-river" },
      ],
      [
        { op: "reveal_map", value: "egrigaia", reason: "boatman-marked-the-road-to-egrigaia" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-fords-to-tangut" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-crossings-by-heart" },
        { op: "reputation", value: 1, scope: "city", id: "cachanfu", reason: "studied-the-river-with-the-boatman" },
      ],
    ],
  },
  {
    city: "caiju",
    tier: "town",
    zhName: "瓜州",
    enName: "Caiju",
    lore: { placeId: "caiju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c072" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Caiju: The Granary Canal", "瓜州：粮运之渠"],
      body: [
        "At the small city where the great canal is dug between stream and stream, the granary clerks of Caiju keep the corn and rice that go up to the Kaan's court at Cambaluc. A clerk who stamps the grain boats says the whole water-communication from this city to the great city passes through his books — and that a traveller who rides on without hearing the canal's seasons pays in days what another pays in coin.",
        "在运河接通河与湖的这座小城，瓜州的仓吏掌管北运汗八里宫廷的米谷。一位为粮船盖印的书吏说，自本城通达大都的水路尽在其册——不闻运渠时令的旅人，付出的日子是他人付出的钱钞。",
      ],
      choices: [
        ["Buy rhubarb at the granary road price", "按仓道之价买下大黄"],
        ["Ask the clerk the water road toward Nanghin", "问书吏通往扬州的水路"],
        ["Count a day of grain boats with the clerks", "与书吏清点一日粮船"],
      ],
      results: [
        ["He sells you rhubarb at a price the canal boats accept. The root is packed and ready for the water road.", "他按运河船认的价钱卖给你大黄。药材已包好待行水路。"],
        ["Nanghin and Chinginju are marked on your map. The canal south is clear.", "扬州与常州已标上你的舆图。南去之渠清晰。"],
        ["You spend a day among the grain boats. The canal's seasons are noted, and a small turn of fortune favours you.", "你在粮船间过了一日。运渠的时令已记，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -500, reason: "bought-rhubarb-at-caiju-granary-price" },
        { op: "goods", id: "rhubarb", value: 1, reason: "bought-rhubarb-at-caiju" },
        { op: "codex", value: "cx-caiju", reason: "learned-the-granary-canal" },
        { op: "queue_event", value: "ev-caiju-a-followup", reason: "caiju-a-followup" },
      ],
      [
        { op: "reveal_map", value: "nanghin", reason: "clerk-named-the-water-road-to-nanghin" },
        { op: "reveal_map", value: "chinginju", reason: "clerk-named-chinginju" },
        { op: "codex", value: "cx-caiju", reason: "mapped-the-canal-from-caiju" },
        { op: "queue_event", value: "ev-caiju-a-followup", reason: "caiju-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "counted-grain-boats-at-caiju" },
        { op: "fate", id: "wealth", value: 1, reason: "studied-the-granary-season" },
      ],
    ],
    followup: {
      title: ["Caiju: The Clerk's Measure of the Canal", "瓜州：书吏的运渠尺度"],
      body: [
        "The clerk draws the canal on the ground with his seal: this reach deep, that reach shoal, the locks where the boats wait, the days between Caiju and the great city. He says the grain of this part of the country feeds the Kaan's court, and that a traveller who knows the water-communication may ride the canal as another rides a road.",
        "书吏用印在泥地上画出运河：此段水深，彼段水浅，何处船候闸口，瓜州与大城之间几日。他说此地之谷养着宫廷，识得水路的旅人，行渠如同行路。",
      ],
      choices: [
        ["Buy tea sealed for the canal passage", "买下封好走运河的茶叶"],
        ["Ask him to name the reaches toward Sinju", "问他通往真州的水程"],
        ["Wait a day and watch the grain fleet make up", "等一日，看粮船编队"],
      ],
      results: [
        ["He sells you tea at a fair price. The leaves are sealed for the passage north or south.", "他按公道价卖给你茶。叶子已封好，南北皆可行。"],
        ["Sinju and Tiju are marked on your map with the reaches between. The canal is no longer a single line.", "真州与高邮连同其间水程已标上舆图。运河不再只是一条线。"],
        ["You wait a day while the grain fleet makes up. The convoy's measure is learned, and in Caiju your name now carries a little more weight.", "你等了一日粮船编队。船队的尺度已学，你的名字在瓜州也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -600, reason: "bought-tea-for-the-canal-passage" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-caiju" },
        { op: "codex", value: "cx-caiju", reason: "carried-tea-on-the-granary-canal" },
      ],
      [
        { op: "reveal_map", value: "sinju", reason: "clerk-named-the-reach-to-sinju" },
        { op: "reveal_map", value: "tiju", reason: "clerk-named-the-reach-to-tiju" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-canal-reaches" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-grain-fleet-make-up" },
        { op: "reputation", value: 1, scope: "city", id: "caiju", reason: "waited-with-the-granary-clerks" },
      ],
    ],
  },
  {
    city: "chinghianfu",
    tier: "town",
    zhName: "镇江府",
    enName: "Chinghianfu",
    lore: { placeId: "chinghianfu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c073" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Chinghianfu: The Weavers and the Church of Mar Sarghis", "镇江府：织工与马薛里吉思的教堂"],
      body: [
        "In the rich city of Manzi where silk is woven into stuffs of silk and gold, a weaver who keeps the guild book draws you aside in the market. He says the city has great and wealthy merchants, and that a church of the Nestorians stands here because the Kaan sent a baron of his own, Mar Sarghis, to rule this city for three years. He asks whether you have come to trade in thread or in news.",
        "在织绸与金线的富庶江城，一位掌管行会的织工在市集把你引到一旁。他说此城商贾豪富，且有景教教堂立于此——因大汗遣其臣马薛里吉思来此治城三年。他问你此行是来贩丝线，还是来听消息。",
      ],
      choices: [
        ["Buy silk-and-gold at the guild price", "按行会之价买下绸金织物"],
        ["Ask the weaver the roads toward Nanghin", "问织工通往扬州的路"],
        ["Walk the streets a day and note the two faiths' quarter", "走一日街巷，记下两教的坊区"],
      ],
      results: [
        ["He sells you the stuff at the guild's fixed price. The bolt is ready for the canal, and the account of Chinghianfu goes with it.", "他按行会定价卖给你织物。布匹已备好行运河，镇江府的记述也随它同行。"],
        ["Nanghin and Sinju are marked on your map. The silk roads of Manzi are opening before you.", "扬州与真州已标上你的舆图。蛮子的丝路正在你面前展开。"],
        ["You spend a day in the streets. The church and the temple keep their own bells, and a small turn of fortune favours you.", "你在街巷走了一日。教堂与寺观各敲各的钟，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-silk-and-gold-at-chinghianfu-guild-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-and-gold-at-chinghianfu" },
        { op: "codex", value: "cx-chinghianfu", reason: "learned-the-silk-guild-of-chinghianfu" },
        { op: "queue_event", value: "ev-chinghianfu-a-followup", reason: "chinghianfu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "nanghin", reason: "weaver-named-the-road-to-nanghin" },
        { op: "reveal_map", value: "sinju", reason: "weaver-named-the-road-to-sinju" },
        { op: "codex", value: "cx-chinghianfu", reason: "mapped-the-manzi-silk-roads" },
        { op: "queue_event", value: "ev-chinghianfu-a-followup", reason: "chinghianfu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-two-faiths-quarter" },
        { op: "fate", id: "rapport", value: 1, reason: "noted-the-two-bells-of-chinghianfu" },
      ],
    ],
    followup: {
      title: ["Chinghianfu: The Guild Book's Second Page", "镇江府：行会册的第二页"],
      body: [
        "The weaver opens the guild book at a page marked with the year of the church's founding. He says Mar Sarghis set up the church in the year 1278, and that the Nestorians and the idolaters keep the peace in this city because the Kaan's law holds both in the same hand. He asks what you would carry from a city that keeps two faiths under one peace.",
        "织工把行会册翻到教堂建年那一页。他说马薛里吉思于一二七八年立此堂，景教与偶像之民所以同城相安，因大汗之法一手持两教。他问你从这共安一城的双教之地要带走什么。",
      ],
      choices: [
        ["Buy a lacquer piece at the market's measured price", "按市集公道价买下一件漆器"],
        ["Ask the way toward Caiju and the coast", "问通往瓜州与海边的路"],
        ["Sit a day with the weavers and hear the city's tale", "与织工共坐一日，听此城旧事"],
      ],
      results: [
        ["He sells you lacquer at a fair price. The piece is sealed for the road north.", "他按公道价卖给你漆器。物件已封好待行北路。"],
        ["Caiju and Chinginju are marked on your map. The canal network of Manzi is taking shape.", "瓜州与常州已标上你的舆图。蛮子的运河网正逐渐成形。"],
        ["You sit a day among the looms. The tale of the baron and the church is yours now, and in Chinghianfu your name carries a little more weight.", "你在织机间坐了一日。那位大臣与教堂的故事已归你所有，镇江府的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -700, reason: "bought-lacquer-at-chinghianfu-market" },
        { op: "goods", id: "lacquerware", value: 1, reason: "bought-lacquer-at-chinghianfu" },
        { op: "codex", value: "cx-chinghianfu", reason: "carried-lacquer-from-the-two-faiths-city" },
      ],
      [
        { op: "reveal_map", value: "caiju", reason: "weavers-named-the-road-to-caiju" },
        { op: "reveal_map", value: "chinginju", reason: "weavers-named-chinginju" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-canal-network" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-tale-of-mar-sarghis" },
        { op: "reputation", value: 1, scope: "city", id: "chinghianfu", reason: "sat-with-the-weavers" },
      ],
    ],
  },
  {
    city: "chinginju",
    tier: "town",
    zhName: "常州",
    enName: "Chinginju",
    lore: { placeId: "chinginju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c074" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Chinginju: The Market of the Busy Streets", "常州：闹市之衢"],
      body: [
        "In the great and noble city that stands three days south-east of Chinghianfu, the market masters of Chinginju keep their stalls on the busiest streets of Manzi. A master who prices silk and game says the city lives by trade and handicrafts, and that its territory yields abundance — but that the streets still remember an evil deed done in the conquest, and strangers who speak of it lightly are marked. He asks your business plainly.",
        "在镇江府东南三日路程的大城，常州的市正守着蛮子最繁忙的街市。一位为丝与野味定价的市正说，此城以商贾与手艺为生，物产丰饶——但街巷仍记着征服时的一桩恶行，轻谈此事的生客会被人记下。他直截问你此行何干。",
      ],
      choices: [
        ["Buy silk at the market's fixed price", "按市价买下丝绸"],
        ["Ask the roads toward Suju and the coast", "问通往苏州与海边的路"],
        ["Walk the busy streets a day and note the city's temper", "在闹市走一日，记下此城的脾性"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed, and the account of Chinginju goes with it.", "他按公道价卖给你丝。布匹已封好，常州的记述也随它同行。"],
        ["Suju and Chinghianfu are marked on your map. The southern silk cities are no longer only names.", "苏州与镇江府已标上你的舆图。南方的丝城不再只是名字。"],
        ["You walk the streets a day. The city is busy and wary, and a small turn of fortune favours you.", "你在街市走了一日。此城繁忙而警觉，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-chinginju-market-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-chinginju" },
        { op: "codex", value: "cx-chinginju", reason: "learned-the-market-of-chinginju" },
        { op: "queue_event", value: "ev-chinginju-a-followup", reason: "chinginju-a-followup" },
      ],
      [
        { op: "reveal_map", value: "suju", reason: "market-master-named-the-road-to-suju" },
        { op: "reveal_map", value: "chinghianfu", reason: "market-master-named-chinghianfu" },
        { op: "codex", value: "cx-chinginju", reason: "mapped-the-southern-silk-cities" },
        { op: "queue_event", value: "ev-chinginju-a-followup", reason: "chinginju-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-busy-streets-of-chinginju" },
        { op: "fate", id: "wealth", value: 1, reason: "noted-the-temper-of-the-market" },
      ],
    ],
    followup: {
      title: ["Chinginju: The Market Master's Second Word", "常州：市正的第二句话"],
      body: [
        "The market master lowers his voice behind the stall. He says the city's wealth is silk and game and trade, but its memory is the conquest — the evil deed that the streets do not forget, and the price that was paid. He tells it as a warning, not a tale: strangers who weigh a city's worth by its stalls alone are fools, and the road to Suju runs through streets that remember.",
        "市正在摊后压低声音。他说此城之富在丝、在野味、在商贾，但其记忆在征服——街巷不忘的那桩恶行，与付出的代价。他把它当作告诫来讲，而非故事：只看摊位衡量一城之值的生客是愚人，往苏州的路正穿过记得往事的街巷。",
      ],
      choices: [
        ["Buy tea sealed for the southern road", "买下封好南行的茶叶"],
        ["Ask him to name the road toward Kinsay", "请他点名通往行在的路"],
        ["Wait a day and learn the city's cautions", "等一日，学会此城的戒慎"],
      ],
      results: [
        ["He sells you tea at a fair price. The leaves are sealed and will keep on the road south.", "他按公道价卖给你茶。叶子已封好，南行路上经得久。"],
        ["Kinsay is marked on your map with the days between. The great city is drawing nearer.", "行在连同其间的日子已标上舆图。大都城正在靠近。"],
        ["You wait a day and listen. The cautions are learned, and in Chinginju your name now carries a little more weight.", "你等了一日，听在心上。戒慎已学，你的名字在常州也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -550, reason: "bought-tea-at-chinginju-for-the-southern-road" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-chinginju" },
        { op: "codex", value: "cx-chinginju", reason: "provisioned-at-chinginju-market" },
      ],
      [
        { op: "reveal_map", value: "kinsay", reason: "market-master-named-the-road-to-kinsay" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-road-to-the-great-city" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-cautions-of-chinginju" },
        { op: "reputation", value: 1, scope: "city", id: "chinginju", reason: "listened-to-the-market-master" },
      ],
    ],
  },
  {
    city: "coigangiu",
    tier: "station",
    zhName: "淮阴",
    enName: "Coigangiu",
    lore: { placeId: "coigangiu", origin: "authored", disposition: "checked-weak", note: "已查：运河镇，入口文本后深化。" },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Coigangiu: The Boatwrights of the Canal Town", "淮阴：船镇的木匠"],
      body: [
        "In the boat-town on the Grand Canal, the boatwrights of Coigangiu work the sampans under the willows, and every family keeps a boat as other families keep a door. A boatwright who has caulked hulls since boyhood says the grain fleet passes in autumn on its way to Cambaluc, and that a traveller who knows the canal can hire a sampan for the reach as another hires a horse for the road. He asks if you mean to buy timber's worth or water's worth.",
        "大运河船镇里，淮阴的木匠在柳下修造舢板，家家有船如同家家有门。一位自小捻缝的船匠说，秋时粮船北上汗八里，识得大运河的人雇一条舢板如同他人雇一匹马。他问你要买的是木头的价钱，还是水路的价钱。",
      ],
      choices: [
        ["Buy a small sampan's worth of river salt for the road", "按船价买下一份河盐备路"],
        ["Ask the boatwright the reaches toward Paukin", "问船匠通往宝应的水程"],
        ["Help caulk a hull a day and learn the river", "帮工捻缝一日，学一学这条河"],
      ],
      results: [
        ["He sells you salt at a fair weight. It will keep on any road, and the account of Coigangiu goes with it.", "他按公道分量卖给你盐。此物存于任何路途，淮阴的记述也随它同行。"],
        ["Paukin and Siju are marked on your map. The canal reaches are clear.", "宝应与邳州已标上你的舆图。运河的水程清晰。"],
        ["You spend a day among the hulls. The river's habits are learned, and a small turn of fortune favours you.", "你在船壳间过了一日。河性已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -350, reason: "bought-river-salt-at-coigangiu" },
        { op: "goods", id: "salt", value: 1, reason: "bought-river-salt-at-coigangiu" },
        { op: "codex", value: "cx-coigangiu", reason: "coigangiu-book-entry" },
        { op: "queue_event", value: "ev-coigangiu-a-followup", reason: "coigangiu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "paukin", reason: "boatwright-named-the-reach-to-paukin" },
        { op: "reveal_map", value: "siju", reason: "boatwright-named-the-reach-to-siju" },
        { op: "queue_event", value: "ev-coigangiu-a-followup", reason: "coigangiu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "caulked-hulls-at-coigangiu" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-river-of-the-boat-town" },
      ],
    ],
    followup: {
      title: ["Coigangiu: The Boatwright's River Book", "淮阴：船匠的河书"],
      body: [
        "The boatwright sets down his adze and speaks of the river as of a person. He says the canal has moods — autumn fleets, spring shallows, the reach above Siju where the towpath fails — and that the boatmen keep a book of them passed from father to son. He offers you a page of it, if you will carry nothing away but the knowing.",
        "船匠放下锛子，把这条河说得像一个人。他说运河有脾性——秋有船队，春有浅滩，邳州上游的纤道会断——船家有一本父传子的河书。他愿给你一页，只要你只带走这分知晓。",
      ],
      choices: [
        ["Buy tea for the damp canal nights", "买下茶叶，备运河夜寒"],
        ["Ask the boatmen's reaches toward Tiju", "问船家通往高邮的水程"],
        ["Sit an evening with the boatmen by the water", "与船家在岸边坐一个黄昏"],
      ],
      results: [
        ["He sells you tea at a fair price. The leaves are sealed against the river damp.", "他按公道价卖给你茶。叶子已封好防潮。"],
        ["Tiju and Coiganju are marked on your map with the shallows between. The river book is yours in part.", "高邮与淮安连同其间浅滩已标上舆图。河书你已得其页。"],
        ["You sit an evening by the water. The talk is of currents and cargoes, and in Coigangiu your name now carries a little more weight.", "你在水边坐了一个黄昏。话里皆是水与货，淮阴的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -500, reason: "bought-tea-for-the-canal-nights" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-coigangiu" },
      ],
      [
        { op: "reveal_map", value: "tiju", reason: "boatmen-named-the-reach-to-tiju" },
        { op: "reveal_map", value: "coiganju", reason: "boatmen-named-coiganju" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-river-book" },
      ],
      [
        { op: "days", value: 1, reason: "sat-an-evening-with-the-boatmen" },
        { op: "reputation", value: 1, scope: "city", id: "coigangiu", reason: "sat-with-the-boatmen" },
      ],
    ],
  },
  {
    city: "coiganju",
    tier: "town",
    zhName: "淮安",
    enName: "Coiganju",
    lore: { placeId: "coiganju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c066" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Coiganju: The Salt Yards at the Gate of Manzi", "淮安：蛮子门前的盐场"],
      body: [
        "At the very large city standing at the entrance to Manzi, the salt masters of Coiganju work the yards that furnish some forty other cities with salt. A master who has measured brine for a lifetime says the city is the seat of government for this part of the country, and that an immense quantity of merchandise passes through on the river — and that a traveller who buys salt here without hearing the yard's measure pays a stranger's price.",
        "在蛮子入口的大城，淮安的盐场主经营着供四十余城用盐的盐场。一位量了一辈子卤水的场主说，此城为此地治所，河上商货往来无算——不闻盐场尺度便买盐的旅人，付的是生客之价。",
      ],
      choices: [
        ["Buy salt at the yard's fixed price", "按盐场定价买下盐"],
        ["Ask the master the roads toward Paukin", "问场主通往宝应的路"],
        ["Walk the salt yards a day and note the brine's measure", "在盐场走一日，记下卤水的尺度"],
      ],
      results: [
        ["He sells you salt at the yard's fair price. It is good salt, and the account of Coiganju goes with it.", "他按盐场公道价卖给你盐。盐是好盐，淮安的记述也随它同行。"],
        ["Paukin and Tiju are marked on your map. The road north from the gate of Manzi is clear.", "宝应与高邮已标上你的舆图。自蛮子门北去的路清晰。"],
        ["You spend a day among the pans. The brine's measure is learned, and a small turn of fortune favours you.", "你在盐田间过了一日。卤水的尺度已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-salt-at-coiganju-yard-price" },
        { op: "goods", id: "salt", value: 1, reason: "bought-salt-at-coiganju" },
        { op: "codex", value: "cx-coiganju", reason: "learned-the-salt-yards-of-coiganju" },
        { op: "queue_event", value: "ev-coiganju-a-followup", reason: "coiganju-a-followup" },
      ],
      [
        { op: "reveal_map", value: "paukin", reason: "salt-master-named-the-road-to-paukin" },
        { op: "reveal_map", value: "tiju", reason: "salt-master-named-the-road-to-tiju" },
        { op: "codex", value: "cx-coiganju", reason: "mapped-the-roads-from-the-gate-of-manzi" },
        { op: "queue_event", value: "ev-coiganju-a-followup", reason: "coiganju-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-salt-yards" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-brine-measure" },
      ],
    ],
    followup: {
      title: ["Coiganju: The Salt Master's Ledger", "淮安：盐场主的账册"],
      body: [
        "The salt master opens his ledger at the page of the forty cities. He says the salt of this yard feeds them all, and that the revenue it brings the Kaan is incredible — but that salt is only half the city's trade; the river brings the produce of many cities here to be distributed in every direction. He asks whether you will carry salt, or the knowledge of where it goes.",
        "盐场主把账册翻到四十城那一页。他说此场之盐养彼四十城，贡于大汗的岁入不可胜计——但盐只是此城一半的生意；河上运来诸城物产，再由这里分发四方。他问你要带走盐，还是带走盐的去向。",
      ],
      choices: [
        ["Buy silk at the distribution price", "按集散之价买下丝绸"],
        ["Ask him to name the roads toward Siju", "问他通往邳州的路"],
        ["Sit a while in the yard office and hear the trade's seasons", "在场署坐一会儿，听生意的时令"],
      ],
      results: [
        ["He sells you silk at a price the distributing trade accepts. The bolt is sealed for the road.", "他按集散贸易认的价钱卖给你丝。布匹已封好待行。"],
        ["Siju and the northern reaches are marked on your map. The river's distribution is becoming clear.", "邳州与北去水程已标上舆图。河上的集散正逐渐清晰。"],
        ["You sit a while in the yard office. The trade's seasons are learned, and in Coiganju your name now carries a little more weight.", "你在场署坐了一会儿。生意的时令已学，你的名字在淮安也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-coiganju-distribution-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-coiganju" },
        { op: "codex", value: "cx-coiganju", reason: "carried-silk-from-the-salt-city" },
      ],
      [
        { op: "reveal_map", value: "siju", reason: "salt-master-named-the-road-to-siju" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-distribution-trade" },
      ],
      [
        { op: "days", value: 1, reason: "sat-in-the-yard-office" },
        { op: "reputation", value: 1, scope: "city", id: "coiganju", reason: "studied-the-trade-seasons" },
      ],
    ],
  },
  {
    city: "etzina",
    tier: "town",
    zhName: "亦集乃（黑水城）",
    enName: "Etzina",
    lore: { placeId: "etzina", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c045" } },
    scene: { bg: "desert-town", region: "china" },
    site: {
      title: ["Etzina: The Falconers of the Desert Verge", "亦集乃：漠缘的鹰师"],
      body: [
        "At the city on the verge of the Sandy Desert, the falconers of Etzina keep sakers and lanners in hooded rows, and every traveller who means to enter the forty-day desert must lay in victuals here. A falconer who has hooded birds for the caravans says the country produces plenty of camels and cattle, and the people live by their cultivation and their flocks, having no trade — but the falcons are the desert's true wealth, and he will part with one only to a traveller who knows what it is for.",
        "在沙海边缘之城，亦集乃的鹰师养着一排排蒙眼的猎隼与兰纳隼，凡要入四十日沙漠的旅人皆须在此备粮。一位为商队蒙鹰多年的鹰师说，此地多骆驼与牲畜，民以耕作畜牧为生，本无商贸——但鹰才是沙海真正的财富，他只肯把鹰交予识得鹰之用途的旅人。",
      ],
      choices: [
        ["Buy a saker falcon at the falconer's price", "按鹰师之价买下一只猎隼"],
        ["Ask the falconer the provisioning road toward Sachiu", "问鹰师通往沙州的补给之路"],
        ["Watch the hooding a day and learn the desert birds", "看一日蒙鹰，学认沙海的鸟"],
      ],
      results: [
        ["He sells you a saker at his fixed price, hooded and jessed. The bird will hunt or fetch a price in any city of the steppe.", "他按定价卖给你一只猎隼，已蒙眼系绊。此鸟可猎，也可在任何草原之城卖出价钱。"],
        ["Sachiu and Caracoron are marked on your map, with the victualling stations between. The desert roads are no longer blank.", "沙州与哈剌和林连同其间驿站已标上舆图。漠路不再是空白。"],
        ["You spend a day among the hoods. The desert birds' measure is learned, and a small turn of fortune favours you.", "你在鹰架间过了一日。沙海之鸟的尺度已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1500, reason: "bought-saker-at-etzina-falconer-price" },
        { op: "goods", id: "hunting-falcon", value: 1, reason: "bought-saker-at-etzina" },
        { op: "codex", value: "cx-etzina", reason: "learned-the-falconers-of-etzina" },
        { op: "queue_event", value: "ev-etzina-a-followup", reason: "etzina-a-followup" },
      ],
      [
        { op: "reveal_map", value: "sachiu", reason: "falconer-named-the-road-to-sachiu" },
        { op: "reveal_map", value: "caracoron", reason: "falconer-named-the-road-to-caracoron" },
        { op: "codex", value: "cx-etzina", reason: "mapped-the-victualling-roads" },
        { op: "queue_event", value: "ev-etzina-a-followup", reason: "etzina-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-hooding-at-etzina" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-desert-birds" },
      ],
    ],
    followup: {
      title: ["Etzina: The Falconer's Second Word", "亦集乃：鹰师的第二句话"],
      body: [
        "The falconer takes you to the desert edge and points north. He says forty days of desert lie there without habitation or baiting-place, and that a traveller who does not read the sand will find water where there is none. He speaks of the falcons as the desert's proof of life — where the birds hunt, the wells are never far. He asks if you will carry a bird, or the reading of the sand.",
        "鹰师把你领到漠缘，指向北方。他说此去四十日沙漠，无人烟、无歇处；不识沙的旅人会到没有水的地方去找水。他把鹰说成沙海有生命的凭证——鸟能猎处，井必不远。他问你要带一只鸟，还是要带读沙之能。",
      ],
      choices: [
        ["Buy a lanner at the falconer's desert price", "按鹰师的漠价买下一只兰纳隼"],
        ["Ask him to mark the wells toward Egrigaia", "请他标出通往额里合牙的水井"],
        ["Wait a day to learn the sand-reading by the falcons", "等一日，借鹰学读沙"],
      ],
      results: [
        ["He sells you a lanner at a fair price. The bird is lighter than the saker, and quicker on the wing.", "他按公道价卖给你一只兰纳隼。此鸟比猎隼轻，翔得更疾。"],
        ["Egrigaia is marked on your map with the wells the falcons know. The south road is no longer blind.", "额里合牙连同鹰识的水井已标上舆图。南路不再盲目。"],
        ["You wait a day watching the birds work the sand. The reading is learned, and in Etzina your name now carries a little more weight.", "你看了一日鹰在沙上捕猎。读沙之能已学，亦集乃的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-lanner-at-etzina-desert-price" },
        { op: "goods", id: "hunting-falcon", value: 1, reason: "bought-lanner-at-etzina" },
        { op: "codex", value: "cx-etzina", reason: "carried-a-lanner-from-the-desert-verge" },
      ],
      [
        { op: "reveal_map", value: "egrigaia", reason: "falconer-marked-the-wells-to-egrigaia" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-falcons-wells" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-sand-reading" },
        { op: "reputation", value: 1, scope: "city", id: "etzina", reason: "studied-with-the-falconers" },
      ],
    ],
  },
  // ─── B1 china · 2/2 ───────────────────────────────────────────────
  {
    city: "fuju",
    tier: "town",
    zhName: "福州",
    enName: "Fuju",
    lore: { placeId: "fuju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c081" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Fuju: The Shipwrights of the Mile-Wide River", "福州：一里江上的船匠"],
      body: [
        "At the key of the kingdom of Chonka, the shipwrights of Fuju build great vessels on a river a mile in width, and the city's garrison keeps the peace over a seat of great trade. A master shipwright who has launched a hundred hulls says enormous quantities of sugar are made here, and that many ships of the Indian seas are built upon this river — and that a city which is apt to revolt is also a city that knows how to bargain.",
        "在镇守 Chonka 国门的要地，福州的船匠在宽一里的江上营造大船，城中驻军守着这座大商埠的太平。一位放过百艘船的匠首说，此地制糖极多，印度洋上许多海船即造于此江——而一座易反的城，也是最会讲价的城。",
      ],
      choices: [
        ["Buy sugar at the riverside price", "按江岸之价买下糖"],
        ["Ask the shipwright the sea road toward Zayton", "问船匠通往刺桐的海路"],
        ["Watch the yard a day and learn the hulls' measure", "看一日船坞，学一学船型"],
      ],
      results: [
        ["He sells you sugar at a fair weight. It will keep on any passage, and the account of Fuju goes with it.", "他按公道分量卖给你糖。此物存于任何航程，福州的记述也随它同行。"],
        ["Zayton and Kinsay are marked on your map. The sea and river roads of the coast are opening.", "刺桐与行在已标上你的舆图。沿海的水路正在展开。"],
        ["You spend a day among the hulls. The vessels' measure is learned, and a small turn of fortune favours you.", "你在船壳间过了一日。船型之度已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -500, reason: "bought-sugar-at-fuju-riverside-price" },
        { op: "goods", id: "sugar", value: 1, reason: "bought-sugar-at-fuju" },
        { op: "codex", value: "cx-fuju", reason: "learned-the-shipyards-of-fuju" },
        { op: "queue_event", value: "ev-fuju-a-followup", reason: "fuju-a-followup" },
      ],
      [
        { op: "reveal_map", value: "zayton", reason: "shipwright-named-the-sea-road-to-zayton" },
        { op: "reveal_map", value: "kinsay", reason: "shipwright-named-the-road-to-kinsay" },
        { op: "codex", value: "cx-fuju", reason: "mapped-the-coast-from-fuju" },
        { op: "queue_event", value: "ev-fuju-a-followup", reason: "fuju-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-yard-at-fuju" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-hulls-measure" },
      ],
    ],
    followup: {
      title: ["Fuju: The Master's Second Word on the River", "福州：匠首谈江的第二句话"],
      body: [
        "The master shipwright takes you to the water's edge and speaks of the river as a shipway. He says the great river flows through the middle of the city and carries the ships down to the sea roads, and that a traveller who reads the river may ride to the harbours as another rides a road. He asks whether your cargo will go by water or by land.",
        "匠首把你领到水边，把这条江说成一条船道。他说大江穿城而过，载船出海路；识得此江的旅人，行船如同行路。他问你的货要走水，还是走陆。",
      ],
      choices: [
        ["Buy tea sealed for the sea passage", "买下封好走海路的茶"],
        ["Ask him to name the river road toward Tanpiju", "请他点名通往通州的江路"],
        ["Sit a while at the yard and hear the launching days", "在船坞边坐一会儿，听放船的日子"],
      ],
      results: [
        ["He sells you tea at a fair price, sealed against the salt air. The leaves will hold on the sea road.", "他按公道价卖给你茶，已封好防咸风。叶子在海路上经得久。"],
        ["Tanpiju and Chamba are marked on your map. The river to the sea is no longer a single line.", "通州与占城已标上你的舆图。入海之江不再只是一条线。"],
        ["You sit a while at the yard. The launching days are learned, and in Fuju your name now carries a little more weight.", "你在船坞边坐了一会儿。放船的日子已记，你的名字在福州也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -550, reason: "bought-tea-for-the-sea-passage" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-fuju" },
        { op: "codex", value: "cx-fuju", reason: "carried-tea-from-the-shipyards" },
      ],
      [
        { op: "reveal_map", value: "tanpiju", reason: "master-named-the-river-road-to-tanpiju" },
        { op: "reveal_map", value: "chamba", reason: "master-named-the-sea-road-to-chamba" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-river-to-the-sea" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-launching-days" },
        { op: "reputation", value: 1, scope: "city", id: "fuju", reason: "sat-with-the-shipwrights" },
      ],
    ],
  },
  {
    city: "linju",
    tier: "town",
    zhName: "陵州",
    enName: "Linju",
    lore: { placeId: "linju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c063" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Linju: The Soldier Merchants of the River City", "陵州：江城里的兵商"],
      body: [
        "In the rich and noble city that stands upon the river, the men of Linju are said to be good soldiers yet carry on great trade and manufactures. A merchant who has served in the garrison and now prices silk on the wharf says the city has great numbers of vessels and all the necessaries of life in profusion, and game in both beasts and birds — and that a traveller who can hold a sword is welcomed in the market as one who can hold a price.",
        "在这座临江的富庶大城，陵州人既称善战，又经营大商与手艺。一位曾在驻军中服役、如今在码头给丝绸定价的商人说，此城船只极多，生活所需应有尽有，飞禽走兽的野味亦丰——能持剑的旅人，在市场上也如同能持价的人一样受待见。",
      ],
      choices: [
        ["Buy silk at the wharf price", "按码头之价买下丝绸"],
        ["Ask the merchant the road toward Sinjumatu", "问商人通往济宁的路"],
        ["Watch the vessels a day on the river", "看一日江上的船"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed, and the account of Linju goes with it.", "他按公道价卖给你丝。布匹已封好，陵州的记述也随它同行。"],
        ["Sinjumatu and Chinangli are marked on your map. The river roads north are clear.", "济宁与长芦已标上你的舆图。北去的江路清晰。"],
        ["You spend a day among the vessels. The river's traffic is learned, and a small turn of fortune favours you.", "你在船间过了一日。江上贸易之况已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-linju-wharf-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-linju" },
        { op: "codex", value: "cx-linju", reason: "learned-the-soldier-merchants-of-linju" },
        { op: "queue_event", value: "ev-linju-a-followup", reason: "linju-a-followup" },
      ],
      [
        { op: "reveal_map", value: "sinjumatu", reason: "merchant-named-the-road-to-sinjumatu" },
        { op: "reveal_map", value: "chinangli", reason: "merchant-named-the-road-to-chinangli" },
        { op: "codex", value: "cx-linju", reason: "mapped-the-river-roads-from-linju" },
        { op: "queue_event", value: "ev-linju-a-followup", reason: "linju-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-vessels-at-linju" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-river-traffic" },
      ],
    ],
    followup: {
      title: ["Linju: The Wharf Merchant's Second Page", "陵州：码头商人的第二页"],
      body: [
        "The merchant lays his ledger on a bale and shows you the river's account. He says the vessels carry the produce of the province north and south, and that game and silk are the two riches that never fail here — the one for the table, the other for the loom. He asks what a traveller who can hold a sword means to hold next.",
        "商人把账册摊在货包上，给你看这条江的账。他说船只载着本省物产南来北往，野味与丝绸是此地两样永不失传的富源——一样供桌案，一样供织机。他问你，这位能持剑的旅人接下来要握住什么。",
      ],
      choices: [
        ["Buy rhubarb at the merchant's road price", "按商人的路价买下大黄"],
        ["Ask him to mark the road toward Cacanfu", "请他标出通往河间府的路"],
        ["Wait a day in the garrison market and learn its ways", "在驻军市集等一日，学其规矩"],
      ],
      results: [
        ["He sells you rhubarb at a fair price. The root is packed and will keep on the northern road.", "他按公道价卖给你大黄。药材已包好，北路上经得久。"],
        ["Cacanfu is marked on your map with the days between. The river road north is complete.", "河间府连同其间的日子已标上舆图。北去江路已然完整。"],
        ["You wait a day in the garrison market. Its ways are learned, and in Linju your name now carries a little more weight.", "你在驻军市集等了一日。其规矩已学，陵州的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-rhubarb-at-linju-road-price" },
        { op: "goods", id: "rhubarb", value: 1, reason: "bought-rhubarb-at-linju" },
        { op: "codex", value: "cx-linju", reason: "carried-rhubarb-from-the-river-city" },
      ],
      [
        { op: "reveal_map", value: "cacanfu", reason: "merchant-marked-the-road-to-cacanfu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-northern-river-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-garrison-market" },
        { op: "reputation", value: 1, scope: "city", id: "linju", reason: "learned-the-market-ways" },
      ],
    ],
  },
  {
    city: "mien",
    tier: "town",
    zhName: "缅甸（蒲甘）",
    enName: "Mien",
    lore: { placeId: "mien", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c054" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Mien: The Two Towers by the King's Tomb", "缅甸：王陵前的金银双塔"],
      body: [
        "In the great and noble city of Mien, the people speak a peculiar language and keep the tomb of a rich and puissant king, beside which stand two towers — one of gold and one of silver — raised by his command as he lay dying. An old keeper who guards the tomb says the towers were to shine for the dead king's honour, and that the city is subject to the Great Kaan. He asks whether you have come to see the wonder or to trade.",
        "在缅甸的大城，百姓操一种独特的语言，守着一位富强大王的陵墓，墓旁立着两座塔——一金一银——乃王临终时命人建造。一位看守王陵的老者说，双塔是为死者之荣而设，而此城臣服于大汗。他问你是来看奇观，还是来做买卖。",
      ],
      choices: [
        ["Buy silk at the tomb-market price", "按陵市之价买下丝绸"],
        ["Ask the keeper the road toward Sindafu", "问老者通往成都府的路"],
        ["Circle the two towers a day and note their measure", "绕双塔走一日，记下其尺度"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed, and the account of Mien goes with it.", "他按公道价卖给你丝。布匹已封好，缅甸的记述也随它同行。"],
        ["Sindafu and Chamba are marked on your map. The roads out of the valley are no longer blank.", "成都府与占城已标上你的舆图。出谷之路不再是空白。"],
        ["You spend a day about the towers. Their measure is learned, and a small turn of fortune favours you.", "你在双塔间过了一日。其尺度已记，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-mien-tomb-market-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-mien" },
        { op: "codex", value: "cx-mien", reason: "learned-the-two-towers-of-mien" },
        { op: "queue_event", value: "ev-mien-a-followup", reason: "mien-a-followup" },
      ],
      [
        { op: "reveal_map", value: "sindafu", reason: "keeper-named-the-road-to-sindafu" },
        { op: "reveal_map", value: "chamba", reason: "keeper-named-the-road-to-chamba" },
        { op: "codex", value: "cx-mien", reason: "mapped-the-valley-exits" },
        { op: "queue_event", value: "ev-mien-a-followup", reason: "mien-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "circled-the-two-towers" },
        { op: "fate", id: "rapport", value: 1, reason: "honoured-the-dead-kings-memory" },
      ],
    ],
    followup: {
      title: ["Mien: The Keeper's Tale of the Dying King", "缅甸：老者所讲先王之死"],
      body: [
        "The keeper sits you down in the tomb's shade and tells the tale as it is told in the city. He says the king, when he was about to die, commanded the two towers so that his name might shine after him — one tower of gold, one of silver, each as tall as a tall man's lance. He says the towers have stood through the conquest, and that a traveller who remembers the king's wish is remembered kindly in Mien.",
        "老者让你在陵荫下坐下，把城中相传的旧事讲给你听。他说先王临终时下令立此双塔，使其名死后仍能发光——一塔以金，一塔以银，各如长枪之高。他说双塔历征服而不倒，记得先王遗愿的旅人，在缅甸会被人记在心上。",
      ],
      choices: [
        ["Offer a small gift at the tomb for the king's honour", "在王陵前为先王之荣献一份薄礼"],
        ["Ask the keeper the road toward the sea", "问老者通往海边的路"],
        ["Wait a day and hear the city's other wonders", "等一日，听此城的其他奇观"],
      ],
      results: [
        ["Your gift is accepted without ceremony. The keeper speaks your name to the tomb, and a little favour goes with you on the road.", "礼物被收下，并无繁文。老者把你的名字说给王陵听，路上多了一分照应。"],
        ["The road toward the coast is marked on your map. The way out of the valley opens further.", "通往海边的路已标上舆图。出谷之路又开了一程。"],
        ["You wait a day and hear the wonders. The city's tales are learned, and in Mien your name now carries a little more weight.", "你等了一日，听遍奇观。此城的传说已记，你的名字在缅甸也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -200, reason: "offered-at-the-tomb-of-mien" },
        { op: "reputation", value: 1, scope: "city", id: "mien", reason: "honoured-the-dead-king" },
        { op: "fate", id: "rapport", value: 1, reason: "remembered-the-kings-wish" },
      ],
      [
        { op: "reveal_map", value: "samara", reason: "keeper-named-the-road-toward-the-sea" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-way-out-of-the-valley" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-wonders-of-mien" },
        { op: "codex", value: "cx-mien", reason: "learned-the-citys-wonders" },
      ],
    ],
  },
  {
    city: "nanghin",
    tier: "town",
    zhName: "扬州",
    enName: "Nanghin",
    lore: { placeId: "nanghin", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c069" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Nanghin: The Opulent Merchants of the Noble Province", "扬州：贵壤的巨商"],
      body: [
        "In the very noble province towards the west, the merchants of Nanghin are great and opulent, and the Emperor draws a large revenue from the duties on their goods. A silk merchant who keeps three warehouses says the province has silk in great abundance, and weaves many fine tissues of silk and gold; corn and victuals are cheap, game abundant, and lions are found there — and a traveller who comes to this city with empty hands leaves with a full book.",
        "在这片极尊贵的西部疆土，扬州的商贾豪富，皇帝从他们货税中得岁入甚巨。一位有三间库房的丝绸商说，本省桑丝丰饶，织出许多绸金细品；谷蔬价廉，野味丰盈，且有狮子出没——两手空空进此城的旅人，走出去时行囊里必已装满记述。",
      ],
      choices: [
        ["Buy silk-and-gold at the merchant's price", "按商人之价买下绸金织物"],
        ["Ask the merchant the road toward Caiju", "问商人通往瓜州的路"],
        ["Walk the warehouses a day and note the trade", "在库房间走一日，记下生意"],
      ],
      results: [
        ["He sells you the stuff at his fixed price. The bolt is ready for any road, and the account of Nanghin goes with it.", "他按定价卖给你织物。布匹已备好行任何路，扬州的记述也随它同行。"],
        ["Caiju and Sinju are marked on your map. The canal roads of the province are clear.", "瓜州与真州已标上你的舆图。本省的运河之路清晰。"],
        ["You spend a day among the warehouses. The trade's measure is learned, and a small turn of fortune favours you.", "你在库房间过了一日。生意的尺度已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-silk-and-gold-at-nanghin-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-and-gold-at-nanghin" },
        { op: "codex", value: "cx-nanghin", reason: "learned-the-opulent-merchants-of-nanghin" },
        { op: "queue_event", value: "ev-nanghin-a-followup", reason: "nanghin-a-followup" },
      ],
      [
        { op: "reveal_map", value: "caiju", reason: "merchant-named-the-road-to-caiju" },
        { op: "reveal_map", value: "sinju", reason: "merchant-named-the-road-to-sinju" },
        { op: "codex", value: "cx-nanghin", reason: "mapped-the-canal-roads-of-nanghin" },
        { op: "queue_event", value: "ev-nanghin-a-followup", reason: "nanghin-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-warehouses-of-nanghin" },
        { op: "fate", id: "wealth", value: 1, reason: "studied-the-merchants-trade" },
      ],
    ],
    followup: {
      title: ["Nanghin: The Merchant's Second Warehouse", "扬州：商人的第二间库房"],
      body: [
        "The merchant opens the door of his second warehouse, where the duties of the province are written on a board. He says the Emperor's revenue from this city alone would buy a kingdom, and that the silk and the gold thread pass through here to every road of Manzi. He asks whether you would carry the cloth, or the knowledge of where it goes.",
        "商人打开第二间库房的门，梁上悬着本省税目的木牌。他说仅此一城上缴皇帝的岁入便足以买下一个王国，丝与金线经此通往蛮子每一条路。他问你要带走布匹，还是带走它的去向。",
      ],
      choices: [
        ["Buy lacquerware at the warehouse price", "按库房之价买下漆器"],
        ["Ask him to mark the road toward Chinghianfu", "请他标出通往镇江府的路"],
        ["Sit a while among the bales and hear the trade's tides", "在货包间坐一会儿，听生意的潮汐"],
      ],
      results: [
        ["He sells you lacquerware at a fair price. The piece is sealed for the canal road.", "他按公道价卖给你漆器。物件已封好待行运河路。"],
        ["Chinghianfu is marked on your map with the days between. The province is knitting together.", "镇江府连同其间的日子已标上舆图。这一省的脉络正在织合。"],
        ["You sit a while among the bales. The trade's tides are learned, and in Nanghin your name now carries a little more weight.", "你在货包间坐了一会儿。生意的潮汐已学，扬州的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -700, reason: "bought-lacquerware-at-nanghin-warehouse" },
        { op: "goods", id: "lacquerware", value: 1, reason: "bought-lacquerware-at-nanghin" },
        { op: "codex", value: "cx-nanghin", reason: "carried-lacquer-from-the-opulent-province" },
      ],
      [
        { op: "reveal_map", value: "chinghianfu", reason: "merchant-marked-the-road-to-chinghianfu" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-trade-tides" },
      ],
      [
        { op: "days", value: 1, reason: "sat-among-the-bales" },
        { op: "reputation", value: 1, scope: "city", id: "nanghin", reason: "studied-the-trade-tides" },
      ],
    ],
  },
  {
    city: "paukin",
    tier: "town",
    zhName: "宝应",
    enName: "Paukin",
    lore: { placeId: "paukin", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c067" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Paukin: The Causeway Gate of Manzi", "宝应：蛮子的石堤门"],
      body: [
        "At the fine city reached by a causeway of fine stone, with great water on either hand so that none can enter Manzi but by this way, the weavers of Paukin work silk in the gate-shadow. A weaver who has watched the travellers pass for years says the city lives by trade and manufactures, and burns its dead and uses paper-money — and that a traveller who comes by the causeway is already half a friend, for only friends are let through by water.",
        "在这座须经精石长堤方能抵达的城中，两侧皆是大水，除堤外无从进入蛮子——宝应的织工在城门影下织丝。一位看惯了旅人来去的织工说，此城以商贾与手艺为生，人死火葬，币用楮纸——走石堤而来的旅人已算是半个朋友，因为只有朋友才被水放行。",
      ],
      choices: [
        ["Buy silk at the gate price", "按城门之价买下丝绸"],
        ["Ask the weaver the road toward Tiju", "问织工通往高邮的路"],
        ["Walk the causeway a day and watch the water", "在石堤上走一日，看两边的水"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed, and the account of Paukin goes with it.", "他按公道价卖给你丝。布匹已封好，宝应的记述也随它同行。"],
        ["Tiju and Siju are marked on your map. The road through the gate country is clear.", "高邮与邳州已标上你的舆图。过闸乡的路清晰。"],
        ["You spend a day on the causeway. The water's measure on either hand is learned, and a small turn of fortune favours you.", "你在石堤上过了一日。两侧水势之度已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-paukin-gate-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-paukin" },
        { op: "codex", value: "cx-paukin", reason: "learned-the-causeway-gate-of-manzi" },
        { op: "queue_event", value: "ev-paukin-a-followup", reason: "paukin-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tiju", reason: "weaver-named-the-road-to-tiju" },
        { op: "reveal_map", value: "siju", reason: "weaver-named-the-road-to-siju" },
        { op: "codex", value: "cx-paukin", reason: "mapped-the-gate-country" },
        { op: "queue_event", value: "ev-paukin-a-followup", reason: "paukin-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-causeway" },
        { op: "fate", id: "rapport", value: 1, reason: "measured-the-water-of-the-gate" },
      ],
    ],
    followup: {
      title: ["Paukin: The Weaver's Word on the Water", "宝应：织工谈水"],
      body: [
        "The weaver sets down his shuttle and speaks of the causeway as the city's first and last defence. He says no army can enter Manzi except by this way, and no traveller can leave without the water's leave — the gate is a law as much as a road. He asks whether you will carry silk through the gate, or the knowledge of the water that guards it.",
        "织工放下梭子，把石堤说成此城第一道也是最后一道防线。他说兵马非此堤不能入蛮子，旅人非水之允不能出——这道门是路，也是法。他问你要带丝过门，还是带走守门之水的见识。",
      ],
      choices: [
        ["Buy tea sealed for the road beyond the gate", "买下封好出关之行的茶"],
        ["Ask him to name the way toward Coiganju", "请他点名通往淮安的路"],
        ["Wait a day at the gate and learn its seasons", "在门前等一日，学它的时令"],
      ],
      results: [
        ["He sells you tea at a fair price, sealed against the damp of the water country.", "他按公道价卖给你茶，已封好防水乡之湿。"],
        ["Coiganju and Coigangiu are marked on your map. The gate country is fully open.", "淮安与淮阴已标上你的舆图。闸乡已全然敞开。"],
        ["You wait a day at the gate. Its seasons are learned, and in Paukin your name now carries a little more weight.", "你在门前等了一日。其时令已学，你的名字在宝应也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -550, reason: "bought-tea-for-the-road-beyond-the-gate" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-paukin" },
        { op: "codex", value: "cx-paukin", reason: "provisioned-at-the-gate-city" },
      ],
      [
        { op: "reveal_map", value: "coiganju", reason: "weaver-named-the-way-to-coiganju" },
        { op: "reveal_map", value: "coigangiu", reason: "weaver-named-coigangiu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-gate-seasons" },
      ],
      [
        { op: "days", value: 1, reason: "waited-at-the-gate" },
        { op: "reputation", value: 1, scope: "city", id: "paukin", reason: "learned-the-gate-seasons" },
      ],
    ],
  },
  {
    city: "sindafu",
    tier: "town",
    zhName: "成都府",
    enName: "Sindafu",
    lore: { placeId: "sindafu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c044" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Sindafu: The Three Parts of the Old King's City", "成都府：老王分三城"],
      body: [
        "In the rich and noble city that is a good twenty miles in compass, the people still speak of the old king who, drawing near to death and leaving three sons, commanded that the city be divided into three parts, one for each son. A bridge-keeper who tends the crossings between the parts says each quarter keeps its own trade and its own pride, and that a traveller who honours all three is welcome in all three.",
        "在这座周长足二十里的富庶大城，百姓仍讲着那位老王的旧事：他临终时留三子，下令将城分为三份，各予一子。一位照管三城之间渡桥的桥官说，每个城区各有其业、各有其傲；三处皆敬的旅人，三处皆欢迎。",
      ],
      choices: [
        ["Buy silk at the bridge-market price", "按桥市之价买下丝绸"],
        ["Ask the bridge-keeper the road toward Kenjanfu", "问桥官通往西安的路"],
        ["Walk the three parts a day and note their trades", "在三城走一日，记下各自的营生"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed, and the account of Sindafu goes with it.", "他按公道价卖给你丝。布匹已封好，成都府的记述也随它同行。"],
        ["Kenjanfu and Cachanfu are marked on your map. The roads west and north are clear.", "西安与河中府已标上你的舆图。西去与北上的路清晰。"],
        ["You spend a day crossing the three parts. Their trades are noted, and a small turn of fortune favours you.", "你在三城之间走了一日。各自的营生已记，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-sindafu-bridge-market" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-sindafu" },
        { op: "codex", value: "cx-sindafu", reason: "learned-the-three-parts-of-sindafu" },
        { op: "queue_event", value: "ev-sindafu-a-followup", reason: "sindafu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "kenjanfu", reason: "bridge-keeper-named-the-road-to-kenjanfu" },
        { op: "reveal_map", value: "cachanfu", reason: "bridge-keeper-named-the-road-to-cachanfu" },
        { op: "codex", value: "cx-sindafu", reason: "mapped-the-roads-from-the-three-parts" },
        { op: "queue_event", value: "ev-sindafu-a-followup", reason: "sindafu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-three-parts" },
        { op: "fate", id: "rapport", value: 1, reason: "honoured-all-three-quarters" },
      ],
    ],
    followup: {
      title: ["Sindafu: The Bridge-Keeper's Tale of the Division", "成都府：桥官所讲分城旧事"],
      body: [
        "The bridge-keeper tells the division as the city tells it: the old king, seeing death near, called his three sons and gave each a third of the city, that none might say he loved one above another. He says the parts have traded and quarrelled since, and that the bridges are where the three learn to agree — and that a traveller who knows the tale can cross any bridge in Sindafu without a toll of talk.",
        "桥官按城中传法讲述分城：老王见死期将近，召来三子，各予城之三分之一，使无人可言他偏爱哪个。他说自此三城相贸亦相争，而桥是三方学会相商之处——知晓此事的旅人，过成都府任何一座桥都不用付话语的过桥钱。",
      ],
      choices: [
        ["Buy tea at the bridge-keeper's price", "按桥官之价买下茶叶"],
        ["Ask him to name the road toward Saianfu", "请他点名通往襄阳的路"],
        ["Sit a while at the middle bridge and hear the three tongues", "在中桥坐一会儿，听三种口音"],
      ],
      results: [
        ["He sells you tea at a fair price. The leaves are sealed for the mountain road.", "他按公道价卖给你茶。叶子已封好待行山路。"],
        ["Saianfu is marked on your map with the days between. The eastern road is clear.", "襄阳连同其间的日子已标上舆图。东去之路清晰。"],
        ["You sit a while at the middle bridge. The three tongues are learned, and in Sindafu your name now carries a little more weight.", "你在中桥坐了一会儿。三种口音已入耳，成都府的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -550, reason: "bought-tea-at-sindafu-bridge" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-sindafu" },
        { op: "codex", value: "cx-sindafu", reason: "provisioned-at-the-bridge-market" },
      ],
      [
        { op: "reveal_map", value: "saianfu", reason: "bridge-keeper-named-the-road-to-saianfu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-eastern-road" },
      ],
      [
        { op: "days", value: 1, reason: "sat-at-the-middle-bridge" },
        { op: "reputation", value: 1, scope: "city", id: "sindafu", reason: "heard-the-three-tongues" },
      ],
    ],
  },
  {
    city: "sinjumatu",
    tier: "town",
    zhName: "济宁",
    enName: "Sinjumatu",
    lore: { placeId: "sinjumatu", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c062" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Sinjumatu: The River Works That Bring Great Gain", "济宁：生大利的河工"],
      body: [
        "In the rich and fine city with great trade and manufactures, the river men of Sinjumatu have divided the great river that flows from the south, and made of it a work that brings the city great gain. A master of the river works says the people of the city manage the waters as others manage fields, and that every vessel that passes pays its measure — and that a traveller who understands the works understands the city.",
        "在这座贸易与手艺昌盛的富庶之城，济宁的河工把南来的大河分而治之，筑成一项令全城得大利的工程。一位河工总管说，此城治水如同他人治田，每船过此皆纳其度——识得此工的旅人，也就识得此城。",
      ],
      choices: [
        ["Buy ginger at the river-works price", "按河工之价买下生姜"],
        ["Ask the master the water road toward Siju", "问总管通往邳州的水路"],
        ["Watch the sluices a day and learn the works", "看一日闸门，学一学河工"],
      ],
      results: [
        ["He sells you ginger at a fair weight. The root will keep, and the account of Sinjumatu goes with it.", "他按公道分量卖给你姜。此根经得存放，济宁的记述也随它同行。"],
        ["Siju and Linju are marked on your map. The river road north and south is clear.", "邳州与陵州已标上你的舆图。南北水路清晰。"],
        ["You spend a day at the sluices. The works' measure is learned, and a small turn of fortune favours you.", "你在闸门边过了一日。河工之度已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -450, reason: "bought-ginger-at-sinjumatu-river-works" },
        { op: "goods", id: "ginger", value: 1, reason: "bought-ginger-at-sinjumatu" },
        { op: "codex", value: "cx-sinjumatu", reason: "learned-the-river-works-of-sinjumatu" },
        { op: "queue_event", value: "ev-sinjumatu-a-followup", reason: "sinjumatu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "siju", reason: "master-named-the-water-road-to-siju" },
        { op: "reveal_map", value: "linju", reason: "master-named-the-water-road-to-linju" },
        { op: "codex", value: "cx-sinjumatu", reason: "mapped-the-river-roads-from-sinjumatu" },
        { op: "queue_event", value: "ev-sinjumatu-a-followup", reason: "sinjumatu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-sluices" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-river-works" },
      ],
    ],
    followup: {
      title: ["Sinjumatu: The Master's Second Word on the Water", "济宁：总管谈水的第二句话"],
      body: [
        "The master of the river works takes you to the head of the great sluice and speaks of water as the city's treasury. He says the river flows from the south to this city, and the people have divided it so that the gain is theirs and not the river's — every vessel, every season, every flood is measured. He asks whether you will pay the river's measure, or learn to read it.",
        "河工总管把你领到总闸前，把水说成此城的金库。他说大河自南而来，城中人将它分而治之，使利归于城而不归于河——每船、每季、每场洪水都被丈量。他问你是要照付河的尺度，还是要学会读它。",
      ],
      choices: [
        ["Buy tea sealed for the canal passage", "买下封好走运河的茶"],
        ["Ask him to mark the road toward Saianfu", "请他标出通往襄阳的路"],
        ["Wait a day at the works and learn the flood seasons", "在河工处等一日，学洪水之季"],
      ],
      results: [
        ["He sells you tea at a fair price, sealed against the water's damp.", "他按公道价卖给你茶，已封好防水气。"],
        ["Saianfu is marked on your map with the reaches between. The upper river is no longer blind.", "襄阳连同其间水程已标上舆图。上游不再是盲程。"],
        ["You wait a day at the works. The flood seasons are learned, and in Sinjumatu your name now carries a little more weight.", "你在河工处等了一日。洪水之季已学，你的名字在济宁也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -550, reason: "bought-tea-for-the-canal-passage" },
        { op: "goods", id: "tea", value: 1, reason: "bought-tea-at-sinjumatu" },
        { op: "codex", value: "cx-sinjumatu", reason: "provisioned-at-the-river-works" },
      ],
      [
        { op: "reveal_map", value: "saianfu", reason: "master-marked-the-road-to-saianfu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-upper-river" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-flood-seasons" },
        { op: "reputation", value: 1, scope: "city", id: "sinjumatu", reason: "studied-with-the-river-master" },
      ],
    ],
  },
  {
    city: "tiju",
    tier: "town",
    zhName: "高邮",
    enName: "Tiju",
    lore: { placeId: "tiju", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b2-c068" } },
    scene: { bg: "canal-city", region: "china" },
    site: {
      title: ["Tiju: The Salt Pans Between City and Sea", "高邮：城与海之间的盐田"],
      body: [
        "In the city of no great size but abounding in everything, the salt men of Tiju work the pans that lie between the city and the Ocean Sea, three days' journey east. A pan-master who has scraped salt since boyhood says the sea supplies the whole country-side with salt, and that great quantities are made at every place between the sea and the city — and that a traveller who buys salt here without hearing the sea's seasons pays the sea's price twice over.",
        "在这座不大却无所不有的城，高邮的盐人经营着城与大海之间（东去三日）的盐田。一位自幼刮盐的场主说，海盐供应四方，城与海之间的每一处都在大量产盐——不闻海之季节便在此买盐的旅人，付的是双重的海价。",
      ],
      choices: [
        ["Buy salt at the pan-master's price", "按盐场主之价买下盐"],
        ["Ask the pan-master the road toward Sinju", "问盐场主通往真州的路"],
        ["Walk the pans a day and learn the brine", "在盐田间走一日，学一学卤水"],
      ],
      results: [
        ["He sells you salt at a fair price. It is good salt, and the account of Tiju goes with it.", "他按公道价卖给你盐。盐是好盐，高邮的记述也随它同行。"],
        ["Sinju and Paukin are marked on your map. The roads of the salt country are clear.", "真州与宝应已标上你的舆图。盐乡之路清晰。"],
        ["You spend a day among the pans. The brine is learned, and a small turn of fortune favours you.", "你在盐田间过了一日。卤水之性已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-salt-at-tiju-pan-master-price" },
        { op: "goods", id: "salt", value: 1, reason: "bought-salt-at-tiju" },
        { op: "codex", value: "cx-tiju", reason: "learned-the-salt-pans-of-tiju" },
        { op: "queue_event", value: "ev-tiju-a-followup", reason: "tiju-a-followup" },
      ],
      [
        { op: "reveal_map", value: "sinju", reason: "pan-master-named-the-road-to-sinju" },
        { op: "reveal_map", value: "paukin", reason: "pan-master-named-the-road-to-paukin" },
        { op: "codex", value: "cx-tiju", reason: "mapped-the-salt-country" },
        { op: "queue_event", value: "ev-tiju-a-followup", reason: "tiju-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-salt-pans" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-brine-of-tiju" },
      ],
    ],
    followup: {
      title: ["Tiju: The Pan-Master's Second Word", "高邮：盐场主的第二句话"],
      body: [
        "The pan-master takes you to the seaward edge of the pans and points east. He says the Ocean Sea lies three days' journey off, and that the sea's salt and the city's trade are one business — the pans feed the city, the city ships the salt, and the Kaan's revenue is incredible. He asks whether you will carry salt, or the sea's measure.",
        "盐场主把你领到盐田靠海的一侧，指向东方。他说大海在三日程之外，海盐与城贸本是一桩生意——盐田养城，城运盐，大汗的岁入不可胜计。他问你要带走盐，还是带走海的尺度。",
      ],
      choices: [
        ["Buy silk at the pan-master's city price", "按盐场主的城价买下丝绸"],
        ["Ask him to name the road toward Caiju", "请他点名通往瓜州的路"],
        ["Wait a day and learn the sea's salt seasons", "等一日，学海盐之季"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed for the road north.", "他按公道价卖给你丝。布匹已封好待行北路。"],
        ["Caiju and Coigangiu are marked on your map. The canal country is fully mapped now.", "瓜州与淮阴已标上你的舆图。运河乡现已全图。"],
        ["You wait a day at the pans. The sea's seasons are learned, and in Tiju your name now carries a little more weight.", "你在盐田等了一日。海的季节已学，高邮的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1000, reason: "bought-silk-at-tiju-city-price" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-tiju" },
        { op: "codex", value: "cx-tiju", reason: "carried-silk-from-the-salt-city" },
      ],
      [
        { op: "reveal_map", value: "caiju", reason: "pan-master-named-the-road-to-caiju" },
        { op: "reveal_map", value: "coigangiu", reason: "pan-master-named-coigangiu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-canal-country" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-sea-salt-seasons" },
        { op: "reputation", value: 1, scope: "city", id: "tiju", reason: "studied-the-salt-seasons" },
      ],
    ],
  },
  // ─── B2 central_asia ──────────────────────────────────────────────
  {
    city: "cabul",
    tier: "station",
    zhName: "可不里（喀布尔）",
    enName: "Cabul",
    lore: { placeId: "cabul", origin: "source", ref: { book: "ibn-battuta", chapterId: "battuta-c013" } },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Cabul: The Horse Dealers at the Mountain's Foot", "可不里：山脚下的马贩"],
      body: [
        "At the station where the mountain roads meet the desert road, the horse dealers of Cabul keep their herds on the gravel flats and price them for the passes. A dealer who has sold horses to caravans for thirty years says the roads out of this place go to the desert and to the mountains both, and that a traveller who buys a horse without hearing the passes buys with his eyes shut — the desert wants one pace, the mountains another.",
        "在山路与漠路交会的驿站，可不里的马贩在砾石滩上牧着马群，为过山者定价。一位卖了三十年马的贩子说，此地的路一头入漠、一头入山；不闻山口便买马的旅人，是闭着眼买——沙漠要一种步法，山要另一种。",
      ],
      choices: [
        ["Buy a steppe horse at the dealer's price", "按马贩之价买下一匹草原马"],
        ["Ask the dealer the passes toward Keshimur", "问马贩通往克什米尔的山口"],
        ["Watch the horse fair a day and learn the paces", "看一日马市，学一学步法"],
      ],
      results: [
        ["He sells you a horse at his fixed price, sound in wind and limb. The beast will serve on the desert road or the mountain.", "他按定价卖给你一匹马，肺腑四肢俱健。此马沙漠山路皆可用。"],
        ["Keshimur and Taican are marked on your map with the passes between. The mountain roads are no longer blind.", "克什米尔与塔里寒连同其间山口已标上舆图。山路不再是盲程。"],
        ["You spend a day at the fair. The paces are learned, and a small turn of fortune favours you.", "你在马市过了一日。步法已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -2500, reason: "bought-steppe-horse-at-cabul-dealer-price" },
        { op: "goods", id: "steppe-horse", value: 1, reason: "bought-steppe-horse-at-cabul" },
        { op: "codex", value: "cx-cabul", reason: "cabul-book-entry" },
        { op: "queue_event", value: "ev-cabul-a-followup", reason: "cabul-a-followup" },
      ],
      [
        { op: "reveal_map", value: "keshimur", reason: "dealer-named-the-pass-to-keshimur" },
        { op: "reveal_map", value: "taican", reason: "dealer-named-the-pass-to-taican" },
        { op: "queue_event", value: "ev-cabul-a-followup", reason: "cabul-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-horse-fair" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-paces-of-cabul" },
      ],
    ],
    followup: {
      title: ["Cabul: The Dealer's Word on the Passes", "可不里：马贩谈山口"],
      body: [
        "The horse dealer takes you to the edge of the flats and points at the mountains. He says every pass has its price in days and water, and that the road to Keshimur is a road of horses — the valley people pay in mounts, the desert people pay in salt. He asks which of the two you mean to ride into.",
        "马贩把你领到滩地边缘，指向群山。他说每道山口都以日子与水计价；往克什米尔的路是马的路——谷中人以马匹相付，漠中人以盐相付。他问你要骑进哪一种。",
      ],
      choices: [
        ["Buy camel-felt for the mountain nights", "买下骆驼毛毡，备山中夜寒"],
        ["Ask him to name the road toward Badashan", "请他点名通往巴达哈伤的路"],
        ["Sit a while with the dealers and hear the herds' tales", "与马贩坐一会儿，听马群的旧事"],
      ],
      results: [
        ["He sells you camel-felt at a fair price. The felt will keep the cold of the passes off you.", "他按公道价卖给你驼毛毡。此毡可御山口之寒。"],
        ["Badashan is marked on your map with the days between. The northern road is open.", "巴达哈伤连同其间的日子已标上舆图。北路已通。"],
        ["You sit a while with the dealers. The herds' tales are learned, and in Cabul your name now carries a little more weight.", "你与马贩坐了一会儿。马群的旧事已入耳，你的名字在可不里也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -600, reason: "bought-camel-felt-at-cabul" },
        { op: "goods", id: "camel-felt", value: 1, reason: "bought-camel-felt-at-cabul" },
      ],
      [
        { op: "reveal_map", value: "badashan", reason: "dealer-named-the-road-to-badashan" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-northern-road" },
      ],
      [
        { op: "days", value: 1, reason: "sat-with-the-horse-dealers" },
        { op: "reputation", value: 1, scope: "city", id: "cabul", reason: "sat-with-the-horse-dealers" },
      ],
    ],
  },
  {
    city: "merva",
    tier: "station",
    zhName: "木鹿（梅尔夫）",
    enName: "Merva",
    lore: { placeId: "merva", origin: "authored", disposition: "checked-weak", note: "已查：蒙古毁城后余脉；维持 authored。" },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Merva: The Gardens Among the Old Walls", "木鹿：旧墙间的园圃"],
      body: [
        "At the station built among walls older than the people who keep them, the gardeners of Merva tend their plots in the shadow of what was once a great city. An old gardener who remembers the tales of the ruin says the water still runs as it ran when the city was whole, and that the roads from here still lead where they led — to Balc, to Sapurgan, to Bochara — only the walls are shorter now.",
        "在这座筑于比守城者更老的墙间的驿站，木鹿的园丁在曾是巨城的废墟影下经营菜圃。一位记得废墟旧谈的老园丁说，水流仍如城全时一样流着，由此而出的路也仍通往它们曾通往的地方——巴里黑、撒普儿干、不花剌——只是墙如今矮了。",
      ],
      choices: [
        ["Buy melons at the gardener's price for the desert road", "按园丁之价买下瓜，备漠路之用"],
        ["Ask the gardener the roads toward Sapurgan", "问园丁通往撒普儿干的路"],
        ["Walk the old walls a day and note what remains", "在旧墙间走一日，记下残存之物"],
      ],
      results: [
        ["He sells you melons at a fair weight. The fruit will keep on the sand, and the account of Merva goes with it.", "他按公道分量卖给你瓜。果子在沙上经得存放，木鹿的记述也随它同行。"],
        ["Sapurgan and Balc are marked on your map. The old roads still hold.", "撒普儿干与巴里黑已标上你的舆图。旧路仍在。"],
        ["You spend a day among the walls. What remains is noted, and a small turn of fortune favours you.", "你在墙间过了一日。残存之物已记，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -350, reason: "bought-melons-at-merva-gardener-price" },
        { op: "goods", id: "melons", value: 1, reason: "bought-melons-at-merva" },
        { op: "codex", value: "cx-merva", reason: "merva-book-entry" },
        { op: "queue_event", value: "ev-merva-a-followup", reason: "merva-a-followup" },
      ],
      [
        { op: "reveal_map", value: "sapurgan", reason: "gardener-named-the-road-to-sapurgan" },
        { op: "reveal_map", value: "balc", reason: "gardener-named-the-road-to-balc" },
        { op: "queue_event", value: "ev-merva-a-followup", reason: "merva-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-old-walls-of-merva" },
        { op: "fate", id: "rapport", value: 1, reason: "noted-what-remains" },
      ],
    ],
    followup: {
      title: ["Merva: The Gardener's Tale of the Ruin", "木鹿：园丁的废墟旧谈"],
      body: [
        "The gardener sets down his hoe and tells the tale as his father told it: the great city that stood here, the war that came, and the water that outlived both. He says the canals were the city's true bones, and that where the water still runs the people return — gardens first, then houses, then trade. He asks whether you mean to remember the city, or to pass it.",
        "园丁放下锄头，把他父亲讲过的旧谈讲给你：曾矗立于此的巨城、来过的一场战事，以及比两者都活得久的水。他说运河才是城真正的骨架；水流之处，人便归来——先有园，再有屋，后有生意。他问你是要记住这座城，还是路过它。",
      ],
      choices: [
        ["Buy dates at the gardener's market price", "按园丁的市价买下椰枣"],
        ["Ask him to name the road toward Bochara", "请他点名通往不花剌的路"],
        ["Wait a day and help turn the water into a new plot", "等一日，相助把水引进一块新圃"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the long road.", "他按公道分量卖给你椰枣。此果经得起长路。"],
        ["Bochara is marked on your map with the days between. The old road north is open.", "不花剌连同其间的日子已标上舆图。北去的旧路已通。"],
        ["You spend a day with the water and the spade. The garden's measure is learned, and in Merva your name now carries a little more weight.", "你与水、与锹共度一日。园圃之度已学，木鹿的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-merva-market" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-merva" },
      ],
      [
        { op: "reveal_map", value: "bochara", reason: "gardener-named-the-road-to-bochara" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-old-northern-road" },
      ],
      [
        { op: "days", value: 1, reason: "helped-turn-the-water" },
        { op: "reputation", value: 1, scope: "city", id: "merva", reason: "helped-in-the-gardens" },
      ],
    ],
  },
  {
    city: "pein",
    tier: "town",
    zhName: "髣城（克里雅）",
    enName: "Pein",
    lore: { placeId: "pein", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c037" } },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Pein: The Jasper Rivers and the Twenty Days", "髣城：玉河与二十日之俗"],
      body: [
        "In the province five days in length, the people of Pein take jasper and chalcedony from their rivers and live by manufactures and trade. A river-master who has sifted the gravel since boyhood speaks of the city's custom as of a thing as old as the rivers: if a husband goes away upon a journey and remains more than twenty days, the term past, his wife may marry another — and the husband likewise. He tells it without judgement, and asks your business.",
        "在这片纵长五日的省境，髣城人从河中取碧玉与玉髓，以手艺与商贾为生。一位自幼淘砾的河工说起此城的俗例，如说一条与河同样古老的规矩：丈夫出外行旅逾二十日不归，期限一过，其妻可另嫁——丈夫亦然。他说来不置褒贬，只问你来意。",
      ],
      choices: [
        ["Buy cotton cloth at the river price", "按河上之价买下棉布"],
        ["Ask the river-master the road toward Yarcan", "问河工通往鸦儿看的路"],
        ["Sit a day by the river and hear the city's customs", "在河边坐一日，听此城的俗例"],
      ],
      results: [
        ["He sells you cotton at a fair weight. The cloth will serve on any road, and the account of Pein goes with it.", "他按公道分量卖给你棉布。此布可行于任何道路，髣城的记述也随它同行。"],
        ["Yarcan and Cotan are marked on your map. The jasper country is opening before you.", "鸦儿看与于阗已标上你的舆图。玉乡正在你面前展开。"],
        ["You sit a day by the river. The customs are heard without judgement, and a small turn of fortune favours you.", "你在河边坐了一日。俗例入耳而不置褒贬，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-pein-river-price" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-pein" },
        { op: "codex", value: "cx-pein", reason: "learned-the-jasper-rivers-of-pein" },
        { op: "queue_event", value: "ev-pein-a-followup", reason: "pein-a-followup" },
      ],
      [
        { op: "reveal_map", value: "yarcan", reason: "river-master-named-the-road-to-yarcan" },
        { op: "reveal_map", value: "cotan", reason: "river-master-named-the-road-to-cotan" },
        { op: "codex", value: "cx-pein", reason: "mapped-the-jasper-country" },
        { op: "queue_event", value: "ev-pein-a-followup", reason: "pein-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "sat-by-the-river-of-pein" },
        { op: "fate", id: "rapport", value: 1, reason: "heard-the-customs-without-judgement" },
      ],
    ],
    followup: {
      title: ["Pein: The River-Master's Second Word", "髣城：河工的第二句话"],
      body: [
        "The river-master shows you the day-count kept by the elders — the marks that tell how long a traveller has been gone, and when the term passes. He says the custom is not mockery but measure: in a land where journeys are long and desert, no one may be counted dead while a horse might still live, and no one may be bound to a shadow. He asks what you make of a people who measure hope in days.",
        "河工给你看长老们记的日子——那些划痕记着旅人已离多久、期限何时过去。他说这俗例不是轻慢，而是尺度：在这旅途漫长且有沙漠的地方，只要一匹马还可能活着，便无人算作死了；也无人该被一个影子拴住。他问你觉得这群以日子度量希望的人如何。",
      ],
      choices: [
        ["Buy jade at the river-master's price", "按河工之价买下一块玉"],
        ["Ask him to mark the road toward Charchan", "请他标出通往车尔臣的路"],
        ["Wait a day and learn the day-count's keeping", "等一日，学一学日子划痕的记法"],
      ],
      results: [
        ["He sells you jade at a fair price. The stone is from the river, and will fetch its worth in Cathay.", "他按公道价卖给你玉。此石出自河中，到契丹可值其价。"],
        ["Charchan is marked on your map with the days between. The sand road south is clear.", "车尔臣连同其间的日子已标上舆图。南去沙路清晰。"],
        ["You wait a day and learn the marks. The day-count is yours now, and in Pein your name carries a little more weight.", "你等了一日，学会划痕的记法。这分度量已归你所有，你的名字在髣城也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1200, reason: "bought-jade-at-pein-river-price" },
        { op: "goods", id: "jade", value: 1, reason: "bought-jade-at-pein" },
        { op: "codex", value: "cx-pein", reason: "carried-river-jade-from-pein" },
      ],
      [
        { op: "reveal_map", value: "charchan", reason: "river-master-marked-the-road-to-charchan" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-sand-road-south" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-day-count" },
        { op: "reputation", value: 1, scope: "city", id: "pein", reason: "learned-the-day-count" },
      ],
    ],
  },
  {
    city: "sachiu",
    tier: "town",
    zhName: "沙州（敦煌）",
    enName: "Sachiu",
    lore: { placeId: "sachiu", origin: "authored", disposition: "checked-weak", note: "已查：绿洲门户与崖窟；维持 authored。" },
    scene: { bg: "oasis-town", region: "central_asia" },
    site: {
      title: ["Sachiu: The Oasis Gate and the Cliff Shrines", "沙州：绿洲之门与崖上窟龛"],
      body: [
        "At the oasis where the desert roads meet, the water-keepers of Sachiu tend the spring that makes the town possible, and the shrine-keepers watch the cliff-shrines cut into the rock. A water-keeper who has measured the spring for forty years says the roads to Camul, to Etzina, and to Campichu all pass by this water, and that a traveller who drinks here without honouring the shrines drinks the desert's hospitality in vain.",
        "在沙漠诸路交会的绿洲，沙州的水官守护着使此城得以存在的泉水，守窟人照看着凿入岩壁的窟龛。一位量了四十年泉水的水官说，往哈密、亦集乃、甘州的路都经过这汪水；在此饮水而不敬窟龛的旅人，白领了沙漠的款待。",
      ],
      choices: [
        ["Buy melons at the oasis price for the desert road", "按绿洲之价买下瓜，备漠路之用"],
        ["Ask the water-keeper the roads toward Camul", "问水官通往哈密的路"],
        ["Walk the cliff-shrines a day with the shrine-keepers", "与守窟人在崖窟间走一日"],
      ],
      results: [
        ["He sells you melons at a fair weight. The fruit will keep on the sand, and the account of Sachiu goes with it.", "他按公道分量卖给你瓜。果子在沙上经得存放，沙州的记述也随它同行。"],
        ["Camul and Etzina are marked on your map. The desert gates are opening.", "哈密与亦集乃已标上你的舆图。漠门正在敞开。"],
        ["You spend a day among the shrines. The quiet of the cliff is learned, and a small turn of fortune favours you.", "你在窟龛间过了一日。崖壁的静已入心，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -350, reason: "bought-melons-at-sachiu-oasis-price" },
        { op: "goods", id: "melons", value: 1, reason: "bought-melons-at-sachiu" },
        { op: "codex", value: "cx-sachiu", reason: "sachiu-book-entry" },
        { op: "queue_event", value: "ev-sachiu-a-followup", reason: "sachiu-a-followup" },
      ],
      [
        { op: "reveal_map", value: "camul", reason: "water-keeper-named-the-road-to-camul" },
        { op: "reveal_map", value: "etzina", reason: "water-keeper-named-the-road-to-etzina" },
        { op: "queue_event", value: "ev-sachiu-a-followup", reason: "sachiu-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-cliff-shrines" },
        { op: "fate", id: "rapport", value: 1, reason: "honoured-the-shrines" },
      ],
    ],
    followup: {
      title: ["Sachiu: The Water-Keeper's Second Word", "沙州：水官的第二句话"],
      body: [
        "The water-keeper takes you to the spring's head and speaks of the desert as a debtor. He says the water here is owed to every road that crosses the sand — to Camul, to Etzina, to Campichu — and that the shrine-keepers count the travellers who honour it, so that the desert may know the water was not drunk in vain. He asks whether you will be counted among those who repay the oasis.",
        "水官把你领到泉源前，把沙漠说成一个欠债者。他说这汪水欠着每一条过沙之路——欠哈密，欠亦集乃，欠甘州；守窟人记着敬水的旅人，好让沙漠知道水没有被白饮。他问你愿不愿意被算作偿还绿洲的人。",
      ],
      choices: [
        ["Offer a small gift at the spring for the road's sake", "为前路在泉边献一份薄礼"],
        ["Ask him to name the road toward Campichu", "请他点名通往甘州的路"],
        ["Wait a day at the spring and learn the desert's measure", "在泉边等一日，学沙漠的尺度"],
      ],
      results: [
        ["Your gift is accepted without ceremony. The water-keeper speaks your name to the spring, and a little favour goes with you on the sand.", "礼物被收下，并无繁文。水官把你的名字说给泉水听，沙路上多了一分照应。"],
        ["Campichu is marked on your map with the wells between. The Tangut road is open.", "甘州连同其间水井已标上舆图。唐古忒之路已通。"],
        ["You wait a day at the spring. The desert's measure is learned, and in Sachiu your name now carries a little more weight.", "你在泉边等了一日。沙漠的尺度已学，沙州的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -150, reason: "offered-at-the-spring-of-sachiu" },
        { op: "reputation", value: 1, scope: "city", id: "sachiu", reason: "honoured-the-oasis" },
        { op: "fate", id: "rapport", value: 1, reason: "repaid-the-oasis" },
      ],
      [
        { op: "reveal_map", value: "campichu", reason: "water-keeper-named-the-road-to-campichu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-tangut-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-deserts-measure" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-oasis-gate" },
      ],
    ],
  },
  {
    city: "sapurgan",
    tier: "town",
    zhName: "撒普儿干",
    enName: "Sapurgan",
    lore: { placeId: "sapurgan", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c026" } },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Sapurgan: The Pasture Lords and the Water Sellers", "撒普儿干：牧场主与卖水人"],
      body: [
        "On the fine plains with excellent grass pasture and abundance of fruits, the herdsmen of Sapurgan keep their flocks where armies are glad to quarter, and the water sellers ply the desert tracts that lie fifty or sixty miles about, where no water is to be found. A water seller who knows every dry reach says the pasture and the desert are the two faces of this country — a traveller who provisions for one and not the other rides half-blind.",
        "在牧草极佳、果实丰饶的平原上，撒普儿干的牧人放牧着连军队都乐于扎营的畜群，卖水人则穿行于四周五六十里的无水沙地。一位识尽每段旱途的卖水人说，牧场与沙漠是此地的两张面孔——只为一张备粮的旅人，只睁半只眼。",
      ],
      choices: [
        ["Buy melons at the pasture price for the dry reaches", "按牧场之价买下瓜，备旱途之用"],
        ["Ask the water seller the roads toward Balc", "问卖水人通往巴里黑的路"],
        ["Walk the pasture a day and note the water's places", "在牧场走一日，记下水的去处"],
      ],
      results: [
        ["He sells you melons at a fair weight. The fruit will keep on the sand, and the account of Sapurgan goes with it.", "他按公道分量卖给你瓜。果子在沙上经得存放，撒普儿干的记述也随它同行。"],
        ["Balc and Samarcanda are marked on your map. The dry reaches between are named.", "巴里黑与撒马尔罕已标上你的舆图。其间的旱途已点名。"],
        ["You spend a day on the pasture. The water's places are noted, and a small turn of fortune favours you.", "你在牧场过了一日。水的去处已记，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -350, reason: "bought-melons-at-sapurgan-pasture-price" },
        { op: "goods", id: "melons", value: 1, reason: "bought-melons-at-sapurgan" },
        { op: "codex", value: "cx-sapurgan", reason: "learned-the-pasture-and-the-desert" },
        { op: "queue_event", value: "ev-sapurgan-a-followup", reason: "sapurgan-a-followup" },
      ],
      [
        { op: "reveal_map", value: "balc", reason: "water-seller-named-the-road-to-balc" },
        { op: "reveal_map", value: "samarcanda", reason: "water-seller-named-the-road-to-samarcanda" },
        { op: "codex", value: "cx-sapurgan", reason: "mapped-the-dry-reaches" },
        { op: "queue_event", value: "ev-sapurgan-a-followup", reason: "sapurgan-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-pasture" },
        { op: "fate", id: "wealth", value: 1, reason: "noted-the-waters-places" },
      ],
    ],
    followup: {
      title: ["Sapurgan: The Water Seller's Map of Thirst", "撒普儿干：卖水人的渴图"],
      body: [
        "The water seller draws the dry country on the ground: the reaches where the beasts must do without drink, the places where the army quarters in plenty, the wells that appear after the desert tracts. He says his trade is not water but measure — knowing how far a man can go without it. He asks how far you mean to go.",
        "卖水人在泥地上画出旱地：牲畜必须无水而行的路段、军队乐于扎营的富处、旱途之后才出现的水井。他说他卖的其实不是水，而是尺度——知道一个人无水能走多远。他问你要走多远。",
      ],
      choices: [
        ["Buy leather water-skins at his price", "按他的价钱买下皮囊水袋"],
        ["Ask him to mark the road toward Taican", "请他标出通往塔里寒的路"],
        ["Wait a day and learn the dry reaches' measure", "等一日，学旱途的尺度"],
      ],
      results: [
        ["He sells you water-skins at a fair price. The leather is sound, and the desert will not leak through them.", "他按公道价卖给你皮囊。皮子结实，沙漠漏不进袋里。"],
        ["Taican is marked on your map with the dry reaches between. The eastern road is measured now.", "塔里寒连同其间旱途已标上舆图。东路已有尺度。"],
        ["You wait a day with the sellers. The measure of thirst is learned, and in Sapurgan your name now carries a little more weight.", "你与卖水人待了一日。渴的尺度已学，你的名字在撒普儿干也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-water-skins-at-sapurgan" },
        { op: "goods", id: "leather", value: 1, reason: "bought-water-skins-at-sapurgan" },
        { op: "codex", value: "cx-sapurgan", reason: "carried-water-skins-from-the-desert-town" },
      ],
      [
        { op: "reveal_map", value: "taican", reason: "water-seller-marked-the-road-to-taican" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-dry-reaches-measure" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-measure-of-thirst" },
        { op: "reputation", value: 1, scope: "city", id: "sapurgan", reason: "learned-with-the-water-sellers" },
      ],
    ],
  },
  {
    city: "yarcan",
    tier: "town",
    zhName: "鸦儿看（叶尔羌）",
    enName: "Yarcan",
    lore: { placeId: "yarcan", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c035" } },
    scene: { bg: "desert-town", region: "central_asia" },
    site: {
      title: ["Yarcan: The Craftsmen of the Five-Day Province", "鸦儿看：五日省的工匠"],
      body: [
        "In the province five days' journey in extent, the craftsmen of Yarcan are great workers in cotton and leather, and the people follow the Law of Mahommet with Nestorians and Jacobites among them. A cotton master who keeps the craft book says the water of the country leaves its mark on many of the folk — great crops at the throat and swoln legs — and that the craftsmen carry on their work undeterred, as the water is not to be changed. He asks your business.",
        "在这片纵长五日的省境，鸦儿看的工匠精于棉与皮，百姓奉回教，其中亦有景教与雅各派信徒。一位掌管匠册的棉匠头说，此地之水在许多人身上留下印记——颈上生大瘿、腿脚肿胀——而工匠们不以为碍，照常操持手艺，因为水是改不了的。他问你来意。",
      ],
      choices: [
        ["Buy cotton cloth at the craft-book price", "按匠册之价买下棉布"],
        ["Ask the cotton master the road toward Cotan", "问棉匠头通往于阗的路"],
        ["Walk the workshops a day and note the craft", "在作坊间走一日，记一记手艺"],
      ],
      results: [
        ["He sells you cotton at a fair weight. The cloth is well woven, and the account of Yarcan goes with it.", "他按公道分量卖给你棉布。布织得精细，鸦儿看的记述也随它同行。"],
        ["Cotan and Cascar are marked on your map. The province's roads are open.", "于阗与喀什噶尔已标上你的舆图。本省之路已通。"],
        ["You spend a day among the workshops. The craft is noted, and a small turn of fortune favours you.", "你在作坊间过了一日。手艺已记，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-yarcan-craft-price" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-yarcan" },
        { op: "codex", value: "cx-yarcan", reason: "learned-the-craftsmen-of-yarcan" },
        { op: "queue_event", value: "ev-yarcan-a-followup", reason: "yarcan-a-followup" },
      ],
      [
        { op: "reveal_map", value: "cotan", reason: "cotton-master-named-the-road-to-cotan" },
        { op: "reveal_map", value: "cascar", reason: "cotton-master-named-the-road-to-cascar" },
        { op: "codex", value: "cx-yarcan", reason: "mapped-the-province-roads" },
        { op: "queue_event", value: "ev-yarcan-a-followup", reason: "yarcan-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-workshops" },
        { op: "fate", id: "wealth", value: 1, reason: "noted-the-craft" },
      ],
    ],
    followup: {
      title: ["Yarcan: The Cotton Master's Second Page", "鸦儿看：棉匠头的第二页"],
      body: [
        "The cotton master opens his craft book at the page of the weavers' guilds. He says the city's faiths keep separate books but the same looms — Mahommet's men and the Christians work the same cotton, and the water that marks their bodies marks no difference between them. He asks whether a traveller of your book will trade with both.",
        "棉匠头把匠册翻到织匠行会那一页。他说此城的教门各守各的书，却共用同一张织机——奉回教者与基督徒织同一匹棉，那在身体上留下印记的水，在他们之间不划差别。他问你这本行纪的旅人，愿不愿意与两边都做买卖。",
      ],
      choices: [
        ["Buy leather at the guild's joint price", "按两行合议之价买下皮革"],
        ["Ask him to mark the road toward Keshimur", "请他标出通往克什米尔的路"],
        ["Sit a while in the weavers' hall and hear both books", "在织匠堂里坐一会儿，听两边的书"],
      ],
      results: [
        ["He sells you leather at a fair price. The hide is well dressed and will serve on the mountain road.", "他按公道价卖给你皮。皮革鞣制精良，山路可用。"],
        ["Keshimur is marked on your map with the passes between. The mountain road is open.", "克什米尔连同其间山口已标上舆图。山路已通。"],
        ["You sit a while in the hall. Both books are heard, and in Yarcan your name now carries a little more weight.", "你在堂里坐了一会儿。两边的书都入了耳，鸦儿看的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -500, reason: "bought-leather-at-yarcan-guild-price" },
        { op: "goods", id: "leather", value: 1, reason: "bought-leather-at-yarcan" },
        { op: "codex", value: "cx-yarcan", reason: "traded-with-both-guilds" },
      ],
      [
        { op: "reveal_map", value: "keshimur", reason: "cotton-master-marked-the-road-to-keshimur" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-mountain-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-both-books" },
        { op: "reputation", value: 1, scope: "city", id: "yarcan", reason: "honoured-both-faiths" },
      ],
    ],
  },
  // ─── B3 india ─────────────────────────────────────────────────────
  {
    city: "axuma",
    tier: "station",
    zhName: "阿克苏姆",
    enName: "Axuma",
    lore: { placeId: "axuma", origin: "authored", disposition: "checked-weak", note: "已查：石柱之城；维持 authored。" },
    scene: { bg: "desert-town", region: "india" },
    site: {
      title: ["Axuma: The Stone Pillars and the Red Sea Road", "阿克苏姆：石柱与红海之路"],
      body: [
        "At the station where the highland roads come down toward the Red Sea coast, the pillar-keepers of Axuma tend the great carved stones that stand in rows above the town. An old keeper who has watched the caravans pass for years says the pillars were raised by the kings of old, and that the roads from here still run to the sea and to the Nile both — to Aden, to Dongola, to Esher. He asks whether you come to measure the stones or the roads.",
        "在高原诸路通向红海海岸的驿站，阿克苏姆的石柱守护人照看着一排排矗立城上的巨雕石柱。一位看惯商队往来的老者说，石柱是古时诸王所立；由此而出的路仍通往海与尼罗河两处——往亚丁，往洞古剌，往呵舍儿。他问你是来量石柱，还是量道路。",
      ],
      choices: [
        ["Buy frankincense at the keeper's price for the coast road", "按守护人之价买下乳香，备海岸路之用"],
        ["Ask the keeper the road toward Dongola", "问守护人通往洞古剌的路"],
        ["Walk the rows of pillars a day and note their measure", "在石柱行列间走一日，记下其尺度"],
      ],
      results: [
        ["He sells you frankincense at a fair price. The resin is clean and will keep on the coast road.", "他按公道价卖给你乳香。树脂洁净，海岸路上经得存放。"],
        ["Dongola and Esher are marked on your map. The two roads out of the highland are open.", "洞古剌与呵舍儿已标上你的舆图。出高原的两条路已通。"],
        ["You spend a day among the pillars. Their measure is noted, and a small turn of fortune favours you.", "你在石柱间过了一日。其尺度已记，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -500, reason: "bought-frankincense-at-axuma-keeper-price" },
        { op: "goods", id: "frankincense", value: 1, reason: "bought-frankincense-at-axuma" },
        { op: "codex", value: "cx-axuma", reason: "axuma-book-entry" },
        { op: "queue_event", value: "ev-axuma-a-followup", reason: "axuma-a-followup" },
      ],
      [
        { op: "reveal_map", value: "dongola", reason: "keeper-named-the-road-to-dongola" },
        { op: "reveal_map", value: "esher", reason: "keeper-named-the-road-to-esher" },
        { op: "queue_event", value: "ev-axuma-a-followup", reason: "axuma-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-pillar-rows" },
        { op: "fate", id: "rapport", value: 1, reason: "noted-the-pillars-measure" },
      ],
    ],
    followup: {
      title: ["Axuma: The Keeper's Tale of the Pillars", "阿克苏姆：守护人的石柱旧谈"],
      body: [
        "The keeper sits you down in the shade of the tallest pillar and tells what the elders say: the kings of old raised these stones that their names might stand above the town long after the kings were gone, and that the roads to the sea were laid in the same spirit — a road is a king's name that still walks. He asks what a traveller of your people raises that outlasts him.",
        "守护人让你坐在最高的石柱影下，讲长老们的话：古时诸王立此石，为使其名在君王死去之后仍高出于城；通往海边的路也是依同一心志所筑——路是会行走的王名。他问你们一族的人，立下什么比自己活得更久。",
      ],
      choices: [
        ["Buy myrrh sealed for the coast passage", "买下封好走海岸路的没药"],
        ["Ask him to name the road toward Mecha", "请他点名通往默伽的路"],
        ["Wait a day and help mend the oldest pillar's base", "等一日，相助修缮最老石柱的基座"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep to the next market.", "他按公道价卖给你没药，叶封完好。此树脂可存至下一处市集。"],
        ["Mecha is marked on your map with the days between. The coast road south is open.", "默伽连同其间的日子已标上舆图。南去海岸路已通。"],
        ["You spend a day at the pillar's base. The old stone's measure is learned, and in Axuma your name now carries a little more weight.", "你在石柱基座边过了一日。古石的尺度已学，你的名字在阿克苏姆也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-at-axuma" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-axuma" },
      ],
      [
        { op: "reveal_map", value: "mecha", reason: "keeper-named-the-road-to-mecha" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-south-coast-road" },
      ],
      [
        { op: "days", value: 1, reason: "mended-the-oldest-pillar" },
        { op: "reputation", value: 1, scope: "city", id: "axuma", reason: "helped-mend-the-pillar" },
      ],
    ],
  },
  {
    city: "cambaet",
    tier: "town",
    zhName: "坎巴叶（坎贝）",
    enName: "Cambaet",
    lore: { placeId: "cambaet", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c028" } },
    scene: { bg: "monsoon-port", region: "india" },
    site: {
      title: ["Cambaet: The Indigo Vats of the Free Kingdom", "坎巴叶：自由之邦的靛蓝缸"],
      body: [
        "In the great kingdom that lies further west, tributary to nobody, the dyers of Cambaet work the indigo that grows in great abundance, and the North Star stands clear above their vats. A dyer who has served both the local trade and the foreign ships says the kingdom makes fine buckram and exports cotton to many quarters, and that hides are dressed here better than anywhere on the coast — and that merchants come with gold, silver, and copper to carry all of it away.",
        "在这片更西、不向任何人纳贡的大邦，坎巴叶的染工经营着丰产至极的靛蓝，北极为星在他们的染缸上方明亮照临。一位同时侍候本地与外来商船的染工说，此邦织出上等麻布，棉布远销四方，皮革鞣制冠绝海岸——商人们带着金银与铜来，把这些都运走。",
      ],
      choices: [
        ["Buy indigo at the dyer's price", "按染工之价买下靛蓝"],
        ["Ask the dyer the road toward Semenat", "问染工通往苏门纳的路"],
        ["Watch the vats a day and learn the dye's making", "看一日染缸，学一学靛蓝的制炼"],
      ],
      results: [
        ["He sells you indigo at a fair weight. The dye will fetch its price in any cloth market.", "他按公道分量卖给你靛蓝。此染料在任何布市都值其价。"],
        ["Semenat and Tana are marked on your map. The western trade roads are open.", "苏门纳与塔那已标上你的舆图。西向商路已通。"],
        ["You spend a day among the vats. The dye's making is learned, and a small turn of fortune favours you.", "你在染缸间过了一日。制炼之法已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -800, reason: "bought-indigo-at-cambaet-dyer-price" },
        { op: "goods", id: "indigo", value: 1, reason: "bought-indigo-at-cambaet" },
        { op: "codex", value: "cx-cambaet", reason: "learned-the-indigo-vats-of-cambaet" },
        { op: "queue_event", value: "ev-cambaet-a-followup", reason: "cambaet-a-followup" },
      ],
      [
        { op: "reveal_map", value: "semenat", reason: "dyer-named-the-road-to-semenat" },
        { op: "reveal_map", value: "tana", reason: "dyer-named-the-road-to-tana" },
        { op: "codex", value: "cx-cambaet", reason: "mapped-the-western-trade-roads" },
        { op: "queue_event", value: "ev-cambaet-a-followup", reason: "cambaet-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-indigo-vats" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-dyes-making" },
      ],
    ],
    followup: {
      title: ["Cambaet: The Dyer's Second Word on the Star", "坎巴叶：染工谈星的第二句话"],
      body: [
        "The dyer points to the North Star and speaks of it as the kingdom's second king. He says the star is more clearly visible here than anywhere east, and that every ship that comes to this coast sets its course by it — the kingdom needs no tribute because it needs no master, only the star and the trade. He asks whether you sail by the star or by the cargo.",
        "染工指向北极星，说它是此邦的第二位君王。他说这颗星在此地比东方任何地方都更清晰，来此海岸的每艘船都以它定航向——此邦无须纳贡，因无须主人，只要有星与贸易。他问你是依星航行，还是依货航行。",
      ],
      choices: [
        ["Buy cotton cloth at the dyer's export price", "按染工的出口价买下棉布"],
        ["Ask him to mark the road toward Aden", "请他标出通往亚丁的路"],
        ["Wait a day at the coast and watch the ships take the star", "在海岸等一日，看船只依星出航"],
      ],
      results: [
        ["He sells you cotton at a fair price. The cloth is fine and ready for the sea road.", "他按公道价卖给你棉布。布质精细，已备好走海路。"],
        ["Aden is marked on your map with the days between. The gulf road is open.", "亚丁连同其间的日子已标上舆图。海湾之路已通。"],
        ["You wait a day at the coast. The ships' courses are learned, and in Cambaet your name now carries a little more weight.", "你在海岸等了一日。船只的航向已学，坎巴叶的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-cambaet-export-price" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-cambaet" },
        { op: "codex", value: "cx-cambaet", reason: "carried-cotton-from-the-free-kingdom" },
      ],
      [
        { op: "reveal_map", value: "aden", reason: "dyer-marked-the-road-to-aden" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-gulf-road" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-ships-take-the-star" },
        { op: "reputation", value: 1, scope: "city", id: "cambaet", reason: "waited-at-the-coast" },
      ],
    ],
  },
  {
    city: "coilum",
    tier: "town",
    zhName: "俱蓝（奎隆）",
    enName: "Coilum",
    lore: { placeId: "coilum", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c022" } },
    scene: { bg: "monsoon-port", region: "india" },
    site: {
      title: ["Coilum: The Cultivated Pepper Gardens", "俱蓝：人工栽植的胡椒园"],
      body: [
        "In the kingdom where the pepper-trees are not wild but cultivated, planted and watered like vines, the garden masters of Coilum work the pepper in regular rows. A master who has tended the gardens since boyhood says the country also yields the brazil wood called Coilumin and ginger of the same name, and that idolaters, Christians, and Jews keep their own quarters under one king. He asks whether you have come for the pepper or the measure of the gardens.",
        "在这胡椒并非野生、而是如藤蔓般栽种浇灌的王国，俱蓝的园主把胡椒种成整齐的行列。一位自幼看园的主人说，此地亦产名俱蓝的苏木与同名之姜；偶像教徒、基督徒与犹太教徒各居其坊，共奉一王。他问你是来取胡椒，还是来取园圃的尺度。",
      ],
      choices: [
        ["Buy pepper at the garden master's price", "按园主之价买下胡椒"],
        ["Ask the garden master the road toward Maabar", "问园主通往马八儿的路"],
        ["Walk the gardens a day and learn the planting", "在园圃间走一日，学一学栽种"],
      ],
      results: [
        ["He sells you pepper at a fair weight. The berries are well dried, and the account of Coilum goes with it.", "他按公道分量卖给你胡椒。果粒晒得干透，俱蓝的记述也随它同行。"],
        ["Maabar and Melibar are marked on your map. The pepper coast is opening.", "马八儿与马拉巴已标上你的舆图。胡椒海岸正在展开。"],
        ["You spend a day among the rows. The planting is learned, and a small turn of fortune favours you.", "你在行间过了一日。栽种之法已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -900, reason: "bought-pepper-at-coilum-garden-price" },
        { op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-coilum" },
        { op: "codex", value: "cx-coilum", reason: "learned-the-cultivated-pepper-gardens" },
        { op: "queue_event", value: "ev-coilum-a-followup", reason: "coilum-a-followup" },
      ],
      [
        { op: "reveal_map", value: "maabar", reason: "garden-master-named-the-road-to-maabar" },
        { op: "reveal_map", value: "melibar", reason: "garden-master-named-the-road-to-melibar" },
        { op: "codex", value: "cx-coilum", reason: "mapped-the-pepper-coast" },
        { op: "queue_event", value: "ev-coilum-a-followup", reason: "coilum-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-pepper-gardens" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-garden-measure" },
      ],
    ],
    followup: {
      title: ["Coilum: The Garden Master's Second Page", "俱蓝：园主的第二页"],
      body: [
        "The garden master opens his ledger at the page of the watering seasons. He says the pepper vines are watered by hand in their season, and that the berries that go to the ships are counted by the basket — the kingdom has its own king and its own language and answers to no one. He asks what a traveller means to carry from a country that owes nothing.",
        "园主把账册翻到浇灌时令那一页。他说胡椒藤依季人工浇水，上船的果实按篮计数——此邦自有其王、其语，不向任何人负责。他问从这无所亏欠的邦国，你要带走什么。",
      ],
      choices: [
        ["Buy ginger at the garden's Coilumin price", "按园圃的俱蓝姜价买下生姜"],
        ["Ask him to mark the road toward Cail", "请他标出通往加异勒的路"],
        ["Sit a while among the vines and hear the seasons", "在藤间坐一会儿，听时令"],
      ],
      results: [
        ["He sells you ginger at a fair weight. The root is fine and will keep on the sea road.", "他按公道分量卖给你姜。姜质上佳，海路上经得存放。"],
        ["Cail is marked on your map with the days between. The coast road north is open.", "加异勒连同其间的日子已标上舆图。北去海岸路已通。"],
        ["You sit a while among the vines. The seasons are learned, and in Coilum your name now carries a little more weight.", "你在藤间坐了一会儿。时令已学，你的名字在俱蓝也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-ginger-at-coilum-garden-price" },
        { op: "goods", id: "ginger", value: 1, reason: "bought-ginger-at-coilum" },
        { op: "codex", value: "cx-coilum", reason: "carried-coinlum-ginger" },
      ],
      [
        { op: "reveal_map", value: "cail", reason: "garden-master-marked-the-road-to-cail" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-north-coast-road" },
      ],
      [
        { op: "days", value: 1, reason: "sat-among-the-vines" },
        { op: "reputation", value: 1, scope: "city", id: "coilum", reason: "studied-with-the-garden-master" },
      ],
    ],
  },
  {
    city: "dongola",
    tier: "station",
    zhName: "洞古剌",
    enName: "Dongola",
    lore: { placeId: "dongola", origin: "authored", disposition: "checked-weak", note: "已查：尼罗河城；维持 authored。" },
    scene: { bg: "desert-town", region: "india" },
    site: {
      title: ["Dongola: The River Market Between the Deserts", "洞古剌：两漠之间的河市"],
      body: [
        "At the station on the great river, the boatmen of Dongola work the shallows that carry trade between the desert roads and the river road. A boatman who has poled the current since boyhood says the river runs south toward the highlands and north toward the sea of Egypt, and that the dates of the river palms provision every crossing of the sands. He asks whether your road goes by water or by dune.",
        "在大河之畔的驿站，洞古剌的船夫撑船于浅水之间，连接沙漠之路与河上之路。一位自幼撑篙的船夫说，此河南通高原、北达埃及之海，河畔椰枣供给每一段过沙之旅。他问你的路走水，还是走沙丘。",
      ],
      choices: [
        ["Buy dates at the riverside price for the sand crossing", "按河畔之价买下椰枣，备过沙之用"],
        ["Ask the boatman the roads toward Mecha", "问船夫通往默伽的路"],
        ["Watch the shallows a day and learn the current", "看一日浅水，学一学水势"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the sand, and the account of Dongola goes with it.", "他按公道分量卖给你椰枣。果子在沙上经得存放，洞古剌的记述也随它同行。"],
        ["Mecha and Axuma are marked on your map. The roads south and west are open.", "默伽与阿克苏姆已标上你的舆图。南去西向之路已通。"],
        ["You spend a day at the shallows. The current is learned, and a small turn of fortune favours you.", "你在浅水边过了一日。水势已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-dongola-riverside-price" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-dongola" },
        { op: "codex", value: "cx-dongola", reason: "dongola-book-entry" },
        { op: "queue_event", value: "ev-dongola-a-followup", reason: "dongola-a-followup" },
      ],
      [
        { op: "reveal_map", value: "mecha", reason: "boatman-named-the-road-to-mecha" },
        { op: "reveal_map", value: "axuma", reason: "boatman-named-the-road-to-axuma" },
        { op: "queue_event", value: "ev-dongola-a-followup", reason: "dongola-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-shallows" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-current" },
      ],
    ],
    followup: {
      title: ["Dongola: The Boatman's Second Word on the River", "洞古剌：船夫谈河的第二句话"],
      body: [
        "The boatman poles you out to the mid-channel and speaks of the river as the only honest road in this land. He says the desert roads lie and the river does not — the current tells the season, the shallows tell the year, and the date palms tell the traveller when the crossing is safe. He asks whether you will trust the river's measure over the dunes' promises.",
        "船夫把你撑到河心，说这条河是此地唯一诚实的路。他说沙路会说谎，河不会——水势说季候，浅滩说年成，椰枣树告诉旅人何时渡沙安全。他问你是信河的尺度，还是信沙丘的许诺。",
      ],
      choices: [
        ["Buy leather at the boatman's market price", "按船夫的市价买下皮革"],
        ["Ask him to name the road toward Medina", "请他点名通往默德那的路"],
        ["Wait a day and help mend the river boats", "等一日，相助修补河船"],
      ],
      results: [
        ["He sells you leather at a fair price. The hide is sound for straps and saddles.", "他按公道价卖给你皮。皮革结实，可作系带与鞍具。"],
        ["Medina is marked on your map with the days between. The north-west road is open.", "默德那连同其间的日子已标上舆图。西北之路已通。"],
        ["You spend a day among the boats. The river's ways are learned, and in Dongola your name now carries a little more weight.", "你在船间过了一日。河的脾性已学，洞古剌的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -500, reason: "bought-leather-at-dongola-market" },
        { op: "goods", id: "leather", value: 1, reason: "bought-leather-at-dongola" },
      ],
      [
        { op: "reveal_map", value: "medina", reason: "boatman-named-the-road-to-medina" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-north-west-road" },
      ],
      [
        { op: "days", value: 1, reason: "mended-the-river-boats" },
        { op: "reputation", value: 1, scope: "city", id: "dongola", reason: "helped-mend-the-boats" },
      ],
    ],
  },
  {
    city: "dufar",
    tier: "town",
    zhName: "佐法尔",
    enName: "Dufar",
    lore: { placeId: "dufar", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c038" } },
    scene: { bg: "spice-harbour", region: "india" },
    site: {
      title: ["Dufar: The Notched Incense Trees", "佐法尔：刀痕累累的乳香树"],
      body: [
        "In the great and noble city on the sea with a very good haven, the incense men of Dufar work the trees that grow like small firs, notching them with a knife in several places so that the white incense runs out of the wounds. A master of the notching says the city belongs to the province of Aden and its count is subject to the Soldan, and that great numbers of Arab horses are taken hence to the Indian market — but the incense is the city's own voice, and it asks you whether you will listen.",
        "在这座临海、港埠极佳的巨城，佐法尔的乳香人经营着那些形如小枞的树：以刀在树身数处刻痕，白色的乳香便从伤口流出。一位刻痕师傅说，此城隶属亚丁省，其伯爵臣于苏丹；阿拉伯骏马由此大批贩往印度——而乳香才是此城自己的声音，它问你愿不愿意听。",
      ],
      choices: [
        ["Buy white incense at the notcher's price", "按刻痕师之价买下白乳香"],
        ["Ask the notcher the sea road toward Esher", "问刻痕师通往呵舍儿的海路"],
        ["Watch the notching a day and learn the trees' season", "看一日刻痕，学一学树的时节"],
      ],
      results: [
        ["He sells you white incense at a fair weight. The resin is of the first quality, and the account of Dufar goes with it.", "他按公道分量卖给你白乳香。树脂品质头等，佐法尔的记述也随它同行。"],
        ["Esher and Calatu are marked on your map. The sea roads of the incense coast are open.", "呵舍儿与哈剌图已标上你的舆图。乳香海岸的海路已通。"],
        ["You spend a day at the notching. The trees' season is learned, and a small turn of fortune favours you.", "你在刻痕场过了一日。树的时节已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -550, reason: "bought-white-incense-at-dufar-notcher-price" },
        { op: "goods", id: "frankincense", value: 1, reason: "bought-white-incense-at-dufar" },
        { op: "codex", value: "cx-dufar", reason: "learned-the-notched-incense-trees" },
        { op: "queue_event", value: "ev-dufar-a-followup", reason: "dufar-a-followup" },
      ],
      [
        { op: "reveal_map", value: "esher", reason: "notcher-named-the-sea-road-to-esher" },
        { op: "reveal_map", value: "calatu", reason: "notcher-named-the-sea-road-to-calatu" },
        { op: "codex", value: "cx-dufar", reason: "mapped-the-incense-coast" },
        { op: "queue_event", value: "ev-dufar-a-followup", reason: "dufar-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-notching" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-trees-season" },
      ],
    ],
    followup: {
      title: ["Dufar: The Notcher's Second Word on the Wound", "佐法尔：刻痕师谈伤口的第二句话"],
      body: [
        "The notcher takes you among the trees and shows you the old scars. He says the tree gives its incense only through the wound, and that the wound must be made in the right season or the tree gives nothing — the notching is a covenant, not a violence. He says the city's trade in horses and ships is the same: profit comes where the measure is kept. He asks whether you will take the incense and keep the measure.",
        "刻痕师把你领进树间，给你看旧日的疤痕。他说树只从伤口流出乳香，而伤口须在当季刻下，否则树一无所予——刻痕是契约，不是伤害。他说此城的马匹与船只之贸亦然：尺度守住了，利才来。他问你是否愿取乳香而守尺度。",
      ],
      choices: [
        ["Buy myrrh at the notcher's second price", "按刻痕师的次价买下没药"],
        ["Ask him to mark the road toward Aden", "请他标出通往亚丁的路"],
        ["Wait a day in the groves and learn the season's keeping", "在林中等一日，学时节的守持"],
      ],
      results: [
        ["He sells you myrrh at a fair price. The resin is sealed and ready for the sea road.", "他按公道价卖给你没药。树脂已封好待行海路。"],
        ["Aden is marked on your map with the days between. The gulf road is open.", "亚丁连同其间的日子已标上舆图。海湾之路已通。"],
        ["You wait a day in the groves. The season's keeping is learned, and in Dufar your name now carries a little more weight.", "你在林中等了一日。时节的守持已学，你的名字在佐法尔也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-at-dufar-notcher-price" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-dufar" },
        { op: "codex", value: "cx-dufar", reason: "kept-the-measure-of-the-incense-trade" },
      ],
      [
        { op: "reveal_map", value: "aden", reason: "notcher-marked-the-road-to-aden" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-gulf-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-seasons-keeping" },
        { op: "reputation", value: 1, scope: "city", id: "dufar", reason: "kept-the-seasons-covenant" },
      ],
    ],
  },
  {
    city: "maabar",
    tier: "town",
    zhName: "马八儿",
    enName: "Maabar",
    lore: { placeId: "maabar", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c016" } },
    scene: { bg: "monsoon-port", region: "india" },
    site: {
      title: ["Maabar: The Pearl Divers of the Gulf", "马八儿：海湾的采珠人"],
      body: [
        "In the great province styled India the Greater, the finest and noblest in the world, the pearl divers of Maabar work the gulf between the island of Seilan and the mainland, where very fine and great pearls are found. A diver who has gone down since boyhood says five royal brothers reign over the province, and that the pearls are brought up by men who hold their breath longer than other men can — and that a traveller who buys a pearl without hearing the dive's price pays a landsman's price.",
        "在这号称大印度、举世最良最贵的大省，马八儿的采珠人在锡兰岛与大陆之间的海湾作业，此地所出珍珠又大又好。一位自幼下水的采珠人说，本省由五位王族兄弟分治；珍珠由比常人更能屏息的人带上水面——不听下潜之价便买珠的旅人，付的是不识水性之人的价钱。",
      ],
      choices: [
        ["Buy a pearl at the diver's price", "按采珠人之价买下一颗珍珠"],
        ["Ask the diver the roads toward Cail", "问采珠人通往加异勒的路"],
        ["Watch the diving a day from the boats", "在船上看一日采珠"],
      ],
      results: [
        ["He sells you a pearl at his fixed price. The stone is round and clear, and the account of Maabar goes with it.", "他按定价卖给你一颗珍珠。珠子圆润清亮，马八儿的记述也随它同行。"],
        ["Cail and Coilum are marked on your map. The pearl coast is opening.", "加异勒与俱蓝已标上你的舆图。珠岸正在展开。"],
        ["You spend a day with the divers. The breath's measure is learned, and a small turn of fortune favours you.", "你与采珠人待了一日。屏息的尺度已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -2200, reason: "bought-pearl-at-maabar-diver-price" },
        { op: "goods", id: "pearls", value: 1, reason: "bought-pearl-at-maabar" },
        { op: "codex", value: "cx-maabar", reason: "learned-the-pearl-divers-of-maabar" },
        { op: "queue_event", value: "ev-maabar-a-followup", reason: "maabar-a-followup" },
      ],
      [
        { op: "reveal_map", value: "cail", reason: "diver-named-the-road-to-cail" },
        { op: "reveal_map", value: "coilum", reason: "diver-named-the-road-to-coilum" },
        { op: "codex", value: "cx-maabar", reason: "mapped-the-pearl-coast" },
        { op: "queue_event", value: "ev-maabar-a-followup", reason: "maabar-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-diving" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-breaths-measure" },
      ],
    ],
    followup: {
      title: ["Maabar: The Diver's Second Word on the Deep", "马八儿：采珠人谈深水的第二句话"],
      body: [
        "The diver sits you down on the strand and speaks of the pearl season. He says the merchants' companies hire the divers by wages in April and May, and pay the king a tenth of the take, and the fish-charmers, the Abraiaman, a twentieth for the charm that quiets the water — the pearls come up by measure and by charm together. He asks whether you will buy by the companies' measure or the divers'.",
        "采珠人让你在滩上坐下，谈起珠季。他说商行于四月五月以工钱雇采珠人，所获以十分之一奉王，又以二十分之一予渔咒师阿婆罗门，酬其镇水之咒——珠出水，既凭尺度，也凭咒。他问你是依商行之量买，还是依采珠人之量买。",
      ],
      choices: [
        ["Buy a pearl at the companies' measure", "按商行之量买下一颗珍珠"],
        ["Ask him to mark the road toward Melibar", "请他标出通往马拉巴的路"],
        ["Wait a day at the strand and learn the gulf's seasons", "在滩上等一日，学海湾的季候"],
      ],
      results: [
        ["He sells you a pearl at the companies' measure. The stone is sealed in cloth, ready for the road.", "他按商行之量卖给你一颗珍珠。珠子以布封好，待行上路。"],
        ["Melibar is marked on your map with the days between. The coast road is open.", "马拉巴连同其间的日子已标上舆图。海岸路已通。"],
        ["You wait a day at the strand. The gulf's seasons are learned, and in Maabar your name now carries a little more weight.", "你在滩上等了一日。海湾的季候已学，马八儿的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -2000, reason: "bought-second-pearl-at-maabar-law-price" },
        { op: "goods", id: "pearls", value: 1, reason: "bought-second-pearl-at-maabar" },
        { op: "codex", value: "cx-maabar", reason: "kept-the-divers-law" },
      ],
      [
        { op: "reveal_map", value: "melibar", reason: "diver-marked-the-road-to-melibar" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-coast-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-gulfs-seasons" },
        { op: "reputation", value: 1, scope: "city", id: "maabar", reason: "learned-with-the-divers" },
      ],
    ],
  },
  {
    city: "mecha",
    tier: "town",
    zhName: "默伽（麦加）",
    enName: "Mecha",
    lore: { placeId: "mecha", origin: "authored", disposition: "checked-weak", note: "已查：朝觐之城，行纪守观察尺度；维持 authored。" },
    scene: { bg: "desert-town", region: "india" },
    site: {
      title: ["Mecha: The Pilgrim Caravans at the Holy City", "默伽：圣城前的朝觐商队"],
      body: [
        "At the holy city in the valley, the caravan masters of Mecha provision the pilgrim hosts that come from every land, and the wells of the town serve more travellers than any market on the coast. A caravan master who has watered a hundred pilgrim trains says the city lives by the devotion of others, and that its trade follows the seasons of the pilgrimage — a traveller who comes in the pilgrim season may buy anything, and one who comes between may buy little. He asks when your road brings you here.",
        "在这座山谷中的圣城，默伽的商队主事为来自万方的朝觐人群备办粮水，城中的井泉供应的旅人多于海岸任何市集。一位曾为上百支朝觐队伍供水的主事说，此城以他人的虔诚为生，贸易随朝觐之季而行——朝季来此的旅人什么都买得到，季间来的则买不到什么。他问你的路何时带你到此。",
      ],
      choices: [
        ["Buy dates at the caravan master's pilgrim price", "按商队主事的朝觐价买下椰枣"],
        ["Ask the caravan master the road toward Medina", "问商队主事通往默德那的路"],
        ["Walk the pilgrim quarters a day and note the season's traffic", "在朝觐坊间走一日，记下当季的往来"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Mecha goes with it.", "他按公道分量卖给你椰枣。果子在路上经得存放，默伽的记述也随它同行。"],
        ["Medina and Dongola are marked on your map. The roads of the pilgrim country are open.", "默德那与洞古剌已标上你的舆图。朝觐乡之路已通。"],
        ["You spend a day among the quarters. The season's traffic is noted, and a small turn of fortune favours you.", "你在坊间过了一日。当季的往来已记，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-mecha-pilgrim-price" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-mecha" },
        { op: "codex", value: "cx-mecha", reason: "mecha-book-entry" },
        { op: "queue_event", value: "ev-mecha-a-followup", reason: "mecha-a-followup" },
      ],
      [
        { op: "reveal_map", value: "medina", reason: "caravan-master-named-the-road-to-medina" },
        { op: "reveal_map", value: "dongola", reason: "caravan-master-named-the-road-to-dongola" },
        { op: "queue_event", value: "ev-mecha-a-followup", reason: "mecha-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-pilgrim-quarters" },
        { op: "fate", id: "rapport", value: 1, reason: "noted-the-seasons-traffic" },
      ],
    ],
    followup: {
      title: ["Mecha: The Caravan Master's Second Word", "默伽：商队主事的第二句话"],
      body: [
        "The caravan master shows you the provisioning ledgers of the season — how much water the wells give, how many trains can be served, how the city measures its hospitality. He says the valley can feed a host or refuse it, and that the city's peace is kept by the same law that feeds the pilgrims. He asks whether you come to Mecha as a traveller of the road or of the season.",
        "商队主事给你看当季的备办账册——井泉出多少水、可供应多少支队伍、此城如何计量其款待。他说这山谷养得起一城之众，也拒得了一城之众；养活朝觐者的法，也正是维持此城太平的法。他问你来默伽，是作行路之客，还是作当季之客。",
      ],
      choices: [
        ["Buy myrrh sealed for the road north", "买下封好北行的没药"],
        ["Ask him to name the road toward Bethleem", "请他指明通往伯利恒的路"],
        ["Wait a day at the wells and learn the city's measure", "在井边等一日，学此城的计量"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the northern road.", "他按公道价卖给你没药，叶封完好。树脂在北路上经得存放。"],
        ["Bethleem is marked on your map with the days between. The north road is open.", "伯利恒连同其间的日子已标上舆图。北路已通。"],
        ["You wait a day at the wells. The city's measure is learned, and in Mecha your name now carries a little more weight.", "你在井边等了一日。此城的计量已学，你的名字在默伽也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-road-north" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-mecha" },
      ],
      [
        { op: "reveal_map", value: "bethleem", reason: "caravan-master-named-the-road-to-bethleem" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-north-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-citys-measure" },
        { op: "reputation", value: 1, scope: "city", id: "mecha", reason: "learned-the-citys-measure" },
      ],
    ],
  },
  {
    city: "medina",
    tier: "station",
    zhName: "默德那（麦地那）",
    enName: "Medina",
    lore: { placeId: "medina", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m014" } },
    scene: { bg: "oasis-town", region: "india" },
    site: {
      title: ["Medina: The Palm Gardens and the Watering of the Hosts", "默德那：椰枣园与旅众的供水"],
      body: [
        "At the venerated city where the pilgrims come to renew their provision of water, the garden masters of Medina tend the palm gardens and the wells that serve the hosts. A master who keeps the water accounts says the road from the coast runs three days to this place, and that the city measures its water as carefully as its dates — a traveller who draws without leave is a burden, one who asks is a guest. He asks which you mean to be.",
        "在这座朝觐者来此续水的尊崇之城，默德那的园主照看椰枣园与供众之井。一位掌管水账的园主说，自海岸至此须三日程；此城量水如量枣——不告而取者负人，开口相求者是客。他问你要做哪一种。",
      ],
      choices: [
        ["Buy dates at the garden master's price", "按园主之价买下椰枣"],
        ["Ask the garden master the roads toward Petra", "问园主通往佩特拉的路"],
        ["Walk the gardens a day and learn the water's keeping", "在园中走一日，学一学水的守持"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit is sweet and will keep on the road.", "他按公道分量卖给你椰枣。果子甘甜，路上经得存放。"],
        ["Petra and Bethleem are marked on your map. The north roads are open.", "佩特拉与伯利恒已标上你的舆图。北路已通。"],
        ["You spend a day among the gardens. The water's keeping is learned, and a small turn of fortune favours you.", "你在园中过了一日。水的守持已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-medina-garden-price" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-medina" },
        { op: "codex", value: "cx-medina", reason: "medina-book-entry" },
        { op: "queue_event", value: "ev-medina-a-followup", reason: "medina-a-followup" },
      ],
      [
        { op: "reveal_map", value: "petra", reason: "garden-master-named-the-road-to-petra" },
        { op: "reveal_map", value: "bethleem", reason: "garden-master-named-the-road-to-bethleem" },
        { op: "queue_event", value: "ev-medina-a-followup", reason: "medina-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-gardens" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-waters-keeping" },
      ],
    ],
    followup: {
      title: ["Medina: The Garden Master's Word on the Wells", "默德那：园主谈井"],
      body: [
        "The garden master takes you to the well that serves the pilgrim road and speaks of water as the city's true coin. He says the gardens and the wells were the reason the road was made, and that the city renews the provision of every host that passes — the water is drawn, the dates are counted, the blessing is spoken. He asks what you will draw from this city's measure.",
        "园主把你领到供朝觐之路的井边，把水说成此城真正的钱。他说园林与井正是此路被筑成的原因；城中为每一位过路的旅众续水——水被汲取，枣被点数，祝语被说出。他问你要从这城的计量中取走什么。",
      ],
      choices: [
        ["Buy dates at the pilgrim measure, sealed for the road", "按旅众之量买下封好的椰枣"],
        ["Ask him to mark the road toward Mecha", "请他标出通往默伽的路"],
        ["Wait a day at the well and help draw for the hosts", "在井边等一日，相助为旅众汲水"],
      ],
      results: [
        ["He sells you dates at the gardener's own measure, sealed in leaf. The fruit will keep to the next oasis.", "他按园主自用之量卖给你椰枣，叶封完好。果子可存至下一处绿洲。"],
        ["Mecha is marked on your map with the days between. The pilgrim road south is open.", "默伽连同其间的日子已标上舆图。南去朝觐路已通。"],
        ["You spend a day at the well. The hosts' measure is learned, and in Medina your name now carries a little more weight.", "你在井边过了一日。旅众的计量已学，默德那的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -350, reason: "bought-dates-at-medina-pilgrim-measure" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-medina-pilgrim-measure" },
      ],
      [
        { op: "reveal_map", value: "mecha", reason: "garden-master-marked-the-road-to-mecha" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-pilgrim-road-south" },
      ],
      [
        { op: "days", value: 1, reason: "drew-for-the-hosts" },
        { op: "reputation", value: 1, scope: "city", id: "medina", reason: "drew-water-for-the-hosts" },
      ],
    ],
  },
  {
    city: "semenat",
    tier: "town",
    zhName: "苏门纳（索姆纳特）",
    enName: "Semenat",
    lore: { placeId: "semenat", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c029" } },
    scene: { bg: "monsoon-port", region: "india" },
    site: {
      title: ["Semenat: The Honest Trade of the Free Kingdom", "苏门纳：自由之邦的诚实贸易"],
      body: [
        "In the great kingdom towards the west that pays tribute to nobody, the merchants of Semenat are not corsairs but live by trade and industry as honest people ought, and their city is a place of very great trade. A merchant who has weighed cargoes for thirty years says the kingdom has its own king and its own language, and that a traveller who deals straight with this market is dealt with straight in return — the one law of the place. He asks your word on it.",
        "在这片不向任何人纳贡的西方大邦，苏门纳的商人不做海盗，而如诚实人一般以商贾与手艺为生，其城贸易极盛。一位称了三十年货物的商人说，此邦自有其王、其语；与这市集直来直往的旅人，也会被直来直往地对待——这是此地唯一的一条法。他问你能不能应下这句话。",
      ],
      choices: [
        ["Buy cotton cloth at the merchant's straight price", "按商人的实价买下棉布"],
        ["Ask the merchant the road toward Cambaet", "问商人通往坎巴叶的路"],
        ["Watch the weighing a day and learn the market's law", "看一日称量，学一学市集之法"],
      ],
      results: [
        ["He sells you cotton at a fair weight, weighed openly before your eyes. The account of Semenat goes with it.", "他当着你的面公开称量，按公道分量卖给你棉布。苏门纳的记述也随它同行。"],
        ["Cambaet and Tana are marked on your map. The western trade roads are open.", "坎巴叶与塔那已标上你的舆图。西向商路已通。"],
        ["You spend a day at the scales. The market's law is learned, and a small turn of fortune favours you.", "你在秤旁过了一日。市集之法已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-semenat-straight-price" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-semenat" },
        { op: "codex", value: "cx-semenat", reason: "learned-the-honest-trade-of-semenat" },
        { op: "queue_event", value: "ev-semenat-a-followup", reason: "semenat-a-followup" },
      ],
      [
        { op: "reveal_map", value: "cambaet", reason: "merchant-named-the-road-to-cambaet" },
        { op: "reveal_map", value: "tana", reason: "merchant-named-the-road-to-tana" },
        { op: "codex", value: "cx-semenat", reason: "mapped-the-western-trade-roads" },
        { op: "queue_event", value: "ev-semenat-a-followup", reason: "semenat-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-weighing" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-markets-law" },
      ],
    ],
    followup: {
      title: ["Semenat: The Merchant's Second Word on the Scale", "苏门纳：商人谈秤的第二句话"],
      body: [
        "The merchant sets a balance on the bale between you and lays a stone of known weight beside it. He says the market of Semenat runs on this: the stone is the same for everyone, and the man who changes the stone for his own gain is not a merchant but a thief, and is dealt with as such. He asks whether you will trade by the same stone.",
        "商人在你面前的货包上放下一架天平，旁边搁一块已知重量的砝石。他说苏门纳的市集就靠这条运转：砝石对所有人相同，为私利换砝石的不是商人，是贼，也会被当作贼处置。他问你是否愿按同一块砝石做买卖。",
      ],
      choices: [
        ["Buy indigo at the market's known-weight price", "按市集之秤买下靛蓝"],
        ["Ask him to mark the road toward Delli", "请他标出通往德里的路"],
        ["Wait a day at the scales and learn the weights' keeping", "在秤旁等一日，学砝石的守持"],
      ],
      results: [
        ["He sells you indigo at a fair weight, weighed on the same stone. The dye is ready for the road.", "他按同一块砝石称量，公道卖给你靛蓝。染料已备好待行。"],
        ["Delli is marked on your map with the days between. The inland road is open.", "德里连同其间的日子已标上舆图。内陆之路已通。"],
        ["You wait a day at the scales. The weights' keeping is learned, and in Semenat your name now carries a little more weight.", "你在秤旁等了一日。砝石的守持已学，你的名字在苏门纳也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -800, reason: "bought-indigo-at-semenat-known-weight" },
        { op: "goods", id: "indigo", value: 1, reason: "bought-indigo-at-semenat" },
        { op: "codex", value: "cx-semenat", reason: "traded-by-the-same-stone" },
      ],
      [
        { op: "reveal_map", value: "delli", reason: "merchant-marked-the-road-to-delli" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-inland-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-weights-keeping" },
        { op: "reputation", value: 1, scope: "city", id: "semenat", reason: "traded-by-the-markets-law" },
      ],
    ],
  },
  {
    city: "tana",
    tier: "town",
    zhName: "塔那",
    enName: "Tana",
    lore: { placeId: "tana", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c027" } },
    scene: { bg: "monsoon-port", region: "india" },
    site: {
      title: ["Tana: The Leather Quays and the Corsairs' King", "塔那：皮革码头与纵容私掠的王"],
      body: [
        "In the great kingdom towards the west where no pepper grows but plenty of incense, the tanners of Tana dress leather of various excellent kinds at the quays, and buckram and cotton go out with them. A tanner who has worked the hides for years says the port is frequented by many ships and merchants, and that with the King's connivance many corsairs launch from this port to plunder — a traveller should know which quays to trust and which to pass. He asks which you intend to use.",
        "在这片无胡椒而多乳香的西方大邦，塔那的鞣皮匠在码头鞣制各种上等皮革，麻布与棉布随之一同出口。一位浸了多年皮子的工匠说，此港船商云集；而在国王的默许下，许多私掠船也自港中出海劫掠——旅人须分清哪些码头可信，哪些该绕过。他问你要用哪一个。",
      ],
      choices: [
        ["Buy leather at the tanner's honest price", "按鞣皮匠的实价买下皮革"],
        ["Ask the tanner the sea road toward Melibar", "问鞣皮匠通往马拉巴的海路"],
        ["Walk the quays a day and learn which are honest", "在码头走一日，学一学哪些可信"],
      ],
      results: [
        ["He sells you leather at a fair price. The hide is well dressed and will serve for straps and saddles.", "他按公道价卖给你皮革。皮子鞣制精良，可作系带与鞍具。"],
        ["Melibar and Cambaet are marked on your map. The sea roads are open.", "马拉巴与坎巴叶已标上你的舆图。海路已通。"],
        ["You spend a day among the quays. The honest and the otherwise are learned apart, and a small turn of fortune favours you.", "你在码头间过了一日。可信与不可信已分得清楚，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -500, reason: "bought-leather-at-tana-tanner-price" },
        { op: "goods", id: "leather", value: 1, reason: "bought-leather-at-tana" },
        { op: "codex", value: "cx-tana", reason: "learned-the-leather-quays-of-tana" },
        { op: "queue_event", value: "ev-tana-a-followup", reason: "tana-a-followup" },
      ],
      [
        { op: "reveal_map", value: "melibar", reason: "tanner-named-the-sea-road-to-melibar" },
        { op: "reveal_map", value: "cambaet", reason: "tanner-named-the-sea-road-to-cambaet" },
        { op: "codex", value: "cx-tana", reason: "mapped-the-sea-roads-from-tana" },
        { op: "queue_event", value: "ev-tana-a-followup", reason: "tana-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-quays" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-honest-quays" },
      ],
    ],
    followup: {
      title: ["Tana: The Tanner's Second Word on the Harbour", "塔那：鞣皮匠谈港的第二句话"],
      body: [
        "The tanner takes you to the seaward end of the quay and speaks low. He says the corsairs and the honest merchants sail from the same water, and the King's connivance is the harbour's weather — sometimes fair, sometimes foul, and a man who reads it wrong loses his cargo and his life. He says the leather trade is the safe trade, and asks whether you will ship leather or risk the other quays.",
        "鞣皮匠把你领到码头靠海的一端，压低声音说。他说私掠者与诚实商人从同一片水出海，王的默许就是这港的天气——时而晴，时而阴，读错的人货命俱失。他说皮货生意是稳妥的生意，问你是要运皮，还是去赌别的码头。",
      ],
      choices: [
        ["Buy cotton cloth at the tanner's second price", "按鞣皮匠的次价买下棉布"],
        ["Ask him to mark the safe road toward Semenat", "请他标出通往苏门纳的安全之路"],
        ["Wait a day at the tanneries and learn the harbour's weather", "在鞣皮坊等一日，学港上的天气"],
      ],
      results: [
        ["He sells you cotton at a fair price. The cloth is fine and will fetch its worth up the coast.", "他按公道价卖给你棉布。布质精细，沿岸可值其价。"],
        ["Semenat is marked on your map with the safe stages between. The honest road is open.", "苏门纳连同其间安全站点已标上舆图。稳妥之路已通。"],
        ["You wait a day at the tanneries. The harbour's weather is learned, and in Tana your name now carries a little more weight.", "你在鞣皮坊等了一日。港上的天气已学，塔那的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-tana-second-price" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-tana" },
        { op: "codex", value: "cx-tana", reason: "shipped-leather-and-cotton-from-tana" },
      ],
      [
        { op: "reveal_map", value: "semenat", reason: "tanner-marked-the-safe-road-to-semenat" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-safe-stages" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-harbours-weather" },
        { op: "reputation", value: 1, scope: "city", id: "tana", reason: "learned-the-harbours-weather" },
      ],
    ],
  },
  // ─── B4 west_asia · 1/2 ───────────────────────────────────────────
  {
    city: "antiochia",
    tier: "town",
    zhName: "昂都城（安条克）",
    enName: "Antiochia",
    lore: { placeId: "antiochia", origin: "source", ref: { book: "ibn-battuta", chapterId: "battuta-c005" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Antiochia: The Citadel Above the Valley", "昂都城：谷上的城寨"],
      body: [
        "In the great city of the valley, the citadel of Antiochia stands on the mountain above the town, and the markets below trade in steel and brocade and the goods of three roads. A guard who has kept the citadel gate for years says the city has been besieged so often that the walls remember every army — and that a traveller who climbs to the citadel sees the roads by which the city is fed, which is more than the market knows. He asks whether you trade in the valley or read the heights.",
        "在这座谷中巨城，安条克的城寨矗立山巅，下方的市集交易钢铁、锦缎与三条路的货色。一位守了多年寨门的卫兵说，此城受围之多次，连城墙都记得每一支军队——登上城寨的旅人，能看见养活此城的道路，这是市集里看不到的。他问你是要在谷中贸易，还是登高读路。",
      ],
      choices: [
        ["Buy damascus-steel at the market's price", "按市集之价买下大马士革钢"],
        ["Ask the guard the roads toward Berrhoea", "问卫兵通往阿勒颇的路"],
        ["Climb to the citadel a day and read the valley's roads", "登一日城寨，读一读谷中的路"],
      ],
      results: [
        ["He sells you steel at a fair price. The blade is well forged, and the account of Antiochia goes with it.", "他按公道价卖给你钢。刃口锻得精良，昂都城的记述也随它同行。"],
        ["Berrhoea and Tarsus are marked on your map. The valley roads are open.", "阿勒颇与大数已标上你的舆图。谷路已通。"],
        ["You spend a day on the heights. The roads by which the city is fed are read, and a small turn of fortune favours you.", "你在高处过了一日。养城之路已读，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1400, reason: "bought-damascus-steel-at-antiochia-market" },
        { op: "goods", id: "damascus-steel", value: 1, reason: "bought-damascus-steel-at-antiochia" },
        { op: "codex", value: "cx-antiochia", reason: "antiochia-book-entry" },
        { op: "queue_event", value: "ev-antiochia-a-followup", reason: "antiochia-a-followup" },
      ],
      [
        { op: "reveal_map", value: "berrhoea", reason: "guard-named-the-road-to-berrhoea" },
        { op: "reveal_map", value: "tarsus", reason: "guard-named-the-road-to-tarsus" },
        { op: "queue_event", value: "ev-antiochia-a-followup", reason: "antiochia-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "climbed-to-the-citadel" },
        { op: "fate", id: "rapport", value: 1, reason: "read-the-valleys-roads" },
      ],
    ],
    followup: {
      title: ["Antiochia: The Guard's Second Word on the Walls", "昂都城：卫兵谈墙的第二句话"],
      body: [
        "The guard takes you along the wall-walk and points out the siege marks in the stone. He says the city has been taken and retaken so many times that its people keep their goods in the citadel and their loyalties in their sleeves — the market deals with whoever holds the gate. He asks what a traveller of many roads makes of a city that has learned to serve every conqueror and serve none.",
        "卫兵带你沿墙道行走，指出石上的围城痕迹。他说此城被攻取又夺回太多次，城中人把货存进寨里，把忠心藏在袖中——市集与任何守着城门的人做生意。他问你这多路的旅人，如何看待一座学会侍奉每一个征服者、却从不真正侍奉谁的城。",
      ],
      choices: [
        ["Buy brocade at the citadel's price", "按城寨之价买下锦缎"],
        ["Ask him to mark the road toward Edessa", "请他标出通往以得撒的路"],
        ["Wait a day on the wall and learn the siege marks", "在墙上等一日，学认围城痕迹"],
      ],
      results: [
        ["He sells you brocade at a fair price. The cloth is rich and will keep its worth on the road.", "他按公道价卖给你锦缎。料子富丽，路上不失其值。"],
        ["Edessa is marked on your map with the days between. The eastern road is open.", "以得撒连同其间的日子已标上舆图。东路已通。"],
        ["You wait a day on the wall. The siege marks are learned, and in Antiochia your name now carries a little more weight.", "你在墙上等了一日。围城痕迹已学，你的名字在昂都城也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-brocade-at-antiochia-citadel" },
        { op: "goods", id: "baghdad-brocade", value: 1, reason: "bought-brocade-at-antiochia" },
      ],
      [
        { op: "reveal_map", value: "edessa", reason: "guard-marked-the-road-to-edessa" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-eastern-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-siege-marks" },
        { op: "reputation", value: 1, scope: "city", id: "antiochia", reason: "studied-with-the-citadel-guard" },
      ],
    ],
  },
  {
    city: "babylonia-cairus",
    tier: "town",
    zhName: "巴比伦尼亚（开罗）",
    enName: "Babylonia (Cairus)",
    lore: { placeId: "babylonia-cairus", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m001" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Babylonia: The Sultan's Men at the Quay", "巴比伦尼亚：苏丹的吏员在码头"],
      body: [
        "At the great city of Egypt, the agents of the Sultan come aboard every ship that enters and record all that has been brought — the names and descriptions of the passengers, and every bale of merchandise or money, that the zakat may be paid. A clerk of the customs who has written such lists for years says the river brings the trade of the world to this quay, and that no ship departs without his seal. He asks what cargo you carry, so that the book may be true.",
        "在埃及的大城，苏丹的吏员登临每一艘进港的船，录下所载一切——旅客的姓名容貌，每一包货物与银钱，以便完纳天课。一位写了多年这类名册的税吏说，这条河把世间的贸易都带到这座码头，无船不盖他的印信便不得离港。他问你带的是什么货，好让名册成真。",
      ],
      choices: [
        ["Buy dates at the quay's market price", "按码头市价买下椰枣"],
        ["Ask the clerk the roads toward Bethleem", "问税吏通往伯利恒的路"],
        ["Watch the recording a day and learn the book's measure", "看一日录册，学一学名册的尺度"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of the city goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，此城的记述也随它同行。"],
        ["Bethleem and Petra are marked on your map. The roads out of Egypt are open.", "伯利恒与佩特拉已标上你的舆图。出埃及之路已通。"],
        ["You spend a day at the recording. The book's measure is learned, and a small turn of fortune favours you.", "你在录册处过了一日。名册的尺度已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-babylonia-quay-price" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-babylonia" },
        { op: "codex", value: "cx-babylonia-cairus", reason: "babylonia-cairus-book-entry" },
        { op: "queue_event", value: "ev-babylonia-cairus-a-followup", reason: "babylonia-cairus-a-followup" },
      ],
      [
        { op: "reveal_map", value: "bethleem", reason: "clerk-named-the-road-to-bethleem" },
        { op: "reveal_map", value: "petra", reason: "clerk-named-the-road-to-petra" },
        { op: "queue_event", value: "ev-babylonia-cairus-a-followup", reason: "babylonia-cairus-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-recording" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-books-measure" },
      ],
    ],
    followup: {
      title: ["Babylonia: The Clerk's Second Page of the Book", "巴比伦尼亚：税吏名册的第二页"],
      body: [
        "The clerk shows you the page where the ship's cargo is written, and where the zakat is reckoned. He says the Sultan's law asks every Muslim what merchandise or money he has, without enquiring how long it has been in his possession — the book does not judge the past, it taxes the present. He asks whether your book of travels will be as honest as the customs' book.",
        "税吏给你看名册上写着船货、算着天课的那一页。他说苏丹之法问每一位穆斯林随身有多少货物与银钱，不问已在手中多久——名册不判过去，只课当下。他问你的行纪，会不会像这册税簿一样诚实。",
      ],
      choices: [
        ["Buy rosewater sealed for the road north", "买下封好北行的玫瑰水"],
        ["Ask him to mark the road toward Alexandria", "请他标出通往亚历山大港的路"],
        ["Wait a day at the customs and learn the tariff's seasons", "在税关等一日，学税率的季节"],
      ],
      results: [
        ["He sells you rosewater at a fair price, sealed in glass. The flask will keep to the next city.", "他按公道价卖给你玫瑰水，封于玻璃瓶中。此瓶可存至下一城。"],
        ["Alexandria is marked on your map with the days between. The river road north is open.", "亚历山大港连同其间的日子已标上舆图。北去河路已通。"],
        ["You wait a day at the customs. The tariff's seasons are learned, and in this city your name now carries a little more weight.", "你在税关等了一日。税率的季节已学，此城的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -500, reason: "bought-rosewater-at-babylonia" },
        { op: "goods", id: "rosewater", value: 1, reason: "bought-rosewater-at-babylonia" },
      ],
      [
        { op: "reveal_map", value: "alexandria", reason: "clerk-marked-the-road-to-alexandria" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-river-road-north" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-tariffs-seasons" },
        { op: "reputation", value: 1, scope: "city", id: "babylonia-cairus", reason: "studied-the-customs-book" },
      ],
    ],
  },
  {
    city: "basora",
    tier: "station",
    zhName: "巴索拉（巴士拉）",
    enName: "Basora",
    lore: { placeId: "basora", origin: "source", ref: { book: "ibn-battuta", chapterId: "battuta-c006" } },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Basora: The Date Groves at the Mouth of the Rivers", "巴索拉：两河口上的枣林"],
      body: [
        "At the station where the two great rivers meet the sea, the date men of Basora work the groves that line the water on every side. A grove master who has counted the harvests for years says the city lives by the palm and the ship alike, and that the roads from here run up the rivers to the old capitals and down the gulf to the sea of India — a traveller who reads the water here may choose his whole road. He asks which way your business lies.",
        "在两河入海处的驿站，巴索拉的枣农经营着两岸连天的枣林。一位数了多年收成的林主说，此城靠棕榈与船同为生；由此而出的路，溯河可至旧都，顺湾可下印度之海——在此读懂水路的旅人，可选定整条路。他问你的营生往哪边走。",
      ],
      choices: [
        ["Buy dates at the grove master's price", "按林主之价买下椰枣"],
        ["Ask the grove master the river road toward Ctesiphon", "问林主通往忒息封的河路"],
        ["Walk the groves a day and learn the palms' season", "在枣林走一日，学一学棕榈的时节"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit is sweet and will keep on any road.", "他按公道分量卖给你椰枣。果子甘甜，任何路上都经得存放。"],
        ["Ctesiphon and Ispahan are marked on your map. The river roads are open.", "忒息封与伊斯帕罕已标上你的舆图。河路已通。"],
        ["You spend a day among the palms. The season is learned, and a small turn of fortune favours you.", "你在棕榈间过了一日。时节已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-basora-grove-price" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-basora" },
        { op: "codex", value: "cx-basora", reason: "basora-book-entry" },
        { op: "queue_event", value: "ev-basora-a-followup", reason: "basora-a-followup" },
      ],
      [
        { op: "reveal_map", value: "ctesiphon", reason: "grove-master-named-the-river-road-to-ctesiphon" },
        { op: "reveal_map", value: "ispahan", reason: "grove-master-named-the-road-to-ispahan" },
        { op: "queue_event", value: "ev-basora-a-followup", reason: "basora-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-groves" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-palms-season" },
      ],
    ],
    followup: {
      title: ["Basora: The Grove Master's Second Word on the Water", "巴索拉：林主谈水的第二句话"],
      body: [
        "The grove master takes you to the water's edge where the river meets the sea. He says the tide comes up the rivers twice a day, and the palms drink salt and sweet both, and the ships ride the same tide that waters the groves — the city's two lives are one water. He asks whether you will sail on it or trade beside it.",
        "林主把你领到河海相接处。他说潮水每日两次溯河而上，棕榈同饮咸甜，船只乘的正是浇灌枣林的那一道潮——此城的两条性命，同在一汪水里。他问你是要在水上航行，还是在岸边做买卖。",
      ],
      choices: [
        ["Buy myrrh sealed for the gulf passage", "买下封好走海湾的没药"],
        ["Ask him to mark the road toward Baldacum", "请他标出通往报达的路"],
        ["Wait a day at the tide line and learn its hours", "在潮线等一日，学它的时辰"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the gulf road.", "他按公道价卖给你没药，叶封完好。树脂在海湾路上经得存放。"],
        ["Baldacum is marked on your map with the days between. The river road north is open.", "报达连同其间的日子已标上舆图。北去河路已通。"],
        ["You wait a day at the tide line. Its hours are learned, and in Basora your name now carries a little more weight.", "你在潮线等了一日。其时辰已学，你的名字在巴索拉也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-gulf-passage" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-basora" },
      ],
      [
        { op: "reveal_map", value: "baldacum", reason: "grove-master-marked-the-road-to-baldacum" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-river-road-north" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-tide-hours" },
        { op: "reputation", value: 1, scope: "city", id: "basora", reason: "learned-the-tide-hours" },
      ],
    ],
  },
  {
    city: "berrhoea",
    tier: "town",
    zhName: "备鲁亚（阿勒颇）",
    enName: "Berrhoea",
    lore: { placeId: "berrhoea", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m016" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Berrhoea: The Citadel Market of the Great City", "备鲁亚：大城的寨上市集"],
      body: [
        "In the great trading city of the plain, the market of Berrhoea runs beneath the citadel hill, and the khans take the goods of the east and the west under one roof. A khan keeper who has lodged caravans from Baghdad and from the ports for years says the city sits where the roads must cross, and that steel from Damascus and cloth from the coast change hands here as nowhere else — and that a traveller who knows the khan's customs can trade all day without once being cheated. He asks if you know them.",
        "在这座平原上的大商城中，备鲁亚的市集沿城寨山脚铺开，客栈把东西两方的货物收在同一片屋顶下。一位多年接待巴格达与港口商队的客栈主说，此城坐落在道路必经之处，大马色的钢与海岸的布在这里的易手别处少见——识得客栈规矩的旅人，交易一日也不受一次骗。他问你可识得这些规矩。",
      ],
      choices: [
        ["Buy damascus-steel at the khan's price", "按客栈之价买下大马士革钢"],
        ["Ask the khan keeper the road toward Edessa", "问客栈主通往以得撒的路"],
        ["Watch the khans a day and learn their customs", "看一日客栈，学一学规矩"],
      ],
      results: [
        ["He sells you steel at a fair price. The blade is well forged, and the account of Berrhoea goes with it.", "他按公道价卖给你钢。刃口锻得精良，备鲁亚的记述也随它同行。"],
        ["Edessa and Tarsus are marked on your map. The crossing roads are open.", "以得撒与大数已标上你的舆图。交叉之路已通。"],
        ["You spend a day among the khans. Their customs are learned, and a small turn of fortune favours you.", "你在客栈间过了一日。规矩已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1400, reason: "bought-damascus-steel-at-berrhoea-khan" },
        { op: "goods", id: "damascus-steel", value: 1, reason: "bought-damascus-steel-at-berrhoea" },
        { op: "codex", value: "cx-berrhoea", reason: "berrhoea-book-entry" },
        { op: "queue_event", value: "ev-berrhoea-a-followup", reason: "berrhoea-a-followup" },
      ],
      [
        { op: "reveal_map", value: "edessa", reason: "khan-keeper-named-the-road-to-edessa" },
        { op: "reveal_map", value: "tarsus", reason: "khan-keeper-named-the-road-to-tarsus" },
        { op: "queue_event", value: "ev-berrhoea-a-followup", reason: "berrhoea-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-khans" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-khans-customs" },
      ],
    ],
    followup: {
      title: ["Berrhoea: The Khan Keeper's Second Word", "备鲁亚：客栈主的第二句话"],
      body: [
        "The khan keeper shows you the ledger of the night's arrivals — the camels from Baghdad, the mules from the ports, the goods each one carried. He says the city's peace is a trade itself: every caravan that crosses here pays a little toll in news, and the news is what the merchants really buy. He asks what news your road brings to the ledger.",
        "客栈主给你看昨夜到客的账册——巴格达来的骆驼，港口来的骡队，各自载的货。他说此城的太平本身也是一桩生意：每支过路的商队都付一点消息作过路钱，而商人真正买的正是消息。他问你的路给这本账带来什么消息。",
      ],
      choices: [
        ["Buy brocade at the night-ledger price", "按夜账之价买下锦缎"],
        ["Ask him to mark the road toward Antiochia", "请他标出通往昂都城的路"],
        ["Sit a while in the khan and hear the night's news", "在客栈里坐一会儿，听一夜的消息"],
      ],
      results: [
        ["He sells you brocade at a fair price. The cloth is rich and ready for the road.", "他按公道价卖给你锦缎。料子富丽，已备好待行。"],
        ["Antiochia is marked on your map with the days between. The western road is open.", "昂都城连同其间的日子已标上舆图。西路已通。"],
        ["You sit a while in the khan. The night's news is heard, and in Berrhoea your name now carries a little more weight.", "你在客栈坐了一会儿。一夜的消息已入耳，备鲁亚的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-brocade-at-berrhoea-night-ledger" },
        { op: "goods", id: "baghdad-brocade", value: 1, reason: "bought-brocade-at-berrhoea" },
      ],
      [
        { op: "reveal_map", value: "antiochia", reason: "khan-keeper-marked-the-road-to-antiochia" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-western-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-nights-news" },
        { op: "reputation", value: 1, scope: "city", id: "berrhoea", reason: "heard-the-nights-news" },
      ],
    ],
  },
  {
    city: "bethleem",
    tier: "station",
    zhName: "伯利恒",
    enName: "Bethleem",
    lore: { placeId: "bethleem", origin: "authored", disposition: "checked-weak", note: "已查：圣迹之城，行纪守观察尺度；维持 authored。" },
    scene: { bg: "desert-town", region: "west_asia" },
    site: {
      title: ["Bethleem: The Church Above the Grotto", "伯利恒：石窟上的教堂"],
      body: [
        "At the little town on the hill, the church of Bethleem stands over the grotto, and the pilgrims come up the road from Hierusalem as they have come for an age. A keeper of the church who has watched the pilgrim trains for years says the town lives by the road and the feast days, and that the shepherds' fields about it are the quietest country in this land — a traveller who comes in peace is welcomed in peace. He asks your errand.",
        "在这座山间小城，伯利恒的教堂立于石窟之上，朝觐者自耶路撒冷沿路而来，年复一年。一位看了多年朝觐队伍教堂守者说，此城靠这条路与节庆为生；城外的牧野是这片土地最安静的地方——以和平而来的旅人，也以和平相待。他问你来此何干。",
      ],
      choices: [
        ["Buy dates at the pilgrim road price", "按朝觐路之价买下椰枣"],
        ["Ask the keeper the road toward Hierusalem", "问守者通往耶路撒冷的路"],
        ["Walk the shepherds' fields a day and know the quiet", "在牧野走一日，识一识这里的安静"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Bethleem goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，伯利恒的记述也随它同行。"],
        ["Hierusalem and Accon are marked on your map. The pilgrim roads are open.", "耶路撒冷与阿卡已标上你的舆图。朝觐之路已通。"],
        ["You spend a day in the fields. The quiet is known, and a small turn of fortune favours you.", "你在牧野过了一日。那份安静已入心，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-bethleem-pilgrim-price" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-bethleem" },
        { op: "codex", value: "cx-bethleem", reason: "bethleem-book-entry" },
        { op: "queue_event", value: "ev-bethleem-a-followup", reason: "bethleem-a-followup" },
      ],
      [
        { op: "reveal_map", value: "hierusalem", reason: "keeper-named-the-road-to-hierusalem" },
        { op: "reveal_map", value: "accon", reason: "keeper-named-the-road-to-accon" },
        { op: "queue_event", value: "ev-bethleem-a-followup", reason: "bethleem-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-shepherds-fields" },
        { op: "fate", id: "rapport", value: 1, reason: "came-in-peace-to-bethleem" },
      ],
    ],
    followup: {
      title: ["Bethleem: The Keeper's Second Word on the Pilgrims", "伯利恒：守者谈朝觐者的第二句话"],
      body: [
        "The keeper sits with you in the church's shadow and speaks of the road. He says the pilgrims come from every land and every tongue, and the town measures its year by their coming — the feast days when the church is full, the quiet months when the shepherds have the fields to themselves. He asks what a traveller of many roads carries away from a place where the road is the devotion.",
        "守者与你坐在教堂影下，谈起这条路。他说朝觐者来自万方万语，此城以他们的到来度量一年——节庆之日教堂盈满，寂静之月牧人独有田野。他问你这多路的旅人，从这以路为虔诚的地方带走什么。",
      ],
      choices: [
        ["Offer a small gift at the church for the road's sake", "为前路在教堂献一份薄礼"],
        ["Ask him to mark the road toward Petra", "请他标出通往佩特拉的路"],
        ["Wait a day in the quiet and write in your book", "在安静中等一日，在行纪里写一页"],
      ],
      results: [
        ["Your gift is accepted without ceremony. The keeper speaks your name to the church, and a little favour goes with you on the road.", "礼物被收下，并无繁文。守者把你的名字说给教堂听，路上多了一分照应。"],
        ["Petra is marked on your map with the days between. The southern road is open.", "佩特拉连同其间的日子已标上舆图。南路已通。"],
        ["You wait a day in the quiet. The page is written, and in Bethleem your name now carries a little more weight.", "你在安静中等了一日。行纪添了一页，你的名字在伯利恒也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -150, reason: "offered-at-the-church-of-bethleem" },
        { op: "reputation", value: 1, scope: "city", id: "bethleem", reason: "honoured-the-church" },
        { op: "fate", id: "rapport", value: 1, reason: "came-in-peace" },
      ],
      [
        { op: "reveal_map", value: "petra", reason: "keeper-marked-the-road-to-petra" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-southern-road" },
      ],
      [
        { op: "days", value: 1, reason: "wrote-in-the-quiet" },
        { op: "fate", id: "rapport", value: 1, reason: "wrote-of-the-pilgrim-town" },
      ],
    ],
  },
  {
    city: "cobinan",
    tier: "town",
    zhName: "科比南",
    enName: "Cobinan",
    lore: { placeId: "cobinan", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c021" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Cobinan: The Furnace Masters and the Steel Mirrors", "科比南：炉师与钢镜"],
      body: [
        "In the large town where much iron and steel and ondanique are made, the furnace masters of Cobinan cast steel mirrors of great size and beauty, and prepare tutia for the eyes and spodium from the slag. A furnace master who has worked the grate for years explains the process as a matter of smoke and fire: the earth of a certain vein is burned in a great flaming furnace, the smoke and moisture adhere to the iron grating above, and what clings is tutia, what is left is spodium. He asks if you wish to buy the steel or the knowledge.",
        "在这座盛产钢铁与昂丹尼的大镇，科比南的炉师铸造又大又美的钢镜，并以炉渣制治眼之吐铁与铅丹。一位在炉栅上劳作多年的炉师讲解此术，如说烟与火之事：取某种矿脉之土，入大火炉焚烧，烟气水汽凝于炉上铁栅，所凝者为吐铁，所余者为铅丹。他问你要买钢铁，还是买这分见识。",
      ],
      choices: [
        ["Buy steel of Cobinan at the furnace master's price", "按炉师之价买下科比南之钢"],
        ["Ask the furnace master the road toward Kerman", "问炉师通往克尔曼的路"],
        ["Watch the furnace a day and learn the tutia's making", "看一日炉火，学一学吐铁的制炼"],
      ],
      results: [
        ["He sells you steel at a fair price. The bar is well forged, and the account of Cobinan goes with it.", "他按公道价卖给你钢。钢条锻得精良，科比南的记述也随它同行。"],
        ["Kerman and Ispahan are marked on your map. The furnace roads are open.", "克尔曼与伊斯帕罕已标上你的舆图。炉乡之路已通。"],
        ["You spend a day at the furnace. The tutia's making is learned, and a small turn of fortune favours you.", "你在炉边过了一日。吐铁的制炼已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1400, reason: "bought-damascus-steel-at-cobinan-furnace" },
        { op: "goods", id: "damascus-steel", value: 1, reason: "bought-damascus-steel-at-cobinan" },
        { op: "codex", value: "cx-cobinan", reason: "learned-the-furnaces-of-cobinan" },
        { op: "queue_event", value: "ev-cobinan-a-followup", reason: "cobinan-a-followup" },
      ],
      [
        { op: "reveal_map", value: "kerman", reason: "furnace-master-named-the-road-to-kerman" },
        { op: "reveal_map", value: "ispahan", reason: "furnace-master-named-the-road-to-ispahan" },
        { op: "codex", value: "cx-cobinan", reason: "mapped-the-furnace-roads" },
        { op: "queue_event", value: "ev-cobinan-a-followup", reason: "cobinan-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-furnace" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-tutias-making" },
      ],
    ],
    followup: {
      title: ["Cobinan: The Furnace Master's Second Word on the Smoke", "科比南：炉师谈烟的第二句话"],
      body: [
        "The furnace master takes you to the grate and shows you where the smoke clings. He says the tutia is what the fire gives up unwillingly — the good of the work comes not from the earth but from the patience of the burning, and the same is true of steel and of travellers. He asks what your road will burn, and what it will give up.",
        "炉师把你领到炉栅前，指给你看烟凝之处。他说吐铁是火不情愿交出的东西——一炉好货不在土，在烧炼的耐心，钢铁与旅人皆同此理。他问你的路要烧掉什么，又会交出什么。",
      ],
      choices: [
        ["Buy a second bar of steel at the furnace price", "按炉中之价再买一根钢条"],
        ["Ask him to mark the road toward Yasdi", "请他标出通往耶兹德的路"],
        ["Wait a day at the furnace and learn the burning's patience", "在炉边等一日，学烧炼的耐心"],
      ],
      results: [
        ["He sells you a second bar at the furnace's repeat price. The steel is bright and will carry its worth to any market.", "他按炉中的回头价卖给你第二根钢条。钢色明亮，到任何市集都值其价。"],
        ["Yasdi is marked on your map with the days between. The road north is open.", "耶兹德连同其间的日子已标上舆图。北路已通。"],
        ["You wait a day at the furnace. The burning's patience is learned, and in Cobinan your name now carries a little more weight.", "你在炉边等了一日。烧炼的耐心已学，科比南的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1600, reason: "bought-steel-mirror-at-cobinan" },
        { op: "goods", id: "damascus-steel", value: 1, reason: "bought-steel-mirror-at-cobinan" },
        { op: "codex", value: "cx-cobinan", reason: "carried-a-cobinan-mirror" },
      ],
      [
        { op: "reveal_map", value: "yasdi", reason: "furnace-master-marked-the-road-to-yasdi" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-road-north" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-burnings-patience" },
        { op: "reputation", value: 1, scope: "city", id: "cobinan", reason: "studied-with-the-furnace-master" },
      ],
    ],
  },
  {
    city: "constantinopolis",
    tier: "town",
    zhName: "共思滩丁堡",
    enName: "Constantinopolis",
    lore: { placeId: "constantinopolis", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m023" } },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Constantinopolis: The Great Harbour Below the Walls", "共思滩丁堡：大墙下的巨港"],
      body: [
        "At the great city where the two seas meet, the harbour of Constantinopolis lies under the famous walls, and ships from every sea put in below the towers. A harbour master who has logged the arrivals for years says the city has been the capital of an empire and the prize of armies, and that the walls have seen more fleets than any rampart in this world — and that a traveller who enters by the sea gate reads the city's whole history in the stones. He asks whether you come by sea or by land.",
        "在这两海交汇的巨城，共思滩丁堡的港口横陈于名墙之下，万方之船在塔楼下泊岸。一位记了多年到港的港务长说，此城做过帝国的都城，也做过军队的战利品；城墙见过的舰队比世间任何壁垒都多——由海门而入的旅人，可从石上读出此城的整部历史。他问你是从海来，还是从陆来。",
      ],
      choices: [
        ["Buy glass lamps at the harbour price", "按港口之价买下玻璃灯"],
        ["Ask the harbour master the sea road toward Nicaea", "问港务长通往尼该亚的海路"],
        ["Walk the walls a day and read the fleets' marks", "在城墙上走一日，读一读舰队的印记"],
      ],
      results: [
        ["He sells you glass lamps at a fair price. The glass is clear and will carry light and worth together.", "他按公道价卖给你玻璃灯。玻璃清亮，光与值可同行。"],
        ["Nicaea and Ephesus are marked on your map. The sea roads of the straits are open.", "尼该亚与以弗所已标上你的舆图。海峡之路已通。"],
        ["You spend a day on the walls. The fleets' marks are read, and a small turn of fortune favours you.", "你在城墙上过了一日。舰队的印记已读，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -900, reason: "bought-glass-lamps-at-constantinopolis" },
        { op: "goods", id: "glass-lamps", value: 1, reason: "bought-glass-lamps-at-constantinopolis" },
        { op: "codex", value: "cx-constantinopolis", reason: "constantinopolis-book-entry" },
        { op: "queue_event", value: "ev-constantinopolis-a-followup", reason: "constantinopolis-a-followup" },
      ],
      [
        { op: "reveal_map", value: "nicaea", reason: "harbour-master-named-the-sea-road-to-nicaea" },
        { op: "reveal_map", value: "ephesus", reason: "harbour-master-named-the-sea-road-to-ephesus" },
        { op: "queue_event", value: "ev-constantinopolis-a-followup", reason: "constantinopolis-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-walls" },
        { op: "fate", id: "rapport", value: 1, reason: "read-the-fleets-marks" },
      ],
    ],
    followup: {
      title: ["Constantinopolis: The Harbour Master's Second Page", "共思滩丁堡：港务长的第二页"],
      body: [
        "The harbour master opens his log at the year's first page and points at the entries of many flags. He says the ships come from the Black Sea and the Aegean and the far seas beyond, and the city takes toll of all of them — and that the walls were built by an empire that thought it would last forever, and the harbour is served by traders who think the same of their fortunes. He asks what a traveller thinks will outlast his road.",
        "港务长把日志翻到新年第一页，指着许多旗帜的记载。他说船自黑海、爱琴海与更远之海而来，此城向所有船取税——筑墙的帝国以为自己会永存，港上的商人也这样想自己的财富。他问你这旅人，觉得什么能比你的路活得更久。",
      ],
      choices: [
        ["Buy brocade at the harbour log price", "按港志之价买下锦缎"],
        ["Ask him to mark the road toward Smyrna", "请他标出通往士麦那的路"],
        ["Sit a while at the log and hear the year's entries", "在日志旁坐一会儿，听一年的记载"],
      ],
      results: [
        ["He sells you brocade at a fair price. The cloth is rich and ready for the road.", "他按公道价卖给你锦缎。料子富丽，已备好待行。"],
        ["Smyrna is marked on your map with the days between. The Aegean road is open.", "士麦那连同其间的日子已标上舆图。爱琴之路已通。"],
        ["You sit a while at the log. The year's entries are heard, and in this city your name now carries a little more weight.", "你在日志旁坐了一会儿。一年的记载已入耳，你的名字在此城也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-brocade-at-constantinopolis" },
        { op: "goods", id: "baghdad-brocade", value: 1, reason: "bought-brocade-at-constantinopolis" },
      ],
      [
        { op: "reveal_map", value: "smyrna", reason: "harbour-master-marked-the-road-to-smyrna" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-aegean-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-years-entries" },
        { op: "reputation", value: 1, scope: "city", id: "constantinopolis", reason: "studied-the-harbour-log" },
      ],
    ],
  },
  {
    city: "ctesiphon",
    tier: "station",
    zhName: "忒息封",
    enName: "Ctesiphon",
    lore: { placeId: "ctesiphon", origin: "authored", disposition: "checked-weak", note: "已查：古都废墟；维持 authored。" },
    scene: { bg: "desert-town", region: "west_asia" },
    site: {
      title: ["Ctesiphon: The Great Arch Among the Ruins", "忒息封：废墟中的大拱"],
      body: [
        "At the station among the ruins of the old capital, the great arch of Ctesiphon still stands where the kings of the former age held their courts, and the river runs past it as it ran when the city was alive. A keeper of the ruins who has watched the river for years says the arch is the largest of its kind in this country, and that the roads from here still run to the cities that replaced the old one — a traveller who reads the ruins reads what empires leave behind. He asks what you read.",
        "在这座旧都的废墟驿站，忒息封的大拱仍矗立在旧日君王设朝之处，河水依旧流过，如城在生时。一位看了多年河水的守墟人说，此拱为此地同类之最；由此而出的路仍通往取代旧城的诸城——读废墟的旅人，读的是帝国留下的东西。他问你在读什么。",
      ],
      choices: [
        ["Buy dates at the ruin keeper's price", "按守墟人之价买下椰枣"],
        ["Ask the keeper the roads toward Ninive", "问守墟人通往尼尼微的路"],
        ["Walk the ruins a day and measure the arch", "在废墟走一日，量一量大拱"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Ctesiphon goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，忒息封的记述也随它同行。"],
        ["Ninive and Basora are marked on your map. The river roads are open.", "尼尼微与巴索拉已标上你的舆图。河路已通。"],
        ["You spend a day among the ruins. The arch's measure is learned, and a small turn of fortune favours you.", "你在废墟间过了一日。大拱的尺度已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-ctesiphon-ruin-keeper" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-ctesiphon" },
        { op: "codex", value: "cx-ctesiphon", reason: "ctesiphon-book-entry" },
        { op: "queue_event", value: "ev-ctesiphon-a-followup", reason: "ctesiphon-a-followup" },
      ],
      [
        { op: "reveal_map", value: "ninive", reason: "keeper-named-the-road-to-ninive" },
        { op: "reveal_map", value: "basora", reason: "keeper-named-the-road-to-basora" },
        { op: "queue_event", value: "ev-ctesiphon-a-followup", reason: "ctesiphon-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "measured-the-arch" },
        { op: "fate", id: "rapport", value: 1, reason: "read-what-empires-leave-behind" },
      ],
    ],
    followup: {
      title: ["Ctesiphon: The Keeper's Word on the Fall", "忒息封：守墟人谈倾覆"],
      body: [
        "The keeper sits in the arch's shadow and speaks of the fall as the river speaks of it — without sorrow. He says the old kings built the arch to outlast their names, and it has outlasted the names and the kings and the city itself, and now keeps only the river's company. He asks whether a traveller of many roads builds anything, or only passes.",
        "守墟人坐在大拱影下，像河水一样不带哀伤地讲倾覆。他说旧王筑拱为使其名不朽，而拱比名、比王、比城都活得久，如今只与河水为伴。他问你这多路的旅人，是建造些什么，还是只路过。",
      ],
      choices: [
        ["Buy myrrh sealed for the river road", "买下封好走河路的没药"],
        ["Ask him to mark the road toward Tauris", "请他标出通往大不里士的路"],
        ["Wait a day at the arch and hear the river's talk", "在大拱边等一日，听河水的言语"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the river road.", "他按公道价卖给你没药，叶封完好。树脂在河路上经得存放。"],
        ["Tauris is marked on your map with the days between. The northern road is open.", "大不里士连同其间的日子已标上舆图。北路已通。"],
        ["You wait a day at the arch. The river's talk is heard, and in Ctesiphon your name now carries a little more weight.", "你在拱边等了一日。河水的言语已入耳，忒息封的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-river-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-ctesiphon" },
      ],
      [
        { op: "reveal_map", value: "tauris", reason: "keeper-marked-the-road-to-tauris" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-northern-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-rivers-talk" },
        { op: "reputation", value: 1, scope: "city", id: "ctesiphon", reason: "listened-at-the-arch" },
      ],
    ],
  },
  {
    city: "damascus",
    tier: "town",
    zhName: "大马色（大马色）",
    enName: "Damascus",
    lore: { placeId: "damascus", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m018" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Damascus: The Gardens and the Steel of the Great City", "大马色：大城的花园与钢"],
      body: [
        "In the great city of Syria where the pilgrim road to the south begins, the steel men of Damascus work the blades that bear the city's name, and the gardens of the river keep the city green within its walls. A steel master who has forged at the great mosque's shadow for years says the city is called the pearl of the east, and that every caravan that passes buys either steel or provisions — and that a traveller who comes in peace is treated as a guest, which is the city's oldest law. He asks if you know it.",
        "在叙利亚的大城、朝觐南路的起点，大马色的钢匠锻打着以城为名的刀剑，河上花园使此城在墙内常绿。一位在大清真寺影下锻打多年的钢匠说，此城号为东方之珠，过往商队非买钢即买粮；以和平而来的旅人被待为上宾，这是此城最古老的法。他问你可知道它。",
      ],
      choices: [
        ["Buy damascus-steel at the forger's price", "按锻匠之价买下大马士革钢"],
        ["Ask the steel master the road toward Tyrus", "问钢匠通往推罗的路"],
        ["Walk the gardens a day and learn the water's keeping", "在花园走一日，学一学水的守持"],
      ],
      results: [
        ["He sells you steel at a fair price. The blade is of the city's best, and the account of Damascus goes with it.", "他按公道价卖给你钢。刃口是此城上品，大马色的记述也随它同行。"],
        ["Tyrus and Tripolis are marked on your map. The coast roads are open.", "推罗与的黎波里已标上你的舆图。海岸之路已通。"],
        ["You spend a day among the gardens. The water's keeping is learned, and a small turn of fortune favours you.", "你在花园间过了一日。水的守持已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1400, reason: "bought-damascus-steel-at-damascus-forger" },
        { op: "goods", id: "damascus-steel", value: 1, reason: "bought-damascus-steel-at-damascus" },
        { op: "codex", value: "cx-damascus", reason: "damascus-book-entry" },
        { op: "queue_event", value: "ev-damascus-a-followup", reason: "damascus-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tyrus", reason: "steel-master-named-the-road-to-tyrus" },
        { op: "reveal_map", value: "tripolis", reason: "steel-master-named-the-road-to-tripolis" },
        { op: "queue_event", value: "ev-damascus-a-followup", reason: "damascus-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-gardens" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-waters-keeping" },
      ],
    ],
    followup: {
      title: ["Damascus: The Steel Master's Second Word on the Road", "大马色：钢匠谈路的第二句话"],
      body: [
        "The steel master takes you to the workshop door and points south. He says the pilgrim road from this city runs to the holy places, and the caravans gather here as water gathers in the river — the city's steel and its hospitality are both forged by the same heat. He asks whether you carry steel south, or only your road.",
        "钢匠把你领到作坊门口，指向南方。他说由此城而出的朝觐路通往圣地，商队在此汇聚如河水汇流——此城的钢与它的款待，出于同一炉火。他问你是带钢南下，还是只带自己的路。",
      ],
      choices: [
        ["Buy brocade at the workshop price", "按作坊之价买下锦缎"],
        ["Ask him to mark the road toward Hierusalem", "请他标出通往耶路撒冷的路"],
        ["Wait a day at the forge and learn the steel's patience", "在炉旁等一日，学钢的耐心"],
      ],
      results: [
        ["He sells you brocade at a fair price. The cloth is rich and ready for the road.", "他按公道价卖给你锦缎。料子富丽，已备好待行。"],
        ["Hierusalem is marked on your map with the days between. The southern road is open.", "耶路撒冷连同其间的日子已标上舆图。南路已通。"],
        ["You wait a day at the forge. The steel's patience is learned, and in Damascus your name now carries a little more weight.", "你在炉旁等了一日。钢的耐心已学，你的名字在大马色也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-brocade-at-damascus-workshop" },
        { op: "goods", id: "baghdad-brocade", value: 1, reason: "bought-brocade-at-damascus" },
      ],
      [
        { op: "reveal_map", value: "hierusalem", reason: "steel-master-marked-the-road-to-hierusalem" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-southern-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-steels-patience" },
        { op: "reputation", value: 1, scope: "city", id: "damascus", reason: "studied-with-the-steel-master" },
      ],
    ],
  },
  {
    city: "edessa",
    tier: "station",
    zhName: "以得撒",
    enName: "Edessa",
    lore: { placeId: "edessa", origin: "authored", disposition: "checked-weak", note: "已查：平原古城；维持 authored。" },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Edessa: The Citadel and the Baths of the Plain City", "以得撒：平原之城的城寨与浴堂"],
      body: [
        "At the city of the plain where the roads of Syria and Armenia cross, the citadel of Edessa stands above the spring that has watered the town since before any living memory. A bath keeper who has tended the spring's warm water for years says the city has been ruled by many peoples, and each left a wall or a custom — and that a traveller who bathes at the spring is considered half a citizen, for the water knows no master's flag. He asks whether you will bathe.",
        "在叙利亚与亚美尼亚诸路交会的平原之城，以得撒的城寨矗立于自无人记得的年代便滋养此城的泉水之上。一位照料温泉多年的浴堂主说，此城历许多民族统治，各族各留下一堵墙或一种风俗——在泉中沐浴的旅人被视为半个市民，因为水不认任何主人的旗帜。他问你可愿入浴。",
      ],
      choices: [
        ["Buy dates at the bath keeper's price", "按浴堂主之价买下椰枣"],
        ["Ask the bath keeper the roads toward Tarsus", "问浴堂主通往大数的路"],
        ["Bathe at the spring a day and know the city's peace", "在泉中沐一日，识一识此城的安宁"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Edessa goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，以得撒的记述也随它同行。"],
        ["Tarsus and Antiochia are marked on your map. The crossing roads are open.", "大数与昂都城已标上你的舆图。交叉之路已通。"],
        ["You bathe a while at the spring. The city's peace is known, and a small turn of fortune favours you.", "你在泉中沐了一会儿。此城的安宁已入心，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-edessa-bath-keeper" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-edessa" },
        { op: "codex", value: "cx-edessa", reason: "edessa-book-entry" },
        { op: "queue_event", value: "ev-edessa-a-followup", reason: "edessa-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tarsus", reason: "bath-keeper-named-the-road-to-tarsus" },
        { op: "reveal_map", value: "antiochia", reason: "bath-keeper-named-the-road-to-antiochia" },
        { op: "queue_event", value: "ev-edessa-a-followup", reason: "edessa-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "bathed-at-the-spring" },
        { op: "fate", id: "rapport", value: 1, reason: "bathed-at-the-spring" },
      ],
    ],
    followup: {
      title: ["Edessa: The Bath Keeper's Second Word on the Water", "以得撒：浴堂主谈水的第二句话"],
      body: [
        "The bath keeper sits with you beside the spring and speaks of the peoples who have ruled here. He says the water has served them all — the kings of old, the armies, the caravans — and that the spring is the only ruler this city has never changed. He asks what a traveller of many roads makes of a city that obeys water and nothing else.",
        "浴堂主与你坐在泉边，讲起统治过此地的各族。他说这泉水侍奉过他们所有人——古王、军队、商队——泉是此城唯一从未更换的主。他问你这多路的旅人，如何看待一座只听命于水、不听命于任何人的城。",
      ],
      choices: [
        ["Buy myrrh sealed for the mountain road", "买下封好走山路的没药"],
        ["Ask him to mark the road toward Berrhoea", "请他标出通往备鲁亚的路"],
        ["Wait a day at the spring and hear the city's tales", "在泉边等一日，听此城的旧事"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the mountain road.", "他按公道价卖给你没药，叶封完好。树脂在山路上经得存放。"],
        ["Berrhoea is marked on your map with the days between. The road west is open.", "备鲁亚连同其间的日子已标上舆图。西路已通。"],
        ["You wait a day at the spring. The city's tales are heard, and in Edessa your name now carries a little more weight.", "你在泉边等了一日。此城的旧事已入耳，以得撒的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-mountain-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-edessa" },
      ],
      [
        { op: "reveal_map", value: "berrhoea", reason: "bath-keeper-marked-the-road-to-berrhoea" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-road-west" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-citys-tales" },
        { op: "reputation", value: 1, scope: "city", id: "edessa", reason: "heard-the-citys-tales" },
      ],
    ],
  },
  {
    city: "ephesus",
    tier: "station",
    zhName: "以弗所",
    enName: "Ephesus",
    lore: { placeId: "ephesus", origin: "authored", disposition: "checked-weak", note: "已查：古港之城；维持 authored。" },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Ephesus: The Old Harbour and the Marble Streets", "以弗所：旧港与大理石街"],
      body: [
        "At the old city on the coast, the harbour of Ephesus has silted with the years, and the marble streets run down to water that no longer reaches them. A harbourman who keeps the light at the old mole says the city was built by a people who thought the sea would stay, and the sea did not — but the roads still come from the inland, and the city still trades what the inland brings. He asks whether you follow the sea or the roads.",
        "在这座滨海古城，以弗所的港口逐年淤塞，大理石街道通向已不再到达的水边。一位在旧防波堤守灯多年的港人说起这座由以为海会长留的民族所建之城，海却未留下——但内陆之路依旧来此，此城依旧交易内陆运来的货物。他问你是追海，还是追路。",
      ],
      choices: [
        ["Buy dates at the old mole's price", "按旧堤之价买下椰枣"],
        ["Ask the harbourman the roads toward Smyrna", "问港人通往士麦那的路"],
        ["Walk the marble streets a day and read the ruin", "在大理石街走一日，读一读废墟"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Ephesus goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，以弗所的记述也随它同行。"],
        ["Smyrna and Nicaea are marked on your map. The inland roads are open.", "士麦那与尼该亚已标上你的舆图。内陆之路已通。"],
        ["You spend a day among the marble streets. The ruin is read, and a small turn of fortune favours you.", "你在石街间过了一日。废墟已读，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-ephesus-old-mole" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-ephesus" },
        { op: "codex", value: "cx-ephesus", reason: "ephesus-book-entry" },
        { op: "queue_event", value: "ev-ephesus-a-followup", reason: "ephesus-a-followup" },
      ],
      [
        { op: "reveal_map", value: "smyrna", reason: "harbourman-named-the-road-to-smyrna" },
        { op: "reveal_map", value: "nicaea", reason: "harbourman-named-the-road-to-nicaea" },
        { op: "queue_event", value: "ev-ephesus-a-followup", reason: "ephesus-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-marble-streets" },
        { op: "fate", id: "rapport", value: 1, reason: "read-the-ruin" },
      ],
    ],
    followup: {
      title: ["Ephesus: The Harbourman's Second Word on the Sea", "以弗所：港人谈海的第二句话"],
      body: [
        "The harbourman takes you to the water's edge and shows you where the sea once reached. He says the harbour was the city's life, and the silt was its slow death, and the marble streets are the measure of the loss — but the city did not die; it turned its face to the roads. He asks what a traveller does when the sea he sailed for goes away.",
        "港人把你领到水边，指给你看海曾到达之处。他说港口曾是此城的性命，淤沙是它缓慢的死亡，大理石街是损失的尺度——但此城没有死去，它转过了脸，面向道路。他问你这旅人，当你为之出航的海退去时，你怎么办。",
      ],
      choices: [
        ["Buy myrrh sealed for the inland road", "买下封好走内陆路的没药"],
        ["Ask him to mark the road toward Constantinopolis", "请他标出通往共思滩丁堡的路"],
        ["Wait a day at the old mole and keep the light with him", "在旧堤等一日，陪他守灯"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the inland road.", "他按公道价卖给你没药，叶封完好。树脂在内陆路上经得存放。"],
        ["Constantinopolis is marked on your map with the days between. The northern road is open.", "共思滩丁堡连同其间的日子已标上舆图。北路已通。"],
        ["You wait a day at the mole. The light is kept, and in Ephesus your name now carries a little more weight.", "你在堤上等了一日。灯被守住了，你的名字在以弗所也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-inland-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-ephesus" },
      ],
      [
        { op: "reveal_map", value: "constantinopolis", reason: "harbourman-marked-the-road-to-constantinopolis" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-northern-road" },
      ],
      [
        { op: "days", value: 1, reason: "kept-the-light" },
        { op: "reputation", value: 1, scope: "city", id: "ephesus", reason: "kept-the-light-with-the-harbourman" },
      ],
    ],
  },
  {
    city: "hierusalem",
    tier: "town",
    zhName: "耶路撒冷",
    enName: "Hierusalem",
    lore: { placeId: "hierusalem", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m019" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Hierusalem: The Holy City and the Pilgrim Hosts", "耶路撒冷：圣城与朝觐之众"],
      body: [
        "At the holy city of the three books, the pilgrim hosts of every land gather in the quarters below the great sanctuary, and the keepers of the wells serve the crowds that come by the road from the coast and from the desert. A well keeper who has watered the hosts for years says the city measures its peace by the pilgrims — when they come, the markets hum; between the seasons, the city keeps its own counsel. He asks when your road brings you here.",
        "在这座三教共奉的圣城，万方朝觐之众聚于大殿之下的坊区，井泉的看守者供着自海岸与沙漠之路而来的众人。一位为众供水多年的井官说，此城以朝觐者度量自己的太平——他们来时，市集嗡鸣；季与季之间，此城守着自己的心绪。他问你的路何时带你到此。",
      ],
      choices: [
        ["Buy myrrh at the pilgrim price", "按朝觐之价买下没药"],
        ["Ask the well keeper the roads toward Bethleem", "问井官通往伯利恒的路"],
        ["Walk the quarters a day and note the three books' peace", "在坊间走一日，记一记三教之安"],
      ],
      results: [
        ["He sells you myrrh at a fair weight, sealed in leaf. The resin will keep on the road, and the account of Hierusalem goes with it.", "他按公道分量卖给你没药，叶封完好。树脂路上经得存放，耶路撒冷的记述也随它同行。"],
        ["Bethleem and Petra are marked on your map. The roads south are open.", "伯利恒与佩特拉已标上你的舆图。南路已通。"],
        ["You spend a day among the quarters. The three books' peace is noted, and a small turn of fortune favours you.", "你在坊间过了一日。三教之安已记，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-at-hierusalem-pilgrim-price" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-hierusalem" },
        { op: "codex", value: "cx-hierusalem", reason: "hierusalem-book-entry" },
        { op: "queue_event", value: "ev-hierusalem-a-followup", reason: "hierusalem-a-followup" },
      ],
      [
        { op: "reveal_map", value: "bethleem", reason: "well-keeper-named-the-road-to-bethleem" },
        { op: "reveal_map", value: "petra", reason: "well-keeper-named-the-road-to-petra" },
        { op: "queue_event", value: "ev-hierusalem-a-followup", reason: "hierusalem-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-quarters" },
        { op: "fate", id: "rapport", value: 1, reason: "noted-the-three-books-peace" },
      ],
    ],
    followup: {
      title: ["Hierusalem: The Well Keeper's Second Word on the Hosts", "耶路撒冷：井官谈旅众的第二句话"],
      body: [
        "The well keeper sits with you at the cistern's rim and speaks of the three books. He says the hosts come in their seasons and pray each in their own quarter, and the wells serve them all, and the city has learned to keep one peace for three faiths — a thing harder than any wall. He asks what a traveller of many roads thinks of a city whose law is to hold the peace between books.",
        "井官与你坐在蓄水池边，谈起三部经书。他说旅众按各自的季节而来，各在各自的坊区礼拜，井泉侍奉他们所有人；此城学会了为三种信仰守一份太平——这是比任何城墙都难的事。他问你这多路的旅人，如何看待一座以守护诸经之间的和平为法的城。",
      ],
      choices: [
        ["Offer a small gift at the well for the hosts' sake", "为旅众在井边献一份薄礼"],
        ["Ask him to mark the road toward Accon", "请他标出通往阿卡的路"],
        ["Wait a day at the cistern and hear the hosts' tongues", "在池边等一日，听旅众的言语"],
      ],
      results: [
        ["Your gift is accepted without ceremony. The well keeper speaks your name to the water, and a little favour goes with you on the road.", "礼物被收下，并无繁文。井官把你的名字说给水听，路上多了一分照应。"],
        ["Accon is marked on your map with the days between. The coast road is open.", "阿卡连同其间的日子已标上舆图。海岸之路已通。"],
        ["You wait a day at the cistern. The hosts' tongues are heard, and in Hierusalem your name now carries a little more weight.", "你在池边等了一日。旅众的言语已入耳，耶路撒冷的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -150, reason: "offered-at-the-well-of-hierusalem" },
        { op: "reputation", value: 1, scope: "city", id: "hierusalem", reason: "honoured-the-hosts" },
        { op: "fate", id: "rapport", value: 1, reason: "honoured-the-three-books-peace" },
      ],
      [
        { op: "reveal_map", value: "accon", reason: "well-keeper-marked-the-road-to-accon" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-coast-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-hosts-tongues" },
        { op: "fate", id: "rapport", value: 1, reason: "wrote-of-the-three-books-peace" },
      ],
    ],
  },
  // ─── B4 west_asia · 2/2 ───────────────────────────────────────────
  {
    city: "ispahan",
    tier: "station",
    zhName: "伊斯帕罕（伊斯法罕）",
    enName: "Ispahan",
    lore: { placeId: "ispahan", origin: "authored", disposition: "checked-weak", note: "已查：波斯大城；维持 authored。" },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Ispahan: The Great Bazaar of the Persian City", "伊斯帕罕：波斯大城的集市"],
      body: [
        "At the great city of the Persian plateau, the bazaar of Ispahan runs under a single long roof where the carpets of the west and the silks of the east change hands, and the bridge over the river carries the roads of the province to the market door. A carpet merchant who has traded at the bazaar for years says the city is the meeting place of the plain — the roads from Basora, from Cobinan, and from Yasdi all end under this roof. He asks which road brought you.",
        "在波斯高原的大城，伊斯帕罕的集市铺展于一道长屋顶下，西方的地毯与东方的丝绸在此易手，河上之桥把全省的路引到市门前。一位在集市交易多年的地毯商说，此城是平原的会合处——巴索拉、科比南、耶兹德的路都止于这片屋顶之下。他问你是哪条路带你来的。",
      ],
      choices: [
        ["Buy a persian carpet at the merchant's price", "按商人之价买下波斯地毯"],
        ["Ask the merchant the road toward Cobinan", "问商人通往科比南的路"],
        ["Walk the bazaar a day and learn its quarters", "在集市走一日，学一学它的分区"],
      ],
      results: [
        ["He sells you a carpet at a fair price. The weave is fine and will carry its worth to any market west.", "他按公道价卖给你地毯。织工精细，到西方任何市集都值其价。"],
        ["Cobinan and Yasdi are marked on your map. The plain's roads are open.", "科比南与耶兹德已标上你的舆图。平原之路已通。"],
        ["You spend a day in the bazaar. Its quarters are learned, and a small turn of fortune favours you.", "你在集市过了一日。分区已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1600, reason: "bought-persian-carpet-at-ispahan-bazaar" },
        { op: "goods", id: "persian-carpet", value: 1, reason: "bought-persian-carpet-at-ispahan" },
        { op: "codex", value: "cx-ispahan", reason: "ispahan-book-entry" },
        { op: "queue_event", value: "ev-ispahan-a-followup", reason: "ispahan-a-followup" },
      ],
      [
        { op: "reveal_map", value: "cobinan", reason: "merchant-named-the-road-to-cobinan" },
        { op: "reveal_map", value: "yasdi", reason: "merchant-named-the-road-to-yasdi" },
        { op: "queue_event", value: "ev-ispahan-a-followup", reason: "ispahan-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-bazaar" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-bazaars-quarters" },
      ],
    ],
    followup: {
      title: ["Ispahan: The Carpet Merchant's Second Word on the Roof", "伊斯帕罕：地毯商谈屋顶的第二句话"],
      body: [
        "The carpet merchant takes you to the middle of the long roof and points at the four directions. He says the bazaar is the province's heart, and the roads beat through it like veins — the carpets come from the west, the silks from the east, and the coin of every caravan settles here. He asks what your road will leave in the bazaar and what it will carry away.",
        "地毯商把你领到长屋顶正中，指向四方。他说集市是本省的心脏，诸路如血脉在其中搏动——地毯自西来，丝绸自东来，每支商队的钱都落在此处。他问你的路会在集市留下什么，又带走什么。",
      ],
      choices: [
        ["Buy brocade at the bazaar's mid-roof price", "按集市中市之价买下锦缎"],
        ["Ask him to mark the road toward Basora", "请他标出通往巴索拉的路"],
        ["Sit a while at the roof's centre and hear the trade", "在屋顶中央坐一会儿，听一听生意"],
      ],
      results: [
        ["He sells you brocade at a fair price. The cloth is rich and ready for the road.", "他按公道价卖给你锦缎。料子富丽，已备好待行。"],
        ["Basora is marked on your map with the days between. The gulf road is open.", "巴索拉连同其间的日子已标上舆图。海湾之路已通。"],
        ["You sit a while at the roof's centre. The trade is heard, and in Ispahan your name now carries a little more weight.", "你在屋顶中央坐了一会儿。生意已入耳，你的名字在伊斯帕罕也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1300, reason: "bought-brocade-at-ispahan-mid-roof" },
        { op: "goods", id: "baghdad-brocade", value: 1, reason: "bought-brocade-at-ispahan" },
      ],
      [
        { op: "reveal_map", value: "basora", reason: "merchant-marked-the-road-to-basora" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-gulf-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-trade" },
        { op: "reputation", value: 1, scope: "city", id: "ispahan", reason: "sat-at-the-bazaars-heart" },
      ],
    ],
  },
  {
    city: "moscovia",
    tier: "station",
    zhName: "莫斯科维（莫斯科）",
    enName: "Moscovia",
    lore: { placeId: "moscovia", origin: "authored", disposition: "checked-weak", note: "已查：林木之城；维持 authored。" },
    scene: { bg: "steppe-camp", region: "west_asia" },
    site: {
      title: ["Moscovia: The Timber City and the Fur Road", "莫斯科维：木城与皮货路"],
      body: [
        "At the city of timber in the forest country, the fur men of Moscovia keep their bales at the river wharf where the roads from the north and the south meet. A fur master who has graded sable and marten for years says the city is built of logs because the forest is its wealth, and the furs go south in every season — and that a traveller who comes in winter will find the road to the north closed and the market open, and in summer the reverse. He asks what season your road carries.",
        "在这座森林之邦的木城中，莫斯科维的皮货商在河畔码头囤着货包，南北之路在此相会。一位分级紫貂与貂皮多年的皮货主说，此城以原木为材，因为森林就是它的财富；皮货四季南运——冬季来的旅人会发现北路已封而市集正旺，夏季则相反。他问你的路带着哪个季节。",
      ],
      choices: [
        ["Buy sable at the fur master's price", "按皮货主之价买下紫貂皮"],
        ["Ask the fur master the road toward Novogardia", "问皮货主通往诺夫哥罗德的路"],
        ["Walk the timber wharf a day and learn the grades", "在木码头走一日，学一学分级"],
      ],
      results: [
        ["He sells you sable at a fair price. The pelt is prime, and the account of Moscovia goes with it.", "他按公道价卖给你紫貂皮。皮张上等，莫斯科维的记述也随它同行。"],
        ["Novogardia and Tana (Azov) are marked on your map. The northern roads are open.", "诺夫哥罗德与塔那已标上你的舆图。北路已通。"],
        ["You spend a day at the wharf. The grades are learned, and a small turn of fortune favours you.", "你在码头过了一日。分级已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -900, reason: "bought-sable-at-moscovia-fur-master" },
        { op: "goods", id: "sable", value: 1, reason: "bought-sable-at-moscovia" },
        { op: "codex", value: "cx-moscovia", reason: "moscovia-book-entry" },
        { op: "queue_event", value: "ev-moscovia-a-followup", reason: "moscovia-a-followup" },
      ],
      [
        { op: "reveal_map", value: "novogardia", reason: "fur-master-named-the-road-to-novogardia" },
        { op: "reveal_map", value: "tana-azov", reason: "fur-master-named-the-road-to-tana-azov" },
        { op: "queue_event", value: "ev-moscovia-a-followup", reason: "moscovia-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-timber-wharf" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-fur-grades" },
      ],
    ],
    followup: {
      title: ["Moscovia: The Fur Master's Second Word on the Forest", "莫斯科维：皮货主谈森林的第二句话"],
      body: [
        "The fur master takes you to the timber wall and shows you the grain of the wood. He says the city is built of what it sells — the forest gives the logs, the logs give the walls, the furs give the trade, and the snow gives the road's calendar. He asks what a traveller of the south makes of a country whose seasons are the law.",
        "皮货主把你领到木墙前，指给你看木纹。他说此城以所卖之物为材——森林给原木，原木给城墙，皮货给生意，雪给路途的历法。他问你这南来的旅人，如何看待一个以季节为法的国家。",
      ],
      choices: [
        ["Buy furs at the winter-market price", "按冬市之价买下皮货"],
        ["Ask him to mark the road toward Kiovia", "请他标出通往基辅的路"],
        ["Wait a day at the wharf and learn the seasons' trade", "在码头等一日，学四季的生意"],
      ],
      results: [
        ["He sells you furs at a fair price. The pelts are packed for the southern road.", "他按公道价卖给你皮货。皮张已包好待行南路。"],
        ["Kiovia is marked on your map with the days between. The western road is open.", "基辅连同其间的日子已标上舆图。西路已通。"],
        ["You wait a day at the wharf. The seasons' trade is learned, and in Moscovia your name now carries a little more weight.", "你在码头等了一日。四季的生意已学，莫斯科维的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -800, reason: "bought-furs-at-moscovia-winter-market" },
        { op: "goods", id: "furs", value: 1, reason: "bought-furs-at-moscovia" },
      ],
      [
        { op: "reveal_map", value: "kiovia", reason: "fur-master-marked-the-road-to-kiovia" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-western-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-seasons-trade" },
        { op: "reputation", value: 1, scope: "city", id: "moscovia", reason: "learned-the-seasons-trade" },
      ],
    ],
  },
  {
    city: "nicaea",
    tier: "station",
    zhName: "尼该亚",
    enName: "Nicaea",
    lore: { placeId: "nicaea", origin: "authored", disposition: "checked-weak", note: "已查：湖畔古城；维持 authored。" },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Nicaea: The Lake City Within the Walls", "尼该亚：墙内的湖畔之城"],
      body: [
        "At the walled city on the lake, the silk weavers of Nicaea work the looms that have made the city's name since the emperors of old, and the water of the lake keeps the walls cool in the summer. A weaver who has kept the craft for years says the city was once an empire's council seat, and the walls have seen more history than the weavers can tell — and that a traveller who comes by the lake gate hears the looms before he hears the city. He asks your errand.",
        "在这座湖畔的墙城，尼该亚的丝织工守着自旧朝诸帝时便使此城闻名的织机，湖水在夏日为城墙降温。一位守艺多年的织工说，此城曾是一朝议政之所，城墙见过的历史比织工能讲的更多——由湖门而入的旅人，先听见织机声，才听见城。他问你来此何干。",
      ],
      choices: [
        ["Buy silk at the weaver's price", "按织工之价买下丝绸"],
        ["Ask the weaver the road toward Ephesus", "问织工通往以弗所的路"],
        ["Walk the lake shore a day and know the city's quiet", "在湖畔走一日，识一识此城的安静"],
      ],
      results: [
        ["He sells you silk at a fair price. The weave is fine, and the account of Nicaea goes with it.", "他按公道价卖给你丝。织工精细，尼该亚的记述也随它同行。"],
        ["Ephesus and Smyrna are marked on your map. The roads to the sea are open.", "以弗所与士麦那已标上你的舆图。通海之路已通。"],
        ["You spend a day by the lake. The city's quiet is known, and a small turn of fortune favours you.", "你在湖边过了一日。此城的安静已入心，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1200, reason: "bought-silk-at-nicaea-weaver" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-nicaea" },
        { op: "codex", value: "cx-nicaea", reason: "nicaea-book-entry" },
        { op: "queue_event", value: "ev-nicaea-a-followup", reason: "nicaea-a-followup" },
      ],
      [
        { op: "reveal_map", value: "ephesus", reason: "weaver-named-the-road-to-ephesus" },
        { op: "reveal_map", value: "smyrna", reason: "weaver-named-the-road-to-smyrna" },
        { op: "queue_event", value: "ev-nicaea-a-followup", reason: "nicaea-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-lake-shore" },
        { op: "fate", id: "rapport", value: 1, reason: "knew-the-citys-quiet" },
      ],
    ],
    followup: {
      title: ["Nicaea: The Weaver's Second Word on the Walls", "尼该亚：织工谈墙的第二句话"],
      body: [
        "The weaver takes you to the wall-walk and points at the lake below. He says the walls have sheltered councils and sieges, and the lake has fed the city through both — a city with water behind its walls can wait out any army, and has. He asks what a traveller of many roads makes of patience as a city's first defence.",
        "织工把你领上墙道，指向城下的湖。他说城墙庇佑过朝会与围城，湖水在两者中都养着此城——墙后有水的城，能等过任何军队，而它确实等过。他问你这多路的旅人，如何看待以耐心为第一道防线的城。",
      ],
      choices: [
        ["Buy silk at the wall-walk price", "按墙道之价买下丝绸"],
        ["Ask him to mark the road toward Constantinopolis", "请他标出通往共思滩丁堡的路"],
        ["Wait a day at the gate and hear the city's counsels", "在城门等一日，听此城的议论"],
      ],
      results: [
        ["He sells you silk at a returning customer's price. The bolt is sealed for the road east.", "他按回头客之价卖给你丝。布匹已封好待行东路。"],
        ["Constantinopolis is marked on your map with the days between. The eastern road is open.", "共思滩丁堡连同其间的日子已标上舆图。东路已通。"],
        ["You wait a day at the gate. The city's counsels are heard, and in Nicaea your name now carries a little more weight.", "你在城门等了一日。此城的议论已入耳，你的名字在尼该亚也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-nicaea-wall-walk" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-nicaea-second" },
      ],
      [
        { op: "reveal_map", value: "constantinopolis", reason: "weaver-marked-the-road-to-constantinopolis" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-eastern-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-citys-counsels" },
        { op: "reputation", value: 1, scope: "city", id: "nicaea", reason: "heard-the-citys-counsels" },
      ],
    ],
  },
  {
    city: "ninive",
    tier: "station",
    zhName: "尼尼微（摩苏尔）",
    enName: "Ninive",
    lore: { placeId: "ninive", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m015" } },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Ninive: The Bridge of Boats on the Great River", "尼尼微：大河上的浮桥"],
      body: [
        "At the city on the great river, the bridge of boats of Ninive carries the roads of the east and the west across the water, and the ruins of the older city stand across the bank. A bridge master who has moored the boats for years says the bridge is taken up and laid again with the seasons, and that the city's trade follows the river — the roads from Baldacum and from Tauris both end at the bridgehead. He asks which bank your road comes from.",
        "在这座大河之城，尼尼微的浮桥载着东西诸路渡水，对岸矗立着旧城的废墟。一位泊了多年浮桥的桥主说，此桥随季节架收，城中的生意都跟着河走——报达与大不里士的路都在桥头终结。他问你的路从哪一岸来。",
      ],
      choices: [
        ["Buy dates at the bridgehead price", "按桥头之价买下椰枣"],
        ["Ask the bridge master the road toward Tauris", "问桥主通往大不里士的路"],
        ["Watch the bridge a day and learn its seasons", "看一日浮桥，学一学它的季节"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Ninive goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，尼尼微的记述也随它同行。"],
        ["Tauris and Ctesiphon are marked on your map. The roads of both banks are open.", "大不里士与忒息封已标上你的舆图。两岸之路已通。"],
        ["You spend a day at the bridge. Its seasons are learned, and a small turn of fortune favours you.", "你在桥边过了一日。它的季节已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-ninive-bridgehead" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-ninive" },
        { op: "codex", value: "cx-ninive", reason: "ninive-book-entry" },
        { op: "queue_event", value: "ev-ninive-a-followup", reason: "ninive-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tauris", reason: "bridge-master-named-the-road-to-tauris" },
        { op: "reveal_map", value: "ctesiphon", reason: "bridge-master-named-the-road-to-ctesiphon" },
        { op: "queue_event", value: "ev-ninive-a-followup", reason: "ninive-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-bridge" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-bridges-seasons" },
      ],
    ],
    followup: {
      title: ["Ninive: The Bridge Master's Second Word on the Water", "尼尼微：桥主谈水的第二句话"],
      body: [
        "The bridge master sits with you at the bridgehead and speaks of the river as the city's true road. He says the boats are moored so that the water may pass and the roads may pass with it, and that the old city across the bank was built by a people who forgot the river's moods — a lesson the present city keeps. He asks what a traveller makes of a road that is taken up and laid again with the seasons.",
        "桥主与你坐在桥头，把这条河说成此城真正的路。他说泊船架桥，为的是让水流过，也让路随水流过；对岸旧城由一群忘了河之脾性的民族所建——这是如今此城记着的教训。他问你这旅人，如何看待一条随季节架收的路。",
      ],
      choices: [
        ["Buy myrrh sealed for the mountain road", "买下封好走山路的没药"],
        ["Ask him to mark the road toward Baldacum", "请他标出通往报达的路"],
        ["Wait a day at the bridgehead and help moor the boats", "在桥头等一日，相助泊船"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the mountain road.", "他按公道价卖给你没药，叶封完好。树脂在山路上经得存放。"],
        ["Baldacum is marked on your map with the days between. The road south is open.", "报达连同其间的日子已标上舆图。南路已通。"],
        ["You spend a day at the moorings. The boats' measure is learned, and in Ninive your name now carries a little more weight.", "你在泊位过了一日。船的尺度已学，尼尼微的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-mountain-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-ninive" },
      ],
      [
        { op: "reveal_map", value: "baldacum", reason: "bridge-master-marked-the-road-to-baldacum" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-road-south" },
      ],
      [
        { op: "days", value: 1, reason: "helped-moor-the-boats" },
        { op: "reputation", value: 1, scope: "city", id: "ninive", reason: "helped-moor-the-boats" },
      ],
    ],
  },
  {
    city: "novogardia",
    tier: "station",
    zhName: "诺甫哥罗（诺夫哥罗德）",
    enName: "Novogardia",
    lore: { placeId: "novogardia", origin: "authored", disposition: "checked-weak", note: "已查：北地商城；维持 authored。" },
    scene: { bg: "steppe-camp", region: "west_asia" },
    site: {
      title: ["Novogardia: The River Wharf of the Northern City", "诺甫哥罗：北城的河码头"],
      body: [
        "At the great trading city of the north, the wharves of Novogardia load the furs and the wax that the forest roads bring down, and the river carries them to the markets of the south. A wharf master who has tallied the seasons' cargoes for years says the city is the north's counting house — the furs of the forest, the wax of the hives, the honey and the hides all pass this quay — and that a traveller who comes here in the deep winter will find the wharf alive with sledges. He asks what cargo your road carries.",
        "在这座北地大商城中，诺甫哥罗的码头装载森林之路运下的皮货与蜜蜡，河水把它们带往南方市集。一位记了多年季节货量的码头上人说，此城是北方的账房——森林的皮货、蜂房的蜜蜡、蜂蜜与皮革都经过这座码头——深冬来此的旅人，会看见雪橇在码头上往来。他问你的路载着什么货。",
      ],
      choices: [
        ["Buy furs at the wharf master's price", "按码头上人之价买下皮货"],
        ["Ask the wharf master the road toward Kiovia", "问码头上人通往基辅的路"],
        ["Watch the wharf a day and learn the cargoes' seasons", "看一日码头，学一学货的季节"],
      ],
      results: [
        ["He sells you furs at a fair price. The pelts are prime, and the account of Novogardia goes with it.", "他按公道价卖给你皮货。皮张上等，诺甫哥罗的记述也随它同行。"],
        ["Kiovia and Tana (Azov) are marked on your map. The southern roads are open.", "基辅与塔那已标上你的舆图。南路已通。"],
        ["You spend a day at the wharf. The cargoes' seasons are learned, and a small turn of fortune favours you.", "你在码头过了一日。货的季节已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -800, reason: "bought-furs-at-novogardia-wharf" },
        { op: "goods", id: "furs", value: 1, reason: "bought-furs-at-novogardia" },
        { op: "codex", value: "cx-novogardia", reason: "novogardia-book-entry" },
        { op: "queue_event", value: "ev-novogardia-a-followup", reason: "novogardia-a-followup" },
      ],
      [
        { op: "reveal_map", value: "kiovia", reason: "wharf-master-named-the-road-to-kiovia" },
        { op: "reveal_map", value: "tana-azov", reason: "wharf-master-named-the-road-to-tana-azov" },
        { op: "queue_event", value: "ev-novogardia-a-followup", reason: "novogardia-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-wharf" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-cargoes-seasons" },
      ],
    ],
    followup: {
      title: ["Novogardia: The Wharf Master's Second Page", "诺甫哥罗：码头上人的第二页"],
      body: [
        "The wharf master opens his tally book at the winter page. He says the river freezes in the deep cold and the wharf becomes a market on the ice — the sledges come from the forest with the furs, and the city trades through the season when all other roads are closed. He asks what a traveller of the south makes of a market that opens when the river freezes.",
        "码头上人把账册翻到冬季那一页。他说严寒时河水封冻，码头变成冰上市集——雪橇自森林载皮而来，此城在别的路都关闭的季节里照常交易。他问你这南来的旅人，如何看待一座在河冻时开市的城。",
      ],
      choices: [
        ["Buy sable at the ice-market price", "按冰市之价买下紫貂皮"],
        ["Ask him to mark the road toward Moscovia", "请他标出通往莫斯科维的路"],
        ["Wait a day at the tally book and hear the winter's trade", "在账册旁等一日，听冬季的生意"],
      ],
      results: [
        ["He sells you sable at a fair price. The pelt is sealed for the southern road.", "他按公道价卖给你紫貂皮。皮张已封好待行南路。"],
        ["Moscovia is marked on your map with the days between. The forest road is open.", "莫斯科维连同其间的日子已标上舆图。森林之路已通。"],
        ["You wait a day at the tally book. The winter's trade is heard, and in Novogardia your name now carries a little more weight.", "你在账册旁等了一日。冬季的生意已入耳，你的名字在诺甫哥罗也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -900, reason: "bought-sable-at-novogardia-ice-market" },
        { op: "goods", id: "sable", value: 1, reason: "bought-sable-at-novogardia" },
      ],
      [
        { op: "reveal_map", value: "moscovia", reason: "wharf-master-marked-the-road-to-moscovia" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-forest-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-winters-trade" },
        { op: "reputation", value: 1, scope: "city", id: "novogardia", reason: "heard-the-winters-trade" },
      ],
    ],
  },
  {
    city: "petra",
    tier: "station",
    zhName: "佩特拉",
    enName: "Petra",
    lore: { placeId: "petra", origin: "authored", disposition: "checked-weak", note: "已查：岩城古道；维持 authored。" },
    scene: { bg: "desert-town", region: "west_asia" },
    site: {
      title: ["Petra: The Rock City on the Incense Road", "佩特拉：乳香道上的岩城"],
      body: [
        "At the city cut into the rose rock, the caravan men of Petra water their trains at the spring in the narrow gorge, and the incense of the south has passed this way since before memory. A caravan man who has worked the gorge for years says the city is the gate of the two deserts, and the roads to Hierusalem and to Medina both run from this spring — and that a traveller who reads the rock reads where the old caravans slept. He asks what your train carries.",
        "在这座凿入玫瑰色岩石的城中，佩特拉的商队在狭谷泉边饮驼，南方的乳香自古便经此路。一位在狭谷劳作多年的商队人说，此城是两片沙漠的门，通往耶路撒冷与默德那的路都自此泉出发——读得懂岩石的旅人，读得出旧商队歇脚之处。他问你的队伍载着什么。",
      ],
      choices: [
        ["Buy myrrh at the gorge price", "按狭谷之价买下没药"],
        ["Ask the caravan man the road toward Hierusalem", "问商队人通往耶路撒冷的路"],
        ["Walk the rock city a day and read the old camps", "在岩城走一日，读一读旧营地"],
      ],
      results: [
        ["He sells you myrrh at a fair price. The resin is clean and will keep on the road.", "他按公道价卖给你没药。树脂洁净，路上经得存放。"],
        ["Hierusalem and Medina are marked on your map. The two desert roads are open.", "耶路撒冷与默德那已标上你的舆图。两条漠路已通。"],
        ["You spend a day among the rocks. The old camps are read, and a small turn of fortune favours you.", "你在岩石间过了一日。旧营地已读，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-at-petra-gorge" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-petra" },
        { op: "codex", value: "cx-petra", reason: "petra-book-entry" },
        { op: "queue_event", value: "ev-petra-a-followup", reason: "petra-a-followup" },
      ],
      [
        { op: "reveal_map", value: "hierusalem", reason: "caravan-man-named-the-road-to-hierusalem" },
        { op: "reveal_map", value: "medina", reason: "caravan-man-named-the-road-to-medina" },
        { op: "queue_event", value: "ev-petra-a-followup", reason: "petra-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-rock-city" },
        { op: "fate", id: "rapport", value: 1, reason: "read-the-old-camps" },
      ],
    ],
    followup: {
      title: ["Petra: The Caravan Man's Word on the Gorge", "佩特拉：商队人谈狭谷"],
      body: [
        "The caravan man takes you to the mouth of the gorge and speaks of the rock as a record. He says the city was carved by a people who made the desert their ledger — the tombs, the cisterns, the road-marks all written in stone — and that the spring still does for the caravans what it did for theirs. He asks what a traveller of many roads writes that will outlast him.",
        "商队人把你领到狭谷口，把岩石说成一部记录。他说此城由一群以沙漠为账本的民族凿成——陵墓、蓄池、路标皆刻于石——而泉水仍如往日一般侍奉着商队。他问你这多路的旅人，写下什么能比自己活得更久。",
      ],
      choices: [
        ["Buy frankincense sealed for the desert road", "买下封好走漠路的乳香"],
        ["Ask him to mark the road toward Accon", "请他标出通往阿卡的路"],
        ["Wait a day at the spring and help water the trains", "在泉边等一日，相助饮驼"],
      ],
      results: [
        ["He sells you frankincense at a fair price, sealed in leaf. The resin will keep on the desert road.", "他按公道价卖给你乳香，叶封完好。树脂在漠路上经得存放。"],
        ["Accon is marked on your map with the days between. The road north is open.", "阿卡连同其间的日子已标上舆图。北路已通。"],
        ["You spend a day at the spring. The trains' measure is learned, and in Petra your name now carries a little more weight.", "你在泉边过了一日。驼队的尺度已学，佩特拉的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -500, reason: "bought-frankincense-for-the-desert-road" },
        { op: "goods", id: "frankincense", value: 1, reason: "bought-frankincense-at-petra" },
      ],
      [
        { op: "reveal_map", value: "accon", reason: "caravan-man-marked-the-road-to-accon" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-road-north" },
      ],
      [
        { op: "days", value: 1, reason: "watered-the-trains" },
        { op: "reputation", value: 1, scope: "city", id: "petra", reason: "watered-the-caravans" },
      ],
    ],
  },
  {
    city: "smyrna",
    tier: "station",
    zhName: "士麦那（伊兹密尔）",
    enName: "Smyrna",
    lore: { placeId: "smyrna", origin: "source", ref: { book: "ibn-battuta", chapterId: "battuta-c011" } },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Smyrna: The Harbour of the Levant Coast", "士麦那：黎凡特海岸的港口"],
      body: [
        "At the port on the Levant coast, the harbour of Smyrna serves the ships of the Aegean and the roads of the inland both, and the cloth of the coast is loaded on the same quay where the caravans end. A harbourman who has stowed cargoes for years says the city's fortune is the junction — the sea road to the islands and the land road to the great cities meet here, and a traveller who reads the tides here may choose the whole next course. He asks which way your business lies.",
        "在这座黎凡特海岸的港口，士麦那的海港同时侍奉爱琴海的船只与内陆的道路，海岸的布料与商队的终点泊在同一座码头。一位装了多年货的港人说，此城之运在于枢纽——通往岛屿的海路与通往大城的陆路在此相会，在此读懂潮水的旅人，可选定下一段全部航程。他问你的营生往哪边走。",
      ],
      choices: [
        ["Buy cotton cloth at the quay price", "按码头之价买下棉布"],
        ["Ask the harbourman the sea road toward Ephesus", "问港人通往以弗所的海路"],
        ["Watch the tides a day and learn the harbour's hours", "看一日潮水，学一学港口的时辰"],
      ],
      results: [
        ["He sells you cotton at a fair weight. The cloth is fine and will sell on either road.", "他按公道分量卖给你棉布。布质精细，两条路上都卖得动。"],
        ["Ephesus and Constantinopolis are marked on your map. The sea roads are open.", "以弗所与共思滩丁堡已标上你的舆图。海路已通。"],
        ["You spend a day at the harbour. Its hours are learned, and a small turn of fortune favours you.", "你在港口过了一日。时辰已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-smyrna-quay" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-smyrna" },
        { op: "codex", value: "cx-smyrna", reason: "smyrna-book-entry" },
        { op: "queue_event", value: "ev-smyrna-a-followup", reason: "smyrna-a-followup" },
      ],
      [
        { op: "reveal_map", value: "ephesus", reason: "harbourman-named-the-sea-road-to-ephesus" },
        { op: "reveal_map", value: "constantinopolis", reason: "harbourman-named-the-sea-road-to-constantinopolis" },
        { op: "queue_event", value: "ev-smyrna-a-followup", reason: "smyrna-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-tides" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-harbours-hours" },
      ],
    ],
    followup: {
      title: ["Smyrna: The Harbourman's Second Word on the Junction", "士麦那：港人谈枢纽的第二句话"],
      body: [
        "The harbourman takes you to the mole's end and shows you where the sea road and the land road meet. He says the city has been burned and rebuilt many times because the junction is worth burning for — every power of the coast has held this harbour, and each left a custom and a quay. He asks what a traveller makes of a city that is always someone's prize.",
        "港人把你领到堤端，指给你看海路与陆路相会之处。他说此城屡遭焚毁又屡次重建，因为枢纽值得为之纵火——海岸的每一方势力都握过这座港，各自留下一座码头与一种风俗。他问你这旅人，如何看待一座永远是谁的战利品的城。",
      ],
      choices: [
        ["Buy myrrh sealed for the sea road", "买下封好走海路的没药"],
        ["Ask him to mark the road toward Nicaea", "请他标出通往尼该亚的路"],
        ["Wait a day at the mole and hear the harbour's history", "在堤上等一日，听港口的历史"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the sea road.", "他按公道价卖给你没药，叶封完好。树脂在海路上经得存放。"],
        ["Nicaea is marked on your map with the days between. The inland road is open.", "尼该亚连同其间的日子已标上舆图。内陆之路已通。"],
        ["You wait a day at the mole. The harbour's history is heard, and in Smyrna your name now carries a little more weight.", "你在堤上等了一日。港口的历史已入耳，你的名字在士麦那也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-sea-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-smyrna" },
      ],
      [
        { op: "reveal_map", value: "nicaea", reason: "harbourman-marked-the-road-to-nicaea" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-inland-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-harbours-history" },
        { op: "reputation", value: 1, scope: "city", id: "smyrna", reason: "heard-the-harbours-history" },
      ],
    ],
  },
  {
    city: "tana-azov",
    tier: "station",
    zhName: "塔那（亚速）",
    enName: "Tana (Azov)",
    lore: { placeId: "tana-azov", origin: "authored", disposition: "checked-weak", note: "已查：河口商站；维持 authored。" },
    scene: { bg: "steppe-camp", region: "west_asia" },
    site: {
      title: ["Tana: The Trading Colony at the River's Mouth", "塔那：河口的商站"],
      body: [
        "At the station where the great river meets the sea, the merchants of the Italian cities keep their trading colony at Tana, and the furs of the north come down to their quays through the steppe. A factor who has served the colony for years says the station is the meeting of three roads — the river from the north, the steppe from the east, and the sea from the south — and that a traveller who deals straight with the factors deals with the whole trade at once. He asks what you bring to the colony.",
        "在大河入海处的驿站，意大利诸城的商人守着塔那的商站，北方的皮货经草原运到他们的码头。一位为商站效力多年的行商说，此站是三路相会之处——北来的河、东来的草原、南来的海——与行商直来直往的旅人，等于一次做完整桩生意。他问你给商站带来什么。",
      ],
      choices: [
        ["Buy furs at the factor's price", "按行商之价买下皮货"],
        ["Ask the factor the steppe road toward Novogardia", "问行商通往诺夫哥罗德的草原路"],
        ["Watch the quay a day and learn the colony's customs", "看一日码头，学一学商站的规矩"],
      ],
      results: [
        ["He sells you furs at a fair price. The pelts are packed for the sea road.", "他按公道价卖给你皮货。皮张已包好待行海路。"],
        ["Novogardia and Trapezus are marked on your map. The steppe and sea roads are open.", "诺夫哥罗德与特拉佩宗已标上你的舆图。草原与海路已通。"],
        ["You spend a day at the quay. The colony's customs are learned, and a small turn of fortune favours you.", "你在码头过了一日。商站的规矩已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -800, reason: "bought-furs-at-tana-factor" },
        { op: "goods", id: "furs", value: 1, reason: "bought-furs-at-tana-azov" },
        { op: "codex", value: "cx-tana-azov", reason: "tana-azov-book-entry" },
        { op: "queue_event", value: "ev-tana-azov-a-followup", reason: "tana-azov-a-followup" },
      ],
      [
        { op: "reveal_map", value: "novogardia", reason: "factor-named-the-steppe-road-to-novogardia" },
        { op: "reveal_map", value: "trapezus", reason: "factor-named-the-sea-road-to-trapezus" },
        { op: "queue_event", value: "ev-tana-azov-a-followup", reason: "tana-azov-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-quay" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-colonys-customs" },
      ],
    ],
    followup: {
      title: ["Tana: The Factor's Second Word on the Three Roads", "塔那：行商谈三路的第二句话"],
      body: [
        "The factor shows you the colony's ledger and points at the three columns — the river, the steppe, the sea. He says the colony exists because no one road is enough: the north sends furs, the east sends horses, the south sends coin, and the colony is where the three settle accounts. He asks which of the three your road is.",
        "行商给你看商站的账册，指向三栏——河、草原、海。他说商站所以存在，因为任何一条路都不够：北方送皮，东方送马，南方送钱，商站是三者结账之处。他问你的路属于三者中的哪一条。",
      ],
      choices: [
        ["Buy sable at the ledger price", "按账册之价买下紫貂皮"],
        ["Ask him to mark the road toward Moscovia", "请他标出通往莫斯科维的路"],
        ["Sit a while at the ledger and hear the three accounts", "在账册旁坐一会儿，听三路的账"],
      ],
      results: [
        ["He sells you sable at a fair price. The pelt is sealed for the sea road.", "他按公道价卖给你紫貂皮。皮张已封好待行海路。"],
        ["Moscovia is marked on your map with the days between. The northern road is open.", "莫斯科维连同其间的日子已标上舆图。北路已通。"],
        ["You sit a while at the ledger. The three accounts are heard, and in Tana your name now carries a little more weight.", "你在账册旁坐了一会儿。三路的账已入耳，塔那的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -900, reason: "bought-sable-at-tana-ledger" },
        { op: "goods", id: "sable", value: 1, reason: "bought-sable-at-tana-azov" },
      ],
      [
        { op: "reveal_map", value: "moscovia", reason: "factor-marked-the-road-to-moscovia" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-northern-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-three-accounts" },
        { op: "reputation", value: 1, scope: "city", id: "tana-azov", reason: "studied-the-colony-ledger" },
      ],
    ],
  },
  {
    city: "tarsus",
    tier: "station",
    zhName: "大数（塔尔苏斯）",
    enName: "Tarsus",
    lore: { placeId: "tarsus", origin: "authored", disposition: "checked-weak", note: "已查：平原棉乡；维持 authored。" },
    scene: { bg: "caravan-city", region: "west_asia" },
    site: {
      title: ["Tarsus: The Cotton Fields at the Mountain Gate", "大数：山口下的棉田"],
      body: [
        "At the city of the plain where the mountain gate opens toward the north, the cotton growers of Tarsus work the fields that the river waters, and the passes carry the trade to the inland cities. A grower who has worked the cotton since boyhood says the city sits at the meeting of the plain and the mountains, and that a traveller who reads the passes here may choose between the coast and the highland — the gate is the city's whole geography. He asks which way your road turns.",
        "在这座山口向北敞开的平原之城，大数的棉农经营着河渠浇灌的棉田，商货经山口运往内陆诸城。一位自幼种棉的农人说，此城坐落于平原与群山相会之处；在此读懂山口的旅人，可在海岸与高原之间选择——山口就是此城的全部地理。他问你的路转向哪边。",
      ],
      choices: [
        ["Buy cotton cloth at the grower's price", "按农人之价买下棉布"],
        ["Ask the grower the pass road toward Antiochia", "问农人通往昂都城的山口路"],
        ["Walk the fields a day and learn the cotton's season", "在田间走一日，学一学棉花的时节"],
      ],
      results: [
        ["He sells you cotton at a fair weight. The cloth is well woven, and the account of Tarsus goes with it.", "他按公道分量卖给你棉布。布织得精细，大数的记述也随它同行。"],
        ["Antiochia and Tripolis are marked on your map. The pass and coast roads are open.", "昂都城与的黎波里已标上你的舆图。山口与海岸之路已通。"],
        ["You spend a day among the fields. The cotton's season is learned, and a small turn of fortune favours you.", "你在田间过了一日。棉花的时节已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -700, reason: "bought-cotton-cloth-at-tarsus-grower" },
        { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-tarsus" },
        { op: "codex", value: "cx-tarsus", reason: "tarsus-book-entry" },
        { op: "queue_event", value: "ev-tarsus-a-followup", reason: "tarsus-a-followup" },
      ],
      [
        { op: "reveal_map", value: "antiochia", reason: "grower-named-the-pass-road-to-antiochia" },
        { op: "reveal_map", value: "tripolis", reason: "grower-named-the-coast-road-to-tripolis" },
        { op: "queue_event", value: "ev-tarsus-a-followup", reason: "tarsus-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-fields" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-cottons-season" },
      ],
    ],
    followup: {
      title: ["Tarsus: The Grower's Second Word on the Gate", "大数：农人谈山口的第二句话"],
      body: [
        "The grower takes you to the edge of the fields and points at the mountain gate. He says the pass has carried armies and caravans alike, and the cotton has grown through both — the plain feeds the gate, and the gate keeps the plain. He asks what a traveller of many roads makes of a city whose fortune is a gap in the mountains.",
        "农人把你领到田边，指向山口。他说这道山关载过军队也载过商队，棉花在两者之间照常生长——平原养着山口，山口护着平原。他问你这多路的旅人，如何看待一座以山间缺口为运气的城。",
      ],
      choices: [
        ["Buy dates at the field-edge price", "按田边之价买下椰枣"],
        ["Ask him to mark the road toward Edessa", "请他标出通往以得撒的路"],
        ["Wait a day at the gate and watch the traffic pass", "在山口等一日，看来往的商旅"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road.", "他按公道分量卖给你椰枣。果子路上经得存放。"],
        ["Edessa is marked on your map with the days between. The mountain road is open.", "以得撒连同其间的日子已标上舆图。山路已通。"],
        ["You wait a day at the gate. The traffic's measure is learned, and in Tarsus your name now carries a little more weight.", "你在山口等了一日。商旅的尺度已学，你的名字在大数也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-tarsus-field-edge" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-tarsus" },
      ],
      [
        { op: "reveal_map", value: "edessa", reason: "grower-marked-the-road-to-edessa" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-mountain-road" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-traffic-pass" },
        { op: "reputation", value: 1, scope: "city", id: "tarsus", reason: "watched-the-gate" },
      ],
    ],
  },
  {
    city: "trapezus",
    tier: "town",
    zhName: "特拉佩宗（特拉布宗）",
    enName: "Trapezus",
    lore: { placeId: "trapezus", origin: "authored", disposition: "checked-weak", note: "已查：黑海丝港；维持 authored。" },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Trapezus: The Silk Port of the Black Sea", "特拉佩宗：黑海的丝港"],
      body: [
        "At the port where the mountain road from the east meets the Black Sea, the merchants of Trapezus load the silk that comes down from the highlands onto the ships of the northern sea. A port master who has tallied the silk for years says the city is the sea's last stair — the road from the east ends here, and the sea road begins, and a traveller who carries silk down the mountain may board at this harbour with his cargo whole. He asks what your road brings to the water.",
        "在这座东来山路与黑海相会的港口，特拉佩宗的商人把自高原运下的丝绸装上北海的船只。一位多年统计丝绸的港务长说，此城是海的最后一级台阶——东路至此而终，海路自此而始；自山间运丝下来的旅人，可载着完好的货在此上船。他问你的路把什么带到水边。",
      ],
      choices: [
        ["Buy silk at the port master's price", "按港务长之价买下丝绸"],
        ["Ask the port master the sea road toward Tana", "问港务长通往塔那的海路"],
        ["Watch the harbour a day and learn the silk's tally", "看一日港口，学一学丝绸的计数"],
      ],
      results: [
        ["He sells you silk at a fair price. The bolt is sealed for the sea road, and the account of Trapezus goes with it.", "他按公道价卖给你丝。布匹已封好待行海路，特拉佩宗的记述也随它同行。"],
        ["Tana (Azov) and Caffa are marked on your map. The sea roads of the Black Sea are open.", "塔那与喀法已标上你的舆图。黑海之路已通。"],
        ["You spend a day at the harbour. The silk's tally is learned, and a small turn of fortune favours you.", "你在港口过了一日。丝绸的计数已学，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -1200, reason: "bought-silk-at-trapezus-port" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-trapezus" },
        { op: "codex", value: "cx-trapezus", reason: "trapezus-book-entry" },
        { op: "queue_event", value: "ev-trapezus-a-followup", reason: "trapezus-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tana-azov", reason: "port-master-named-the-sea-road-to-tana-azov" },
        { op: "reveal_map", value: "caffa", reason: "port-master-named-the-sea-road-to-caffa" },
        { op: "queue_event", value: "ev-trapezus-a-followup", reason: "trapezus-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-harbour" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-silks-tally" },
      ],
    ],
    followup: {
      title: ["Trapezus: The Port Master's Second Word on the Stair", "特拉佩宗：港务长谈台阶的第二句话"],
      body: [
        "The port master takes you to the quay's end and speaks of the mountain road behind the city. He says the silk comes down the passes as the snows allow, and the ships sail as the weather allows, and the harbour is where the two calendars meet — a traveller who reads both may load and go in the same week. He asks what your cargo is worth in days.",
        "港务长把你领到码头尽头，谈起城后的山路。他说丝绸依雪情下山，船只依天气出航，港口是两部历法相会之处——两历皆读的旅人，可在一周之内装货启程。他问你的货值多少日子。",
      ],
      choices: [
        ["Buy silk at the second-tally price", "按二次计数之价买下丝绸"],
        ["Ask him to mark the road toward Berrhoea", "请他标出通往备鲁亚的路"],
        ["Wait a day at the quay and learn the two calendars", "在码头等一日，学两部历法"],
      ],
      results: [
        ["He sells you silk at a returning customer's price. The bolt is sealed for the mountain road.", "他按回头客之价卖给你丝。布匹已封好待行山路。"],
        ["Berrhoea is marked on your map with the days between. The mountain road is open.", "备鲁亚连同其间的日子已标上舆图。山路已通。"],
        ["You wait a day at the quay. The two calendars are learned, and in Trapezus your name now carries a little more weight.", "你在码头等了一日。两部历法已学，特拉佩宗的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1100, reason: "bought-silk-at-trapezus-second-tally" },
        { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-trapezus-second" },
      ],
      [
        { op: "reveal_map", value: "berrhoea", reason: "port-master-marked-the-road-to-berrhoea" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-mountain-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-two-calendars" },
        { op: "reputation", value: 1, scope: "city", id: "trapezus", reason: "learned-the-two-calendars" },
      ],
    ],
  },
  {
    city: "tripolis",
    tier: "station",
    zhName: "的黎波里",
    enName: "Tripolis",
    lore: { placeId: "tripolis", origin: "source", ref: { book: "ibn-battuta", chapterId: "battuta-c005" } },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Tripolis: The Castle and the Harbour of the Coast", "的黎波里：海岸的城堡与港口"],
      body: [
        "At the port of the Levant coast, the castle of Tripolis stands above the harbour where the ships of the sea and the caravans of the inland meet, and the fruit of the plain is loaded under the castle's eye. A castle keeper who has watched the harbour for years says the city has been a prize of many flags, and the harbour has served them all — and that a traveller who deals honestly at the quay is remembered here, where memory is the coin of the place. He asks what coin you carry.",
        "在这座黎凡特海岸的港口，的黎波里的城堡俯瞰着海船与内陆商队相会的港湾，平原的果品在城堡的注视下装船。一位看了多年港湾的堡官说，此城做过许多旗帜的战利品，港湾侍奉过它们全部——在码头诚实行事的旅人会被此城记住，而记忆正是此地的钱。他问你带着什么钱。",
      ],
      choices: [
        ["Buy dates at the quay price", "按码头之价买下椰枣"],
        ["Ask the castle keeper the road toward Tyrus", "问堡官通往推罗的路"],
        ["Walk the harbour a day and learn the flags' customs", "在港湾走一日，学一学诸旗的规矩"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Tripolis goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，的黎波里的记述也随它同行。"],
        ["Tyrus and Antiochia are marked on your map. The coast roads are open.", "推罗与昂都城已标上你的舆图。海岸之路已通。"],
        ["You spend a day at the harbour. The flags' customs are learned, and a small turn of fortune favours you.", "你在港湾过了一日。诸旗的规矩已学，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-tripolis-quay" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-tripolis" },
        { op: "codex", value: "cx-tripolis", reason: "tripolis-book-entry" },
        { op: "queue_event", value: "ev-tripolis-a-followup", reason: "tripolis-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tyrus", reason: "castle-keeper-named-the-road-to-tyrus" },
        { op: "reveal_map", value: "antiochia", reason: "castle-keeper-named-the-road-to-antiochia" },
        { op: "queue_event", value: "ev-tripolis-a-followup", reason: "tripolis-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-harbour" },
        { op: "fate", id: "rapport", value: 1, reason: "learned-the-flags-customs" },
      ],
    ],
    followup: {
      title: ["Tripolis: The Castle Keeper's Second Word on the Flags", "的黎波里：堡官谈诸旗的第二句话"],
      body: [
        "The castle keeper sits with you on the wall and speaks of the many flags. He says the castle has been held by the princes of the coast and the armies of the inland, and the harbour has taken toll of all — and that the city's peace is a balance kept by memory: every flag is remembered, none is favoured twice running. He asks what a traveller of many roads makes of a peace kept by remembering everyone.",
        "堡官与你坐在墙上，谈起许多旗帜。他说城堡被海岸的亲王与内陆的军队都握过，港湾向所有人取税——此城的太平是靠记忆维持的平衡：每一面旗都被记着，没有哪一面接连得宠。他问你这多路的旅人，如何看待一座靠记住所有人来维持太平的城。",
      ],
      choices: [
        ["Buy myrrh sealed for the coast road", "买下封好走海岸路的没药"],
        ["Ask him to mark the road toward Damascus", "请他标出通往大马色的路"],
        ["Wait a day on the wall and hear the flags' tales", "在墙上等一日，听诸旗的旧事"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the coast road.", "他按公道价卖给你没药，叶封完好。树脂在海岸路上经得存放。"],
        ["Damascus is marked on your map with the days between. The inland road is open.", "大马色连同其间的日子已标上舆图。内陆之路已通。"],
        ["You wait a day on the wall. The flags' tales are heard, and in Tripolis your name now carries a little more weight.", "你在墙上等了一日。诸旗的旧事已入耳，你的名字在的黎波里也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-coast-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-tripolis" },
      ],
      [
        { op: "reveal_map", value: "damascus", reason: "castle-keeper-marked-the-road-to-damascus" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-inland-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-flags-tales" },
        { op: "reputation", value: 1, scope: "city", id: "tripolis", reason: "heard-the-flags-tales" },
      ],
    ],
  },
  {
    city: "tyrus",
    tier: "station",
    zhName: "推罗（提尔）",
    enName: "Tyrus",
    lore: { placeId: "tyrus", origin: "source", ref: { book: "ibn-jubayr", chapterId: "jubayr-m019" } },
    scene: { bg: "spice-harbour", region: "west_asia" },
    site: {
      title: ["Tyrus: The Island City on the Causeway", "推罗：长堤上的岛城"],
      body: [
        "At the city that stands on the island joined to the land by a causeway, the harbourmen of Tyrus keep the double harbours that made the city's ancient fame, and the coast trade passes over the causeway in both directions. A harbourman who has worked the moorings for years says the city was once the sea's strongest name, and the causeway still carries what the sea brings — and that a traveller who comes by the causeway enters by the same road the armies could not take. He asks which way you came.",
        "在这座由长堤连接陆地的岛城，推罗的港人经营着使此城名震古代的双港，海岸贸易沿长堤双向往来。一位多年系缆的港人说，此城曾是海上最强的名号，长堤至今仍运载海所送来之物——由长堤而来的旅人，走的是当年军队都攻不进的同一条路。他问你是从哪条路来的。",
      ],
      choices: [
        ["Buy dates at the mooring price", "按系缆之价买下椰枣"],
        ["Ask the harbourman the road toward Tripolis", "问港人通往的黎波里的路"],
        ["Walk the causeway a day and know the sea's two sides", "在长堤走一日，识一识海的两侧"],
      ],
      results: [
        ["He sells you dates at a fair weight. The fruit will keep on the road, and the account of Tyrus goes with it.", "他按公道分量卖给你椰枣。果子路上经得存放，推罗的记述也随它同行。"],
        ["Tripolis and Accon are marked on your map. The coast roads are open.", "的黎波里与阿卡已标上你的舆图。海岸之路已通。"],
        ["You spend a day on the causeway. The sea's two sides are known, and a small turn of fortune favours you.", "你在长堤上过了一日。海的两侧已识，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -400, reason: "bought-dates-at-tyrus-mooring" },
        { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-tyrus" },
        { op: "codex", value: "cx-tyrus", reason: "tyrus-book-entry" },
        { op: "queue_event", value: "ev-tyrus-a-followup", reason: "tyrus-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tripolis", reason: "harbourman-named-the-road-to-tripolis" },
        { op: "reveal_map", value: "accon", reason: "harbourman-named-the-road-to-accon" },
        { op: "queue_event", value: "ev-tyrus-a-followup", reason: "tyrus-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-causeway" },
        { op: "fate", id: "rapport", value: 1, reason: "knew-the-seas-two-sides" },
      ],
    ],
    followup: {
      title: ["Tyrus: The Harbourman's Second Word on the Island", "推罗：港人谈岛的 第二句话"],
      body: [
        "The harbourman takes you to the island's seaward point and speaks of the ancient fame. He says the city was once the strongest of the coast, and the causeway was its glory and its weakness — every army that could not take the sea came by the land, and the sea that made the name did not keep it. He asks what a traveller of many roads makes of a glory built on a road.",
        "港人把你领到岛的海端，谈起古代的威名。他说此城曾是海岸最强之城，长堤既是荣耀也是弱点——攻不下海的军队都从陆上来，而成就其名的海，并没有守住它。他问你这多路的旅人，如何看待一座建在一条路上的荣耀。",
      ],
      choices: [
        ["Buy myrrh sealed for the causeway road", "买下封好走长堤路的没药"],
        ["Ask him to mark the road toward Damascus", "请他标出通往大马色的路"],
        ["Wait a day at the island's point and watch the sea's traffic", "在岛端等一日，看海上的往来"],
      ],
      results: [
        ["He sells you myrrh at a fair price, sealed in leaf. The resin will keep on the causeway road.", "他按公道价卖给你没药，叶封完好。树脂在长堤路上经得存放。"],
        ["Damascus is marked on your map with the days between. The inland road is open.", "大马色连同其间的日子已标上舆图。内陆之路已通。"],
        ["You wait a day at the island's point. The sea's traffic is watched, and in Tyrus your name now carries a little more weight.", "你在岛端等了一日。海上的往来已看，推罗的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -450, reason: "bought-myrrh-for-the-causeway-road" },
        { op: "goods", id: "myrrh", value: 1, reason: "bought-myrrh-at-tyrus" },
      ],
      [
        { op: "reveal_map", value: "damascus", reason: "harbourman-marked-the-road-to-damascus" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-inland-road" },
      ],
      [
        { op: "days", value: 1, reason: "watched-the-seas-traffic" },
        { op: "reputation", value: 1, scope: "city", id: "tyrus", reason: "watched-the-seas-traffic" },
      ],
    ],
  },
  // ─── B5 maritime + steppe ─────────────────────────────────────────
  {
    city: "pentam",
    tier: "town",
    zhName: "宾坦",
    enName: "Pentam",
    lore: { placeId: "pentam", origin: "source", ref: { book: "marco-polo", chapterId: "v2-b3-c008" } },
    scene: { bg: "spice-harbour", region: "maritime_asia" },
    site: {
      title: ["Pentam: The Aromatic Woods of the Wild Island", "宾坦：野岛的香木"],
      body: [
        "On the wild island where all the wood that grows consists of odoriferous trees, the woodmen of Pentam cut the camphor and the aloeswood that scent the whole anchorage, and the pilots of the shallow channel warn every great ship to lift its rudders as it passes. A woodman who has worked the groves for years says the island gives nothing but sweet timber and safe passage, and that a traveller who buys wood here buys the island's only coin. He asks what your cargo can bear.",
        "在这座全岛之木皆为香木的野岛上，宾坦的樵夫砍伐樟脑与沉香，使整片锚地都带着香气；浅水海峡的引航人警告每一艘大船过峡时收起尾舵。一位多年入林的樵夫说，此岛只给出甜美的木材与安全的航道，在此买木的旅人，买的是此岛唯一的钱。他问你的货舱能承什么。",
      ],
      choices: [
        ["Buy camphor at the woodman's price", "按樵夫之价买下樟脑"],
        ["Ask the woodman the passage toward Chamba", "问樵夫通往占城的航道"],
        ["Walk the groves a day and learn the sweet woods", "在林中走一日，学一学香木"],
      ],
      results: [
        ["He sells you camphor at a fair weight. The lump is clean and will scent and sell its way down any coast.", "他按公道分量卖给你樟脑。结块洁净，沿任何海岸都能卖出它的香气与价钱。"],
        ["Chamba and Java-Major are marked on your map. The passages of the islands are open.", "占城与爪哇岛已标上你的舆图。诸岛航道已通。"],
        ["You spend a day among the groves. The sweet woods are learned, and a small turn of fortune favours you.", "你在林中过了一日。香木已识，仿佛风也顺了些。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -450, reason: "bought-camphor-at-pentam-woodman" },
        { op: "goods", id: "camphor", value: 1, reason: "bought-camphor-at-pentam" },
        { op: "codex", value: "cx-pentam", reason: "learned-the-aromatic-woods-of-pentam" },
        { op: "queue_event", value: "ev-pentam-a-followup", reason: "pentam-a-followup" },
      ],
      [
        { op: "reveal_map", value: "chamba", reason: "woodman-named-the-passage-to-chamba" },
        { op: "reveal_map", value: "java-major", reason: "woodman-named-the-passage-to-java-major" },
        { op: "codex", value: "cx-pentam", reason: "mapped-the-island-passages" },
        { op: "queue_event", value: "ev-pentam-a-followup", reason: "pentam-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-groves" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-sweet-woods" },
      ],
    ],
    followup: {
      title: ["Pentam: The Woodman's Second Word on the Channel", "宾坦：樵夫谈海峡的第二句话"],
      body: [
        "The woodman takes you to the channel's edge and shows you the water's shallows. He says the great ships lift their rudders and pass in four paces of depth, and the islanders take their toll in wood and news — the channel is the island's road, and the groves are its market. He asks whether you will ride the shallow channel or buy of the island.",
        "樵夫把你领到海峡边，指给你看水下的浅滩。他说大船收起尾舵，在四步深的水中通过；岛民以木与消息为税——海峡是岛的路，香林是岛的市。他问你是要过这浅水峡，还是买这岛的货。",
      ],
      choices: [
        ["Buy aloeswood sealed for the passage", "买下封好过峡的沉香"],
        ["Ask him to mark the passage toward Samara", "请他标出通往须文那的航道"],
        ["Wait a day at the channel and help pilot the shallow water", "在海峡等一日，相助引浅水"],
      ],
      results: [
        ["He sells you aloeswood at a fair price, sealed in leaf. The wood will scent a cargo hold and a market both.", "他按公道价卖给你沉香，叶封完好。此木可香一舱，亦可香一市。"],
        ["Samara is marked on your map with the passage's days. The channel road is open.", "须文那连同航道的日数已标上舆图。海峡之路已通。"],
        ["You spend a day at the channel. The shallow water's measure is learned, and in Pentam your name now carries a little more weight.", "你在海峡过了一日。浅水的尺度已学，你的名字在宾坦也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -600, reason: "bought-aloeswood-at-pentam" },
        { op: "goods", id: "aloeswood", value: 1, reason: "bought-aloeswood-at-pentam" },
        { op: "codex", value: "cx-pentam", reason: "carried-aloeswood-from-the-wild-island" },
      ],
      [
        { op: "reveal_map", value: "samara", reason: "woodman-marked-the-passage-to-samara" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-channel-road" },
      ],
      [
        { op: "days", value: 1, reason: "piloted-the-shallow-water" },
        { op: "reputation", value: 1, scope: "city", id: "pentam", reason: "helped-at-the-channel" },
      ],
    ],
  },
  {
    city: "caracoron",
    tier: "town",
    zhName: "哈剌和林",
    enName: "Caracoron",
    lore: { placeId: "caracoron", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c046" } },
    scene: { bg: "steppe-camp", region: "steppe" },
    site: {
      title: ["Caracoron: The Earthen Rampart of the First City", "哈剌和林：首城之土垣"],
      body: [
        "In the city of some three miles in compass, the walls of Caracoron are a strong earthen rampart, for stone is scarce there, and beside it stands a great citadel with a fine palace where the governor resides. An elder who keeps the citadel's story says this is the first city the Tartars possessed after they issued from their own country, and that the plains where they began lie to the north — a traveller who hears the story here hears how the world's greatest dominion began. He asks whether you have come for the citadel or the story.",
        "在这座周长约三里的城中，哈剌和林的城墙是坚固的土垣，因为此地缺石；垣旁立着大寨，寨内有总督所居的华宫。一位守着寨史的耆老说，这是鞑靼人走出故土后拥有的第一座城，他们起源的平原在北方——在此听到这段故事，便听到了世间最广大疆域的开端。他问你是为寨而来，还是为故事而来。",
      ],
      choices: [
        ["Buy camlet at the citadel market price", "按寨市之价买下驼毛呢"],
        ["Ask the elder the road toward Campichu", "问耆老通往甘州的路"],
        ["Walk the earthen rampart a day and hear the origin", "在土垣上走一日，听一听起源"],
      ],
      results: [
        ["He sells you camlet at a fair weight. The cloth is well woven, and the account of Caracoron goes with it.", "他按公道分量卖给你驼毛呢。织工精细，哈剌和林的记述也随它同行。"],
        ["Campichu and Etzina are marked on your map. The roads south are open.", "甘州与亦集乃已标上你的舆图。南路已通。"],
        ["You spend a day on the rampart. The origin is heard, and a small turn of fortune favours you.", "你在土垣上过了一日。起源已入耳，时运亦稍见眷顾。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -600, reason: "bought-camlet-at-caracoron-citadel-market" },
        { op: "goods", id: "camlet", value: 1, reason: "bought-camlet-at-caracoron" },
        { op: "codex", value: "cx-caracoron", reason: "learned-the-citadel-of-caracoron" },
        { op: "queue_event", value: "ev-caracoron-a-followup", reason: "caracoron-a-followup" },
      ],
      [
        { op: "reveal_map", value: "campichu", reason: "elder-named-the-road-to-campichu" },
        { op: "reveal_map", value: "etzina", reason: "elder-named-the-road-to-etzina" },
        { op: "codex", value: "cx-caracoron", reason: "mapped-the-roads-from-the-first-city" },
        { op: "queue_event", value: "ev-caracoron-a-followup", reason: "caracoron-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-earthen-rampart" },
        { op: "fate", id: "rapport", value: 1, reason: "heard-the-origin-of-the-dominion" },
      ],
    ],
    followup: {
      title: ["Caracoron: The Elder's Tale of the Beginning", "哈剌和林：耆老的起源之谈"],
      body: [
        "The elder sits you down in the citadel's shadow and tells the tale as it is told in this city. He says the Tartars dwelt in the north on the borders of Chorcha, in a country of great plains with excellent pasture-lands and great rivers, and there was no sovereign among them — and that the dominion which now reaches to the ends of the earth began in those plains, in a land with no towns. He asks what a traveller of many roads makes of an empire that began in a pasture.",
        "耆老让你在寨影下坐下，把城中相传的故事讲给你听。他说鞑靼人原居北方女直之界，那是一片大平原，牧草极佳，大河纵横，人众之间没有君王——如今疆域达于地极的帝国，始于那片无城无镇的草原。他问你这多路的旅人，如何看待一个始于牧场的帝国。",
      ],
      choices: [
        ["Buy hunting falcon at the citadel price", "按寨中之价买下一只猎隼"],
        ["Ask him to mark the road toward Camul", "请他标出通往哈密的路"],
        ["Wait a day in the citadel and hear the empire's older tales", "在寨中等一日，听帝国更早的故事"],
      ],
      results: [
        ["He sells you a falcon at a fair price, hooded and jessed. The bird will serve the steppe roads well.", "他按公道价卖给你一只猎隼，已蒙眼系绊。此鸟在草原路上大有用处。"],
        ["Camul is marked on your map with the days between. The eastern road is open.", "哈密连同其间的日子已标上舆图。东路已通。"],
        ["You wait a day in the citadel. The older tales are heard, and in Caracoron your name now carries a little more weight.", "你在寨中等了一日。更早的故事已入耳，哈剌和林的人也把你的名字多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -1500, reason: "bought-hunting-falcon-at-caracoron" },
        { op: "goods", id: "hunting-falcon", value: 1, reason: "bought-hunting-falcon-at-caracoron" },
        { op: "codex", value: "cx-caracoron", reason: "carried-a-falcon-from-the-first-city" },
      ],
      [
        { op: "reveal_map", value: "camul", reason: "elder-marked-the-road-to-camul" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-eastern-road" },
      ],
      [
        { op: "days", value: 1, reason: "heard-the-empires-older-tales" },
        { op: "reputation", value: 1, scope: "city", id: "caracoron", reason: "heard-the-empires-older-tales" },
      ],
    ],
  },
  {
    city: "egrigaia",
    tier: "town",
    zhName: "额里合牙（宁夏）",
    enName: "Egrigaia",
    lore: { placeId: "egrigaia", origin: "source", ref: { book: "marco-polo", chapterId: "v1-b1-c058" } },
    scene: { bg: "steppe-camp", region: "steppe" },
    site: {
      title: ["Egrigaia: The White Camels and the Finest Camlets", "额里合牙：白驼与天下第一驼毛呢"],
      body: [
        "In the province of Tangut, the weavers of Egrigaia make great quantities of camlets of camel's wool — the finest in the world — and some of them are white, for the province has white camels, and these are the best of all. A weaver who has worked the white wool for years says the city has fine Nestorian churches among the idolaters' temples, and that the merchants of every country carry these stuffs over the world for sale. He asks what you mean to carry from here.",
        "在唐古忒的省境，额里合牙的织工织造大量骆驼毛呢——举世最精——其中一些是白色的，因为本省有白骆驼，而白驼毛所织者品质最佳。一位多年织白毛的织工说，此城在偶像之寺之间立着精丽的景教教堂，万国商人把这些织物贩往全世界。他问你想从这里带走什么。",
      ],
      choices: [
        ["Buy white camlet at the weaver's price", "按织工之价买下白驼毛呢"],
        ["Ask the weaver the road toward Tenduc", "问织工通往天德军的路"],
        ["Walk the white camels' pasture a day and learn the wool", "在白驼的牧场上走一日，学一学毛"],
      ],
      results: [
        ["He sells you white camlet at a fair weight. The cloth is the finest of its kind, and the account of Egrigaia goes with it.", "他按公道分量卖给你白驼毛呢。此布为同类之最，额里合牙的记述也随它同行。"],
        ["Tenduc and Campichu are marked on your map. The Tangut roads are open.", "天德军与甘州已标上你的舆图。唐古忒之路已通。"],
        ["You spend a day among the camels. The wool's measure is learned, and a small turn of fortune favours you.", "你在骆驼间过了一日。毛的尺度已学，运势似也偏了你一分。"],
      ],
    },
    siteEffects: [
      [
        { op: "coins", value: -700, reason: "bought-white-camlet-at-egrigaia-weaver" },
        { op: "goods", id: "camlet", value: 1, reason: "bought-white-camlet-at-egrigaia" },
        { op: "codex", value: "cx-egrigaia", reason: "learned-the-white-camels-of-egrigaia" },
        { op: "queue_event", value: "ev-egrigaia-a-followup", reason: "egrigaia-a-followup" },
      ],
      [
        { op: "reveal_map", value: "tenduc", reason: "weaver-named-the-road-to-tenduc" },
        { op: "reveal_map", value: "campichu", reason: "weaver-named-the-road-to-campichu" },
        { op: "codex", value: "cx-egrigaia", reason: "mapped-the-tangut-roads" },
        { op: "queue_event", value: "ev-egrigaia-a-followup", reason: "egrigaia-a-followup" },
      ],
      [
        { op: "days", value: 1, reason: "walked-the-white-camels-pasture" },
        { op: "fate", id: "wealth", value: 1, reason: "learned-the-wools-measure" },
      ],
    ],
    followup: {
      title: ["Egrigaia: The Weaver's Second Word on the White Wool", "额里合牙：织工谈白毛的第二句话"],
      body: [
        "The weaver takes you to the pasture where the white camels graze and speaks of the wool as the province's pride. He says the white camlets go over the world for sale, and the Nestorian churches and the idolaters' temples stand in the same streets, and the city's two faiths share the same wool — and that a traveller who buys white camlet here buys the province's one true wealth. He asks what you will weave of it.",
        "织工把你领到白驼吃草的牧场，把毛说成此省的骄傲。他说白驼毛呢贩往全世界，景教教堂与偶像之寺立在同一条街上，此城两教共用同一把毛——在此买白驼毛呢的旅人，买的是此省唯一真实的财富。他问你要用它织什么。",
      ],
      choices: [
        ["Buy leather at the weaver's second price", "按织工的次价买下皮革"],
        ["Ask him to mark the road toward Kenjanfu", "请他标出通往西安的路"],
        ["Wait a day at the looms and learn the white weaving", "在织机旁等一日，学白毛的织法"],
      ],
      results: [
        ["He sells you leather at a fair price. The hide is sound for the mountain road.", "他按公道价卖给你皮革。皮子结实，山路可用。"],
        ["Kenjanfu is marked on your map with the days between. The eastern road is open.", "西安连同其间的日子已标上舆图。东路已通。"],
        ["You wait a day at the looms. The white weaving is learned, and in Egrigaia your name now carries a little more weight.", "你在织机旁等了一日。白毛的织法已学，在额里合牙也被多记了一分。"],
      ],
    },
    followupEffects: [
      [
        { op: "coins", value: -500, reason: "bought-leather-at-egrigaia-second-price" },
        { op: "goods", id: "leather", value: 1, reason: "bought-leather-at-egrigaia" },
        { op: "codex", value: "cx-egrigaia", reason: "traded-with-the-two-faiths" },
      ],
      [
        { op: "reveal_map", value: "kenjanfu", reason: "weaver-marked-the-road-to-kenjanfu" },
        { op: "fate", id: "travel", value: 1, reason: "learned-the-eastern-road" },
      ],
      [
        { op: "days", value: 1, reason: "learned-the-white-weaving" },
        { op: "reputation", value: 1, scope: "city", id: "egrigaia", reason: "studied-the-white-weaving" },
      ],
    ],
  },
];
