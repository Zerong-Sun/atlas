import { useState } from "react";
import { Page } from "@/components/ui/Page";

const MODEL_RULES = [
  "不把占卜输出包装成确定事实。",
  "涉及健康、法律、投资时必须提示寻求专业意见。",
  "允许保留古籍和民俗口吻，但结论要落到反思和行动。",
  "多流派结论冲突时并列显示，不强行合并。",
];

export function SettingsPage() {
  const [mysticMotion, setMysticMotion] = useState(true);
  const [classicMode, setClassicMode] = useState(true);
  const [safeMode, setSafeMode] = useState(true);
  const [defaultMethod, setDefaultMethod] = useState("bazi");

  return (
    <Page wide className="settings-page">
      <section className="method-detail-hero">
        <p className="method-kicker">SETTINGS</p>
        <h1>设置</h1>
        <p>这里放产品级偏好：默认占法、动效、古文解释深度，以及 LLM 输出边界。档案归档案，设置归设置。</p>
      </section>

      <section className="settings-layout">
        <div className="settings-panel">
          <div className="section-heading">
            <p>PREFERENCES</p>
            <h2>体验偏好</h2>
          </div>
          <label className="settings-field">
            <span>默认占法</span>
            <select value={defaultMethod} onChange={(event) => setDefaultMethod(event.target.value)}>
              <option value="bazi">八字命盘</option>
              <option value="tarot">塔罗抽卡</option>
              <option value="dream">占梦</option>
              <option value="iching">周易六爻</option>
            </select>
          </label>
          <Toggle label="神秘动效" checked={mysticMotion} onChange={setMysticMotion} />
          <Toggle label="优先显示古文解释" checked={classicMode} onChange={setClassicMode} />
          <Toggle label="启用安全边界提示" checked={safeMode} onChange={setSafeMode} />
        </div>

        <div className="settings-panel">
          <div className="section-heading">
            <p>MODEL GUARDRAILS</p>
            <h2>模型输出规则</h2>
          </div>
          <ul className="settings-rules">
            {MODEL_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="settings-panel settings-wide-panel">
        <div className="section-heading">
          <p>ROADMAP</p>
          <h2>下一步可接入</h2>
        </div>
        <div className="settings-roadmap">
          <span>API Key 与模型选择</span>
          <span>占法插件开关</span>
          <span>资料导出与删除</span>
          <span>典籍版本锁定</span>
        </div>
      </section>
    </Page>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="settings-toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
