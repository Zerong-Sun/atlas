import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { computeFengshui, type FengshuiResult } from "@atlas/engines/fengshui";
import { buildFengshuiReportSnapshot } from "@atlas/method-core";
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

function birthYearFromProfile(birthDate?: string): string {
  if (!birthDate) return "";
  const year = birthDate.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "";
}

export function FengshuiScreen() {
  const { profile } = useApp();
  const [sittingDegree, setSittingDegree] = useState("0");
  const [birthYear, setBirthYear] = useState(birthYearFromProfile(profile?.birthDate));
  const [computed, setComputed] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);

  const degree = Number(sittingDegree);
  const validDegree = Number.isFinite(degree) ? ((degree % 360) + 360) % 360 : 0;

  const result = useMemo<FengshuiResult | null>(() => {
    if (!computed) return null;
    return computeFengshui({
      sittingDegree: validDegree,
      birthYear: birthYear ? Number(birthYear) : undefined,
    });
  }, [validDegree, birthYear, computed]);

  const copilotReport = useMemo(
    () => (result ? buildFengshuiReportSnapshot(result) : null),
    [result],
  );
  const payload = useMemo(() => {
    if (!result) return null;
    return {
      methodId: "fengshui" as const,
      inputs: { sittingDegree: validDegree, birthYear },
      result,
    };
  }, [result, validDegree, birthYear]);

  usePersistMethodReading({
    snapshot: copilotReport,
    payload,
    ready: Boolean(result),
    entryId: entryId ?? undefined,
  });

  return (
    <Screen scroll>
      <MethodHero
        methodId="fengshui"
        kicker="FENG SHUI"
        title="风水罗盘"
        description="坐向、玄空九宫飞星与流年重点。解读为空间象征参考，重大决策请结合建筑规范。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">坐向度数 (0–359)</Text>
          <TextInput
            value={sittingDegree}
            onChangeText={(v) => { setSittingDegree(v); setComputed(false); }}
            keyboardType="numeric"
          />
          <Text variant="caption" muted>
            0° 为正北，90° 为正东，180° 为正南，270° 为正西
          </Text>
        </View>
        <View style={styles.field}>
          <Text variant="label">出生年（可选，命卦）</Text>
          <TextInput
            value={birthYear}
            onChangeText={(v) => { setBirthYear(v); setComputed(false); }}
            keyboardType="numeric"
            placeholder="1990"
          />
        </View>
        <Button
          title="排飞星盘"
          onPress={() => {
            setEntryId(buildMethodReadingEntryId("fengshui"));
            setComputed(true);
          }}
        />
      </View>

      {result && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{result.summary}</Text>
          <Text variant="body" muted>
            坐向 {result.sittingMountain} · 向 {result.facingMountain} · 第 {result.period} 运
          </Text>
          {result.mingGua && (
            <Text variant="body" muted>
              命卦 {result.mingGua.gua} · {result.mingGua.group}
            </Text>
          )}

          <View style={styles.section}>
            <Text variant="label">九宫飞星</Text>
            {result.palaces.map((p) => (
              <Text key={p.position} variant="body">
                {p.direction}：山星 {p.mountainStar} / 向星 {p.facingStar}（流年 {p.annualStar}）— {p.combined}
              </Text>
            ))}
          </View>

          {result.advice.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">建议</Text>
              {result.advice.map((a) => (
                <Text key={a} variant="body">· {a}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  workbench: { gap: spacing.md, marginTop: spacing.lg },
  field: { gap: spacing.xs },
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
