import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { computeBazi, interpretBazi, type BaziResult } from "@atlas/engines/bazi";
import { buildBaziReportSnapshot } from "@atlas/method-core";
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

export function BaziScreen() {
  const { profile } = useApp();
  const [name, setName] = useState(profile?.displayName ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? "12:00");
  const [gender, setGender] = useState<"male" | "female">(profile?.gender ?? "male");
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [hasComputed, setHasComputed] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  const filled = Boolean(birthDate && birthTime);

  const result = useMemo<BaziResult | null>(() => {
    if (!filled || !hasComputed) return null;
    try {
      return computeBazi({
        birthDate,
        birthTime,
        gender,
        timestamp: new Date().toISOString(),
      });
    } catch {
      return null;
    }
  }, [birthDate, birthTime, gender, filled, hasComputed]);

  const interpretation = useMemo(() => {
    if (!result || result.error) return null;
    const year = Number(selectedYear);
    return interpretBazi(result, { selectedYear: Number.isFinite(year) ? year : undefined });
  }, [result, selectedYear]);

  const showResults = Boolean(hasComputed && filled && result && !result.error);

  const copilotReport = useMemo(
    () => (showResults && result ? buildBaziReportSnapshot(result, interpretation, name) : null),
    [showResults, result, interpretation, name],
  );
  const payload = useMemo(() => {
    if (!showResults || !result) return null;
    return {
      methodId: "bazi" as const,
      inputs: { name, birthDate, birthTime, gender, selectedYear },
      result: { result, interpretation },
    };
  }, [showResults, result, interpretation, name, birthDate, birthTime, gender, selectedYear]);

  usePersistMethodReading({
    snapshot: copilotReport,
    payload,
    ready: showResults,
    entryId: entryId ?? undefined,
  });

  const compute = () => {
    if (filled) {
      setEntryId(buildMethodReadingEntryId("bazi"));
      setHasComputed(true);
    }
  };

  return (
    <Screen scroll>
      <MethodHero
        methodId="bazi"
        kicker="BAZI CHART"
        title="八字命盘"
        description="输入出生日期与时间，生成四柱八字、十神、五行分析、大运流年与性格解读。"
      />

      <View style={styles.workbench}>
        <Field label="姓名" value={name} onChangeText={setName} placeholder="输入姓名" />
        <Field label="出生日期 (YYYY-MM-DD)" value={birthDate} onChangeText={(v) => { setBirthDate(v); setHasComputed(false); }} />
        <Field label="出生时间 (HH:mm)" value={birthTime} onChangeText={(v) => { setBirthTime(v); setHasComputed(false); }} />
        <Text variant="label">性别</Text>
        <View style={styles.chipRow}>
          {(["male", "female"] as const).map((g) => (
            <Pressable
              key={g}
              style={[styles.chip, gender === g && styles.chipActive]}
              onPress={() => { setGender(g); setHasComputed(false); }}
            >
              <Text variant="caption" style={gender === g ? styles.chipTextActive : undefined}>
                {g === "male" ? "男" : "女"}
              </Text>
            </Pressable>
          ))}
        </View>
        <Field
          label="流年（选年）"
          value={selectedYear}
          onChangeText={setSelectedYear}
          placeholder={String(new Date().getFullYear())}
        />
        <Button title={hasComputed ? "重新排盘" : "开始排盘"} onPress={compute} disabled={!filled} />
      </View>

      {showResults && result && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{result.summary}</Text>
          <Text variant="body" muted>
            农历 {result.lunarDate} · 生肖 {result.zodiac}
          </Text>
          <Text variant="body" muted>
            格局 {result.pattern.name} · 日主 {result.strength.level}（{result.strength.score}）
          </Text>

          <View style={styles.section}>
            <Text variant="label">四柱</Text>
            {result.pillarList.map((pillar) => (
              <Text key={pillar.key} variant="body">
                {pillar.label} {pillar.value}（{pillar.stem}·{pillar.tenGod} / {pillar.branch}）
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text variant="label">五行</Text>
            {result.elementAnalysis.map((e) => (
              <Text key={e.element} variant="body">
                {e.element} {e.count}个（{e.percentage}%）— {e.interpretation}
              </Text>
            ))}
          </View>

          {result.combinations.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">合冲</Text>
              {result.combinations.map((c) => (
                <Text key={c} variant="body">· {c}</Text>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text variant="label">性格 · {result.personality.archetype}</Text>
            {result.personality.traits.map((t) => (
              <Text key={t} variant="body">· {t}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text variant="label">人生分析</Text>
            <Text variant="body">事业：{result.aspects.career}</Text>
            <Text variant="body">财运：{result.aspects.wealth}</Text>
            <Text variant="body">感情：{result.aspects.relationship}</Text>
            <Text variant="body">健康：{result.aspects.health}</Text>
          </View>

          <View style={styles.section}>
            <Text variant="label">大运</Text>
            {result.majorLuck.slice(0, 6).map((c) => (
              <Text key={c.startAge} variant="body">
                {c.startAge}-{c.endAge}岁 {c.pillar}（{c.tenGod}）{c.summary ? ` — ${c.summary}` : ""}
              </Text>
            ))}
          </View>

          {interpretation && (
            <View style={styles.section}>
              <Text variant="label">规则解读</Text>
              <Text variant="body">{interpretation.summary}</Text>
              {interpretation.matchedCombos.map((r) => (
                <Text key={r.id} variant="body" muted>
                  {r.name}：{r.meaning}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text variant="label">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
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
});
