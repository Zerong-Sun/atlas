import type { AstrodiceInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

export const ASTRO_PLANETS = [
  { id: "sun", name: "太阳", symbol: "☉", meaning: "核心意志与显化方向" },
  { id: "moon", name: "月亮", symbol: "☽", meaning: "情绪需求与安全感" },
  { id: "mercury", name: "水星", symbol: "☿", meaning: "思维沟通与信息" },
  { id: "venus", name: "金星", symbol: "♀", meaning: "关系价值与吸引" },
  { id: "mars", name: "火星", symbol: "♂", meaning: "行动冲突与推进力" },
  { id: "jupiter", name: "木星", symbol: "♃", meaning: "扩张信念与机会" },
  { id: "saturn", name: "土星", symbol: "♄", meaning: "限制责任与结构" },
  { id: "uranus", name: "天王星", symbol: "♅", meaning: "突变自由与非传统" },
  { id: "neptune", name: "海王星", symbol: "♆", meaning: "理想迷雾与灵感" },
  { id: "pluto", name: "冥王星", symbol: "♇", meaning: "深层转化与执念" },
] as const;

export const ASTRO_SIGNS = [
  { id: "aries", name: "白羊座", symbol: "♈", meaning: "开创冲动与直接行动" },
  { id: "taurus", name: "金牛座", symbol: "♉", meaning: "稳定积累与感官安全" },
  { id: "gemini", name: "双子座", symbol: "♊", meaning: "沟通多变与灵活" },
  { id: "cancer", name: "巨蟹座", symbol: "♋", meaning: "情感归属与保护" },
  { id: "leo", name: "狮子座", symbol: "♌", meaning: "表达创造与自信" },
  { id: "virgo", name: "处女座", symbol: "♍", meaning: "分析服务与秩序" },
  { id: "libra", name: "天秤座", symbol: "♎", meaning: "关系平衡与协商" },
  { id: "scorpio", name: "天蝎座", symbol: "♏", meaning: "深度转化与亲密" },
  { id: "sagittarius", name: "射手座", symbol: "♐", meaning: "信念远行与扩展" },
  { id: "capricorn", name: "摩羯座", symbol: "♑", meaning: "结构成就与责任" },
  { id: "aquarius", name: "水瓶座", symbol: "♒", meaning: "革新独立与理想" },
  { id: "pisces", name: "双鱼座", symbol: "♓", meaning: "融合灵性与直觉" },
] as const;

export const ASTRO_HOUSES = [
  { id: "1", name: "第一宫", symbol: "Ⅰ", meaning: "自我身体与个人状态" },
  { id: "2", name: "第二宫", symbol: "Ⅱ", meaning: "资源价值与财务" },
  { id: "3", name: "第三宫", symbol: "Ⅲ", meaning: "沟通学习与短途" },
  { id: "4", name: "第四宫", symbol: "Ⅳ", meaning: "家宅根基与归属" },
  { id: "5", name: "第五宫", symbol: "Ⅴ", meaning: "创造恋爱与娱乐" },
  { id: "6", name: "第六宫", symbol: "Ⅵ", meaning: "工作健康与日常" },
  { id: "7", name: "第七宫", symbol: "Ⅶ", meaning: "合作伴侣与婚姻" },
  { id: "8", name: "第八宫", symbol: "Ⅷ", meaning: "共享转化与亲密" },
  { id: "9", name: "第九宫", symbol: "Ⅸ", meaning: "信念远行与高等教育" },
  { id: "10", name: "第十宫", symbol: "Ⅹ", meaning: "事业名望与公众角色" },
  { id: "11", name: "第十一宫", symbol: "Ⅺ", meaning: "社群愿景与朋友" },
  { id: "12", name: "第十二宫", symbol: "Ⅻ", meaning: "隐退灵性与潜意识" },
] as const;

export type AstroPlanet = (typeof ASTRO_PLANETS)[number];
export type AstroSign = (typeof ASTRO_SIGNS)[number];
export type AstroHouse = (typeof ASTRO_HOUSES)[number];

export interface AstrodiceResult {
  planet: AstroPlanet;
  sign: AstroSign;
  house: AstroHouse;
  syntaxLine: string;
  question?: string;
  seed: string;
}

function pickOne<T>(pool: readonly T[], rng: () => number): T {
  return pool[Math.floor(rng() * pool.length)]!;
}

export function rollAstrodice(input: AstrodiceInput = {}): AstrodiceResult {
  const seed = input.seed ?? new Date().toISOString();
  const rng = createRng(seed);
  const planet = pickOne(ASTRO_PLANETS, rng);
  const sign = pickOne(ASTRO_SIGNS, rng);
  const house = pickOne(ASTRO_HOUSES, rng);
  const syntaxLine = `${planet.name}以${sign.name}的风格，落在${house.name}的场域：${planet.meaning}，经由${sign.meaning}，在${house.meaning}中显化。`;

  return {
    planet,
    sign,
    house,
    syntaxLine,
    question: input.question,
    seed,
  };
}
