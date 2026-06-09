import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { buildDreamReportSnapshot } from "@atlas/method-core";
import { DreamCapture } from "@/components/DreamCapture";
import { MethodResultActions } from "@/components/MethodResultActions";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { createDreamEntry, fetchDreamTrend, listDreams, type DreamInterpretation } from "@/lib/api/dreams";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function DreamScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamInterpretation | null>(null);
  const [history, setHistory] = useState<DreamInterpretation[]>([]);
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof fetchDreamTrend>> | null>(null);
  const [dreamText, setDreamText] = useState("");

  useEffect(() => {
    void fetchDreamTrend().then(setTrend);
    void listDreams(20).then(setHistory);
  }, []);

  const copilotReport = useMemo(() => {
    if (!result) return null;
    return buildDreamReportSnapshot(dreamText || result.entryId, result);
  }, [result, dreamText]);
  useRegisterMethodCopilotReport(copilotReport);

  const handleSubmit = useCallback(async (text: string, emotions: string[], symbols: string[]) => {
    setLoading(true);
    setDreamText(text);
    try {
      const interp = await createDreamEntry({ text, emotions, symbols });
      setResult(interp);
      track("dream_save", { entryId: interp.entryId });
      const [updatedTrend, updatedHistory] = await Promise.all([fetchDreamTrend(), listDreams(20)]);
      setTrend(updatedTrend);
      setHistory(updatedHistory);
    } finally {
      setLoading(false);
    }
  }, []);

  const openArchive = useCallback(
    (entry: DreamInterpretation) => {
      router.push({ pathname: "/archive/[id]", params: { id: entry.entryId } });
    },
    [router],
  );

  const listHeader = useMemo(
    () => (
      <View>
        <DreamCapture onSubmit={handleSubmit} loading={loading} result={result} />
        {result ? <MethodResultActions methodId="dream" /> : null}
        {history.length > 0 && (
          <Text variant="heading" style={styles.historyTitle}>
            梦境历史
          </Text>
        )}
      </View>
    ),
    [handleSubmit, loading, result, history.length],
  );

  const listFooter = useMemo(
    () =>
      trend ? (
        <View style={styles.trend}>
          <Text variant="heading">七日趋势</Text>
          <Text variant="body" muted>
            {trend.summary}
          </Text>
          <View style={styles.symbols}>
            {trend.topSymbols.map((s) => (
              <View key={s.symbol} style={styles.symbolChip}>
                <Text variant="caption">
                  {s.symbol} ×{s.count}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null,
    [trend],
  );

  return (
    <Screen scroll={false} padded={false}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.entryId}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        renderItem={({ item }) => (
          <Pressable style={styles.historyItem} onPress={() => openArchive(item)}>
            <Text variant="body" numberOfLines={2}>
              {item.chinese}
            </Text>
            <Text variant="caption" muted>
              {new Date(item.createdAt).toLocaleString("zh-CN")}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  historyTitle: { marginTop: spacing.xl, marginBottom: spacing.sm },
  historyItem: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  trend: { marginTop: spacing.xxl, gap: spacing.md },
  symbols: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  symbolChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
  },
});
