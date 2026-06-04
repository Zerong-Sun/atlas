import type { DreamEntryInput } from "@atlas/shared-types";
import { MOCK_DREAM_TREND } from "../mock/data";
import { callEdge, EDGE_PATHS, useMockApi } from "./client";

export interface DreamInterpretation {
  entryId: string;
  chinese: string;
  jungian: string;
  reflection: string;
  degraded?: boolean;
  createdAt: string;
}

type DreamRow = {
  id: string;
  interpretation?: {
    chinese?: string;
    jungian?: string;
    islamic?: string;
    reflection?: string;
    degraded?: boolean;
  };
  created_at?: string;
};

function mapDreamRow(row: DreamRow): DreamInterpretation {
  const interp = row.interpretation ?? {};
  return {
    entryId: row.id,
    chinese: interp.chinese ?? "",
    jungian: interp.jungian ?? "",
    reflection: interp.reflection ?? interp.islamic ?? "",
    degraded: Boolean(row.interpretation?.degraded),
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function createDreamEntry(input: DreamEntryInput): Promise<DreamInterpretation> {
  if (useMockApi()) {
    await delay(600);
    return {
      entryId: `dream-${Date.now()}`,
      chinese: `【中国梦占】梦中「${input.symbols.join("、") || "意象"}」或象征内心流转与待启之门；情绪「${input.emotions.join("、") || "平和"}」提示近期宜留意边界感。`,
      jungian: `【荣格简释】符号可能对应集体原型中的「过渡」主题，建议记录三日内的重复意象。`,
      reflection: `【精神反思】可将此梦视为自我觉察的邀请，而非命运预告。今日可写下一件感恩之事。`,
      createdAt: new Date().toISOString(),
    };
  }
  const data = await callEdge<DreamRow>(EDGE_PATHS.interpretDream, {
    body: input as unknown as Record<string, unknown>,
  });
  if (!data) {
    return {
      entryId: `dream-${Date.now()}`,
      chinese: "解读生成中，请稍后重试。",
      jungian: "",
      reflection: "",
      createdAt: new Date().toISOString(),
    };
  }
  return mapDreamRow(data);
}

export async function fetchDreamTrend(): Promise<typeof MOCK_DREAM_TREND> {
  if (useMockApi()) return { ...MOCK_DREAM_TREND };
  return { ...MOCK_DREAM_TREND };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
