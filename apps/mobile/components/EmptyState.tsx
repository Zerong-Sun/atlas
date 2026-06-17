import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { colors, spacing } from "@/constants/theme";

type Props = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ message, actionLabel = "返回", onAction }: Props) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text variant="body" muted style={styles.message}>
        {message}
      </Text>
      <Button title={actionLabel} variant="ghost" onPress={onAction ?? (() => router.back())} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  message: { textAlign: "center" },
});
