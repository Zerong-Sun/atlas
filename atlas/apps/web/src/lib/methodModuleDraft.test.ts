import { describe, expect, it } from "vitest";
import { getMethodModuleKit } from "@/data/methodModuleKits";
import { getMethodModule } from "@/data/methodModules";
import { getMethodOperationLibrary } from "@/data/methodOperationLibraries";
import { buildDraft, hashText, pickSymbols } from "./methodModuleDraft";
import { isPreviewWorkbenchReady } from "./previewWorkbenchGate";

describe("hashText", () => {
  it("is deterministic for the same input", () => {
    expect(hashText("iching:test")).toBe(hashText("iching:test"));
  });

  it("differs for different inputs", () => {
    expect(hashText("a")).not.toBe(hashText("b"));
  });
});

describe("pickSymbols", () => {
  const bank = [
    { name: "甲", type: "t", meaning: "m1", predictionUse: "u1" },
    { name: "乙", type: "t", meaning: "m2", predictionUse: "u2" },
    { name: "丙", type: "t", meaning: "m3", predictionUse: "u3" },
    { name: "丁", type: "t", meaning: "m4", predictionUse: "u4" },
  ];

  it("returns deterministic symbols for a fixed seed", () => {
    const first = pickSymbols(bank, "seed:fixed", 3);
    const second = pickSymbols(bank, "seed:fixed", 3);
    expect(first.map((s) => s.name)).toEqual(second.map((s) => s.name));
  });
});

describe("iching workbench gate", () => {
  it("includes iching workbench data", () => {
    expect(isPreviewWorkbenchReady("iching")).toBe(true);
  });
});

describe("buildDraft for iching workbench", () => {
  it("builds a draft for iching", () => {
    const id = "iching";
    const module = getMethodModule(id)!;
    const kit = getMethodModuleKit(id)!;
    const operationLibrary = getMethodOperationLibrary(id)!;
    const mode = operationLibrary.modes[0];

    const draft = buildDraft(
      module,
      kit,
      operationLibrary,
      "测试事项",
      operationLibrary.subjectTypes[0],
      operationLibrary.predictionWindows[0],
      mode,
    );

    expect(draft.selectedSymbols).toHaveLength(3);
    expect(draft.sections).toHaveLength(operationLibrary.outputSections.length);
    expect(draft.axes).toHaveLength(operationLibrary.predictionAxes.length);
    expect(draft.advice).toEqual(operationLibrary.guardrails);
  });
});
