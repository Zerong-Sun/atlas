import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { colors, typography } from "@/constants/theme";

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
  title: { ...typography.title, color: colors.parchment, fontFamily: typography.serif },
  heading: { ...typography.heading, color: colors.text },
  body: { ...typography.body, color: colors.text },
  caption: { ...typography.caption, color: colors.textSecondary },
  label: { ...typography.label, color: colors.goldDim, textTransform: "uppercase" },
  serif: { fontSize: 18, lineHeight: 28, color: colors.parchment, fontFamily: typography.serif },
});
