import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { ReadingReport, Tradition } from "@atlas/shared-types";
import { TRADITION_LABELS } from "@/constants/traditions";
import { colors, spacing } from "@/constants/theme";
import {
  CitationBlock,
  ConsensusCard,
  DivergenceCard,
  TraditionBadge,
} from "@/components/design-system";
import { Text } from "@/components/ui/Text";

type Props = {
  report: ReadingReport;
  headerExtra?: ReactNode;
};

export function ReadingResultView({ report, headerExtra }: Props) {
  const [activeTradition, setActiveTradition] = useState<Tradition | null>(
    report.traditions[0] ?? null
  );

  const summary = report.sections.find((s) => s.type === "summary");
  const advice = report.sections.find((s) => s.type === "advice");
  const cautions = report.sections.find((s) => s.type === "cautions");
  const traditionSections = report.sections.filter((s) => s.type === "tradition_analysis");

  const activeSection = traditionSections.find((s) => s.tradition === activeTradition);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {headerExtra}
      {summary && (
        <View style={styles.summaryBox}>
          <Text variant="label">结论摘要</Text>
          <Text variant="serif" style={styles.summaryText}>
            {summary.content}
          </Text>
        </View>
      )}

      <ConsensusCard content={report.consensus} />
      <DivergenceCard content={report.divergence} />

      <Text variant="heading" style={styles.sectionTitle}>
        各体系解读
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
        {report.traditions.map((t) => (
          <Pressable key={t} style={styles.tabItem} onPress={() => setActiveTradition(t)}>
            <TraditionBadge tradition={t} selected={activeTradition === t} />
          </Pressable>
        ))}
      </ScrollView>
      {activeSection && (
        <View style={styles.traditionCard}>
          <Text variant="label">{TRADITION_LABELS[activeTradition!]}</Text>
          <Text variant="body">{activeSection.content}</Text>
        </View>
      )}

      <Text variant="heading" style={styles.sectionTitle}>
        古籍依据
      </Text>
      {report.citations.map((c) => (
        <CitationBlock key={c.chunkId} citation={c} />
      ))}

      {advice && (
        <View style={styles.block}>
          <Text variant="label">行动建议</Text>
          <Text variant="body">{advice.content}</Text>
        </View>
      )}
      {cautions && (
        <View style={[styles.block, styles.caution]}>
          <Text variant="label">风险提醒</Text>
          <Text variant="caption" muted>
            {cautions.content}
          </Text>
        </View>
      )}
      {report.degraded && (
        <Text variant="caption" gold>
          AI 综合解释（降级模式）
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  summaryBox: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryText: { marginTop: spacing.sm },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md },
  tabs: { marginBottom: spacing.md },
  tabItem: { marginRight: spacing.sm },
  traditionCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  block: { marginTop: spacing.md, gap: spacing.sm },
  caution: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
  },
});
