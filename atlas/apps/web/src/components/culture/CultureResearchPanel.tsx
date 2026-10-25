import { CULTURE_EVIDENCE_LABELS, getCultureResearch, getCultureSources } from "@atlas/method-data";

/** Local editorial library: no API, account or network is needed to read it. */
export function CultureResearchPanel({ methodId }: { methodId: string }) {
  const research = getCultureResearch(methodId);
  if (!research) return null;
  const sources = getCultureSources(methodId);
  return (
    <div className="culture-research" data-culture-method={methodId}>
      <p className="culture-research__intro"><strong>为什么人们会用它？</strong> {research.why}</p>
      <details key={methodId}>
        <summary>读历史、人物与文化背景 <span>离线文库</span></summary>
        <div className="culture-research__content">
          <small>{research.period}</small>
          <h3>{research.history.title}</h3>
          <span className="culture-research__evidence">{CULTURE_EVIDENCE_LABELS[research.history.evidence]}</span>
          <p>{research.history.text}</p>
          <h4>人物与证据</h4><p>{research.people}</p>
          <h4>从这里理解文化</h4><p>{research.lens}</p>
          <h4>体验前想一想</h4><p>{research.before}</p>
          <h4>体验后再比较</h4><p>{research.after}</p>
          <p className="culture-research__boundary">{research.boundary}</p>
          <h4>资料与阅读范围</h4>
          <ol>{sources.map(source => <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>
            <small>{source.institution} · {source.scope}</small>
          </li>)}</ol>
          <small>文化摘要与学习问题由 Atlas 编写；链接用于核查历史，不证明占卜的预测效果。外部资料需联网，本页正文可离线阅读。</small>
        </div>
      </details>
    </div>
  );
}
