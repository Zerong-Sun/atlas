import { useState } from "react";
import type { CitationSnapshot } from "@atlas/shared-types";
import { track } from "@/lib/analytics";

type Props = {
  citation: CitationSnapshot;
  defaultExpanded?: boolean;
  variant?: "default" | "onDay";
};

export function CitationBlock({ citation, defaultExpanded = false, variant = "default" }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) track("citation_expand", { chunkId: citation.chunkId });
  };

  const rootClass =
    variant === "onDay" ? "citation-block citation-block--on-day" : "citation-block card";

  return (
    <article className={rootClass}>
      <button type="button" className="citation-block__header" onClick={toggle} aria-expanded={expanded}>
        <span className="label">古籍依据</span>
        <span className="caption">{expanded ? "收起" : "展开"}</span>
      </button>
      <blockquote className="citation-block__original serif">{citation.original}</blockquote>
      <div className={`citation-block__expand${expanded ? " open" : ""}`}>
        <div className="citation-block__sections stack">
          <Section title="白话" content={citation.translationZh} />
          {citation.annotationZh ? <Section title="注释" content={citation.annotationZh} muted /> : null}
          {citation.application ? (
            <Section title="本次应用" content={citation.application} highlight />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Section({
  title,
  content,
  muted,
  highlight,
}: {
  title: string;
  content: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? "citation-section citation-section--highlight" : "citation-section"}>
      <p className="label">{title}</p>
      <p className={`body ${muted ? "caption--muted" : ""}`}>{content}</p>
    </div>
  );
}
