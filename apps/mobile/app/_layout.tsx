import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/context/AppContext";
import { MethodCopilotProvider } from "@/context/MethodCopilotContext";
import { MethodCopilot } from "@/components/MethodCopilot";
import { colors } from "@/constants/theme";

function RootNavigator() {
  const { ready, onboardingDone } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!onboardingDone && !inOnboarding) {
      router.replace("/onboarding/interests");
    } else if (onboardingDone && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [ready, onboardingDone, segments, router]);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="methods" />
        <Stack.Screen name="library" options={{ headerShown: true, title: "书库" }} />
        <Stack.Screen name="reading/[id]" options={{ headerShown: true, title: "对照报告" }} />
        <Stack.Screen name="archive/[id]" options={{ headerShown: true, title: "归档详情" }} />
      </Stack>
      <MethodCopilot />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppProvider>
        <MethodCopilotProvider>
          <RootNavigator />
        </MethodCopilotProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
});
