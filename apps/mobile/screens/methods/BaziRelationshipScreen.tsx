import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  computeBaziCompatibility,
  type BaziCompatibilityResult,
  type RelationshipContext,
} from "@atlas/engines/bazi";
import { buildBaziRelationshipSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { colors, radius, spacing } from "@/constants/theme";

const TONE_LABELS: Record<string, string> = {
  harmonious: "协调",
  conflict: "需调和",
  neutral: "平和",
  mixed: "动态",
};

const RELATIONSHIP_OPTIONS: Array<{ value: RelationshipContext; label: string }> = [
  { value: "romance", label: "伴侣" },
  { value: "friendship", label: "朋友" },
  { value: "family", label: "家人" },
  { value: "business", label: "同事/合伙人" },
  { value: "general", label: "一般关系" },
];

type PersonForm = {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
};

export function BaziRelationshipScreen() {
  const { profile } = useApp();
  const [personA, setPersonA] = useState<PersonForm>({
    name: profile?.displayName ?? "甲",
    birthDate: profile?.birthDate ?? "",
    birthTime: profile?.birthTime ?? "12:00",
    gender: profile?.gender ?? "male",
  });
  const [personB, setPersonB] = useState<PersonForm>({
    name: "乙",
    birthDate: "",
    birthTime: "12:00",
    gender: "female",
  });
  const [relationshipType, setRelationshipType] = useState<RelationshipContext>("romance");
  const [hasComputed, setHasComputed] = useState(false);

  const filled = Boolean(
    personA.birthDate && personA.birthTime && personB.birthDate && personB.birthTime,
  );

  const result = useMemo<BaziCompatibilityResult | null>(() => {
    if (!filled || !hasComputed) return null;
    try {
      return computeBaziCompatibility({
        personA,
        personB,
        relationshipType,
      });
    } catch {
      return null;
    }
  }, [filled, hasComputed, personA, personB, relationshipType]);

  const showResults = Boolean(hasComputed && filled && result && !result.error);

  const copilotReport = useMemo(
    () =>
      showResults && result
        ? buildBaziRelationshipSnapshot(result, personA.name || "甲", personB.name || "乙")
        : null,
    [showResults, result, personA.name, personB.name],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const compute = () => {
    if (filled) setHasComputed(true);
  };

  return (
    <Screen scroll>
      <MethodHero
        methodId="bazi-relationship"
        kicker="BAZI SYNASTRY"
        title="八字缘合"
        description="输入两人出生信息，交叉比对四柱、日支、五行与十神，观察相处模式与互动倾向。"
      />

      <View style={styles.workbench}>
        <PersonFields label="甲" person={personA} onChange={setPersonA} onEdit={() => setHasComputed(false)} />
        <PersonFields label="乙" person={personB} onChange={setPersonB} onEdit={() => setHasComputed(false)} />

        <Text variant="label">关系类型</Text>
        <View style={styles.chipRow}>
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.chip, relationshipType === opt.value && styles.chipActive]}
              onPress={() => { setRelationshipType(opt.value); setHasComputed(false); }}
            >
              <Text
                variant="caption"
                style={relationshipType === opt.value ? styles.chipTextActive : undefined}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title={hasComputed ? "重新合盘" : "开始合盘"} onPress={compute} disabled={!filled} />
      </View>

      {showResults && result && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{result.summary}</Text>

          <View style={styles.section}>
            <Text variant="label">{personA.name || "甲"}</Text>
            <Text variant="body" muted>{result.personA.summary}</Text>
            <Text variant="body">
              日主 {result.personA.dayMaster}（{result.personA.dayMasterElement}）· {result.personA.strength.level}
            </Text>
            {result.personA.pillarList.map((p) => (
              <Text key={p.key} variant="caption" muted>
                {p.label} {p.value}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text variant="label">{personB.name || "乙"}</Text>
            <Text variant="body" muted>{result.personB.summary}</Text>
            <Text variant="body">
              日主 {result.personB.dayMaster}（{result.personB.dayMasterElement}）· {result.personB.strength.level}
            </Text>
            {result.personB.pillarList.map((p) => (
              <Text key={p.key} variant="caption" muted>
                {p.label} {p.value}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text variant="label">维度分析</Text>
            {result.dimensions.map((dim) => (
              <View key={dim.key} style={styles.dimCard}>
                <Text variant="body">
                  {dim.label}（{TONE_LABELS[dim.tone] ?? dim.tone}）
                </Text>
                <Text variant="body" muted>{dim.detail}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text variant="label">互动模式</Text>
            <Text variant="body">情感：{result.emotionPattern}</Text>
            <Text variant="body">沟通：{result.communicationStyle}</Text>
            <Text variant="body">长期：{result.longTermStability}</Text>
            <Text variant="body">吸引力：{result.attraction}</Text>
          </View>

          {result.highlights.positive.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">积极面</Text>
              {result.highlights.positive.map((h) => (
                <Text key={h} variant="body">+ {h}</Text>
              ))}
            </View>
          )}

          {result.highlights.challenges.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">挑战</Text>
              {result.highlights.challenges.map((h) => (
                <Text key={h} variant="body">− {h}</Text>
              ))}
            </View>
          )}

          {result.repairAdvice.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">修复建议</Text>
              {result.repairAdvice.map((a) => (
                <Text key={a} variant="body">· {a}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

function PersonFields({
  label,
  person,
  onChange,
  onEdit,
}: {
  label: string;
  person: PersonForm;
  onChange: (next: PersonForm) => void;
  onEdit: () => void;
}) {
  const update = (patch: Partial<PersonForm>) => {
    onChange({ ...person, ...patch });
    onEdit();
  };

  return (
    <View style={styles.personCard}>
      <Text variant="heading">{label}</Text>
      <Field label="姓名" value={person.name} onChangeText={(v) => update({ name: v })} />
      <Field label="出生日期 (YYYY-MM-DD)" value={person.birthDate} onChangeText={(v) => update({ birthDate: v })} />
      <Field label="出生时间 (HH:mm)" value={person.birthTime} onChangeText={(v) => update({ birthTime: v })} />
      <Text variant="label">性别</Text>
      <View style={styles.chipRow}>
        {(["male", "female"] as const).map((g) => (
          <Pressable
            key={g}
            style={[styles.chip, person.gender === g && styles.chipActive]}
            onPress={() => update({ gender: g })}
          >
            <Text variant="caption" style={person.gender === g ? styles.chipTextActive : undefined}>
              {g === "male" ? "男" : "女"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
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
  personCard: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
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
  dimCard: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.night,
    gap: spacing.xs,
  },
});
