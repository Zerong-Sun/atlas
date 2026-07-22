import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "tarot_78",
  source_type: "self_authored",
  license_note: "自研小阿卡纳牌义摘要，非 Waite-Smith 原文复刻",
  source_url: null,
  verbatim_allowed: false,
};

const RANKS = [
  { rank: "A", name: "Ace", upright: "潜能、种子、新开端", reversed: "延迟、潜能未发、资源停滞" },
  { rank: "2", name: "二", upright: "选择、平衡、伙伴", reversed: "失衡、犹豫、分裂" },
  { rank: "3", name: "三", upright: "成长、协作、初步成果", reversed: "第三方干扰、成长受阻" },
  { rank: "4", name: "四", upright: "稳定、结构、休息", reversed: "僵化、不安、基础动摇" },
  { rank: "5", name: "五", upright: "冲突、竞争、考验", reversed: "和解、内耗减轻、逃避冲突" },
  { rank: "6", name: "六", upright: "调和、回馈、过渡", reversed: "亏欠、停滞、怀旧未放" },
  { rank: "7", name: "七", upright: "评估、坚持、策略", reversed: "自欺、策略失误、放弃" },
  { rank: "8", name: "八", upright: "推进、技艺、专注", reversed: "拖延、完美主义、动力不足" },
  { rank: "9", name: "九", upright: "接近完成、独处、检验", reversed: "焦虑、偏执、临门退缩" },
  { rank: "10", name: "十", upright: "圆满、负担、阶段完成", reversed: "崩解、过劳、结局拖延" },
  { rank: "P", name: "侍者", upright: "消息、学习、天真探索", reversed: "不成熟、拖延、坏消息" },
  { rank: "K", name: "骑士", upright: "行动、追求、快速变动", reversed: "鲁莽、方向错误、停滞" },
  { rank: "Q", name: "王后", upright: "内在成熟、滋养、掌握", reversed: "情绪不稳、依赖、内在匮乏" },
  { rank: "Kng", name: "国王", upright: "权威、掌控、外在成就", reversed: "专制、僵化、滥用权力" },
];

const SUITS = [
  { suit: "权杖", element: "火", domain: "行动、事业、热情" },
  { suit: "圣杯", element: "水", domain: "情感、关系、直觉" },
  { suit: "宝剑", element: "风", domain: "思维、冲突、真相" },
  { suit: "星币", element: "土", domain: "物质、金钱、身体" },
];

export function buildTarotMinorChunks() {
  const chunks = [];
  for (const s of SUITS) {
    for (const r of RANKS) {
      const id = `tarot-minor-${s.suit}-${r.rank}`;
      const chapter = `小阿卡纳·${s.suit}·${r.name}`;
      chunks.push(
        makeChunk({
          id: `${id}-up`,
          ...SOURCE,
          tradition: "tarot",
          chapter,
          section: "正位",
          original_text: "",
          translation_zh: `${s.suit}${r.name}正位：${r.upright}。${s.element}元素，常关${s.domain}。`,
          annotation_zh: "小阿卡纳自研牌义，与大牌对照使用。",
          keywords: [s.suit, r.name, "塔罗", "正位", "小阿卡纳"],
        }),
        makeChunk({
          id: `${id}-rev`,
          ...SOURCE,
          tradition: "tarot",
          chapter,
          section: "逆位",
          original_text: "",
          translation_zh: `${s.suit}${r.name}逆位：${r.reversed}。`,
          annotation_zh: "逆位多主阻滞、内化或过度。",
          keywords: [s.suit, r.name, "塔罗", "逆位", "小阿卡纳"],
        }),
      );
    }
  }
  return chunks;
}
