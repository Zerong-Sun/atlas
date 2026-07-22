import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { getMethodGuideSeen, setMethodGuideSeen } from "@/lib/methodWorkbenchPrefs";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  methodId: string;
  steps: string[];
};

export function MethodGuideCard({ methodId, steps }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getMethodGuideSeen(methodId).then((seen) => {
      if (mounted) setVisible(!seen);
    });
    return () => {
      mounted = false;
    };
  }, [methodId]);

  const close = () => {
    setVisible(false);
    void setMethodGuideSeen(methodId, true);
  };

  if (!visible) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text variant="label">使用教程</Text>
        <Pressable onPress={close} hitSlop={10}>
          <Text variant="caption" gold>
            已了解
          </Text>
        </Pressable>
      </View>
      {steps.map((step, index) => (
        <Text key={step} variant="caption" muted style={styles.step}>
          {index + 1}. {step}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: "row", justifyContent: "space-between", gap: spacing.md },
  step: { lineHeight: 20 },
});
