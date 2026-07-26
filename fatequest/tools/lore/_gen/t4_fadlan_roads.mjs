export default [
  {
    id: "ev-road-fadlan-01",
    storyId: "cold-of-hell",
    origin: "hybrid",
    titleEn: "The Jayhun Frozen Solid",
    titleZh: "药浑河冰封如路",
    bodyEn:
      "You reach the Jayhun where the river lies frozen from bank to bank, seventeen spans thick. " +
      "Horses, mules, and laden carts move upon the ice as upon a paved road, and the surface holds without cracking. " +
      "The markets stand empty, and your breath hangs white before your face; you understand why men speak of a gate to the cold of the north.",
    bodyZh:
      "你至药浑，见河自岸至岸尽冻，冰厚十七拃。马、骡、负货之车行冰上如行坦途，冰坚不裂。市肆空寂，呼气成白雾；始知北人称此地为寒狱之门。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "cross_on_ice",
        labelEn: "Cross the river on the ice with the caravan",
        labelZh: "随商队踏冰渡河",
        effects: [
          { op: "days", value: 2, reason: "crossed-the-frozen-jayhun" },
          { op: "codex", value: "cx-fadlan-cold", reason: "noted-the-ice-road" },
        ],
      },
      {
        slug: "wait_at_ribat",
        labelEn: "Wait three days at the ribāt until scouts report the ice sound",
        labelZh: "于驿站候三日，待探路者报冰情",
        effects: [
          { op: "days", value: 3, reason: "waited-for-safe-ice" },
          { op: "fate", id: "travel", value: 1, reason: "chose-caution-on-the-jayhun" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-02",
    storyId: "caravan-to-the-turks",
    origin: "hybrid",
    titleEn: "Hiring the Akilavuz",
    titleZh: "雇突厥向导",
    bodyEn:
      "Before you enter the Gate of the Turks, the caravan masters speak of an akilavuz — a guide bred to these roads. " +
      "He knows where the snow lies knee-deep and which ribāt still keeps fodder. " +
      "Without him, you may wander ten days on the steppe and meet no soul.",
    bodyZh:
      "入突厥界门之前，商队主言及阿基拉武兹——熟谙此道之向导。彼知何处雪没膝、何处驿站尚存草料。无此人引路，或于草原十日不见人烟。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "hire_guide",
        labelEn: "Pay the guide his fee and take him for the next march",
        labelZh: "付向导酬金，携其同行",
        needs: { coins: { min: 50 } },
        effects: [
          { op: "coins", value: -50, reason: "hired-the-akilavuz" },
          { op: "days", value: -1, reason: "guide-shortened-the-march" },
          { op: "codex", value: "cx-steppe-road", reason: "learned-the-turkish-road" },
        ],
      },
      {
        slug: "press_on_alone",
        labelEn: "Trust the caravan track and press on without him",
        labelZh: "信商队旧迹，不雇而前行",
        effects: [
          { op: "days", value: 2, reason: "marched-without-a-guide" },
          { op: "fate", id: "travel", value: -1, reason: "risked-the-open-steppe" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-03",
    storyId: "northern-lights-white-nights",
    origin: "hybrid",
    titleEn: "Red Mist at Nightfall",
    titleZh: "日暮赤霞",
    bodyEn:
      "On your first night in these northern latitudes, the horizon turns a brilliant red before the sun has fully set. " +
      "Above you, a bank of mist holds shapes of horsemen with lances, and a second cloud advances as if to charge the first. " +
      "Your companions pray; the Turkic herders only laugh and say the sky armies fight every evening.",
    bodyZh:
      "初入北地，日未全没而天际尽赤。空中有赤雾，形若持槊骑者；又有一团雾来，如两军对垒。同行祷告，突厥牧人但笑，言天兵每夕交战，自古如此。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "watch_the_sky",
        labelEn: "Stand watch and record what you see in the sky",
        labelZh: "立而观天象，记其所见",
        effects: [
          { op: "days", value: 1, reason: "watched-the-northern-lights" },
          { op: "codex", value: "cx-fadlan-aurora", reason: "recorded-the-red-mist-battle" },
          { op: "fate", id: "travel", value: 1, reason: "witnessed-a-northern-marvel" },
        ],
      },
      {
        slug: "seek_shelter",
        labelEn: "Withdraw to the tents and leave the sky to itself",
        labelZh: "入帐避之，任天象自去",
        effects: [
          { op: "days", value: 1, reason: "sheltered-from-the-strange-sky" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-04",
    storyId: "gog-magog-giant",
    origin: "hybrid",
    titleEn: "Tales of the River Giant",
    titleZh: "河中巨人之说",
    bodyEn:
      "Around the evening fire, a merchant retells how the Bulghar king once rode to the Itil in flood season and found a man swimming — twelve cubits tall, with a head like the largest cooking pot. " +
      "Messengers from Wīsū, three months distant, wrote that he belonged to the people of Gog and Magog beyond the sea. " +
      "You mark the tale as hearsay, yet the north keeps such stories close.",
    bodyZh:
      "暮火之侧，有商人复述：不里加尔王曾赴伊提尔河涨水时，见一人泅水——高十二肘，首大如巨釜。距此三月之威斯人函告，谓其属歌革玛各族，居海彼岸。你记为传闻，然北地此类故事不绝。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "ask_the_kingdom",
        labelEn: "Ask whether any living man has seen such a figure",
        labelZh: "问可曾有人亲见",
        effects: [
          { op: "codex", value: "cx-fadlan-gog", reason: "gathered-gog-magog-rumours" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "listened-to-northern-tales" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Leave the fire and press on at first light",
        labelZh: "离火堆，平明即行",
        effects: [
          { op: "days", value: 1, reason: "left-the-storytellers" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-05",
    storyId: "rus-ship-burial",
    origin: "hybrid",
    titleEn: "Ship and Chieftain on the Shore",
    titleZh: "岸观舟葬",
    bodyEn:
      "From a bluff above the river you watch without approaching: a great man lies in a boat-shaped grave, dressed for the road ahead, with horses sacrificed and their heads set on stakes. " +
      "An old woman called the Angel of Death moves among the company, arranging what must be done before the pyre is lit. " +
      "You record the order of the rite and do not speak ill of what you cannot fully understand.",
    bodyZh:
      "你立河岸高坡远观，不近前：贵人卧舟形墓中，衣装整备，马既献祭，首悬木桩。一老妪，人呼死亡之天使，往来指挥，俟火起前诸事须备。你记其仪序，于未能尽解之事不加妄议。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "record_rite",
        labelEn: "Write down the stages of the burial you observe",
        labelZh: "记所见丧仪次第",
        effects: [
          { op: "days", value: 1, reason: "observed-the-ship-burial" },
          { op: "codex", value: "cx-fadlan-burial", reason: "recorded-rus-funeral-customs" },
        ],
      },
      {
        slug: "withdraw",
        labelEn: "Withdraw quietly before the pyre is kindled",
        labelZh: "火未起前悄然退去",
        effects: [
          { op: "days", value: 1, reason: "withdrew-from-the-shore-rite" },
          { op: "fate", id: "travel", value: 1, reason: "showed-respect-at-a-distance" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-06",
    storyId: "abu-hamid-caspian",
    origin: "hybrid",
    titleEn: "Caspian Islands in Merchants' Tales",
    titleZh: "里海诸岛传闻",
    bodyEn:
      "At a caravan halt, traders speak of Abū Hāmid's voyage among the Caspian isles — a mountain of black clay, an island where sea birds nest among serpents unharmed, and another where only voices are heard. " +
      "One man claims his uncle saw the Island of Sheep, where mountain ewes stand thick as locusts. " +
      "You weigh whether to alter your route toward the coast.",
    bodyZh:
      "于商队停处，贾人言及阿布·哈米德里海诸岛之行——黑土之山、蛇与海鸟共栖之岛、但闻人声无人迹之岛。又有人称叔父曾见羊岛，山羊之牝厚如蝗。你思是否改道赴岸。",
    sceneBg: "caravan-city",
    choices: [
      {
        slug: "buy_chart",
        labelEn: "Pay a sailor for a rough chart of the island routes",
        labelZh: "付水手薄资，求诸岛草图",
        needs: { coins: { min: 40 } },
        effects: [
          { op: "coins", value: -40, reason: "bought-a-caspian-chart" },
          { op: "codex", value: "cx-fadlan-caspian", reason: "noted-abu-hamids-islands" },
        ],
      },
      {
        slug: "stay_inland",
        labelEn: "Keep to the inland road and carry the tales only",
        labelZh: "仍走陆路，但携其说而行",
        effects: [
          { op: "days", value: 1, reason: "stayed-on-the-inland-road" },
          { op: "fate", id: "travel", value: 1, reason: "heard-the-caspian-lore" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-07",
    storyId: "beavers-and-mammoths",
    origin: "hybrid",
    titleEn: "Beaver Pelts and Buried Ivory",
    titleZh: "海狸皮与土中牙",
    bodyEn:
      "Bulghar brokers spread their wares: beaver and ermine from the northern rivers, and tusks dug from the earth white as snow and heavy as lead. " +
      "No one agrees what beast left them; some say the bones of ancient peoples, others trade goods bound for Khwarazm. " +
      "The talk of prices runs long into the evening.",
    bodyZh:
      "不里加尔经纪人陈列货物：北河海狸、白鼬皮，又有自土中掘出之牙，白如雪、重如铅。兽主为何，众说不一；或言古人之骨，或言转运花剌子模之物。议价之声至暮未歇。",
    sceneBg: "caravan-city",
    choices: [
      {
        slug: "listen_trade",
        labelEn: "Listen to the brokers and note what the north exports",
        labelZh: "听经纪人言，记北地所出",
        effects: [
          { op: "codex", value: "cx-fadlan-furs", reason: "noted-beaver-and-ivory-trade" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "spoke-with-bulghar-brokers" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Leave the market before the bargaining grows heated",
        labelZh: "议价方酣时离市前行",
        effects: [
          { op: "days", value: 1, reason: "left-the-fur-market" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-08",
    storyId: "sea-of-darkness",
    origin: "hybrid",
    titleEn: "Silent Barter at the Forest Edge",
    titleZh: "林边默市",
    bodyEn:
      "You come to a clearing where merchants lay bare blades and cow bones upon the snow, mark each pile, and withdraw out of sight. " +
      "When they return, sable skins lie beside some goods and others remain untouched. " +
      "Footprints in the drifts show long boards tied to the feet of men who never show their faces.",
    bodyZh:
      "你至一空场，见贾人置裸刃与牛骨于雪上，各标其号，遂退避远观。再返，有处旁置黑貂皮，有处原物仍在。雪中足迹系长板于足，其人终不露面。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "observe_barter",
        labelEn: "Watch the silent exchange and record its rules",
        labelZh: "观默市规矩而记之",
        effects: [
          { op: "days", value: 2, reason: "watched-silent-barter" },
          { op: "codex", value: "cx-fadlan-barter", reason: "recorded-the-forest-exchange" },
          { op: "fate", id: "travel", value: 1, reason: "witnessed-unseen-trade" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Pass wide of the clearing and press on",
        labelZh: "绕场而行，继续上路",
        effects: [
          { op: "days", value: 1, reason: "avoided-the-silent-market" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-09",
    storyId: "giants-of-iram",
    origin: "hybrid",
    titleEn: "Rumour of the Enchanted Mosque",
    titleZh: "神异清真寺之传",
    bodyEn:
      "A Khwarazmian pilgrim tells of a canyon eight farsakhs from the city where a mound rises from stagnant water, topped by a dome bright with gold tiles. " +
      "Men say it is Iram of the pillars, or a mosque enchanted by the giants of old who marched north from Ad. " +
      "Anything that touches the water vanishes, and no boat thrown upon it is ever seen again.",
    bodyZh:
      "有花剌子模朝觐者言：离城八法尔萨克处有谷，臭水环人工丘，丘上圆顶金瓦耀目。或谓即伊拉姆柱城，或谓古阿德巨人北征所建神异之寺。物触水即没，投舟亦不复见。",
    sceneBg: "temple-interior",
    choices: [
      {
        slug: "seek_the_mound",
        labelEn: "Turn aside two days toward the canyon marvel",
        labelZh: "改道二日，往观奇丘",
        effects: [
          { op: "days", value: 2, reason: "sought-the-enchanted-mound" },
          { op: "codex", value: "cx-fadlan-iram", reason: "noted-the-golden-dome-rumour" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Keep to the Saqsīn road and carry the tale only",
        labelZh: "仍走萨格辛道，但记其说",
        effects: [
          { op: "days", value: 1, reason: "passed-the-marvel-by" },
          { op: "fate", id: "travel", value: 1, reason: "heard-of-iram-in-the-north" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-10",
    storyId: "abu-hamid-return",
    origin: "hybrid",
    titleEn: "Return Road through Khwarazm",
    titleZh: "经花剌子模归途",
    bodyEn:
      "You turn south-west with a party bound for Khwarazm, where Abū Hāmid once sailed the Caspian and came home by a hundred farsakhs of orchards. " +
      "The brokers promise melons sweet as honey kept through winter, and grapes as large as dates. " +
      "The steppe lies behind you; ahead the towns grow denser and the wind milder.",
    bodyZh:
      "你随一队南西行者赴花剌子模——阿布·哈米德昔自里海归，经百里果园之地。经纪人许以蜜甜之瓜，冬存不腐，葡萄大如枣。草原在后，前路市镇渐密，风亦和矣。",
    sceneBg: "oasis-town",
    choices: [
      {
        slug: "enter_khwarazm",
        labelEn: "Enter Khwarazm and rest in the melon markets",
        labelZh: "入花剌子模，于瓜市歇息",
        effects: [
          { op: "days", value: 2, reason: "rested-in-khwarazm" },
          { op: "codex", value: "cx-fadlan-khwarazm", reason: "noted-the-return-road" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "travelled-the-southern-return" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Buy provisions and press on without lingering",
        labelZh: "购粮即行，不作久留",
        effects: [
          { op: "days", value: 1, reason: "passed-through-khwarazm-quickly" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-11",
    storyId: "sallam-alexanders-wall",
    origin: "hybrid",
    titleEn: "Sallam and the Iron Gates",
    titleZh: "萨拉姆与铁门",
    bodyEn:
      "An old courier retells how Sallām the Interpreter left Samarra with felt coats and fur boots to find the barrier raised by Dhū al-Qarnayn. " +
      "Letter followed letter — Armenia, the Alan king, the Khazar tarkhān — until the earth turned black and smelled of rank soil. " +
      "You wonder whether any wall still stands between the settled lands and the peoples of the far north.",
    bodyZh:
      "老驿卒复述：译官萨拉姆自萨迈拉出，裘靴齐备，往寻两角者所筑之障。文书递传——亚美尼亚、阿兰王、可萨塔尔汗——终至土地尽黑，秽气扑鼻。你想北地与定居诸国之间，是否仍有墙在。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "ask_the_route",
        labelEn: "Ask which passes still lead toward the northern barrier",
        labelZh: "问何隘仍可通北障",
        effects: [
          { op: "codex", value: "cx-fadlan-wall", reason: "noted-sallams-road-to-the-barrier" },
          { op: "fate", id: "travel", value: 1, reason: "heard-of-alexanders-wall" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Thank him and press on with your own road",
        labelZh: "谢其言，仍走己路",
        effects: [
          { op: "days", value: 1, reason: "left-the-couriers-tale" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-12",
    storyId: "radhaniya-routes",
    origin: "hybrid",
    titleEn: "Radhaniya and Rus at the Crossroads",
    titleZh: "拉扎尼亚与罗斯交会",
    bodyEn:
      "At a steppe crossing you meet Radhaniya merchants who speak Arabic, Persian, and Frankish in one breath, and Rus traders with beaver pelts and bare sword blanks. " +
      "The one party came by camel from Faramā; the other by river from the farthest Slavic forests. " +
      "Their routes meet here as Ibn Khurradādhbih once mapped them.",
    bodyZh:
      "于草原岔口，遇拉扎尼亚贾人，一语间阿拉伯、波斯、法兰克语并用；又有罗斯商人，携海狸皮与无柄剑胚。前者自法拉马驼道而来，后者自斯拉夫林深处水程而至。其道于此交汇，如伊本·胡尔达兹比昔所记。",
    sceneBg: "caravan-city",
    choices: [
      {
        slug: "share_road_news",
        labelEn: "Share road news and learn their onward routes",
        labelZh: "互报路况，问前路",
        effects: [
          { op: "codex", value: "cx-fadlan-radhaniya", reason: "noted-the-radhaniya-and-rus-routes" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "spoke-with-long-distance-merchants" },
        ],
      },
      {
        slug: "buy_intelligence",
        labelEn: "Pay for a written list of safe halts on the Rus road",
        labelZh: "付资求罗斯道安营清单",
        needs: { coins: { min: 50 } },
        effects: [
          { op: "coins", value: -50, reason: "bought-rus-road-intelligence" },
          { op: "days", value: -1, reason: "used-merchant-routes" },
          { op: "codex", value: "cx-steppe-road", reason: "obtained-rus-halt-names" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-13",
    storyId: "khazar-khaqan",
    origin: "hybrid",
    titleEn: "Rumours of the Khazar Khaqan",
    titleZh: "可萨可汗之闻",
    bodyEn:
      "Travellers from Itil speak of two rulers: a king who leads armies, and a khaqan who lives sequestered in the inner palace and never mounts a horse. " +
      "When famine or defeat comes, the people may demand the khaqan's life, saying his reign has brought ill fortune. " +
      "You note the custom and wonder how long the office can endure.",
    bodyZh:
      "自伊提尔来者言国有二主：一王掌军，一可汗幽于内宫，不骑马，不出见。遇饥馑或战败，民众或请杀可汗，谓其在位致祸。你记此俗，思此职能久否。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "record_court",
        labelEn: "Record the court customs as Mas'udi described them",
        labelZh: "按马苏第所记录朝仪",
        effects: [
          { op: "codex", value: "cx-fadlan-khazar", reason: "recorded-the-khaqan-custom" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Leave the Itil gossip and press on eastward",
        labelZh: "不听可萨闲话，东行",
        effects: [
          { op: "days", value: 1, reason: "avoided-khazar-politics" },
          { op: "fate", id: "travel", value: 1, reason: "kept-to-the-open-road" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-14",
    storyId: "midnight-sun",
    origin: "hybrid",
    titleEn: "The Night That Barely Comes",
    titleZh: "夜短几乎不至",
    bodyEn:
      "In Bulghar country the twilight lingers so long that a man can scarcely boil a pot between sunset and dawn. " +
      "You sit with a timekeeper who swears the shortest night is four and a half hours, and farther north still less. " +
      "Sleep comes oddly; the sky never fully darkens.",
    bodyZh:
      "在不里加尔境，暮至旦之间短促，人不及把釜水烧开。你与守时者同坐，彼言至短之夜仅四半时辰，愈北愈短。眠意来处怪异，天终不完全黑。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "observe_night",
        labelEn: "Stay awake one full cycle and measure the light",
        labelZh: "一昼夜不寐，量其明晦",
        effects: [
          { op: "days", value: 1, reason: "measured-the-white-nights" },
          { op: "codex", value: "cx-fadlan-midnight-sun", reason: "recorded-the-short-night" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Sleep when you can and march with the caravan",
        labelZh: "能眠则眠，随队而行",
        effects: [
          { op: "days", value: 1, reason: "marched-under-the-pale-sky" },
          { op: "fate", id: "travel", value: 1, reason: "endured-the-white-nights" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-15",
    storyId: "fur-trade-masudi",
    origin: "hybrid",
    titleEn: "Fur Packs on the Sledge Road",
    titleZh: "雪橇载皮",
    bodyEn:
      "A train of sledges passes you heading south, each loaded with black fox and sable pressed in oilcloth. " +
      "The drivers say the pelts came down the Khazar river from Burtas country, bound for Darband and beyond. " +
      "The weight of fur is warmth itself; even the air downwind feels thicker.",
    bodyZh:
      "一队雪橇南行与你相错，各载黑狐、黑貂皮，油布紧束。驱者言皮自可萨河、布尔塔斯地而来，赴达尔班诸处。裘皮之重即暖本身，逆风亦觉空气更稠。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "inspect_loads",
        labelEn: "Ask to see the pelts and note their marks of origin",
        labelZh: "请观皮货，记其产地号",
        effects: [
          { op: "codex", value: "cx-fadlan-furs", reason: "noted-the-sledge-fur-trade" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "spoke-with-fur-drivers" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Give way on the track and press on northward",
        labelZh: "让道于雪橇，继续北行",
        effects: [
          { op: "days", value: 1, reason: "yielded-to-the-sledge-train" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-16",
    storyId: "exports-from-bulghar",
    origin: "hybrid",
    titleEn: "Bulghar Market at the Forest Edge",
    titleZh: "不里加尔林边市",
    bodyEn:
      "You reach a seasonal market where Bulghar brokers trade honey, wax, arrows, birch wood, and furs of every grade. " +
      "Grey squirrel and ermine hang beside fish teeth and amber brought from rivers you have not yet seen. " +
      "The list runs longer than your ink will comfortably hold.",
    bodyZh:
      "你至一季市，不里加尔经纪人售蜜、蜡、箭、桦木及各级皮毛。灰鼠、白鼬与鱼牙、琥珀同悬，皆自未历之河而来。货单之长按纸难尽。",
    sceneBg: "caravan-city",
    choices: [
      {
        slug: "catalogue_goods",
        labelEn: "Walk the rows and catalogue what the north exports",
        labelZh: "遍历货行，记北地所出",
        effects: [
          { op: "days", value: 1, reason: "surveyed-the-bulghar-market" },
          { op: "codex", value: "cx-fadlan-bulghar", reason: "listed-bulghar-exports" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Buy only bread and press on before the market scatters",
        labelZh: "但购干粮，市散前上路",
        effects: [
          { op: "days", value: 1, reason: "left-the-seasonal-market" },
          { op: "fate", id: "travel", value: 1, reason: "passed-the-bulghar-fair" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-17",
    storyId: "dog-sleds-silent-barter",
    origin: "hybrid",
    titleEn: "Dog Sleds and Bone Skates",
    titleZh: "犬橇与骨滑橇",
    bodyEn:
      "Biruni's account comes alive before you: men drag provisions on wooden sleighs, or let great dogs pull them, and others glide on bone skates across crusted snow. " +
      "A relay master offers to carry your pack one day's journey to the next post. " +
      "The dogs know the ice better than any rider.",
    bodyZh:
      "比鲁尼所述见于目前：或手拖木橇负粮，或令大犬牵引，又有人以骨橇行坚雪之上。一驿主愿替你负囊一日程至下一站。犬比骑手更识冰路。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "hire_sled",
        labelEn: "Pay for a dog sled relay to the next halting place",
        labelZh: "付资乘犬橇至下一停",
        needs: { coins: { min: 30 } },
        effects: [
          { op: "coins", value: -30, reason: "hired-a-dog-sled-relay" },
          { op: "days", value: -1, reason: "sled-shortened-the-march" },
          { op: "codex", value: "cx-fadlan-sleds", reason: "noted-dog-sled-travel" },
        ],
      },
      {
        slug: "walk_the_ice",
        labelEn: "Walk the ice road on your own feet",
        labelZh: "踏冰路步行",
        effects: [
          { op: "days", value: 2, reason: "walked-the-ice-road" },
          { op: "fate", id: "travel", value: 1, reason: "endured-the-northern-march" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-18",
    storyId: "enclosed-nations",
    origin: "hybrid",
    titleEn: "Voices in the Enclosed Mountains",
    titleZh: "封闭山中人声",
    bodyEn:
      "A Novgorod merchant tells how his servant reached the Iughra and heard cries within mountains that slope to the sea. " +
      "Through a narrow opening, unseen hands pointed at iron blades and left furs in exchange. " +
      "He believes them the nations Alexander walled away, though no one has seen their faces.",
    bodyZh:
      "有诺夫哥罗德商人言：其仆至尤格拉，闻倾海之山中有呼号。窄缝之外，无形之手指铁刃，留皮货为换。彼谓乃亚历山大封闭之族，然终无人见其面。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "record_tale",
        labelEn: "Write the tale as you heard it, without embellishment",
        labelZh: "据闻直录，不加增饰",
        effects: [
          { op: "codex", value: "cx-fadlan-enclosed", reason: "recorded-the-enclosed-nations" },
          { op: "fate", id: "travel", value: 1, reason: "heard-of-alexanders-prisoners" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Leave such rumours and keep to the open steppe",
        labelZh: "不涉此类传闻，仍走开阔草原",
        effects: [
          { op: "days", value: 1, reason: "avoided-the-mountain-rumours" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-19",
    storyId: "battuta-land-of-darkness",
    origin: "hybrid",
    titleEn: "Roped for the Land of Darkness",
    titleZh: "入暗地结绳而行",
    bodyEn:
      "Fur merchants who have entered the Land of Darkness tell you how they rope themselves wrist to wrist before stepping into the mist where sun and moon never show. " +
      "A man who loses the line is not found again. " +
      "They lay out goods and retreat; when they return, pelts lie beside the blades they left.",
    bodyZh:
      "曾入暗地之裘商言：入雾前以绳联腕——日月至不了之处，失线者不复得。彼等陈列货物即退，再返则皮货在，刃仍在。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "learn_the_rite",
        labelEn: "Learn how they tie the line and mark their goods",
        labelZh: "学其结绳与标货之法",
        effects: [
          { op: "days", value: 2, reason: "learned-darkness-travel-rites" },
          { op: "codex", value: "cx-fadlan-darkness", reason: "recorded-the-land-of-darkness" },
        ],
      },
      {
        slug: "turn_back",
        labelEn: "Decide the profit is not worth the mist and turn back",
        labelZh: "觉利不足抵险，折返",
        effects: [
          { op: "days", value: 1, reason: "turned-back-from-the-darkness" },
          { op: "fate", id: "travel", value: 1, reason: "chose-the-safer-road" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-20",
    storyId: "battuta-new-sarai",
    origin: "hybrid",
    titleEn: "Breath That Freezes on the March",
    titleZh: "行路呼气成冰",
    bodyEn:
      "Mid-winter on the road to New Sarai, you wear three coats and still cannot mount without help. " +
      "Water from your face freezes in your beard; melt ice in a cauldron for every drink. " +
      "The Itil and its branches lie solid enough to cut blocks from, and the caravan crosses them as on stone.",
    bodyZh:
      "仲冬趋新萨莱，衣三重仍须人扶上马。面上之水结于须中；饮水皆凿冰置釜化之。伊提尔及其支流坚如石，商队踏冰而行。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "endure_march",
        labelEn: "Endure the march and keep with the caravan",
        labelZh: "忍寒随队而行",
        effects: [
          { op: "days", value: 2, reason: "marched-through-midwinter" },
          { op: "codex", value: "cx-fadlan-cold", reason: "noted-winter-travel-on-the-itil" },
        ],
      },
      {
        slug: "halt_and_fire",
        labelEn: "Halt one day and burn tāghwood until the worst passes",
        labelZh: "停一日，燃柞木以御寒",
        effects: [
          { op: "days", value: 3, reason: "halted-for-winter-fire" },
          { op: "fate", id: "travel", value: 1, reason: "survived-the-freezing-march" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-21",
    storyId: "siberia-alexanders-tower",
    origin: "hybrid",
    titleEn: "Siberia and the Tower Rumour",
    titleZh: "西伯利亚与塔之传说",
    bodyEn:
      "An official from Bulghar speaks of Sibir and Julmān beyond Afīkūn, where snow covers house and plain six months of the year. " +
      "Some say Alexander raised a tower at the edge of the world; others only that the cold wastes men until they boil the same bones seven times. " +
      "The names on his lips mean little to you yet feel very far.",
    bodyZh:
      "有不里加尔吏言：阿菲昆之外有西伯利亚、朱尔曼，雪覆屋与野六阅月。或谓亚历山大于世界边缘立塔；或仅言寒极，人至七度煮同一骨。其名于口尚生疏，却觉极远。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "ask_distances",
        labelEn: "Ask the marching days between Bulghar and Sibir",
        labelZh: "问自不里加尔至西伯利亚程日",
        effects: [
          { op: "codex", value: "cx-fadlan-sibir", reason: "noted-siberia-and-the-tower-rumour" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Thank him and press on toward warmer latitudes",
        labelZh: "谢其言，向南行",
        effects: [
          { op: "days", value: 1, reason: "left-the-siberia-tales" },
          { op: "fate", id: "travel", value: 1, reason: "heard-of-the-far-north" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-22",
    storyId: "caravan-to-the-turks",
    origin: "hybrid",
    titleEn: "Rafts of Inflated Hide",
    titleZh: "皮囊为筏",
    bodyEn:
      "You reach a steppe river too swift for wading. The caravan unfolds boats of camel hide, stretches them on round saddle frames, and loads them with baggage. " +
      "Men pole across while horses and camels swim behind with loud cries. " +
      "One skin boat spins in the current before reaching the far bank.",
    bodyZh:
      "你至一草原河，湍急不可涉。商队展骆驼皮舟，以圆鞍架撑之，载行李。人撑篙渡水，马驼随后游过，呼声响亮。有一皮舟于流中打旋，幸终抵岸。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "pay_boatmen",
        labelEn: "Pay the boatmen to carry your pack across first",
        labelZh: "付舟子先渡汝之行囊",
        needs: { coins: { min: 45 } },
        effects: [
          { op: "coins", value: -45, reason: "paid-the-hide-boatmen" },
          { op: "days", value: 1, reason: "crossed-on-skin-rafts" },
          { op: "codex", value: "cx-steppe-road", reason: "noted-the-hide-boat-crossing" },
        ],
      },
      {
        slug: "swim_with_caravan",
        labelEn: "Cross with the caravan and accept the delay",
        labelZh: "随队渡河，任其迟延",
        effects: [
          { op: "days", value: 2, reason: "crossed-the-steppe-river" },
          { op: "fate", id: "travel", value: -1, reason: "risked-the-swift-current" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-23",
    storyId: "ghuzz-turks",
    origin: "hybrid",
    titleEn: "Horse-Thief Alarm at Night",
    titleZh: "夜惊失马",
    bodyEn:
      "Near the Ghuzz tents, shouts rise before dawn: someone has cut a picket rope and driven off three horses. " +
      "The Turks say a man who steals a horse may pay ninefold or answer with his life. " +
      "Your own mounts are restless, and every shadow between the felts looks like a rider.",
    bodyZh:
      "近突厥帐侧，黎明前忽有呼号：有人割绳牵走三马。突厥人言盗马者或偿九倍，或偿命。汝之坐骑亦不安，毡帐间影皆似骑者。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "stand_watch",
        labelEn: "Stand watch until daylight and help search the plain",
        labelZh: "守至天明，助搜草原",
        effects: [
          { op: "days", value: 1, reason: "stood-watch-after-the-theft" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "helped-the-ghuzz-camp" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Saddle at first light and press on away from the quarrel",
        labelZh: "平明备鞍，离此纷争",
        effects: [
          { op: "days", value: 1, reason: "left-the-theft-behind" },
          { op: "fate", id: "travel", value: 1, reason: "avoided-a-steppe-dispute" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-24",
    storyId: "volga-bulghars",
    origin: "hybrid",
    titleEn: "Koumiss and the Host's Bowl",
    titleZh: "马奶与主人之碗",
    bodyEn:
      "A Turkic host offers you a bowl of koumiss fermented one day and one night — still mild, still lawful to drink without intoxication. " +
      "He waits until you have tasted before he speaks of the road ahead. " +
      "To refuse the bowl is to refuse the tent.",
    bodyZh:
      "突厥主人献马奶酒，发酵仅一日一夜——味尚淡，饮之未至大醉。彼待汝尝后方言前路。拒碗即拒其帐。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "accept_bowl",
        labelEn: "Accept the bowl, drink once, and ask his blessing on the road",
        labelZh: "接碗饮一口，求其祝路",
        effects: [
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "honoured-koumiss-etiquette" },
          { op: "codex", value: "cx-fadlan-koumiss", reason: "noted-turkic-hospitality" },
        ],
      },
      {
        slug: "bring_gift",
        labelEn: "Bring raisins and pepper as a guest gift before you drink",
        labelZh: "先献葡萄干、胡椒为客礼再饮",
        needs: { coins: { min: 35 } },
        effects: [
          { op: "coins", value: -35, reason: "brought-a-guest-gift" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "gave-a-worthy-guest-gift" },
          { op: "fate", id: "travel", value: 1, reason: "won-the-hosts-favour" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-25",
    storyId: "steppe-wolf-pack",
    origin: "authored",
    titleEn: "Wolves on the Snow Road",
    titleZh: "雪路狼群",
    bodyEn:
      "At dusk you see eyes along the treeline — a wolf pack pacing the caravan at the edge of bow range. " +
      "The drovers say they will not attack while the fires burn, but will test any straggler after midnight. " +
      "The wind carries their breath across the snow like smoke.",
    bodyZh:
      "暮时见林边有眼——狼群随商队于弓射之外徘徊。驱者言火燃时彼不敢攻，然午夜之后或试落单之人。风携狼息过雪，如轻烟。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "keep_fires",
        labelEn: "Keep the fires high and march close to the armed guard",
        labelZh: "高燃篝火，近武装者而行",
        effects: [
          { op: "days", value: 2, reason: "guarded-against-the-wolves" },
          { op: "fate", id: "travel", value: 1, reason: "survived-the-wolf-road" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Push through the night while the pack still keeps its distance",
        labelZh: "趁狼尚远，连夜赶路",
        effects: [
          { op: "days", value: 1, reason: "marched-past-the-wolves" },
          { op: "fate", id: "travel", value: -1, reason: "risked-the-night-march" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-26",
    storyId: "steppe-sick-child",
    origin: "authored",
    titleEn: "A Yurt with a Sick Child",
    titleZh: "病童之毡帐",
    bodyEn:
      "A woman calls from a low yurt: her child burns with fever, and the nearest healer is two days south. " +
      "She asks only for clean water and a few herbs you carry in your pack. " +
      "The caravan master already signals to move.",
    bodyZh:
      "一妇人自低毡帐呼：其幼子高热，最近医者在南二日程。彼但求净水与汝囊中数味草药。商队主已催启程。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "help_child",
        labelEn: "Stay one hour, share water and herbs, and record what you did",
        labelZh: "留一时辰，分水施药并记其事",
        effects: [
          { op: "days", value: 1, reason: "aided-the-sick-child" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "helped-a-steppe-family" },
          { op: "codex", value: "cx-steppe-road", reason: "noted-a-healers-choice" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Leave what water you can spare and press on with the caravan",
        labelZh: "留可舍之水，随队前行",
        effects: [
          { op: "days", value: 1, reason: "left-the-yurt-behind" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-27",
    storyId: "khwarazm-salt-caravan",
    origin: "authored",
    titleEn: "Salt Train from the Aral Shores",
    titleZh: "自阿拉尔岸来盐队",
    bodyEn:
      "A slow train of camels passes, each bearing slabs of salt crust from the shallow southern sea. " +
      "The drivers say the water recedes in summer and leaves white fields hard enough to cut with an axe. " +
      "They trade the salt north for fish and south for millet.",
    bodyZh:
      "一慢驼队过，各负浅海南岸所割盐块。驱者言夏月水退，留白野坚可斧切。彼以盐北换鱼，南换粟。",
    sceneBg: "caravan-city",
    choices: [
      {
        slug: "ask_the_shores",
        labelEn: "Ask how many days lie between here and the Aral shores",
        labelZh: "问距阿拉尔岸几日程",
        effects: [
          { op: "codex", value: "cx-fadlan-salt", reason: "noted-the-aral-salt-road" },
          { op: "fate", id: "travel", value: 1, reason: "learned-the-salt-route" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Give the salt train the road and press on",
        labelZh: "让路于盐队，继续行",
        effects: [
          { op: "days", value: 1, reason: "passed-the-salt-caravan" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-28",
    storyId: "steppe-eclipse-omen",
    origin: "authored",
    titleEn: "Eclipse Among the Riders",
    titleZh: "骑队中之日蚀",
    bodyEn:
      "Mid-march, the sun thins to a crescent and the steppe darkens though it is not yet evening. " +
      "Some riders shout that heaven warns the caravan; others say the astronomers of Bukhara predicted it. " +
      "The horses shy and will not line until the light returns.",
    bodyZh:
      "行旅中忽日成弯月，草原暗而未暮。有骑者呼天道警商队；又有人言布哈拉天文学家早已预告。马惊不合队，待光复方静。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "record_omen",
        labelEn: "Record the hour and what the riders said",
        labelZh: "记其时与骑者之言",
        effects: [
          { op: "days", value: 1, reason: "waited-out-the-eclipse" },
          { op: "codex", value: "cx-fadlan-omen", reason: "recorded-the-eclipse-omen" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Calm your mount and press on as soon as the sun returns",
        labelZh: "日复即安抚坐骑上路",
        effects: [
          { op: "days", value: 1, reason: "marched-after-the-eclipse" },
          { op: "fate", id: "travel", value: 1, reason: "endured-a-heavenly-sign" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-29",
    storyId: "radhaniya-routes",
    origin: "hybrid",
    titleEn: "A Coffle on the Forest Road",
    titleZh: "林道上的押队",
    bodyEn:
      "You meet a coffle of captives driven north under guard — men and women bound wrist to wrist, some barefoot on the frozen track. " +
      "The guard says they are bound for Bulghar market and beyond. " +
      "You cannot undo the chain, but you can bear witness and write what you see.",
    bodyZh:
      "遇一押队北行——男女腕系于链，有赤足行冻土者。守卫言将赴不里加尔市乃至更远。链非汝能解，然可将所见记下存证。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "witness_record",
        labelEn: "Walk beside them one mile and record names and numbers as you can",
        labelZh: "并行一里，尽记姓名数目",
        effects: [
          { op: "days", value: 1, reason: "witnessed-the-coffle" },
          { op: "codex", value: "cx-fadlan-captives", reason: "recorded-a-slave-coffle" },
          { op: "fate", id: "travel", value: 1, reason: "bore-witness-on-the-road" },
        ],
      },
      {
        slug: "look_away",
        labelEn: "Look away and press on before the guard demands answers",
        labelZh: "避目不看，趁守卫未问急行",
        effects: [
          { op: "days", value: 1, reason: "passed-the-coffle-in-silence" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-30",
    storyId: "steppe-thunderstorm",
    origin: "authored",
    titleEn: "Thunder on the Open Grass",
    titleZh: "开阔草野雷鸣",
    bodyEn:
      "Clouds build without a hill in sight, and lightning walks the flat horizon. " +
      "There is no grove to shelter under — only the low grass and the caravan's scattered tents. " +
      "You feel exposed in a way the desert never taught you.",
    bodyZh:
      "无山而云聚，电光行于平地天际。无可庇之林——唯低草与散帐。汝觉暴露之甚，非沙漠所能教。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "halt_tents",
        labelEn: "Halt, peg the tents low, and wait out the storm",
        labelZh: "停步低桩扎帐，待风暴过",
        effects: [
          { op: "days", value: 2, reason: "waited-out-the-thunderstorm" },
          { op: "fate", id: "travel", value: 1, reason: "survived-the-open-storm" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Press on between squalls while the horses still willing",
        labelZh: "趁间隙赶路，趁马尚行",
        effects: [
          { op: "days", value: 1, reason: "marched-through-the-squalls" },
          { op: "fate", id: "travel", value: -1, reason: "risked-the-lightning-road" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-31",
    storyId: "steppe-kurgan",
    origin: "authored",
    titleEn: "An Opened Tumulus",
    titleZh: "已开之丘墓",
    bodyEn:
      "Beside the track rises a kurgan already breached — prior diggers have left bones and broken pottery scattered down the slope. " +
      "The elders say the mound held a horse lord of an earlier age. " +
      "Nothing of value remains, only the wind in the hollow crown.",
    bodyZh:
      "道旁一丘冢已被先开——断骨破陶散于坡。长老言昔葬马部贵人。已无值钱之物，唯风入空顶。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "survey_mound",
        labelEn: "Survey the mound and sketch what the diggers left",
        labelZh: "勘丘墓，绘其所遗",
        effects: [
          { op: "days", value: 1, reason: "surveyed-the-kurgan" },
          { op: "codex", value: "cx-fadlan-kurgan", reason: "recorded-an-opened-tumulus" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Leave the dead to the wind and press on",
        labelZh: "任死者归风，继续行",
        effects: [
          { op: "days", value: 1, reason: "passed-the-open-mound" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-32",
    storyId: "volga-bulghars",
    origin: "hybrid",
    titleEn: "The Bulghar King's Messenger",
    titleZh: "不里加尔王使者",
    bodyEn:
      "A royal messenger blocks the ford with six riders and reads a toll for all who trade furs through the king's land. " +
      "He shows a seal of Almish and says the fee keeps the winter raids at bay. " +
      "The caravan elders argue; the river will not wait.",
    bodyZh:
      "王使率六骑守渡，宣读凡经其国贩裘者当纳通行之费。彼出示阿尔米什印信，言此金以御冬掠。商队长老争之，而河不待人。",
    sceneBg: "caravan-city",
    choices: [
      {
        slug: "pay_toll",
        labelEn: "Pay the toll and cross with the sealed receipt",
        labelZh: "纳费，持印信收据渡河",
        needs: { coins: { min: 60 } },
        effects: [
          { op: "coins", value: -60, reason: "paid-the-bulghar-toll" },
          { op: "days", value: 1, reason: "crossed-with-the-kings-leave" },
          { op: "reputation", value: 1, scope: "band", id: "steppe", reason: "paid-the-royal-toll" },
        ],
      },
      {
        slug: "detour",
        labelEn: "Detour upstream to a shallow ford the messenger does not hold",
        labelZh: "溯流改道，从不守之浅渡",
        effects: [
          { op: "days", value: 3, reason: "detoured-the-royal-toll" },
          { op: "fate", id: "travel", value: -1, reason: "avoided-the-kings-messenger" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-33",
    storyId: "ghuzz-turks",
    origin: "hybrid",
    titleEn: "Lacing Felt Boots",
    titleZh: "系毡靴",
    bodyEn:
      "A Turkic woman shows you how they lace felt boots over horse-hide soles — two pairs, one plain and one padded, until a man can barely stir in the saddle. " +
      "She says the cold enters through the feet before it reaches the chest. " +
      "You practice the knots while the kettle hisses.",
    bodyZh:
      "一突厥妇人示汝系毡靴于马皮底之上——双层，一常一絮，直至人几乎不能策马。彼言寒自足入，先于胸至。汝于釜鸣时习其结法。",
    sceneBg: "steppe-camp",
    choices: [
      {
        slug: "learn_lacing",
        labelEn: "Learn the lacing and record the layers they wear",
        labelZh: "习系法，记其层数",
        effects: [
          { op: "days", value: 1, reason: "learned-felt-boot-lacing" },
          { op: "codex", value: "cx-fadlan-cold", reason: "noted-turkic-winter-gear" },
          { op: "fate", id: "travel", value: 1, reason: "gained-northern-footwear-lore" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Thank her and press on before the next snow",
        labelZh: "谢其教，趁雪前上路",
        effects: [
          { op: "days", value: 1, reason: "left-the-boot-lesson" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-34",
    storyId: "aral-salt-mirage",
    origin: "authored",
    titleEn: "Mirage of a Lake",
    titleZh: "幻湖",
    bodyEn:
      "On the horizon you see water shining — reeds, birds, and the ripple of wind — yet the nearer you ride the more the ground crunches white underhoof. " +
      "It is a salt flat, not a lake, and the gleam is crust and glare. " +
      "The caravan turns aside lest the hooves break through the shell into brine.",
    bodyZh:
      "天际水光熠熠——芦苇、鸟影、风纹皆见——愈近愈闻蹄下白土作声。此非湖，乃盐原，其光为盐壳映日。商队改道，恐壳破没于卤。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "circle_wide",
        labelEn: "Circle wide and note how the flat deceives the eye",
        labelZh: "绕远而行，记其如何惑目",
        effects: [
          { op: "days", value: 2, reason: "circled-the-salt-flat" },
          { op: "codex", value: "cx-fadlan-salt", reason: "recorded-the-salt-mirage" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Trust the guide's track and press on without delay",
        labelZh: "信向导旧迹，不延而进",
        effects: [
          { op: "days", value: 1, reason: "crossed-near-the-salt-flat" },
          { op: "fate", id: "travel", value: 1, reason: "avoided-the-false-lake" },
        ],
      },
    ],
  },
  {
    id: "ev-road-fadlan-35",
    storyId: "cold-of-hell",
    origin: "hybrid",
    titleEn: "The Ice Boom on a Night March",
    titleZh: "夜行冰裂之声",
    bodyEn:
      "You march by starlight across a frozen river when the ice booms beneath you — a deep crack running upstream like thunder under cloth. " +
      "Men freeze in place; the guide says the river speaks when the night air falls faster than the water below. " +
      "You stand still until the sound rolls away and the caravan moves again.",
    bodyZh:
      "汝趁星光行于冻河，忽闻冰下轰鸣——裂纹溯流而上，如布裹雷。众人定住；向导言夜寒骤甚，河下之水应之而鸣。待声远去，商队方再动。",
    sceneBg: "desert-night",
    choices: [
      {
        slug: "wait_for_sound",
        labelEn: "Wait until the ice falls silent and cross in single file",
        labelZh: "待冰静，单列渡之",
        effects: [
          { op: "days", value: 1, reason: "waited-for-the-ice-boom" },
          { op: "codex", value: "cx-fadlan-cold", reason: "recorded-the-ice-boom" },
          { op: "fate", id: "travel", value: 1, reason: "heeded-the-frozen-river" },
        ],
      },
      {
        slug: "press_on",
        labelEn: "Press on quickly while the ice still holds",
        labelZh: "趁冰尚坚，疾行而过",
        effects: [
          { op: "days", value: 1, reason: "hurried-across-the-booming-ice" },
          { op: "fate", id: "travel", value: -1, reason: "risked-the-night-ice" },
        ],
      },
    ],
  },
];
