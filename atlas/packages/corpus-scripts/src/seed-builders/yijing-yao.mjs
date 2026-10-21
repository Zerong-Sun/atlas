import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { makeChunk } from "../lib/chunk-schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = new URL("../../../engines/src/data/iching-classics.json",import.meta.url);

const SOURCE = {
  source_id: "yijing_yaoci",
  source_type: "public_domain",
  license_note:
    "公版《周易》爻辞；与应用共用维基文库版本固定转录，原文保留原字形",
  source_url: "https://ctext.org/book-of-changes",
  verbatim_allowed: true,
};

/** @typedef {{ id: number, name: string, scripture: string, lines: { id: number, name: string, scripture: string }[] }} Hexagram */

export function buildYijingYaoChunks() {
  /** @type {Hexagram[]} */
  const hexagrams = Object.entries(JSON.parse(readFileSync(DATA_PATH, "utf8"))).map(([id,h])=>({id:Number(id),name:h.name,sourceUrl:h.sourceUrl,lines:h.yaoTexts.map((text,i)=>({id:i+1,name:text.match(/^(初[九六]|[九六][二三四五]|上[九六])/)?.[0]??`第${i+1}爻`,scripture:text,original:text}))}));
  const chunks = [];

  for (const h of hexagrams) {
    const chapter = `第${h.id}卦·${h.name}`;
    for (const line of h.lines) {
      const pad = String(h.id).padStart(2, "0");
      const lineId = `iching-yao-${pad}-L${line.id}`;
      chunks.push(
        makeChunk({
          id: lineId,
          ...SOURCE,
          source_url:h.sourceUrl,
          tradition: "iching",
          chapter,
          section: line.name,
          original_text: line.original,
          translation_zh: `【${h.name}·${line.name}】${line.scripture}（原典对照，尚未提供逐句白话翻译。）`,
          annotation_zh: `爻辞检索：${h.name}、${line.name}、变爻。引用须匹配 chunk_id，不可编造出处。`,
          keywords: [h.name, line.name, "爻辞", "周易", `第${h.id}卦`],
        }),
      );
    }
  }

  return chunks;
}
