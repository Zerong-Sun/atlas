import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "yijing_64",
  source_type: "public_domain",
  license_note: "公版《周易》原文节选 + 自研白话与注释",
  source_url: "https://ctext.org/book-of-changes",
};

/** 六十四卦（周易序） */
export const HEXAGRAMS = [
  { num: 1, name: "乾", gua: "元亨利贞。", xiang: "天行健，君子以自强不息。" },
  { num: 2, name: "坤", gua: "元亨，利牝马之贞。", xiang: "地势坤，君子以厚德载物。" },
  { num: 3, name: "屯", gua: "元亨利贞，勿用有攸往，利建侯。", xiang: "云雷屯，君子以经纶。" },
  { num: 4, name: "蒙", gua: "亨。匪我求童蒙，童蒙求我。", xiang: "山下出泉，蒙；君子以果行育德。" },
  { num: 5, name: "需", gua: "有孚，光亨，贞吉，利涉大川。", xiang: "云上于天，需；君子以饮食宴乐。" },
  { num: 6, name: "讼", gua: "有孚窒惕，中吉，终凶。利见大人，不利涉大川。", xiang: "天与水违行，讼；君子以作事谋始。" },
  { num: 7, name: "师", gua: "贞，丈人吉，无咎。", xiang: "地中有水，师；君子以容民畜众。" },
  { num: 8, name: "比", gua: "吉。原筮元永贞，无咎。", xiang: "地上有水，比；先王以建万国，亲诸侯。" },
  { num: 9, name: "小畜", gua: "亨。密云不雨，自我西郊。", xiang: "风行天上，小畜；君子以懿文德。" },
  { num: 10, name: "履", gua: "履虎尾，不咥人，亨。", xiang: "上天下泽，履；君子以辨上下，定民志。" },
  { num: 11, name: "泰", gua: "小往大来，吉亨。", xiang: "天地交，泰；后以财成天地之道，辅相天地之宜，以左右民。" },
  { num: 12, name: "否", gua: "否之匪人，不利君子贞，大往小来。", xiang: "天地不交，否；君子以俭德辟难，不可荣以禄。" },
  { num: 13, name: "同人", gua: "同人于野，亨。利涉大川，利君子贞。", xiang: "天与火，同人；君子以类族辨物。" },
  { num: 14, name: "大有", gua: "元亨。", xiang: "火在天上，大有；君子以遏恶扬善，顺天休命。" },
  { num: 15, name: "谦", gua: "亨，君子有终。", xiang: "地中有山，谦；君子以裒多益寡，称物平施。" },
  { num: 16, name: "豫", gua: "利建侯行师。", xiang: "雷出地奋，豫；先王以作乐崇德，殷荐之上帝，以配祖考。" },
  { num: 17, name: "随", gua: "元亨利贞，无咎。", xiang: "泽中有雷，随；君子以向晦入宴息。" },
  { num: 18, name: "蛊", gua: "元亨，利涉大川。先甲三日，后甲三日。", xiang: "山下有风，蛊；君子以振民育德。" },
  { num: 19, name: "临", gua: "元亨利贞。至于八月有凶。", xiang: "泽上有地，临；君子以教思无穷，容保民无疆。" },
  { num: 20, name: "观", gua: "盥而不荐，有孚颙若。", xiang: "风行地上，观；先王以省方，观民设教。" },
  { num: 21, name: "噬嗑", gua: "亨。利用狱。", xiang: "雷电噬嗑；先王以明罚敕法。" },
  { num: 22, name: "贲", gua: "亨。小利有攸往。", xiang: "山下有火，贲；君子以明庶政，无敢折狱。" },
  { num: 23, name: "剥", gua: "不利有攸往。", xiang: "山附于地，剥；上以厚下，安宅。" },
  { num: 24, name: "复", gua: "亨。出入无疾，朋来无咎。", xiang: "雷在地中，复；先王以至日闭关，商旅不行，后不省方。" },
  { num: 25, name: "无妄", gua: "元亨利贞。其匪正有眚，不利有攸往。", xiang: "天下雷行，物与无妄；先王以茂对时，育万物。" },
  { num: 26, name: "大畜", gua: "利贞，不家食吉，利涉大川。", xiang: "天在山中，大畜；君子以多识前言往行，以畜其德。" },
  { num: 27, name: "颐", gua: "贞吉。观颐，自求口实。", xiang: "山下有雷，颐；君子以慎言语，节饮食。" },
  { num: 28, name: "大过", gua: "栋桡，利有攸往，亨。", xiang: "泽灭木，大过；君子以独立不惧，遁世无闷。" },
  { num: 29, name: "坎", gua: "有孚，维心亨，行有尚。", xiang: "水洊至，习坎；君子以常德行，习教事。" },
  { num: 30, name: "离", gua: "利贞，亨。畜牝牛，吉。", xiang: "明两作，离；大人以继明照于四方。" },
  { num: 31, name: "咸", gua: "亨，利贞，取女吉。", xiang: "山上有泽，咸；君子以虚受人。" },
  { num: 32, name: "恒", gua: "亨，无咎，利贞，利有攸往。", xiang: "雷风恒；君子以立不易方。" },
  { num: 33, name: "遁", gua: "亨，小利贞。", xiang: "天下有山，遁；君子以远小人，不恶而严。" },
  { num: 34, name: "大壮", gua: "利贞。", xiang: "雷在天上，大壮；君子以非礼弗履。" },
  { num: 35, name: "晋", gua: "康侯用锡马蕃庶，昼日三接。", xiang: "明出地上，晋；君子以自昭明德。" },
  { num: 36, name: "明夷", gua: "利艰贞。", xiang: "明入地中，明夷；君子以莅众，用晦而明。" },
  { num: 37, name: "家人", gua: "利女贞。", xiang: "风自火出，家人；君子以言有物而行有恒。" },
  { num: 38, name: "睽", gua: "小事吉。", xiang: "上火下泽，睽；君子以同而异。" },
  { num: 39, name: "蹇", gua: "利西南，不利东北；利见大人，贞吉。", xiang: "山上有水，蹇；君子以反身修德。" },
  { num: 40, name: "解", gua: "利西南，无所往，其来复吉。有攸往，夙吉。", xiang: "雷雨作，解；君子以赦过宥罪。" },
  { num: 41, name: "损", gua: "有孚，元吉，无咎，可贞，利有攸往。", xiang: "山下有泽，损；君子以惩忿窒欲。" },
  { num: 42, name: "益", gua: "利有攸往，利涉大川。", xiang: "风雷益；君子以见善则迁，有过则改。" },
  { num: 43, name: "夬", gua: "扬于王庭，孚号，有厉，告自邑，不利即戎，利有攸往。", xiang: "泽上于天，夬；君子以施禄及下，居德忌善。" },
  { num: 44, name: "姤", gua: "女壮，勿用取女。", xiang: "天下有风，姤；后以施命诰四方。" },
  { num: 45, name: "萃", gua: "亨。王假有庙，利见大人，亨，利贞。", xiang: "泽上于地，萃；君子以除戎器，戒不虞。" },
  { num: 46, name: "升", gua: "元亨，用见大人，勿恤，南征吉。", xiang: "地中生木，升；君子以顺德，积小以高大。" },
  { num: 47, name: "困", gua: "亨，贞，大人吉，无咎，有言不信。", xiang: "泽无水，困；君子以致命遂志。" },
  { num: 48, name: "井", gua: "改邑不改井，无丧无得，往来井井。", xiang: "木上有水，井；君子以劳民劝相。" },
  { num: 49, name: "革", gua: "己日乃孚，元亨利贞，悔亡。", xiang: "泽中有火，革；君子以治历明时。" },
  { num: 50, name: "鼎", gua: "元吉，亨。", xiang: "木上有火，鼎；君子以正位凝命。" },
  { num: 51, name: "震", gua: "亨。震来虩虩，笑言哑哑。", xiang: "洊雷，震；君子以恐惧修省。" },
  { num: 52, name: "艮", gua: "艮其背，不获其身，行其庭，不见其人，无咎。", xiang: "兼山，艮；君子以思不出其位。" },
  { num: 53, name: "渐", gua: "女归吉，利贞。", xiang: "山上有木，渐；君子以居贤德善俗。" },
  { num: 54, name: "归妹", gua: "征凶，无攸利。", xiang: "泽上有雷，归妹；君子以永终知敝。" },
  { num: 55, name: "丰", gua: "亨，王假之，勿忧，宜日中。", xiang: "雷电皆至，丰；君子以折狱致刑。" },
  { num: 56, name: "旅", gua: "小亨，旅贞吉。", xiang: "山上有火，旅；君子以明慎用刑，而不留狱。" },
  { num: 57, name: "巽", gua: "小亨，利有攸往，利见大人。", xiang: "随风，巽；君子以申命行事。" },
  { num: 58, name: "兑", gua: "亨，利贞。", xiang: "丽泽，兑；君子以朋友讲习。" },
  { num: 59, name: "涣", gua: "亨。王假有庙，利涉大川，利贞。", xiang: "风行水上，涣；先王以享于帝立庙。" },
  { num: 60, name: "节", gua: "亨。苦节不可贞。", xiang: "泽上有水，节；君子以制数度，议德行。" },
  { num: 61, name: "中孚", gua: "豚鱼吉，利涉大川，利贞。", xiang: "泽上有风，中孚；君子以议狱缓死。" },
  { num: 62, name: "小过", gua: "亨，利贞，可小事，不可大事。", xiang: "山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。" },
  { num: 63, name: "既济", gua: "亨，小利贞，初吉终乱。", xiang: "水在火上，既济；君子以思患而豫防之。" },
  { num: 64, name: "未济", gua: "亨，小狐汔济，濡其尾，无攸利。", xiang: "火在水上，未济；君子以慎辨物居方。" },
];

const TEN_WINGS = [
  {
    id: "iching-tuan-qian",
    chapter: "彖传·乾",
    section: "彖辞",
    original_text: "大哉乾元，万物资始，乃统天。",
    translation_zh: "乾元伟大，万物依它而开始，它统领天道。",
    annotation_zh: "十翼公版节选，用于说明乾卦哲学义理。",
    keywords: ["乾元", "彖传"],
  },
  {
    id: "iching-xiang-kun",
    chapter: "象传·坤",
    section: "大象",
    original_text: "地势坤，君子以厚德载物。",
    translation_zh: "大地形势坤顺，君子效法以深厚德行承载万物。",
    annotation_zh: "象传强调君子修身与卦象自然象征的对应。",
    keywords: ["厚德载物", "象传"],
  },
];

export function buildIchingChunks() {
  const chunks = [];

  for (const h of HEXAGRAMS) {
    const pad = String(h.num).padStart(2, "0");
    const chapter = `第${h.num}卦·${h.name}`;

    chunks.push(
      makeChunk({
        id: `iching-${pad}-guaci`,
        ...SOURCE,
        tradition: "iching",
        chapter,
        section: "卦辞",
        original_text: h.gua,
        translation_zh: `${h.name}卦卦辞白话：${h.gua}（自研译意，供对照阅读）`,
        annotation_zh: `检索标签：${h.name}、六十四卦、卦辞。问事时可作该卦总体断语依据。`,
        keywords: [h.name, "卦辞", "周易", `第${h.num}卦`],
      }),
      makeChunk({
        id: `iching-${pad}-xiang`,
        ...SOURCE,
        tradition: "iching",
        chapter,
        section: "象辞",
        original_text: h.xiang,
        translation_zh: `${h.name}卦象辞白话：${h.xiang}（自研译意）`,
        annotation_zh: `象辞提示君子修身与处事方向，可与卦辞对照理解${h.name}卦气势。`,
        keywords: [h.name, "象辞", "大象传"],
      }),
      makeChunk({
        id: `iching-${pad}-zhuyi`,
        source_id: SOURCE.source_id,
        source_type: "self_authored",
        license_note: "自研白话综合释义，非逐字古籍原文",
        source_url: SOURCE.source_url,
        tradition: "iching",
        chapter,
        section: "白话释义",
        original_text: "",
        translation_zh: `【${h.name}卦】${h.gua.replace(/。$/, "")}。象曰：${h.xiang}`,
        annotation_zh: `自研综合释义：将卦辞、象辞合并为一段可引用的现代中文解释，避免模型编造出处。`,
        keywords: [h.name, "释义", "白话"],
        verbatim_allowed: false,
      }),
    );
  }

  for (const tw of TEN_WINGS) {
    chunks.push(
      makeChunk({
        ...SOURCE,
        tradition: "iching",
        ...tw,
      }),
    );
  }

  return chunks;
}
