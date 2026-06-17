import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { computeZiwei, type ZiweiResult } from "@atlas/engines/ziwei";
import { buildZiweiReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { usePersistMethodReading } from "@/hooks/usePersistMethodReading";
import { buildMethodReadingEntryId } from "@/lib/methodReadings";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { colors, radius, spacing } from "@/constants/theme";

export function ZiweiScreen() {
  const { profile } = useApp();
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? "12:00");
  const [gender, setGender] = useState<"male" | "female">(profile?.gender ?? "male");
  const [computed, setComputed] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  const result = useMemo<ZiweiResult | null>(() => {
    if (!birthDate || !computed) return null;
    return computeZiwei({ birthDate, birthTime, gender });
  }, [birthDate, birthTime, gender, computed]);

  const copilotReport = useMemo(
    () => (result?.palaces.length ? buildZiweiReportSnapshot(result) : null),
    [result],
  );
  const payload = useMemo(() => {
    if (!result?.palaces.length) return null;
    return {
      methodId: "ziwei" as const,
      inputs: { birthDate, birthTime, gender },
      result,
    };
  }, [result, birthDate, birthTime, gender]);

  usePersistMethodReading({
    snapshot: copilotReport,
    payload,
    ready: Boolean(result?.palaces.length),
    entryId: entryId ?? undefined,
  });

  return (
    <Screen scroll>
      <MethodHero
        methodId="ziwei"
        kicker="ZI WEI DOU SHU"
        title="紫微斗数"
        description="十二宫、主星辅星、四化与大限流年。三合派排盘，供趋势反思而非宿命断言。"
      />

      <View style={styles.workbench}>
        <Field label="出生日期 (YYYY-MM-DD)" value={birthDate} onChangeText={(v) => { setBirthDate(v); setComputed(false); }} />
        <Field label="出生时辰 (HH:mm)" value={birthTime} onChangeText={(v) => { setBirthTime(v); setComputed(false); }} />
        <Text variant="label">性别</Text>
        <View style={styles.chipRow}>
          {(["male", "female"] as const).map((g) => (
            <Pressable
              key={g}
              style={[styles.chip, gender === g && styles.chipActive]}
              onPress={() => { setGender(g); setComputed(false); }}
            >
              <Text variant="caption" style={gender === g ? styles.chipTextActive : undefined}>
                {g === "male" ? "男" : "女"}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          title="排紫微命盘"
          onPress={() => {
            setEntryId(buildMethodReadingEntryId("ziwei"));
            setComputed(true);
          }}
          disabled={!birthDate}
        />
      </View>

      {result && result.palaces.length > 0 && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{result.summary}</Text>
          <Text variant="body" muted>
            {result.lunarDate} · {result.chineseDate} · {result.fiveElementsClass}
          </Text>
          <Text variant="body" muted>
            命宫 {result.soulPalace} · 身宫 {result.bodyPalace}
          </Text>

          <View style={styles.section}>
            <Text variant="label">十二宫</Text>
            {result.palaces.map((p) => (
              <View key={p.index} style={styles.palaceRow}>
                <Text variant="body">
                  {p.name}
                  {p.isSoul ? "（命宫）" : ""}
                  {p.isBody ? "（身宫）" : ""}
                  ：{p.majorStars.map((s) => s.name).join(" ") || "空宫"}
                </Text>
                {p.mutagens.length > 0 && (
                  <Text variant="caption" muted>
                    {p.mutagens.map((m) => `${m.star}化${m.type}`).join(" · ")}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {result.decadals.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">大限</Text>
              {result.decadals.slice(0, 8).map((d) => (
                <Text key={d.index} variant="body" muted>
                  {d.range[0]}-{d.range[1]}岁 · {d.palace}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
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
      <TextInput value={value} onChangeText={onChangeText} />
    </View>
  );
}

const styles = StyleSheet.create({
  workbench: { gap: spacing.md, marginTop: spacing.lg },
  field: { gap: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.gold, backgroundColor: colors.surfaceElevated },
  chipTextActive: { color: colors.gold },
  result: {
    marginTop: spacing.xl,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  section: { gap: spacing.xs },
  palaceRow: { gap: 2, paddingVertical: spacing.xs },
});
