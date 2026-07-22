import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { DailyBrief, Tradition } from "@atlas/shared-types";
import { CitationBlock } from "@/components/design-system";
import { Text } from "@/components/ui/Text";
import { TRADITION_COLORS, TRADITION_LABELS } from "@/constants/traditions";
import { buildEntryId, colors, formatEntryLabel, radius, resolveDayColor, spacing, typography } from "@/theme/tokens";
import { dayFieldPalette } from "@/components/DailyColorField";

type Props = { brief: DailyBrief };

export function DailyBriefView({ brief }: Props) {
  const [expanded, setExpanded] = useState(false);
  const traditions = Object.entries(brief.traditionSummaries);
  const preview = traditions[0]?.[1];
  const entryId = buildEntryId(brief.date);
  const entryLabel = formatEntryLabel(brief.date);
  const palette = dayFieldPalette(brief.date);

  const onDay = palette.textOnDay;
  const onDayMuted = palette.textMuted;
  const slipBg = palette.slipBg;

  return (
    <View style={styles.wrap}>
      {/* Fortune Slip header */}
      <View style={[styles.slip, { backgroundColor: slipBg }]}>
        <View style={styles.perforation} />
        <Text style={[styles.mono, { color: onDayMuted }]}>{entryId}</Text>
        <Text style={[styles.mono, { color: onDayMuted, marginBottom: spacing.sm }]}>{entryLabel}</Text>
        <Text style={[styles.mono, styles.labelEn, { color: colors.gold }]}>FIELD THEME</Text>
        <Text style={[styles.theme, { color: onDay }]}>{brief.theme}</Text>
        {!expanded && preview ? (
          <Text style={[styles.preview, { color: onDay }]}>{preview}</Text>
        ) : null}
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          style={[styles.expandBtn, { borderColor: onDayMuted }]}
          accessibilityRole="button"
          accessibilityLabel={expanded ? "收起观测" : "展开观测"}
          accessibilityState={{ expanded }}
        >
          <Text style={[styles.mono, { color: onDay, marginBottom: 0 }]}>
            {expanded ? "收起观测 · COLLAPSE" : "展开观测 · EXPAND LOG"}
          </Text>
        </Pressable>
      </View>

      {/* Observation log — only when expanded */}
      {expanded && (
        <View style={styles.logPanel}>
          {/* Tradition summaries */}
          <View style={styles.section}>
            <Text style={[styles.mono, styles.sectionLabel]}>OBSERVATION LOG</Text>
            <Text style={[styles.zhLabel, { color: onDay }]}>每日诸象</Text>
            {traditions.map(([key, value]) => (
              <View
                key={key}
                style={[
                  styles.obsItem,
                  { borderLeftColor: TRADITION_COLORS[key as Tradition] ?? colors.goldDim },
                ]}
              >
                <Text style={[styles.mono, { color: onDayMuted, marginBottom: 2 }]}>
                  {TRADITION_LABELS[key as Tradition] ?? key} · NOTE
                </Text>
                <Text style={[styles.obsBody, { color: onDay }]}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Classic quote */}
          {brief.classicQuote && (
            <View style={styles.section}>
              <Text style={[styles.mono, styles.sectionLabel]}>PRIMARY SOURCE</Text>
              <Text style={[styles.zhLabel, { color: onDay }]}>古籍一句</Text>
              <CitationBlock citation={brief.classicQuote} defaultExpanded={false} />
            </View>
          )}

          {/* Suitable / avoid */}
          <View style={styles.conductRow}>
            <View style={styles.conductCol}>
              <Text style={[styles.mono, styles.sectionLabel]}>FAVORABLE</Text>
              <Text style={[styles.zhLabel, { color: onDay }]}>宜</Text>
              {brief.suitable.map((s) => (
                <Text key={s} style={[styles.listItem, { color: onDay }]}>· {s}</Text>
              ))}
            </View>
            <View style={[styles.conductCol, styles.conductDivider]}>
              <Text style={[styles.mono, styles.sectionLabel]}>REFRAIN</Text>
              <Text style={[styles.zhLabel, { color: onDay }]}>忌</Text>
              {brief.avoid.map((s) => (
                <Text key={s} style={[styles.listItem, { color: onDayMuted }]}>· {s}</Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Footer decoration */}
      <Text style={[styles.mono, styles.footerMeta, { color: onDayMuted }]} accessibilityElementsHidden>
        COORD · 31.2°N 121.5°E · {palette.day.nameEn.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
    maxWidth: 360,
    alignSelf: "center",
    width: "100%",
    paddingBottom: spacing.xl,
  },
  slip: {
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.slipBorder,
    overflow: "hidden",
  },
  perforation: {
    height: 4,
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.slipBorder,
    opacity: 0.75,
  },
  mono: {
    fontFamily: typography.mono,
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: spacing.xs,
  },
  labelEn: {
    color: colors.gold,
    marginTop: spacing.md,
  },
  theme: {
    fontFamily: typography.serif,
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  preview: {
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  expandBtn: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  logPanel: {
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.gold,
    marginBottom: spacing.xs,
  },
  zhLabel: {
    fontFamily: typography.sans,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  obsItem: {
    borderLeftWidth: 2,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: "transparent",
  },
  obsBody: {
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 24,
  },
  conductRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  conductCol: {
    flex: 1,
    gap: spacing.xs,
  },
  conductDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(154, 171, 184, 0.3)",
    paddingLeft: spacing.md,
  },
  listItem: {
    fontFamily: typography.serif,
    fontSize: 14,
    lineHeight: 22,
  },
  footerMeta: {
    textAlign: "center",
    marginTop: spacing.md,
    opacity: 0.5,
    marginBottom: 0,
  },
});
