import { useMemo, useState } from "react";
import { readPalmistry, PALMISTRY_OBSERVATION_OPTIONS, type PalmistryResult } from "@atlas/engines/palmistry";
import type { PalmistryInput } from "@atlas/shared-types";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildPalmistryReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";

export function PalmistryPage() {
  const [question, setQuestion] = useState("");
  const [hand, setHand] = useState<PalmistryInput["hand"]>("right");
  const [selected, setSelected] = useState<string[]>(["智慧线-平直", "感情线-深长"]);
  const [result, setResult] = useState<PalmistryResult | null>(null);

  const toggle = (obs: string) => {
    setSelected((prev) => (prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]));
  };

  const read = () => {
    playMethodSound("palmistry", "action");
    setResult(readPalmistry({ question: question.trim() || undefined, hand, observations: selected }));
    playMethodSound("palmistry", "complete");
  };

  const copilotReport = useMemo(
    () => (result ? buildPalmistryReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="palmistry-page">
      <MethodHero
        methodId="palmistry"
        kicker="PALMISTRY"
        title="手相"
        description="掌纹与掌丘的结构化观察解读。基于自主观察，非图像识别。"
      />

      <aside className="method-preview-banner" role="note">
        本页为结构化观察表单解读，非 AI 掌纹识别。不从掌纹判断寿命或健康。
      </aside>

      <section className="method-workbench">
        <label>
          <span>关注点</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} placeholder="当前阶段掌纹主题…" />
        </label>
        <div className="chip-row">
          {(["left", "right", "both"] as const).map((h) => (
            <button key={h} type="button" className={hand === h ? "chip active" : "chip"} onClick={() => setHand(h)}>
              {h === "left" ? "左手" : h === "right" ? "右手" : "双手"}
            </button>
          ))}
        </div>
        <div className="chip-row" role="group" aria-label="掌纹观察">
          {PALMISTRY_OBSERVATION_OPTIONS.map((obs) => (
            <button key={obs} type="button" className={selected.includes(obs) ? "chip active" : "chip"} onClick={() => toggle(obs)}>
              {obs}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={read} disabled={selected.length === 0}>
          {result ? "重新解读" : "生成手相解读"}
        </button>
      </section>

      {result && (
        <section className="palmistry-result">
          <MethodResultActions />
          <div className="reading-grid">
            {result.readings.map((r) => (
              <article key={r.observation}>
                <span>{r.observation}</span>
                <p>{r.meaning}</p>
                <em>{r.predictionUse}</em>
              </article>
            ))}
          </div>
        </section>
      )}

      <MethodLibraryFooter methodId="palmistry" />
    </Page>
  );
}
