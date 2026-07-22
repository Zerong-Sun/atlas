import { useMemo } from "react";
import type { MethodDeepLibrary } from "@/data/methodDeepLibraries";

function groupSymbolsByField(library: MethodDeepLibrary) {
  const order: string[] = [];
  const byGroup = new Map<string, MethodDeepLibrary["symbols"]>();

  for (const symbol of library.symbols) {
    if (!byGroup.has(symbol.group)) {
      byGroup.set(symbol.group, []);
      order.push(symbol.group);
    }
    byGroup.get(symbol.group)!.push(symbol);
  }

  return order.map((group) => ({
    category: group,
    symbols: byGroup.get(group)!,
  }));
}

function ModuleList({ title, items, accent }: { title: string; items: string[]; accent?: boolean }) {
  return (
    <article className={accent ? "is-accent" : ""}>
      <span>{title}</span>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function MethodDeepLibraryPanel({ library }: { library: MethodDeepLibrary }) {
  const symbolSections = useMemo(() => groupSymbolsByField(library), [library]);

  return (
    <section className="method-deep-library" aria-label={`${library.title}深库`}>
      <div className="section-heading">
        <p>DEEP LIBRARY</p>
        <h2>{library.title}</h2>
      </div>
      <div className="method-deep-overview">
        <ModuleList title="分类" items={library.categories} />
        <ModuleList title="断法规则" items={library.rules} />
        <ModuleList title="预测维度" items={library.predictionAxes} />
      </div>
      <div className="method-deep-mode-strip">
        {library.modes.map((mode) => (
          <span key={mode}>{mode}</span>
        ))}
      </div>
      {symbolSections.map((section) => (
        <div key={section.category} className="method-deep-symbol-section">
          <h3>{section.category}</h3>
          <div className="method-deep-symbol-grid">
            {section.symbols.map((symbol) => (
              <article key={`${section.category}-${symbol.name}`}>
                <span>{symbol.group}</span>
                <strong>{symbol.name}</strong>
                <p>{symbol.meaning}</p>
                <em>{symbol.use}</em>
              </article>
            ))}
          </div>
        </div>
      ))}
      <div className="method-deep-output">
        {library.outputs.map((output) => (
          <span key={output}>{output}</span>
        ))}
      </div>
    </section>
  );
}
