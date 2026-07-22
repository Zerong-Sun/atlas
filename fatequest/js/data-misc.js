/* Astro dice · zodiac · jiaobei · dream dictionary · BaZi tables · daily lots */
window.FQ = window.FQ || {};

/* ---------- Astro dice ---------- */
FQ.DICE_PLANETS = [
  { sym:"☉", zh:"太阳", en:"Sun",     kZh:"本我与活力",   kEn:"identity & vitality" },
  { sym:"☽", zh:"月亮", en:"Moon",    kZh:"情绪与需求",   kEn:"feelings & needs" },
  { sym:"☿", zh:"水星", en:"Mercury", kZh:"沟通与讯息",   kEn:"messages & thinking" },
  { sym:"♀", zh:"金星", en:"Venus",   kZh:"爱与价值",     kEn:"love & value" },
  { sym:"♂", zh:"火星", en:"Mars",    kZh:"行动与勇气",   kEn:"drive & courage" },
  { sym:"♃", zh:"木星", en:"Jupiter", kZh:"扩张与幸运",   kEn:"growth & luck" },
  { sym:"♄", zh:"土星", en:"Saturn",  kZh:"责任与磨砺",   kEn:"duty & discipline" },
  { sym:"♅", zh:"天王星", en:"Uranus",  kZh:"突变与自由", kEn:"surprise & freedom" },
  { sym:"♆", zh:"海王星", en:"Neptune", kZh:"梦想与直觉", kEn:"dreams & intuition" },
  { sym:"♇", zh:"冥王星", en:"Pluto",   kZh:"蜕变与深流", kEn:"transformation" },
  { sym:"☊", zh:"北交点", en:"North Node", kZh:"使命方向", kEn:"destiny's pull" },
  { sym:"⚷", zh:"凯龙星", en:"Chiron",  kZh:"疗愈之钥",   kEn:"healing" }
];
FQ.DICE_HOUSES = [
  { n:1,  zh:"自我之宫", en:"self" },        { n:2,  zh:"财帛之宫", en:"resources" },
  { n:3,  zh:"沟通之宫", en:"communication" },{ n:4, zh:"家庭之宫", en:"home" },
  { n:5,  zh:"创造之宫", en:"creativity" },  { n:6,  zh:"日常之宫", en:"daily work" },
  { n:7,  zh:"关系之宫", en:"partnership" }, { n:8,  zh:"蜕变之宫", en:"shared depths" },
  { n:9,  zh:"远方之宫", en:"exploration" }, { n:10, zh:"事业之宫", en:"career" },
  { n:11, zh:"同好之宫", en:"community" },   { n:12, zh:"潜识之宫", en:"the unseen" }
];

/* ---------- Western zodiac ---------- */
FQ.ZODIAC = [
  { id:"aries",      sym:"♈", zh:"白羊座", en:"Aries",      from:[3,21],  to:[4,19],  elemZh:"火", elemEn:"Fire",  rulerZh:"火星", rulerEn:"Mars" },
  { id:"taurus",     sym:"♉", zh:"金牛座", en:"Taurus",     from:[4,20],  to:[5,20],  elemZh:"土", elemEn:"Earth", rulerZh:"金星", rulerEn:"Venus" },
  { id:"gemini",     sym:"♊", zh:"双子座", en:"Gemini",     from:[5,21],  to:[6,21],  elemZh:"风", elemEn:"Air",   rulerZh:"水星", rulerEn:"Mercury" },
  { id:"cancer",     sym:"♋", zh:"巨蟹座", en:"Cancer",     from:[6,22],  to:[7,22],  elemZh:"水", elemEn:"Water", rulerZh:"月亮", rulerEn:"Moon" },
  { id:"leo",        sym:"♌", zh:"狮子座", en:"Leo",        from:[7,23],  to:[8,22],  elemZh:"火", elemEn:"Fire",  rulerZh:"太阳", rulerEn:"Sun" },
  { id:"virgo",      sym:"♍", zh:"处女座", en:"Virgo",      from:[8,23],  to:[9,22],  elemZh:"土", elemEn:"Earth", rulerZh:"水星", rulerEn:"Mercury" },
  { id:"libra",      sym:"♎", zh:"天秤座", en:"Libra",      from:[9,23],  to:[10,23], elemZh:"风", elemEn:"Air",   rulerZh:"金星", rulerEn:"Venus" },
  { id:"scorpio",    sym:"♏", zh:"天蝎座", en:"Scorpio",    from:[10,24], to:[11,22], elemZh:"水", elemEn:"Water", rulerZh:"冥王星", rulerEn:"Pluto" },
  { id:"sagittarius",sym:"♐", zh:"射手座", en:"Sagittarius",from:[11,23], to:[12,21], elemZh:"火", elemEn:"Fire",  rulerZh:"木星", rulerEn:"Jupiter" },
  { id:"capricorn",  sym:"♑", zh:"摩羯座", en:"Capricorn",  from:[12,22], to:[1,19],  elemZh:"土", elemEn:"Earth", rulerZh:"土星", rulerEn:"Saturn" },
  { id:"aquarius",   sym:"♒", zh:"水瓶座", en:"Aquarius",   from:[1,20],  to:[2,18],  elemZh:"风", elemEn:"Air",   rulerZh:"天王星", rulerEn:"Uranus" },
  { id:"pisces",     sym:"♓", zh:"双鱼座", en:"Pisces",     from:[2,19],  to:[3,20],  elemZh:"水", elemEn:"Water", rulerZh:"海王星", rulerEn:"Neptune" }
];

/* daily star-note fragments (seeded pick: focus + advice) */
FQ.STAR_FOCUS = [
  { zh:"沟通与表达", en:"conversations" }, { zh:"财务与资源", en:"money matters" },
  { zh:"感情与联结", en:"relationships" }, { zh:"事业与目标", en:"career goals" },
  { zh:"健康与节奏", en:"health & pace" }, { zh:"学习与远行", en:"learning & travel" },
  { zh:"家庭与归属", en:"home & belonging" }, { zh:"创意与玩心", en:"creativity & play" }
];
FQ.STAR_ADVICE = [
  { zh:"宜主动出击，星象站在行动者一边。", en:"Fortune favors the one who moves first today." },
  { zh:"宜倾听多于表达，答案藏在别人的话里。", en:"Listen more than you speak; the answer hides in others' words." },
  { zh:"放慢半拍，细节里有被忽略的礼物。", en:"Slow down half a beat — a gift waits in the details." },
  { zh:"旧友或旧事重现，带来新的线索。", en:"Something from the past returns bearing a new clue." },
  { zh:"直觉今日格外准，第一感觉值得信。", en:"Intuition runs strong; trust the first flash." },
  { zh:"小小的整理会带来大大的顺畅。", en:"A small tidy-up unlocks a big flow." },
  { zh:"适合许愿与立计划，种子会记得今天。", en:"Plant wishes and plans — seeds remember this day." },
  { zh:"留一点余裕给意外，它可能是惊喜。", en:"Leave room for the unexpected; it may be a gift." }
];

/* ---------- Jiaobei ---------- */
FQ.JIAOBEI = [
  { id:"sheng", w:2, tKey:"jiaobei.sheng",
    dZh:"一正一反，如月相合。所问之事可以放心推进，但记得心存感念。",
    dEn:"One up, one down — the crescents agree. Proceed with a grateful heart." },
  { id:"xiao", w:1, tKey:"jiaobei.xiao",
    dZh:"双正面朝上，神明轻笑：问题也许还没问到点子上，理清楚再来。",
    dEn:"Both flat side up — the gods chuckle. Sharpen the question and ask again." },
  { id:"yin", w:1, tKey:"jiaobei.yin",
    dZh:"双反面朝上，此事眼下不宜。不是拒绝你，而是护住你。",
    dEn:"Both round side up — not now. Not a rejection, but a protection." }
];

/* ---------- Dream dictionary (Zhou Gong × Jung) ---------- */
FQ.DREAMS = [
  { keys:["飞","飞翔","flying","fly"], sym:"🕊️", zh:"飞翔", en:"Flying",
    zhouZh:"梦飞升者，志气高远，近有跃迁之机。", zhouEn:"To fly is to rise; a leap in life draws near.",
    jungZh:"渴望超越现状，也提醒你别与现实失联。", jungEn:"A wish to transcend — while keeping feet findable." },
  { keys:["坠","坠落","掉下","falling","fall"], sym:"🌀", zh:"坠落", en:"Falling",
    zhouZh:"梦坠者，心有所惧，宜稳步减速。", zhouEn:"Falling mirrors fear; slow your steps and steady.",
    jungZh:"对失控的焦虑浮出水面，练习交托与松手。", jungEn:"Anxiety about control surfacing; practice release." },
  { keys:["蛇","serpent","snake"], sym:"🐍", zh:"蛇", en:"Snake",
    zhouZh:"梦蛇多主机遇与財气，亦须防小人。", zhouEn:"Snakes bring chance and fortune — and sly rivals.",
    jungZh:"蜕皮的原型：一部分旧我准备更新。", jungEn:"The shedding archetype: an old self ready to renew." },
  { keys:["水","河","海","游泳","water","river","sea","swim","ocean"], sym:"🌊", zh:"水", en:"Water",
    zhouZh:"清水主吉顺，浊水宜静心；情绪如潮起落。", zhouEn:"Clear water favors; murky water counsels calm.",
    jungZh:"水是潜意识本身，梦提醒你倾听情绪的暗流。", jungEn:"Water is the unconscious; heed the undercurrent." },
  { keys:["牙","牙齿","掉牙","teeth","tooth"], sym:"🦷", zh:"牙齿", en:"Teeth",
    zhouZh:"梦落齿者，旧事将别，亦须问候家中长辈。", zhouEn:"Falling teeth: an era parts; greet your elders.",
    jungZh:"与形象、力量感有关的焦虑，正在换新。", jungEn:"Anxieties of image and potency, mid-renewal." },
  { keys:["追","被追","逃","chase","chased","escape","run"], sym:"🏃", zh:"追逐", en:"Being chased",
    zhouZh:"梦被追者，心有未了之事，宜直面而解。", zhouEn:"Pursuit marks unfinished business; turn and face it.",
    jungZh:"被回避的阴影在敲门，它其实想被接纳。", jungEn:"The avoided shadow knocks, asking to be owned." },
  { keys:["死","死亡","death","die"], sym:"🦋", zh:"死亡", en:"Death",
    zhouZh:"梦死得生，大凶化大吉，旧局将换新篇。", zhouEn:"Dream-death turns auspicious: a chapter reborn.",
    jungZh:"心理结构的转化仪式，告别即成长。", jungEn:"A rite of inner transformation; farewell is growth." },
  { keys:["考试","迟到","考","exam","test","late"], sym:"⏰", zh:"考试 / 迟到", en:"Exam / Late",
    zhouZh:"梦试而急者，责己过甚，宜宽己三分。", zhouEn:"Exam panic bespeaks self-judgment; soften it.",
    jungZh:"内在评审者太严格，试着为自己重新打分。", jungEn:"The inner examiner grades too hard; regrade kindly." },
  { keys:["屋","房","家","house","home","room"], sym:"🏠", zh:"房屋", en:"House",
    zhouZh:"梦得广厦者身心安顿，梦屋漏者宜自检根基。", zhouEn:"A grand house shelters; a leaking one asks repair.",
    jungZh:"房子是自我的地图，每个房间都是一部分你。", jungEn:"The house maps the psyche; each room a part of you." },
  { keys:["火","着火","fire","burning"], sym:"🔥", zh:"火", en:"Fire",
    zhouZh:"梦火主兴旺变动，火旺者事速成，防急躁。", zhouEn:"Fire heralds swift rise and change; mind haste.",
    jungZh:"强烈的能量与热情要求出口，给它一个创作。", jungEn:"Fierce energy demands an outlet — make something." },
  { keys:["婴","孩子","婴儿","baby","child"], sym:"👶", zh:"婴儿", en:"Baby",
    zhouZh:"梦婴孩者主新生，新计划得贵人乳养。", zhouEn:"An infant augurs beginnings tenderly nursed.",
    jungZh:"内在新生的自我需要被照看和承诺。", jungEn:"A newborn aspect of self asks for care and commitment." },
  { keys:["迷路","迷","lost","maze"], sym:"🧭", zh:"迷路", en:"Lost",
    zhouZh:"梦失路者，谋事未定，宜问故人。", zhouEn:"Losing the road: plans unset; ask an old friend.",
    jungZh:"方向感交还给直觉重新校准，迷途亦是路。", jungEn:"Recalibrating by intuition; the detour is the way." },
  { keys:["猫","cat"], sym:"🐈", zh:"猫", en:"Cat",
    zhouZh:"梦猫者宜察暗处之事，亦主灵性親近。", zhouEn:"Cats point to hidden matters and quiet spirit.",
    jungZh:"独立而神秘的女性面向在靠近。", jungEn:"The independent, mysterious feminine draws near." },
  { keys:["狗","dog"], sym:"🐕", zh:"狗", en:"Dog",
    zhouZh:"梦犬主忠友之助，有信可依。", zhouEn:"Dogs promise loyal aid; trust is at hand.",
    jungZh:"本能中忠诚护卫的部分醒着。", jungEn:"The instinct of loyal guardianship is awake." },
  { keys:["钱","黄金","金","money","gold","coin"], sym:"💰", zh:"财宝", en:"Treasure",
    zhouZh:"梦得财者未必主财，主心有所值。", zhouEn:"Dream-wealth speaks less of coin than of worth.",
    jungZh:"你在重新估量什么才真正珍贵。", jungEn:"You are re-appraising what is truly precious." },
  { keys:["桥","bridge"], sym:"🌉", zh:"桥", en:"Bridge",
    zhouZh:"梦过桥者事有转圜，过则通达。", zhouEn:"Crossing a bridge: passage and mediation ahead.",
    jungZh:"两个阶段之间的过渡正在发生。", jungEn:"A transition between life stages underway." },
  { keys:["山","mountain","climb","爬山"], sym:"⛰️", zh:"山", en:"Mountain",
    zhouZh:"梦登山者志在高处，一步一阶自有顶。", zhouEn:"Climbing augurs high aims; the summit comes stepwise.",
    jungZh:"个体化之路：辛苦本身即意义。", jungEn:"The individuation path — the effort is the meaning." },
  { keys:["雨","rain"], sym:"🌧️", zh:"雨", en:"Rain",
    zhouZh:"梦雨主润泽，久旱之事得甘霖。", zhouEn:"Rain moistens what was parched; relief arrives.",
    jungZh:"压抑的情绪终于落地，是净化不是阴霾。", jungEn:"Held emotion finally falls — cleansing, not gloom." },
  { keys:["门","door","gate"], sym:"🚪", zh:"门", en:"Door",
    zhouZh:"梦开门者机遇立至，闭门者且候时。", zhouEn:"An opening door: opportunity; a shut one: wait.",
    jungZh:"心理边界与新可能的阈限。", jungEn:"Threshold of boundaries and new possibility." },
  { keys:["星","月","moon","star"], sym:"✨", zh:"星月", en:"Stars & Moon",
    zhouZh:"梦星月者主名望清辉，宜守夜而思。", zhouEn:"Stars and moon shine on repute; keep a quiet vigil.",
    jungZh:"遥远而确定的指引，理想在导航。", jungEn:"Distant, steady guidance — ideals navigating." }
];

/* ---------- BaZi tables ---------- */
FQ.STEMS = [
  { zh:"甲", elem:"木", yy:"阳" }, { zh:"乙", elem:"木", yy:"阴" },
  { zh:"丙", elem:"火", yy:"阳" }, { zh:"丁", elem:"火", yy:"阴" },
  { zh:"戊", elem:"土", yy:"阳" }, { zh:"己", elem:"土", yy:"阴" },
  { zh:"庚", elem:"金", yy:"阳" }, { zh:"辛", elem:"金", yy:"阴" },
  { zh:"壬", elem:"水", yy:"阳" }, { zh:"癸", elem:"水", yy:"阴" }
];
FQ.BRANCHES = [
  { zh:"子", elem:"水", animal:"鼠", aEn:"Rat" },   { zh:"丑", elem:"土", animal:"牛", aEn:"Ox" },
  { zh:"寅", elem:"木", animal:"虎", aEn:"Tiger" }, { zh:"卯", elem:"木", animal:"兔", aEn:"Rabbit" },
  { zh:"辰", elem:"土", animal:"龙", aEn:"Dragon" },{ zh:"巳", elem:"火", animal:"蛇", aEn:"Snake" },
  { zh:"午", elem:"火", animal:"马", aEn:"Horse" }, { zh:"未", elem:"土", animal:"羊", aEn:"Goat" },
  { zh:"申", elem:"金", animal:"猴", aEn:"Monkey" },{ zh:"酉", elem:"金", animal:"鸡", aEn:"Rooster" },
  { zh:"戌", elem:"土", animal:"狗", aEn:"Dog" },   { zh:"亥", elem:"水", animal:"猪", aEn:"Pig" }
];
FQ.ELEM_COLORS = { "木":"#7ecb6b", "火":"#ff7a6b", "土":"#d9a05b", "金":"#e8e4d8", "水":"#7db4e8" };
FQ.ELEM_EN = { "木":"Wood", "火":"Fire", "土":"Earth", "金":"Metal", "水":"Water" };
/* day-master one-liners by element */
FQ.DAYMASTER_NOTES = {
  "木": { zh:"日主属木：生发向上，重成长与仁心，宜找到能扎根的土壤。", en:"Wood Day Master: growth-minded and kind — seek soil to root in." },
  "火": { zh:"日主属火：明亮外放，重热情与礼敬，宜留柴薪养长明。", en:"Fire Day Master: bright and warm — keep fuel for the long flame." },
  "土": { zh:"日主属土：厚重承载，重信义与稳定，宜适时松土纳新。", en:"Earth Day Master: steady and trustworthy — loosen the soil for the new." },
  "金": { zh:"日主属金：肃杀果决，重原则与义气，宜以水润其锋。", en:"Metal Day Master: decisive and principled — let water soften the edge." },
  "水": { zh:"日主属水：灵动智慧，重流通与应变，宜有河道以聚其势。", en:"Water Day Master: fluid and wise — a channel gathers your force." }
};

/* ---------- Daily fortune lots (签) ---------- */
FQ.LOTS = [
  { g:"上上", gEn:"Supreme", zh:"云开月正明，万事可速行。贵人自远至，好风凭借力。", en:"Clouds part, the moon shines clear — act swiftly; helpful hands arrive on a fair wind." },
  { g:"上吉", gEn:"Great",  zh:"春木逢甘雨，枝头次第开。所求终有应,只欠自登台。", en:"Spring wood meets sweet rain; what you seek will answer — you need only step forward." },
  { g:"中吉", gEn:"Good",   zh:"行舟遇顺水，撑篙莫倚闲。小成今日得，大成待明天。", en:"Your boat rides a fair current — keep the pole moving; small wins today feed a larger one." },
  { g:"中平", gEn:"Even",   zh:"云淡风也轻，得失两相平。守常即是福，无事小神仙。", en:"Light clouds, mild wind; balance holds. Ordinary steadiness is today's quiet blessing." },
  { g:"小吉", gEn:"Fair",   zh:"石上磨利刃，功到自然成。莫嫌进境慢，稳字值千金。", en:"The blade sharpens slowly on stone; unhurried steadiness is worth gold." },
  { g:"下下", gEn:"Testing",zh:"夜雨路难行，且宿待天晴。心安茅屋稳,不必强赶程。", en:"Night rain makes hard roads — shelter, rest, and wait for morning; do not force the march." }
];

/* method registry for the home map (playable + locked) */
FQ.METHODS = [
  { id:"tarot",     ic:"🔮", color:"var(--c-tarot)",     playable:true },
  { id:"iching",    ic:"☯",  color:"var(--c-iching)",    playable:true },
  { id:"bazi",      ic:"🏮", color:"var(--c-bazi)",      playable:true },
  { id:"western",   ic:"♈",  color:"var(--c-western)",   playable:true },
  { id:"runes",     ic:"ᚠ",  color:"var(--c-runes)",     playable:true },
  { id:"dream",     ic:"🌙", color:"var(--c-dream)",     playable:true },
  { id:"astrodice", ic:"🎲", color:"var(--c-astrodice)", playable:true },
  { id:"jiaobei",   ic:"🌗", color:"var(--c-jiaobei)",   playable:true },
  { id:"meihua",    ic:"🌸", color:"var(--c-meihua)",    playable:true },
  { id:"ziwei",     ic:"🌌", lockKey:"locked.ziwei",     playable:false },
  { id:"qimen",     ic:"🧭", lockKey:"locked.qimen",     playable:false },
  { id:"lenormand", ic:"🃁", lockKey:"locked.lenormand", playable:false }
];
