import { DIVINATION_METHODS } from "./divinationMethods.ts";

export {
  DIVINATION_METHODS,
  PREVIEW_WORKBENCH_IDS,
  getMethod,
  isPreviewWorkbench,
  type DivinationMethod,
  type CausalityModel,
  type EvidenceStyle,
  type MethodStatus,
  type PreviewWorkbenchId,
  type QuestionDomain,
  type UncertaintyMode,
} from "./divinationMethods.ts";
export {
  classifyQuestion,
  formatDecisionPressure,
  formatQuestionDomain,
  formatTimeHorizon,
  getMethodCulturalProfile,
  translateQuestionForMethod,
  translateQuestionForMethods,
} from "./questionFrames.ts";
export type {
  ComparativeMethodId,
  DecisionPressure,
  QuestionFrame,
  QuestionTranslation,
  Sensitivity,
  TimeHorizon,
} from "@atlas/shared-types";
export {
  METHOD_EXPERIENCES,
  getMethodExperience,
  methodExperienceStyle,
  type MethodExperience,
  type MethodMotion,
} from "./methodExperiences.ts";
export { LOT_SIGNS, LOT_TEMPLE_LABELS, type LotSign } from "./lotSignsLibrary.ts";
export {
  CULTURAL_LENS_OPTIONS,
  CULTURAL_METHOD_GROUPS,
  DEFAULT_CULTURAL_PROFILE,
  LOCALE_OPTIONS,
  METHOD_CULTURAL_ALIASES,
  TERMINOLOGY_OPTIONS,
  getLocalizedMethodName,
  type AtlasLocale,
  type CulturalLens,
  type CulturalProfile,
  type TerminologyMode,
} from "./culturalProfiles.ts";

export const READY_METHOD_IDS = [
  "bazi",
  "bazi-relationship",
  "tarot",
  "iching",
  "qimen",
  "ziwei",
  "liuyao",
  "western",
  "runes",
  "lot",
  "jiaobei",
  "fengshui",
  "astrodice",
  "lenormand",
  "meihua",
  "vedic",
  "numerology",
  "geomancy",
  "xiangmian",
  "palmistry",
  "oracle",
  "coffee",
  "scrying",
] as const;

export function getReadyMethods() {
  return DIVINATION_METHODS.filter((m) => m.status === "ready" && m.id !== "dream");
}
