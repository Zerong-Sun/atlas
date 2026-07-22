import { StyleSheet, View } from "react-native";
import type { Tradition } from "@atlas/shared-types";
import { TRADITION_COLORS, TRADITION_LABELS } from "@/constants/traditions";
import { colors, radius, spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";

type Props = {
  tradition: Tradition;
  selected?: boolean;
  onPress?: () => void;
};

export function TraditionBadge({ tradition, selected }: Props) {
  const accent = TRADITION_COLORS[tradition];
  return (
    <View
      style={[
        styles.badge,
        { borderColor: accent },
        selected && { backgroundColor: accent + "33" },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text variant="caption" style={styles.label}>
        {TRADITION_LABELS[tradition]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { color: colors.parchment },
});
