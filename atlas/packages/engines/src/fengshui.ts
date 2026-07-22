import type { FengshuiInput } from "@atlas/shared-types";

const MOUNTAINS_24 = [
  { name: "子", degree: 0 }, { name: "癸", degree: 15 }, { name: "丑", degree: 30 },
  { name: "艮", degree: 45 }, { name: "寅", degree: 60 }, { name: "甲", degree: 75 },
  { name: "卯", degree: 90 }, { name: "乙", degree: 105 }, { name: "辰", degree: 120 },
  { name: "巽", degree: 135 }, { name: "巳", degree: 150 }, { name: "丙", degree: 165 },
  { name: "午", degree: 180 }, { name: "丁", degree: 195 }, { name: "未", degree: 210 },
  { name: "坤", degree: 225 }, { name: "申", degree: 240 }, { name: "庚", degree: 255 },
  { name: "酉", degree: 270 }, { name: "辛", degree: 285 }, { name: "戌", degree: 300 },
  { name: "乾", degree: 315 }, { name: "亥", degree: 330 }, { name: "壬", degree: 345 },
];

const FLYING_STARS = ["一白", "二黑", "三碧", "四绿", "五黄", "六白", "七赤", "八白", "九紫"];

/** 九运 2024-2043 */
const CURRENT_PERIOD = 9;

export interface FengshuiPalace {
  position: number;
  direction: string;
  mountainStar: string;
  facingStar: string;
  annualStar: string;
  combined: string;
}

export interface FengshuiResult {
  sittingDegree: number;
  facingDegree: number;
  sittingMountain: string;
  facingMountain: string;
  period: number;
  mingGua?: { gua: number; group: "东四" | "西四" };
  palaces: FengshuiPalace[];
  summary: string;
  advice: string[];
}

const DIRECTIONS = ["北", "东北", "东", "东南", "南", "西南", "西", "西北", "中"];

function nearestMountain(degree: number): string {
  const norm = ((degree % 360) + 360) % 360;
  let best = MOUNTAINS_24[0]!;
  let minDiff = 360;
  for (const m of MOUNTAINS_24) {
    const diff = Math.min(Math.abs(norm - m.degree), 360 - Math.abs(norm - m.degree));
    if (diff < minDiff) {
      minDiff = diff;
      best = m;
    }
  }
  return best.name;
}

function mingGua(year: number): { gua: number; group: "东四" | "西四" } {
  const lastTwo = year % 100;
  let gua: number;
  if (year >= 2000) {
    gua = year % 2000 <= 0 ? 9 : 9 - ((lastTwo - 1) % 9);
  } else {
    gua = ((lastTwo - 1) % 9) + 1;
  }
  if (gua === 5) gua = year % 2 === 0 ? 2 : 8;
  const east = [1, 3, 4, 9];
  return { gua, group: east.includes(gua) ? "东四" : "西四" };
}

/** Simplified 玄空飞星排盘 */
function buildFlyingStars(_sittingDeg: number, period: number, year: number): FengshuiPalace[] {
  const palaces: FengshuiPalace[] = [];
  const baseOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const yearStar = (11 - (year - 2000) % 9) % 9 || 9;

  for (let i = 0; i < 9; i++) {
    const mountainNum = ((baseOrder[i]! + period - 1) % 9) + 1;
    const facingNum = ((baseOrder[(i + 4) % 9]! + period - 1) % 9) + 1;
    const annualNum = ((yearStar + i - 1) % 9) + 1;
    palaces.push({
      position: i + 1,
      direction: DIRECTIONS[i] ?? "中",
      mountainStar: FLYING_STARS[mountainNum - 1]!,
      facingStar: FLYING_STARS[facingNum - 1]!,
      annualStar: FLYING_STARS[annualNum - 1]!,
      combined: `${FLYING_STARS[mountainNum - 1]}/${FLYING_STARS[facingNum - 1]}`,
    });
  }
  return palaces;
}

export function computeFengshui(input: FengshuiInput = {}): FengshuiResult {
  const sittingDegree = input.sittingDegree ?? 0;
  const facingDegree = (sittingDegree + 180) % 360;
  const sittingMountain = input.sittingMountain ?? nearestMountain(sittingDegree);
  const facingMountain = nearestMountain(facingDegree);
  const year = input.birthYear ?? new Date(input.timestamp ?? Date.now()).getFullYear();
  const palaces = buildFlyingStars(sittingDegree, CURRENT_PERIOD, year);
  const mg = input.birthYear ? mingGua(input.birthYear) : undefined;

  const advice = [
    "五黄、二黑所在方位宜静不宜动，避免大动土或长期噪音。",
    "八白、九紫、一白等吉星方位可安排常用活动区，但仍需结合采光与动线。",
    "风水解读为空间象征参考，重大决策请结合建筑规范与实际使用需求。",
  ];

  return {
    sittingDegree,
    facingDegree,
    sittingMountain,
    facingMountain,
    period: CURRENT_PERIOD,
    mingGua: mg,
    palaces,
    summary: `${sittingMountain}山${facingMountain}向，${CURRENT_PERIOD}运盘，坐${Math.round(sittingDegree)}°`,
    advice,
  };
}

export { MOUNTAINS_24, FLYING_STARS };
