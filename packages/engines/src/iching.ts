/** 64 hexagrams — names and brief judgments (self-authored summaries for MVP) */
export const HEXAGRAMS: Record<number, { name: string; judgment: string; image: string }> = {
  1: { name: "乾", judgment: "元亨利贞。", image: "天行健，君子以自强不息。" },
  2: { name: "坤", judgment: "元亨，利牝马之贞。", image: "地势坤，君子以厚德载物。" },
  3: { name: "屯", judgment: "元亨利贞，勿用有攸往。", image: "云雷屯，君子以经纶。" },
  4: { name: "蒙", judgment: "亨。匪我求童蒙，童蒙求我。", image: "山下出泉，蒙；君子以果行育德。" },
  5: { name: "需", judgment: "有孚，光亨，贞吉。", image: "云上于天，需；君子以饮食宴乐。" },
  6: { name: "讼", judgment: "有孚窒惕，中吉，终凶。", image: "天与水违行，讼；君子以作事谋始。" },
  7: { name: "师", judgment: "贞，丈人吉，无咎。", image: "地中有水，师；君子以容民畜众。" },
  8: { name: "比", judgment: "吉。原筮元永贞，无咎。", image: "地上有水，比；先王以建万国，亲诸侯。" },
  9: { name: "小畜", judgment: "亨。密云不雨，自我西郊。", image: "风行天上，小畜；君子以懿文德。" },
  10: { name: "履", judgment: "履虎尾，不咥人，亨。", image: "上天下泽，履；君子以辨上下，定民志。" },
  11: { name: "泰", judgment: "小往大来，吉亨。", image: "天地交，泰；后以财成天地之道。" },
  12: { name: "否", judgment: "否之匪人，不利君子贞。", image: "天地不交，否；君子以俭德辟难。" },
  13: { name: "同人", judgment: "同人于野，亨。", image: "天与火，同人；君子以类族辨物。" },
  14: { name: "大有", judgment: "元亨。", image: "火在天上，大有；君子以遏恶扬善。" },
  15: { name: "谦", judgment: "亨，君子有终。", image: "地中有山，谦；君子以裒多益寡。" },
  16: { name: "豫", judgment: "利建侯行师。", image: "雷出地奋，豫；先王以作乐崇德。" },
  17: { name: "随", judgment: "元亨利贞，无咎。", image: "泽雷随，君子以向晦入宴息。" },
  18: { name: "蛊", judgment: "元亨，利涉大川。", image: "山下有风，蛊；君子以振民育德。" },
  19: { name: "临", judgment: "元亨利贞。至于八月有凶。", image: "泽上有地，临；君子以教思无穷。" },
  20: { name: "观", judgment: "盥而不荐，有孚颙若。", image: "风行地上，观；先王以省方观民设教。" },
  21: { name: "噬嗑", judgment: "亨。利用狱。", image: "雷电噬嗑，先王以明罚敕法。" },
  22: { name: "贲", judgment: "亨。小利有攸往。", image: "山下有火，贲；君子以明庶政。" },
  23: { name: "剥", judgment: "不利有攸往。", image: "山附于地，剥；上以厚下安宅。" },
  24: { name: "复", judgment: "亨。出入无疾，朋来无咎。", image: "雷在地中，复；先王以至日闭关。" },
  25: { name: "无妄", judgment: "元亨利贞。其匪正有眚。", image: "天下雷行，无妄；先王以茂对时育万物。" },
  26: { name: "大畜", judgment: "利贞，不家食吉，利涉大川。", image: "天在山中，大畜；君子以多识前言往行。" },
  27: { name: "颐", judgment: "贞吉。观颐，自求口实。", image: "山下有雷，颐；君子以慎言语，节饮食。" },
  28: { name: "大过", judgment: "栋桡，利有攸往，亨。", image: "泽灭木，大过；君子以独立不惧。" },
  29: { name: "坎", judgment: "有孚，维心亨，行有尚。", image: "水洊至，坎；君子以常德行，习教事。" },
  30: { name: "离", judgment: "利贞，亨。畜牝牛，吉。", image: "明两作，离；大人以继明照于四方。" },
  31: { name: "咸", judgment: "亨，利贞，取女吉。", image: "山上有泽，咸；君子以虚受人。" },
  32: { name: "恒", judgment: "亨，无咎，利贞，利有攸往。", image: "雷风恒，君子以立不易方。" },
  33: { name: "遁", judgment: "亨，小利贞。", image: "天下有山，遁；君子以远小人。" },
  34: { name: "大壮", judgment: "利贞。", image: "雷在天上，大壮；君子以非礼弗履。" },
  35: { name: "晋", judgment: "康侯用锡马蕃庶，昼日三接。", image: "明出地上，晋；君子以自昭明德。" },
  36: { name: "明夷", judgment: "利艰贞。", image: "明入地中，明夷；君子以莅众，用晦而明。" },
  37: { name: "家人", judgment: "利女贞。", image: "风自火出，家人；君子以言有物而行有恒。" },
  38: { name: "睽", judgment: "小事吉。", image: "上火下泽，睽；君子以同而异。" },
  39: { name: "蹇", judgment: "利西南，不利东北；利见大人，贞吉。", image: "山上有水，蹇；君子以反身修德。" },
  40: { name: "解", judgment: "利西南，无所往，其来复吉。", image: "雷雨作，解；君子以赦过宥罪。" },
  41: { name: "损", judgment: "有孚，元吉，无咎，可贞，利有攸往。", image: "山下有泽，损；君子以惩忿窒欲。" },
  42: { name: "益", judgment: "利有攸往，无咎，贞吉。", image: "风雷益，君子以见善则迁，有过则改。" },
  43: { name: "夬", judgment: "扬于王庭，孚号，有厉。", image: "泽上于天，夬；君子以施禄及下。" },
  44: { name: "姤", judgment: "女壮，勿用取女。", image: "天下有风，姤；后以施命诰四方。" },
  45: { name: "萃", judgment: "亨。王假有庙，利见大人，亨，利贞。", image: "泽上于地，萃；君子以除戎器，戒不虞。" },
  46: { name: "升", judgment: "元亨，用见大人，勿恤，南征吉。", image: "地中生木，升；君子以顺德，积小以高大。" },
  47: { name: "困", judgment: "亨，贞，大人吉，无咎，有言不信。", image: "泽无水，困；君子以致命遂志。" },
  48: { name: "井", judgment: "改邑不改井，无丧无得，往来井井。", image: "木上有水，井；君子以劳民劝相。" },
  49: { name: "革", judgment: "己日乃孚，元亨利贞，悔亡。", image: "泽中有火，革；君子以治历明时。" },
  50: { name: "鼎", judgment: "元吉，亨。", image: "木上有火，鼎；君子以正位凝命。" },
  51: { name: "震", judgment: "亨。震来虩虩，笑言哑哑。", image: "洊雷，震；君子以恐惧修省。" },
  52: { name: "艮", judgment: "艮其背，不获其身，行其庭，不见其人，无咎。", image: "兼山，艮；君子以思不出其位。" },
  53: { name: "渐", judgment: "女归吉，利贞。", image: "山上有木，渐；君子以居贤德善俗。" },
  54: { name: "归妹", judgment: "征凶，无攸利。", image: "雷泽归妹，君子以永终知敝。" },
  55: { name: "丰", judgment: "亨，王假之，勿忧，宜日中。", image: "雷电皆至，丰；君子以折狱致刑。" },
  56: { name: "旅", judgment: "小亨，旅贞吉。", image: "山上有火，旅；君子以明慎用刑。" },
  57: { name: "巽", judgment: "小亨，利有攸往，利见大人。", image: "随风，巽；君子以申命行事。" },
  58: { name: "兑", judgment: "亨，利贞。", image: "丽泽，兑；君子以朋友讲习。" },
  59: { name: "涣", judgment: "亨。王假有庙，王假有庙，利涉大川，利贞。", image: "风行水上，涣；先王以享于帝立庙。" },
  60: { name: "节", judgment: "亨。苦节不可贞。", image: "泽上有水，节；君子以制数度，议德行。" },
  61: { name: "中孚", judgment: "豚鱼吉，利涉大川，利贞。", image: "泽上有风，中孚；君子以议狱缓死。" },
  62: { name: "小过", judgment: "亨，利贞，可小事，不可大事。", image: "山上有雷，小过；君子以行过乎恭，丧过乎哀。" },
  63: { name: "既济", judgment: "亨，小利贞，初吉终乱。", image: "水在火上，既济；君子以思患而豫防之。" },
  64: { name: "未济", judgment: "亨，小狐汔济，濡其尾，无攸利。", image: "火在水上，未济；君子以慎辨物居方。" },
};

function seededInt(seed: string, max: number): number {
  return hashSeed(seed) % max;
}

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function hexagramLines(number: number): Array<"yang" | "yin"> {
  return Array.from({ length: 6 }, (_, index) => ((number >> index) & 1 ? "yang" : "yin"));
}

export function castIChing(seed: string): Record<string, unknown> {
  const primary = seededInt(seed, 64) + 1;
  const changing = seededInt(seed + "change", 64) + 1;
  const hex = HEXAGRAMS[primary];
  const changeHex = HEXAGRAMS[changing];

  return {
    primary: { number: primary, lines: hexagramLines(primary), ...hex },
    changing: { number: changing, lines: hexagramLines(changing), ...changeHex },
    method: "time_number",
    summary: `本卦${hex.name}，变卦${changeHex.name}`,
  };
}
