import {
  StyleSheet,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { colors, radius, spacing } from "@/constants/theme";

type Props = TextInputProps & {
  inputStyle?: StyleProp<TextStyle>;
};

export function TextInput({ style, inputStyle, placeholderTextColor, multiline, ...rest }: Props) {
  return (
    <RNTextInput
      style={[styles.input, multiline && styles.textArea, inputStyle, style]}
      placeholderTextColor={placeholderTextColor ?? colors.textMuted}
      multiline={multiline}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  textArea: { minHeight: 88, textAlignVertical: "top" },
});
