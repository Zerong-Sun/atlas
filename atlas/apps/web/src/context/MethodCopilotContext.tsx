import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { MethodCopilotReportSnapshot } from "@/lib/methodReportSnapshot";

export type { MethodCopilotReportSnapshot };

const COPILOT_WIDTH_KEY = "atlas-copilot-width";
export const COPILOT_WIDTH_DEFAULT = 360;
export const COPILOT_WIDTH_MIN = 280;
export const COPILOT_WIDTH_MAX = 560;

function clampCopilotWidth(value: number): number {
  return Math.min(COPILOT_WIDTH_MAX, Math.max(COPILOT_WIDTH_MIN, value));
}

function readStoredCopilotWidth(): number {
  try {
    const stored = localStorage.getItem(COPILOT_WIDTH_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) return clampCopilotWidth(parsed);
    }
  } catch {
    /* ignore */
  }
  return COPILOT_WIDTH_DEFAULT;
}

type MethodCopilotContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  width: number;
  setWidth: (width: number | ((prev: number) => number)) => void;
  report: MethodCopilotReportSnapshot | null;
  setReport: (report: MethodCopilotReportSnapshot | null) => void;
  openCopilot: (action?: "analyze") => void;
  pendingAction: "analyze" | null;
  clearPendingAction: () => void;
};

const MethodCopilotContext = createContext<MethodCopilotContextValue | null>(null);

export function MethodCopilotProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [width, setWidthState] = useState(readStoredCopilotWidth);
  const [report, setReport] = useState<MethodCopilotReportSnapshot | null>(null);
  const [pendingAction, setPendingAction] = useState<"analyze" | null>(null);

  const setWidth = useCallback((next: number | ((prev: number) => number)) => {
    setWidthState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      const clamped = clampCopilotWidth(value);
      try {
        localStorage.setItem(COPILOT_WIDTH_KEY, String(clamped));
      } catch {
        /* ignore */
      }
      return clamped;
    });
  }, []);

  const openCopilot = useCallback((action?: "analyze") => {
    setOpen(true);
    if (action === "analyze") {
      setPendingAction("analyze");
    }
  }, []);

  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  return (
    <MethodCopilotContext.Provider
      value={{
        open,
        setOpen,
        width,
        setWidth,
        report,
        setReport,
        openCopilot,
        pendingAction,
        clearPendingAction,
      }}
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
