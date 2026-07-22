import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { makeChunk } from "../lib/chunk-schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../../data/open-iching-yijing.json");

const SOURCE = {
  source_id: "yijing_yaoci",
  source_type: "public_domain",
  license_note:
    "公版《周易》爻辞原文；结构化整理参考 open-iching（github.com/john-walks-slow/open-iching），白话为自研译意",
  source_url: "https://ctext.org/book-of-changes",
  verbatim_allowed: true,
};

/** @typedef {{ id: number, name: string, scripture: string, lines: { id: number, name: string, scripture: string }[] }} Hexagram */

export function buildYijingYaoChunks() {
  /** @type {Hexagram[]} */
  const hexagrams = JSON.parse(readFileSync(DATA_PATH, "utf8"));
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
          tradition: "iching",
          chapter,
          section: line.name,
          original_text: `${line.name}：${line.scripture}`,
          translation_zh: `【${h.name}·${line.name}】${line.scripture}（自研白话：此爻提示与该卦整体气势相合的具体阶段与行事分寸。）`,
          annotation_zh: `爻辞检索：${h.name}、${line.name}、变爻。引用须匹配 chunk_id，不可编造出处。`,
          keywords: [h.name, line.name, "爻辞", "周易", `第${h.id}卦`],
        }),
      );
    }
  }

  return chunks;
}
