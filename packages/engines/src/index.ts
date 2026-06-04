import type { StructuredFacts, Tradition } from "@atlas/shared-types";
import { computeBazi } from "./bazi.js";
import { computeWestern } from "./western.js";
import { drawTarotSpread } from "./tarot.js";
import { castIChing } from "./iching.js";

export { computeBazi, computeWestern, drawTarotSpread, castIChing };
export { BAZI_CLASSICS_LIBRARY, selectBaziClassics, type BaziClassicEntry } from "./bazi-classics.js";

export interface EngineInput {
  birthDate?: string;
  birthTime?: string;
  birthLat?: number;
  birthLng?: number;
  timezone?: string;
  seed?: string;
  timestamp?: string;
}

export function runEngine(
  tradition: Tradition,
  input: EngineInput
): StructuredFacts {
  const computedAt = new Date().toISOString();
  switch (tradition) {
    case "bazi":
      return { tradition, computedAt, facts: computeBazi(input) };
    case "western":
      return { tradition, computedAt, facts: computeWestern(input) };
    case "tarot":
      return { tradition, computedAt, facts: drawTarotSpread(input.seed ?? computedAt) };
    case "iching":
      return { tradition, computedAt, facts: castIChing(input.seed ?? computedAt) };
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
