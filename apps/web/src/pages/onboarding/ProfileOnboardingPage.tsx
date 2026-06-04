import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { useApp } from "@/context/AppContext";
import { colors, radius, spacing } from "@/theme/tokens";

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
      <p className="hint">用于排盘与个性化（全功能开放，无额度限制）</p>
      <Field label="姓名" value={displayName} onChange={setDisplayName} placeholder="您的称呼（可选）" />
      <Field label="出生日期 (YYYY-MM-DD)" value={birthDate} onChange={setBirthDate} />
      <Field label="出生时间 (HH:mm)" value={birthTime} onChange={setBirthTime} />
      <Field label="出生地点" value={birthPlace} onChange={setBirthPlace} />
      <Button title="生成画像摘要" onClick={next} />
      <style>{`
        .hint { color: ${colors.textMuted}; margin: -${spacing.md}px 0 ${spacing.lg}px; }
        .field { margin-bottom: ${spacing.md}px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
          margin-bottom: ${spacing.xs}px;
        }
        .field input {
          width: 100%;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
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
    <div className="field">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
