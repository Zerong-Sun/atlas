import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppProvider, useApp } from "@/context/AppContext";
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
        <Stack.Screen name="reading/[id]" options={{ headerShown: true, title: "对照报告" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
});
