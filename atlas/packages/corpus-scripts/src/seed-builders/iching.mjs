import { readFileSync } from "node:fs";
import { makeChunk } from "../lib/chunk-schema.mjs";

const SOURCE = {
  source_id: "yijing_64",
  source_type: "public_domain",
  license_note: "公版《周易》原文节选 + 自研白话与注释",
  source_url: "https://ctext.org/book-of-changes",
};

/** 六十四卦（周易序） */
const classics=JSON.parse(readFileSync(new URL("../../../engines/src/data/iching-classics.json",import.meta.url),"utf8"));
export const HEXAGRAMS=Object.entries(classics).map(([num,h])=>({num:Number(num),name:h.name,gua:h.judgment,xiang:h.image,sourceUrl:h.sourceUrl}));

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
        source_url:h.sourceUrl,
        tradition: "iching",
        chapter,
        section: "卦辞",
        original_text: h.gua,
        translation_zh: `原典对照：${h.gua}（尚未提供逐句白话翻译）`,
        annotation_zh: `检索标签：${h.name}、六十四卦、卦辞。问事时可作该卦总体断语依据。`,
        keywords: [h.name, "卦辞", "周易", `第${h.num}卦`],
      }),
      makeChunk({
        id: `iching-${pad}-xiang`,
        ...SOURCE,
        source_url:h.sourceUrl,
        tradition: "iching",
        chapter,
        section: "象辞",
        original_text: h.xiang,
        translation_zh: `原典对照：${h.xiang}（尚未提供逐句白话翻译）`,
        annotation_zh: `象辞提示君子修身与处事方向，可与卦辞对照理解${h.name}卦气势。`,
        keywords: [h.name, "象辞", "大象传"],
      }),
      makeChunk({
        id: `iching-${pad}-zhuyi`,
        source_id: SOURCE.source_id,
        source_type: "self_authored",
        license_note: "Atlas 编排的经传对照，不是白话翻译",
        source_url: h.sourceUrl,
        tradition: "iching",
        chapter,
        section: "经传对照摘录",
        original_text: "",
        translation_zh: `【${h.name}卦】${h.gua.replace(/。$/, "")}。象曰：${h.xiang}`,
        annotation_zh: `编辑说明：并列卦辞与大象原文；不冒充现代译文。`,
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
