import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  label: string;
  glyph?: string;
  subtitle?: string;
  revealed?: boolean;
  onPress?: () => void;
};

export function FlipCard({ label, glyph, subtitle, revealed = true, onPress }: Props) {
  return (
    <Pressable style={[styles.card, !revealed && styles.hidden]} onPress={onPress} disabled={!onPress}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="heading">{revealed ? (glyph ?? "?") : "◆"}</Text>
      {subtitle && revealed ? (
        <Text variant="caption" numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 96,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.xs,
  },
  hidden: { opacity: 0.6 },
});

export function CardDrawTable({ children }: { children: ReactNode }) {
  return <View style={tableStyles.row}>{children}</View>;
}

const tableStyles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.md },
});
