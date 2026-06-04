import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tradition } from "@atlas/shared-types";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { useApp } from "@/context/AppContext";
import { fetchPortraitSummary } from "@/lib/api/profile";
import { TRADITION_LABELS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

export function PortraitPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useApp();
  const [portrait, setPortrait] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortraitSummary().then(setPortrait).finally(() => setLoading(false));
  }, []);

  const finish = async () => {
    await completeOnboarding();
    navigate("/ask", { replace: true });
  };

  if (loading) {
    return (
      <Page>
        <p style={{ color: colors.gold, marginTop: 80, textAlign: "center" }}>加载中…</p>
      </Page>
    );
  }

  return (
    <Page title="多体系画像">
      <p className="hint">基于你的出生档案生成</p>
      <p className="open-note">全部功能已开放，无需订阅或付费解锁</p>
      {portrait &&
        Object.entries(portrait).map(([key, value]) => (
          <div key={key} className="card">
            <span className="label">{TRADITION_LABELS[key as Tradition] ?? key}</span>
            <p>{value}</p>
          </div>
        ))}
      <Button title="开始首个问题" onClick={finish} />
      <style>{`
        .hint { color: ${colors.textMuted}; margin: -${spacing.md}px 0 ${spacing.sm}px; }
        .open-note { color: ${colors.gold}; font-size: 13px; margin: 0 0 ${spacing.lg}px; }
        .card {
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border-radius: ${radius.md}px;
          margin-bottom: ${spacing.sm}px;
        }
        .card .label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
          margin-bottom: ${spacing.xs}px;
        }
        .card p { margin: 0; line-height: 1.5; }
      `}</style>
    </Page>
  );
}
