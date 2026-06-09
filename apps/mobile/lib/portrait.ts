import { buildPortraitTraditions } from "@atlas/orchestrator/portrait-service";
import type { PortraitSummary, UserProfile } from "@atlas/shared-types";
import { llmComplete } from "./llm";

const FALLBACK_CONSENSUS =
  "多数体系都指向：先厘清内在节奏，再在现实选择上留有余地；不宜把单一符号当作定论。";
const FALLBACK_DIVERGENCE =
  "八字与占星偏长期结构与周期，塔罗与卦象更偏当下象征与行动提示；阅读时宜对照而非合并。";

async function synthesizeLocal(traditions: PortraitSummary["traditions"]): Promise<{
  consensus: string;
  divergence: string;
}> {
  const lines = Object.entries(traditions)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`);
  if (lines.length === 0) {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE };
  }

  const res = await llmComplete({
    messages: [
      {
        role: "system",
        content:
          '根据各体系摘要写共同主题与分歧。返回 JSON：{"consensus":"","divergence":""}，各 80 字以内，中文。',
      },
      { role: "user", content: lines.join("\n") },
    ],
    responseFormat: "json",
    maxTokens: 300,
  });

  if (res.degraded || !res.content) {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE };
  }

  try {
    const parsed = JSON.parse(res.content) as { consensus?: string; divergence?: string };
    return {
      consensus:
        typeof parsed.consensus === "string" ? parsed.consensus.slice(0, 160) : FALLBACK_CONSENSUS,
      divergence:
        typeof parsed.divergence === "string" ? parsed.divergence.slice(0, 160) : FALLBACK_DIVERGENCE,
    };
  } catch {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE };
  }
}

export async function generatePortraitLocal(profile: UserProfile): Promise<PortraitSummary> {
  const traditions = buildPortraitTraditions(profile);
  const { consensus, divergence } = await synthesizeLocal(traditions);
  return {
    traditions,
    consensus,
    divergence,
    generatedAt: new Date().toISOString(),
  };
}
