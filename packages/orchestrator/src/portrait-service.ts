import {
  castIChing,
  computeBazi,
  computeWestern,
  drawTarotSpread,
  type EngineInput,
} from "@atlas/engines";
type WesternEngineResult = {
  planets: { Sun?: { sign?: string }; Moon?: { sign?: string } };
  ascendant?: { sign?: string };
  summary: string;
};
import type { PortraitSummary, Tradition, UserProfile } from "@atlas/shared-types";
import { MimoGateway } from "./mimo-gateway.ts";

const TRADITION_ORDER: Tradition[] = ["bazi", "western", "tarot", "iching"];

function portraitSeed(profile: UserProfile): string {
  return `${profile.userId}:${profile.birthDate ?? "unknown"}:${profile.birthTime ?? "12:00"}`;
}

function engineInputFromProfile(profile: UserProfile): EngineInput {
  return {
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthLat: profile.birthLat,
    birthLng: profile.birthLng,
    timezone: profile.timezone,
    gender: profile.gender,
    seed: portraitSeed(profile),
  };
}

function appendUniqueClause(base: string, extra?: string): string {
  const clause = extra?.trim();
  if (!clause || base.includes(clause)) return base;
  return `${base}。${clause}`;
}

function summarizeBazi(profile: UserProfile): string | undefined {
  if (!profile.birthDate) return undefined;
  const chart = computeBazi(engineInputFromProfile(profile));
  if (chart.error || !chart.dayMaster) return undefined;
  const strength = chart.strength?.level ?? "中和";
  const pattern = chart.pattern?.name ? `，格局偏${chart.pattern.name}` : "";
  const base = `日主${chart.dayMaster}（${chart.dayMasterElement}），${strength}${pattern}`;
  const trait =
    chart.personality?.traits?.[0] ??
    chart.personality?.strengths?.[0] ??
    chart.personality?.advice;
  return appendUniqueClause(base, trait).slice(0, 120);
}

function summarizeWestern(profile: UserProfile): string | undefined {
  if (!profile.birthDate) return undefined;
  const raw = computeWestern(engineInputFromProfile(profile));
  if ("error" in raw) return undefined;
  const result = raw as WesternEngineResult;
  return result.summary.slice(0, 120);
}

function summarizeIching(profile: UserProfile): string | undefined {
  const hex = castIChing(portraitSeed(profile)) as {
    summary: string;
    primary: { judgment: string };
  };
  return `${hex.summary}。${hex.primary.judgment}`.slice(0, 120);
}

function summarizeTarot(profile: UserProfile): string | undefined {
  const spread = drawTarotSpread({
    seed: portraitSeed(profile),
    spreadId: "one-card",
  });
  const card = spread.cards[0];
  if (!card) return undefined;
  const name = card.reversed ? `${card.name}（逆位）` : card.name;
  const meaning = card.reversed ? card.reversedMeaning : card.upright;
  return `象征牌「${name}」：${meaning || card.keywords?.join("、") || "开启新议题"}`.slice(0, 120);
}

export function buildPortraitTraditions(profile: UserProfile): PortraitSummary["traditions"] {
  const traditions: PortraitSummary["traditions"] = {};
  const bazi = summarizeBazi(profile);
  const western = summarizeWestern(profile);
  const tarot = summarizeTarot(profile);
  const iching = summarizeIching(profile);
  if (bazi) traditions.bazi = bazi;
  if (western) traditions.western = western;
  if (tarot) traditions.tarot = tarot;
  if (iching) traditions.iching = iching;
  return traditions;
}

const FALLBACK_CONSENSUS =
  "多数体系都指向：先厘清内在节奏，再在现实选择上留有余地；不宜把单一符号当作定论。";
const FALLBACK_DIVERGENCE =
  "八字与占星偏长期结构与周期，塔罗与卦象更偏当下象征与行动提示；阅读时宜对照而非合并。";

async function synthesizeWithLlm(
  traditions: PortraitSummary["traditions"],
  mimo: MimoGateway
): Promise<{ consensus: string; divergence: string; degraded: boolean }> {
  const lines = TRADITION_ORDER.filter((t) => traditions[t]).map((t) => `${t}: ${traditions[t]}`);
  if (lines.length === 0) {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE, degraded: true };
  }

  if (!mimo.isConfigured()) {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE, degraded: true };
  }

  const res = await mimo.complete({
    messages: [
      {
        role: "system",
        content: `你是跨文化命理对照编辑。根据各体系一句话摘要，写出共同主题与明显分歧。中文，克制，不做绝对预言。返回 JSON：{"consensus":"","divergence":""}，各 80 字以内。`,
      },
      { role: "user", content: lines.join("\n") },
    ],
    responseFormat: "json",
    maxTokens: 300,
  });

  if (res.degraded || !res.content) {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE, degraded: true };
  }

  try {
    const parsed = JSON.parse(res.content) as { consensus?: string; divergence?: string };
    return {
      consensus: typeof parsed.consensus === "string" ? parsed.consensus.slice(0, 160) : FALLBACK_CONSENSUS,
      divergence: typeof parsed.divergence === "string" ? parsed.divergence.slice(0, 160) : FALLBACK_DIVERGENCE,
      degraded: false,
    };
  } catch {
    return { consensus: FALLBACK_CONSENSUS, divergence: FALLBACK_DIVERGENCE, degraded: true };
  }
}

export class PortraitService {
  constructor(private readonly mimo: MimoGateway = new MimoGateway()) {}

  async generate(profile: UserProfile): Promise<PortraitSummary> {
    const traditions = buildPortraitTraditions(profile);
    const { consensus, divergence } = await synthesizeWithLlm(traditions, this.mimo);
    return {
      traditions,
      consensus,
      divergence,
      generatedAt: new Date().toISOString(),
    };
  }
}
