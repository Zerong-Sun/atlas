export default [
  {
    id: "aden",
    band: "india",
    sceneBg: "monsoon-port",
    sites: [
      {
        letter: "a",
        titleEn: "The Pepper Lighters and the Camel Road",
        titleZh: "胡椒转运与骆驼道",
        bodyEn:
          "You stand upon the quay where the great ships of India discharge their cargoes into lighter craft. " +
          "Men say the pepper and spicery must pass seven days by sea to a lesser haven, then thirty days by camel " +
          "to the river of Alexandria, whence it descends to that city. No road of equal convenience serves the merchants of Egypt. " +
          "The bales are weighed, marked, and stacked in sheds that smell of clove and ginger.",
        bodyZh:
          "你立于大船卸货之码头，印度舶来之物由此转入小船。人言胡椒诸香料须先七日水程至别港，再负于骆驼陆行三十日，抵亚历山大里亚之河，顺流而下至彼城；撒拉逊商人取胡椒，无他途如此便。货包称量、标号，堆于棚中，满室丁香与姜之气。",
        choices: [
          {
            slug: "walk",
            labelEn: "Walk the sheds and watch the lighters load",
            labelZh: "沿棚而行，看小船装货",
            effects: [
              { op: "days", value: 1, reason: "watched-the-pepper-lighters" },
              { op: "codex", value: "cx-aden", reason: "noted-the-camel-road-to-alexandria" },
            ],
          },
          {
            slug: "buy-pepper",
            labelEn: "Buy a sack of Malabar pepper for the onward road",
            labelZh: "购麻栏胡椒一袋备行",
            needs: { coins: { min: 900 } },
            effects: [
              { op: "coins", value: -900, reason: "bought-malabar-pepper" },
              { op: "goods", id: "pepper", value: 1, reason: "bought-malabar-pepper" },
              { op: "codex", value: "cx-aden", reason: "learned-how-pepper-reaches-egypt" },
            ],
          },
          {
            slug: "ask-routes",
            labelEn: "Ask the camel-masters which roads leave the harbour",
            labelZh: "问驼队主哪路出港",
            effects: [
              { op: "reveal_map", value: "dufar", reason: "camel-masters-named-the-south-road" },
              { op: "reveal_map", value: "cambaet", reason: "merchants-named-the-indian-coast" },
              { op: "fate", id: "travel", value: 1, reason: "heard-the-stages-of-the-camel-road" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Soldan's Mosque and the Harbour Customs",
        titleZh: "苏丹港寺与海关",
        bodyEn:
          "Above the harbour rises the Soldan's mosque, where the Saracens of Aden gather at the hours of prayer. " +
          "Below it, the customs clerks take their due on every bale that crosses the mole — a tenth on pepper, a fee on cloth and dates. " +
          "The harbour-master keeps a register in Arabic script; no ship departs without his seal. " +
          "You mark how the muezzin's call and the clerks' abacus share the same wind off the sea.",
        bodyZh:
          "港上立苏丹之寺，亚丁撒拉逊人按时聚礼。其下海关吏于每一过堤之货取课——胡椒什一，布帛与枣亦征。港长以阿拉伯文书簿册，无船无印可发。你见宣礼之声与吏人算盘，共受海风。",
        choices: [
          {
            slug: "observe",
            labelEn: "Stand aside and observe the customs at the mole",
            labelZh: "立于堤旁观海关",
            effects: [
              { op: "days", value: 1, reason: "watched-the-harbour-customs" },
              { op: "codex", value: "cx-aden", reason: "noted-the-soldans-port-dues" },
              { op: "reputation", value: 1, scope: "band", id: "india", reason: "respected-the-harbour-order" },
            ],
          },
          {
            slug: "pay-frankincense",
            labelEn: "Pay the harbour fee and buy frankincense from a Somali trader",
            labelZh: "纳港税，向索马里商人购乳香",
            needs: { coins: { min: 350 } },
            effects: [
              { op: "coins", value: -350, reason: "paid-harbour-fee-and-bought-frankincense" },
              { op: "goods", id: "frankincense", value: 1, reason: "bought-frankincense-at-the-mole" },
              { op: "reveal_map", value: "esher", reason: "somali-trader-named-the-red-sea-road" },
            ],
          },
          {
            slug: "listen-prayer",
            labelEn: "Listen at the mosque door as the Soldan's men pray",
            labelZh: "于寺门侧耳听礼",
            effects: [
              { op: "codex", value: "cx-aden", reason: "heard-prayer-at-the-soldans-mosque" },
              { op: "fate", id: "rapport", value: 1, reason: "stood-quiet-at-the-harbour-mosque" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "kerman",
    band: "west_asia",
    sceneBg: "desert-town",
    sites: [
      {
        letter: "a",
        titleEn: "The Turquoise Mines and the Harness-Makers",
        titleZh: "绿松石矿与鞍辔匠坊",
        bodyEn:
          "You ride out to the hills where men quarry turquoise from the living rock — stones of sky-blue and green " +
          "that the merchants of Persia prize above silver. In the town below, smiths work steel and Ondanique ore " +
          "into saddles, bridles, spurs, swords, bows, and quivers after the Kerman fashion. " +
          "The forges burn day and night, and the clang of hammer on anvil fills every lane.",
        bodyZh:
          "你出城至山丘，见人于活石中采绿松石——天青与碧色，波斯商人视逾白银。城下铁匠以钢与 Ondanique 矿锻鞍、辔、距、剑、弓、箭筒，皆依克尔曼式。炉火昼夜不熄，锤击之声盈巷。",
        choices: [
          {
            slug: "watch-forge",
            labelEn: "Watch the smiths at their forges",
            labelZh: "观铁匠锻打",
            effects: [
              { op: "days", value: 1, reason: "watched-the-kerman-forges" },
              { op: "codex", value: "cx-kerman", reason: "noted-the-steel-and-ondanique-craft" },
            ],
          },
          {
            slug: "buy-turquoise",
            labelEn: "Buy a rough turquoise from a mine broker",
            labelZh: "向矿经纪购绿松石一块",
            needs: { coins: { min: 650 } },
            effects: [
              { op: "coins", value: -650, reason: "bought-rough-turquoise" },
              { op: "goods", id: "turquoise", value: 1, reason: "bought-rough-turquoise" },
              { op: "codex", value: "cx-kerman", reason: "learned-where-turquoise-is-quarried" },
            ],
          },
          {
            slug: "ask-roads",
            labelEn: "Ask the caravan masters which roads cross the desert",
            labelZh: "问商队主沙漠何路可通",
            effects: [
              { op: "reveal_map", value: "yasdi", reason: "caravan-masters-named-the-north-road" },
              { op: "reveal_map", value: "ormus", reason: "merchants-named-the-gulf-road" },
              { op: "reputation", value: 1, scope: "band", id: "west_asia", reason: "spoke-with-the-desert-masters" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Embroiderers and the Mountain Falcons",
        titleZh: "闺绣与山中鹰",
        bodyEn:
          "In the women's quarters you see fine ladies and their daughters at the embroidery frame, stitching birds, beasts, trees, and flowers in coloured silks. " +
          "The canopies, cushions, and coverlets they make are marvels of needlework, sought by nobles throughout Persia. " +
          "Above the city, falconers train the hunting birds of Kerman — the best hawks in the world, men say, bred on the high crags. " +
          "You hear the bells upon the jesses and the whistle of the trainers on the wind.",
        bodyZh:
          "于女眷所内，见贵妇与女儿坐绣架，以各色丝绣鸟兽树木花卉；所制帷幔、垫、衾，精妙惊人，波斯贵人争求。城上鹰匠驯克尔曼猎鹰——人谓天下最佳，生于高崖。你闻脚铃与驯鹰者哨声随风。",
        choices: [
          {
            slug: "browse",
            labelEn: "Browse the embroiderers' stalls in the covered lane",
            labelZh: "于覆道观绣品",
            effects: [
              { op: "days", value: 1, reason: "browsed-the-embroiderers-lane" },
              { op: "codex", value: "cx-kerman", reason: "saw-the-silk-embroidery-of-kerman" },
            ],
          },
          {
            slug: "buy-silk",
            labelEn: "Buy a length of embroidered silk for a gift",
            labelZh: "购绣丝一段为礼",
            needs: { coins: { min: 450 } },
            effects: [
              { op: "coins", value: -450, reason: "bought-embroidered-silk" },
              { op: "goods", id: "silk", value: 1, reason: "bought-embroidered-silk" },
              { op: "fate", id: "rapport", value: 1, reason: "brought-a-kerman-gift" },
            ],
          },
          {
            slug: "visit-mews",
            labelEn: "Climb to the mews and ask the price of a trained falcon",
            labelZh: "登鹰房问驯鹰之价",
            needs: { coins: { min: 3200 } },
            effects: [
              { op: "coins", value: -3200, reason: "bought-a-kerman-falcon" },
              { op: "goods", id: "hunting-falcon", value: 1, reason: "bought-a-kerman-falcon" },
              { op: "reveal_map", value: "camadi", reason: "falconers-named-the-eastern-pass" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "camul",
    band: "central_asia",
    sceneBg: "oasis-town",
    sites: [
      {
        letter: "a",
        titleEn: "The Melon Market of the Oasis",
        titleZh: "绿洲瓜市",
        bodyEn:
          "Camul lies between two deserts, and the first green you see after days of sand is its melon fields. " +
          "The bāzār sells melons so sweet that caravan masters load them by the cartload for the road to Sachiu and beyond. " +
          "Farmers slice one open for you to taste — the flesh is honey-coloured and cool as well water. " +
          "You mark how every trader praises these fruits above all others on the Silk Road.",
        bodyZh:
          "哈密力介于两沙漠之间，经数日黄沙后初见之绿即其瓜田。bāzār（集市）所售之瓜至甜，商队整车装载，运往沙州及更东。农人切开一枚与你尝——瓤色如蜜，凉若井泉。凡贾人皆言此瓜胜路上诸果。",
        choices: [
          {
            slug: "walk",
            labelEn: "Walk the melon rows and taste what the farmers offer",
            labelZh: "行于瓜垄，尝农人所献",
            effects: [
              { op: "days", value: 1, reason: "tasted-the-melons-of-camul" },
              { op: "codex", value: "cx-camul", reason: "noted-the-sweetest-melons-of-the-road" },
            ],
          },
          {
            slug: "buy-melons",
            labelEn: "Buy dried melon spirals for the desert crossing",
            labelZh: "购瓜干螺旋备沙漠",
            needs: { coins: { min: 60 } },
            effects: [
              { op: "coins", value: -60, reason: "bought-dried-melon-spirals" },
              { op: "goods", id: "melons", value: 1, reason: "bought-dried-melon-spirals" },
              { op: "fate", id: "travel", value: 1, reason: "provisioned-with-camul-melons" },
            ],
          },
          {
            slug: "ask-traders",
            labelEn: "Ask the melon traders where their caravans go",
            labelZh: "问瓜商驼队何往",
            effects: [
              { op: "reveal_map", value: "lop", reason: "traders-named-the-western-desert-road" },
              { op: "reveal_map", value: "sachiu", reason: "caravan-masters-named-the-eastern-oasis" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Idol Temples and the Elders' Tale",
        titleZh: "偶像寺与老人旧话",
        bodyEn:
          "The people of Camul are idolaters, and their temples stand among the mulberry groves at the edge of the oasis. " +
          "An old man at the temple gate tells you of a custom their fathers kept — a hospitality the Great Kaan forbade long ago, " +
          "and which no household dares practise now. The elders speak of it only as a tale of former days. " +
          "Incense smoke rises from the shrines, and painted gods look down upon the courtyard in silence.",
        bodyZh:
          "哈密力之民奉偶像，寺宇立于绿洲边桑林。一老人于寺门告汝：昔有待客之俗，大汗久禁，今无人家敢行；长老但述为往事。祠中香烟升，彩绘神像默视庭中。",
        choices: [
          {
            slug: "listen",
            labelEn: "Sit with the elders and hear their account of the old custom",
            labelZh: "与长老同坐，听其述旧俗",
            effects: [
              { op: "days", value: 1, reason: "heard-the-elders-tale-of-camul" },
              { op: "codex", value: "cx-camul", reason: "learned-what-the-great-kaan-forbade" },
              { op: "fate", id: "rapport", value: 1, reason: "sat-with-the-temple-elders" },
            ],
          },
          {
            slug: "observe-rite",
            labelEn: "Observe the idol rites from the courtyard wall",
            labelZh: "于庭墙外观偶像礼",
            effects: [
              { op: "codex", value: "cx-camul", reason: "watched-the-idol-rites-of-camul" },
              { op: "reputation", value: 1, scope: "band", id: "central_asia", reason: "observed-without-disturbance" },
            ],
          },
          {
            slug: "ask-east",
            labelEn: "Ask a monk which road leads toward the eastern desert",
            labelZh: "问僧人何路通东漠",
            effects: [
              { op: "reveal_map", value: "etzina", reason: "monk-named-the-road-to-etzina" },
              { op: "days", value: 1, reason: "questioned-the-temple-monks" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "badashan",
    band: "central_asia",
    sceneBg: "caravan-city",
    sites: [
      {
        letter: "a",
        titleEn: "The Lapis and Balas Ruby Trade",
        titleZh: "青金石与巴剌斯红宝石之市",
        bodyEn:
          "You climb to the highland bāzār where rough lapis lazuli and balas rubies change hands under the king's seal. " +
          "The stones are dug in great caves among the mountains — men say only the mountain of Syghinan yields the rubies, " +
          "and that none may carry them beyond the kingdom on pain of forfeiture. " +
          "Brokers weigh each block on brass scales and murmur prices in a tongue you scarcely follow.",
        bodyZh:
          "你登高原 bāzār（集市），见粗青金石与巴剌斯红宝石于王印下易手。石采于山间大穴——人言唯 SYGHINAN 山出红宝石，携石出国者货命皆没。经纪以铜秤称块，以难辨之语低报价。",
        choices: [
          {
            slug: "walk",
            labelEn: "Walk among the stone brokers and listen to their bargaining",
            labelZh: "行于石商间，听其议价",
            effects: [
              { op: "days", value: 1, reason: "walked-the-highland-stone-market" },
              { op: "codex", value: "cx-badashan", reason: "noted-the-lapis-and-ruby-trade" },
            ],
          },
          {
            slug: "buy-lapis",
            labelEn: "Buy a block of raw lapis lazuli",
            labelZh: "购青金石原块一方",
            needs: { coins: { min: 850 } },
            effects: [
              { op: "coins", value: -850, reason: "bought-raw-lapis-lazuli" },
              { op: "goods", id: "lapis", value: 1, reason: "bought-raw-lapis-lazuli" },
              { op: "reveal_map", value: "balc", reason: "brokers-named-the-road-to-bactra" },
            ],
          },
          {
            slug: "ask-mines",
            labelEn: "Ask where the ruby mines lie in the mountains",
            labelZh: "问红宝石矿在何山",
            effects: [
              { op: "reveal_map", value: "taican", reason: "miners-named-the-eastern-ridge" },
              { op: "reveal_map", value: "keshimur", reason: "brokers-named-the-northern-pass" },
              { op: "fate", id: "travel", value: 1, reason: "learned-the-mountain-roads" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Royal Lineage and the Mountain Tongue",
        titleZh: "王族世系与山中语",
        bodyEn:
          "In the audience hall of Badashan you hear how every prince of the royal blood claims descent from Alexander and the daughter of Darius, Lord of Persia. " +
          "They call themselves Zulcarniaim in the Saracen tongue — that is to say, Alexander — out of reverence for the great conqueror. " +
          "The common folk speak a mountain tongue unlike any Arabic or Persian you have heard on the plains. " +
          "A court scribe writes your name in their script and smiles at your puzzlement.",
        bodyZh:
          "于巴达哈伤朝堂，闻王室皆称系亚历山大王与波斯主大流士之女所出；撒拉逊语中自号 ZULCARNIAIN，即亚历山大，以敬其人。庶民所言山中语，异于平原所闻阿拉伯语与波斯语。廷吏以彼邦文字书汝名，见你困惑而笑。",
        choices: [
          {
            slug: "listen",
            labelEn: "Listen as the court herald recites the royal genealogy",
            labelZh: "听廷臣诵王族世系",
            effects: [
              { op: "days", value: 1, reason: "heard-the-royal-genealogy" },
              { op: "codex", value: "cx-badashan", reason: "noted-the-line-of-alexander-and-darius" },
            ],
          },
          {
            slug: "learn-tongue",
            labelEn: "Pay a scribe to teach you a few words of the mountain tongue",
            labelZh: "付金请书吏教山中语数言",
            needs: { coins: { min: 200 } },
            effects: [
              { op: "coins", value: -200, reason: "paid-a-mountain-scribe" },
              { op: "reputation", value: 2, scope: "band", id: "central_asia", reason: "learned-the-mountain-tongue" },
              { op: "fate", id: "rapport", value: 1, reason: "spoke-a-foreign-tongue-with-respect" },
            ],
          },
          {
            slug: "buy-ruby",
            labelEn: "Buy a small balas ruby from a licensed broker",
            labelZh: "向有照经纪购巴剌斯红宝石一枚",
            needs: { coins: { min: 2200 } },
            effects: [
              { op: "coins", value: -2200, reason: "bought-a-balas-ruby" },
              { op: "goods", id: "balas-ruby", value: 1, reason: "bought-a-balas-ruby" },
              { op: "codex", value: "cx-badashan", reason: "held-a-stone-from-syghinan" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tenduc",
    band: "steppe",
    sceneBg: "steppe-camp",
    sites: [
      {
        letter: "a",
        titleEn: "The Nestorian Church and Prester John's Line",
        titleZh: "景教寺与祭司王约翰之裔",
        bodyEn:
          "Tenduc is governed by Christians of the Nestorian faith, and its king George claims descent from Prester John, " +
          "whom the Great Kaan confirmed in this province though his realm is less than the priest-king once held. " +
          "You enter the church where the cross stands beside tablets in Syriac script, and the priests tell you " +
          "how the kings of this line have long taken the Kaan's daughters to wife — a custom older than any living man remembers.",
        bodyZh:
          "天德军政在景教基督徒之手，其王 George 称系祭司王约翰之裔，大汗册封领此省，然其地不及约翰昔日之半。你入寺，见十字架与叙利亚文碑并列；祭司告汝：此系诸王久娶大汗之女，为习已久。",
        choices: [
          {
            slug: "attend",
            labelEn: "Attend the Nestorian service and listen to the Syriac psalms",
            labelZh: "赴景教礼拜，听叙利亚语圣歌",
            effects: [
              { op: "days", value: 1, reason: "attended-the-nestorian-service" },
              { op: "codex", value: "cx-tenduc", reason: "noted-prester-johns-line-under-the-kaan" },
            ],
          },
          {
            slug: "ask-cambaluc",
            labelEn: "Ask the priests what road leads to the Great Kaan's city",
            labelZh: "问祭司何路通大汗之城",
            effects: [
              { op: "reveal_map", value: "cambaluc", reason: "priests-named-the-road-to-khanbaliq" },
              { op: "reveal_map", value: "cacanfu", reason: "monks-named-the-southern-post-road" },
              { op: "fate", id: "travel", value: 1, reason: "learned-the-yam-road-eastward" },
            ],
          },
          {
            slug: "offer",
            labelEn: "Leave a coin offering at the church door",
            labelZh: "于寺门献银钱",
            needs: { coins: { min: 120 } },
            effects: [
              { op: "coins", value: -120, reason: "offered-at-the-nestorian-church" },
              { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "honoured-the-nestorian-shrine" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The Mixed Market of Three Faiths",
        titleZh: "三教杂处之市",
        bodyEn:
          "The market of Tenduc brings together Christians, idolaters, and Saracens who worship Mahommet — " +
          "all under the eye of the Kaan's darughachi, who takes his tenth and keeps the peace. " +
          "Camel-hair cloth of many colours hangs beside blocks of azure stone and sacks of grain from the pasture lands. " +
          "You hear three tongues in a single alley, and no quarrel breaks out before the overseer's staff.",
        bodyZh:
          "天德 bāzār（集市）集基督徒、偶像教徒与礼拜 Mahommet 之撒拉逊人——皆在大汗所置 darughachi（监守官）眼下，取其什一，维持秩序。各色驼绒与石青块、牧地粮袋并陈。一巷闻三语，监吏杖下无争。",
        choices: [
          {
            slug: "walk",
            labelEn: "Walk the market and listen in three tongues",
            labelZh: "入市，三语侧耳",
            effects: [
              { op: "days", value: 1, reason: "walked-the-mixed-market-of-tenduc" },
              { op: "codex", value: "cx-tenduc", reason: "noted-the-three-faiths-of-tenduc" },
            ],
          },
          {
            slug: "buy-cloth",
            labelEn: "Buy a roll of coloured cotton cloth from a Nestorian weaver",
            labelZh: "向景教织工购色棉布一匹",
            needs: { coins: { min: 280 } },
            effects: [
              { op: "coins", value: -280, reason: "bought-coloured-cotton-cloth" },
              { op: "goods", id: "cotton-cloth", value: 1, reason: "bought-coloured-cotton-cloth" },
              { op: "fate", id: "rapport", value: 1, reason: "traded-with-the-nestorian-weavers" },
            ],
          },
          {
            slug: "ask-north",
            labelEn: "Ask the Saracen merchants which road leads north to the steppe",
            labelZh: "问撒拉逊商人何路北入草原",
            effects: [
              { op: "reveal_map", value: "egrigaia", reason: "merchants-named-the-northern-steppe-road" },
              { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "spoke-with-all-three-peoples" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "melibar",
    band: "india",
    sceneBg: "spice-harbour",
    sites: [
      {
        letter: "a",
        titleEn: "The Pepper Coast and the Corsair Watch",
        titleZh: "胡椒海岸与海盗瞭望",
        bodyEn:
          "Melibar faces west upon the sea, a great kingdom that pays tribute to no man. " +
          "From this coast and from Gozurat, men say, more than a hundred corsair ships put out each summer, " +
          "sailing in squadrons that spread across a hundred miles of water so no merchant vessel may pass unseen. " +
          "You stand on the quay where pepper bales are loaded under the watch of men who scan the horizon for sail.",
        bodyZh:
          "没来国西向滨海，大国也，不纳贡于任何人。人言自没来及邻近 Gozurat，每岁出海海盗船逾百，结队散开，覆海面约百里，商舶难逃。你立于码头，见胡椒包在瞭望者注视下装船。",
        choices: [
          {
            slug: "watch",
            labelEn: "Watch the harbour and ask how the merchants avoid the corsairs",
            labelZh: "观港，问贾人如何避海盗",
            effects: [
              { op: "days", value: 1, reason: "watched-the-corsair-coast" },
              { op: "codex", value: "cx-melibar", reason: "noted-the-pepper-coast-of-melibar" },
            ],
          },
          {
            slug: "buy-pepper",
            labelEn: "Buy Malabar pepper while the harbour watch holds",
            labelZh: "趁港警在，购麻栏胡椒",
            needs: { coins: { min: 1100 } },
            effects: [
              { op: "coins", value: -1100, reason: "bought-pepper-at-melibar" },
              { op: "goods", id: "pepper", value: 1, reason: "bought-pepper-at-melibar" },
              { op: "reveal_map", value: "cail", reason: "merchants-named-the-northern-haven" },
            ],
          },
          {
            slug: "ask-south",
            labelEn: "Ask the pilots which ports lie along the pepper coast",
            labelZh: "问引水人胡椒海岸何港",
            effects: [
              { op: "reveal_map", value: "coilum", reason: "pilots-named-the-southern-port" },
              { op: "reveal_map", value: "maabar", reason: "sailors-named-the-pepper-road" },
              { op: "fate", id: "travel", value: 1, reason: "learned-the-corsair-patrol-lines" },
            ],
          },
        ],
      },
      {
        letter: "b",
        titleEn: "The North Star and the Idol Rites",
        titleZh: "北辰高出水面与偶像之礼",
        bodyEn:
          "At night upon the shore you mark the North Star standing two cubits above the water — higher here than in any land you have sailed. " +
          "The people of Melibar are idolaters with a tongue of their own, and their mandirs stand open along the bāzār even while merchants trade in fear of the sea. " +
          "Priests anoint stone images with oil and rice, and pilgrims leave garlands of coconut flowers at the threshold. " +
          "You watch the rite in silence, the pole-star bright above the temple roof.",
        bodyZh:
          "夜立海岸，见北极星高出水面约二肘——较诸所历诸国更高。没来之民奉偶像，自有言语；mandir（神庙）沿 bāzār（集市）而开，贾人虽惧海上，祠宇犹盛。祭司以油与米膏神像，朝圣者以椰花环献于门槛。你默观其礼，北辰明于庙顶。",
        choices: [
          {
            slug: "observe",
            labelEn: "Observe the idol rites from the temple steps",
            labelZh: "于寺阶外观偶像礼",
            effects: [
              { op: "days", value: 1, reason: "observed-the-idol-rites-of-melibar" },
              { op: "codex", value: "cx-melibar", reason: "noted-the-north-star-two-cubits-above-water" },
            ],
          },
          {
            slug: "measure-star",
            labelEn: "Measure the North Star against the mast and record what you see",
            labelZh: "以桅比北辰，记所见",
            effects: [
              { op: "codex", value: "cx-melibar", reason: "measured-the-pole-star-at-melibar" },
              { op: "fate", id: "travel", value: 1, reason: "learned-to-steer-by-the-higher-star" },
              { op: "reputation", value: 1, scope: "band", id: "india", reason: "showed-respect-at-the-shrine" },
            ],
          },
          {
            slug: "buy-pearls",
            labelEn: "Buy pearls from a diver who prayed at the shrine",
            labelZh: "向祷毕之采珠人购珠",
            needs: { coins: { min: 950 } },
            effects: [
              { op: "coins", value: -950, reason: "bought-pearls-at-melibar" },
              { op: "goods", id: "pearls", value: 1, reason: "bought-pearls-at-melibar" },
              { op: "fate", id: "rapport", value: 1, reason: "traded-with-a-shrine-pilgrim" },
            ],
          },
        ],
      },
    ],
  },
];
