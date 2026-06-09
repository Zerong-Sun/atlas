import type { MethodCopilotReportSnapshot } from "./methodReportSnapshot.ts";

export type MethodCopilotTurn = {
  role: "user" | "assistant";
  content: string;
  diagram?: string;
  relatedTerms?: string[];
  sections?: Array<{ title: string; content: string }>;
  highlights?: string[];
  degraded?: boolean;
};

export type ShareReportResult = "shared" | "copied" | "cancelled" | "failed";

function formatTurn(turn: MethodCopilotTurn): string {
  if (turn.role === "user") return `问：${turn.content}`;
  if (turn.sections?.length) {
    return turn.sections.map((section) => `【${section.title}】\n${section.content}`).join("\n\n");
  }
  const parts = [turn.content];
  if (turn.diagram) parts.push(turn.diagram);
  return parts.filter(Boolean).join("\n\n");
}

export function formatReportForShare(
  report: MethodCopilotReportSnapshot,
  options?: { interpretation?: MethodCopilotTurn[]; pageUrl?: string },
): string {
  const parts = [report.title];
  if (report.summary?.trim()) parts.push(report.summary.trim());
  parts.push("", report.body);
  if (options?.interpretation?.length) {
    parts.push("", "—— AI 解读 ——");
    for (const turn of options.interpretation) {
      parts.push(formatTurn(turn));
    }
  }
  if (options?.pageUrl) parts.push("", `报告链接：${options.pageUrl}`);
  parts.push("", "—— 诸象 Atlas ——");
  return parts.join("\n");
}

export async function shareReportText(title: string, text: string): Promise<ShareReportResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (err) {
      if ((err as Error).name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
