import type { QuestionInput } from "@atlas/shared-types";

const SENSITIVE_PATTERNS = [
  /自杀|自残|轻生/,
  /癌症|肿瘤|确诊|手术/,
  /离婚诉讼|官司|坐牢/,
  /股票|期货|杠杆|爆仓/,
];

const DISCLAIMER =
  "本解读仅供文化反思与自我探索，不构成医疗、法律、投资或心理治疗建议。如有健康或安全风险，请寻求专业人士帮助。";

export interface SafetyResult {
  blocked: boolean;
  requiresDisclaimer: boolean;
  disclaimer: string;
  reason?: string;
}

export class SafetyPolicy {
  evaluate(question: QuestionInput): SafetyResult {
    const text = question.text;
    for (const pattern of SENSITIVE_PATTERNS) {
      if (pattern.test(text)) {
        return {
          blocked: false,
          requiresDisclaimer: true,
          disclaimer: DISCLAIMER,
          reason: "sensitive_topic",
        };
      }
    }
    if (question.category === "health" || question.category === "finance") {
      return {
        blocked: false,
        requiresDisclaimer: true,
        disclaimer: DISCLAIMER,
        reason: question.category,
      };
    }
    return { blocked: false, requiresDisclaimer: false, disclaimer: "" };
  }
}
