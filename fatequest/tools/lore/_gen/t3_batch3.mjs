export default [
  {
    id: "cail",
    band: "india",
    sceneBg: "monsoon-port",
    sites: [
      {
        letter: "a",
        titleEn: "The Horse Quay",
        titleZh: "马市码头",
        bodyEn:
          "You stand upon the quay where all the ships from the west make land — from Hormos and Kis, from Aden and all Arabia — their decks heavy with chargers and with other wares for sale. Grooms and brokers press close about the gangways, and the smell of salt, tar, and horseflesh hangs upon the air.",
        bodyZh:
          "你立于码头，凡自西来之船——自忽鲁谟斯、自Kis、自亚丁及全阿拉伯——皆于此泊岸，甲板载战马与别货待售。马夫与掮客挤在跳板旁，空气中尽是盐、沥青与马汗之气。",
        choices: [
          {
            slug: "watch_landing",
            labelEn: "Stand a day upon the quay and watch the horses come ashore",
            labelZh: "在码头立一日，看马匹上岸",
            effects: [
              { op: "days", value: 1, reason: "watched-the-horses-land" },
              { op: "codex", value: "cx-cail", reason: "noted-the-arabian-horse-trade" },
              { op: "reveal_map", value: "melibar", reason: "grooms-named-the-coastal-roads" },
            ],
          },
          {
            slug: "buy_charger",
            labelEn: "Buy an Arabian charger from the Hormos merchants",
            labelZh: "向忽鲁谟斯商人买一匹阿拉伯战马",
            needs: { coins: { min: 18000 } },
            effects: [
              { op: "coins", value: -18000, reason: "bought-an-arabian-charger" },
              { op: "goods", id: "arabian-horse", value: 1, reason: "bought-an-arabian-charger" },
              { op: "codex", value: "cx-cail", reason: "learned-the-horse-prices" },
            ],
          },
          {
            slug: "ask_routes",
            labelEn: "Ask the shipmasters where their vessels touch next",
            labelZh: "问船主下次泊在何处",
            effects: [
              { op: "reveal_map", value: "coilum", reason: "shipmasters-named-the-south-ports" },
              { op: "reveal_map", value: "samara", reason: "shipmasters-named-the-island-road" },
              { op: "codex", value: "cx-cail", reason: "heard-the-monsoon-lanes" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Ashar's Harbour Concourse",
        titleZh: "阿沙尔王海滨广场",
        bodyEn:
          "King Ashar, the eldest of the five brother-kings of Maabar, keeps great state upon the harbour concourse. He favours merchants and foreigners, and wears upon his person a great store of rich jewels; the crowds that gather for the horse-fairs bring immense business to his city.",
        bodyZh:
          "马八儿五兄弟王中最长者阿沙尔，于海滨广场仪仗极盛。彼优待商贾与外国人，身上佩珍宝极富；马市之人云集，城中生意因之极大。",
        choices: [
          {
            slug: "wait_audience",
            labelEn: "Wait two days upon the concourse in hope of seeing the King pass",
            labelZh: "在广场候二日，盼见国王仪仗",
            effects: [
              { op: "days", value: 2, reason: "waited-upon-the-harbour-concourse" },
              { op: "reputation", value: 1, scope: "city", id: "cail", reason: "showed-respect-to-ashar" },
              { op: "codex", value: "cx-cail", reason: "saw-ashars-harbour-state" },
            ],
          },
          {
            slug: "hear_brothers",
            labelEn: "Listen while the brokers speak of the five brother-kings",
            labelZh: "听掮客述五兄弟王之事",
            effects: [
              { op: "reveal_map", value: "melibar", reason: "brokers-named-maabar" },
              { op: "reveal_map", value: "coilum", reason: "brokers-named-the-pepper-coast" },
              { op: "codex", value: "cx-cail", reason: "learned-the-five-crowned-brothers" },
            ],
          },
          {
            slug: "buy_cotton",
            labelEn: "Buy cotton cloth in the harbour market",
            labelZh: "在海滨集市买棉布",
            needs: { coins: { min: 400 } },
            effects: [
              { op: "coins", value: -400, reason: "bought-cotton-cloth-at-cail" },
              { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-cloth-at-cail" },
              { op: "reputation", value: 1, scope: "band", id: "india", reason: "traded-at-the-harbour-fair" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "calatu",
    band: "india",
    sceneBg: "monsoon-port",
    sites: [
      {
        letter: "a",
        titleEn: "The Gulf Fortress",
        titleZh: "哈剌图湾要塞",
        bodyEn:
          "Calatu is a great city within the Gulf of Calatu, lying six hundred miles north-west of Dufar upon the sea-shore. The people are Saracens and are subject to Hormos; the haven is very large and good, and ships from India crowd the anchorage with spices and other merchandise.",
        bodyZh:
          "哈剌图乃海湾内大城，距佐法尔向西北约六百英里，临海。民为撒拉逊人，臣服忽鲁谟斯；港极大极好，印度船只满载香料与别货，锚地拥挤。",
        choices: [
          {
            slug: "walk_walls",
            labelEn: "Walk the fort walls and look out upon the gulf",
            labelZh: "沿城垣而行，俯瞰海湾",
            effects: [
              { op: "days", value: 1, reason: "walked-the-calatu-walls" },
              { op: "reveal_map", value: "ormus", reason: "saw-hormos-from-the-gulf" },
              { op: "codex", value: "cx-calatu", reason: "learned-the-gulf-of-calatu" },
            ],
          },
          {
            slug: "buy_pepper",
            labelEn: "Buy a sack of pepper from the Indian merchants",
            labelZh: "向印度商人买一袋胡椒",
            needs: { coins: { min: 12000 } },
            effects: [
              { op: "coins", value: -12000, reason: "bought-pepper-at-calatu" },
              { op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-calatu" },
              { op: "codex", value: "cx-calatu", reason: "noted-the-spice-distribution" },
            ],
          },
          {
            slug: "count_ships",
            labelEn: "Stand upon the mole and count the vessels at anchor",
            labelZh: "立于突堤，数锚泊之船",
            effects: [
              { op: "reveal_map", value: "dufar", reason: "pilots-named-dufar" },
              { op: "codex", value: "cx-calatu", reason: "counted-the-indian-shipping" },
              { op: "fate", id: "travel", value: 1, reason: "studied-the-harbour-traffic" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Melic's Retreat",
        titleZh: "Melic避战之所",
        bodyEn:
          "Whenever the Melic of Hormos is at war with some prince more potent than himself, he betakes himself to this city of Calatu, because it is very strong both from its position and its fortifications. They grow no corn here, but every merchant-vessel that comes brings some.",
        bodyZh:
          "凡忽鲁谟斯之Melic与更强之君开战，便退避此哈剌图城，盖其地势与城防皆极固。此地不产谷，凡来之商船皆携若干。",
        choices: [
          {
            slug: "hear_refuge",
            labelEn: "Hear how the Melic of Hormos uses this city as a refuge",
            labelZh: "听人述忽鲁谟斯Melic如何以此城为避所",
            effects: [
              { op: "codex", value: "cx-calatu", reason: "heard-of-the-melics-retreat" },
              { op: "reveal_map", value: "ormus", reason: "officers-named-hormos" },
              { op: "fate", id: "rapport", value: 1, reason: "gained-the-garrison-trust" },
            ],
          },
          {
            slug: "buy_dates",
            labelEn: "Buy dates brought in with the grain ships",
            labelZh: "向运粮之船买枣",
            needs: { coins: { min: 180 } },
            effects: [
              { op: "coins", value: -180, reason: "bought-dates-at-calatu" },
              { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-calatu" },
              { op: "codex", value: "cx-calatu", reason: "learned-how-calatu-is-fed" },
            ],
          },
          {
            slug: "ask_inland",
            labelEn: "Ask the caravan masters which inland roads leave from here",
            labelZh: "问驼队主人内陆道路何往",
            effects: [
              { op: "reveal_map", value: "camadi", reason: "caravan-masters-named-camadi" },
              { op: "reveal_map", value: "dufar", reason: "caravan-masters-named-dufar" },
              { op: "codex", value: "cx-calatu", reason: "mapped-the-inland-distribution" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "camadi",
    band: "west_asia",
    sceneBg: "desert-town",
    sites: [
      {
        letter: "a",
        titleEn: "The Ruined Plain City",
        titleZh: "平原废城",
        bodyEn:
          "After you have ridden down from the mountains two days, you find yourself in a vast plain, and at the beginning thereof the city of Camadi — formerly a great and noble place, but now of little consequence, for the Tartars in their incursions have several times ravaged it.",
        bodyZh:
          "自山中下行二日，至一大平原，平原起处有城名可马底——昔日曾为大而尊贵之地，如今已不足道，盖鞑靼屡次入侵，数度劫掠。",
        choices: [
          {
            slug: "walk_ruins",
            labelEn: "Walk among the broken walls and ask what the city once was",
            labelZh: "行于断垣间，问此城昔日何貌",
            effects: [
              { op: "days", value: 1, reason: "walked-the-ruins-of-camadi" },
              { op: "codex", value: "cx-camadi", reason: "heard-how-camadi-was-ravaged" },
              { op: "reveal_map", value: "kerman", reason: "elders-named-kerman" },
            ],
          },
          {
            slug: "buy_dates",
            labelEn: "Buy dates from the orchards that still cling to the plain",
            labelZh: "向仍存于平原的果园买枣",
            needs: { coins: { min: 120 } },
            effects: [
              { op: "coins", value: -120, reason: "bought-dates-on-the-plain" },
              { op: "goods", id: "dates", value: 1, reason: "bought-dates-on-the-plain" },
              { op: "codex", value: "cx-camadi", reason: "tasted-reobarles-fruit" },
            ],
          },
          {
            slug: "ask_raids",
            labelEn: "Listen while the caravan men speak of the Tartar incursions",
            labelZh: "听驼队人述鞑靼入侵之事",
            effects: [
              { op: "fate", id: "travel", value: 1, reason: "heeded-warnings-of-the-plain" },
              { op: "reveal_map", value: "cobinan", reason: "traders-named-cobinan" },
              { op: "codex", value: "cx-camadi", reason: "recorded-the-tartar-raids" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Hot Descent",
        titleZh: "炎热平原",
        bodyEn:
          "The plain is a very hot region, and the province you now enter is called Reobarles. Dates, pistachioes, and apples of Paradise grow here, with fruits not found in our cold countries; upon the descent you feel how far the city's former greatness has fallen.",
        bodyZh:
          "此平原极热，今入之省名曰Reobarles。土产有枣、开心果与天堂苹果，以及我冷国所无之果；自山而下，益觉此城昔日之盛已去。",
        choices: [
          {
            slug: "rest_shade",
            labelEn: "Rest a day in the shade of the date-palms",
            labelZh: "于枣树荫下歇一日",
            effects: [
              { op: "days", value: 1, reason: "rested-on-the-hot-plain" },
              { op: "fate", id: "rapport", value: 1, reason: "shared-water-with-caravaneers" },
              { op: "codex", value: "cx-camadi", reason: "noted-the-heat-of-reobarles" },
            ],
          },
          {
            slug: "ask_calatu",
            labelEn: "Ask which road leads down to the Gulf of Calatu",
            labelZh: "问何路下抵哈剌图湾",
            effects: [
              { op: "reveal_map", value: "calatu", reason: "guides-named-the-gulf-road" },
              { op: "reveal_map", value: "kerman", reason: "guides-named-the-mountain-road" },
              { op: "codex", value: "cx-camadi", reason: "learned-the-descent-to-the-sea" },
            ],
          },
          {
            slug: "buy_cotton",
            labelEn: "Buy cotton cloth from the roadside sellers",
            labelZh: "向道旁贩者买棉布",
            needs: { coins: { min: 350 } },
            effects: [
              { op: "coins", value: -350, reason: "bought-cotton-on-the-plain" },
              { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-on-the-plain" },
              { op: "reputation", value: 1, scope: "band", id: "west_asia", reason: "traded-on-the-descent" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "chamba",
    band: "maritime_asia",
    sceneBg: "spice-harbour",
    sites: [
      {
        letter: "a",
        titleEn: "The Elephant Tribute",
        titleZh: "象贡",
        bodyEn:
          "The King of Chamba pays a yearly tribute to the Great Kaan, which consists of elephants and nothing but elephants. It was settled in the year 1278, when the Kaan sent Baron Sagatu against this kingdom and the aged King sought peace by offering this tribute alone.",
        bodyZh:
          "占城之王每年向大汗纳贡，贡物唯象而已。此事定于基督纪元一二七八年：大汗遣男爵Sagatu攻此国，老王年迈，遂以独献象贡求和。",
        choices: [
          {
            slug: "hear_tribute",
            labelEn: "Hear the full tale of how the elephant tribute was settled",
            labelZh: "听人详述象贡何以定约",
            effects: [
              { op: "codex", value: "cx-chamba", reason: "learned-the-elephant-tribute" },
              { op: "reveal_map", value: "zayton", reason: "clerks-named-zayton" },
              { op: "fate", id: "rapport", value: 1, reason: "heard-the-kings-embassy" },
            ],
          },
          {
            slug: "watch_harbour",
            labelEn: "Watch a day upon the harbour while tribute goods are tallied",
            labelZh: "于港立一日，看贡物清点",
            effects: [
              { op: "days", value: 1, reason: "watched-the-tribute-harbour" },
              { op: "reveal_map", value: "pentam", reason: "pilots-named-pentam" },
              { op: "codex", value: "cx-chamba", reason: "noted-the-kaans-revenue" },
            ],
          },
          {
            slug: "buy_sandalwood",
            labelEn: "Buy sandalwood from the tribute quarter",
            labelZh: "于贡物区买旃檀",
            needs: { coins: { min: 900 } },
            effects: [
              { op: "coins", value: -900, reason: "bought-sandalwood-at-chamba" },
              { op: "goods", id: "sandalwood", value: 1, reason: "bought-sandalwood-at-chamba" },
              { op: "reputation", value: 1, scope: "band", id: "maritime_asia", reason: "traded-in-the-tribute-port" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Idolater Kingdom",
        titleZh: "偶像教王国",
        bodyEn:
          "Chamba is a very rich region lying west-south-west of Zayton, having a king of its own. The people are Idolaters, and the kingdom is wealthy with aloewood, spices, and the traffic of the southern seas.",
        bodyZh:
          "占城乃极富之境，在刺桐西南偏西，自有其王。民为偶像教徒，境内多沉香与香料，南海商货亦汇于此。",
        choices: [
          {
            slug: "visit_court",
            labelEn: "Wait two days upon the harbour to hear word of the King's court",
            labelZh: "于港候二日，闻王宫消息",
            effects: [
              { op: "days", value: 2, reason: "waited-at-chamba-court" },
              { op: "codex", value: "cx-chamba", reason: "learned-chambas-royal-state" },
              { op: "reputation", value: 1, scope: "city", id: "chamba", reason: "showed-respect-to-the-kingdom" },
            ],
          },
          {
            slug: "buy_pepper",
            labelEn: "Buy pepper from the spice merchants",
            labelZh: "向香料商买胡椒",
            needs: { coins: { min: 8000 } },
            effects: [
              { op: "coins", value: -8000, reason: "bought-pepper-at-chamba" },
              { op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-chamba" },
              { op: "codex", value: "cx-chamba", reason: "noted-chambas-spice-wealth" },
            ],
          },
          {
            slug: "ask_sea_road",
            labelEn: "Ask the mariners how many days' sail lie to Zayton and Fuzhou",
            labelZh: "问水手至刺桐、福州须几日航程",
            effects: [
              { op: "reveal_map", value: "zayton", reason: "mariners-named-zayton" },
              { op: "reveal_map", value: "fuju", reason: "mariners-named-fuju" },
              { op: "codex", value: "cx-chamba", reason: "learned-the-west-south-west-road" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "esher",
    band: "india",
    sceneBg: "monsoon-port",
    sites: [
      {
        letter: "a",
        titleEn: "The Haven of the Soldan",
        titleZh: "Soldan属港",
        bodyEn:
          "Esher is a great city lying four hundred miles north-west of the Port of Aden. It has a king who is subject to the Soldan of Aden, and a very good haven where many ships from India come with various cargoes; from hence they export many good chargers to India.",
        bodyZh:
          "呵舍儿乃大城，在亚丁港西北约四百里。有一王，臣服亚丁之Soldan；港甚佳，印度许多船只载种种货物而来，自此亦输出许多良马至印度。",
        choices: [
          {
            slug: "walk_harbour",
            labelEn: "Walk the haven and note how the Soldan's customs are kept",
            labelZh: "行于港内，看Soldan关防如何",
            effects: [
              { op: "days", value: 1, reason: "walked-the-haven-of-esher" },
              { op: "reveal_map", value: "aden", reason: "officers-named-aden" },
              { op: "codex", value: "cx-esher", reason: "learned-the-soldans-haven" },
            ],
          },
          {
            slug: "watch_ships",
            labelEn: "Stand upon the mole and watch the Indian ships unload",
            labelZh: "立于突堤，看印度船只卸货",
            effects: [
              { op: "reveal_map", value: "dufar", reason: "pilots-named-dufar" },
              { op: "codex", value: "cx-esher", reason: "counted-the-indian-cargoes" },
              { op: "fate", id: "travel", value: 1, reason: "studied-the-coastal-trade" },
            ],
          },
          {
            slug: "buy_horse",
            labelEn: "Buy an Arabian horse from the export pens",
            labelZh: "向出口马厩买一匹阿拉伯马",
            needs: { coins: { min: 16000 } },
            effects: [
              { op: "coins", value: -16000, reason: "bought-a-horse-at-esher" },
              { op: "goods", id: "arabian-horse", value: 1, reason: "bought-a-horse-at-esher" },
              { op: "codex", value: "cx-esher", reason: "noted-the-charger-export" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Frankincense Coast",
        titleZh: "乳香海岸",
        bodyEn:
          "A great deal of white incense grows in this country, and brings in a great revenue to the Prince; for no one dares sell it to any one else. The Prince takes it from the people at ten livres of gold for the hundredweight, and sells it to the merchants at sixty. Dates also grow very abundantly here.",
        bodyZh:
          "境内白乳香极多，为君王大宗岁入；无人敢私售。君王以十金里弗每担取于民，以六十里弗售与商人。枣亦极丰。",
        choices: [
          {
            slug: "buy_frankincense",
            labelEn: "Buy frankincense at the Prince's price in the harbour market",
            labelZh: "于港市按王价买乳香",
            needs: { coins: { min: 2400 } },
            effects: [
              { op: "coins", value: -2400, reason: "bought-frankincense-at-esher" },
              { op: "goods", id: "frankincense", value: 1, reason: "bought-frankincense-at-esher" },
              { op: "codex", value: "cx-esher", reason: "learned-the-incense-monopoly" },
            ],
          },
          {
            slug: "buy_dates",
            labelEn: "Buy dates from the coastal orchards",
            labelZh: "向海岸果园买枣",
            needs: { coins: { min: 150 } },
            effects: [
              { op: "coins", value: -150, reason: "bought-dates-at-esher" },
              { op: "goods", id: "dates", value: 1, reason: "bought-dates-at-esher" },
              { op: "reputation", value: 1, scope: "band", id: "india", reason: "traded-on-the-incense-coast" },
            ],
          },
          {
            slug: "ask_axuma",
            labelEn: "Ask the Saracen merchants where the coast trade runs southward",
            labelZh: "问撒拉逊商人南海商路何往",
            effects: [
              { op: "reveal_map", value: "axuma", reason: "merchants-named-axuma" },
              { op: "reveal_map", value: "aden", reason: "merchants-named-aden" },
              { op: "codex", value: "cx-esher", reason: "mapped-the-frankincense-roads" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "keshimur",
    band: "central_asia",
    sceneBg: "desert-town",
    sites: [
      {
        letter: "a",
        titleEn: "Speaking Idols",
        titleZh: "能言之像",
        bodyEn:
          "The people of Keshimur have an astonishing acquaintance with the enchantments of sorcery; insomuch that they make their idols to speak. You hear this told soberly in the market, as one recounts a marvel seen with one's own eyes — not as mockery, but as wonder.",
        bodyZh:
          "怯失迷儿之民于幻术有惊人造诣，能使偶像开口说话。市中人平述此事，如亲见奇事一般——非嘲弄，乃称异。",
        choices: [
          {
            slug: "listen_tales",
            labelEn: "Listen a day while the elders tell of the speaking idols",
            labelZh: "听长者述能言之像，一日",
            effects: [
              { op: "days", value: 1, reason: "listened-to-the-speaking-idols" },
              { op: "codex", value: "cx-keshimur", reason: "recorded-the-enchantment-lore" },
              { op: "fate", id: "rapport", value: 1, reason: "heard-the-marvel-soberly" },
            ],
          },
          {
            slug: "watch_shrine",
            labelEn: "Stand at the shrine door and watch without entering",
            labelZh: "立于祠门外观看，不入内",
            effects: [
              { op: "codex", value: "cx-keshimur", reason: "observed-the-idol-shrine" },
              { op: "reveal_map", value: "badashan", reason: "pilgrims-named-badashan" },
              { op: "reputation", value: 1, scope: "band", id: "central_asia", reason: "showed-respect-at-the-shrine" },
            ],
          },
          {
            slug: "ask_cabul",
            labelEn: "Ask which passes lead east toward Cabul",
            labelZh: "问何隘东通迦布尔",
            effects: [
              { op: "reveal_map", value: "cabul", reason: "guides-named-cabul" },
              { op: "reveal_map", value: "badashan", reason: "guides-named-badashan" },
              { op: "codex", value: "cx-keshimur", reason: "noted-keshimurs-place-in-idolatry" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "Mountain Tongue and Weather-Lore",
        titleZh: "山语与天气术",
        bodyEn:
          "They can also by their sorceries bring on changes of weather and produce darkness, or so the mountain folk relate in their own tongue. The clime is finely tempered, being neither very hot nor very cold; the women, as brunettes, are held very beautiful.",
        bodyZh:
          "彼等亦能以术令天气变易、天色昏暗，山民以本族之语如此相传。此地气候中和，不甚热亦不甚寒；女子虽褐，却以为甚美。",
        choices: [
          {
            slug: "hire_guide",
            labelEn: "Hire a mountain guide to teach you a little of their tongue",
            labelZh: "雇山向导，学几句本族之语",
            needs: { coins: { min: 600 } },
            effects: [
              { op: "coins", value: -600, reason: "hired-a-keshimur-guide" },
              { op: "days", value: 7, reason: "studied-the-mountain-tongue" },
              { op: "reveal_map", value: "delli", reason: "guide-named-delli" },
              { op: "codex", value: "cx-keshimur", reason: "learned-the-weather-sorcery-tales" },
            ],
          },
          {
            slug: "rest_valley",
            labelEn: "Rest a week in the valley before the high passes",
            labelZh: "于山谷歇七日，再上高隘",
            effects: [
              { op: "days", value: 7, reason: "rested-in-keshimur-valley" },
              { op: "fate", id: "rapport", value: 2, reason: "a-week-in-the-tempered-clime" },
              { op: "codex", value: "cx-keshimur", reason: "noted-the-valleys-temper" },
            ],
          },
          {
            slug: "buy_turquoise",
            labelEn: "Buy turquoise from the mountain traders",
            labelZh: "向山中商人买绿松石",
            needs: { coins: { min: 1200 } },
            effects: [
              { op: "coins", value: -1200, reason: "bought-turquoise-at-keshimur" },
              { op: "goods", id: "turquoise", value: 1, reason: "bought-turquoise-at-keshimur" },
              { op: "reputation", value: 1, scope: "band", id: "central_asia", reason: "traded-in-the-mountain-market" },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "taican",
    band: "central_asia",
    sceneBg: "desert-town",
    sites: [
      {
        letter: "a",
        titleEn: "The Corn Market",
        titleZh: "谷物大市",
        bodyEn:
          "After twelve days' journey you come to a fortified place called Taican, where there is a great corn market. It is a fine place, and caravans from every quarter stop here to buy grain before the high passes and the salt mountains to the south.",
        bodyZh:
          "十二日路程之后，至一设防之地名塔里寒，有大谷物市。此乃好地，四方驼队皆停此购粮，再向南行，便是高隘与盐山。",
        choices: [
          {
            slug: "walk_market",
            labelEn: "Walk the corn market and hear what the caravans pay",
            labelZh: "行于谷物市，听驼队出价",
            effects: [
              { op: "days", value: 1, reason: "walked-the-corn-market" },
              { op: "codex", value: "cx-taican", reason: "noted-the-grain-prices" },
              { op: "reveal_map", value: "badashan", reason: "merchants-named-badashan" },
            ],
          },
          {
            slug: "buy_cotton",
            labelEn: "Buy cotton cloth for the road ahead",
            labelZh: "买棉布备前路",
            needs: { coins: { min: 320 } },
            effects: [
              { op: "coins", value: -320, reason: "bought-cotton-at-taican" },
              { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-cotton-at-taican" },
              { op: "reputation", value: 1, scope: "band", id: "central_asia", reason: "provisioned-at-the-corn-market" },
            ],
          },
          {
            slug: "ask_balc",
            labelEn: "Ask the caravan masters which road leads toward Balc",
            labelZh: "问驼队主人何路通拔力",
            effects: [
              { op: "reveal_map", value: "balc", reason: "caravan-masters-named-balc" },
              { op: "reveal_map", value: "badashan", reason: "caravan-masters-named-badashan" },
              { op: "codex", value: "cx-taican", reason: "mapped-the-grain-roads" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Mountains of Salt",
        titleZh: "盐山",
        bodyEn:
          "The mountains that you see towards the south are all composed of salt. People from all the countries round, to some thirty days' journey, come to fetch this salt, which is the best in the world, and is so hard that it can only be broken with iron picks.",
        bodyZh:
          "南望群山皆由盐构成。方圆约三十日路程的各国人来取此盐——天下最好，硬到须用铁镐才能凿开。",
        choices: [
          {
            slug: "buy_salt",
            labelEn: "Buy a block of Taican salt for the high passes",
            labelZh: "买塔里寒盐一块，备高隘之用",
            needs: { coins: { min: 200 } },
            effects: [
              { op: "coins", value: -200, reason: "bought-taican-salt" },
              { op: "goods", id: "salt", value: 1, reason: "bought-taican-salt" },
              { op: "codex", value: "cx-taican", reason: "learned-the-mountains-of-salt" },
            ],
          },
          {
            slug: "watch_miners",
            labelEn: "Watch two days while the miners break the hard salt",
            labelZh: "看矿工凿硬盐，二日",
            effects: [
              { op: "days", value: 2, reason: "watched-the-salt-miners" },
              { op: "codex", value: "cx-taican", reason: "saw-how-the-salt-is-broken" },
              { op: "fate", id: "travel", value: 1, reason: "noted-the-thirty-day-salt-road" },
            ],
          },
          {
            slug: "ask_sapurgan",
            labelEn: "Ask which caravan road runs on toward Sapurgan",
            labelZh: "问何路驼队续往沙吾甘",
            effects: [
              { op: "reveal_map", value: "sapurgan", reason: "miners-named-sapurgan" },
              { op: "reveal_map", value: "balc", reason: "miners-named-balc" },
              { op: "codex", value: "cx-taican", reason: "mapped-the-salt-caravan-roads" },
            ],
          },
        ],
      },
    ],
  },
];
