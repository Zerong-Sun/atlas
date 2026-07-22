import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";

type Props = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  transparent?: boolean;
  keyboardAware?: boolean;
  keyboardVerticalOffset?: number;
};

export function Screen({
  children,
  scroll,
  padded = true,
  transparent = false,
  keyboardAware = true,
  keyboardVerticalOffset = 0,
  style,
  ...rest
}: Props) {
  const content = (
    <View style={[!scroll && styles.flex, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={[styles.safe, transparent && styles.safeTransparent]} edges={["top"]}>
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink },
  safeTransparent: { backgroundColor: "transparent" },
  flex: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  padded: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
});
