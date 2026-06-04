import { Solar } from "lunar-javascript";
import type { EngineInput } from "./index.js";
import { selectBaziClassics } from "./bazi-classics.js";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const ELEMENT_ORDER = ["木", "火", "土", "金", "水"];
const PILLAR_LABELS: Record<string, string> = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  hour: "时柱",
};

const stemElement: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const branchElement: Record<string, string> = {
  寅: "木", 卯: "木", 巳: "火", 午: "火", 辰: "土", 戌: "土", 丑: "土", 未: "土",
  申: "金", 酉: "金", 子: "水", 亥: "水",
};
const stemPolarity: Record<string, "阳" | "阴"> = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳", 己: "阴",
  庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};

export function computeBazi(input: EngineInput): Record<string, unknown> {
  if (!input.birthDate) {
    return { error: "birth_date_required", pillars: null };
  }
  const [y, m, d] = input.birthDate.split("-").map(Number);
  const timeParts = (input.birthTime ?? "12:00").split(":");
  const hour = Number(timeParts[0] ?? 12);
  const minute = Number(timeParts[1] ?? 0);

  const solar = Solar.fromYmdHms(y, m, d, hour, minute, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const pillars = {
    year: eightChar.getYear(),
    month: eightChar.getMonth(),
    day: eightChar.getDay(),
    hour: eightChar.getTime(),
  };

  const dayMaster = pillars.day.charAt(0);
  const elements = countElements(pillars);
  const currentYear = getCurrentYear(input.timestamp);
  const pillarList = buildPillarList(pillars);
  const elementList = ELEMENT_ORDER.map((element) => ({
    element,
    count: elements[element] ?? 0,
    role: elementRole(dayMaster, element),
  }));
  const annualFortunes = buildAnnualFortunes(dayMaster, currentYear);
  const classics = selectBaziClassics(["总论", "月令", "五行", "日主"]);

  return {
    pillars,
    pillarList,
    dayMaster,
    elements,
    elementList,
    currentYear,
    annualFortunes,
    classics,
    zodiac: lunar.getYearShengXiao(),
    summary: `日主${dayMaster}，四柱 ${pillars.year} ${pillars.month} ${pillars.day} ${pillars.hour}`,
  };
}

function countElements(pillars: Record<string, string>): Record<string, number> {
  const map: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  for (const p of Object.values(pillars)) {
    const stem = p.charAt(0);
    const branch = p.charAt(1);
    if (stemElement[stem]) map[stemElement[stem]]++;
    if (branchElement[branch]) map[branchElement[branch]]++;
  }
  return map;
}

function buildPillarList(pillars: Record<string, string>) {
  return Object.entries(pillars).map(([key, value]) => {
    const stem = value.charAt(0);
    const branch = value.charAt(1);
    return {
      key,
      label: PILLAR_LABELS[key] ?? key,
      value,
      stem,
      branch,
      stemElement: stemElement[stem],
      branchElement: branchElement[branch],
    };
  });
}

function getCurrentYear(timestamp?: string): number {
  const date = timestamp ? new Date(timestamp) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
}

function getYearPillar(year: number): string {
  return Solar.fromYmdHms(year, 7, 1, 12, 0, 0).getLunar().getEightChar().getYear();
}

function buildAnnualFortunes(dayMaster: string, currentYear: number) {
  const years = Array.from({ length: 7 }, (_, index) => currentYear - 2 + index);
  return years.map((year) => {
    const pillar = getYearPillar(year);
    const stem = pillar.charAt(0);
    const branch = pillar.charAt(1);
    const element = stemElement[stem] ?? "";
    return {
      year,
      pillar,
      stem,
      branch,
      element,
      tenGod: tenGod(dayMaster, stem),
      isCurrent: year === currentYear,
      note: annualNote(dayMaster, stem, branch),
    };
  });
}

function elementRole(dayMaster: string, element: string): string {
  const masterElement = stemElement[dayMaster];
  if (!masterElement) return "待定";
  if (element === masterElement) return "同类/比劫";
  if (generates(element, masterElement)) return "生我/印";
  if (generates(masterElement, element)) return "我生/食伤";
  if (controls(masterElement, element)) return "我克/财";
  if (controls(element, masterElement)) return "克我/官杀";
  return "待定";
}

function tenGod(dayMaster: string, otherStem: string): string {
  const relation = elementRole(dayMaster, stemElement[otherStem]);
  const samePolarity = stemPolarity[dayMaster] === stemPolarity[otherStem];
  switch (relation) {
    case "同类/比劫":
      return samePolarity ? "比肩" : "劫财";
    case "生我/印":
      return samePolarity ? "偏印" : "正印";
    case "我生/食伤":
      return samePolarity ? "食神" : "伤官";
    case "我克/财":
      return samePolarity ? "偏财" : "正财";
    case "克我/官杀":
      return samePolarity ? "七杀" : "正官";
    default:
      return "待定";
  }
}

function annualNote(dayMaster: string, stem: string, branch: string): string {
  const god = tenGod(dayMaster, stem);
  const element = stemElement[stem];
  return `${god}透干，${element ?? "五行"}气临年；地支${branch}需结合原局合冲刑害再断。`;
}

function generates(a: string, b: string): boolean {
  return (
    (a === "木" && b === "火") ||
    (a === "火" && b === "土") ||
    (a === "土" && b === "金") ||
    (a === "金" && b === "水") ||
    (a === "水" && b === "木")
  );
}

function controls(a: string, b: string): boolean {
  return (
    (a === "木" && b === "土") ||
    (a === "土" && b === "水") ||
    (a === "水" && b === "火") ||
    (a === "火" && b === "金") ||
    (a === "金" && b === "木")
  );
}

export { STEMS, BRANCHES };
