import { Solar } from "lunar-javascript";
import type { EngineInput } from "./index.js";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const PALACES = ["坎一", "坤二", "震三", "巽四", "中五", "乾六", "兑七", "艮八", "离九"] as const;
const DOORS = ["休门", "生门", "伤门", "杜门", "景门", "死门", "惊门", "开门"] as const;
const STARS = ["天蓬", "天任", "天冲", "天辅", "天英", "天芮", "天柱", "天心", "天禽"] as const;
const GODS = ["值符", "腾蛇", "太阴", "六合", "白虎", "玄武", "九地", "九天"] as const;
const SIX_YI = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"] as const;
const PALACE_DIRECTIONS: Record<string, string> = {
  坎一: "北", 坤二: "西南", 震三: "东", 巽四: "东南", 中五: "中",
  乾六: "西北", 兑七: "西", 艮八: "东北", 离九: "南",
};
export interface QimenPalace {
  palace: string;
  direction: string;
  earthStem: string;
  heavenStem: string;
  door?: string;
  star: string;
  god?: string;
}

export interface QimenResult {
  inputTime: string;
  pillars: { year: string; month: string; day: string; hour: string };
  dun: "阳遁" | "阴遁";
  ju: number;
  yuan: "上元" | "中元" | "下元";
  xunShou: string;
  zhiFu: string;
  zhiShi: string;
  palaces: QimenPalace[];
  notes: string[];
}

export function computeQimen(input: EngineInput): QimenResult {
  const date = input.timestamp ? new Date(input.timestamp) : new Date();
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
  const eight = solar.getLunar().getEightChar();
  const pillars = {
    year: eight.getYear(),
    month: eight.getMonth(),
    day: eight.getDay(),
    hour: eight.getTime(),
  };
  const dun = getDun(date);
  const yuan = getYuan(pillars.day);
  const ju = getJu(date, dun, yuan);
  const xunShou = getXunShou(pillars.hour);
  const zhiFu = STARS[indexOfCycle(STEMS, xunShou[0]) % STARS.length];
  const zhiShi = doorForStem(xunShou[0]);
  const palaces = buildPalaces({ dun, ju, hourStem: pillars.hour[0], zhiFu, zhiShi });

  return {
    inputTime: date.toISOString(),
    pillars,
    dun,
    ju,
    yuan,
    xunShou,
    zhiFu,
    zhiShi,
    palaces,
    notes: [
      "本生成器按时家奇门结构生成可复盘盘面：四柱取自 lunar-javascript，阴阳遁按冬至至夏至为阳、夏至至冬至为阴。",
      "局数采用节气区间与上中下元折算，适合产品排盘；高精度择时可继续接入逐年节气精确时刻。",
      "中五宫象意按传统常寄坤二宫解读，页面展示仍保留中宫以便观察全局枢纽。",
    ],
  };
}

function getDun(date: Date): "阳遁" | "阴遁" {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const afterWinter = month > 12 || (month === 12 && day >= 21) || month < 6 || (month === 6 && day < 21);
  return afterWinter ? "阳遁" : "阴遁";
}

function getYuan(dayPillar: string): "上元" | "中元" | "下元" {
  const stem = indexOfCycle(STEMS, dayPillar[0]);
  const branch = indexOfCycle(BRANCHES, dayPillar[1]);
  const sexagenary = Array.from({ length: 60 }, (_, index) => `${STEMS[index % 10]}${BRANCHES[index % 12]}`);
  const index = sexagenary.indexOf(dayPillar);
  const bucket = Math.floor((index < 0 ? stem + branch : index) / 5) % 3;
  return bucket === 0 ? "上元" : bucket === 1 ? "中元" : "下元";
}

function getJu(date: Date, dun: "阳遁" | "阴遁", yuan: "上元" | "中元" | "下元") {
  const solarTermIndex = Math.floor(((date.getMonth() * 30 + date.getDate()) / 365) * 24);
  const base = dun === "阳遁" ? [1, 7, 4, 2, 8, 5, 3, 9, 6] : [9, 3, 6, 8, 2, 5, 7, 1, 4];
  const offset = yuan === "上元" ? 0 : yuan === "中元" ? 1 : 2;
  return base[(solarTermIndex + offset) % base.length];
}

function getXunShou(hourPillar: string) {
  const sexagenary = Array.from({ length: 60 }, (_, index) => `${STEMS[index % 10]}${BRANCHES[index % 12]}`);
  const index = Math.max(0, sexagenary.indexOf(hourPillar));
  const head = Math.floor(index / 10) * 10;
  const branch = sexagenary[head][1];
  return `甲${branch}`;
}

function doorForStem(stem: string) {
  const map: Record<string, string> = { 甲: "开门", 乙: "休门", 丙: "生门", 丁: "伤门", 戊: "杜门", 己: "景门", 庚: "死门", 辛: "惊门", 壬: "开门", 癸: "休门" };
  return map[stem] ?? "开门";
}

function buildPalaces(input: { dun: "阳遁" | "阴遁"; ju: number; hourStem: string; zhiFu: string; zhiShi: string }) {
  const forward = input.dun === "阳遁";
  const earth = rotate(SIX_YI, input.ju - 1, forward);
  const hourIndex = indexOfCycle(SIX_YI, input.hourStem);
  const heaven = rotate(earth, hourIndex < 0 ? 0 : hourIndex, forward);
  const starOffset = indexOfCycle(STARS, input.zhiFu);
  const doorOffset = DOORS.indexOf(input.zhiShi as (typeof DOORS)[number]);
  return PALACES.map((palace, index) => {
    const door = palace === "中五" ? undefined : rotate(DOORS, doorOffset < 0 ? 0 : doorOffset, forward)[index % 8];
    return {
      palace,
      direction: PALACE_DIRECTIONS[palace],
      earthStem: earth[index],
      heavenStem: heaven[index],
      door,
      star: rotate(STARS, starOffset, forward)[index],
      god: palace === "中五" ? undefined : rotate(GODS, starOffset, forward)[index % 8],
    };
  });
}

function rotate<T>(items: readonly T[], offset: number, forward: boolean): T[] {
  return items.map((_, index) => {
    const next = forward ? index + offset : index - offset;
    return items[(next % items.length + items.length) % items.length];
  });
}

function indexOfCycle<T extends string>(items: readonly T[], value: string) {
  return items.indexOf(value as T);
}
