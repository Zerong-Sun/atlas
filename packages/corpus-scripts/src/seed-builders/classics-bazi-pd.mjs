import { makeChunk } from "../lib/chunk-schema.mjs";

function pdSource(id, title, url) {
  return {
    source_id: id,
    source_type: "public_domain",
    license_note: `公版《${title}》原文节选 + 自研白话与注释，非现代译本逐字引用`,
    source_url: url,
    verbatim_allowed: true,
  };
}

const ZIPING = pdSource("ziping_zhenquan", "子平真诠", "https://ctext.org/wiki.pl?if=gb&res=80997");
const DITIAN = pdSource("ditiansui", "滴天髓", "https://ctext.org/wiki.pl?if=gb&res=80996");
const YUANHAI = pdSource("yuanhai_ziping", "渊海子平", "https://ctext.org/wiki.pl?if=gb&res=80995");

const ZIPING_PASSAGES = [
  {
    section: "论用神",
    original: "八字用神，专求月令，以日干配四柱，察其旺衰喜忌而定之。",
    translation: "八字取用神，首先要看月令；以日干对照四柱，观察旺衰与喜忌后再定用神。",
  },
  {
    section: "论格局",
    original: "格局既成，方论财官；格局未成，先看印比。",
    translation: "格局成立之后，再论财官；格局未成时，先看印星与比劫能否扶助日主。",
  },
  {
    section: "食神生财",
    original: "食神生财，财生官，官护印，印生身，循环相生，主贵。",
    translation: "食神生财、财生官、官护印、印生身，形成相生循环，多主贵气与顺遂。",
  },
  {
    section: "伤官见官",
    original: "伤官见官，为祸百端；若有印绶，化伤为秀。",
    translation: "伤官克正官，易生是非；若命局有印，可化伤官之秀，减轻冲突。",
  },
  {
    section: "财旺身弱",
    original: "财多身弱，不能任财，反为财所累。",
    translation: "财星太旺而日主弱，担不起财，反而被财所拖累。",
  },
  {
    section: "杀重身轻",
    original: "七杀太重，身轻难当，宜印化杀，或食制杀。",
    translation: "七杀过旺而日主弱，难以承受；宜用印化杀，或以食神制杀。",
  },
  {
    section: "阳刃",
    original: "阳刃重重，喜见七杀，杀无刃不显，刃无杀不威。",
    translation: "阳刃多见时，常喜七杀相配；无刃则杀不显赫，无杀则刃难施其威（须看全局平衡）。",
  },
  {
    section: "调候",
    original: "寒则暖之，燥则润之，过寒过燥，调候为先。",
    translation: "命局过寒宜暖，过燥宜润；寒暖失调时，调候往往优先于其他取用。",
  },
  {
    section: "从格",
    original: "从则宜顺，逆则宜扶，从旺从弱，各随所从。",
    translation: "从格宜顺其旺势，逆势则宜扶助；从旺、从弱须辨所从为何气。",
  },
  {
    section: "大运",
    original: "大运流年，如舟行水上，顺则速，逆则迟。",
    translation: "大运流年如同行舟水上，顺其用神则进展快，逆其喜忌则迟缓多阻。",
  },
];

const DITIAN_PASSAGES = [
  {
    section: "天道",
    original: "天道始万物，地道生万物，人道成万物。",
    translation: "天道开启万物，地道滋养万物，人道成就万物——命理亦在天地人三才中观气运。",
  },
  {
    section: "知命",
    original: "欲识三元万法宗，天元地元水元中。",
    translation: "要理解命理万法，须从天干、地支、纳音（水元）三层结构入手。",
  },
  {
    section: "刚柔",
    original: "能知刚柔之理，方合自然之妙。",
    translation: "懂得刚柔消长的道理，才合于自然运化的妙处。",
  },
  {
    section: "中和",
    original: "中和为贵，偏枯则战，战则凶。",
    translation: "中和为贵；偏枯则五行相战，战则多凶。",
  },
  {
    section: "旺衰",
    original: "旺者宜泄，弱者宜扶，太过不及，皆须调剂。",
    translation: "太旺宜泄，太弱宜扶；过与不及都要调剂。",
  },
  {
    section: "从化",
    original: "化则有情，从则有力，背化从势，各得其宜。",
    translation: "合化有情，从格有力；背乎化气、顺乎旺势，各得其宜。",
  },
  {
    section: "清浊",
    original: "清者气纯，浊者气杂，清则贵，浊则富或劳。",
    translation: "清气纯粹，浊气驳杂；清者多贵，浊者多富或劳碌（非绝对）。",
  },
  {
    section: "刑冲",
    original: "刑冲会合，全在用神，用神不伤，诸凶皆吉。",
    translation: "刑冲会合的影响，关键看是否伤及用神；用神无伤，诸凶可化吉。",
  },
  {
    section: "格局",
    original: "格局高低，全在用神之得力与否。",
    translation: "格局高低，取决于用神是否得力。",
  },
  {
    section: "行运",
    original: "运来则发，运背则滞，运与命合，如矢之中的。",
    translation: "大运顺命则发，背命则滞；运命相合，如箭中靶心。",
  },
];

const YUANHAI_PASSAGES = [
  {
    section: "论天干",
    original: "甲木参天，脱胎要火；春不容金，秋不容土。",
    translation: "甲木如参天大树，发荣需火；春木不宜金过克，秋木不宜土过埋。",
  },
  {
    section: "论乙木",
    original: "乙木虽柔，刲羊解牛；怀丁抱丙，跨马食蛇。",
    translation: "乙木虽柔，合局得火可炼金；怀丁抱丙，指春木向阳而荣。",
  },
  {
    section: "论丙火",
    original: "丙火猛烈，欺霜侮雪；能煅庚金，逢辛反怯。",
    translation: "丙火猛烈，可欺霜雪；能锻庚金，遇辛金反合而柔。",
  },
  {
    section: "论丁火",
    original: "丁火柔中，内性昭融；抱乙而孝，合壬而忠。",
    translation: "丁火柔中，内性光明；合乙木如孝，合壬水如忠（象意）。",
  },
  {
    section: "论戊土",
    original: "戊土固重，既中且正；静翕动辟，万物司命。",
    translation: "戊土厚重中正，静则收敛、动则开辟，为万物之司命。",
  },
  {
    section: "论己土",
    original: "己土卑湿，中正蓄藏；不愁木盛，不畏水狂。",
    translation: "己土卑湿，中正蓄藏；木盛可培，水狂可纳（象意）。",
  },
  {
    section: "论庚金",
    original: "庚金带煞，刚健为最；得水而清，得火而锐。",
    translation: "庚金带煞，刚健为性；得水则清，得火则锐。",
  },
  {
    section: "论辛金",
    original: "辛金软弱，温润而清；畏土之叠，乐水之盈。",
    translation: "辛金柔软温润而清；畏土厚埋，喜水滋润。",
  },
  {
    section: "论壬水",
    original: "壬水通河，能泄金气；刚中之德，周流不滞。",
    translation: "壬水通河，能泄金气；刚中而有德，周流不滞。",
  },
  {
    section: "论癸水",
    original: "癸水至弱，达于天津；得龙而运，功化斯神。",
    translation: "癸水至弱，可达天津；得辰龙而运，功化神奇（象意）。",
  },
  {
    section: "十干体象",
    original: "十干体象，各有性情，性情得所，则吉；失所，则凶。",
    translation: "十天干各有体象性情，性情得宜则吉，失宜则凶。",
  },
  {
    section: "十二支",
    original: "子为阳水，主智；午为阳火，主礼；卯酉为门户，主出入。",
    translation: "子为阳水主智，午为阳火主礼；卯酉为门户，主出入变动。",
  },
];

function buildPassages(source, tradition, bookLabel, passages) {
  return passages.map((p, i) =>
    makeChunk({
      id: `${source.source_id}-${i + 1}`,
      ...source,
      tradition,
      chapter: bookLabel,
      section: p.section,
      original_text: p.original,
      translation_zh: p.translation,
      annotation_zh: `公版命理文献节选，供八字解读引用；须结合排盘 facts，不可单条断吉凶。`,
      keywords: [bookLabel, p.section, "八字", "命理", source.source_id],
    }),
  );
}

export function buildClassicsBaziChunks() {
  return [
    ...buildPassages(ZIPING, "bazi", "子平真诠", ZIPING_PASSAGES),
    ...buildPassages(DITIAN, "bazi", "滴天髓", DITIAN_PASSAGES),
    ...buildPassages(YUANHAI, "bazi", "渊海子平", YUANHAI_PASSAGES),
  ];
}
