import type { PalmistryInput } from "@atlas/shared-types";

const LINE_OBSERVATIONS: Record<string, { meaning: string; predictionUse: string }> = {
  "生命线-深长": { meaning: "体力与节奏稳定", predictionUse: "适合持续投入" },
  "生命线-浅短": { meaning: "恢复模式需留意", predictionUse: "安排间歇" },
  "智慧线-平直": { meaning: "思维务实直接", predictionUse: "按步骤决策" },
  "智慧线-弯曲": { meaning: "直觉与想象活跃", predictionUse: "创意与验证并重" },
  "感情线-深长": { meaning: "情感表达充分", predictionUse: "关系里坦诚沟通" },
  "感情线-分叉": { meaning: "情感需求多元", predictionUse: "厘清优先级" },
  "事业线-清晰": { meaning: "目标轨迹明确", predictionUse: "可加码主业" },
  "事业线-断续": { meaning: "职业路径调整期", predictionUse: "先巩固再跳转" },
  "金星丘-饱满": { meaning: "亲密与活力需求强", predictionUse: "照护连接感" },
  "木星丘-突出": { meaning: "野心与领导欲", predictionUse: "设定可见目标" },
  "月丘-发达": { meaning: "想象与迁移倾向", predictionUse: "给直觉留空间" },
};

export interface PalmistryReading {
  observation: string;
  meaning: string;
  predictionUse: string;
}

export interface PalmistryResult {
  hand: "left" | "right" | "both";
  readings: PalmistryReading[];
  summary: string;
  advice: string[];
  question?: string;
}

export function readPalmistry(input: PalmistryInput): PalmistryResult {
  const hand = input.hand ?? "right";
  const selected = input.observations?.length
    ? input.observations
    : ["智慧线-平直", "感情线-深长"];

  const readings: PalmistryReading[] = selected.map((obs) => {
    const meta = LINE_OBSERVATIONS[obs] ?? { meaning: "需结合掌丘整体", predictionUse: "对照左右手" };
    return { observation: obs, ...meta };
  });

  const handLabel = hand === "left" ? "左手（先天/内在）" : hand === "right" ? "右手（后天/外显）" : "双手对照";
  const summary = `${handLabel}：${readings.map((r) => r.observation).join("、")}。`;
  const advice = [
    "基于自主观察的结构化解读，非图像识别。",
    "不从掌纹判断寿命或健康诊断。",
    "左右手对照可看内外状态差异。",
  ];

  return { hand, readings, summary, advice, question: input.question };
}

export const PALMISTRY_OBSERVATION_OPTIONS = Object.keys(LINE_OBSERVATIONS);
