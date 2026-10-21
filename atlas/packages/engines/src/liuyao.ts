import { hexagramNumber, validateYaoLines } from "./iching.ts";
import { Solar } from "lunar-javascript";
import type { LiuyaoInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

/** 6=老阴(动), 7=少阳, 8=少阴, 9=老阳(动) */
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
  algorithmVersion: string;
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

// 京房纳甲：每个数组只含该三爻卦位的三支，初爻 → 上爻。
const NAJIA_LOWER: Record<number, string[]> = {
  0: ["未","巳","卯"], 1: ["子","寅","辰"], 2: ["寅","辰","午"], 3: ["巳","卯","丑"],
  4: ["辰","午","申"], 5: ["卯","丑","亥"], 6: ["丑","亥","酉"], 7: ["子","寅","辰"],
};
const NAJIA_UPPER: Record<number, string[]> = {
  0: ["丑","亥","酉"], 1: ["午","申","戌"], 2: ["申","戌","子"], 3: ["亥","酉","未"],
  4: ["戌","子","寅"], 5: ["酉","未","巳"], 6: ["未","巳","卯"], 7: ["午","申","戌"],
};
const NAJIA_STEMS = [["乙","癸"],["庚","庚"],["戊","戊"],["丁","丁"],["丙","丙"],["己","己"],["辛","辛"],["甲","壬"]];
const PALACES: Record<string, number[]> = {
  乾: [1,44,33,12,20,23,35,14], 坤: [2,24,19,11,34,43,5,8],
  震: [51,16,40,32,46,48,28,17], 巽: [57,9,37,42,25,21,27,18],
  坎: [29,60,3,63,49,55,36,7], 離: [30,56,50,64,4,59,6,13],
  艮: [52,22,26,41,38,10,61,53], 兑: [58,47,45,31,39,15,62,54],
};
const PALACE_MAP = Object.entries(PALACES).flatMap(([palace, hexes]) =>
  hexes.map((hex, i) => ({ hex, palace: palace === "離" ? "离" : palace, world: [6,1,2,3,4,5,4,3][i]! })));

const USEFUL_GOD: Record<string, string> = {
  career: "官鬼",
  love: "妻财",
  finance: "妻财",
  health: "子孙",
  general: "世爻",
};

const linesToHex = hexagramNumber;

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
  if (ctrl[monthEl] === lineElement) return "死";
  if (ctrl[lineElement] === monthEl) return "囚";
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

  const yaoValues = input.lines ?? castLines(seed);
  validateYaoLines(yaoValues);

  const yangLines = yaoValues.map((v) => v === 7 || v === 9);
  const changedLines = yaoValues.map((v) => {
    if (v === 6) return true;
    if (v === 9) return false;
    return v === 7;
  });

  const primaryHex = linesToHex(yangLines);
  const changedHex = linesToHex(changedLines);
  const { palace, world: worldLine } = findPalace(primaryHex);
  const responseLine = ((worldLine + 2) % 6) + 1;

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
      value: value as YaoValue,
      isYang: value === 7 || value === 9,
      isMoving: value === 6 || value === 9,
      branch,
      stem: NAJIA_STEMS[i < 3 ? lowerBits : upperBits]![i < 3 ? 0 : 1]!,
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
    algorithmVersion: "liuyao-jingfang-v2",
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
