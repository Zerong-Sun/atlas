import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { computeWestern, type WesternResult } from "@atlas/engines/western";
import { buildWesternReportSnapshot } from "@atlas/method-core";
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

export function WesternScreen() {
  const { profile } = useApp();
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(profile?.birthTime ?? "12:00");
  const [birthLat,setBirthLat]=useState(String(profile?.birthLat ?? 39.9042));
  const [birthLng,setBirthLng]=useState(String(profile?.birthLng ?? 116.4074));
  const [timezone,setTimezone]=useState("8");
  const [showTransits, setShowTransits] = useState(false);
  const [computed, setComputed] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const result = useMemo<WesternResult | null>(() => {
    if (!birthDate || !computed) return null;
    const r = computeWestern({
      birthDate,
      birthTime, birthLat:Number(birthLat),birthLng:Number(birthLng),timezone,
      timestamp: showTransits ? new Date().toISOString() : undefined,
    });
    if ("error" in r) return null;
    return r as WesternResult;
  }, [birthDate,birthTime,birthLat,birthLng,timezone,computed,showTransits]);

  const copilotReport = useMemo(
    () => (result ? buildWesternReportSnapshot(result) : null),
    [result],
  );
  const payload = useMemo(() => {
    if (!result) return null;
    return {
      methodId: "western" as const,
      inputs: { birthDate,birthTime,birthLat,birthLng,timezone,showTransits },
      result,
    };
  }, [result,birthDate,birthTime,birthLat,birthLng,timezone,showTransits]);

  usePersistMethodReading({
    snapshot: copilotReport,
    payload,
    ready: Boolean(result),
    entryId: entryId ?? undefined,
  });

  const generate = () => {
    if (!birthDate) return;
    setError(null);
    const r = computeWestern({
      birthDate,
      birthTime, birthLat:Number(birthLat),birthLng:Number(birthLng),timezone,
      timestamp: showTransits ? new Date().toISOString() : undefined,
    });
    if ("error" in r) {
      setError(String(r.message??"请填写有效的出生日期后再生成星盘。"));
      setComputed(false);
      return;
    }
    setEntryId(buildMethodReadingEntryId("western"));
    setComputed(true);
  };

  return (
    <Screen scroll>
      <MethodHero
        activityKey={entryId}
        methodId="western"
        kicker="WESTERN ASTROLOGY"
        title="西洋占星"
        description="本命盘、Whole Sign 宫位、相位与行运推运。符号框架用于自我认识，非科学必然性。"
      />

      <View style={styles.workbench}>
        <Field label="出生日期 (YYYY-MM-DD)" value={birthDate} onChangeText={(v) => { setBirthDate(v); setComputed(false); }} />
        <Field label="出生时间 (HH:mm)" value={birthTime} onChangeText={(v) => { setBirthTime(v); setComputed(false); }} />
        <Text variant="caption">整宫制 · 默认北京坐标与 UTC+8。地点改变时请填写实际经纬度及出生当天时差。</Text>
        <Field label="纬度（北正南负）" value={birthLat} onChangeText={v=>{setBirthLat(v);setComputed(false);}}/>
        <Field label="经度（东正西负）" value={birthLng} onChangeText={v=>{setBirthLng(v);setComputed(false);}}/>
        <Field label="UTC 时差（含夏令时）" value={timezone} onChangeText={v=>{setTimezone(v);setComputed(false);}}/>
        <Pressable
          style={styles.toggleRow}
          onPress={() => { setShowTransits((v) => !v); setComputed(false); }}
        >
          <View style={[styles.checkbox, showTransits && styles.checkboxOn]} />
          <Text variant="body">包含当前行运与次限推运</Text>
        </Pressable>
        {error && <Text variant="caption" style={styles.error}>{error}</Text>}
        <Button title="生成星盘" onPress={generate} disabled={!birthDate} />
      </View>

      {result && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{result.summary}</Text>

          <View style={styles.section}>
            <Text variant="label">行星落座</Text>
            {result.planetList.map((p) => (
              <View key={p.key} style={styles.planetRow}>
                <Text variant="body">
                  {p.label} {p.sign} {p.degree}° · {p.houseName}
                </Text>
                <Text variant="caption" muted>{p.meaning}</Text>
              </View>
            ))}
          </View>

          {result.aspects && result.aspects.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">主要相位</Text>
              {result.aspects.slice(0, 10).map((a, i) => (
                <Text key={`${a.planetA}-${a.planetB}-${i}`} variant="body" muted>
                  {a.planetA} {a.aspect} {a.planetB}
                </Text>
              ))}
            </View>
          )}

          {result.transits && result.transits.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">行运</Text>
              {result.transits.slice(0, 8).map((t, i) => (
                <Text key={`${t.transitPlanet}-${t.natalPlanet}-${i}`} variant="body" muted>
                  {t.transitPlanet} {t.aspect} {t.natalPlanet} — {t.reading}
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
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkboxOn: { backgroundColor: colors.gold, borderColor: colors.gold },
  error: { color: colors.danger },
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
  planetRow: { gap: 2, paddingVertical: spacing.xs },
});
