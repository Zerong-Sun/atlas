import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  const pathname = usePathname();
  const isToday = pathname === "/" || pathname === "/index" || pathname === "(tabs)";

  const glassStyle = {
    backgroundColor: "rgba(11, 16, 32, 0.58)",
    borderTopColor: "rgba(196, 165, 116, 0.22)",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarStyle: isToday
          ? glassStyle
          : {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: isToday ? colors.mistMuted : colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "今日",
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: "提问",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="methods"
        options={{
          title: "占法",
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dream"
        options={{
          title: "梦境",
          tabBarIcon: ({ color, size }) => <Ionicons name="moon-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "档案",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="library" options={{ href: null }} />
    </Tabs>
  );
}
