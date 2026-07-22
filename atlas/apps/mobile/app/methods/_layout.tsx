import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

export default function MethodsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.gold,
        headerTitleStyle: { color: colors.text },
        contentStyle: { backgroundColor: colors.ink },
      }}
    />
  );
}
