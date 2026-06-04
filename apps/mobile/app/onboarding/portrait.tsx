import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TRADITION_LABELS } from "@/constants/traditions";
import type { Tradition } from "@atlas/shared-types";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApp } from "@/context/AppContext";
import { fetchPortraitSummary } from "@/lib/api/profile";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function PortraitScreen() {
  const router = useRouter();
  const { completeOnboarding } = useApp();
  const [portrait, setPortrait] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortraitSummary().then(setPortrait).finally(() => setLoading(false));
  }, []);

  const finish = async () => {
    await completeOnboarding();
    router.replace("/(tabs)/ask");
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.gold} style={styles.loader} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text variant="title">多体系画像</Text>
      <Text variant="caption" muted style={styles.sub}>
        基于你的出生档案生成
      </Text>
      <Text variant="caption" style={styles.openNote}>
        全部功能已开放，无需订阅或付费解锁
      </Text>
      {portrait &&
        Object.entries(portrait).map(([key, value]) => (
          <View key={key} style={styles.card}>
            <Text variant="label">{TRADITION_LABELS[key as Tradition] ?? key}</Text>
            <Text variant="body">{value}</Text>
          </View>
        ))}
      <Button title="开始首个问题" onPress={finish} containerStyle={styles.btn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 80 },
  sub: { marginBottom: spacing.sm },
  openNote: { color: colors.gold, marginBottom: spacing.lg },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  btn: { marginTop: spacing.xl },
});
