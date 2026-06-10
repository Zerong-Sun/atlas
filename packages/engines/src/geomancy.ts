import type { GeomancyInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

/** true = one dot (active), false = two dots (passive) */
export type GeomancyLine = boolean;
export type GeomancyFigure = [GeomancyLine, GeomancyLine, GeomancyLine, GeomancyLine];

export const GEOMANCY_FIGURES: Record<string, { name: string; meaning: string; lines: GeomancyFigure }> = {
  via: { name: "Via", meaning: "道路变化，移动与不稳定", lines: [true, true, true, true] },
  puer: { name: "Puer", meaning: "冲动阳刚，竞争行动", lines: [true, true, true, false] },
  albus: { name: "Albus", meaning: "清明冷静，理性判断", lines: [true, true, false, true] },
  populus: { name: "Populus", meaning: "群体顺从，环境共振", lines: [true, true, false, false] },
  fortunaMajor: { name: "Fortuna Major", meaning: "大吉稳固，长期支持", lines: [true, false, true, true] },
  fortunaMinor: { name: "Fortuna Minor", meaning: "小吉短利，短期机会", lines: [true, false, true, false] },
  conjunctio: { name: "Conjunctio", meaning: "会合连接，合作契机", lines: [true, false, false, true] },
  puella: { name: "Puella", meaning: "和合审美，关系柔性", lines: [true, false, false, false] },
  amissio: { name: "Amissio", meaning: "损失流出，需要止损", lines: [false, true, true, true] },
  carcer: { name: "Carcer", meaning: "限制束缚，暂缓推进", lines: [false, true, true, false] },
  tristitia: { name: "Tristitia", meaning: "沉重迟滞，耐心考验", lines: [false, true, false, true] },
  laetitia: { name: "Laetitia", meaning: "喜悦扩张，顺势推进", lines: [false, true, false, false] },
  caput: { name: "Caput Draconis", meaning: "开端入口，新机会", lines: [false, false, true, true] },
  cauda: { name: "Cauda Draconis", meaning: "结束退出，收尾清理", lines: [false, false, true, false] },
  rubeus: { name: "Rubeus", meaning: "躁烈混乱，风险失控", lines: [false, false, false, true] },
  acquistio: { name: "Acquisitio", meaning: "获取积累，资源汇聚", lines: [false, false, false, false] },
};

const FIGURE_KEYS = Object.keys(GEOMANCY_FIGURES);

function figureKey(lines: GeomancyFigure): string {
  const key = FIGURE_KEYS.find((k) =>
    GEOMANCY_FIGURES[k]!.lines.every((line, i) => line === lines[i]),
  );
  return key ?? "via";
}

function combineFigures(a: GeomancyFigure, b: GeomancyFigure): GeomancyFigure {
  return a.map((line, i) => line !== b[i]!) as GeomancyFigure;
}

function randomFigure(rng: () => number): GeomancyFigure {
  return Array.from({ length: 4 }, () => rng() < 0.5) as GeomancyFigure;
}

function figureFromLines(lines: GeomancyFigure) {
  const key = figureKey(lines);
  return { key, ...GEOMANCY_FIGURES[key]!, lines };
}

export interface GeomancyResult {
  mothers: ReturnType<typeof figureFromLines>[];
  daughters: ReturnType<typeof figureFromLines>[];
  nieces: ReturnType<typeof figureFromLines>[];
  witnesses: ReturnType<typeof figureFromLines>[];
  judge: ReturnType<typeof figureFromLines>;
  houses: Array<{ house: number; figure: ReturnType<typeof figureFromLines> }>;
  summary: string;
  seed: string;
  question?: string;
}

function seedFromMothers(mothers: boolean[][]): string {
  const body = mothers
    .map((rows) => rows.map((dot) => (dot ? "1" : "0")).join(""))
    .join("-");
  return `manual:${body}`;
}

export function castGeomancy(input: GeomancyInput = {}): GeomancyResult {
  const hasManualMothers = input.mothers?.length === 4;
  const seed = hasManualMothers
    ? seedFromMothers(input.mothers!)
    : (input.seed ?? new Date().toISOString());
  const rng = createRng(`${seed}:geomancy`);

  const manualMothers = hasManualMothers ? input.mothers! : null;
  const mothers = (manualMothers
    ? manualMothers.map((lines) => figureFromLines(lines as GeomancyFigure))
    : Array.from({ length: 4 }, () => figureFromLines(randomFigure(rng))));

  const daughters = Array.from({ length: 4 }, (_, row) => {
    const lines = mothers.map((m) => m.lines[row]!) as GeomancyFigure;
    return figureFromLines(lines);
  });

  const nieces = [
    figureFromLines(combineFigures(daughters[0]!.lines, daughters[1]!.lines)),
    figureFromLines(combineFigures(daughters[2]!.lines, daughters[3]!.lines)),
  ];

  const witnesses = [
    figureFromLines(combineFigures(mothers[0]!.lines, mothers[1]!.lines)),
    figureFromLines(combineFigures(mothers[2]!.lines, mothers[3]!.lines)),
  ];

  const judge = figureFromLines(combineFigures(witnesses[0]!.lines, witnesses[1]!.lines));

  const houseFigures = [mothers[0]!, mothers[1]!, nieces[0]!, mothers[2]!, mothers[3]!, nieces[1]!, daughters[0]!, daughters[1]!, daughters[2]!, daughters[3]!, witnesses[0]!, judge];
  const houses = houseFigures.map((figure, index) => ({ house: index + 1, figure }));

  const summary = `审判图 ${judge.name}：${judge.meaning}。左见证 ${witnesses[0]!.name}，右见证 ${witnesses[1]!.name}。`;

  return {
    mothers,
    daughters,
    nieces,
    witnesses,
    judge,
    houses,
    summary,
    seed,
    question: input.question,
  };
}
