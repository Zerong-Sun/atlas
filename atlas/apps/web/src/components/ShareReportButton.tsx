import { useCallback, useState } from "react";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { getArchiveEntry, resolveArchiveEntryId } from "@/lib/archive";
import { formatReportForShare, shareReportText } from "@/lib/shareReport";

type Props = {
  className?: string;
};

export function ShareReportButton({ className = "" }: Props) {
  const { report } = useMethodCopilot();
  const [status, setStatus] = useState("");

  const share = useCallback(async () => {
    if (!report) return;
    const entry = getArchiveEntry(resolveArchiveEntryId(report));
    const text = formatReportForShare(report, {
      interpretation: entry?.interpretation,
      pageUrl: window.location.href,
    });
    const result = await shareReportText(report.title, text);
    if (result === "cancelled") return;
    setStatus(result === "shared" ? "已分享" : result === "copied" ? "已复制" : "分享失败");
    window.setTimeout(() => setStatus(""), 1400);
  }, [report]);

  if (!report) return null;

  return (
    <>
      <button
        type="button"
        className={`share-report-button${className ? ` ${className}` : ""}`}
        onClick={() => void share()}
      >
        分享报告
      </button>
      {status && <span className="share-report-status">{status}</span>}
    </>
  );
}
