/* 师承 · The Lineage (GDD §4.9) — divination is LEARNED, not given.
   Each art belongs to a teacher who belongs to a place on the road.
   Reach the place → the teacher appears → pass the trial → the art is yours.
   Until then the realm stays dark, and roads that demand it stay shut. */
window.FQ = window.FQ || {};

/* trial.kind is resolved by quest.js; `need` is the passing condition text */
FQ.MENTORS = [
  {
    method: "tarot", at: "venice", auto: true, ic: "🔮",
    zh: "制牌人 老马蒂欧", en: "Matteo the Cardmaker",
    civZh: "威尼斯 · 里亚尔托桥下", civEn: "Venice · beneath the Rialto",
    introZh: "临行前夜，父亲带你去见一位制牌的老人。他把一叠手绘厚纸推过桌面：「这些牌不算命，它们只是把你已经知道的事，摆成看得见的样子。带上它们——路上没人陪你说话的时候，就跟牌说。」",
    introEn: "The night before departure your father takes you to an old cardmaker. He pushes a stack of hand-painted boards across the table: 'These don't tell fortunes. They lay out what you already know, where you can see it. Take them — when no one on the road will talk to you, talk to these.'",
    trial: { kind: "tarotDraw", need: 1,
      taskZh: "抽一张牌，认出它的正逆", taskEn: "Draw one card; know it upright from reversed" },
    gradZh: "「记住：逆位不是坏事，是同一件事的另一张脸。」老人把牌塞进你怀里，转身回作坊了。",
    gradEn: "'Remember: reversed is not ill — it is the same thing wearing its other face.' He presses the deck into your coat and returns to his workshop."
  },
  {
    method: "lenormand", at: "venice", ic: "🃁",
    zh: "牌铺女儿 卡特琳娜", en: "Caterina of the Card Shop",
    civZh: "威尼斯 · 制牌作坊", civEn: "Venice · the card workshop",
    introZh: "老马蒂欧的女儿在后间裁另一副牌——三十六张，画的全是近处的东西：信、船、钥匙、老鼠。「大牌问命，小牌问事。你要走的是路，不是命——带这副。」（几百年后，人们会用一位法国女占者的名字称呼它。）",
    introEn: "In the back room his daughter cuts a different deck — thirty-six cards of near things: letters, ships, keys, mice. 'The big cards ask about fate. These ask about Tuesday. You're walking a road, not a fate — take these.' (Centuries later they will bear a French fortune-teller's name.)",
    trial: { kind: "lenPair", need: 2,
      taskZh: "翻开三张，说出成对的两张", taskEn: "Turn three; name the two that speak together" },
    gradZh: "「牌与牌之间才有话。」卡特琳娜把牌扎成一小捆，用麻绳系上。",
    gradEn: "'The meaning lives between two cards, never in one.' She binds the deck with twine."
  },
  {
    method: "runes", at: "acre", ic: "ᚠ",
    zh: "瓦良格卫兵 哈拉尔", en: "Haraldr the Varangian",
    civZh: "阿卡 · 城墙夜哨", civEn: "Acre · the night watch",
    introZh: "阿卡城墙上，一个金发巨汉守着夜哨。他是从米克拉加德（君士坦丁堡）南下的瓦良格人，腰间挂着一只鹿皮袋。「我祖母说，字母是奥丁吊在树上九夜换来的。你要看看吗？——反正天亮前没别的事做。」",
    introEn: "On the walls of Acre a fair-haired giant keeps watch — a Varangian come south from Miklagard, a deerskin pouch at his belt. 'My grandmother said Odin hung nine nights on the tree to win these letters. Want to see? Nothing else to do before dawn.'",
    trial: { kind: "runeDraw", need: 3,
      taskZh: "自袋中取三枚石，念出其名", taskEn: "Draw three stones from the pouch and name them" },
    gradZh: "「石头不说话，是你在说话——石头只是让你慢下来听。」哈拉尔把鹿皮袋抛给你，回头继续望着海。",
    gradEn: "'The stones don't speak. You do — they only make you slow enough to hear it.' He tosses you the pouch and turns back to the sea."
  },
  {
    method: "astrodice", at: "tabriz", ic: "🎲",
    zh: "星家 帖必烈", en: "Tebrizi the Star-Reader",
    civZh: "大不里士 · 观星台", civEn: "Tabriz · the observatory",
    introZh: "大不里士的观星台上，老星家把三枚骨骰倒在铜盘里：「星盘要算一夜，骰子只要一瞬——同一片天，穷人也问得起。行星是『什么』，星座是『怎样』，宫位是『在哪儿』。就这三件事。」",
    introEn: "On the Tabriz observatory the old astrologer spills three bone dice into a brass tray: 'The astrolabe takes a night; the dice take a breath — the same sky, priced for the poor. Planet is what, sign is how, house is where. That is all there is.'",
    trial: { kind: "diceRoll", need: 1,
      taskZh: "掷出三骰，读出「何事 · 如何 · 何处」", taskEn: "Roll all three and read what · how · where" },
    gradZh: "帖必烈把骰子收进丝囊：「拿去。若你肯载我一程，我还教你看真的星。」",
    gradEn: "He drops the dice into a silk bag: 'Yours. And if you'll carry an old man east, I'll teach you the real stars too.'"
  },
  {
    method: "western", at: "hormuz", ic: "♈",
    zh: "海商星占 娜迪拉", en: "Nadira, Astrologer of the Port",
    civZh: "霍尔木兹 · 码头星占摊", civEn: "Hormuz · the quayside stall",
    introZh: "码头边一顶蓝布篷下，女子替出海的船工排星盘：「你生在什么时候，海就用什么脾气对你——这不是迷信，是船工愿意信的东西。信了，他们才敢上船。」",
    introEn: "Under a blue awning a woman casts charts for departing sailors: 'The hour you were born is the temper the sea takes with you. Not truth — but what a sailor needs to believe before he'll board.'",
    trial: { kind: "westernCast", need: 1,
      taskZh: "以生辰定出太阳星座", taskEn: "Fix a sun sign from a birth date" },
    gradZh: "「记得报吉时也要报凶时。」娜迪拉在你手心画了一个圈，「星象骗人，占者不能骗人。」",
    gradEn: "'Speak the ill hours as well as the fair.' She draws a circle on your palm. 'The stars may mislead. The reader must not.'"
  },
  {
    method: "meihua", at: "pamir", ic: "🌸",
    zh: "西行僧 明远", en: "Mingyuan, the Westbound Monk",
    civZh: "帕米尔 · 雪线驿棚", civEn: "The Pamir · a shelter at the snowline",
    introZh: "雪线上的驿棚里，一个汉地僧人正在烤冻硬的饼。「邵康节说，观梅落而知天机——不必等蓍草，不必备铜钱。此刻的数就是卦：驼铃响几声，你手边有几块柴。天机不在远处，在手边。」",
    introEn: "In a shelter at the snowline a monk from the Middle Kingdom toasts a frozen cake. 'Shao Yong watched plum blossoms fall and read the hour in them. No yarrow, no coins — the numbers of this very moment are the hexagram. How many camel bells; how many sticks at your hand. Heaven's hinge is not far away. It is beside you.'",
    trial: { kind: "meihuaCast", need: 1,
      taskZh: "以此刻之数起一卦", taskEn: "Cast a hexagram from the numbers of this moment" },
    gradZh: "僧人把饼掰一半给你：「卦不难起，难在起卦时心里那个问题干不干净。」",
    gradEn: "He breaks the cake and gives you half. 'Casting is easy. What is hard is having a clean question when you cast.'"
  },
  {
    method: "iching", at: "shangdu", ic: "☯",
    zh: "太史院 耶律先生", en: "Master Yelü of the Astronomical Bureau",
    civZh: "上都 · 太史院值房", civEn: "Shangdu · the Bureau's duty room",
    introZh: "太史院的值房里堆满历书。耶律先生看你一眼：「大汗殿前不许妄言，所以我们不说『吉凶』，只说『象』。三枚钱，六次掷，从下往上——下面是已成的，上面是将来的。学会了，你在这座宫里说话就有分量。」",
    introEn: "The duty room is stacked with almanacs. Master Yelü looks you over: 'Before the Khan we do not say lucky or ill — only what the image shows. Three coins, six castings, bottom upward: below is what has become, above what is coming. Learn it and your words carry weight in this palace.'",
    trial: { kind: "ichingCast", need: 3,
      taskZh: "掷六爻成卦，得阳爻三数以上", taskEn: "Cast six lines; three or more must come up yang" },
    gradZh: "耶律先生在你的行囊上盖了太史院的印：「有此印，沿途官驿不敢拦你。」",
    gradEn: "He stamps the Bureau's seal on your pack. 'With this, no post station on the road will turn you away.'"
  },
  {
    method: "dream", at: "khanbaliq", ic: "🌙",
    zh: "圆梦人 撒里蛮", end: null, ic2: null,
    en: "Sarïman, Reader of Dreams",
    civZh: "大都 · 宫墙外的圆梦摊", civEn: "Khanbaliq · a dream-stall outside the palace wall",
    introZh: "宫墙外摆着一张矮桌，桌上只有一支笔和一叠纸。「大汗昨夜梦见白马，满朝没人敢解。我解了——因为我懂一件事：梦不是预言，梦是你自己没说出口的话。你把它说出来，它就不吓人了。」",
    introEn: "A low table outside the wall holds a brush and a stack of paper. 'The Khan dreamt of a white horse last night; no minister dared read it. I did — because I know one thing. A dream is not prophecy. It is the sentence you did not say aloud. Say it, and it stops being frightening.'",
    trial: { kind: "dreamTell", need: 1,
      taskZh: "说出一个梦，认出其中的梦象", taskEn: "Tell a dream; find the symbol in it" },
    gradZh: "「周公与你们西边的人说的其实是一回事，」撒里蛮笑了，「只是他们管那个叫『灵魂』。」",
    gradEn: "'The Duke of Zhou and your westerners are saying the same thing,' he smiles, 'only they call it the soul.'"
  },
  {
    method: "bazi", at: "hangzhou", ic: "🏮",
    zh: "命馆先生 沈五", en: "Shen the Fifth, of the Fate Shop",
    civZh: "行在 · 御街命馆", civEn: "Kinsay · a fate shop on the Imperial Way",
    introZh: "御街上一间小命馆，招牌写着「沈五排盘」。「年月日时，四柱八字。这不是算你哪天发财——是看你这个人是什么材料：木要土养，金要水磨。知道自己是什么材料，才知道该往哪儿使劲。」",
    introEn: "A small shop on the Imperial Way: 'Shen the Fifth — Charts Cast.' 'Year, month, day, hour: four pillars, eight characters. This won't say when you'll get rich. It says what stuff you're made of. Wood wants earth; metal wants water. Know your material and you'll know where to spend yourself.'",
    trial: { kind: "baziCast", need: 1,
      taskZh: "排一张四柱盘，认出日主", taskEn: "Cast the four pillars and find the Day Master" },
    gradZh: "沈五收了你三文钱：「明码标价，童叟无欺。占者收钱不丢人，收了钱还骗人才丢人。」",
    gradEn: "He takes three coppers. 'Posted prices, no haggling. There is no shame in a diviner taking money — only in taking it and lying.'"
  },
  {
    method: "jiaobei", at: "quanzhou", ic: "🌗",
    zh: "天妃宫庙祝 陈婆", en: "Granny Chen, Keeper of the Tianfei Shrine",
    civZh: "泉州 · 天妃宫", civEn: "Quanzhou · the Tianfei temple",
    introZh: "天妃宫的老庙祝把两片红木塞进你手里：「一正一反是圣筊，准了；两个平面是笑筊，你问得不好，重问；两个圆面是阴筊，不准，别问了。三次为限——问三次还不应，是天妃嫌你烦。」",
    introEn: "The old shrine-keeper presses two red crescents into your hands: 'One up one down — she agrees. Both flat — she's laughing; your question was poor, ask better. Both round — no, and stop asking. Three casts is the limit. More than that and you are simply pestering her.'",
    trial: { kind: "jiaobeiCast", need: 1,
      taskZh: "掷出一次圣筊（三掷之内）", taskEn: "Cast Sheng-jiao within three throws" },
    gradZh: "陈婆点了三炷香：「记住，问神是为了定自己的心。心定了，神就答了。」",
    gradEn: "She lights three sticks of incense. 'You ask the goddess to settle your own heart. Once it settles, she has answered.'"
  }
];

FQ.mentorFor = m => FQ.MENTORS.find(x => x.method === m);
FQ.mentorsAt = nodeId => FQ.MENTORS.filter(x => x.at === nodeId);

/* Gates that need no schooling — anyone may toss a coin or draw a temple lot */
FQ.FREE_GATES = ["coinYang", "lot", "dreamChoice", "case", "tarotAny"];
/* which learned art a gate type demands */
FQ.GATE_METHOD = {
  tarotAny: "tarot", tarotLow: "tarot",
  diceFire: "astrodice", diceElem: "astrodice", diceHouse: "astrodice",
  meihua: "meihua", ichingYang: "iching", jiaobei: "jiaobei"
};
