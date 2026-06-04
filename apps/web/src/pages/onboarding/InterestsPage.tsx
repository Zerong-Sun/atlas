import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { setInterests } from "@/lib/storage";
import { INTEREST_OPTIONS } from "@/theme/traditions";
import { colors, radius, spacing } from "@/theme/tokens";

export function InterestsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const next = () => {
    setInterests(selected);
    navigate("/onboarding/profile");
  };

  return (
    <Page title="你想探索什么？">
      <p className="hint">可多选，帮助我们推荐体系与内容</p>
      <div className="grid">
        {INTEREST_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`chip${selected.includes(opt.id) ? " on" : ""}`}
            onClick={() => toggle(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Button title="下一步" onClick={next} disabled={selected.length === 0} />
      <style>{`
        .hint { color: ${colors.textMuted}; margin: -${spacing.md}px 0 ${spacing.lg}px; }
        .grid {
          display: flex;
          flex-wrap: wrap;
          gap: ${spacing.sm}px;
          margin-bottom: ${spacing.xl}px;
        }
        .chip {
          padding: ${spacing.md}px ${spacing.lg}px;
          border-radius: ${radius.md}px;
          border: 1px solid ${colors.border};
          background: ${colors.surface};
          color: ${colors.text};
        }
        .chip.on { border-color: ${colors.gold}; background: ${colors.surfaceElevated}; }
      `}</style>
    </Page>
  );
}
