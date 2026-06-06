import { Solar } from "lunar-javascript";
import type { LiuyaoInput } from "@atlas/shared-types";
import { createRng } from "./seed.js";

/** 6=老阳(动), 7=少阳, 8=少阴, 9=老阴(动) */
export type YaoValue = 6 | 7 | 8 | 9;

export interface LiuyaoLine {
  position: number;
  value: YaoValue;
  isYang: boolean;
  isMoving: boolean;
  branch: string;
  stem: string;
  element: string;
  relative: string;
  isWorld: boolean;
  isResponse: boolean;
  strength: "旺" | "相" | "休" | "囚" | "死" | "空";
}

export interface LiuyaoResult {
  seed: string;
  timestamp: string;
  primaryHex: number;
  changedHex: number;
  primaryName: string;
  changedName: string;
  palace: string;
  worldLine: number;
  responseLine: number;
  usefulGod: string;
  usefulGodLine?: number;
  dayStem: string;
  dayBranch: string;
  monthBranch: string;
  lines: LiuyaoLine[];
  summary: string;
}

const HEX_NAMES: Record<number, string> = {
  1: "乾", 2: "坤", 3: "屯", 4: "蒙", 5: "需", 6: "讼", 7: "师", 8: "比",
  9: "小畜", 10: "履", 11: "泰", 12: "否", 13: "同人", 14: "大有", 15: "谦",
  16: "豫", 17: "随", 18: "蛊", 19: "临", 20: "观", 21: "噬嗑", 22: "贲",
  23: "剥", 24: "复", 25: "无妄", 26: "大畜", 27: "颐", 28: "大过", 29: "坎",
  30: "离", 31: "咸", 32: "恒", 33: "遁", 34: "大壮", 35: "晋", 36: "明夷",
  37: "家人", 38: "睽", 39: "蹇", 40: "解", 41: "损", 42: "益", 43: "夬",
  44: "姤", 45: "萃", 46: "升", 47: "困", 48: "井", 49: "革", 50: "鼎",
  51: "震", 52: "艮", 53: "渐", 54: "归妹", 55: "丰", 56: "旅", 57: "巽",
  58: "兑", 59: "涣", 60: "节", 61: "中孚", 62: "小过", 63: "既济", 64: "未济",
};

const BRANCH_ELEMENT: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const PALACE_ELEMENT: Record<string, string> = {
  乾: "金", 兑: "金", 离: "火", 震: "木", 巽: "木", 坎: "水", 艮: "土", 坤: "土",
};

/** Lower trigram index 0-7 (先天数-1): 坤0震1坎2兑3艮4离5巽6乾7 */
const TRIGRAM_BITS: Record<number, number> = {
  0: 0b000, 1: 0b001, 2: 0b010, 3: 0b011, 4: 0b100, 5: 0b101, 6: 0b110, 7: 0b111,
};

const NAJIA_LOWER: Record<number, string[]> = {
  0: ["未", "巳", "卯", "丑", "亥", "酉"],
  1: ["丑", "亥", "酉", "未", "巳", "卯"],
  2: ["寅", "辰", "午", "申", "戌", "子"],
  3: ["巳", "卯", "丑", "亥", "酉", "未"],
  4: ["辰", "午", "申", "戌", "子", "寅"],
  5: ["卯", "丑", "亥", "酉", "未", "巳"],
  6: ["午", "申", "戌", "子", "寅", "辰"],
  7: ["子", "寅", "辰", "午", "申", "戌"],
};

const NAJIA_UPPER: Record<number, string[]> = {
  0: ["丑", "亥", "酉", "未", "巳", "卯"],
  1: ["戌", "子", "寅", "辰", "午", "申"],
  2: ["申", "戌", "子", "寅", "辰", "午"],
  3: ["未", "巳", "卯", "丑", "亥", "酉"],
  4: ["午", "申", "戌", "子", "寅", "辰"],
  5: ["酉", "未", "巳", "卯", "丑", "亥"],
  6: ["亥", "酉", "未", "巳", "卯", "丑"],
  7: ["申", "戌", "子", "寅", "辰", "午"],
};

const STEM_FOR_BRANCH: Record<string, string> = {
  子: "癸", 丑: "己", 寅: "甲", 卯: "乙", 辰: "戊", 巳: "丙",
  午: "丁", 未: "己", 申: "庚", 酉: "辛", 戌: "戊", 亥: "壬",
};

/** 八宫卦序: hex -> { palace, worldLine (1-6) } simplified 京房 */
const PALACE_MAP: Array<{ hex: number; palace: string; world: number }> = [
  { hex: 1, palace: "乾", world: 6 }, { hex: 44, palace: "乾", world: 1 },
  { hex: 33, palace: "乾", world: 2 }, { hex: 12, palace: "乾", world: 3 },
  { hex: 20, palace: "乾", world: 4 }, { hex: 23, palace: "乾", world: 5 },
  { hex: 35, palace: "乾", world: 4 }, { hex: 14, palace: "乾", world: 3 },
  { hex: 2, palace: "坤", world: 6 }, { hex: 24, palace: "坤", world: 1 },
  { hex: 19, palace: "坤", world: 2 }, { hex: 11, palace: "坤", world: 3 },
  { hex: 34, palace: "坤", world: 4 }, { hex: 43, palace: "坤", world: 5 },
  { hex: 51, palace: "震", world: 6 }, { hex: 17, palace: "震", world: 1 },
  { hex: 21, palace: "震", world: 2 }, { hex: 42, palace: "震", world: 3 },
  { hex: 3, palace: "震", world: 4 }, { hex: 27, palace: "震", world: 5 },
  { hex: 57, palace: "巽", world: 6 }, { hex: 9, palace: "巽", world: 1 },
  { hex: 37, palace: "巽", world: 2 }, { hex: 48, palace: "巽", world: 3 },
  { hex: 18, palace: "巽", world: 4 }, { hex: 25, palace: "巽", world: 5 },
  { hex: 29, palace: "坎", world: 6 }, { hex: 60, palace: "坎", world: 1 },
  { hex: 63, palace: "坎", world: 2 }, { hex: 49, palace: "坎", world: 3 },
  { hex: 6, palace: "坎", world: 4 }, { hex: 5, palace: "坎", world: 5 },
  { hex: 30, palace: "离", world: 6 }, { hex: 56, palace: "离", world: 1 },
  { hex: 64, palace: "离", world: 2 }, { hex: 50, palace: "离", world: 3 },
  { hex: 13, palace: "离", world: 4 }, { hex: 22, palace: "离", world: 5 },
  { hex: 52, palace: "艮", world: 6 }, { hex: 53, palace: "艮", world: 1 },
  { hex: 39, palace: "艮", world: 2 }, { hex: 15, palace: "艮", world: 3 },
  { hex: 62, palace: "艮", world: 4 }, { hex: 4, palace: "艮", world: 5 },
  { hex: 58, palace: "兑", world: 6 }, { hex: 47, palace: "兑", world: 1 },
  { hex: 45, palace: "兑", world: 2 }, { hex: 31, palace: "兑", world: 3 },
  { hex: 28, palace: "兑", world: 4 }, { hex: 41, palace: "兑", world: 5 },
];

const USEFUL_GOD: Record<string, string> = {
  career: "官鬼",
  love: "妻财",
  finance: "妻财",
  health: "子孙",
  general: "世爻",
};

function linesToHex(lines: boolean[]): number {
  let lower = 0;
  let upper = 0;
  for (let i = 0; i < 3; i++) {
    if (lines[i]) lower |= 1 << i;
    if (lines[i + 3]) upper |= 1 << i;
  }
  const hexTable: Record<string, number> = {
    "0-0": 2, "0-1": 24, "0-2": 19, "0-3": 11, "0-4": 34, "0-5": 43, "0-6": 35, "0-7": 14,
    "1-0": 51, "1-1": 17, "1-2": 21, "1-3": 42, "1-4": 3, "1-5": 27, "1-6": 25, "1-7": 9,
    "2-0": 29, "2-1": 60, "2-2": 63, "2-3": 49, "2-4": 6, "2-5": 5, "2-6": 64, "2-7": 56,
    "3-0": 58, "3-1": 47, "3-2": 45, "3-3": 31, "3-4": 28, "3-5": 41, "3-6": 61, "3-7": 46,
    "4-0": 52, "4-1": 53, "4-2": 39, "4-3": 15, "4-4": 62, "4-5": 4, "4-6": 7, "4-7": 8,
    "5-0": 30, "5-1": 56, "5-2": 64, "5-3": 50, "5-4": 13, "5-5": 22, "5-6": 36, "5-7": 37,
    "6-0": 57, "6-1": 9, "6-2": 37, "6-3": 48, "6-4": 18, "6-5": 25, "6-6": 33, "6-7": 44,
    "7-0": 1, "7-1": 44, "7-2": 33, "7-3": 12, "7-4": 20, "7-5": 23, "7-6": 10, "7-7": 16,
  };
  const lowerTri = Object.entries(TRIGRAM_BITS).find(([, v]) => v === lower)?.[0] ?? "0";
  const upperTri = Object.entries(TRIGRAM_BITS).find(([, v]) => v === upper)?.[0] ?? "0";
  return hexTable[`${lowerTri}-${upperTri}`] ?? 1;
}

function castLines(seed: string): YaoValue[] {
  const rng = createRng(seed);
  const lines: YaoValue[] = [];
  for (let i = 0; i < 6; i++) {
    let sum = 0;
    for (let c = 0; c < 3; c++) sum += rng() > 0.5 ? 3 : 2;
    lines.push(sum as YaoValue);
  }
  return lines;
}

function getRelative(palaceElement: string, lineElement: string): string {
  const gen: Record<string, string> = { 金: "水", 水: "木", 木: "火", 火: "土", 土: "金" };
  const ctrl: Record<string, string> = { 金: "木", 木: "土", 土: "水", 水: "火", 火: "金" };
  if (lineElement === palaceElement) return "兄弟";
  if (gen[palaceElement] === lineElement) return "子孙";
  if (gen[lineElement] === palaceElement) return "父母";
  if (ctrl[palaceElement] === lineElement) return "妻财";
  if (ctrl[lineElement] === palaceElement) return "官鬼";
  return "兄弟";
}

function getStrength(lineElement: string, monthBranch: string): LiuyaoLine["strength"] {
  const monthEl = BRANCH_ELEMENT[monthBranch] ?? "土";
  const gen: Record<string, string> = { 金: "水", 水: "木", 木: "火", 火: "土", 土: "金" };
  const ctrl: Record<string, string> = { 金: "木", 木: "土", 土: "水", 水: "火", 火: "金" };
  if (lineElement === monthEl) return "旺";
  if (gen[monthEl] === lineElement) return "相";
  if (gen[lineElement] === monthEl) return "休";
  if (ctrl[monthEl] === lineElement) return "囚";
  if (ctrl[lineElement] === monthEl) return "死";
  return "休";
}

function findPalace(hex: number): { palace: string; world: number } {
  const found = PALACE_MAP.find((p) => p.hex === hex);
  return found ?? { palace: "乾", world: 6 };
}

export function castLiuyao(input: LiuyaoInput = {}): LiuyaoResult {
  const seed = input.seed ?? new Date().toISOString();
  const timestamp = input.timestamp ?? new Date().toISOString();
  const date = new Date(timestamp);
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
  const eight = solar.getLunar().getEightChar();
  const dayPillar = eight.getDay();
  const monthPillar = eight.getMonth();
  const dayBranch = dayPillar[1]!;
  const dayStem = dayPillar[0]!;
  const monthBranch = monthPillar[1]!;

  const yaoValues = input.lines?.length === 6
    ? (input.lines as YaoValue[])
    : castLines(seed);

  const yangLines = yaoValues.map((v) => v === 6 || v === 7);
  const changedLines = yaoValues.map((v) => {
    if (v === 6) return false;
    if (v === 9) return true;
    return v === 7;
  });

  const primaryHex = linesToHex(yangLines);
  const changedHex = linesToHex(changedLines);
  const { palace, world: worldLine } = findPalace(primaryHex);
  const responseLine = ((worldLine + 2) % 6) || 6;

  const lowerBits = yangLines.slice(0, 3).reduce((acc, y, i) => acc | (y ? 1 << i : 0), 0);
  const upperBits = yangLines.slice(3, 6).reduce((acc, y, i) => acc | (y ? 1 << i : 0), 0);
  const lowerTri = Object.entries(TRIGRAM_BITS).find(([, v]) => v === lowerBits)?.[0] ?? "0";
  const upperTri = Object.entries(TRIGRAM_BITS).find(([, v]) => v === upperBits)?.[0] ?? "0";
  const lowerBranches = NAJIA_LOWER[Number(lowerTri)]!;
  const upperBranches = NAJIA_UPPER[Number(upperTri)]!;
  const branches = [...lowerBranches, ...upperBranches];

  const palaceElement = PALACE_ELEMENT[palace] ?? "金";
  const category = input.questionCategory ?? "general";
  const usefulGod = USEFUL_GOD[category] ?? "世爻";

  const lines: LiuyaoLine[] = yaoValues.map((value, i) => {
    const pos = i + 1;
    const branch = branches[i]!;
    const element = BRANCH_ELEMENT[branch] ?? "土";
    const relative = getRelative(palaceElement, element);
    return {
      position: pos,
      value,
      isYang: value === 6 || value === 7,
      isMoving: value === 6 || value === 9,
      branch,
      stem: STEM_FOR_BRANCH[branch] ?? "甲",
      element,
      relative,
      isWorld: pos === worldLine,
      isResponse: pos === responseLine,
      strength: getStrength(element, monthBranch),
    };
  });

  const usefulGodLine = lines.find((l) =>
    usefulGod === "世爻" ? l.isWorld : l.relative === usefulGod
  )?.position;

  return {
    seed,
    timestamp,
    primaryHex,
    changedHex,
    primaryName: HEX_NAMES[primaryHex] ?? "未知",
    changedName: HEX_NAMES[changedHex] ?? "未知",
    palace,
    worldLine,
    responseLine,
    usefulGod,
    usefulGodLine,
    dayStem,
    dayBranch,
    monthBranch,
    lines,
    summary: `${HEX_NAMES[primaryHex]}卦，${palace}宫，世${worldLine}应${responseLine}，用神${usefulGod}`,
  };
}
