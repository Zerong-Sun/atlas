import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { listMethodReadings, methodReadingPreview, type MethodReadingRecord } from "@/lib/methodReadings";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  methodId?: string;
  limit?: number;
  title?: string;
};

export function MethodReadingHistory({ methodId, limit = 6, title = "占卜记录" }: Props) {
  const router = useRouter();
  const [items, setItems] = useState<MethodReadingRecord[]>([]);

  const load = useCallback(async () => {
    const entries = await listMethodReadings({ methodId, limit });
    setItems(entries.filter((entry) => entry.payload || entry.source === "method" || entry.source === "module"));
  }, [methodId, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const open = (entry: MethodReadingRecord) => {
    router.push({ pathname: "/archive/[id]", params: { id: entry.id } });
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text variant="label">{title}</Text>
        <Text variant="caption" muted>
          完成占卜后会在这里保留最近 {limit} 次记录，方便复盘。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text variant="label">{title}</Text>
      {items.map((item) => (
        <Pressable key={item.id} style={styles.row} onPress={() => open(item)}>
          <Text variant="caption" muted>
            {new Date(item.createdAt).toLocaleString("zh-CN", {
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text variant="body" numberOfLines={1}>
            {methodReadingPreview(item)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.xl,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  empty: {
    marginTop: spacing.xl,
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    gap: 2,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
