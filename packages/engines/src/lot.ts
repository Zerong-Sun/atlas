import type { LotInput, LotTemple } from "@atlas/shared-types";
import { createRng } from "./seed.js";

export type LotGrade = "上签" | "中签" | "下签";
export type LotCategory = "career" | "love" | "health" | "general";

export interface LotSign {
  id: string;
  temple: Exclude<LotTemple, "mixed">;
  number: number;
  grade: LotGrade;
  title: string;
  poem: string[];
  story?: string;
  categories: LotCategory[];
  plainReading: string;
  advice: string[];
  safetyNotes: string[];
  sourceReference: string;
}

/** Sign database — populated from lotSignsLibrary at runtime in web; engine ships core lookup */
let signRegistry: LotSign[] = [];

export function registerLotSigns(signs: LotSign[]): void {
  signRegistry = signs;
}

export function getLotSigns(temple?: LotTemple): LotSign[] {
  if (temple && temple !== "mixed") {
    return signRegistry.filter((s) => s.temple === temple);
  }
  return signRegistry;
}

export interface LotResult {
  sign: LotSign;
  temple: LotTemple;
  seed: string;
}

export function drawLot(input: LotInput = {}, signs?: LotSign[]): LotResult {
  const pool = signs ?? signRegistry;
  const temple = input.temple ?? "mixed";
  const filtered =
    temple === "mixed" ? pool : pool.filter((s) => s.temple === temple);
  if (filtered.length === 0) {
    throw new Error("No lot signs available for the requested temple");
  }
  const seed = input.seed ?? new Date().toISOString();
  const rng = createRng(seed);
  const sign = filtered[Math.floor(rng() * filtered.length)]!;
  return { sign, temple, seed };
}
