import { useMemo, useState } from "react";
import { readXiangmian, XIANGMIAN_OBSERVATION_OPTIONS, type XiangmianResult } from "@atlas/engines/xiangmian";
import { MethodLibraryFooter } from "@/components/MethodLibraryFooter";
import { MethodResultActions } from "@/components/MethodResultActions";
import { MethodHero } from "@/components/MethodHero";
import { Page } from "@/components/ui/Page";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { buildXiangmianReportSnapshot } from "@/lib/methodReportSnapshot";
import { playMethodSound } from "@/lib/methodSounds";

export function XiangmianPage() {
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<string[]>(["中停-匀称", "眼神-清亮"]);
  const [result, setResult] = useState<XiangmianResult | null>(null);

  const toggle = (obs: string) => {
    setSelected((prev) => (prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]));
  };

  const read = () => {
    playMethodSound("xiangmian", "action");
    setResult(readXiangmian({ question: question.trim() || undefined, observations: selected }));
    playMethodSound("xiangmian", "complete");
  };

  const copilotReport = useMemo(
    () => (result ? buildXiangmianReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Page wide className="xiangmian-page">
      <MethodHero
        methodId="xiangmian"
        kicker="FACE READING"
        title="面相"
        description="三停五官与气色观察的结构化解读。基于自主观察，非照片识别。"
      />

      <aside className="method-preview-banner" role="note">
        本页为结构化观察表单解读，非 AI 面相识别。不做医疗或身份诊断。
      </aside>

      <section className="method-workbench">
        <label>
          <span>关注点</span>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} placeholder="近期给人的整体气象…" />
        </label>
        <div className="chip-row" role="group" aria-label="观察项">
          {XIANGMIAN_OBSERVATION_OPTIONS.map((obs) => (
            <button key={obs} type="button" className={selected.includes(obs) ? "chip active" : "chip"} onClick={() => toggle(obs)}>
              {obs}
            </button>
          ))}
        </div>
        <button type="button" className="primary-btn" onClick={read} disabled={selected.length === 0}>
          {result ? "重新解读" : "生成面相解读"}
        </button>
      </section>

      {result && (
        <section className="xiangmian-result">
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

      <MethodLibraryFooter methodId="xiangmian" />
    </Page>
  );
}
