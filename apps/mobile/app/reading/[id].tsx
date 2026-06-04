import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import type { ReadingReport } from "@atlas/shared-types";
import { ReadingResultView } from "@/components/ReadingResultView";
import { colors } from "@/constants/theme";

export default function ReadingResultScreen() {
  const { data } = useLocalSearchParams<{ id: string; data?: string }>();

  const report = useMemo<ReadingReport | null>(() => {
    if (!data) return null;
    try {
      return JSON.parse(data) as ReadingReport;
    } catch {
      return null;
    }
  }, [data]);

  if (!report) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "对照报告",
          headerStyle: { backgroundColor: colors.ink },
          headerTintColor: colors.gold,
        }}
      />
      <ReadingResultView report={report} />
    </>
  );
}
