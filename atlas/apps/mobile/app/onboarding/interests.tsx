import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { INTEREST_OPTIONS } from "@/constants/traditions";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApp } from "@/context/AppContext";
import { setInterests } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function InterestsScreen() {
  const router = useRouter();
  const { saveProfile } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    track("onboarding_start");
  }, []);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const next = async () => {
    await setInterests(selected);
    await saveProfile({ interests: selected });
    track("onboarding_interests", { count: selected.length });
    router.push("/onboarding/profile");
  };

  return (
    <Screen scroll>
      <Text variant="title">你想探索什么？</Text>
      <Text variant="body" muted style={styles.sub}>
        可多选，帮助我们推荐体系与内容
      </Text>
      <View style={styles.grid}>
        {INTEREST_OPTIONS.map((opt) => (
          <Pressable
            key={opt.id}
            style={[styles.chip, selected.includes(opt.id) && styles.chipOn]}
            onPress={() => toggle(opt.id)}
          >
            <Text variant="body">{opt.label}</Text>
          </Pressable>
        ))}
      </View>
      <Button title="下一步" onPress={next} disabled={selected.length === 0} containerStyle={styles.btn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: spacing.sm, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.gold, backgroundColor: colors.surfaceElevated },
  btn: { marginTop: spacing.xl },
});
