import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PortraitSummary, Tradition } from "@atlas/shared-types";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { useApp } from "@/context/AppContext";
import { fetchPortraitSummary } from "@/lib/api/profile";
import { TRADITION_LABELS } from "@/theme/traditions";

export function PortraitPage() {
  const navigate = useNavigate();
  const { completeOnboarding, profile, saveProfile } = useApp();
  const [portrait, setPortrait] = useState<PortraitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.birthDate) {
      setError("请先填写出生档案。");
      setLoading(false);
      return;
    }
    fetchPortraitSummary(profile)
      .then(async (summary) => {
        setPortrait(summary);
        await saveProfile({ portraitSummary: summary });
      })
      .catch(() => setError("画像生成失败，请稍后重试。"))
      .finally(() => setLoading(false));
  }, [profile, saveProfile]);

  const finish = async () => {
    await completeOnboarding();
    navigate("/ask", { replace: true });
  };

  if (loading) {
    return (
      <Page>
        <p style={{ color: "var(--color-gold)", marginTop: 80, textAlign: "center", fontFamily: "var(--font-mono)" }}>
          正在生成多体系画像…
        </p>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="多体系画像">
        <p className="error-banner" role="alert">
          {error}
        </p>
        <Button title="返回填写档案" onClick={() => navigate("/onboarding/profile")} />
      </Page>
    );
  }

  return (
    <Page title="多体系画像">
      <p className="hint" style={{ margin: "-1rem 0 0.5rem" }}>
        基于你的出生档案生成
      </p>
      <p className="open-note">全部功能已开放，无需订阅或付费解锁</p>
      {portrait?.consensus && (
        <div className="portrait-card portrait-card--consensus">
          <span className="label">共同主题</span>
          <p>{portrait.consensus}</p>
        </div>
      )}
      {portrait?.traditions &&
        Object.entries(portrait.traditions).map(([key, value]) => (
          <div key={key} className="portrait-card">
            <span className="label">{TRADITION_LABELS[key as Tradition] ?? key}</span>
            <p>{value}</p>
          </div>
        ))}
      {portrait?.divergence && (
        <div className="portrait-card portrait-card--divergence">
          <span className="label">明显分歧</span>
          <p>{portrait.divergence}</p>
        </div>
      )}
      <Button title="开始首个问题" onClick={() => void finish()} />
    </Page>
  );
}
