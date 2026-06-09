import { memo } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

export const HistoryListItem = memo(function HistoryListItem({ title, subtitle, onPress }: Props) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Text variant="body" numberOfLines={1}>
        {title}
      </Text>
      <Text variant="caption" muted>
        {subtitle}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  item: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
});
