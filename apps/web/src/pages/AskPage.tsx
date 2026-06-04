import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tradition } from "@atlas/shared-types";
import { AskComposer } from "@/components/AskComposer";
import { TarotDrawPanel } from "@/components/TarotDrawPanel";
import { Page } from "@/components/ui/Page";
import { createReading } from "@/lib/api/readings";

export function AskPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (text: string, traditions: Tradition[]) => {
    setLoading(true);
    setError(null);
    try {
      const report = await createReading({ text, traditions });
      navigate(`/reading/${report.readingId}`, { state: { report } });
    } catch {
      setError("生成对照报告失败，请检查网络后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <TarotDrawPanel onUseSpread={(question) => handleSubmit(question, ["tarot"])} loading={loading} />
      <AskComposer onSubmit={handleSubmit} loading={loading} />
    </Page>
  );
}
