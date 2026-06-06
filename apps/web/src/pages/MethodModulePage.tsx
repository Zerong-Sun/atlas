import { useMemo, useState, type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMethod } from "@/data/divinationMethods";
import { getMethodDeepLibrary, type MethodDeepLibrary } from "@/data/methodDeepLibraries";
import { getMethodReferenceLibrary } from "@/data/methodReferenceLibraries";
import { getMethodModuleKit, type MethodModuleKit } from "@/data/methodModuleKits";
import { getMethodModule, type MethodModule } from "@/data/methodModules";
import {
  getMethodOperationLibrary,
  type MethodOperationLibrary,
  type OperationMode,
  type OperationSymbol,
} from "@/data/methodOperationLibraries";
import { getQimenLibrary, type QimenEntry } from "@/data/qimenLibrary";
import { MethodReferenceLibraryPanel } from "@/components/MethodReferenceLibraryPanel";
import { Page } from "@/components/ui/Page";

type DraftReading = {
  context: string;
  subjectType: string;
  predictionWindow: string;
  mode: OperationMode;
  pattern: string;
  selectedSymbols: OperationSymbol[];
  sections: Array<{ title: string; body: string }>;
  axes: Array<{ axis: string; reading: string }>;
  advice: string[];
};

export function MethodModulePage() {
  const { methodId } = useParams();
  const module = getMethodModule(methodId);
  const kit = getMethodModuleKit(methodId);
  const deepLibrary = getMethodDeepLibrary(methodId);
  const referenceLibrary = getMethodReferenceLibrary(methodId);
  const operationLibrary = getMethodOperationLibrary(methodId);
  const method = getMethod(methodId ?? "");
  const [context, setContext] = useState("");
  const [subjectType, setSubjectType] = useState<string | null>(null);
  const [predictionWindow, setPredictionWindow] = useState<string | null>(null);
  const [modeId, setModeId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftReading | null>(null);

  const visualMarks = useMemo(() => module?.coreSymbols.slice(0, 5) ?? [], [module]);

  if (!module || !method || !kit || !operationLibrary || !deepLibrary) {
    return <Navigate to="/methods" replace />;
  }

  const currentMode = operationLibrary.modes.find((mode) => mode.id === modeId) ?? operationLibrary.modes[0];
  const currentSubjectType = subjectType ?? operationLibrary.subjectTypes[0];
  const currentWindow = predictionWindow ?? operationLibrary.predictionWindows[0];
  const qimenLibrary = module.id === "qimen" ? getQimenLibrary() : null;
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
            setDraft(buildDraft(module, kit, operationLibrary, context, currentSubjectType, currentWindow, currentMode));
          }}
        >
          <div className="method-module-form__head">
            <span>{method.tradition}</span>
            <strong>{method.title}</strong>
          </div>

          <label>
            <span>事项背景</span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              rows={5}
              placeholder="输入你要分析的真实事项、已知条件、时间地点或关键人物。"
            />
          </label>

          <label>
            <span>事项类型</span>
            <select value={currentSubjectType} onChange={(event) => setSubjectType(event.target.value)}>
              {operationLibrary.subjectTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>预测窗口</span>
            <select value={currentWindow} onChange={(event) => setPredictionWindow(event.target.value)}>
              {operationLibrary.predictionWindows.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="method-module-modes" aria-label="解读模式">
            {operationLibrary.modes.map((mode) => (
              <button
                type="button"
                key={mode.id}
                className={mode.id === currentMode.id ? "active" : ""}
                onClick={() => {
                  setModeId(mode.id);
                  setDraft(null);
                }}
              >
                <strong>{mode.label}</strong>
                <span>{mode.description}</span>
              </button>
            ))}
          </div>

          <div className="method-module-inputs" aria-label="模块输入项">
            {[...module.inputs, ...operationLibrary.predictionAxes.slice(0, 3)].map((input) => (
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
          <div className="method-module-pattern">
            <span>运行规则</span>
            <strong>{kit.samplePattern}</strong>
          </div>
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
            <h2>本次预测结果</h2>
          </div>
          <div className="method-module-result__summary">
            <span>{draft.subjectType} / {draft.predictionWindow}</span>
            <strong>{draft.context}</strong>
            <p>
              模式：{draft.mode.label}。系统已抽取 {draft.selectedSymbols.length} 个本次主象，
              并按 {operationLibrary.outputSections.length} 个输出段落和 {operationLibrary.predictionAxes.length} 个预测维度生成判断。
            </p>
          </div>
          <div className="method-module-draw">
            {draft.selectedSymbols.map((symbol, index) => (
              <article key={`${symbol.name}-${index}`}>
                <span>{kit.artifactLabels[index] ?? "辅助象征"}</span>
                <strong>{symbol.name}</strong>
                <p>{symbol.meaning}</p>
                <em>{symbol.predictionUse}</em>
              </article>
            ))}
          </div>
          <div className="method-module-axis-grid">
            {draft.axes.map((axis) => (
              <article key={axis.axis}>
                <span>{axis.axis}</span>
                <p>{axis.reading}</p>
              </article>
            ))}
          </div>
          <div className="method-module-section-grid">
            {draft.sections.map((section) => (
              <article key={section.title}>
                <span>{section.title}</span>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
          <div className="method-module-advice">
            <span>落地建议</span>
            {draft.advice.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </section>
      )}

      <section className="method-module-system" aria-label="模块构建清单">
        <ModuleList title="解读结构" items={module.readingSections} />
        <ModuleList title="运行流程" items={operationLibrary.workflow} />
        <ModuleList title="安全边界" items={operationLibrary.guardrails} accent />
      </section>

      {qimenLibrary && <QimenDeepLibrary library={qimenLibrary} />}

      {referenceLibrary && <MethodReferenceLibraryPanel library={referenceLibrary} />}

      <MethodDeepLibraryPanel library={deepLibrary} />

      <section className="method-module-library" aria-label={`${module.title}符号词典`}>
        <div className="section-heading">
          <p>MODULE LIBRARY</p>
          <h2>本模块符号词典</h2>
        </div>
        <div className="method-module-library__grid">
          {operationLibrary.symbolBank.map((entry) => (
            <article key={entry.name}>
              <span>{entry.name}</span>
              <p>{entry.meaning}</p>
              <em>{entry.predictionUse}</em>
            </article>
          ))}
        </div>
      </section>

      <Link className="method-module-back" to="/methods">
        返回占法列表
      </Link>
    </Page>
  );
}

function MethodDeepLibraryPanel({ library }: { library: MethodDeepLibrary }) {
  const grouped = library.categories
    .map((category) => ({
      category,
      symbols: library.symbols.filter((symbol) => symbol.group === category),
    }))
    .filter((group) => group.symbols.length > 0);
  const symbolSections =
    grouped.length > 0 ? grouped : [{ category: "符号", symbols: library.symbols }];

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
        {library.modes.map((mode) => <span key={mode}>{mode}</span>)}
      </div>
      {symbolSections.map((section) => (
        <div key={section.category} className="method-deep-symbol-section">
          <h3>{section.category}</h3>
          <div className="method-deep-symbol-grid">
            {section.symbols.map((symbol) => (
              <article key={`${section.category}-${symbol.name}-${symbol.group}`}>
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
        {library.outputs.map((output) => <span key={output}>{output}</span>)}
      </div>
    </section>
  );
}

function QimenDeepLibrary({ library }: { library: ReturnType<typeof getQimenLibrary> }) {
  const [activeGroup, setActiveGroup] = useState<"doors" | "stars" | "gods" | "stems" | "palaces">("doors");
  const groups: Array<{ id: typeof activeGroup; label: string; items: QimenEntry[] }> = [
    { id: "doors", label: "八门", items: library.doors },
    { id: "stars", label: "九星", items: library.stars },
    { id: "gods", label: "八神", items: library.gods },
    { id: "stems", label: "三奇六仪", items: library.stems },
    { id: "palaces", label: "九宫", items: library.palaces },
  ];
  const currentGroup = groups.find((group) => group.id === activeGroup) ?? groups[0];

  return (
    <section className="qimen-deep-library" aria-label="奇门遁甲深度资料库">
      <div className="section-heading">
        <p>QIMEN REFERENCE</p>
        <h2>奇门遁甲分析库</h2>
      </div>

      <div className="qimen-reference-layout">
        <div className="qimen-reference-panel qimen-reference-panel--wide">
          <div className="qimen-reference-tabs" role="tablist" aria-label="奇门元素分类">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={group.id === activeGroup}
                className={group.id === activeGroup ? "active" : ""}
                onClick={() => setActiveGroup(group.id)}
              >
                {group.label}
              </button>
            ))}
          </div>
          <div className="qimen-entry-grid">
            {currentGroup.items.map((entry) => (
              <article key={entry.name}>
                <span>{entry.nature}</span>
                <strong>{entry.name}</strong>
                <p>{entry.meaning}</p>
                <em>{entry.usage}</em>
              </article>
            ))}
          </div>
        </div>

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
      </div>

      <div className="qimen-reference-layout qimen-reference-layout--bottom">
        <div className="qimen-reference-panel">
          <span className="qimen-panel-label">断盘流程</span>
          <ol className="qimen-steps">
            {library.analysisSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="qimen-reference-panel">
          <span className="qimen-panel-label">关系与格局</span>
          <div className="qimen-relation-grid">
            {library.relations.map((relation) => (
              <article key={relation.name}>
                <strong>{relation.name}</strong>
                <span>{relation.nature}</span>
                <p>{relation.meaning}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="qimen-reference-layout qimen-reference-layout--bottom">
        <div className="qimen-reference-panel qimen-reference-panel--wide">
          <span className="qimen-panel-label">完整格局库</span>
          <div className="qimen-relation-grid">
            {library.patterns.map((pattern) => (
              <article key={pattern.id}>
                <strong>{pattern.name}</strong>
                <span>{pattern.category} / {pattern.level}</span>
                <p>{pattern.formation}</p>
                <em>{pattern.actionHint}</em>
              </article>
            ))}
          </div>
        </div>

        <div className="qimen-reference-panel">
          <span className="qimen-panel-label">符使与遁局</span>
          <div className="qimen-question-list">
            {[...library.zhiFuZhiShiRules, ...library.dunRules].map((rule) => (
              <article key={rule.title}>
                <strong>{rule.title}</strong>
                <p>{rule.steps.join(" / ")}</p>
                <em>{rule.note}</em>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="qimen-reference-layout qimen-reference-layout--bottom">
        <div className="qimen-reference-panel">
          <span className="qimen-panel-label">应期判断</span>
          <div className="qimen-question-list">
            {library.timingRules.map((rule) => (
              <article key={rule.title}>
                <strong>{rule.title}</strong>
                <p>{rule.steps.join(" / ")}</p>
                <em>{rule.note}</em>
              </article>
            ))}
          </div>
        </div>

        <div className="qimen-reference-panel qimen-reference-panel--wide">
          <span className="qimen-panel-label">方位转译库</span>
          <div className="qimen-relation-grid">
            {library.directionTranslations.map((item) => (
              <article key={item.palace}>
                <strong>{item.palace}</strong>
                <span>{item.direction} / {item.element}</span>
                <p>{item.action}</p>
                <em>{item.spatial}；{item.timing}</em>
              </article>
            ))}
          </div>
        </div>
      </div>

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
    </section>
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

function buildDraft(
  module: MethodModule,
  kit: MethodModuleKit,
  operationLibrary: MethodOperationLibrary,
  context: string,
  subjectType: string,
  predictionWindow: string,
  mode: OperationMode
): DraftReading {
  const cleanContext = context.trim() || `${subjectType} / ${predictionWindow} / ${mode.label}`;
  const selectedSymbols = pickSymbols(
    operationLibrary.symbolBank,
    `${module.id}:${cleanContext}:${subjectType}:${predictionWindow}:${mode.id}`,
    3
  );

  return {
    context: cleanContext,
    subjectType,
    predictionWindow,
    mode,
    pattern: kit.samplePattern,
    selectedSymbols,
    advice: operationLibrary.guardrails,
    axes: operationLibrary.predictionAxes.map((axis, index) => {
      const symbol = selectedSymbols[index % selectedSymbols.length];
      return {
        axis,
        reading: `${symbol.name} 指向「${symbol.predictionUse}」。在 ${predictionWindow} 内，先按「${subjectType}」校验现实条件，再决定推进、等待或换路径。`,
      };
    }),
    sections: operationLibrary.outputSections.map((section, index) => {
      const symbol = selectedSymbols[index % selectedSymbols.length];
      return {
        title: section,
        body: `以「${symbol.name}」为主象，按「${mode.label}」处理「${subjectType}」：${symbol.meaning} ${kit.samplePattern}`,
      };
    }),
  };
}

function pickSymbols(entries: OperationSymbol[], seed: string, count: number) {
  const scored = entries.map((entry, index) => ({
    entry,
    score: hashText(`${seed}:${entry.name}:${index}`),
  }));
  return scored
    .sort((left, right) => left.score - right.score)
    .slice(0, count)
    .map((item) => item.entry);
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}
