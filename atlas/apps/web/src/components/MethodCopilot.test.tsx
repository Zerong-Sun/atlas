// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MethodCopilot } from "./MethodCopilot";
import { MethodCopilotProvider, useMethodCopilot } from "@/context/MethodCopilotContext";
import { askMethodCopilot, askMethodCopilotAnalysis, type MethodCopilotReply } from "@/lib/api/methodCopilot";
import { getArchiveEntry, saveArchiveInterpretation } from "@/lib/archive";
vi.mock("@/lib/api/methodCopilot", () => ({ askMethodCopilot: vi.fn(), askMethodCopilotAnalysis: vi.fn(), isAnalysisQuestion: () => false }));
vi.mock("@/lib/archive", () => ({ getArchiveEntry: vi.fn(), saveArchiveInterpretation: vi.fn(), resolveArchiveEntryId: (s: { entryId: string }) => s.entryId }));
let root: Root; let host: HTMLDivElement; let navigate: NavigateFunction;
let context: ReturnType<typeof useMethodCopilot>;
let resolveReply: (value: MethodCopilotReply) => void;
function Probe() {
  navigate = useNavigate(); context = useMethodCopilot();
  return <button className="method-copilot-topbar-btn" onClick={() => context.openCopilot()}>打开</button>;
}
const snapshot = (id: string) => ({ entryId: id, source: "method" as const, methodId: "tarot", title: id, body: "report" });
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true); localStorage.clear(); vi.clearAllMocks();
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  HTMLElement.prototype.scrollTo = vi.fn();
  const pending = new Promise<MethodCopilotReply>((resolve) => { resolveReply = resolve; });
  vi.mocked(askMethodCopilot).mockReturnValue(pending); vi.mocked(askMethodCopilotAnalysis).mockReturnValue(pending);
  vi.mocked(getArchiveEntry).mockReturnValue(null);
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
  await act(async () => root.render(<MemoryRouter initialEntries={["/methods/tarot"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><MethodCopilotProvider><Probe /><MethodCopilot /></MethodCopilotProvider></MemoryRouter>));
  await act(async () => context.setReport(snapshot("old")));
  const trigger = host.querySelector<HTMLButtonElement>(".method-copilot-topbar-btn")!; trigger.focus();
  await act(async () => trigger.click());
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); vi.unstubAllGlobals(); });
it.each(["route", "report"])("drops a late answer after changing %s and never persists it to another archive", async (change) => {
  const prompt = host.querySelector<HTMLButtonElement>(".method-copilot__prompts button")!;
  await act(async () => { prompt.click(); prompt.click(); });
  expect(askMethodCopilot).toHaveBeenCalledTimes(1);
  expect(saveArchiveInterpretation).toHaveBeenCalledTimes(1);
  await act(async () => {
    if (change === "route") navigate("/methods/lenormand");
    context.setReport(snapshot("new"));
  });
  await act(async () => resolveReply({ answer: "过期解说不得显示", diagram: "", relatedTerms: [] }));
  expect(host.textContent).not.toContain("过期解说不得显示"); expect(saveArchiveInterpretation).toHaveBeenCalledTimes(1);
  expect(host.querySelector<HTMLButtonElement>(".method-copilot__prompts button")!.disabled).toBe(false);
});
it("focuses the open sidebar and restores its trigger with Escape", async () => {
  expect(document.activeElement?.getAttribute("aria-label")).toBe("收起解说侧栏");
  await act(async () => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  expect(host.querySelector("aside")?.hidden).toBe(true);
  expect(document.activeElement?.className).toBe("method-copilot-topbar-btn");
});
