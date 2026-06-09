import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  planet?: { name: string; symbol?: string };
  sign?: { name: string; symbol?: string };
  house?: { name: string; number?: number };
  phase?: string;
};

export function AstrologyDice({ planet, sign, house, phase }: Props) {
  const rolling = phase === "rolling";
  return (
    <View style={styles.row}>
      <Die label="行星" value={rolling ? "…" : `${planet?.symbol ?? ""} ${planet?.name ?? "—"}`} />
      <Die label="星座" value={rolling ? "…" : `${sign?.symbol ?? ""} ${sign?.name ?? "—"}`} />
      <Die label="宫位" value={rolling ? "…" : house?.name ?? "—"} />
    </View>
  );
}

function Die({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.die}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="label" style={styles.value}>
        {value.trim()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, marginVertical: spacing.md },
  die: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.xs,
  },
  value: { textAlign: "center" },
});
