import { Pressable, StyleSheet } from "react-native";
import { getMethodExperience } from "@atlas/method-data";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  variant?: "open" | "analyze";
  label?: string;
  methodId?: string;
};

export function MethodCopilotTrigger({ variant = "analyze", label, methodId = "methods" }: Props) {
  const { openCopilot } = useMethodCopilot();
  const experience = getMethodExperience(methodId);
  const text = label ?? (variant === "analyze" ? "AI 解析报告" : "打开解说");

  return (
    <Pressable
      style={[styles.btn, { borderColor: experience.accentColor }]}
      onPress={() => openCopilot(variant === "analyze" ? "analyze" : undefined)}
    >
      <Text style={{ color: experience.accentColor }}>{experience.glyph}</Text>
      <Text variant="label">{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
});
