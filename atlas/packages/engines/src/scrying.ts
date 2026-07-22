import type { ScryingInput } from "@atlas/shared-types";
import { createRng } from "./seed.ts";

export const CRYSTAL_TYPES = [
  { id: "quartz", name: "白水晶", meaning: "清明与放大意图" },
  { id: "amethyst", name: "紫水晶", meaning: "直觉与情绪整合" },
  { id: "obsidian", name: "黑曜石", meaning: "阴影与边界" },
  { id: "rose", name: "粉晶", meaning: "温柔与自我照护" },
  { id: "citrine", name: "黄水晶", meaning: "行动与自信" },
] as const;

const VISION_COLORS = [
  { name: "蓝光", meaning: "冷静沟通，情绪降温" },
  { name: "雾白", meaning: "不确定，信息尚模糊" },
  { name: "金光", meaning: "灵感启动，行动冲动" },
  { name: "暗影", meaning: "未说部分，压抑内容" },
];

const VISION_SHAPES = [
  { name: "门", meaning: "入口选择，新路径" },
  { name: "螺旋", meaning: "反复深化，循环课题" },
  { name: "水面", meaning: "情绪映照，感受流动" },
  { name: "桥", meaning: "连接过渡，关系修复" },
];

const VISION_IMAGES = [
  { name: "火花", meaning: "灵感启动" },
  { name: "影子", meaning: "潜意识提醒" },
  { name: "星点", meaning: "方向感回归" },
  { name: "涟漪", meaning: "波动扩散" },
];

export interface ScryingResult {
  crystal: (typeof CRYSTAL_TYPES)[number];
  color: { name: string; meaning: string };
  shape: { name: string; meaning: string };
  image: { name: string; meaning: string };
  summary: string;
  meditation: string;
  seed: string;
  question?: string;
}

function pick<T>(pool: T[], rng: () => number): T {
  return pool[Math.floor(rng() * pool.length)]!;
}

export function castScryingVision(input: ScryingInput = {}): ScryingResult {
  const seed = input.seed ?? new Date().toISOString();
  const rng = createRng(`${seed}:scrying`);
  const crystal =
    CRYSTAL_TYPES.find((c) => c.id === input.crystalId) ?? pick([...CRYSTAL_TYPES], rng);
  const color = pick(VISION_COLORS, rng);
  const shape = pick(VISION_SHAPES, rng);
  const image = pick(VISION_IMAGES, rng);

  const summary = `凝视${crystal.name}时出现${color.name}与${shape.name}，重复意象「${image.name}」。`;
  const meditation = `以${crystal.meaning}为基调，先记录${color.name}带来的感受，再问自己：${shape.meaning}。`;

  return {
    crystal,
    color,
    shape,
    image,
    summary,
    meditation,
    seed,
    question: input.question,
  };
}
