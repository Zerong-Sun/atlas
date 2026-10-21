import { createRng } from "./seed.ts";

import { ICHING_CLASSICS } from "./data/iching-classics.ts";
const DISPLAY_NAMES = ["乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履", "泰", "否", "同人", "大有", "谦", "豫", "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复", "无妄", "大畜", "颐", "大过", "坎", "离", "咸", "恒", "遁", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解", "损", "益", "夬", "姤", "萃", "升", "困", "井", "革", "鼎", "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节", "中孚", "小过", "既济", "未济"];
export type HexagramText = { name:string; sourceName:string; judgment:string; image:string; yaoTexts:readonly string[]; useText:string|null; sourceTitle:string; sourceUrl:string; sourceRevision:number; sourceSha256:string; textKind:string; license:string };
/** Revision-pinned primary text; keep source orthography, simplified display names only. */
export const HEXAGRAMS: Record<number,HexagramText> = Object.fromEntries(Object.entries(ICHING_CLASSICS).map(([n,text])=>[Number(n),{...text,name:DISPLAY_NAMES[Number(n)-1]!,sourceName:text.name}]));

/** King Wen sequence; bit 0 is the bottom line. Never use the ordinal as a bitmask.
 * Source: 周易六十四卦上下卦表 https://zh.wikisource.org/wiki/周易 */
export const KING_WEN_BITS = [63,0,17,34,23,58,2,16,55,59,7,56,61,47,4,8,25,38,3,48,41,37,32,1,57,39,33,30,18,45,28,14,60,15,40,5,53,43,20,10,35,49,31,62,24,6,26,22,29,46,9,36,52,11,13,44,54,27,50,19,51,12,21,42] as const;
export type YaoValue = 6 | 7 | 8 | 9;
export const YAO_LABELS: Record<YaoValue, string> = { 6: "老阴", 7: "少阳", 8: "少阴", 9: "老阳" };
export function hexagramNumber(lines: readonly boolean[]): number {
  if (lines.length !== 6) throw new Error("需要从初爻到上爻的六爻");
  const bits = lines.reduce((value, yang, index) => value | (yang ? 1 << index : 0), 0);
  return (KING_WEN_BITS as readonly number[]).indexOf(bits) + 1;
}
export function validateYaoLines(lines: readonly number[]): asserts lines is readonly YaoValue[] {
  if (lines.length !== 6 || lines.some(v => ![6,7,8,9].includes(v))) throw new Error("六爻必须按从下到上顺序填写 6、7、8、9");
}
/** Three independent fair coins, each face valued 2 or 3: probabilities 1:3:3:1. */
export function tossThreeCoins(random: () => number = Math.random): YaoValue {
  return ([0,1,2].reduce(sum => sum + (random() < 0.5 ? 2 : 3), 0)) as YaoValue;
}
export function hexagramFromLines(lines: readonly boolean[]) {
  const number = hexagramNumber(lines);
  return { number, lines: lines.map(yang => yang ? "yang" as const : "yin" as const), ...HEXAGRAMS[number]! };
}
export function castIChingFromLines(values: readonly number[]) {
  validateYaoLines(values);
  const primary = hexagramFromLines(values.map(v => v % 2 === 1));
  const changing = hexagramFromLines(values.map(v => v === 6 || v === 7));
  const movingLines = values.flatMap((v, i) => v === 6 || v === 9 ? [i + 1] : []);
  return {
    primary, changing, movingLines, coinLines: [...values], method: "three_coins",
    algorithmVersion: "iching-coins-v2",
    source: "《周易》通行本卦序；三钱法，6 老阴、7 少阳、8 少阴、9 老阳；从下向上记爻。",
    textNote: "卦辞、大象与六条爻辞来自带版本记录的原典转录，保留原字形；现代解释另行标注。动爻列出位置，不自动套用某一派多动爻断法。",
    summary: movingLines.length ? `本卦${primary.name}，第${movingLines.join("、")}爻动，之卦${changing.name}` : `${primary.name}卦，无动爻（静卦）`,
  };
}
/** Seeded simulation for reports. Interactive screens pass their actual six throws instead. */
export function castIChing(seed: string): ReturnType<typeof castIChingFromLines> {
  const random = createRng(`${seed}:iching:coins-v2`);
  return castIChingFromLines(Array.from({ length: 6 }, () => tossThreeCoins(random)));
}
