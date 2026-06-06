import { DEEP_LIBRARY_ENTRIES } from "./deepLibraries";
import type { DeepLibraryRaw } from "./deepLibraries/types";

export type DeepSymbol = { name: string; group: string; meaning: string; use: string };
export type MethodDeepLibrary = {
  id: string;
  title: string;
  categories: string[];
  symbols: DeepSymbol[];
  rules: string[];
  modes: string[];
  predictionAxes: string[];
  outputs: string[];
  guardrails: string[];
};

const BASE_GUARDS = ["趋势表达，不作绝对预言", "重大事项需结合现实专业意见", "同一问题避免短期反复强算", "输出必须给出条件、风险和复盘点"];

function splitPipe(value: string) {
  return value.split("|").filter(Boolean);
}

function parseSymbols(sym: string): DeepSymbol[] {
  return sym
    .split(";")
    .filter(Boolean)
    .map((item) => {
      const [name, group, meaning, use] = item.split("/");
      return { name, group, meaning, use };
    });
}

export function rawToMethodDeepLibrary(raw: DeepLibraryRaw, id: string): MethodDeepLibrary {
  return {
    id,
    title: raw.title,
    categories: splitPipe(raw.cat),
    symbols: parseSymbols(raw.sym),
    rules: splitPipe(raw.rules),
    modes: splitPipe(raw.modes),
    predictionAxes: splitPipe(raw.axes),
    outputs: splitPipe(raw.out),
    guardrails: BASE_GUARDS,
  };
}

export const METHOD_DEEP_LIBRARIES: MethodDeepLibrary[] = DEEP_LIBRARY_ENTRIES.map(({ id, raw }) =>
  rawToMethodDeepLibrary(raw, id)
);

export function getMethodDeepLibrary(id: string | undefined) {
  return METHOD_DEEP_LIBRARIES.find((library) => library.id === id);
}
