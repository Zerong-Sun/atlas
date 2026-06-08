import { useLocation } from "react-router-dom";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";
import { methodIdFromPathname } from "@/lib/methodFromRoute";

type Props = {
  variant?: "open" | "analyze";
  label?: string;
  className?: string;
};

export function MethodCopilotTrigger({ variant = "analyze", label, className = "" }: Props) {
  const { pathname } = useLocation();
  const { openCopilot } = useMethodCopilot();
  const methodId = methodIdFromPathname(pathname) ?? "methods";
  const experience = getMethodExperience(methodId);
  const text = label ?? (variant === "analyze" ? "AI 解析报告" : "打开解说");

  return (
    <button
      type="button"
      className={`method-copilot-trigger${className ? ` ${className}` : ""}`}
      style={methodExperienceStyle(experience)}
      onClick={() => openCopilot(variant === "analyze" ? "analyze" : undefined)}
    >
      <span aria-hidden>{experience.glyph}</span>
      {text}
    </button>
  );
}
