import type { RuneSpread, RunesInput } from "@atlas/shared-types";
import { shuffleWithSeed, createRng } from "./seed.ts";

export const ELDER_FUTHARK = [
  { id: "fehu", name: "Fehu", nameZh: "财富", glyph: "ᚠ", keywords: ["资源", "流动", "起始"] },
  { id: "uruz", name: "Uruz", nameZh: "力量", glyph: "ᚢ", keywords: ["耐力", "健康", "恢复"] },
  { id: "thurisaz", name: "Thurisaz", nameZh: "雷神", glyph: "ᚦ", keywords: ["防御", "冲击", "门槛"] },
  { id: "ansuz", name: "Ansuz", nameZh: "口信", glyph: "ᚨ", keywords: ["沟通", "启示", "智慧"] },
  { id: "raidho", name: "Raidho", nameZh: "旅程", glyph: "ᚱ", keywords: ["路径", "节奏", "移动"] },
  { id: "kenaz", name: "Kenaz", nameZh: "火炬", glyph: "ᚲ", keywords: ["发现", "学习", "照明"] },
  { id: "gebo", name: "Gebo", nameZh: "礼物", glyph: "ᚷ", keywords: ["互惠", "合作", "平衡"] },
  { id: "wunjo", name: "Wunjo", nameZh: "喜悦", glyph: "ᚹ", keywords: ["整合", "满足", "和谐"] },
  { id: "hagalaz", name: "Hagalaz", nameZh: "冰雹", glyph: "ᚺ", keywords: ["中断", "重组", "变化"] },
  { id: "nauthiz", name: "Nauthiz", nameZh: "需求", glyph: "ᚾ", keywords: ["限制", "忍耐", "必要"] },
  { id: "isa", name: "Isa", nameZh: "冰封", glyph: "ᛁ", keywords: ["暂停", "等待", "内省"] },
  { id: "jera", name: "Jera", nameZh: "年循环", glyph: "ᛃ", keywords: ["周期", "收获", "因果"] },
  { id: "eihwaz", name: "Eihwaz", nameZh: "紫杉", glyph: "ᛇ", keywords: ["保护", "过渡", "界限"] },
  { id: "perthro", name: "Perthro", nameZh: "命运", glyph: "ᛈ", keywords: ["隐藏", "机缘", "未知"] },
  { id: "algiz", name: "Algiz", nameZh: "保护", glyph: "ᛉ", keywords: ["边界", "守护", "警觉"] },
  { id: "sowilo", name: "Sowilo", nameZh: "太阳", glyph: "ᛊ", keywords: ["成功", "清晰", "意志"] },
  { id: "tiwaz", name: "Tiwaz", nameZh: "战神", glyph: "ᛏ", keywords: ["勇气", "正义", "决心"] },
  { id: "berkano", name: "Berkano", nameZh: "桦树", glyph: "ᛒ", keywords: ["成长", "孕育", "复苏"] },
  { id: "ehwaz", name: "Ehwaz", nameZh: "马匹", glyph: "ᛖ", keywords: ["合作", "信任", "移动"] },
  { id: "mannaz", name: "Mannaz", nameZh: "人类", glyph: "ᛗ", keywords: ["自我", "社群", "镜像"] },
  { id: "laguz", name: "Laguz", nameZh: "水流", glyph: "ᛚ", keywords: ["情感", "直觉", "流动"] },
  { id: "ingwaz", name: "Ingwaz", nameZh: "种子", glyph: "ᛜ", keywords: ["孕育", "完成", "潜伏"] },
  { id: "dagaz", name: "Dagaz", nameZh: "破晓", glyph: "ᛞ", keywords: ["突破", "觉醒", "转化"] },
  { id: "othala", name: "Othala", nameZh: "家园", glyph: "ᛟ", keywords: ["遗产", "归属", "根基"] },
] as const;

export type RuneDefinition = (typeof ELDER_FUTHARK)[number];

export interface DrawnRune {
  id: string;
  name: string;
  nameZh: string;
  glyph: string;
  keywords: readonly string[];
  reversed: boolean;
  position: string;
  gridRow?: number;
  gridCol?: number;
}

export interface RunesResult {
  spread: RuneSpread;
  question?: string;
  runes: DrawnRune[];
  seed: string;
}

const SPREAD_POSITIONS: Record<RuneSpread, string[]> = {
  single: ["核心"],
  three: ["过去", "现在", "未来"],
  nine: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

const NINE_GRID: Array<[number, number]> = [
  [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2],
];

export function drawRunes(input: RunesInput = {}): RunesResult {
  const spread = input.spread ?? "three";
  const seed = input.seed ?? new Date().toISOString();
  const allowReversed = input.allowReversed ?? true;
  const positions = SPREAD_POSITIONS[spread];
  const shuffled = shuffleWithSeed([...ELDER_FUTHARK], seed);
  const picked = shuffled.slice(0, positions.length);
  const rng = createRng(`${seed}-reversed`);

  const runes: DrawnRune[] = picked.map((rune, i) => {
    const reversed = allowReversed && rng() < 0.3;
    const base: DrawnRune = {
      ...rune,
      keywords: rune.keywords,
      reversed,
      position: positions[i]!,
    };
    if (spread === "nine") {
      const [row, col] = NINE_GRID[i]!;
      return { ...base, gridRow: row, gridCol: col };
    }
    return base;
  });

  return { spread, question: input.question, runes, seed };
}
