import type { ChunkRecord } from "./hybrid-retrieval.js";

/** Expanded offline corpus when DB is empty — sourced from corpus_v0_1 seed structure. */
export const SEED_CORPUS_FALLBACK: ChunkRecord[] = [
  {
    chunkId: "chunk-bazi-1",
    sourceId: "src-bazi-rules",
    tradition: "bazi",
    original: "日主强弱，以月令为先。",
    translationZh: "判断日主强弱，首先要看出生月份的地支（月令）。",
    keywords: ["日主", "月令", "强弱"],
  },
  {
    chunkId: "chunk-bazi-2",
    sourceId: "src-bazi-rules",
    tradition: "bazi",
    original: "正官者，克我之异性。",
    translationZh: "正官是克制日主且阴阳相异的十神，象征规则、职位与责任。",
    keywords: ["正官", "十神", "事业"],
  },
  {
    chunkId: "chunk-bazi-3",
    sourceId: "src-bazi-rules",
    tradition: "bazi",
    original: "财者，我克之五行。",
    translationZh: "财星为我所克之五行，主资源、收入与付出后的回报。",
    keywords: ["财星", "财富", "十神"],
  },
  {
    chunkId: "chunk-western-1",
    sourceId: "src-western-phrases",
    tradition: "western",
    original: "Sun in sign",
    translationZh: "太阳星座代表核心意志与生命主题。",
    keywords: ["太阳", "星座", "意志"],
  },
  {
    chunkId: "chunk-western-2",
    sourceId: "src-western-phrases",
    tradition: "western",
    original: "Moon in sign",
    translationZh: "月亮星座反映情绪需求、安全感与潜意识反应模式。",
    keywords: ["月亮", "情绪", "安全感"],
  },
  {
    chunkId: "chunk-western-3",
    sourceId: "src-western-phrases",
    tradition: "western",
    original: "Saturn transit",
    translationZh: "土星行运常带来责任加重、结构重整与延迟考验。",
    keywords: ["土星", "行运", "压力"],
  },
  {
    chunkId: "chunk-tarot-1",
    sourceId: "src-tarot-major",
    tradition: "tarot",
    original: "The Fool",
    translationZh: "愚者象征新的开始与信任旅程。",
    keywords: ["愚者", "开始", "冒险"],
  },
  {
    chunkId: "chunk-tarot-2",
    sourceId: "src-tarot-major",
    tradition: "tarot",
    original: "The Tower",
    translationZh: "高塔象征旧结构崩塌与被迫觉醒，变化来得突然。",
    keywords: ["高塔", "突变", "重建"],
  },
  {
    chunkId: "chunk-iching-1",
    sourceId: "src-yijing",
    tradition: "iching",
    original: "元亨利贞。",
    translationZh: "大通顺、利于正固。",
    keywords: ["乾", "元亨利贞"],
  },
  {
    chunkId: "chunk-iching-11",
    sourceId: "src-yijing",
    tradition: "iching",
    original: "小往大来，吉亨。",
    translationZh: "阴消阳长，吉祥亨通。",
    keywords: ["泰", "通泰"],
  },
  {
    chunkId: "chunk-iching-12",
    sourceId: "src-yijing",
    tradition: "iching",
    original: "否之匪人，不利君子贞。",
    translationZh: "闭塞不通，君子宜守正待时。",
    keywords: ["否", "闭塞", "守正"],
  },
  {
    chunkId: "chunk-qimen-1",
    sourceId: "src-qimen-rules",
    tradition: "qimen",
    original: "奇门以用神为主。",
    translationZh: "奇门断事以用神旺衰、格局与应期为核心。",
    keywords: ["奇门", "用神", "应期"],
  },
];

export function mapSeedChunk(raw: {
  id: string;
  source_id: string;
  tradition: string;
  original_text?: string;
  translation_zh?: string;
  annotation_zh?: string;
  keywords?: string[];
}): ChunkRecord {
  return {
    chunkId: raw.id,
    sourceId: raw.source_id,
    tradition: raw.tradition,
    original: raw.original_text ?? "",
    translationZh: raw.translation_zh ?? "",
    annotationZh: raw.annotation_zh,
    keywords: raw.keywords ?? [],
  };
}
