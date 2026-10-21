import { Solar } from "lunar-javascript";
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
  movingLine: number;
  changedUpper: (typeof TRIGRAMS)[number];
  changedLower: (typeof TRIGRAMS)[number];
  algorithmVersion: string;
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
  let movingNumber: number;

  if (mode === "time" && input.timestamp) {
    const d = new Date(input.timestamp);
    if(!Number.isFinite(d.getTime()))throw new Error("时间格式无效");
    const lunar=Solar.fromYmdHms(d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()).getLunar();
    const branches="子丑寅卯辰巳午未申酉戌亥";
    const year=branches.indexOf(lunar.getYearInGanZhi().slice(-1))+1;
    const hour=branches.indexOf(lunar.getTimeInGanZhi().slice(-1))+1;
    upperNum=year+Math.abs(lunar.getMonth())+lunar.getDay();
    lowerNum=upperNum+hour;
    movingNumber=lowerNum;
  } else if (input.numbers?.length) {
    if(input.numbers.some(v=>!Number.isSafeInteger(v)||v<1))throw new Error("取数请使用正整数");
    upperNum=input.numbers[0]!;
    lowerNum=input.numbers[1]??upperNum;
    movingNumber=input.numbers[2]??(upperNum+lowerNum);
  } else {
    upperNum = Math.floor(rng() * 8) + 1;
    lowerNum = Math.floor(rng() * 8) + 1;
    movingNumber=upperNum+lowerNum;
  }

  const upper = trigramFromNumber(upperNum);
  const lower = trigramFromNumber(lowerNum);
  const movingLine=((movingNumber-1)%6)+1;
  const body=movingLine<=3?upper:lower;
  const use=movingLine<=3?lower:upper;
  const lines=[...lower.lines,...upper.lines];
  const fromLines=(bits:boolean[])=>TRIGRAMS.find(t=>t.lines.every((v,i)=>v===bits[i]))!;
  const mutualLower=fromLines(lines.slice(1,4));
  const mutualUpper=fromLines(lines.slice(2,5));
  const changed=[...lines];changed[movingLine-1]=!changed[movingLine-1];
  const changedLower=fromLines(changed.slice(0,3));
  const changedUpper=fromLines(changed.slice(3,6));
  const changing=movingLine<=3?changedLower:changedUpper;
  const rel = relation(body.element, use.element);

  const summary = `上${upper.name}下${lower.name}，体${body.name}用${use.name}，${rel}。互卦上${mutualUpper.name}下${mutualLower.name}，第${movingLine}爻动，变卦上${changedUpper.name}下${changedLower.name}。`;

  return {
    algorithmVersion: "meihua-structural-v2",
    movingLine, changedLower, changedUpper,
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
