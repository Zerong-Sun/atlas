import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { formatReportForShare, type MethodCopilotTurn, type ShareReportResult } from "@atlas/method-core";
import type { MethodCopilotReportSnapshot } from "@atlas/method-core";

export { formatReportForShare, type ShareReportResult, type MethodCopilotTurn };

export async function shareReportText(title: string, text: string): Promise<ShareReportResult> {
  try {
    const result = await Share.share({ title, message: text });
    if (result.action === Share.dismissedAction) return "cancelled";
    return "shared";
  } catch {
    try {
      await Clipboard.setStringAsync(text);
      return "copied";
    } catch {
      return "failed";
    }
  }
}

export async function shareReport(
  report: MethodCopilotReportSnapshot,
  options?: { interpretation?: MethodCopilotTurn[] },
): Promise<ShareReportResult> {
  const text = formatReportForShare(report, options);
  return shareReportText(report.title, text);
}
