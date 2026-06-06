import type { MethodReferenceLibrary } from "./types";
import { ASTRODICE_REFERENCE } from "./astrodice";
import { COFFEE_REFERENCE } from "./coffee";
import { FENGSHUI_REFERENCE } from "./fengshui";
import { GEOMANCY_REFERENCE } from "./geomancy";
import { JIAOBEI_REFERENCE } from "./jiaobei";
import { LIUYAO_REFERENCE } from "./liuyao";
import { LENORMAND_REFERENCE } from "./lenormand";
import { LOT_REFERENCE } from "./lot";
import { MEIHUA_REFERENCE } from "./meihua";
import { NUMEROLOGY_REFERENCE } from "./numerology";
import { ORACLE_REFERENCE } from "./oracle";
import { PALMISTRY_REFERENCE } from "./palmistry";
import { RUNES_REFERENCE } from "./runes";
import { SCRYING_REFERENCE } from "./scrying";
import { VEDIC_REFERENCE } from "./vedic";
import { WESTERN_REFERENCE } from "./western";
import { XIANGMIAN_REFERENCE } from "./xiangmian";
import { ZIWEI_REFERENCE } from "./ziwei";

export const METHOD_REFERENCE_LIBRARIES: MethodReferenceLibrary[] = [
  ZIWEI_REFERENCE,
  LIUYAO_REFERENCE,
  MEIHUA_REFERENCE,
  WESTERN_REFERENCE,
  VEDIC_REFERENCE,
  NUMEROLOGY_REFERENCE,
  RUNES_REFERENCE,
  GEOMANCY_REFERENCE,
  LOT_REFERENCE,
  JIAOBEI_REFERENCE,
  XIANGMIAN_REFERENCE,
  PALMISTRY_REFERENCE,
  FENGSHUI_REFERENCE,
  ASTRODICE_REFERENCE,
  LENORMAND_REFERENCE,
  ORACLE_REFERENCE,
  COFFEE_REFERENCE,
  SCRYING_REFERENCE,
];

export function getMethodReferenceLibrary(id: string | undefined) {
  return METHOD_REFERENCE_LIBRARIES.find((library) => library.id === id);
}
