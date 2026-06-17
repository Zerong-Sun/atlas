export type AtlasLocale = "zh-CN" | "zh-TW" | "en-US" | "ja-JP" | "ko-KR";
export type CulturalLens = "native" | "comparative" | "diaspora" | "academic";
export type TerminologyMode = "translated" | "bilingual" | "original";

export type CulturalProfile = {
  locale: AtlasLocale;
  lens: CulturalLens;
  terminology: TerminologyMode;
};

export type LocaleOption = {
  id: AtlasLocale;
  label: string;
  nativeLabel: string;
  description: string;
};

export type CulturalLensOption = {
  id: CulturalLens;
  label: string;
  description: string;
};

export type TerminologyOption = {
  id: TerminologyMode;
  label: string;
  description: string;
};

export const DEFAULT_CULTURAL_PROFILE: CulturalProfile = {
  locale: "zh-CN",
  lens: "comparative",
  terminology: "bilingual",
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  {
    id: "zh-CN",
    label: "简体中文",
    nativeLabel: "简体中文",
    description: "默认以中文术语和现代白话解释呈现。",
  },
  {
    id: "zh-TW",
    label: "繁体中文",
    nativeLabel: "繁體中文",
    description: "保留更多传统术语，适合港澳台与繁中读者。",
  },
  {
    id: "en-US",
    label: "English",
    nativeLabel: "English",
    description: "用英文解释东方术语，并保留关键原文。",
  },
  {
    id: "ja-JP",
    label: "日语",
    nativeLabel: "日本語",
    description: "面向日本语境，强调签、宿曜与阴阳道的对应关系。",
  },
  {
    id: "ko-KR",
    label: "韩语",
    nativeLabel: "한국어",
    description: "面向韩国语境，强调 Saju/Myungli 与四柱体系的亲缘性。",
  },
];

export const CULTURAL_LENS_OPTIONS: CulturalLensOption[] = [
  {
    id: "comparative",
    label: "文明对照",
    description: "默认模式：同一问题并列不同文明的提问方式、证据和分歧。",
  },
  {
    id: "native",
    label: "本土语境",
    description: "尽量按该传统内部术语解释，减少外部类比。",
  },
  {
    id: "diaspora",
    label: "跨文化入门",
    description: "为不熟悉该传统的用户补充背景，避免术语门槛。",
  },
  {
    id: "academic",
    label: "研究注释",
    description: "强调来源、历史流变和不确定性，适合学习和写作。",
  },
];

export const TERMINOLOGY_OPTIONS: TerminologyOption[] = [
  {
    id: "bilingual",
    label: "双语并列",
    description: "保留原词，同时给出目标语言解释。",
  },
  {
    id: "translated",
    label: "译名优先",
    description: "优先使用目标语言译名，降低理解门槛。",
  },
  {
    id: "original",
    label: "原词优先",
    description: "保留传统内部称呼，适合熟悉术语的用户。",
  },
];

export const CULTURAL_METHOD_GROUPS = [
  {
    id: "east-asian",
    title: "东亚术数与民俗",
    description: "把时间、方位、气、关系与礼俗放在同一个秩序里理解。",
    methodIds: ["bazi", "bazi-relationship", "iching", "liuyao", "meihua", "qimen", "ziwei", "fengshui", "lot", "jiaobei"],
  },
  {
    id: "astro",
    title: "星占与天文传统",
    description: "用天体周期解释人生节律，强调长周期、宫位和时机。",
    methodIds: ["western", "vedic", "astrodice"],
  },
  {
    id: "cards-symbols",
    title: "卡牌、符文与象征投射",
    description: "通过抽取、排列和图像联想，让问题在象征中显形。",
    methodIds: ["tarot", "lenormand", "oracle", "runes", "geomancy"],
  },
  {
    id: "folk-vision",
    title: "民俗观察与凝视",
    description: "从梦、身体、杯痕、水晶和日常征兆进入解释。",
    methodIds: ["dream", "coffee", "scrying", "xiangmian", "palmistry"],
  },
] as const;

export const METHOD_CULTURAL_ALIASES: Record<string, Partial<Record<AtlasLocale, string>>> = {
  bazi: {
    "zh-CN": "八字 / 四柱命盘",
    "zh-TW": "八字 / 四柱命盤",
    "en-US": "Four Pillars / Ba Zi",
    "ja-JP": "四柱推命 / 八字",
    "ko-KR": "사주명리 / 팔자",
  },
  iching: {
    "zh-CN": "周易 / 易经",
    "zh-TW": "周易 / 易經",
    "en-US": "I Ching / Book of Changes",
    "ja-JP": "易経",
    "ko-KR": "주역",
  },
  qimen: { "en-US": "Qi Men Dun Jia", "ja-JP": "奇門遁甲", "ko-KR": "기문둔갑" },
  ziwei: { "en-US": "Zi Wei Dou Shu", "ja-JP": "紫微斗数", "ko-KR": "자미두수" },
  western: { "en-US": "Western Astrology", "ja-JP": "西洋占星術", "ko-KR": "서양 점성술" },
  vedic: { "en-US": "Vedic Astrology / Jyotisha", "ja-JP": "インド占星術", "ko-KR": "인도 점성술" },
  tarot: { "en-US": "Tarot", "ja-JP": "タロット", "ko-KR": "타로" },
  lenormand: { "en-US": "Petit Lenormand", "ja-JP": "ルノルマンカード", "ko-KR": "르노르망 카드" },
  geomancy: { "zh-CN": "土占 / 西方地占", "en-US": "Geomancy", "ja-JP": "ジオマンシー", "ko-KR": "지오맨시" },
  runes: { "en-US": "Elder Futhark Runes", "ja-JP": "ルーン占い", "ko-KR": "룬 점" },
  coffee: { "zh-CN": "咖啡渣占卜 / 土耳其咖啡占", "en-US": "Coffee Ground Reading / Tasseography" },
  scrying: { "zh-CN": "水晶凝视 / 凝视占卜", "en-US": "Scrying / Crystal Gazing" },
};

export function getLocalizedMethodName(methodId: string, locale: AtlasLocale): string | undefined {
  return METHOD_CULTURAL_ALIASES[methodId]?.[locale];
}
