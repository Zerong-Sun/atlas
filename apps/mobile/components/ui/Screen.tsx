import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";

type Props = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  transparent?: boolean;
};

export function Screen({ children, scroll, padded = true, transparent = false, style, ...rest }: Props) {
  const content = (
    <View style={[padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, transparent && styles.safeTransparent]} edges={["top"]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink },
  safeTransparent: { backgroundColor: "transparent" },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  padded: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
});
