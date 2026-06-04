import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useApp } from "@/context/AppContext";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function ProfileOnboardingScreen() {
  const router = useRouter();
  const { saveProfile } = useApp();
  const [birthDate, setBirthDate] = useState("1990-01-01");
  const [birthTime, setBirthTime] = useState("12:00");
  const [birthPlace, setBirthPlace] = useState("北京");

  const next = async () => {
    await saveProfile({
      birthDate,
      birthTime,
      birthPlace,
      timezone: "Asia/Shanghai",
    });
    track("onboarding_profile");
    router.push("/onboarding/portrait");
  };

  return (
    <Screen scroll>
      <Text variant="title">创建出生档案</Text>
      <Text variant="caption" muted style={styles.sub}>
        用于排盘与个性化（全功能开放，无额度限制）
      </Text>
      <Field label="出生日期 (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} />
      <Field label="出生时间 (HH:mm)" value={birthTime} onChangeText={setBirthTime} />
      <Field label="出生地点" value={birthPlace} onChangeText={setBirthPlace} />
      <Button title="生成画像摘要" onPress={next} containerStyle={styles.btn} />
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sub: { marginBottom: spacing.lg },
  field: { marginBottom: spacing.md, gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  btn: { marginTop: spacing.lg },
});
