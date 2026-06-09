import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import type { ReadingReport } from "@atlas/shared-types";
import { buildReadingReportSnapshot } from "@atlas/method-core";
import { ReadingResultView } from "@/components/ReadingResultView";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { listReadings } from "@/lib/api/readings";
import { getReadingHistory } from "@/lib/storage";
import { colors, spacing } from "@/constants/theme";

export default function ReadingResultScreen() {
  const { id, data } = useLocalSearchParams<{ id: string; data?: string }>();
  const [report, setReport] = useState<ReadingReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (data) {
        try {
          const parsed = JSON.parse(data) as ReadingReport;
          if (!cancelled) setReport(parsed);
          return;
        } catch {
          /* fall through */
        }
      }
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
  }, [id, data]);

  const copilotReport = useMemo(() => (report ? buildReadingReportSnapshot(report) : null), [report]);
  useRegisterMethodCopilotReport(copilotReport, report ? { readingReport: report } : undefined);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!report) return null;

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
  center: { flex: 1, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", padding: spacing.lg },
});
