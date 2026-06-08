import { getMethodCopilotAnalysisSkill, getMethodCopilotConfig } from "@/data/methodCopilotPrompts";
import type { MethodCopilotReportSnapshot } from "@/lib/methodReportSnapshot";
import { isLlmConfigured } from "@/lib/llmSettings";
import { llmComplete, type LlmMessage } from "./llm";

export type MethodCopilotReply = {
  answer: string;
  diagram: string;
  relatedTerms: string[];
  degraded?: boolean;
  sections?: Array<{ title: string; content: string }>;
  highlights?: string[];
};

export type MethodCopilotTurn = {
  role: "user" | "assistant";
  content: string;
  diagram?: string;
  relatedTerms?: string[];
  sections?: Array<{ title: string; content: string }>;
  highlights?: string[];
  degraded?: boolean;
};

function sanitizeText(value: unknown, fallback: string, maxLen = 1200): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text.length > 0 ? text.slice(0, maxLen) : fallback;
}

function fallbackReply(methodId: string | null, question: string): MethodCopilotReply {
  const config = getMethodCopilotConfig(methodId);
  const answer = isLlmConfigured()
    ? `解说请求失败，暂时无法针对「${question.slice(0, 40)}」生成 ${config.title} 回复。请稍后重试，或在设置中重新测试 LLM 连接。`
    : `侧栏解说尚未配置：请打开设置，填写 API Key 后点击「测试连接」（会自动保存），占梦与解说才会生效。`;
  return {
    answer,
    diagram: "",
    relatedTerms: config.quickPrompts.slice(0, 2),
    degraded: true,
  };
}

function parseSections(value: unknown): Array<{ title: string; content: string }> | undefined {
  if (!Array.isArray(value)) return undefined;
  const sections = value
    .filter((item): item is { title: string; content: string } => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as { title?: unknown }).title === "string" &&
        typeof (item as { content?: unknown }).content === "string"
      );
    })
    .map((item) => ({
      title: item.title.trim(),
      content: item.content.trim(),
    }))
    .filter((item) => item.title && item.content)
    .slice(0, 8);
  return sections.length > 0 ? sections : undefined;
}

function parseReply(
  content: string,
  methodId: string | null,
  question: string,
  maxAnswerLen: number,
): MethodCopilotReply {
  try {
    const parsed = JSON.parse(content) as {
      answer?: unknown;
      diagram?: unknown;
      relatedTerms?: unknown;
      sections?: unknown;
      highlights?: unknown;
    };
    const relatedTerms = Array.isArray(parsed.relatedTerms)
      ? parsed.relatedTerms.filter((t): t is string => typeof t === "string").slice(0, 4)
      : [];
    const highlights = Array.isArray(parsed.highlights)
      ? parsed.highlights.filter((t): t is string => typeof t === "string").slice(0, 5)
      : undefined;
    const sections = parseSections(parsed.sections);
    const answer = sanitizeText(
      parsed.answer,
      sections?.map((s) => `${s.title}\n${s.content}`).join("\n\n") ?? "暂时无法生成解释，请换个问法或查阅页面参考库。",
      maxAnswerLen,
    );
    return {
      answer,
      diagram: sanitizeText(parsed.diagram ?? "", "", 600),
      relatedTerms,
      sections,
      highlights,
      degraded: false,
    };
  } catch {
    return {
      answer: sanitizeText(content, fallbackReply(methodId, question).answer, maxAnswerLen),
      diagram: "",
      relatedTerms: [],
      degraded: false,
    };
  }
}

export async function askMethodCopilot(
  methodId: string | null,
  question: string,
  history: MethodCopilotTurn[] = [],
): Promise<MethodCopilotReply> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { answer: "请输入你想了解的术语或情况。", diagram: "", relatedTerms: [] };
  }

  const config = getMethodCopilotConfig(methodId);
  const messages: LlmMessage[] = [
    { role: "system", content: config.systemSkill },
    ...history.slice(-6).map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: "user", content: trimmed },
  ];

  const res = await llmComplete({
    messages,
    responseFormat: "json",
    maxTokens: 800,
  });

  if (res.degraded || !res.content) {
    return fallbackReply(methodId, trimmed);
  }

  return parseReply(res.content, methodId, trimmed, 1200);
}

export async function askMethodCopilotAnalysis(
  methodId: string | null,
  question: string,
  history: MethodCopilotTurn[] = [],
  report: MethodCopilotReportSnapshot,
): Promise<MethodCopilotReply> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { answer: "请输入你想解析的问题。", diagram: "", relatedTerms: [] };
  }

  const effectiveMethodId = methodId ?? report.methodId;
  const systemSkill = getMethodCopilotAnalysisSkill(effectiveMethodId);
  const reportBlock = `【当前页面报告】
标题：${report.title}
${report.summary ? `摘要：${report.summary}\n` : ""}
---
${report.body}
---`;

  const messages: LlmMessage[] = [
    { role: "system", content: systemSkill },
    { role: "user", content: reportBlock },
    ...history.slice(-4).map((turn) => ({
      role: turn.role,
      content: turn.content,
    })),
    { role: "user", content: trimmed },
  ];

  const res = await llmComplete({
    messages,
    responseFormat: "json",
    maxTokens: 2400,
  });

  if (res.degraded || !res.content) {
    const answer = isLlmConfigured()
      ? `解说请求失败，暂时无法解析「${report.title}」。请稍后重试，或在设置中重新测试 LLM 连接。`
      : `侧栏解说尚未配置：请打开设置，填写 API Key 后点击「测试连接」（会自动保存）。`;
    return { ...fallbackReply(effectiveMethodId, trimmed), answer };
  }

  return parseReply(res.content, effectiveMethodId, trimmed, 4000);
}

export function isAnalysisQuestion(question: string, hasReport: boolean): boolean {
  if (!hasReport) return false;
  const q = question.trim();
  return (
    q === "解析本次报告" ||
    q.startsWith("请结合当前页面报告") ||
    q.includes("解析本次") ||
    q.includes("详细解析") ||
    q.includes("重讲一遍") ||
    q.includes("风险点")
  );
}
