export default [
  {
    id: "campichu",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "The Seat of Tangut",
        titleZh: "唐古特治所",
        bodyEn:
          "You stand in the capital of the whole province of Tangut, where the governor's clerks weigh out salt certificates and tally the tribute of the western marches. Caravans from the sandy desert to the north unload camels in the outer wards, and the market runs from dawn until the third watch without ceasing.",
        bodyZh:
          "你立于唐古特全省之都会，总督衙门在此称量盐引、核算西陲贡赋。北来沙漠之商队于外城卸驼，市集自晓至三更不绝。",
        choices: [
          {
            slug: "clerks",
            labelEn: "Watch the governor's clerks at their tally",
            labelZh: "看总督属吏清册",
            effects: [
              { op: "days", value: 1, reason: "watched-the-tangut-tally" },
              { op: "codex", value: "cx-campichu", reason: "learned-the-seat-of-tangut" },
              { op: "reveal_map", value: "caracoron", reason: "clerks-named-the-northern-road" },
            ],
          },
          {
            slug: "caravan",
            labelEn: "Bargain with desert caravans for tea",
            labelZh: "与沙漠商队议价购茶",
            needs: { coins: { min: 6000 } },
            effects: [
              { op: "coins", value: -6000, reason: "bought-tea-from-desert-traders" },
              { op: "goods", id: "tea", value: 1, reason: "bought-tea-from-desert-traders" },
              { op: "codex", value: "cx-campichu", reason: "heard-the-provincial-trade" },
            ],
          },
          {
            slug: "pass",
            labelEn: "Pass through the government quarter without delay",
            labelZh: "匆匆穿过官署区",
            effects: [
              { op: "reveal_map", value: "etzina", reason: "saw-the-road-to-etzina" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-capital-gates" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Churches and Abbeys",
        titleZh: "教堂与佛寺并立",
        bodyEn:
          "In Campichu you find three very fine Christian churches standing near many idol abbeys after the local fashion. Within the latter lie enormous gilded figures, some ten paces in length, with lesser images adoring before them. Saracens also keep their mosques here, so that four faiths share one street without quarrel.",
        bodyZh:
          "甘州城中三座极美之基督教堂，与诸多偶像教徒之佛寺比邻而立。寺中卧像金覆，大者可十步，小像环拜。撒拉逊人亦自有礼拜处，四教同街而不争。",
        choices: [
          {
            slug: "churches",
            labelEn: "Enter one of the three Christian churches",
            labelZh: "入三座基督教堂之一",
            effects: [
              { op: "days", value: 1, reason: "entered-a-christian-church" },
              { op: "codex", value: "cx-campichu", reason: "saw-churches-beside-abbeys" },
              { op: "reputation", value: 1, scope: "band", id: "china", reason: "respected-the-local-faiths" },
            ],
          },
          {
            slug: "abbey",
            labelEn: "Walk the idol abbeys and note their gilded figures",
            labelZh: "巡行佛寺，记其金像",
            effects: [
              { op: "codex", value: "cx-campichu", reason: "walked-among-the-gilded-idols" },
              { op: "reveal_map", value: "egrigaia", reason: "monks-named-the-eastern-road" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-a-religious-recluse" },
            ],
          },
          {
            slug: "offering",
            labelEn: "Leave a small offering at an abbey gate",
            labelZh: "于寺门略献薄礼",
            needs: { coins: { min: 500 } },
            effects: [
              { op: "coins", value: -500, reason: "left-an-offering-at-the-abbey" },
              { op: "reputation", value: 1, scope: "city", id: "campichu", reason: "left-an-offering-at-the-abbey" },
              { op: "codex", value: "cx-campichu", reason: "learned-the-idolaters-ways" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "chinangli",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "The Great River Traffic",
        titleZh: "大河丝货香料之运",
        bodyEn:
          "A great and wide river runs through Chinangli, and upon it you see silk goods, spices, and other costly merchandize passing up and down without pause. The quays are stacked with bales, and boatmen shout the names of towns far south and north while they warp their vessels to the bank.",
        bodyZh:
          "长芦城中贯一大河，河阔水深，丝货、香料及其他贵重货物沿河上下，昼夜不绝。埠头堆满货捆，舟子呼南北诸城之名，将船系岸。",
        choices: [
          {
            slug: "quay",
            labelEn: "Walk the quay and count the upstream boats",
            labelZh: "沿河埠头数上行之船",
            effects: [
              { op: "days", value: 1, reason: "walked-the-chinangli-quay" },
              { op: "codex", value: "cx-chinangli", reason: "saw-the-river-traffic" },
              { op: "reveal_map", value: "cambaluc", reason: "boatmen-named-the-northern-route" },
            ],
          },
          {
            slug: "silk",
            labelEn: "Buy a bolt of river-traded silk",
            labelZh: "购沿河贸易之丝一束",
            needs: { coins: { min: 10000 } },
            effects: [
              { op: "coins", value: -10000, reason: "bought-silk-at-the-river-quay" },
              { op: "goods", id: "silk", value: 1, reason: "bought-silk-at-the-river-quay" },
              { op: "reveal_map", value: "cacanfu", reason: "merchants-named-the-southern-road" },
            ],
          },
          {
            slug: "spice",
            labelEn: "Ask which spices the downstream boats carry",
            labelZh: "问下行之船载何香料",
            effects: [
              { op: "codex", value: "cx-chinangli", reason: "heard-the-spice-traffic" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-river-routes" },
              { op: "reveal_map", value: "chandu", reason: "pilots-named-the-grand-canal" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Paper-Money of Cathay",
        titleZh: "契丹交钞之市",
        bodyEn:
          "The people of Chinangli are idolaters subject to the Great Kaan, and they trade with stamped paper-money in every shop and stall. You watch clerks exchange worn notes for fresh ones, and merchants weigh out goods against the Khan's seal without once touching silver.",
        bodyZh:
          "长芦之民为偶像教徒，臣服大汗，市肆皆用印钞交易。你见属吏以新钞换旧，商人照大汗印记称货，竟不碰白银。",
        choices: [
          {
            slug: "exchange",
            labelEn: "Watch the paper-money exchange at a stall",
            labelZh: "于摊前看钞币兑换",
            effects: [
              { op: "days", value: 1, reason: "watched-the-paper-money-exchange" },
              { op: "codex", value: "cx-chinangli", reason: "learned-cathay-paper-money" },
              { op: "goods", id: "paper-money", value: 1, reason: "received-a-sample-note" },
            ],
          },
          {
            slug: "porcelain",
            labelEn: "Buy a small porcelain bowl with paper-money",
            labelZh: "以交钞购一小瓷碗",
            needs: { coins: { min: 4000 } },
            effects: [
              { op: "coins", value: -4000, reason: "bought-porcelain-with-paper-money" },
              { op: "goods", id: "porcelain", value: 1, reason: "bought-porcelain-with-paper-money" },
              { op: "reputation", value: 1, scope: "band", id: "china", reason: "paid-in-the-khans-currency" },
            ],
          },
          {
            slug: "clerks",
            labelEn: "Ask the exchange clerks how the notes are renewed",
            labelZh: "问兑换吏如何换新钞",
            effects: [
              { op: "codex", value: "cx-chinangli", reason: "heard-how-notes-are-renewed" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-the-exchange-clerks" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "kenjanfu",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "Mulberry Plains",
        titleZh: "桑田与蚕圃",
        bodyEn:
          "West of the city you walk fine plains planted with mulberries, the trees whose leaves feed the silkworms. Gardeners spread fresh trays in the shade, and the road from Cachanfu is lined with boroughs that sell cocoons by the basket before noon.",
        bodyZh:
          "出城西行，见广平原植桑——蚕食桑叶之树。园户于荫下铺新盘，自河中府来之路旁，诸镇午前即售茧篮。",
        choices: [
          {
            slug: "gardens",
            labelEn: "Walk the mulberry gardens with a silkworm keeper",
            labelZh: "随养蚕人巡桑田",
            effects: [
              { op: "days", value: 1, reason: "walked-the-mulberry-gardens" },
              { op: "codex", value: "cx-kenjanfu", reason: "saw-the-silkworm-plains" },
              { op: "reveal_map", value: "cachanfu", reason: "keepers-named-the-eastern-road" },
            ],
          },
          {
            slug: "silk",
            labelEn: "Buy raw silk from a cocoon market",
            labelZh: "于茧市购生丝",
            needs: { coins: { min: 8000 } },
            effects: [
              { op: "coins", value: -8000, reason: "bought-raw-silk-at-the-cocoon-market" },
              { op: "goods", id: "silk", value: 1, reason: "bought-raw-silk-at-the-cocoon-market" },
              { op: "reveal_map", value: "egrigaia", reason: "carriers-named-the-northern-plain" },
            ],
          },
          {
            slug: "watch",
            labelEn: "Stand at the roadside and watch the cocoon carts pass",
            labelZh: "立路旁观茧车过",
            effects: [
              { op: "codex", value: "cx-kenjanfu", reason: "watched-cocoon-carts-from-the-west" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-mulberry-road" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Cities of Industry",
        titleZh: "沿途百工之盛",
        bodyEn:
          "When you leave Cachanfu and travel eight days westward you meet cities and boroughs abounding in trade and industry before ever you reach Kenjanfu. Here Prince Mangalai keeps his palace outside the walls, and the workshops weave cloths of silk and gold and forge harness for the Khan's host.",
        bodyZh:
          "自河中府西行八日，未至京兆府，已见城邑市镇贸易百工皆盛。曼哥来王子于城外设宫，工坊织金锦丝帛，又为大汗之军备鞍辔。",
        choices: [
          {
            slug: "workshops",
            labelEn: "Tour the silk-and-gold workshops",
            labelZh: "观金锦丝帛工坊",
            effects: [
              { op: "days", value: 2, reason: "toured-the-gold-silk-workshops" },
              { op: "codex", value: "cx-kenjanfu", reason: "saw-the-industrial-boroughs" },
              { op: "reveal_map", value: "saianfu", reason: "masters-named-the-southern-road" },
            ],
          },
          {
            slug: "lacquer",
            labelEn: "Buy lacquerware from an armourer's quarter",
            labelZh: "于军器坊区购漆器",
            needs: { coins: { min: 7000 } },
            effects: [
              { op: "coins", value: -7000, reason: "bought-lacquerware-in-the-industrial-quarter" },
              { op: "goods", id: "lacquerware", value: 1, reason: "bought-lacquerware-in-the-industrial-quarter" },
              { op: "reputation", value: 1, scope: "city", id: "kenjanfu", reason: "dealt-with-the-workshop-masters" },
            ],
          },
          {
            slug: "palace",
            labelEn: "View Prince Mangalai's palace from the plain",
            labelZh: "于平原远观曼哥来王宫",
            effects: [
              { op: "codex", value: "cx-kenjanfu", reason: "saw-the-princes-palace" },
              { op: "fate", id: "rapport", value: 1, reason: "heard-how-mangalai-rules" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "saianfu",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "Twelve Rich Cities",
        titleZh: "辖十二富城",
        bodyEn:
          "Saianfu is a very great and noble city that rules over twelve other large and rich cities, and is itself a seat of great trade and manufacture. In the weaving quarters you hear shuttles clacking from dawn until lamp-light, and the magistrates' lists name every subject town upon the plain.",
        bodyZh:
          "襄阳府极大而尊贵，辖十二座大而富之城，本城亦为贸易手艺之盛地。织坊中梭声自晓至灯昏不绝，官府册籍列平原诸属邑。",
        choices: [
          {
            slug: "weavers",
            labelEn: "Watch the silk weavers at their looms",
            labelZh: "观织工于机杼前",
            effects: [
              { op: "days", value: 1, reason: "watched-the-saianfu-weavers" },
              { op: "codex", value: "cx-saianfu", reason: "learned-the-twelve-cities-weave" },
              { op: "reveal_map", value: "sinjumatu", reason: "weavers-named-the-canal-towns" },
            ],
          },
          {
            slug: "silk",
            labelEn: "Buy fine silken stuff from a weaver's stall",
            labelZh: "于织户摊购细绢",
            needs: { coins: { min: 9000 } },
            effects: [
              { op: "coins", value: -9000, reason: "bought-fine-silk-at-saianfu" },
              { op: "goods", id: "silk", value: 1, reason: "bought-fine-silk-at-saianfu" },
              { op: "reveal_map", value: "cachanfu", reason: "merchants-named-the-northern-route" },
            ],
          },
          {
            slug: "magistrates",
            labelEn: "Ask the magistrates which towns owe tribute",
            labelZh: "问官吏何城纳贡",
            effects: [
              { op: "codex", value: "cx-saianfu", reason: "heard-of-the-twelve-subject-cities" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-provincial-roads" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Game and Manufacture",
        titleZh: "猎物与百工",
        bodyEn:
          "They have much silk here, and also a quantity of game, for the woods and marshes round Saianfu abound in beasts and birds. Hunters bring pelts to the market beside the armourers, and the city holds all that behoves a noble seat — workshops, granaries, and deep waters on three sides.",
        bodyZh:
          "此地丝多，猎物亦丰，城外林泽兽禽皆饶。猎人携皮货至市，与军器坊相邻；城中具备尊贵都会应有之工坊、仓廪，三面环水。",
        choices: [
          {
            slug: "market",
            labelEn: "Walk the hunters' market beside the workshops",
            labelZh: "巡猎人市，近工坊区",
            effects: [
              { op: "days", value: 1, reason: "walked-the-hunters-market" },
              { op: "codex", value: "cx-saianfu", reason: "saw-game-and-manufacture" },
              { op: "reveal_map", value: "kenjanfu", reason: "hunters-named-the-western-road" },
            ],
          },
          {
            slug: "ginger",
            labelEn: "Buy ginger from a victualler's stall",
            labelZh: "于粮商摊购生姜",
            needs: { coins: { min: 2000 } },
            effects: [
              { op: "coins", value: -2000, reason: "bought-ginger-at-saianfu" },
              { op: "goods", id: "ginger", value: 1, reason: "bought-ginger-at-saianfu" },
              { op: "reputation", value: 1, scope: "band", id: "china", reason: "bought-at-the-noble-market" },
            ],
          },
          {
            slug: "walls",
            labelEn: "Walk the northern approach where the host once lay siege",
            labelZh: "沿北道而行——昔年大军曾围城处",
            effects: [
              { op: "codex", value: "cx-saianfu", reason: "heard-how-the-city-held-out" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-an-old-soldier" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "sinju",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "The Greatest River",
        titleZh: "天下第一江",
        bodyEn:
          "Sinju stands on the greatest river in the world, which men call Kian. Though the city is of no great size, the waters before it are black with vessels, and boatmen swear that more wealth passes here than on all the rivers and seas of Christendom together.",
        bodyZh:
          "真州（仪征）立于天下第一之大江——人呼 KIAN（大江）——之上。城虽不大，江面舟楫如云，舟子誓言：此处过货之富，胜全基督教世界诸江海运之和。",
        choices: [
          {
            slug: "count",
            labelEn: "Stand at the bank and count the moored vessels",
            labelZh: "立岸数泊船之数",
            effects: [
              { op: "days", value: 1, reason: "counted-vessels-on-the-kian" },
              { op: "codex", value: "cx-sinju", reason: "saw-the-greatest-river-traffic" },
              { op: "reveal_map", value: "caiju", reason: "pilots-named-the-upstream-port" },
            ],
          },
          {
            slug: "tea",
            labelEn: "Buy tea from a river bargeman",
            labelZh: "向江船客购茶",
            needs: { coins: { min: 5000 } },
            effects: [
              { op: "coins", value: -5000, reason: "bought-tea-from-a-river-bargeman" },
              { op: "goods", id: "tea", value: 1, reason: "bought-tea-from-a-river-bargeman" },
              { op: "reveal_map", value: "nanghin", reason: "bargemen-named-the-western-towns" },
            ],
          },
          {
            slug: "toll",
            labelEn: "Ask the toll clerks how many vessels pass in a year",
            labelZh: "问税吏岁过船几何",
            effects: [
              { op: "codex", value: "cx-sinju", reason: "heard-the-rivers-toll-count" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-river-routes" },
              { op: "reveal_map", value: "chinghianfu", reason: "clerks-named-the-downstream-city" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Paper-Money Port",
        titleZh: "交钞之港",
        bodyEn:
          "The people are idolaters subject to the Great Kaan, and they use paper-money in every transaction on the quay. For all its modest walls, Sinju sees a very great amount of shipping and trade, and the revenue the Khan draws here is something marvellous.",
        bodyZh:
          "其民为偶像教徒，臣服大汗，埠头交易皆用交钞。城垣虽不甚大，真州舟楫贸易之盛，大汗岁入之丰，皆令人称奇。",
        choices: [
          {
            slug: "quay",
            labelEn: "Watch merchants pay tolls in paper-money",
            labelZh: "看商人以交钞纳埠头税",
            effects: [
              { op: "days", value: 1, reason: "watched-paper-money-on-the-quay" },
              { op: "codex", value: "cx-sinju", reason: "learned-the-paper-money-port" },
              { op: "goods", id: "paper-money", value: 1, reason: "received-a-port-note" },
            ],
          },
          {
            slug: "porcelain",
            labelEn: "Buy porcelain from a river trader",
            labelZh: "向江商购瓷器",
            needs: { coins: { min: 6000 } },
            effects: [
              { op: "coins", value: -6000, reason: "bought-porcelain-at-sinju" },
              { op: "goods", id: "porcelain", value: 1, reason: "bought-porcelain-at-sinju" },
              { op: "reputation", value: 1, scope: "city", id: "sinju", reason: "traded-on-the-busy-quay" },
            ],
          },
          {
            slug: "harbour",
            labelEn: "Walk the harbour and note how small the city is for such traffic",
            labelZh: "巡埠头，记城小而货盛",
            effects: [
              { op: "codex", value: "cx-sinju", reason: "marvelled-at-the-small-busy-port" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-a-harbour-clerk" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "siju",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "Manufactures from Piju",
        titleZh: "自邳州南来之工",
        bodyEn:
          "When you leave Piju and travel two days south through districts abounding in game, you reach Siju, a great and rich city flourishing with trade and manufactures. The southern road brings in grain and harness, and the workshops here finish what the northern towns begin.",
        bodyZh:
          "自邳州南行二日，经猎物丰饶之境，至邳州——大而富、贸易百工兴盛之城。南路运来谷粮与鞍辔，此地工坊补成北境诸镇之所始。",
        choices: [
          {
            slug: "workshops",
            labelEn: "Tour the manufactures brought down from Piju",
            labelZh: "观自邳州南来之物于工坊",
            effects: [
              { op: "days", value: 1, reason: "toured-siju-manufactures" },
              { op: "codex", value: "cx-siju", reason: "saw-the-southern-road-goods" },
              { op: "reveal_map", value: "paukin", reason: "masters-named-the-manzi-road" },
            ],
          },
          {
            slug: "sugar",
            labelEn: "Buy sugar from a refiner's stall",
            labelZh: "于炼糖摊购糖",
            needs: { coins: { min: 4000 } },
            effects: [
              { op: "coins", value: -4000, reason: "bought-sugar-at-siju" },
              { op: "goods", id: "sugar", value: 1, reason: "bought-sugar-at-siju" },
              { op: "reveal_map", value: "coigangiu", reason: "carriers-named-the-river-town" },
            ],
          },
          {
            slug: "grain",
            labelEn: "Walk the grain market on the fertile plain",
            labelZh: "巡平原粮市",
            effects: [
              { op: "codex", value: "cx-siju", reason: "saw-the-fertile-plain" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-southern-road" },
              { op: "reveal_map", value: "coiganju", reason: "merchants-named-the-great-river" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Burning the Dead",
        titleZh: "火葬之俗",
        bodyEn:
          "The people of Siju are idolaters who burn their dead and use paper-money, and you see funeral parties pass toward the cremation grounds outside the walls. They lay out paper offerings beside the pyre, and the smoke rises all day above the southern road.",
        bodyZh:
          "邳州之民为偶像教徒，火葬其尸，用交钞；你见丧队往城外火化地。柴堆旁置纸祭，南路上空终日烟起。",
        choices: [
          {
            slug: "observe",
            labelEn: "Stand at a respectful distance and watch a funeral rite",
            labelZh: "于远处静观丧礼",
            effects: [
              { op: "days", value: 1, reason: "observed-the-cremation-rite" },
              { op: "codex", value: "cx-siju", reason: "learned-the-burning-of-the-dead" },
              { op: "reputation", value: 1, scope: "band", id: "china", reason: "observed-without-disrespect" },
            ],
          },
          {
            slug: "paper-money",
            labelEn: "Buy paper-money at a stall near the cremation ground",
            labelZh: "于火化地旁摊购交钞",
            needs: { coins: { min: 3000 } },
            effects: [
              { op: "coins", value: -3000, reason: "bought-paper-money-near-the-cremation-ground" },
              { op: "goods", id: "paper-money", value: 1, reason: "bought-paper-money-near-the-cremation-ground" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-a-funeral-clerk" },
            ],
          },
          {
            slug: "ask",
            labelEn: "Ask an elder why they burn rather than bury",
            labelZh: "问长者何以火葬而非土葬",
            effects: [
              { op: "codex", value: "cx-siju", reason: "heard-why-they-burn-the-dead" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-funeral-custom" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "suju",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "Gold Brocade and Sixty Miles",
        titleZh: "金锦与六十里周",
        bodyEn:
          "Suju is a very great and noble city with a circuit of some sixty miles, and the people possess silk in great quantities from which they make gold brocade and other stuffs. You walk a weaving quarter where the shuttles never rest, and the master tells you the city's name means Earth in our tongue.",
        bodyZh:
          "苏州极大而尊贵，城周一约六十里，民有丝极丰，织金锦及其他织物。你过织坊区，梭声不绝；主人言此城名在我辈语言中意为「地」。",
        choices: [
          {
            slug: "brocade",
            labelEn: "Watch the gold brocade looms at work",
            labelZh: "观织金锦之机杼",
            effects: [
              { op: "days", value: 2, reason: "watched-the-gold-brocade-looms" },
              { op: "codex", value: "cx-suju", reason: "saw-the-sixty-mile-weaving-city" },
              { op: "reveal_map", value: "kinsay", reason: "weavers-named-the-heaven-city" },
            ],
          },
          {
            slug: "silk",
            labelEn: "Buy a length of gold brocade",
            labelZh: "购金锦一段",
            needs: { coins: { min: 15000 } },
            effects: [
              { op: "coins", value: -15000, reason: "bought-gold-brocade-at-suju" },
              { op: "goods", id: "silk", value: 1, reason: "bought-gold-brocade-at-suju" },
              { op: "reputation", value: 1, scope: "city", id: "suju", reason: "dealt-with-a-great-weaver" },
            ],
          },
          {
            slug: "circuit",
            labelEn: "Ride part of the city's sixty-mile circuit",
            labelZh: "骑行城周一程",
            effects: [
              { op: "codex", value: "cx-suju", reason: "rode-the-sixty-mile-circuit" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-vast-walls" },
              { op: "reveal_map", value: "chinghianfu", reason: "gatekeepers-named-the-western-road" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Merchants and Canal Gardens",
        titleZh: "富商与运河园圃",
        bodyEn:
          "The city hath merchants of great wealth and an incalculable number of people, though they are accomplished traders and not soldiers at all. Between the canals you find gardens where wealthy men keep fishponds and plant ginger and rhubarb in the shaded plots.",
        bodyZh:
          "城中富商极多，人口不可胜计，然彼等精于贸易而非兵事。运河之间，富人凿池养鱼，于荫圃植姜与 rhubarb（大黄）。",
        choices: [
          {
            slug: "gardens",
            labelEn: "Walk the canal gardens with a merchant's clerk",
            labelZh: "随商贾属吏巡运河园圃",
            effects: [
              { op: "days", value: 1, reason: "walked-the-canal-gardens" },
              { op: "codex", value: "cx-suju", reason: "saw-the-wealthy-merchants-gardens" },
              { op: "reveal_map", value: "chinginju", reason: "clerks-named-the-eastern-towns" },
            ],
          },
          {
            slug: "rhubarb",
            labelEn: "Buy rhubarb from a garden stall",
            labelZh: "于园圃摊购大黄",
            needs: { coins: { min: 1500 } },
            effects: [
              { op: "coins", value: -1500, reason: "bought-rhubarb-in-the-canal-gardens" },
              { op: "goods", id: "rhubarb", value: 1, reason: "bought-rhubarb-in-the-canal-gardens" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-a-wealthy-merchant" },
            ],
          },
          {
            slug: "bridges",
            labelEn: "Stand on a stone bridge and watch the canal traffic",
            labelZh: "立石桥观运河舟行",
            effects: [
              { op: "codex", value: "cx-suju", reason: "stood-on-a-lofty-stone-bridge" },
              { op: "reputation", value: 1, scope: "band", id: "china", reason: "admired-the-canal-city" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "tanpiju",
    band: "china",
    sceneBg: "canal-city",
    sites: [
      {
        letter: "a",
        titleEn: "Gardens a Day from Kinsay",
        titleZh: "距行在一日之园圃",
        bodyEn:
          "When you leave Kinsay and travel a day's journey south-east through a plenteous region, you pass a succession of dwellings and charming gardens before you reach Tanpiju. Peach and mulberry plots line the road, and the air smells of turned earth and canal water.",
        bodyZh:
          "自行在向东南行一日，过丰饶之境，屋舍与美园连绵，便至通州（桐庐）。道旁桃桑相间，空气中泥土与运河水气相杂。",
        choices: [
          {
            slug: "gardens",
            labelEn: "Walk the garden road from Kinsay",
            labelZh: "沿自行在来之园路而行",
            effects: [
              { op: "days", value: 1, reason: "walked-the-garden-road-from-kinsay" },
              { op: "codex", value: "cx-tanpiju", reason: "saw-the-plenteous-gardens" },
              { op: "reveal_map", value: "kinsay", reason: "gardeners-named-the-heaven-city" },
            ],
          },
          {
            slug: "tea",
            labelEn: "Buy tea from a gardener's stall",
            labelZh: "于园户摊购茶",
            needs: { coins: { min: 4000 } },
            effects: [
              { op: "coins", value: -4000, reason: "bought-tea-in-the-garden-country" },
              { op: "goods", id: "tea", value: 1, reason: "bought-tea-in-the-garden-country" },
              { op: "reveal_map", value: "fuju", reason: "carriers-named-the-southern-road" },
            ],
          },
          {
            slug: "mulberry",
            labelEn: "Ask which gardens feed the silkworms",
            labelZh: "问何园供蚕食",
            effects: [
              { op: "codex", value: "cx-tanpiju", reason: "heard-of-the-mulberry-gardens" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-garden-road" },
              { op: "reveal_map", value: "chinginju", reason: "farmers-named-the-eastern-towns" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Under Kinsay",
        titleZh: "隶行在",
        bodyEn:
          "Tanpiju is a great and rich city under Kinsay. The people burn their dead as elsewhere in Manzi, use paper-money, and live by trade and handicrafts, with all necessaries in great plenty and cheapness. Carts from the Heaven City arrive each morning with goods for the local market.",
        bodyZh:
          "通州大而富，隶行在。民火葬其尸，用交钞，靠贸易手艺为生，百物丰而贱。行在之车每晨至，供本地市集。",
        choices: [
          {
            slug: "market",
            labelEn: "Walk the market where Kinsay goods are sold",
            labelZh: "巡行在货于市",
            effects: [
              { op: "days", value: 1, reason: "walked-the-kinsay-goods-market" },
              { op: "codex", value: "cx-tanpiju", reason: "learned-tanpiju-under-kinsay" },
              { op: "goods", id: "hangzhou-fan", value: 1, reason: "bought-a-fan-from-kinsay-stock" },
            ],
          },
          {
            slug: "funeral",
            labelEn: "Watch a funeral party pass toward the cremation ground",
            labelZh: "见丧队往火化地",
            effects: [
              { op: "codex", value: "cx-tanpiju", reason: "saw-the-burning-of-the-dead" },
              { op: "reputation", value: 1, scope: "band", id: "china", reason: "observed-the-local-rite" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-with-a-market-elder" },
            ],
          },
          {
            slug: "lacquer",
            labelEn: "Buy lacquerware from a Kinsay trader's stall",
            labelZh: "于行在商贩摊购漆器",
            needs: { coins: { min: 5500 } },
            effects: [
              { op: "coins", value: -5500, reason: "bought-lacquerware-from-kinsay-stock" },
              { op: "goods", id: "lacquerware", value: 1, reason: "bought-lacquerware-from-kinsay-stock" },
              { op: "reveal_map", value: "kinsay", reason: "traders-named-the-heaven-road" },
            ],
          },
        ],
      },
    ],
  },
];
