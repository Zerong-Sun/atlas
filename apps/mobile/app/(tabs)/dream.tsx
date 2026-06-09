import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
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

  const handleSubmit = async (text: string, emotions: string[], symbols: string[]) => {
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
  };

  const openArchive = (entry: DreamInterpretation) => {
    router.push({ pathname: "/archive/[id]", params: { id: entry.entryId } });
  };

  return (
    <Screen scroll>
      <DreamCapture onSubmit={handleSubmit} loading={loading} result={result} />
      {result ? <MethodResultActions methodId="dream" /> : null}

      {history.length > 0 && (
        <View style={styles.history}>
          <Text variant="heading">梦境历史</Text>
          {history.map((entry) => (
            <Pressable key={entry.entryId} style={styles.historyItem} onPress={() => openArchive(entry)}>
              <Text variant="body" numberOfLines={2}>
                {entry.chinese}
              </Text>
              <Text variant="caption" muted>
                {new Date(entry.createdAt).toLocaleString("zh-CN")}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {trend && (
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
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  history: { marginTop: spacing.xl, gap: spacing.sm },
  historyItem: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
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
