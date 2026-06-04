import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";

type Props = {
  content: string;
};

export function DivergenceCard({ content }: Props) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text variant="label" style={styles.label}>
        分歧
      </Text>
      <Text variant="body" style={styles.body}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.divergenceBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.divergence,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: { color: colors.divergence, marginBottom: spacing.sm },
  body: { color: colors.parchment, lineHeight: 26 },
});
