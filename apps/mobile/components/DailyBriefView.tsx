import { StyleSheet, View } from "react-native";
import type { DailyBrief } from "@atlas/shared-types";
import { TRADITION_LABELS } from "@/constants/traditions";
import type { Tradition } from "@atlas/shared-types";
import { colors, radius, spacing } from "@/constants/theme";
import { CitationBlock } from "@/components/design-system";
import { Text } from "@/components/ui/Text";

type Props = {
  brief: DailyBrief;
};

export function DailyBriefView({ brief }: Props) {
  return (
    <View style={styles.wrap}>
      <Text variant="title">{brief.theme}</Text>
      <Text variant="caption" muted>
        {brief.date} · 每日诸象
      </Text>

      <View style={styles.grid}>
        {Object.entries(brief.traditionSummaries).map(([key, value]) => (
          <View key={key} style={styles.card}>
            <Text variant="label">{TRADITION_LABELS[key as Tradition] ?? key}</Text>
            <Text variant="body">{value}</Text>
          </View>
        ))}
      </View>

      {brief.classicQuote && (
        <View style={styles.quoteSection}>
          <Text variant="heading" style={styles.sectionTitle}>
            古籍一句
          </Text>
          <CitationBlock citation={brief.classicQuote} defaultExpanded />
        </View>
      )}

      <View style={styles.row}>
        <View style={[styles.listBox, styles.suitable]}>
          <Text variant="label">宜</Text>
          {brief.suitable.map((s) => (
            <Text key={s} variant="body">
              · {s}
            </Text>
          ))}
        </View>
        <View style={[styles.listBox, styles.avoid]}>
          <Text variant="label">忌</Text>
          {brief.avoid.map((s) => (
            <Text key={s} variant="body" muted>
              · {s}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  grid: { gap: spacing.sm, marginTop: spacing.md },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  quoteSection: { marginTop: spacing.lg },
  sectionTitle: { marginBottom: spacing.sm },
  row: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  listBox: { flex: 1, padding: spacing.md, borderRadius: radius.md, gap: spacing.xs },
  suitable: { backgroundColor: colors.consensusBg },
  avoid: { backgroundColor: colors.divergenceBg },
});
