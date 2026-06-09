import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

export type JiaobeiPhase = "idle" | "tossing" | "landed";

type Props = {
  phase: JiaobeiPhase;
  leftYang?: boolean;
  rightYang?: boolean;
};

export function JiaobeiCups({ phase, leftYang, rightYang }: Props) {
  return (
    <View style={styles.row}>
      <Cup label="左筊" face={phase === "tossing" ? "…" : leftYang == null ? "?" : leftYang ? "阳" : "阴"} />
      <Cup label="右筊" face={phase === "tossing" ? "…" : rightYang == null ? "?" : rightYang ? "阳" : "阴"} />
    </View>
  );
}

function Cup({ label, face }: { label: string; face: string }) {
  return (
    <View style={styles.cup}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="title">{face}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md, justifyContent: "center", marginVertical: spacing.lg },
  cup: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.goldDim,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
});
