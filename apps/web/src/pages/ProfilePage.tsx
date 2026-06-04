import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ReadingReport, Tradition } from "@atlas/shared-types";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { useApp } from "@/context/AppContext";
import { listReadings } from "@/lib/api/readings";
import { track } from "@/lib/analytics";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

export function ProfilePage() {
  const { profile, saveProfile } = useApp();
  const [history, setHistory] = useState<ReadingReport[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? "");
  const [birthPlace, setBirthPlace] = useState(profile?.birthPlace ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listReadings().then(setHistory);
  }, []);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBirthDate(profile.birthDate ?? "");
      setBirthTime(profile.birthTime ?? "");
      setBirthPlace(profile.birthPlace ?? "");
    }
  }, [profile]);

  const disabled = profile?.disabledTraditions ?? [];
  const historyStats = getHistoryStats(history);

  const toggleTradition = async (t: Tradition) => {
    const next = disabled.includes(t) ? disabled.filter((x) => x !== t) : [...disabled, t];
    await saveProfile({ disabledTraditions: next });
  };

  const saveProfileFields = async () => {
    setSaving(true);
    try {
      await saveProfile({ displayName, birthDate, birthTime, birthPlace });
      setEditing(false);
      track("profile_update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="档案">
      <div className="card">
        <div className="card-header">
          <span className="label">个人档案</span>
          <button type="button" className="edit-link" onClick={() => setEditing((e) => !e)}>
            {editing ? "取消" : "编辑"}
          </button>
        </div>
        {editing ? (
          <div className="edit-form">
            <Field label="姓名" value={displayName} onChange={setDisplayName} placeholder="您的称呼" />
            <Field label="出生日期" value={birthDate} onChange={setBirthDate} placeholder="YYYY-MM-DD" />
            <Field label="出生时间" value={birthTime} onChange={setBirthTime} placeholder="HH:mm" />
            <Field label="出生地点" value={birthPlace} onChange={setBirthPlace} placeholder="城市" />
            <Button title="保存" onClick={saveProfileFields} loading={saving} />
          </div>
        ) : (
          <>
            <p className="name">{profile?.displayName ?? "未设置姓名"}</p>
            <p>
              {profile?.birthDate ?? "—"} {profile?.birthTime ?? ""}
            </p>
            <p className="muted">{profile?.birthPlace ?? "未设置地点"}</p>
          </>
        )}
      </div>

      <h3>体系偏好</h3>
      <p className="hint">关闭的体系不会出现在默认选择中</p>
      {READING_TRADITIONS.map((t) => (
        <label key={t} className="row">
          <span>{TRADITION_LABELS[t]}</span>
          <input
            type="checkbox"
            checked={!disabled.includes(t)}
            onChange={() => toggleTradition(t)}
          />
        </label>
      ))}

      <h3>历史报告</h3>
      {history.length > 0 && (
        <section className="history-visual" aria-label="历史报告体系分布">
          <div className="history-ring">
            <strong>{history.length}</strong>
            <span>报告</span>
          </div>
          <div className="history-bars">
            {READING_TRADITIONS.map((t) => (
              <div key={t} className="history-bar">
                <span>{TRADITION_LABELS[t]}</span>
                <i style={{ width: `${barWidth(historyStats[t], history.length)}%` }} />
                <em>{historyStats[t]}</em>
              </div>
            ))}
          </div>
        </section>
      )}
      {history.length === 0 ? (
        <p className="muted">暂无记录，去「提问」生成第一份对照报告</p>
      ) : (
        history.map((r) => (
          <Link key={r.readingId} to={`/reading/${r.readingId}`} state={{ report: r }} className="history-item">
            <p>
              {r.sections.find((s) => s.type === "summary")?.content.slice(0, 40) ?? "对照报告"}
            </p>
            <span className="muted">
              {new Date(r.createdAt).toLocaleDateString("zh-CN")} · {r.traditions.length} 体系
            </span>
          </Link>
        ))
      )}

      <style>{`
        .card {
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border-radius: ${radius.md}px;
          margin-bottom: ${spacing.xl}px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: ${spacing.xs}px;
        }
        .card .label {
          font-size: 12px;
          font-weight: 600;
          color: ${colors.gold};
        }
        .edit-link {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: ${colors.gold};
          cursor: pointer;
        }
        .edit-form { margin-top: ${spacing.sm}px; }
        .card .name { font-size: 18px; font-weight: 600; margin: 0 0 4px; }
        .card p { margin: 4px 0; }
        h3 { font-size: 20px; margin: ${spacing.xl}px 0 ${spacing.sm}px; }
        .hint { font-size: 13px; color: ${colors.textMuted}; margin: 0 0 ${spacing.md}px; }
        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: ${spacing.sm}px 0;
          border-bottom: 1px solid ${colors.border};
        }
        .history-item {
          display: block;
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border-radius: ${radius.md}px;
          margin-top: ${spacing.sm}px;
        }
        .history-visual {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: ${spacing.md}px;
          align-items: center;
          padding: ${spacing.md}px;
          background: ${colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          margin-bottom: ${spacing.md}px;
        }
        .history-ring {
          width: 96px;
          aspect-ratio: 1;
          border-radius: 50%;
          display: grid;
          place-content: center;
          text-align: center;
          background:
            radial-gradient(circle at center, ${colors.surface} 0 58%, transparent 59%),
            conic-gradient(${colors.gold} 0 100%);
        }
        .history-ring strong { color: ${colors.gold}; font-size: 24px; line-height: 1; }
        .history-ring span { color: ${colors.textMuted}; font-size: 12px; }
        .history-bars { display: flex; flex-direction: column; gap: ${spacing.sm}px; }
        .history-bar {
          display: grid;
          grid-template-columns: 76px 1fr 24px;
          gap: ${spacing.sm}px;
          align-items: center;
          font-size: 13px;
        }
        .history-bar span { color: ${colors.textSecondary}; }
        .history-bar i {
          display: block;
          height: 8px;
          border-radius: ${radius.full}px;
          background: ${colors.goldDim};
        }
        .history-bar em { color: ${colors.textMuted}; font-style: normal; text-align: right; }
        .history-item p { margin: 0 0 ${spacing.xs}px; }
        .muted { color: ${colors.textMuted}; font-size: 13px; }
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
          background: ${colors.surfaceElevated ?? colors.surface};
          border: 1px solid ${colors.border};
          border-radius: ${radius.md}px;
          padding: ${spacing.md}px;
          color: ${colors.text};
        }
      `}</style>
    </Page>
  );
}

function getHistoryStats(history: ReadingReport[]): Record<Tradition, number> {
  const stats = Object.fromEntries(READING_TRADITIONS.map((t) => [t, 0])) as Record<Tradition, number>;
  for (const report of history) {
    for (const tradition of report.traditions) {
      if (tradition in stats) stats[tradition] += 1;
    }
  }
  return stats;
}

function barWidth(value: number, total: number): number {
  if (total <= 0 || value <= 0) return 6;
  return Math.max(10, Math.round((value / total) * 100));
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
