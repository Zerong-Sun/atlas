import type { DeepLibraryRaw } from "./types";
import { ASTRODICE_DEEP } from "./astrodice";
import { COFFEE_DEEP } from "./coffee";
import { FENGSHUI_DEEP } from "./fengshui";
import { GEOMANCY_DEEP } from "./geomancy";
import { JIAOBEI_DEEP } from "./jiaobei";
import { LIUYAO_DEEP } from "./liuyao";
import { LENORMAND_DEEP } from "./lenormand";
import { LOT_DEEP } from "./lot";
import { MEIHUA_DEEP } from "./meihua";
import { NUMEROLOGY_DEEP } from "./numerology";
import { ORACLE_DEEP } from "./oracle";
import { PALMISTRY_DEEP } from "./palmistry";
import { RUNES_DEEP } from "./runes";
import { SCRYING_DEEP } from "./scrying";
import { VEDIC_DEEP } from "./vedic";
import { WESTERN_DEEP } from "./western";
import { XIANGMIAN_DEEP } from "./xiangmian";
import { ZIWEI_DEEP } from "./ziwei";

export const DEEP_LIBRARY_ENTRIES: Array<{ id: string; raw: DeepLibraryRaw }> = [
  { id: "ziwei", raw: ZIWEI_DEEP },
  { id: "liuyao", raw: LIUYAO_DEEP },
  { id: "meihua", raw: MEIHUA_DEEP },
  { id: "western", raw: WESTERN_DEEP },
  { id: "vedic", raw: VEDIC_DEEP },
  { id: "numerology", raw: NUMEROLOGY_DEEP },
  { id: "runes", raw: RUNES_DEEP },
  { id: "geomancy", raw: GEOMANCY_DEEP },
  { id: "lot", raw: LOT_DEEP },
  { id: "jiaobei", raw: JIAOBEI_DEEP },
  { id: "xiangmian", raw: XIANGMIAN_DEEP },
  { id: "palmistry", raw: PALMISTRY_DEEP },
  { id: "fengshui", raw: FENGSHUI_DEEP },
  { id: "astrodice", raw: ASTRODICE_DEEP },
  { id: "lenormand", raw: LENORMAND_DEEP },
  { id: "oracle", raw: ORACLE_DEEP },
  { id: "coffee", raw: COFFEE_DEEP },
  { id: "scrying", raw: SCRYING_DEEP },
];
