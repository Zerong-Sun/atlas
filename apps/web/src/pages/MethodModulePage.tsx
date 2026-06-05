import { useMemo, useState, type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMethod } from "@/data/divinationMethods";
import { getMethodModule, type MethodModule } from "@/data/methodModules";
import { Page } from "@/components/ui/Page";

type DraftReading = {
  question: string;
  focus: string;
  sections: Array<{ title: string; body: string }>;
  symbols: string[];
};

const DEFAULT_QUESTIONS = [
  "这件事当前最需要看见的关键是什么？",
  "未来一段时间我该把注意力放在哪里？",
  "这段关系或合作有什么隐藏的动态？",
];

export function MethodModulePage() {
  const { methodId } = useParams();
  const module = getMethodModule(methodId);
  const method = getMethod(methodId ?? "");
  const [question, setQuestion] = useState(DEFAULT_QUESTIONS[0]);
  const [focus, setFocus] = useState(method?.tags[0] ?? "整体趋势");
  const [draft, setDraft] = useState<DraftReading | null>(null);

  const visualMarks = useMemo(() => module?.coreSymbols.slice(0, 5) ?? [], [module]);

  if (!module || !method) {
    return <Navigate to="/methods" replace />;
  }

  return (
    <Page wide className="method-module-page">
      <section className="method-detail-hero method-module-hero">
        <p className="method-kicker">{module.kicker}</p>
        <h1>{module.title}</h1>
        <p>{module.summary}</p>
      </section>

      <section className="method-module-workbench" aria-label={`${module.title}模块工作台`}>
        <form
          className="method-module-form"
          onSubmit={(event) => {
            event.preventDefault();
            setDraft(buildDraft(module, question, focus));
          }}
        >
          <div className="method-module-form__head">
            <span>{method.tradition}</span>
            <strong>{method.title}</strong>
          </div>

          <label>
            <span>问题或记录</span>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={5} />
          </label>

          <label>
            <span>本次关注</span>
            <select value={focus} onChange={(event) => setFocus(event.target.value)}>
              {[...method.tags, ...module.coreSymbols.slice(0, 3)].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="method-module-inputs" aria-label="模块输入项">
            {module.inputs.map((input) => (
              <span key={input}>{input}</span>
            ))}
          </div>

          <button type="submit">{module.primaryAction}</button>
        </form>

        <aside className="method-module-visual" aria-label="模块视觉结构">
          <div className="method-module-orbit" aria-hidden="true">
            {visualMarks.map((mark, index) => (
              <i key={mark} style={{ "--orbit-index": index } as CSSProperties}>
                {mark.slice(0, 2)}
              </i>
            ))}
          </div>
          <p>{module.visualSeed}</p>
          <div className="method-module-symbols">
            {module.coreSymbols.map((symbol) => (
              <span key={symbol}>{symbol}</span>
            ))}
          </div>
        </aside>
      </section>

      {draft && (
        <section className="method-module-result" aria-live="polite">
          <div className="section-heading">
            <p>GENERATED OUTLINE</p>
            <h2>本次解读草案</h2>
          </div>
          <div className="method-module-result__summary">
            <span>问题</span>
            <strong>{draft.question}</strong>
            <p>焦点：{draft.focus}。系统已按 {module.readingSections.length} 个段落整理成可交给 LLM 深化的结构化素材。</p>
          </div>
          <div className="method-module-section-grid">
            {draft.sections.map((section) => (
              <article key={section.title}>
                <span>{section.title}</span>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="method-module-system" aria-label="模块构建清单">
        <ModuleList title="解读结构" items={module.readingSections} />
        <ModuleList title="交互设想" items={module.interactions} />
      </section>

      <Link className="method-module-back" to="/methods">
        返回占法列表
      </Link>
    </Page>
  );
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

function buildDraft(module: MethodModule, question: string, focus: string): DraftReading {
  const cleanQuestion = question.trim() || DEFAULT_QUESTIONS[0];
  const symbols = module.coreSymbols.slice(0, 4);

  return {
    question: cleanQuestion,
    focus,
    symbols,
    sections: module.readingSections.map((section, index) => {
      const symbol = symbols[index % symbols.length];
      return {
        title: section,
        body: `以「${symbol}」为主要取象，围绕「${focus}」解释问题中的显性线索、潜在线索与可执行提醒。后续可接入 Mimo/LLM，把这一段扩写为正式解读。`,
      };
    }),
  };
}
