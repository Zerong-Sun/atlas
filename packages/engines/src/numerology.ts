import type { NumerologyInput } from "@atlas/shared-types";

const LETTER_VALUES: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

const NUMBER_MEANINGS: Record<number, string> = {
  1: "开创、独立与主动表达",
  2: "合作、敏感与平衡",
  3: "表达、创意与社交",
  4: "结构、稳定与务实",
  5: "变化、自由与冒险",
  6: "责任、照护与和谐",
  7: "内省、分析与灵性",
  8: "成就、资源与权力",
  9: "完成、慈悲与整合",
  11: "直觉灵感与理想主义（主数）",
  22: "大型建构与长期愿景（主数）",
  33: "疗愈与服务（主数）",
};

function reduceNumber(n: number, keepMaster = true): number {
  if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
  let value = n;
  while (value > 9) {
    value = String(value)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
    if (keepMaster && (value === 11 || value === 22 || value === 33)) return value;
  }
  return value;
}

function sumDigits(date: string): number {
  return date.replace(/\D/g, "").split("").reduce((sum, d) => sum + Number(d), 0);
}

function nameNumber(name: string): number {
  const total = name
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .split("")
    .reduce((sum, ch) => sum + (LETTER_VALUES[ch] ?? 0), 0);
  return reduceNumber(total || 0);
}

export interface NumerologyResult {
  lifePath: number;
  lifePathMeaning: string;
  destiny: number;
  destinyMeaning: string;
  personalYear: number;
  personalYearMeaning: string;
  summary: string;
  birthDate: string;
  name: string;
}

export function computeNumerology(input: NumerologyInput): NumerologyResult {
  const birthDate = input.birthDate?.trim() || "2000-01-01";
  const name = input.name?.trim() || "Seeker";
  const year = input.referenceYear ?? new Date().getFullYear();

  const lifePath = reduceNumber(sumDigits(birthDate));
  const destiny = nameNumber(name);
  const personalYear = reduceNumber(
    reduceNumber(sumDigits(birthDate), false) + reduceNumber(year, false),
    false,
  );

  const lifePathMeaning = NUMBER_MEANINGS[lifePath] ?? "独特节奏";
  const destinyMeaning = NUMBER_MEANINGS[destiny] ?? "独特表达";
  const personalYearMeaning = NUMBER_MEANINGS[personalYear] ?? "阶段主题";

  const summary = `生命路径 ${lifePath}、命运数 ${destiny}、${year} 个人年 ${personalYear}。`;

  return {
    lifePath,
    lifePathMeaning,
    destiny,
    destinyMeaning,
    personalYear,
    personalYearMeaning,
    summary,
    birthDate,
    name,
  };
}
