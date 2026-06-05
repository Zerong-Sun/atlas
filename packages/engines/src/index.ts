import type { StructuredFacts, Tradition } from "@atlas/shared-types";
import { computeBazi, type BaziResult } from "./bazi.js";
import { computeWestern, type WesternResult } from "./western.js";
import { drawTarotSpread } from "./tarot.js";
import { castIChing } from "./iching.js";
import { computeQimen, type QimenResult } from "./qimen.js";
import { drawLenormand, type LenormandResult } from "./lenormand.js";
import { drawLot, type LotResult } from "./lot.js";
import { castLiuyao, type LiuyaoResult } from "./liuyao.js";
import { computeFengshui, type FengshuiResult } from "./fengshui.js";
import { computeZiwei, type ZiweiResult } from "./ziwei.js";

export {
  computeBazi,
  computeWestern,
  drawTarotSpread,
  castIChing,
  computeQimen,
  drawLenormand,
  drawLot,
  castLiuyao,
  computeFengshui,
  computeZiwei,
  type BaziResult,
  type QimenResult,
  type WesternResult,
  type LenormandResult,
  type LotResult,
  type LiuyaoResult,
  type FengshuiResult,
  type ZiweiResult,
};
export { BAZI_CLASSICS_LIBRARY, selectBaziClassics, type BaziClassicEntry } from "./bazi-classics.js";
export { LENORMAND_CARDS } from "./lenormand.js";
export { registerLotSigns, getLotSigns, type LotSign } from "./lot.js";
export { MOUNTAINS_24, FLYING_STARS } from "./fengshui.js";

export interface EngineInput {
  birthDate?: string;
  birthTime?: string;
  birthLat?: number;
  birthLng?: number;
  timezone?: string;
  seed?: string;
  timestamp?: string;
  gender?: "male" | "female";
  sittingDegree?: number;
  sittingMountain?: string;
  birthYear?: number;
  lines?: number[];
  questionCategory?: "career" | "love" | "finance" | "health" | "general";
  spread?: "three" | "five" | "nine";
  temple?: "guanyin" | "guandi" | "mazu" | "mixed";
  question?: string;
}

export function runEngine(
  tradition: Tradition,
  input: EngineInput
): StructuredFacts {
  const computedAt = new Date().toISOString();
  switch (tradition) {
    case "bazi":
      return { tradition, computedAt, facts: computeBazi(input) as unknown as Record<string, unknown> };
    case "western":
      return { tradition, computedAt, facts: computeWestern(input) as Record<string, unknown> };
    case "tarot":
      return { tradition, computedAt, facts: drawTarotSpread(input.seed ?? computedAt) };
    case "iching":
      return { tradition, computedAt, facts: castIChing(input.seed ?? computedAt) };
    case "qimen":
      return { tradition, computedAt, facts: computeQimen(input) as unknown as Record<string, unknown> };
    default:
      throw new Error(`Unsupported tradition: ${tradition}`);
  }
}

export function runEngines(
  traditions: Tradition[],
  input: EngineInput
): StructuredFacts[] {
  return traditions
    .filter((t) => t !== "dream")
    .map((t) => runEngine(t, input));
}
