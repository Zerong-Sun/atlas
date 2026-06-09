import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  message?: string;
};

export function LlmSetupHint({
  message = "未配置 LLM 时将使用内置模板。前往设置 → LLM 连接 填写 API Key 以启用 AI 解读。",
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text variant="caption" style={styles.text}>
        {message}
      </Text>
      <Pressable onPress={() => router.push("/(tabs)/settings")}>
        <Text variant="caption" style={styles.link}>
          前往设置
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  text: { color: colors.textSecondary },
  link: { color: colors.gold },
});
