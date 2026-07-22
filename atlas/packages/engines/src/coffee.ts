import type { CoffeeInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

export const COFFEE_SYMBOLS = [
  { id: "bird", name: "鸟", meaning: "消息与联络", zoneHint: "沟通机会" },
  { id: "road", name: "路", meaning: "选择与分岔", zoneHint: "路线判断" },
  { id: "mountain", name: "山", meaning: "阻碍与压力", zoneHint: "延迟卡点" },
  { id: "heart", name: "心形", meaning: "情绪与关系", zoneHint: "亲密动机" },
  { id: "key", name: "钥匙", meaning: "解法入口", zoneHint: "突破工具" },
  { id: "ring", name: "圆环", meaning: "承诺循环", zoneHint: "关系约束" },
  { id: "tree", name: "树", meaning: "成长根基", zoneHint: "长期健康" },
  { id: "fish", name: "鱼", meaning: "流动资源", zoneHint: "财务机会" },
  { id: "star", name: "星", meaning: "希望指引", zoneHint: "方向感" },
  { id: "wave", name: "波浪", meaning: "情绪波动", zoneHint: "起伏周期" },
] as const;

export type CoffeeZone = "bottom" | "wall" | "rim";

const ZONE_LABELS: Record<CoffeeZone, string> = {
  bottom: "杯底",
  wall: "杯壁",
  rim: "杯沿",
};

export interface CoffeeZoneReading {
  zone: CoffeeZone;
  zoneLabel: string;
  symbol: (typeof COFFEE_SYMBOLS)[number];
  reading: string;
}

export interface CoffeeResult {
  zones: CoffeeZoneReading[];
  narrative: string;
  summary: string;
  seed: string;
  question?: string;
}

function pickSymbol(seed: string, index: number) {
  const rng = createRng(`${seed}:coffee:${index}`);
  return COFFEE_SYMBOLS[Math.floor(rng() * COFFEE_SYMBOLS.length)]!;
}

export function readCoffeeGrounds(input: CoffeeInput = {}): CoffeeResult {
  const seed = input.seed ?? new Date().toISOString();
  const zones: CoffeeZone[] = ["bottom", "wall", "rim"];

  const readings: CoffeeZoneReading[] = zones.map((zone, index) => {
    const symbol = pickSymbol(seed, index);
    return {
      zone,
      zoneLabel: ZONE_LABELS[zone],
      symbol,
      reading: `${ZONE_LABELS[zone]}出现「${symbol.name}」：${symbol.meaning}，侧重${symbol.zoneHint}。`,
    };
  });

  const narrative = readings.map((r) => r.reading).join(" ");
  const summary = `杯底${readings[0]!.symbol.name}、杯壁${readings[1]!.symbol.name}、杯沿${readings[2]!.symbol.name}，组合成近期趋势提示。`;

  return {
    zones: readings,
    narrative,
    summary,
    seed,
    question: input.question,
  };
}
