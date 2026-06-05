import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { useApp } from "@/context/AppContext";

export function ProfileOnboardingPage() {
  const navigate = useNavigate();
  const { saveProfile } = useApp();
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthPlace, setBirthPlace] = useState("北京");

  const next = async () => {
    await saveProfile({
      displayName: displayName.trim() || undefined,
      birthDate,
      birthTime,
      birthPlace,
      timezone: "Asia/Shanghai",
    });
    navigate("/onboarding/portrait");
  };

  return (
    <Page title="创建出生档案">
      <p className="hint" style={{ margin: "-1rem 0 1.5rem" }}>用于排盘与个性化（全功能开放，无额度限制）</p>
      <Field label="姓名" value={displayName} onChange={setDisplayName} placeholder="您的称呼（可选）" />
      <Field label="出生日期 (YYYY-MM-DD)" value={birthDate} onChange={setBirthDate} />
      <Field label="出生时间 (HH:mm)" value={birthTime} onChange={setBirthTime} />
      <Field label="出生地点" value={birthPlace} onChange={setBirthPlace} />
      <Button title="生成画像摘要" onClick={next} />
      <style>{`
        .onb-field { margin-bottom: var(--spacing-md); }
        .onb-field label {
          display: block;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-gold);
          margin-bottom: var(--spacing-xs);
        }
        .onb-field input {
          width: 100%;
          box-sizing: border-box;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          color: var(--color-text);
          font-family: var(--font-sans);
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }
        .onb-field input:focus {
          outline: none;
          border-color: var(--color-gold-dim);
          box-shadow: 0 0 0 2px rgba(196, 165, 116, 0.12);
        }
      `}</style>
    </Page>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="onb-field">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
