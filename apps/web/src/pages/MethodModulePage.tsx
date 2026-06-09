import { useMemo, useState, type CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMethod } from "@/data/divinationMethods";
import { getMethodDeepLibrary } from "@/data/methodDeepLibraries";
import { getMethodReferenceLibrary } from "@/data/methodReferenceLibraries";
import { buildQimenReferenceLibrary } from "@/data/methodReferenceLibraries/qimenAdapter";
import { getMethodModuleKit } from "@/data/methodModuleKits";
import { getMethodModule } from "@/data/methodModules";
import { getMethodOperationLibrary } from "@/data/methodOperationLibraries";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodDeepLibraryPanel } from "@/components/MethodDeepLibraryPanel";
import { MethodHero } from "@/components/MethodHero";
import { MethodReferenceLibraryPanel } from "@/components/MethodReferenceLibraryPanel";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildDraft, type ModuleDraftReading } from "@/lib/methodModuleDraft";
import { buildModuleDraftSnapshot } from "@/lib/methodReportSnapshot";

type MethodModulePageProps = {
  methodId?: string;
};

export function MethodModulePage({ methodId: methodIdProp }: MethodModulePageProps) {
  const { methodId: routeMethodId } = useParams();
  const methodId = methodIdProp ?? routeMethodId;
  const module = getMethodModule(methodId);
  const kit = getMethodModuleKit(methodId);
  const deepLibrary = getMethodDeepLibrary(methodId);
  const operationLibrary = getMethodOperationLibrary(methodId);
  const method = getMethod(methodId ?? "");
  const [context, setContext] = useState("");
  const [subjectType, setSubjectType] = useState<string | null>(null);
  const [predictionWindow, setPredictionWindow] = useState<string | null>(null);
  const [modeId, setModeId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ModuleDraftReading | null>(null);

  const visualMarks = useMemo(() => module?.coreSymbols.slice(0, 5) ?? [], [module]);
  const isWorkbench = methodId === "iching";

  const copilotReport = useMemo(
    () =>
      draft && methodId
        ? buildModuleDraftSnapshot(methodId, module?.title ?? method?.title ?? methodId, draft)
        : null,
    [draft, methodId, module?.title, method?.title],
  );
  useRegisterMethodCopilotReport(copilotReport);

  if (!module || !method || !kit || !operationLibrary) {
    return <Navigate to="/methods" replace />;
  }

  const referenceLibrary =
    getMethodReferenceLibrary(methodId) ?? (module.id === "qimen" ? buildQimenReferenceLibrary() : undefined);

  if (!deepLibrary && !referenceLibrary) {
    return <Navigate to="/methods" replace />;
  }

  const currentMode = operationLibrary.modes.find((mode) => mode.id === modeId) ?? operationLibrary.modes[0];
  const currentSubjectType = subjectType ?? operationLibrary.subjectTypes[0];
  const currentWindow = predictionWindow ?? operationLibrary.predictionWindows[0];
  const submitLabel = isWorkbench ? "生成预测草稿" : module.primaryAction;

  return (
    <Page wide className="method-module-page">
      <MethodHero
        methodId={method.id}
        kicker={module.kicker}
        title={module.title}
        description={module.summary}
        className="method-module-hero"
      />

      {isWorkbench && (
        <aside className="method-preview-banner" role="note">
          本页为参考文库 + 模板草稿：按输入 hash 选取象征并填句，非真实起卦、排盘或投掷。结果用于整理思路与对照术语，不作确定性预言。
        </aside>
      )}

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

          {kit.sampleQuestions.length > 0 && (
            <div className="method-sample-questions" aria-label="示例问句">
              <span>示例问句</span>
              <div className="method-sample-questions__chips">
                {kit.sampleQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="method-sample-questions__chip"
                    onClick={() => setContext(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          <button type="submit">{submitLabel}</button>
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
            <p>模板草稿</p>
            <h2>本次预测结果</h2>
          </div>
          <MethodResultActions />
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

      {referenceLibrary && <MethodReferenceLibraryPanel library={referenceLibrary} />}

      {deepLibrary && <MethodDeepLibraryPanel library={deepLibrary} />}

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
