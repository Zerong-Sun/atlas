import { useEffect, useState } from "react";
import { Page } from "@/components/ui/Page";
import { useMockApi } from "@/lib/api/client";
import { testLlmConnection } from "@/lib/api/llm";
import {
  clearLlmSettings,
  DEFAULT_LLM_BASE_URL,
  DEFAULT_LLM_MODEL,
  getLlmSettingsForForm,
  isLlmConfigured,
  saveLlmSettings,
  validateLlmSettings,
} from "@/lib/llmSettings";
import { getAuthSession } from "@/lib/supabase";
import { isRitualSoundsEnabled, setRitualSoundsEnabled } from "@/lib/methodSounds";

const MODEL_RULES = [
  "不把占卜输出包装成确定事实。",
  "涉及健康、法律、投资时必须提示寻求专业意见。",
  "允许保留古籍和民俗口吻，但结论要落到反思和行动。",
  "多流派结论冲突时并列显示，不强行合并。",
];

type LlmTestState = "idle" | "testing" | "success" | "error";

export function SettingsPage() {
  const supabaseNotConfigured = useMockApi();
  const [cloudSessionReady, setCloudSessionReady] = useState<boolean | null>(null);
  const [mysticMotion, setMysticMotion] = useState(true);
  const [classicMode, setClassicMode] = useState(true);
  const [safeMode, setSafeMode] = useState(true);
  const [ritualSounds, setRitualSounds] = useState(() => isRitualSoundsEnabled());
  const [defaultMethod, setDefaultMethod] = useState("bazi");

  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmBaseUrl, setLlmBaseUrl] = useState(DEFAULT_LLM_BASE_URL);
  const [llmModel, setLlmModel] = useState(DEFAULT_LLM_MODEL);
  const [llmConfigured, setLlmConfigured] = useState(() => isLlmConfigured());
  const [llmTestState, setLlmTestState] = useState<LlmTestState>("idle");
  const [llmTestMessage, setLlmTestMessage] = useState("");

  useEffect(() => {
    setRitualSoundsEnabled(ritualSounds);
  }, [ritualSounds]);

  useEffect(() => {
    const stored = getLlmSettingsForForm();
    setLlmApiKey(stored.apiKey);
    setLlmBaseUrl(stored.baseUrl);
    setLlmModel(stored.model);
    setLlmConfigured(isLlmConfigured());
  }, []);

  useEffect(() => {
    if (supabaseNotConfigured) {
      setCloudSessionReady(null);
      return;
    }
    void getAuthSession().then((session) => setCloudSessionReady(Boolean(session)));
  }, [supabaseNotConfigured]);

  const resetLlmTestState = () => {
    if (llmTestState !== "idle") {
      setLlmTestState("idle");
      setLlmTestMessage("");
    }
  };

  const handleSaveLlm = () => {
    const validationError = validateLlmSettings({
      apiKey: llmApiKey,
      baseUrl: llmBaseUrl,
      model: llmModel,
    });
    if (validationError) {
      setLlmTestState("error");
      setLlmTestMessage(validationError);
      return;
    }
    try {
      saveLlmSettings({
        apiKey: llmApiKey,
        baseUrl: llmBaseUrl,
        model: llmModel,
      });
      setLlmConfigured(true);
      setLlmTestState("idle");
      setLlmTestMessage("已保存到本设备，占梦与侧栏解说将使用此配置。");
    } catch (error) {
      setLlmTestState("error");
      setLlmTestMessage(error instanceof Error ? error.message : "保存失败。");
    }
  };

  const handleTestLlm = async () => {
    setLlmTestState("testing");
    setLlmTestMessage("正在测试连接…");
    const result = await testLlmConnection({
      apiKey: llmApiKey,
      baseUrl: llmBaseUrl,
      model: llmModel,
    });
    setLlmTestState(result.ok ? "success" : "error");
    setLlmTestMessage(result.message);
  };

  const handleClearLlm = () => {
    clearLlmSettings();
    setLlmApiKey("");
    setLlmBaseUrl(DEFAULT_LLM_BASE_URL);
    setLlmModel(DEFAULT_LLM_MODEL);
    setLlmConfigured(false);
    setLlmTestState("idle");
    setLlmTestMessage("已清除本机 LLM 配置。");
  };

  return (
    <Page wide className="settings-page">
      <section className="method-detail-hero">
        <p className="method-kicker">SETTINGS</p>
        <h1>设置</h1>
        <p>产品偏好：默认占法、仪式动效与音效、古文解释深度，以及输出边界。</p>
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
          <Toggle label="仪式音效" checked={ritualSounds} onChange={setRitualSounds} />
          <Toggle label="优先显示古文解释" checked={classicMode} onChange={setClassicMode} />
          <Toggle label="启用安全边界提示" checked={safeMode} onChange={setSafeMode} />
        </div>

        <div className="settings-panel">
          <div className="section-heading">
            <p>DATA</p>
            <h2>数据同步</h2>
          </div>
          <p className="settings-sync-status">
            {supabaseNotConfigured
              ? "当前为仅本地模式，报告保存在本设备。"
              : cloudSessionReady === null
                ? "正在检查云端连接…"
                : cloudSessionReady
                  ? "已连接云端，报告与档案可跨设备同步。"
                  : "已配置 Supabase，但尚未建立会话，云端同步暂不可用。"}
          </p>
        </div>

        <div className="settings-panel settings-panel--stacked">
          <div className="section-heading">
            <p>LLM</p>
            <h2>LLM 连接</h2>
          </div>
          <p className="settings-sync-status">
            {llmConfigured
              ? "已配置本机 API Key，占梦与侧栏解说可用。"
              : "未配置 API Key，占梦与侧栏解说将显示降级模板。"}
          </p>
          <label className="settings-field settings-field--stacked">
            <span>API Key</span>
            <input
              type="password"
              value={llmApiKey}
              onChange={(event) => {
                setLlmApiKey(event.target.value);
                resetLlmTestState();
              }}
              placeholder="sk-..."
              autoComplete="off"
            />
          </label>
          <label className="settings-field settings-field--stacked">
            <span>Base URL</span>
            <input
              type="url"
              value={llmBaseUrl}
              onChange={(event) => {
                setLlmBaseUrl(event.target.value);
                resetLlmTestState();
              }}
              placeholder={DEFAULT_LLM_BASE_URL}
            />
          </label>
          <label className="settings-field settings-field--stacked">
            <span>Model</span>
            <input
              type="text"
              value={llmModel}
              onChange={(event) => {
                setLlmModel(event.target.value);
                resetLlmTestState();
              }}
              placeholder={DEFAULT_LLM_MODEL}
            />
          </label>
          <div className="settings-actions">
            <button type="button" className="settings-btn" onClick={handleSaveLlm}>
              保存
            </button>
            <button
              type="button"
              className="settings-btn settings-btn--primary"
              onClick={handleTestLlm}
              disabled={llmTestState === "testing"}
            >
              {llmTestState === "testing" ? "测试中…" : "测试连接"}
            </button>
            <button type="button" className="settings-btn settings-btn--ghost" onClick={handleClearLlm}>
              清除
            </button>
          </div>
          {llmTestMessage ? (
            <p className={`settings-llm-status settings-llm-status--${llmTestState}`}>{llmTestMessage}</p>
          ) : null}
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
