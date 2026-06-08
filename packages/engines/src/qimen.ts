import { Solar } from "lunar-javascript";
import type { QimenJuMethod } from "@atlas/shared-types";
import type { EngineInput } from "./index.ts";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const PALACES = ["坎一", "坤二", "震三", "巽四", "中五", "乾六", "兑七", "艮八", "离九"] as const;
const OUTER_PALACES = ["坎一", "坤二", "震三", "巽四", "乾六", "兑七", "艮八", "离九"] as const;
const DOORS = ["休门", "生门", "伤门", "杜门", "景门", "死门", "惊门", "开门"] as const;
const STARS = ["天蓬", "天任", "天冲", "天辅", "天英", "天芮", "天柱", "天心", "天禽"] as const;
const GODS = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"] as const;
const SIX_YI = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"] as const;

const PALACE_DIRECTIONS: Record<string, string> = {
  坎一: "北", 坤二: "西南", 震三: "东", 巽四: "东南", 中五: "中",
  乾六: "西北", 兑七: "西", 艮八: "东北", 离九: "南",
};

const PALACE_ELEMENT: Record<string, string> = {
  坎一: "水", 坤二: "土", 震三: "木", 巽四: "木", 中五: "土",
  乾六: "金", 兑七: "金", 艮八: "土", 离九: "火",
};

const DOOR_ELEMENT: Record<string, string> = {
  休门: "水", 生门: "土", 伤门: "木", 杜门: "木", 景门: "火",
  死门: "土", 惊门: "金", 开门: "金",
};

const LIU_YI_PALACE: Record<string, string> = {
  戊: "坎一", 己: "离九", 庚: "艮八", 辛: "兑七", 壬: "震三", 癸: "巽四",
};

const XUN_HIDDEN_STEM: Record<string, string> = {
  甲子: "戊", 甲戌: "己", 甲申: "庚", 甲午: "辛", 甲辰: "壬", 甲寅: "癸",
};

const ORIGINAL_STAR_AT_PALACE: Record<string, string> = {
  坎一: "天蓬", 坤二: "天芮", 震三: "天冲", 巽四: "天辅", 乾六: "天心",
  兑七: "天柱", 艮八: "天任", 离九: "天英", 中五: "天禽",
};

const ORIGINAL_DOOR_AT_PALACE: Record<string, string> = {
  坎一: "休门", 坤二: "死门", 震三: "伤门", 巽四: "杜门", 乾六: "开门",
  兑七: "惊门", 艮八: "生门", 离九: "景门",
};

const KONG_WANG: Record<string, string[]> = {
  甲子: ["戌", "亥"], 甲戌: ["申", "酉"], 甲申: ["午", "未"],
  甲午: ["辰", "巳"], 甲辰: ["寅", "卯"], 甲寅: ["子", "丑"],
};

const STEM_TOMB_PALACE: Record<string, string> = {
  乙: "乾六", 丙: "乾六", 丁: "艮八", 戊: "乾六", 己: "艮八",
  庚: "艮八", 辛: "巽四", 壬: "乾六", 癸: "坤二",
};

const JIXING: Record<string, string> = {
  震三: "己", 坤二: "戊", 艮八: "庚", 巽四: "壬", 离九: "辛",
};

const YANG_JU: Record<string, [number, number, number]> = {
  冬至: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6],
  立春: [8, 5, 2], 雨水: [9, 6, 3], 惊蛰: [1, 7, 4],
  春分: [3, 9, 6], 清明: [4, 1, 7], 谷雨: [5, 2, 8],
  立夏: [4, 1, 7], 小满: [5, 2, 8], 芒种: [6, 3, 9],
};

const YIN_JU: Record<string, [number, number, number]> = {
  夏至: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4],
  立秋: [2, 5, 8], 处暑: [1, 4, 7], 白露: [9, 3, 6],
  秋分: [7, 1, 4], 寒露: [6, 9, 3], 霜降: [5, 8, 2],
  立冬: [6, 9, 3], 小雪: [5, 8, 2], 大雪: [4, 7, 1],
};

const JIE_QI_ORDER = [
  "冬至", "小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨",
  "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露",
  "秋分", "寒露", "霜降", "立冬", "小雪", "大雪",
] as const;

export interface QimenPalace {
  palace: string;
  direction: string;
  earthStem: string;
  heavenStem: string;
  door?: string;
  star: string;
  god?: string;
  isZhiFu?: boolean;
  isZhiShi?: boolean;
  kongWang?: boolean;
  ruMu?: boolean;
  menPo?: boolean;
  jiXing?: boolean;
}

export interface QimenResult {
  inputTime: string;
  juMethod: QimenJuMethod;
  solarTerm: string;
  pillars: { year: string; month: string; day: string; hour: string };
  dun: "阳遁" | "阴遁";
  ju: number;
  yuan: "上元" | "中元" | "下元";
  xunShou: string;
  zhiFu: string;
  zhiShi: string;
  zhiFuPalace: string;
  zhiShiPalace: string;
  kongWang: string[];
  ruMu: string[];
  menPo: string[];
  jiXing: string[];
  palaces: QimenPalace[];
  notes: string[];
}

export function computeQimen(input: EngineInput & { juMethod?: QimenJuMethod }): QimenResult {
  const date = input.timestamp ? new Date(input.timestamp) : new Date();
  const juMethod: QimenJuMethod = input.juMethod ?? "chaibu";
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  );
  const lunar = solar.getLunar();
  const eight = lunar.getEightChar();
  const pillars = {
    year: eight.getYear(),
    month: eight.getMonth(),
    day: eight.getDay(),
    hour: eight.getTime(),
  };

  const solarTerm = getCurrentSolarTerm(lunar);
  const dun = getDunFromTerm(solarTerm);
  const yuan = getYuan(pillars.day, juMethod);
  const ju = juMethod === "zhirun" ? getJuZhirun(solarTerm, dun, yuan) : getJuChaibu(solarTerm, dun, yuan);
  const xunShou = getXunShou(pillars.hour);
  const hiddenStem = XUN_HIDDEN_STEM[xunShou] ?? "戊";
  const zhiFuPalace = LIU_YI_PALACE[hiddenStem] ?? "坎一";
  const zhiShiPalace = zhiFuPalace;
  const zhiFu = ORIGINAL_STAR_AT_PALACE[zhiFuPalace] ?? "天蓬";
  const zhiShi = ORIGINAL_DOOR_AT_PALACE[zhiShiPalace] ?? "休门";

  const palaces = buildPalaces({
    dun,
    ju,
    hourStem: pillars.hour[0],
    zhiFu,
    zhiShi,
    zhiFuPalace,
    zhiShiPalace,
    xunShou,
  });

  const kongWang = KONG_WANG[xunShou] ?? [];
  const ruMu = detectRuMu(palaces);
  const menPo = detectMenPo(palaces);
  const jiXing = detectJiXing(palaces);

  return {
    inputTime: date.toISOString(),
    juMethod,
    solarTerm,
    pillars,
    dun,
    ju,
    yuan,
    xunShou,
    zhiFu,
    zhiShi,
    zhiFuPalace,
    zhiShiPalace,
    kongWang,
    ruMu,
    menPo,
    jiXing,
    palaces,
    notes: [
      `排盘口径：${juMethod === "chaibu" ? "拆补法" : "置闰法"}；节气 ${solarTerm}，${dun}${ju}局，${yuan}。`,
      "值符为旬首六仪所遁之宫主星，值使为同宫原始八门；时干飞宫后定当前落宫。",
      "中五宫象意按传统寄坤二解读，盘面保留中宫以便观察全局枢纽。",
    ],
  };
}

function getCurrentSolarTerm(lunar: ReturnType<ReturnType<typeof Solar.fromYmdHms>["getLunar"]>): string {
  const jq = (lunar as { getJieQi?: () => string | null }).getJieQi?.();
  if (jq) return jq;
  const prev = (lunar as { getPrevJieQi?: () => { getName?: () => string } | null }).getPrevJieQi?.();
  return prev?.getName?.() ?? "冬至";
}

function getDunFromTerm(term: string): "阳遁" | "阴遁" {
  const idx = JIE_QI_ORDER.indexOf(term as (typeof JIE_QI_ORDER)[number]);
  if (idx < 0) return "阳遁";
  return idx >= 0 && idx < 12 ? "阳遁" : "阴遁";
}

function getYuan(dayPillar: string, juMethod: QimenJuMethod): "上元" | "中元" | "下元" {
  const sexagenary = buildSexagenary();
  const index = sexagenary.indexOf(dayPillar);
  if (index < 0) return "上元";
  if (juMethod === "zhirun") {
    const mod = index % 15;
    if (mod < 5) return "上元";
    if (mod < 10) return "中元";
    return "下元";
  }
  const bucket = Math.floor(index / 5) % 3;
  return bucket === 0 ? "上元" : bucket === 1 ? "中元" : "下元";
}

function getJuChaibu(term: string, dun: "阳遁" | "阴遁", yuan: "上元" | "中元" | "下元"): number {
  const table = dun === "阳遁" ? YANG_JU : YIN_JU;
  const row = table[term] ?? (dun === "阳遁" ? [1, 7, 4] : [9, 3, 6]);
  return row[yuan === "上元" ? 0 : yuan === "中元" ? 1 : 2];
}

function getJuZhirun(term: string, dun: "阳遁" | "阴遁", yuan: "上元" | "中元" | "下元"): number {
  const base = getJuChaibu(term, dun, yuan);
  const idx = JIE_QI_ORDER.indexOf(term as (typeof JIE_QI_ORDER)[number]);
  const leap = idx === 0 || idx === 12 ? 1 : 0;
  const forward = dun === "阳遁";
  const adjusted = forward ? base + leap : base - leap;
  return ((adjusted - 1 + 9) % 9) + 1;
}

function getXunShou(hourPillar: string): string {
  const sexagenary = buildSexagenary();
  const index = Math.max(0, sexagenary.indexOf(hourPillar));
  const head = Math.floor(index / 10) * 10;
  return sexagenary[head] ?? "甲子";
}

function buildPalaces(input: {
  dun: "阳遁" | "阴遁";
  ju: number;
  hourStem: string;
  zhiFu: string;
  zhiShi: string;
  zhiFuPalace: string;
  zhiShiPalace: string;
  xunShou: string;
}): QimenPalace[] {
  const forward = input.dun === "阳遁";
  const earth = rotateNine(SIX_YI, input.ju - 1, forward);
  const hourIndex = STEMS.indexOf(input.hourStem as (typeof STEMS)[number]);
  const heaven = rotateNine(earth, hourIndex < 0 ? 0 : hourIndex, forward);

  const zhiFuPalaceIdx = PALACES.indexOf(input.zhiFuPalace as (typeof PALACES)[number]);
  const zhiShiDoorIdx = DOORS.indexOf(input.zhiShi as (typeof DOORS)[number]);
  const hourPalaceIdx = hourIndex >= 0 ? hourIndex % 9 : 0;

  const stars = rotateNine(STARS, zhiFuPalaceIdx, forward);
  const doors = rotateEight(DOORS, zhiShiDoorIdx, forward);
  const gods = rotateEight(GODS, 0, forward);

  const kongBranches = KONG_WANG[input.xunShou] ?? [];
  const palaceBranchMap: Record<string, string> = {
    坎一: "子", 坤二: "未", 震三: "卯", 巽四: "辰", 中五: "中",
    乾六: "戌", 兑七: "酉", 艮八: "寅", 离九: "午",
  };

  return PALACES.map((palace, index) => {
    const door = palace === "中五" ? undefined : doors[index % 8];
    const heavenStem = heaven[index] ?? "戊";
    const earthStem = earth[index] ?? "戊";
    const star = stars[index] ?? "天蓬";
    const isZhiFu = palace === input.zhiFuPalace || (index === hourPalaceIdx && star === input.zhiFu);
    const isZhiShi = door === input.zhiShi && palace !== "中五";
    const tombPalace = STEM_TOMB_PALACE[heavenStem] ?? STEM_TOMB_PALACE[earthStem];
    const jiStem = JIXING[palace];

    return {
      palace,
      direction: PALACE_DIRECTIONS[palace] ?? "",
      earthStem,
      heavenStem,
      door,
      star,
      god: palace === "中五" ? undefined : gods[index % 8],
      isZhiFu,
      isZhiShi,
      kongWang: kongBranches.includes(palaceBranchMap[palace] ?? ""),
      ruMu: tombPalace === palace,
      menPo: door ? controls(DOOR_ELEMENT[door], PALACE_ELEMENT[palace]) : false,
      jiXing: jiStem === heavenStem || jiStem === earthStem,
    };
  });
}

function detectRuMu(palaces: QimenPalace[]): string[] {
  return palaces.filter((p) => p.ruMu).map((p) => `${p.palace}·${p.heavenStem || p.earthStem}入墓`);
}

function detectMenPo(palaces: QimenPalace[]): string[] {
  return palaces.filter((p) => p.menPo && p.door).map((p) => `${p.door}迫${p.palace}`);
}

function detectJiXing(palaces: QimenPalace[]): string[] {
  return palaces.filter((p) => p.jiXing).map((p) => `${p.palace}击刑`);
}

function controls(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  const cycle: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
  return cycle[a] === b;
}

function rotateNine<T>(items: readonly T[], offset: number, forward: boolean): T[] {
  const len = 9;
  return Array.from({ length: len }, (_, index) => {
    const next = forward ? index + offset : index - offset;
    return items[(next % len + len) % len];
  });
}

function rotateEight<T>(items: readonly T[], offset: number, forward: boolean): T[] {
  const len = 8;
  return Array.from({ length: len }, (_, index) => {
    const next = forward ? index + offset : index - offset;
    return items[(next % len + len) % len];
  });
}

function buildSexagenary(): string[] {
  return Array.from({ length: 60 }, (_, index) => `${STEMS[index % 10]}${BRANCHES[index % 12]}`);
}

export { OUTER_PALACES, PALACES, PALACE_DIRECTIONS, DOORS, STARS, GODS, SIX_YI };
