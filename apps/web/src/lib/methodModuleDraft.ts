import type { MethodModuleKit } from "@/data/methodModuleKits";
import type { MethodModule } from "@/data/methodModules";
import type {
  MethodOperationLibrary,
  OperationMode,
  OperationSymbol,
} from "@/data/methodOperationLibraries";

export type ModuleDraftReading = {
  context: string;
  subjectType: string;
  predictionWindow: string;
  mode: OperationMode;
  pattern: string;
  selectedSymbols: OperationSymbol[];
  sections: Array<{ title: string; body: string }>;
  axes: Array<{ axis: string; reading: string }>;
  advice: string[];
};

export function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function pickSymbols(entries: OperationSymbol[], seed: string, count: number) {
  const scored = entries.map((entry, index) => ({
    entry,
    score: hashText(`${seed}:${entry.name}:${index}`),
  }));
  return scored
    .sort((left, right) => left.score - right.score)
    .slice(0, count)
    .map((item) => item.entry);
}

export function buildDraft(
  module: MethodModule,
  kit: MethodModuleKit,
  operationLibrary: MethodOperationLibrary,
  context: string,
  subjectType: string,
  predictionWindow: string,
  mode: OperationMode,
): ModuleDraftReading {
  const cleanContext = context.trim() || `${subjectType} / ${predictionWindow} / ${mode.label}`;
  const selectedSymbols = pickSymbols(
    operationLibrary.symbolBank,
    `${module.id}:${cleanContext}:${subjectType}:${predictionWindow}:${mode.id}`,
    3,
  );

  return {
    context: cleanContext,
    subjectType,
    predictionWindow,
    mode,
    pattern: kit.samplePattern,
    selectedSymbols,
    advice: operationLibrary.guardrails,
    axes: operationLibrary.predictionAxes.map((axis, index) => {
      const symbol = selectedSymbols[index % selectedSymbols.length];
      return {
        axis,
        reading: `${symbol.name} 指向「${symbol.predictionUse}」。在 ${predictionWindow} 内，先按「${subjectType}」校验现实条件，再决定推进、等待或换路径。`,
      };
    }),
    sections: operationLibrary.outputSections.map((section, index) => {
      const symbol = selectedSymbols[index % selectedSymbols.length];
      return {
        title: section,
        body: `以「${symbol.name}」为主象，按「${mode.label}」处理「${subjectType}」：${symbol.meaning} ${kit.samplePattern}`,
      };
    }),
  };
}
