import { Stack, useLocalSearchParams } from "expo-router";
import { View, StyleSheet } from "react-native";
import { getMethod } from "@atlas/method-data";
import { METHOD_SCREENS } from "@/screens/methods";
import { Text } from "@/components/ui/Text";
import { colors, spacing } from "@/constants/theme";

export default function MethodDetailScreen() {
  const { methodId } = useLocalSearchParams<{ methodId: string }>();
  const method = methodId ? getMethod(methodId) : undefined;
  const Screen = methodId ? METHOD_SCREENS[methodId] : undefined;

  if (!methodId || !Screen) {
    return (
      <View style={styles.missing}>
        <Text variant="body" muted>
          未找到该占法页面。
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: method?.title ?? methodId, headerShown: true }} />
      <Screen />
    </>
  );
}

const styles = StyleSheet.create({
  missing: { flex: 1, backgroundColor: colors.ink, padding: spacing.lg, justifyContent: "center" },
});
