import type { MethodCopilotTurn } from "@/lib/api/methodCopilot";

export function ArchiveInterpretationView({ turns }: { turns: MethodCopilotTurn[] }) {
  if (turns.length === 0) return null;

  return (
    <section className="archive-interpretation" aria-label="报告解读">
      <h3>报告解读</h3>
      <div className="archive-interpretation__thread">
        {turns.map((turn, index) => (
          <article
            key={`${turn.role}-${index}`}
            className={[
              "archive-interpretation__bubble",
              turn.role === "user" ? "is-user" : "is-assistant",
              turn.degraded ? "is-degraded" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {turn.role === "assistant" && turn.sections && turn.sections.length > 0 ? (
              <div className="archive-interpretation__sections">
                {turn.highlights && turn.highlights.length > 0 && (
                  <ul className="archive-interpretation__highlights">
                    {turn.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {turn.sections.map((section) => (
                  <div key={section.title} className="archive-interpretation__section">
                    <h4>{section.title}</h4>
                    <p>{section.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{turn.content}</p>
            )}
            {turn.diagram && (
              <pre className="archive-interpretation__diagram" aria-label="结构示意">
                {turn.diagram}
              </pre>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
