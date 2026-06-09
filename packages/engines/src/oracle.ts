import type { OracleInput } from "@atlas/shared-types";
import { shuffleWithSeed } from "./seed.ts";

export const ORACLE_CARDS = [
  { id: "boundary", name: "边界", meaning: "保护范围，学会说不", affirmation: "我有权守护自己的空间。" },
  { id: "trust", name: "信任", meaning: "开放连接，交付可信任之处", affirmation: "我选择以诚实建立连接。" },
  { id: "integration", name: "整合", meaning: "收回碎片，内在统一", affirmation: "我允许各部分慢慢和解。" },
  { id: "rest", name: "休息", meaning: "恢复能量，暂停必要", affirmation: "休息是我主动的选择。" },
  { id: "courage", name: "勇气", meaning: "主动表达，跨出一步", affirmation: "我以小步行动面对未知。" },
  { id: "clearing", name: "清理", meaning: "释放旧物，断舍离", affirmation: "我放下不再服务的部分。" },
  { id: "listening", name: "倾听", meaning: "接收信息，感受身体", affirmation: "我聆听身体与直觉的声音。" },
  { id: "grounding", name: "扎根", meaning: "现实稳定，基本照护", affirmation: "我回到可依靠的日常。" },
  { id: "flow", name: "流动", meaning: "顺应变化，减少对抗", affirmation: "我允许事情以自己的节奏展开。" },
  { id: "light", name: "光明", meaning: "看见希望，保持方向", affirmation: "微光足以照亮下一步。" },
] as const;

export type OracleCard = (typeof ORACLE_CARDS)[number];
export type OracleSpread = "single" | "three";

export type OracleDrawnCard = OracleCard & {
  position: string;
};

export interface OracleResult {
  cards: OracleDrawnCard[];
  spread: OracleSpread;
  theme?: string;
  summary: string;
  seed: string;
  question?: string;
}

const POSITIONS: Record<OracleSpread, string[]> = {
  single: ["当下指引"],
  three: ["内在状态", "外在情境", "行动练习"],
};

export function drawOracle(input: OracleInput = {}): OracleResult {
  const spread = input.spread ?? "single";
  const seed = input.seed ?? new Date().toISOString();
  const positions = POSITIONS[spread];
  const deck = shuffleWithSeed([...ORACLE_CARDS], `${seed}:oracle`);
  const theme = input.theme?.trim() || undefined;

  const cards: OracleDrawnCard[] = positions.map((position, index) => ({
    ...deck[index % deck.length]!,
    position,
  }));

  const summary =
    spread === "single"
      ? `神谕卡「${cards[0]!.name}」：${cards[0]!.meaning}`
      : `三卡主题：${cards.map((c) => c.name).join(" → ")}。${cards[2]!.affirmation}`;

  return {
    cards,
    spread,
    theme,
    summary,
    seed,
    question: input.question,
  };
}
