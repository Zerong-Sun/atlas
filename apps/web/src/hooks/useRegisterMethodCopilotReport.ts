import { useEffect } from "react";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import type { MethodCopilotReportSnapshot } from "@/lib/methodReportSnapshot";

export function useRegisterMethodCopilotReport(snapshot: MethodCopilotReportSnapshot | null) {
  const { setReport } = useMethodCopilot();

  useEffect(() => {
    setReport(snapshot);
    return () => setReport(null);
  }, [snapshot, setReport]);
}
