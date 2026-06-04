import { useRouter } from "expo-router";
import { useState } from "react";
import type { Tradition } from "@atlas/shared-types";
import { AskComposer } from "@/components/AskComposer";
import { Screen } from "@/components/ui/Screen";
import { createReading } from "@/lib/api/readings";
import { track } from "@/lib/analytics";

export default function AskScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (text: string, traditions: Tradition[]) => {
    setLoading(true);
    track("reading_start", { traditions: traditions.join(",") });
    try {
      const report = await createReading({ text, traditions });
      track("reading_complete", { readingId: report.readingId });
      router.push({ pathname: "/reading/[id]", params: { id: report.readingId, data: JSON.stringify(report) } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <AskComposer onSubmit={handleSubmit} loading={loading} />
    </Screen>
  );
}
