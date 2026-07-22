import {
  getMethodCopilotAnalysisSkill,
  getMethodCopilotConfig,
  type MethodCopilotContext,
  type MethodCopilotTurn,
} from "@atlas/method-core";
import type { MethodCopilotReportSnapshot } from "@atlas/method-core";
import { isLlmConfigured } from "@/lib/llmSettings";
import { llmComplete, type LlmMessage } from "@/lib/llm";

export type { MethodCopilotTurn };

export type MethodCopilotReply = {
  answer: string;
  diagram: string;
  relatedTerms: string[];
  degraded?: boolean;
  sections?: Array<{ title: string; content: string }>;
  highlights?: string[];
};

function sanitizeText(value: unknown, fallback: string, maxLen = 1200): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text.length > 0 ? text.slice(0, maxLen) : fallback;
}

function fallbackReply(
  methodId: string | null,
  question: string,
  context?: MethodCopilotContext,
): MethodCopilotReply {
  const config = getMethodCopilotConfig(methodId, context);
  return {
    answer: "侧栏解说尚未配置：请打开设置，填写 API Key 后点击「测试连接」。",
    diagram: "",
    relatedTerms: config.quickPrompts.slice(0, 2),
    degraded: true,
  };
}

function parseReply(
  content: string,
  methodId: string | null,
  question: string,
  maxAnswerLen: number,
  context?: MethodCopilotContext,
): MethodCopilotReply {
  try {
    const parsed = JSON.parse(content) as {
      answer?: unknown;
      diagram?: unknown;
      relatedTerms?: unknown;
      sections?: unknown;
    };
    const relatedTerms = Array.isArray(parsed.relatedTerms)
      ? parsed.relatedTerms.filter((t): t is string => typeof t === "string").slice(0, 4)
      : [];
    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
          .filter(
            (item): item is { title: string; content: string } =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as { title?: unknown }).title === "string" &&
              typeof (item as { content?: unknown }).content === "string",
          )
          .slice(0, 8)
      : undefined;
    const answer = sanitizeText(
      parsed.answer,
      sections?.map((s) => `${s.title}\n${s.content}`).join("\n\n") ?? "暂时无法生成解释。",
      maxAnswerLen,
    );
    return {
      answer,
      diagram: sanitizeText(parsed.diagram ?? "", "", 600),
      relatedTerms,
      sections: sections?.length ? sections : undefined,
      degraded: false,
    };
  } catch {
    return {
      answer: sanitizeText(content, fallbackReply(methodId, question, context).answer, maxAnswerLen),
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
  context?: MethodCopilotContext,
): Promise<MethodCopilotReply> {
  const trimmed = question.trim();
  if (!trimmed) return { answer: "请输入你想了解的内容。", diagram: "", relatedTerms: [] };

  const configured = await isLlmConfigured();
  if (!configured) return fallbackReply(methodId, trimmed, context);

  const config = getMethodCopilotConfig(methodId, context);
  const messages: LlmMessage[] = [
    { role: "system", content: config.systemSkill },
    ...history.slice(-6).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: trimmed },
  ];

  const res = await llmComplete({ messages, responseFormat: "json", maxTokens: 800 });
  if (res.degraded || !res.content) return fallbackReply(methodId, trimmed, context);
  return parseReply(res.content, methodId, trimmed, 1200, context);
}

export async function askMethodCopilotAnalysis(
  methodId: string | null,
  question: string,
  history: MethodCopilotTurn[] = [],
  report: MethodCopilotReportSnapshot,
  context?: MethodCopilotContext,
): Promise<MethodCopilotReply> {
  const trimmed = question.trim();
  if (!trimmed) return { answer: "请输入你想解析的问题。", diagram: "", relatedTerms: [] };

  const configured = await isLlmConfigured();
  const effectiveMethodId = methodId ?? report.methodId;
  const analysisContext: MethodCopilotContext = {
    workbench: context?.workbench ?? report.source === "module",
  };
  if (!configured) return fallbackReply(effectiveMethodId, trimmed, analysisContext);

  const systemSkill = getMethodCopilotAnalysisSkill(effectiveMethodId, analysisContext);
  const reportBlock = `【当前页面报告】\n标题：${report.title}\n${report.summary ? `摘要：${report.summary}\n` : ""}---\n${report.body}\n---`;

  const messages: LlmMessage[] = [
    { role: "system", content: systemSkill },
    { role: "user", content: reportBlock },
    ...history.slice(-4).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: trimmed },
  ];

  const res = await llmComplete({ messages, responseFormat: "json", maxTokens: 2400 });
  if (res.degraded || !res.content) return fallbackReply(effectiveMethodId, trimmed, analysisContext);
  return parseReply(res.content, effectiveMethodId, trimmed, 4000, analysisContext);
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
