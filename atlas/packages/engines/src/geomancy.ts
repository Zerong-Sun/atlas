import type { GeomancyInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

/** true = one dot (active), false = two dots (passive) */
export type GeomancyLine = boolean;
export type GeomancyFigure = [GeomancyLine, GeomancyLine, GeomancyLine, GeomancyLine];
export type GeomancyQuestionType = NonNullable<GeomancyInput["questionType"]>;

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
const SIGNIFICATOR_HOUSES: Record<
  GeomancyQuestionType,
  { house: number; label: string; focus: string }
> = {
  general: { house: 1, label: "一般事项", focus: "先看提问者自身状态，再以审判图收束。" },
  self: { house: 1, label: "自身与状态", focus: "观察身体感受、主动性与当下处境。" },
  money: { house: 2, label: "金钱与资源", focus: "观察收入、资产、物品与资源流入流出。" },
  home: { house: 4, label: "家庭与根基", focus: "观察住处、根基、土地、家人和事情的结局。" },
  health: { house: 6, label: "健康与日常", focus: "观察日常负担、修复节奏与需要照看的细节。" },
  relationship: { house: 7, label: "关系与对方", focus: "观察伴侣、合作方、对手与一对一互动。" },
  travel: { house: 9, label: "远行与远方", focus: "观察远行、跨文化事务、学习与愿景扩展。" },
  study: { house: 9, label: "学习与信念", focus: "观察高阶学习、考试方向、导师与理解框架。" },
  career: { house: 10, label: "事业与公开结果", focus: "观察职业路径、名望、负责人和外部可见成果。" },
};

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
  significator: {
    questionType: GeomancyQuestionType;
    house: number;
    label: string;
    focus: string;
    figure: ReturnType<typeof figureFromLines>;
    reading: string;
  };
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
  const questionType = input.questionType ?? "general";
  const significatorHouse = SIGNIFICATOR_HOUSES[questionType];
  const significatorFigure = houses[significatorHouse.house - 1]!.figure;
  const significator = {
    questionType,
    house: significatorHouse.house,
    label: significatorHouse.label,
    focus: significatorHouse.focus,
    figure: significatorFigure,
    reading: `用神宫第${significatorHouse.house}宫 ${significatorFigure.name}：${significatorFigure.meaning}。${significatorHouse.focus}`,
  };

  const summary = `用神宫第${significator.house}宫 ${significator.figure.name}；审判图 ${judge.name}：${judge.meaning}。左见证 ${witnesses[0]!.name}，右见证 ${witnesses[1]!.name}。`;

  return {
    mothers,
    daughters,
    nieces,
    witnesses,
    judge,
    houses,
    significator,
    summary,
    seed,
    question: input.question,
  };
}
