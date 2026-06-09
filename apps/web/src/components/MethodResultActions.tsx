import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { ShareReportButton } from "@/components/ShareReportButton";

type Props = {
  variant?: "open" | "analyze";
  label?: string;
  showShare?: boolean;
  className?: string;
};

export function MethodResultActions({
  variant = "analyze",
  label,
  showShare = true,
  className = "",
}: Props) {
  return (
    <div className={`method-result-actions${className ? ` ${className}` : ""}`}>
      {showShare && <ShareReportButton />}
      <MethodCopilotTrigger variant={variant} label={label} />
    </div>
  );
}
