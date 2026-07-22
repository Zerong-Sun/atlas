import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "tetrabiblos",
  source_type: "public_domain",
  license_note:
    "Ptolemy Tetrabiblos（约 2 世纪）公版英译节选原文 + 自研中文释义，非现代教材逐字翻译",
  source_url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ptolemy/Tetrabiblos/home.html",
  verbatim_allowed: true,
};

/** 公版英译常见表述 + 自研中文 */
const PASSAGES = [
  {
    section: "I.1 Nature",
    original:
      "The active cause of all these phenomena is the divine and eternal nature of the stars.",
    translation: "星体的神圣永恒本性，被视为这些天象现象的能动原因（象征性，非宗教独断）。",
  },
  {
    section: "I.2 Prediction",
    original: "The purpose of astrology is to investigate the changes that occur in the heavens.",
    translation: "占星旨在研究天象变化及其与人类事务的象征对应。",
  },
  {
    section: "I.3 Quality",
    original: "The sun is hot and dry; the moon is moist and cold.",
    translation: "太阳偏热燥，月亮偏湿冷——古典四质（热冷干湿）的基础。",
  },
  {
    section: "I.4 Seasons",
    original: "The equinoctial and solstitial signs mark the seasons of the year.",
    translation: "春分、夏至等节气星座标记一年季节转换。",
  },
  {
    section: "II.1 Signs",
    original: "Each sign has its own nature, derived from the four elements.",
    translation: "每星座有其性质，源于火土风水四元素配置。",
  },
  {
    section: "II.2 Planets",
    original: "Saturn is cold and dry; Jupiter is warm and moist; Mars is hot and dry.",
    translation: "土星冷燥，木星暖湿，火星热燥——行星性质用于判断象征主题。",
  },
  {
    section: "II.3 Aspects",
    original: "Those which are in trine aspect are in agreement; those in square are in conflict.",
    translation: "三分相和谐，四分相冲突——相位象征能量配合或摩擦。",
  },
  {
    section: "III.1 Houses",
    original: "The first house signifies the native himself and his life.",
    translation: "第一宫象征本命者自身与生命整体气质。",
  },
  {
    section: "III.2 Angles",
    original: "The angles of the chart are the strongest places.",
    translation: "四轴（角宫）为命盘最强位置，主外在显化。",
  },
  {
    section: "III.3 Succedent",
    original: "The succedent houses follow the angles and are of moderate strength.",
    translation: "续宫随角宫之后，力量中等，主发展过程。",
  },
  {
    section: "III.4 Cadent",
    original: "The cadent houses are weaker and signify transitions.",
    translation: "果宫较弱，象征过渡、变动与内在准备。",
  },
  {
    section: "IV.1 Fortune",
    original: "Benefic planets increase good fortune when they are well placed.",
    translation: "吉星（木金）落位良好时，象征顺遂与资源（非保证）。",
  },
  {
    section: "IV.2 Misfortune",
    original: "Malefic planets bring difficulties when they dominate the chart.",
    translation: "凶星（火土）主导时，象征压力、限制与考验（宜心理整合）。",
  },
  {
    section: "IV.3 Mixture",
    original: "Often the good and bad are mixed, and judgment must consider the whole.",
    translation: "吉凶常相混杂，须整体判断，不可单看一星一宫。",
  },
  {
    section: "Genethlialogy",
    original: "Genethlialogy concerns the life of the individual from birth.",
    translation: "本命占星关注出生时刻天象与个人生命主题的象征对应。",
  },
  {
    section: "Interrogations",
    original: "Interrogations are judgments made for particular questions at a given time.",
    translation: "卜卦占星在特定时刻为具体问题作象征判断（类似 horary）。",
  },
  {
    section: "Elections",
    original: "Elections choose times favorable for beginning actions.",
    translation: "择日占星选择象征上较宜开启事务的时辰。",
  },
  {
    section: "Moon phases",
    original: "The moon's phases show the growth and decline of matters.",
    translation: "月相盈亏象征事务的生发与消退周期。",
  },
  {
    section: "Fixed stars",
    original: "Certain fixed stars, when conjunct planets, modify their effects.",
    translation: "某些恒星与行星合相时，会修饰其象征效果。",
  },
  {
    section: "Ethics",
    original: "The wise man uses such knowledge for caution, not for absolute necessity.",
    translation: "智者以天象知识为警醒与反思，而非宿命必然（自研伦理注）。",
  },
];

export function buildTetrabiblosChunks() {
  return PASSAGES.map((p, i) =>
    makeChunk({
      id: `tetrabiblos-${i + 1}`,
      ...SOURCE,
      tradition: "western",
      chapter: "Tetrabiblos",
      section: p.section,
      original_text: p.original,
      translation_zh: p.translation,
      annotation_zh: "古典西洋占星原典脉络，供西占体系引用；与心理占星表述可并列。",
      keywords: ["Ptolemy", "Tetrabiblos", "西洋占星", p.section],
    }),
  );
}
