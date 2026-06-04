import { Stack } from "expo-router";
import { colors } from "@/constants/theme";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.gold,
        contentStyle: { backgroundColor: colors.ink },
      }}
    >
      <Stack.Screen name="interests" options={{ title: "选择兴趣" }} />
      <Stack.Screen name="profile" options={{ title: "出生档案" }} />
      <Stack.Screen name="portrait" options={{ title: "多体系画像" }} />
    </Stack>
  );
}
