import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { getMethodCopilotConfig, getMethodCopilotPromptsWithReport } from "@/data/methodCopilotPrompts";
import { getMethodExperience, methodExperienceStyle } from "@/data/methodExperiences";
import { DEFAULT_ANALYSIS_PROMPT } from "@/lib/methodReportSnapshot";
import {
  askMethodCopilot,
  askMethodCopilotAnalysis,
  isAnalysisQuestion,
  type MethodCopilotTurn,
} from "@/lib/api/methodCopilot";
import { useCopilotResize } from "@/hooks/useCopilotResize";
import { isMethodCopilotRoute, methodIdFromPathname } from "@/lib/methodFromRoute";

export function MethodCopilot() {
  const { pathname } = useLocation();
  const { open, setOpen, report, pendingAction, clearPendingAction } = useMethodCopilot();
  const { width, resizing, onResizeStart, onResizeMove, onResizeEnd, onResizeReset } =
    useCopilotResize(open);
  const methodId = methodIdFromPathname(pathname);
  const config = getMethodCopilotConfig(methodId);
  const experience = getMethodExperience(methodId ?? "methods");
  const quickPrompts = getMethodCopilotPromptsWithReport(methodId, Boolean(report));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<MethodCopilotTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMethodRef = useRef(methodId);
  const pendingHandledRef = useRef(false);

  const visible = isMethodCopilotRoute(pathname);

  useEffect(() => {
    if (prevMethodRef.current !== methodId) {
      setTurns([]);
      setInput("");
      prevMethodRef.current = methodId;
    }
  }, [methodId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, loading]);

  const submit = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading) return;
      setInput("");
      setLoading(true);
      const userTurn: MethodCopilotTurn = { role: "user", content: question };
      setTurns((prev) => [...prev, userTurn]);
      const useAnalysis = report && isAnalysisQuestion(question, true);
      try {
        const reply = useAnalysis
          ? await askMethodCopilotAnalysis(methodId, question, turns, report)
          : await askMethodCopilot(methodId, question, turns);
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            content: reply.answer,
            diagram: reply.diagram || undefined,
            relatedTerms: reply.relatedTerms,
            sections: reply.sections,
            highlights: reply.highlights,
            degraded: reply.degraded,
          },
        ]);
      } catch {
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "请求失败，请检查网络或 LLM 配置后重试。",
            degraded: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, methodId, report, turns],
  );

  useEffect(() => {
    if (!open || pendingAction !== "analyze" || !report || pendingHandledRef.current) return;
    pendingHandledRef.current = true;
    clearPendingAction();
    void submit(DEFAULT_ANALYSIS_PROMPT);
  }, [open, pendingAction, report, clearPendingAction, submit]);

  useEffect(() => {
    if (pendingAction !== "analyze") {
      pendingHandledRef.current = false;
    }
  }, [pendingAction]);

  if (!visible) return null;

  const loadingText = report
    ? `正在结合本次报告生成 ${config.title} 解析…`
    : `正在整理 ${config.title} 语境下的解释…`;

  const asideStyle: Record<string, string> = {
    ...methodExperienceStyle(experience),
    "--copilot-width": `${width}px`,
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          className="method-copilot-fab"
          style={methodExperienceStyle(experience)}
          onClick={() => setOpen(true)}
          aria-label="打开占法解说"
        >
          <span aria-hidden>{experience.glyph}</span>
          解说
        </button>
      )}

      <aside
        className={[
          "method-copilot",
          open ? "is-open" : "",
          resizing ? "is-resizing" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={asideStyle}
        aria-label={`${config.title}解说侧栏`}
      >
        <div
          className="method-copilot__resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="调整侧栏宽度"
          aria-valuemin={280}
          aria-valuemax={560}
          aria-valuenow={width}
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeEnd}
          onDoubleClick={onResizeReset}
          title="拖拽调整宽度，双击恢复默认"
        />

        <header className="method-copilot__head">
          <div>
            <p className="method-copilot__kicker">COPILOT</p>
            <h2>{config.title}</h2>
            <p className="method-copilot__sub">{config.subtitle}</p>
            {report && (
              <p className="method-copilot__context-badge" title={report.summary}>
                已读取：{report.title}
              </p>
            )}
          </div>
          <button
            type="button"
            className="method-copilot__toggle"
            onClick={() => setOpen(false)}
            aria-label="收起解说侧栏"
          >
            ×
          </button>
        </header>

        {report && turns.length === 0 && (
          <div className="method-copilot__recommend">
            <p>已读取页面结果，可生成详细解析。</p>
            <button type="button" disabled={loading} onClick={() => submit(DEFAULT_ANALYSIS_PROMPT)}>
              生成详细解析
            </button>
          </div>
        )}

        <div className="method-copilot__prompts" aria-label="快捷提问">
          {quickPrompts.map((prompt) => (
            <button key={prompt} type="button" disabled={loading} onClick={() => submit(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="method-copilot__thread" ref={scrollRef} aria-live="polite">
          {turns.length === 0 && !report && (
            <p className="method-copilot__empty">
              不懂的术语、牌阵结构或断法细节，直接在这里问。我会按<strong>{config.title}</strong>的专业语境回答，并尽量给出结构示意。
            </p>
          )}
          {turns.map((turn, index) => (
            <article
              key={`${turn.role}-${index}`}
              className={[
                "method-copilot__bubble",
                turn.role === "user" ? "is-user" : "is-assistant",
                turn.degraded ? "is-degraded" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {turn.role === "assistant" && turn.sections && turn.sections.length > 0 ? (
                <div className="method-copilot__sections">
                  {turn.highlights && turn.highlights.length > 0 && (
                    <ul className="method-copilot__highlights">
                      {turn.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {turn.sections.map((section) => (
                    <div key={section.title} className="method-copilot__section">
                      <h4>{section.title}</h4>
                      <p>{section.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{turn.content}</p>
              )}
              {turn.diagram && (
                <pre className="method-copilot__diagram" aria-label="结构示意">
                  {turn.diagram}
                </pre>
              )}
              {turn.relatedTerms && turn.relatedTerms.length > 0 && (
                <div className="method-copilot__related">
                  {turn.relatedTerms.map((term) => (
                    <button key={term} type="button" disabled={loading} onClick={() => submit(`请解释：${term}`)}>
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
          {loading && <p className="method-copilot__loading">{loadingText}</p>}
        </div>

        <form
          className="method-copilot__form"
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder={report ? `针对本次报告提问…` : `问一个 ${config.title} 相关的问题…`}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            发送
          </button>
        </form>
      </aside>
    </>
  );
}
