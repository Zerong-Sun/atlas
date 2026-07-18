/* 占途 · 千载行纪 — Chapter 1: Marco Polo (Venice → Quanzhou, 1271–1291)
   Excerpts adapted from the public-domain Yule translation / 冯承钧译本意译 */
window.FQ = window.FQ || {};

FQ.JOURNEY_REGIONS = {
  chr:  { zh: "基督之境", en: "Christendom",     color: "#4a6fa5" },
  isl:  { zh: "新月之境", en: "Crescent Lands",  color: "#3f8f6b" },
  con:  { zh: "儒道之境", en: "Confucian Realm", color: "#b0713a" },
  mazu: { zh: "妈祖之海", en: "Mazu's Sea",      color: "#2e8b9a" }
};

FQ.CHAPTERS = [{
  id: "marco",
  nameZh: "第一章 · 马可·波罗东行", nameEn: "Ch.1 · Marco Polo Goes East",
  taglineZh: "威尼斯 → 泉州,1271–1291", taglineEn: "Venice → Quanzhou, 1271–1291",
  startCoins: 10,
  nodes: [
    {
      id: "venice", region: "chr", x: 78, y: 108,
      zh: "威尼斯", en: "Venice",
      exZh: "一二七一年,我随父亲与叔父自威尼斯启航,行囊中带着教皇的书信与圣墓的灯油。",
      exEn: "In 1271 we set forth from Venice with my father and uncle, bearing the Pope's letters and oil from the Holy Sepulchre.",
      gate: {
        type: "tarotAny",
        pZh: "临行仪式:抽取一张守护之牌,愿它伴你万里。",
        pEn: "Rite of departure: draw a patron card to guard your road."
      }
    },
    {
      id: "acre", region: "chr", x: 195, y: 178,
      zh: "阿卡", en: "Acre",
      exZh: "在阿卡,教廷特使为我们补全了致大汗的文书。自此,前路一直向东。",
      exEn: "At Acre the Legate completed our letters to the Great Khan. From here, the road runs ever eastward.",
      gate: {
        type: "tarotLow",
        pZh: "圣殿骑士守着东行的关文:抽到大阿卡纳前十号(0–9),方能取信启程。",
        pEn: "The Templars hold the eastward pass: draw Major Arcana 0–9 to earn their trust."
      }
    },
    {
      id: "hormuz", region: "isl", x: 330, y: 252,
      zh: "霍尔木兹", en: "Hormuz",
      exZh: "霍尔木兹热风如焚,商队长说,穿越克尔曼荒漠,须先观星择一个吉日。",
      exEn: "At Hormuz the wind burns like fire. The caravan master will not cross the Kerman waste until the stars name a day.",
      gate: {
        type: "diceElem",
        pZh: "随波斯商队观星:掷星辰骰,得土象或火象星座,方为宜行之日。",
        pEn: "Read the sky with the caravan: roll an Earth or Fire sign to fix the day of departure."
      }
    },
    {
      id: "pamir", region: "con", x: 468, y: 148,
      zh: "帕米尔", en: "Pamir",
      exZh: "帕米尔高处号称世界屋脊,行十二日不见人烟,火焰因严寒而色淡,饭食难熟。",
      exEn: "On the Pamir, the roof of the world, we rode twelve days and saw no dwelling; fire burns pale in that cold, and food will scarcely cook.",
      gate: {
        type: "meihua",
        pZh: "以驼铃之数起一卦梅花,卦中见坎(水),便能寻得雪泉补给。",
        pEn: "Cast a Plum Blossom hexagram from the camel bells: if Water (☵) appears, you find a snow-fed spring."
      }
    },
    {
      id: "shangdu", region: "con", x: 618, y: 92,
      zh: "上都", en: "Shangdu",
      exZh: "上都的大理石宫殿金碧辉煌,大汗于此消夏。谒见之前,礼官命先卜一卦以问吉凶。",
      exEn: "At Shangdu stands the Khan's marble palace, gilded and glorious. Before an audience, the master of rites requires a casting.",
      gate: {
        type: "ichingYang",
        pZh: "殿前起卦:掷铜钱六次,得阳爻三数以上,方合觐见之仪。",
        pEn: "Cast six lines before the hall: three or more yang lines befit an audience with the Khan."
      }
    },
    {
      id: "khanbaliq", region: "con", x: 668, y: 140,
      zh: "大都", en: "Khanbaliq",
      exZh: "夜宴之上,大汗问起各国风物,又问昨夜之梦。满殿皆静,无人敢妄言。",
      exEn: "At the night banquet the Khan asked of far kingdoms — and then of last night's dreams. The hall fell silent.",
      gate: {
        type: "dreamChoice",
        pZh: "你昨夜梦见了什么?向大汗直言你的梦。",
        pEn: "What did you dream? Answer the Khan truly.",
        options: [
          { sym: "🕊️", zh: "梦见飞越群山", en: "Flying over mountains",
            rZh: "大汗抚掌:「志在高远,是远行人的梦。」赐盘缠二。", rEn: "The Khan smiles: 'A traveler's dream of high aims.' +2 provisions.",
            coins: 2, favor: 0 },
          { sym: "🌊", zh: "梦见碧海无涯", en: "A boundless green sea",
            rZh: "大汗沉吟:「海路……你终将由海路归乡。」护佑加一。", rEn: "The Khan muses: 'The sea… you will go home by sea.' +1 blessing.",
            coins: 0, favor: 1 },
          { sym: "🏮", zh: "梦见故乡灯火", en: "The lamps of home",
            rZh: "大汗默然良久:「莫忘归途,亦莫负此行。」盘缠、护佑各加一。", rEn: "The Khan is long silent: 'Forget not the way home, nor waste the way here.' +1 each.",
            coins: 1, favor: 1 }
        ]
      }
    },
    {
      id: "quanzhou", region: "mazu", x: 700, y: 262,
      zh: "泉州(刺桐)", en: "Quanzhou (Zayton)",
      exZh: "刺桐港帆樯如林,胡椒之盛,百倍于亚历山大。船人说,离港须先在天妃宫掷得圣筊。",
      exEn: "At Zayton the masts stand thick as a forest; for one shipload of pepper at Alexandria, a hundred come here. No ship leaves before Sheng-jiao is cast at the Tianfei temple.",
      gate: {
        type: "jiaobei",
        pZh: "天妃宫前掷筊问海路平安:得圣筊方可登船。(前三掷为敬,不耗盘缠)",
        pEn: "Cast the moon blocks before Mazu for safe passage: Sheng-jiao grants boarding. (First three casts are free, as is proper.)"
      }
    },
    {
      id: "voyage", region: "mazu", x: 598, y: 332,
      zh: "归航 · 断案", en: "The Voyage Home · Case",
      exZh: "一二九一年冬,我们奉命以十四艘四桅巨舶,护送阔阔真公主浮海西行,远嫁波斯。",
      exEn: "In the winter of 1291 we were charged to escort the princess Kokochin over the sea to Persia, with fourteen great four-masted ships.",
      gate: { type: "case" }
    }
  ],

  /* ===== 章末断案:沉波之珠 The Pearl Beneath the Waves ===== */
  case: {
    titleZh: "沉波之珠", titleEn: "The Pearl Beneath the Waves",
    introZh: "船队驶出泉州七日,遭遇大风。风息之后,献给伊利汗的贡珠竟从封匣中消失了。匣上封漆完好,钥匙只在公主的女官与船队主事手中。副使指认舵手,舵手闭口不言,公主彻夜未眠。你受命查明真相——可借三种占法问事。",
    introEn: "Seven days out of Quanzhou, a great storm struck. When it passed, the tribute pearl for the Ilkhan was gone from its sealed casket — seal unbroken, keys held only by the princess's lady and the fleet steward. The envoy accuses the helmsman; the helmsman will not speak; the princess has not slept. You may consult three traditions to find the truth.",
    methods: [
      { id: "tarot", ic: "🔮",
        cZh: "塔罗现「倒吊人」正位:一次自愿的牺牲、一次倒转的奉献——有人为了更大的东西,交出了贵重之物。",
        cEn: "The Tarot shows the Hanged Man upright: a willing sacrifice, an offering inverted — someone gave up a treasure for something greater." },
      { id: "iching", ic: "☯",
        cZh: "起卦得「涣」:风行水上,凝滞消散。卦辞不指向贪取,而指向「散之于水,以聚人心」。",
        cEn: "The cast yields Huan, Dispersion: wind over water. It speaks not of theft, but of 'giving to the water, to regather the hearts of men.'" },
      { id: "jiaobei", ic: "🌗",
        cZh: "你代舵手问天妃:「珠可还在船上?」——连得两个阴筊。再问「珠在海中?」——圣筊落地。",
        cEn: "You ask Mazu for the helmsman: 'Is the pearl aboard?' — twice Yin-jiao. 'Is it in the sea?' — Sheng-jiao falls." },
      { id: "astrodice", ic: "🎲",
        cZh: "星辰骰掷出:月亮 · 天蝎 · 第十二宫——隐匿、深水、不可言说之事。有人在守一个秘密,但未必是恶意。",
        cEn: "The dice fall: Moon, Scorpio, the Twelfth House — hiddenness, deep water, the unspeakable. Someone keeps a secret, not surely a wicked one." },
      { id: "dream", ic: "🌙",
        cZh: "公主说出她风暴当夜的梦:一颗明珠沉入碧波,化作一盏灯,风浪随之平息。",
        cEn: "The princess tells her dream from the night of the storm: a pearl sank into green waves, became a lantern, and the sea grew calm." }
    ],
    options: [
      { id: "envoy",
        zh: "波斯副使畏惧海盗,私藏了贡珠", en: "The Persian envoy hid the pearl, fearing pirates",
        grade: "下下", gradeEn: "Ill",
        endZh: "副使被搜身问罪,一无所获。使团颜面尽失,行程在猜忌中继续。抵达波斯后,珠终未寻回,你的名字被史官轻轻略过。",
        endEn: "The envoy is searched and shamed; nothing is found. The mission sails on in suspicion. The pearl is never found, and the chroniclers pass over your name in silence.",
        score: 0 },
      { id: "helmsman",
        zh: "老舵手在风暴之夜,将珠献给了妈祖", en: "The helmsman offered the pearl to Mazu in the storm",
        grade: "上上", gradeEn: "Supreme",
        endZh: "舵手终于开口:巨浪压顶之夜,他启开封匣暗扣,以船上最贵重之物投海祭天妃——「船上三百条性命,重过一颗珠。」公主闻之,取出自己的东珠补入贡匣:「以此珠谢那盏灯。」船队安然抵达波斯。史载:贡礼无缺,海路无恙。",
        endEn: "The helmsman speaks at last: at the storm's height he opened the casket's hidden clasp and gave the ship's greatest treasure to Mazu — 'Three hundred lives weigh more than one pearl.' The princess places her own pearl in the casket: 'For the lantern in the waves.' The fleet reaches Persia; the chronicles record the tribute complete, the sea-road safe.",
        score: 3 },
      { id: "clerk",
        zh: "贡珠从未上船——泉州港吏调了包", en: "The pearl never sailed — a Quanzhou clerk switched it",
        grade: "中平", gradeEn: "Even",
        endZh: "文书发回泉州彻查,一名港吏含冤下狱。半年后真相大白时,船队早已远去。你查案的方向不算全错——珠确实不在船上——只是错认了让它离开的手。",
        endEn: "Word is sent back to Quanzhou; a clerk is wrongly jailed. The truth surfaces half a year later, long after the fleet has gone. You were half right — the pearl was not aboard — but wrong about the hand that let it go.",
        score: 1 }
    ]
  }
}];
