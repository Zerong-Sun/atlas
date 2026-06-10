import type { XiangmianInput } from "@atlas/shared-types";

const OBSERVATIONS: Record<string, { meaning: string; predictionUse: string }> = {
  "上停-饱满": { meaning: "早年规划意识强", predictionUse: "适合长期布局" },
  "上停-略短": { meaning: "行动先于深思", predictionUse: "先小步验证再扩张" },
  "中停-匀称": { meaning: "现实处理稳健", predictionUse: "合作中可担协调角色" },
  "中停-突出": { meaning: "关系与行动面活跃", predictionUse: "注意节奏分配" },
  "下停-厚实": { meaning: "承载力与稳定感", predictionUse: "晚势可蓄力" },
  "眼神-清亮": { meaning: "专注与精神集中", predictionUse: "表达有说服力" },
  "眼神-疲惫": { meaning: "近期能量消耗", predictionUse: "先恢复再推进" },
  "气色-红润": { meaning: "短期能量尚可", predictionUse: "可把握窗口" },
  "气色-暗沉": { meaning: "需要休整", predictionUse: "减少硬推" },
  "眉形-平顺": { meaning: "意志与关系协调", predictionUse: "适合协商" },
  "口相-收敛": { meaning: "表达谨慎", predictionUse: "承诺前多确认" },
  "鼻相-匀称": { meaning: "财库与自信感均衡", predictionUse: "宜稳健经营" },
  "耳相-贴脑": { meaning: "纳谏与信息吸收", predictionUse: "多听少断" },
};

export interface XiangmianReading {
  observation: string;
  meaning: string;
  predictionUse: string;
}

export interface XiangmianResult {
  readings: XiangmianReading[];
  summary: string;
  advice: string[];
  question?: string;
}

export function readXiangmian(input: XiangmianInput): XiangmianResult {
  const selected = input.observations?.length
    ? input.observations
    : ["中停-匀称", "眼神-清亮"];

  const readings: XiangmianReading[] = selected.map((obs) => {
    const meta = OBSERVATIONS[obs] ?? { meaning: "需结合语境理解", predictionUse: "观察整体气象" };
    return { observation: obs, ...meta };
  });

  const summary = readings.map((r) => `${r.observation}：${r.meaning}`).join("；");
  const advice = [
    "基于自主观察的结构化解读，非照片识别。",
    "不做医疗或身份诊断，避免外貌价值判断。",
    "将观察转化为可执行的小调整，而非命运定论。",
  ];

  return { readings, summary, advice, question: input.question };
}

export const XIANGMIAN_OBSERVATION_OPTIONS = Object.keys(OBSERVATIONS);
