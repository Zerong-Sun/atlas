import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

const ACTIONS = [
  { href: "/(tabs)/methods", icon: "✦", title: "选择占法", subtitle: "八字 / 塔罗 / 易经" },
  { href: "/methods/bazi", icon: "◇", title: "测八字", subtitle: "四柱、十神、流年" },
  { href: "/methods/tarot", icon: "▵", title: "塔罗抽卡", subtitle: "三牌阵与组合" },
  { href: "/(tabs)/dream", icon: "☽", title: "解梦", subtitle: "输入梦境解析" },
] as const;

export function TodayQuickActions() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text variant="heading">快捷通道</Text>
      <View style={styles.grid}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.href}
            style={styles.card}
            onPress={() => router.push(action.href as never)}
          >
            <Text style={styles.icon}>{action.icon}</Text>
            <Text variant="label">{action.title}</Text>
            <Text variant="caption" muted numberOfLines={2}>
              {action.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.xl, gap: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  card: {
    width: "48%",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  icon: { fontSize: 22, color: colors.gold },
});
