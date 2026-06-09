import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { buildReadingReportSnapshot } from "@atlas/method-core";
import { MethodResultActions } from "@/components/MethodResultActions";
import { ReadingResultView } from "@/components/ReadingResultView";
import { Text } from "@/components/ui/Text";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { archiveEntryLabel, getArchiveEntry, type ArchiveEntry } from "@/lib/archive";
import { colors, radius, spacing } from "@/constants/theme";

export default function ArchiveEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entry, setEntry] = useState<ArchiveEntry | null>(null);

  useEffect(() => {
    if (!id) return;
    void getArchiveEntry(id).then(setEntry);
  }, [id]);

  const copilotReport = useMemo(() => {
    if (!entry) return null;
    if (entry.readingReport) return buildReadingReportSnapshot(entry.readingReport);
    return {
      entryId: entry.id,
      source: entry.source,
      methodId: entry.methodId,
      title: entry.title,
      summary: entry.summary,
      body: entry.body,
      generatedAt: entry.createdAt,
    };
  }, [entry]);

  useRegisterMethodCopilotReport(copilotReport, entry?.readingReport ? { readingReport: entry.readingReport } : undefined);

  if (!entry) return null;

  return (
    <>
      <Stack.Screen options={{ title: archiveEntryLabel(entry) }} />
      {entry.readingReport ? (
        <ReadingResultView report={entry.readingReport} />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text variant="caption" muted>
            {new Date(entry.createdAt).toLocaleString("zh-CN")}
          </Text>
          {entry.summary ? <Text variant="heading">{entry.summary}</Text> : null}
          <MethodResultActions methodId={entry.methodId ?? undefined} />
          <View style={styles.body}>
            <Text variant="body">{entry.body}</Text>
          </View>
          {entry.interpretation?.map((turn, i) => (
            <View key={i} style={styles.turn}>
              <Text variant="label">{turn.role === "user" ? "问" : "答"}</Text>
              <Text variant="body">{turn.content}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.ink },
  content: { padding: spacing.lg, gap: spacing.md },
  body: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  turn: { gap: spacing.xs, padding: spacing.sm },
});
