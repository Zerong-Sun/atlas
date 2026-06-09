import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Palace = {
  position: number;
  direction?: string;
  door?: string;
  star?: string;
  deity?: string;
};

type Props = {
  palaces?: Palace[];
  dun?: string;
  ju?: number;
};

const GRID_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

export function QimenBoard({ palaces = [], dun, ju }: Props) {
  return (
    <View style={styles.wrap}>
      {dun || ju != null ? (
        <Text variant="caption" muted>
          {dun} · 第{ju}局
        </Text>
      ) : null}
      <View style={styles.grid}>
        {GRID_ORDER.map((pos) => {
          const p = palaces.find((x) => x.position === pos);
          return (
            <View key={pos} style={styles.cell}>
              <Text variant="caption" muted>
                {p?.direction ?? pos}
              </Text>
              <Text variant="caption">{p?.door ?? "—"}</Text>
              <Text variant="caption" muted>
                {p?.star ?? ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginVertical: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  cell: {
    width: "31%",
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
});
