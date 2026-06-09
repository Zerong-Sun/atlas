import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { TRADITION_LABELS } from "@/constants/traditions";
import type { PortraitSummary, Tradition } from "@atlas/shared-types";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApp } from "@/context/AppContext";
import { fetchPortraitSummary } from "@/lib/api/profile";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function PortraitScreen() {
  const router = useRouter();
  const { completeOnboarding, profile, saveProfile } = useApp();
  const [portrait, setPortrait] = useState<PortraitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.birthDate) {
      setError("请先填写出生档案。");
      setLoading(false);
      return;
    }
    fetchPortraitSummary(profile)
      .then(async (summary) => {
        setPortrait(summary);
        await saveProfile({ portraitSummary: summary });
      })
      .catch(() => setError("画像生成失败，请稍后重试。"))
      .finally(() => setLoading(false));
  }, [profile, saveProfile]);

  const finish = async () => {
    await completeOnboarding();
    track("onboarding_complete");
    router.replace("/(tabs)/ask");
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.gold} style={styles.loader} />
        <Text variant="caption" muted style={styles.loaderText}>
          正在生成多体系画像…
        </Text>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen scroll>
        <Text variant="title">多体系画像</Text>
        <Text variant="body" style={styles.error}>
          {error}
        </Text>
        <Button title="返回填写档案" onPress={() => router.push("/onboarding/profile")} />
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
      {portrait?.consensus && (
        <View style={[styles.card, styles.consensus]}>
          <Text variant="label">共同主题</Text>
          <Text variant="body">{portrait.consensus}</Text>
        </View>
      )}
      {portrait?.traditions &&
        Object.entries(portrait.traditions).map(([key, value]) => (
          <View key={key} style={styles.card}>
            <Text variant="label">{TRADITION_LABELS[key as Tradition] ?? key}</Text>
            <Text variant="body">{value}</Text>
          </View>
        ))}
      {portrait?.divergence && (
        <View style={styles.card}>
          <Text variant="label">明显分歧</Text>
          <Text variant="body">{portrait.divergence}</Text>
        </View>
      )}
      <Button title="开始首个问题" onPress={finish} containerStyle={styles.btn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 80 },
  loaderText: { textAlign: "center", marginTop: spacing.md },
  sub: { marginBottom: spacing.sm },
  openNote: { color: colors.gold, marginBottom: spacing.lg },
  error: { color: colors.gold, marginVertical: spacing.lg },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  consensus: { borderColor: colors.goldDim, borderWidth: 1 },
  btn: { marginTop: spacing.xl },
});
