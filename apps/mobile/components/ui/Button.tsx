import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { Text } from "./Text";

type Props = Omit<PressableProps, "style"> & {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  containerStyle,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        containerStyle,
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.ink : colors.gold} />
      ) : (
        <Text
          variant="body"
          style={[styles.label, variant === "primary" && styles.labelPrimary]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: { fontWeight: "600", color: colors.gold },
  labelPrimary: { color: colors.ink },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.gold },
  secondary: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
});
