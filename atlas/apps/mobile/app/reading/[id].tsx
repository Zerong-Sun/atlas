import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import type { ReadingReport } from "@atlas/shared-types";
import { buildReadingReportSnapshot } from "@atlas/method-core";
import { ReadingResultView } from "@/components/ReadingResultView";
import { MethodResultActions } from "@/components/MethodResultActions";
import { EmptyState } from "@/components/EmptyState";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { listReadings } from "@/lib/api/readings";
import { getReadingHistory } from "@/lib/storage";
import { colors, spacing } from "@/constants/theme";

export default function ReadingResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<ReadingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const remote = await listReadings();
      const found = remote.find((r) => r.readingId === id);
      if (found) {
        if (!cancelled) setReport(found);
        return;
      }
      const local = await getReadingHistory();
      if (!cancelled) setReport(local.find((r) => r.readingId === id) ?? null);
    }
    void load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const copilotReport = useMemo(() => (report ? buildReadingReportSnapshot(report) : null), [report]);
  useRegisterMethodCopilotReport(copilotReport, report ? { readingReport: report } : undefined);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!report) {
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
        <EmptyState message="未找到该对照报告，可能已被清除或尚未同步。" onAction={() => router.back()} />
      </>
    );
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
      <ReadingResultView
        report={report}
        headerExtra={<MethodResultActions methodId={report.traditions[0] ?? undefined} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
});
