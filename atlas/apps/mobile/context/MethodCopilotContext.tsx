import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { MethodCopilotReportSnapshot } from "@atlas/method-core";

export type { MethodCopilotReportSnapshot };

type MethodCopilotContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  report: MethodCopilotReportSnapshot | null;
  setReport: (report: MethodCopilotReportSnapshot | null) => void;
  openCopilot: (action?: "analyze") => void;
  pendingAction: "analyze" | null;
  clearPendingAction: () => void;
};

const MethodCopilotContext = createContext<MethodCopilotContextValue | null>(null);

export function MethodCopilotProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<MethodCopilotReportSnapshot | null>(null);
  const [pendingAction, setPendingAction] = useState<"analyze" | null>(null);

  const openCopilot = useCallback((action?: "analyze") => {
    setOpen(true);
    if (action === "analyze") setPendingAction("analyze");
  }, []);

  const clearPendingAction = useCallback(() => setPendingAction(null), []);

  return (
    <MethodCopilotContext.Provider
      value={{ open, setOpen, report, setReport, openCopilot, pendingAction, clearPendingAction }}
    >
      {children}
    </MethodCopilotContext.Provider>
  );
}

export function useMethodCopilot() {
  const ctx = useContext(MethodCopilotContext);
  if (!ctx) throw new Error("useMethodCopilot must be used within MethodCopilotProvider");
  return ctx;
}
