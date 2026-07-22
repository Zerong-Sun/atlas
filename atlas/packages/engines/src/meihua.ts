import type { MeihuaInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

/** Bottom → top line; true = yang (one line), false = yin (broken). */
export type TrigramLines = [boolean, boolean, boolean];

const TRIGRAMS = [
  { id: 1, name: "乾", element: "金", meaning: "刚健主动", lines: [true, true, true] as TrigramLines },
  { id: 2, name: "兑", element: "金", meaning: "悦泽沟通", lines: [true, true, false] as TrigramLines },
  { id: 3, name: "离", element: "火", meaning: "显明依附", lines: [true, false, true] as TrigramLines },
  { id: 4, name: "震", element: "木", meaning: "启动震动", lines: [true, false, false] as TrigramLines },
  { id: 5, name: "巽", element: "木", meaning: "渗透沟通", lines: [false, true, true] as TrigramLines },
  { id: 6, name: "坎", element: "水", meaning: "险阻流动", lines: [false, true, false] as TrigramLines },
  { id: 7, name: "艮", element: "土", meaning: "停止边界", lines: [false, false, true] as TrigramLines },
  { id: 8, name: "坤", element: "土", meaning: "承载配合", lines: [false, false, false] as TrigramLines },
] as const;

const ELEMENT_CYCLE: Record<string, { generates: string; overcomes: string }> = {
  金: { generates: "水", overcomes: "木" },
  木: { generates: "火", overcomes: "土" },
  水: { generates: "木", overcomes: "火" },
  火: { generates: "土", overcomes: "金" },
  土: { generates: "金", overcomes: "水" },
};

function trigramFromNumber(n: number) {
  const index = ((n - 1) % 8 + 8) % 8;
  return TRIGRAMS[index]!;
}

function relation(body: string, use: string): string {
  if (body === use) return "比和，力量均衡";
  const b = ELEMENT_CYCLE[body];
  const u = ELEMENT_CYCLE[use];
  if (!b || !u) return "需综合判断";
  if (b.generates === use) return "体生用，付出较多";
  if (u.generates === body) return "用生体，得外力助";
  if (b.overcomes === use) return "体克用，占主动";
  if (u.overcomes === body) return "用克体，压力大";
  return "关系复杂";
}

export interface MeihuaResult {
  mode: string;
  upper: (typeof TRIGRAMS)[number];
  lower: (typeof TRIGRAMS)[number];
  body: (typeof TRIGRAMS)[number];
  use: (typeof TRIGRAMS)[number];
  mutualUpper: (typeof TRIGRAMS)[number];
  mutualLower: (typeof TRIGRAMS)[number];
  changing: (typeof TRIGRAMS)[number];
  relation: string;
  summary: string;
  seed: string;
  question?: string;
}

export function castMeihua(input: MeihuaInput = {}): MeihuaResult {
  const seed = input.seed ?? new Date().toISOString();
  const rng = createRng(`${seed}:meihua`);
  const mode = input.mode ?? "number";

  let upperNum: number;
  let lowerNum: number;

  if (mode === "time" && input.timestamp) {
    const d = new Date(input.timestamp);
    upperNum = (d.getHours() + d.getMinutes()) % 8 || 8;
    lowerNum = (d.getDate() + d.getMonth() + 1) % 8 || 8;
  } else if (input.numbers?.length) {
    upperNum = input.numbers[0]! % 8 || 8;
    lowerNum = (input.numbers[1] ?? input.numbers[0]!) % 8 || 8;
  } else {
    upperNum = Math.floor(rng() * 8) + 1;
    lowerNum = Math.floor(rng() * 8) + 1;
  }

  const upper = trigramFromNumber(upperNum);
  const lower = trigramFromNumber(lowerNum);
  const body = lower;
  const use = upper;
  const mutualLower = trigramFromNumber(lowerNum + upperNum);
  const mutualUpper = trigramFromNumber(upperNum + lowerNum);
  const changing = trigramFromNumber(upperNum + lowerNum + 1);
  const rel = relation(body.element, use.element);

  const summary = `上${upper.name}下${lower.name}，体${body.name}用${use.name}，${rel}。互卦${mutualLower.name}${mutualUpper.name}，变卦${changing.name}。`;

  return {
    mode,
    upper,
    lower,
    body,
    use,
    mutualUpper,
    mutualLower,
    changing,
    relation: rel,
    summary,
    seed,
    question: input.question,
  };
}
