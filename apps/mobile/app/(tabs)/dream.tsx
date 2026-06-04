import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { DreamCapture } from "@/components/DreamCapture";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { createDreamEntry, fetchDreamTrend, type DreamInterpretation } from "@/lib/api/dreams";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function DreamScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamInterpretation | null>(null);
  const [trend, setTrend] = useState<Awaited<ReturnType<typeof fetchDreamTrend>> | null>(null);

  useEffect(() => {
    fetchDreamTrend().then(setTrend);
  }, []);

  const handleSubmit = async (text: string, emotions: string[], symbols: string[]) => {
    setLoading(true);
    try {
      const interp = await createDreamEntry({ text, emotions, symbols });
      setResult(interp);
      track("dream_save", { entryId: interp.entryId });
      const updated = await fetchDreamTrend();
      setTrend(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <DreamCapture onSubmit={handleSubmit} loading={loading} result={result} />
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
  trend: { marginTop: spacing.xxl, gap: spacing.md },
  symbols: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  symbolChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
  },
});
