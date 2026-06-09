import { DIVINATION_METHODS } from "./divinationMethods.ts";

export {
  DIVINATION_METHODS,
  PREVIEW_WORKBENCH_IDS,
  getMethod,
  isPreviewWorkbench,
  type DivinationMethod,
  type MethodStatus,
  type PreviewWorkbenchId,
} from "./divinationMethods.ts";
export {
  METHOD_EXPERIENCES,
  getMethodExperience,
  methodExperienceStyle,
  type MethodExperience,
  type MethodMotion,
} from "./methodExperiences.ts";
export { LOT_SIGNS, LOT_TEMPLE_LABELS, type LotSign } from "./lotSignsLibrary.ts";

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
] as const;

export function getReadyMethods() {
  return DIVINATION_METHODS.filter((m) => m.status === "ready" && m.id !== "dream");
}
