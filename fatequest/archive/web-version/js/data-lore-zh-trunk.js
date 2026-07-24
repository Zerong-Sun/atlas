/* Trunk-station Chinese bodies (方案 A hand polish).
   Patches FQ.MARCO_LORE.places[*].bodyZh after data-marco-lore.js loads.
   Marks zhStatus done on patched places; leaves English bodyEn untouched. */
window.FQ = window.FQ || {};

FQ.LORE_ZH_TRUNK = {
  tauris: {
    zhStatus: "done",
    bodyZh: "大不里士是波斯路上最喧闹的枢纽之一。波罗写道：城大、商多，来自印度、报达、霍尔木兹与地中海的货物在此交汇；丝绸、香料与宝石在巴扎拱顶下论价。城外有美丽的果园，城内有各教信众——景教徒、穆斯林与其他行人同走一条街。商旅说，能在大不里士站住脚的人，才算真正进了亚洲的市声。"
  },
  "descent-to-the-city-of-hormos": {
    zhStatus: "done",
    bodyZh: "下忽鲁谟斯的路又热又干。波罗记这座海港：船只来自印度与更远的地方，装载香料、宝石、珍珠与织品；夏日热风如焚，人畜皆苦。港城靠贸易存活，不靠农田。船主与掮客用多种语言讨价，而真正的财富藏在底舱——一船胡椒，往往比一船银锭更叫人眼热。"
  },
  badashan: {
    zhStatus: "done",
    bodyZh: "巴达哈伤在高山之间，以巴剌斯红宝石与青金石闻名。波罗写其山谷、马匹与王统，也写旅行者如何在雪线与峡谷间换路。空气稀薄，夜星极近。当地人珍视宝石，却更珍视能把商队平安送过山口的向导——因为在这里，迷路比丢失一袋红玉更快致命。"
  },
  cascar: {
    zhStatus: "done",
    bodyZh: "可失合儿自称「大土耳其」的门户。波罗记其市集已异于波斯：羊皮帽、驼毛布、玉柄小刀，议价多用突厥语。城外绿洲梨树与葡萄成荫，雪水渠网比威尼斯的水道还整齐。葡萄架下，波罗遇见穿绯红袍、转经轮的喇嘛——帖必烈低声说：你已走出任何威尼斯人熟悉的地图。"
  },
  "great-province-of-tangut": {
    zhStatus: "done",
    bodyZh: "唐古忒省地广，波罗记其城邑、偶像寺与丧葬风俗。沙与雪在南北对峙，中间一条走廊把西域接到中原。商旅在此补充粮草与驮畜，也学会听懂更多口音。偶像寺的钟声与商队驼铃有时在同一黄昏响起——灵魂的出口不同，风却是同一个。"
  },
  campichu: {
    zhStatus: "done",
    bodyZh: "甘州是河西大城。波罗写其富庶、寺庙与驻军，也写大黄等土产。出关的人在此多留一日，把故乡口音多带一天；入关的人在此第一次听见真正的汉地市声。茶、炭与驼料在城门内外两套价钱——过了甘州，沙漠的算法才开始。"
  },
  chandu: {
    zhStatus: "done",
    bodyZh: "上都是大汗的夏都。波罗详记大理石宫殿、竹殿与御苑，以及大汗在此消夏听政的排场。金碧之下，礼官要求远人先卜一卦再入觐——仪式本身就是通行证。园中有奇兽与泉水；入夜灯火像另一座城倒映在湖上。能走到上都的人，才算被草原与宫殿同时看见。"
  },
  cambaluc: {
    zhStatus: "done",
    bodyZh: "汗八里（大都）城方正、街直如线。波罗惊叹其户口、市集与钞法：大汗的纸币通行国中，商旅以钞换货。城有十二门，鼓楼划分昼夜。夜宴之上，大汗会问起远国风物，也会问起梦——满殿皆静。这里是帝国的肚脐：运河、驿路与诏令都从这里向外辐射。"
  },
  "great-city-of-kinsay": {
    zhStatus: "done",
    bodyZh: "行在（杭州）被波罗称为世界最富丽的城之一。桥多、湖阔、市集昼夜不歇；丝绸与糖、鱼鲜与酒，都在石桥两侧流动。他写城中户数、浴池与消防，也写西湖风光。马可曾在此一带治事，说这里最像威尼斯：水多，桥多，人人可做一点买卖。雨打船篷的节奏，就是这座水城的心跳。"
  },
  "great-haven-of-zayton": {
    zhStatus: "done",
    bodyZh: "刺桐（泉州）港帆樯如林。波罗说：亚历山大有一船胡椒，刺桐便有百船。来自印度、波斯与南海的商船在此卸货，中国福船由此出洋。船人离港前，多在天妃宫掷筊问平安——圣筊落地，帆才敢满。港池边香料味与潮腥混在一起；两本游记，终将在同一码头相遇。"
  },
  /* authored short bodies for prologue nodes without lore place ids */
  _venice: {
    zhStatus: "done",
    bodyZh: "一二七一年，波罗一行自威尼斯启航。圣马可的狮与钟楼留在身后，教皇的书信与圣墓灯油装进行囊。海是威尼斯人的国土；从此向东，方言、货币与神明都会换一种说法。"
  },
  _acre: {
    zhStatus: "done",
    bodyZh: "阿卡是十字军余脉的港口。教廷特使在此补全致大汗的文书，圣殿骑士守着东行关文。过了阿卡，地中海的熟悉岸线结束，亚洲的尘土开始附着在靴底。"
  }
};

(function applyLoreZhTrunk() {
  const L = FQ.MARCO_LORE;
  if (!L || !L.places) return;
  const T = FQ.LORE_ZH_TRUNK;
  Object.keys(T).forEach(id => {
    if (id.startsWith("_")) return;
    if (!L.places[id]) return;
    L.places[id].bodyZh = T[id].bodyZh;
    L.places[id].zhStatus = T[id].zhStatus || "done";
    L.places[id].origin = "hybrid";
  });
  if (L.meta) {
    L.meta.zhStatus = "trunk-partial";
    L.meta.zhNote = "主干站（大不里士→刺桐等）已人工校译；其余仍为短导语。见 assets/data/glossary.json";
  }
  /* attach prologue blurbs onto node facts if journey nodes exist later */
  FQ.LORE_ZH_PROLOGUE = {
    venice: T._venice.bodyZh,
    acre: T._acre.bodyZh
  };
})();
