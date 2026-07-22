import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Line = { position: number; isYang: boolean; label?: string };

type Props = {
  lines: Line[];
  title?: string;
};

export function HexagramLines({ lines, title }: Props) {
  return (
    <View style={styles.wrap}>
      {title ? <Text variant="label">{title}</Text> : null}
      {lines.map((line) => (
        <View key={line.position} style={styles.row}>
          <Text variant="caption" muted>
            {line.position}
          </Text>
          <View style={[styles.line, line.isYang ? styles.yang : styles.yin]} />
          <Text variant="caption">{line.isYang ? "阳" : "阴"}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  line: { flex: 1, height: 6, borderRadius: 3 },
  yang: { backgroundColor: colors.gold },
  yin: { backgroundColor: colors.border, borderWidth: 1, borderColor: colors.goldDim },
});
