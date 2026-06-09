import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Page } from "@/components/ui/Page";
import { useApp } from "@/context/AppContext";
import { setInterests } from "@/lib/storage";
import { INTEREST_OPTIONS } from "@/theme/traditions";

export function InterestsPage() {
  const navigate = useNavigate();
  const { saveProfile } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const next = async () => {
    await setInterests(selected);
    await saveProfile({ interests: selected });
    navigate("/onboarding/profile");
  };

  return (
    <Page title="你想探索什么？">
      <p className="hint" style={{ margin: "-1rem 0 1.5rem" }}>可多选，帮助我们推荐体系与内容</p>
      <div
        className="interests-grid"
        style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-xl)" }}
      >
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
      <Button title="下一步" onClick={() => void next()} disabled={selected.length === 0} />
    </Page>
  );
}
