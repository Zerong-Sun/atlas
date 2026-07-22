import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { colors, textVariants, typography } from "@/constants/theme";

type Variant = "title" | "heading" | "body" | "caption" | "label" | "serif";

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  gold?: boolean;
};

export function Text({ variant = "body", muted, gold, style, ...rest }: Props) {
  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        muted && styles.muted,
        gold && styles.gold,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { color: colors.text },
  muted: { color: colors.textSecondary },
  gold: { color: colors.gold },
});

const variantStyles = StyleSheet.create({
  title: { ...textVariants.title, color: colors.mist, fontFamily: typography.serif },
  heading: { ...textVariants.heading, color: colors.text },
  body: { ...textVariants.body, color: colors.text },
  caption: { ...textVariants.caption, color: colors.textSecondary },
  label: { ...textVariants.label, color: colors.goldDim, textTransform: "uppercase" },
  serif: { fontSize: 18, lineHeight: 28, color: colors.mist, fontFamily: typography.serif },
});
