import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

export type PalaceCell = {
  key: string;
  label: string;
  sublabel?: string;
  highlight?: boolean;
  onPress?: () => void;
};

type Props = {
  cells: PalaceCell[];
  columns?: number;
};

export function PalaceGrid({ cells, columns = 3 }: Props) {
  return (
    <View style={[styles.grid, { gap: spacing.xs }]}>
      {cells.map((cell) => (
        <Pressable
          key={cell.key}
          style={[
            styles.cell,
            { width: `${100 / columns - 2}%` as unknown as number },
            cell.highlight && styles.highlight,
          ]}
          onPress={cell.onPress}
        >
          <Text variant="caption" style={styles.label}>
            {cell.label}
          </Text>
          {cell.sublabel ? (
            <Text variant="caption" muted numberOfLines={2}>
              {cell.sublabel}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.md },
  cell: {
    minWidth: "30%",
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  highlight: { borderColor: colors.gold },
  label: { color: colors.gold },
});
