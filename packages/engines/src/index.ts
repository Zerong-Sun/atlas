import type { StructuredFacts, Tradition } from "@atlas/shared-types";
import { computeBazi, type BaziResult } from "./bazi.ts";
import {
  computeBaziCompatibility,
  type BaziCompatibilityInput,
  type BaziCompatibilityResult,
  type RelationshipContext,
} from "./bazi-compatibility.ts";
import { computeWestern, type WesternResult } from "./western.ts";
import { drawTarotSpread, type TarotSpreadResult, type DrawnTarotCardResult } from "./tarot.ts";
import { interpretTarot } from "./tarot-interpret.ts";
import { toInterpretTarotCards } from "./tarot-adapters.ts";
import { castIChing } from "./iching.ts";
import { computeQimen, type QimenResult, type QimenPalace } from "./qimen.ts";
import { interpretQimen } from "./qimen-interpret.ts";
import { interpretBazi } from "./bazi-interpret.ts";
import { drawLenormand, type LenormandResult } from "./lenormand.ts";
import { drawLot, type LotResult } from "./lot.ts";
import { castLiuyao, type LiuyaoResult } from "./liuyao.ts";
import { computeFengshui, type FengshuiResult } from "./fengshui.ts";
import { computeZiwei, type ZiweiResult } from "./ziwei.ts";

export {
  computeBazi,
  computeBaziCompatibility,
  computeWestern,
  drawTarotSpread,
  castIChing,
  computeQimen,
  interpretQimen,
  interpretBazi,
  interpretTarot,
  drawLenormand,
  drawLot,
  castLiuyao,
  computeFengshui,
  computeZiwei,
  type BaziResult,
  type BaziCompatibilityResult,
  type RelationshipContext,
  type BaziCompatibilityInput,
  type QimenResult,
  type QimenPalace,
  type WesternResult,
  type LenormandResult,
  type LotResult,
  type LiuyaoResult,
  type FengshuiResult,
  type ZiweiResult,
  type TarotSpreadResult,
  type DrawnTarotCardResult,
};
export { toInterpretTarotCards } from "./tarot-adapters.ts";
export { normalizeTarotCardName, tarotNamesMatch, TAROT_NAME_ALIASES } from "./tarot-names.ts";
export { TAROT_DECK, TAROT_SPREADS, TAROT_PAIR_RULES, buildTarotCombination } from "./tarot.ts";
export { matchRules, type RuleWithPredicate, type RulePredicate } from "./rule-match.ts";
export { BAZI_CLASSICS_LIBRARY, selectBaziClassics, type BaziClassicEntry } from "./bazi-classics.ts";
export { LENORMAND_CARDS } from "./lenormand.ts";
export { registerLotSigns, getLotSigns, type LotSign } from "./lot.ts";
export { MOUNTAINS_24, FLYING_STARS } from "./fengshui.ts";

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
  juMethod?: "chaibu" | "zhirun";
  spreadId?: string;
  tarotScenario?: "关系" | "事业" | "财务" | "心理" | "通用";
  qimenQuestionType?: string;
  predictionWindow?: "时" | "日" | "旬" | "月";
}

export function runEngine(
  tradition: Tradition,
  input: EngineInput
): StructuredFacts {
  const computedAt = new Date().toISOString();
  switch (tradition) {
    case "bazi": {
      const chart = computeBazi(input);
      const interpretation = chart.error ? null : interpretBazi(chart);
      return { tradition, computedAt, facts: { ...chart, interpretation } as unknown as Record<string, unknown> };
    }
    case "western":
      return { tradition, computedAt, facts: computeWestern(input) as Record<string, unknown> };
    case "tarot": {
      const spread = drawTarotSpread({ seed: input.seed ?? computedAt, spreadId: input.spreadId ?? "three-timeline" });
      const interpretation = interpretTarot(toInterpretTarotCards(spread.cards), {
        question: input.question,
        scenario: input.tarotScenario,
      });
      return { tradition, computedAt, facts: { ...spread, interpretation } as Record<string, unknown> };
    }
    case "iching":
      return { tradition, computedAt, facts: castIChing(input.seed ?? computedAt) };
    case "qimen": {
      const chart = computeQimen({ ...input, juMethod: input.juMethod ?? "chaibu" });
      const interpretation = interpretQimen(chart, {
        questionType: input.qimenQuestionType,
        predictionWindow: input.predictionWindow,
      });
      return { tradition, computedAt, facts: { ...chart, interpretation } as unknown as Record<string, unknown> };
    }
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
