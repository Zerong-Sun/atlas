import type { ComponentType } from "react";
import { AstrodiceScreen } from "./AstrodiceScreen";
import { BaziRelationshipScreen } from "./BaziRelationshipScreen";
import { BaziScreen } from "./BaziScreen";
import { FengshuiScreen } from "./FengshuiScreen";
import { IchingScreen } from "./IchingScreen";
import { JiaobeiScreen } from "./JiaobeiScreen";
import { LenormandScreen } from "./LenormandScreen";
import { LiuyaoScreen } from "./LiuyaoScreen";
import { LotScreen } from "./LotScreen";
import { QimenScreen } from "./QimenScreen";
import { RunesScreen } from "./RunesScreen";
import { TarotScreen } from "./TarotScreen";
import { WesternScreen } from "./WesternScreen";
import { ZiweiScreen } from "./ZiweiScreen";

export const METHOD_SCREENS: Record<string, ComponentType> = {
  lot: LotScreen,
  jiaobei: JiaobeiScreen,
  astrodice: AstrodiceScreen,
  runes: RunesScreen,
  iching: IchingScreen,
  liuyao: LiuyaoScreen,
  bazi: BaziScreen,
  "bazi-relationship": BaziRelationshipScreen,
  fengshui: FengshuiScreen,
  tarot: TarotScreen,
  lenormand: LenormandScreen,
  western: WesternScreen,
  ziwei: ZiweiScreen,
  qimen: QimenScreen,
};

export {
  AstrodiceScreen,
  BaziRelationshipScreen,
  BaziScreen,
  FengshuiScreen,
  IchingScreen,
  JiaobeiScreen,
  LenormandScreen,
  LiuyaoScreen,
  LotScreen,
  QimenScreen,
  RunesScreen,
  TarotScreen,
  WesternScreen,
  ZiweiScreen,
};
