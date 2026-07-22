import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { Text } from "@/components/ui/Text";

type Props = {
  content: string;
};

export function ConsensusCard({ content }: Props) {
  return (
    <View style={styles.card} accessibilityRole="summary">
      <Text variant="label" style={styles.label}>
        共识
      </Text>
      <Text variant="body" style={styles.body}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.consensusBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.consensus,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: { color: colors.consensus, marginBottom: spacing.sm },
  body: { color: colors.parchment, lineHeight: 26 },
});
