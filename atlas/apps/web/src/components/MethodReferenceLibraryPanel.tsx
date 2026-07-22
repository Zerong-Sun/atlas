import { useEffect, useState } from "react";
import type { MethodReferenceLibrary } from "@/data/methodReferenceLibraries/types";

type Props = {
  library: MethodReferenceLibrary;
};

export function MethodReferenceLibraryPanel({ library }: Props) {
  const [activeGroupId, setActiveGroupId] = useState(library.symbolGroups[0]?.id ?? "");
  const currentGroup = library.symbolGroups.find((group) => group.id === activeGroupId) ?? library.symbolGroups[0];

  useEffect(() => {
    setActiveGroupId(library.symbolGroups[0]?.id ?? "");
  }, [library.id, library.symbolGroups]);

  return (
    <section className="qimen-deep-library method-reference-library" aria-label={`${library.title}深度资料库`}>
      <div className="section-heading">
        <p>METHOD REFERENCE</p>
        <h2>{library.title}</h2>
      </div>

      {library.symbolGroups.length > 0 && currentGroup && (
        <div className="qimen-reference-layout">
          <div className="qimen-reference-panel qimen-reference-panel--wide">
            <div className="qimen-reference-tabs" role="tablist" aria-label="元素分类">
              {library.symbolGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={group.id === activeGroupId}
                  className={group.id === activeGroupId ? "active" : ""}
                  onClick={() => setActiveGroupId(group.id)}
                >
                  {group.label}
                </button>
              ))}
            </div>
            <div className="qimen-entry-grid">
              {currentGroup.items.map((entry) => (
                <article key={`${currentGroup.id}-${entry.name}`}>
                  <span>{entry.nature}</span>
                  <strong>{entry.name}</strong>
                  <p>{entry.meaning}</p>
                  <em>{entry.usage}</em>
                </article>
              ))}
            </div>
          </div>

          {library.questionTypes.length > 0 && (
            <aside className="qimen-reference-panel">
              <span className="qimen-panel-label">问事取用</span>
              <div className="qimen-question-list">
                {library.questionTypes.map((question) => (
                  <article key={question.type}>
                    <strong>{question.type}</strong>
                    <p>{question.focus}</p>
                    <small>用神：{question.usefulGod}</small>
                    <em>{question.readingKey}</em>
                  </article>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}

      {library.analysisSteps.length > 0 && (
        <div className="qimen-reference-layout qimen-reference-layout--bottom">
          <div className="qimen-reference-panel">
            <span className="qimen-panel-label">断盘流程</span>
            <ol className="qimen-steps">
              {library.analysisSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          {library.relations.length > 0 && (
            <div className="qimen-reference-panel">
              <span className="qimen-panel-label">关系结构</span>
              <div className="qimen-relation-grid">
                {library.relations.map((relation) => (
                  <article key={relation.name}>
                    <strong>{relation.name}</strong>
                    <span>{relation.nature}</span>
                    <p>{relation.meaning}</p>
                    <em>{relation.usage}</em>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {library.patterns.length > 0 && (
        <div className="qimen-reference-layout qimen-reference-layout--bottom">
          <div className="qimen-reference-panel qimen-reference-panel--wide">
            <span className="qimen-panel-label">格局与组合</span>
            <div className="qimen-relation-grid">
              {library.patterns.map((item) => (
                <article key={item.id}>
                  <strong>{item.name}</strong>
                  <span>
                    {item.category} / {item.level}
                  </span>
                  <p>{item.formation}</p>
                  <p>{item.meaning}</p>
                  {item.applications && <p>{item.applications}</p>}
                  {item.cautions && <small>{item.cautions}</small>}
                  <em>{item.actionHint}</em>
                </article>
              ))}
            </div>
          </div>

          {library.ruleGroups.length > 0 && (
            <div className="qimen-reference-panel">
              {library.ruleGroups.map((group) => (
                <div key={group.label}>
                  <span className="qimen-panel-label">{group.label}</span>
                  <div className="qimen-question-list">
                    {group.rules.map((rule) => (
                      <article key={rule.title}>
                        <strong>{rule.title}</strong>
                        <p>{rule.steps.join(" / ")}</p>
                        <em>{rule.note}</em>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {library.extraPanels?.map((panel) => (
        <div key={panel.label} className="qimen-reference-layout qimen-reference-layout--bottom">
          <div className="qimen-reference-panel qimen-reference-panel--wide">
            <span className="qimen-panel-label">{panel.label}</span>
            <div className="qimen-relation-grid">
              {panel.items.map((item) => (
                <article key={item.title}>
                  <strong>{item.title}</strong>
                  {item.subtitle && <span>{item.subtitle}</span>}
                  <p>{item.body}</p>
                  {item.hint && <em>{item.hint}</em>}
                </article>
              ))}
            </div>
          </div>
        </div>
      ))}

      {library.classicNotes && library.classicNotes.length > 0 && (
        <div className="qimen-classic-notes">
          <div className="section-heading">
            <p>CLASSIC DIGEST</p>
            <h2>典籍拆解</h2>
          </div>
          <div className="qimen-classic-grid">
            {library.classicNotes.map((note) => (
              <article key={`${note.source}-${note.principle}`}>
                <span>{note.source}</span>
                <strong>{note.principle}</strong>
                <p>{note.paraphrase}</p>
                <em>{note.application}</em>
                <small>{note.caution}</small>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
