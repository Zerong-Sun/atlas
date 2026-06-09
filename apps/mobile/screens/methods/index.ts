import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type MethodLoader = () => Promise<{ default: ComponentType }>;

const METHOD_SCREEN_LOADERS: Record<string, MethodLoader> = {
  lot: () => import("./LotScreen").then((m) => ({ default: m.LotScreen })),
  jiaobei: () => import("./JiaobeiScreen").then((m) => ({ default: m.JiaobeiScreen })),
  astrodice: () => import("./AstrodiceScreen").then((m) => ({ default: m.AstrodiceScreen })),
  runes: () => import("./RunesScreen").then((m) => ({ default: m.RunesScreen })),
  iching: () => import("./IchingScreen").then((m) => ({ default: m.IchingScreen })),
  liuyao: () => import("./LiuyaoScreen").then((m) => ({ default: m.LiuyaoScreen })),
  bazi: () => import("./BaziScreen").then((m) => ({ default: m.BaziScreen })),
  "bazi-relationship": () =>
    import("./BaziRelationshipScreen").then((m) => ({ default: m.BaziRelationshipScreen })),
  fengshui: () => import("./FengshuiScreen").then((m) => ({ default: m.FengshuiScreen })),
  tarot: () => import("./TarotScreen").then((m) => ({ default: m.TarotScreen })),
  lenormand: () => import("./LenormandScreen").then((m) => ({ default: m.LenormandScreen })),
  western: () => import("./WesternScreen").then((m) => ({ default: m.WesternScreen })),
  ziwei: () => import("./ZiweiScreen").then((m) => ({ default: m.ZiweiScreen })),
  qimen: () => import("./QimenScreen").then((m) => ({ default: m.QimenScreen })),
};

const lazyCache = new Map<string, LazyExoticComponent<ComponentType>>();

export function getLazyMethodScreen(methodId: string): LazyExoticComponent<ComponentType> | undefined {
  const loader = METHOD_SCREEN_LOADERS[methodId];
  if (!loader) return undefined;
  let cached = lazyCache.get(methodId);
  if (!cached) {
    cached = lazy(loader);
    lazyCache.set(methodId, cached);
  }
  return cached;
}

export function isKnownMethodScreen(methodId: string): boolean {
  return methodId in METHOD_SCREEN_LOADERS;
}
