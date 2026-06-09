import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { computeQimen, interpretQimen } from "@atlas/engines/qimen";
import type { QimenJuMethod } from "@atlas/shared-types";
import { buildQimenReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { colors, radius, spacing } from "@/constants/theme";

const QUESTION_TYPES = [
  "事业项目",
  "财务经营",
  "关系合作",
  "出行迁移",
  "考试文书",
  "健康修复",
] as const;

type PredictionWindow = "时" | "日" | "旬" | "月";

function formatTimestampInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function QimenScreen() {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState<string>(QUESTION_TYPES[0]);
  const [predictionWindow, setPredictionWindow] = useState<PredictionWindow>("日");
  const [juMethod, setJuMethod] = useState<QimenJuMethod>("chaibu");
  const [timestamp, setTimestamp] = useState(() => formatTimestampInput(new Date()));
  const [computeKey, setComputeKey] = useState(0);

  const chart = useMemo(() => {
    if (computeKey === 0) return null;
    const parsed = new Date(timestamp.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return null;
    return computeQimen({
      timestamp: parsed.toISOString(),
      juMethod,
    });
  }, [computeKey, timestamp, juMethod]);

  const interpretation = useMemo(() => {
    if (!chart) return null;
    return interpretQimen(chart, { questionType, predictionWindow });
  }, [chart, questionType, predictionWindow]);

  const copilotReport = useMemo(
    () =>
      chart && interpretation
        ? buildQimenReportSnapshot(question, questionType, chart, interpretation)
        : null,
    [chart, interpretation, question, questionType],
  );
  useRegisterMethodCopilotReport(copilotReport);

  return (
    <Screen scroll>
      <MethodHero
        methodId="qimen"
        kicker="QIMEN DUNJIA"
        title="奇门遁甲"
        description="时家奇门排盘：定局、取用神、识格局、看应期。拆补/置闰双口径可切换。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">所问事项</Text>
          <TextInput value={question} onChangeText={setQuestion} multiline />
        </View>

        <Text variant="label">事项类型</Text>
        <View style={styles.chipRow}>
          {QUESTION_TYPES.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, questionType === t && styles.chipActive]}
              onPress={() => setQuestionType(t)}
            >
              <Text variant="caption" style={questionType === t ? styles.chipTextActive : undefined}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Field
          label="起局时间 (YYYY-MM-DD HH:mm)"
          value={timestamp}
          onChangeText={setTimestamp}
        />

        <Text variant="label">预测窗口</Text>
        <View style={styles.chipRow}>
          {(["时", "日", "旬", "月"] as const).map((w) => (
            <Pressable
              key={w}
              style={[styles.chip, predictionWindow === w && styles.chipActive]}
              onPress={() => setPredictionWindow(w)}
            >
              <Text variant="caption" style={predictionWindow === w ? styles.chipTextActive : undefined}>
                {w}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text variant="label">排盘口径</Text>
        <View style={styles.chipRow}>
          {([
            { id: "chaibu" as const, label: "拆补法" },
            { id: "zhirun" as const, label: "置闰法" },
          ]).map((m) => (
            <Pressable
              key={m.id}
              style={[styles.chip, juMethod === m.id && styles.chipActive]}
              onPress={() => setJuMethod(m.id)}
            >
              <Text variant="caption" style={juMethod === m.id ? styles.chipTextActive : undefined}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title="起局排盘" onPress={() => setComputeKey((k) => k + 1)} />
      </View>

      {chart && interpretation && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">
            {chart.dun}{chart.ju}局 · {chart.yuan} · {chart.solarTerm}
          </Text>
          <Text variant="body">{interpretation.summary}</Text>
          <Text variant="body" muted>
            四柱 {chart.pillars.year} {chart.pillars.month} {chart.pillars.day} {chart.pillars.hour}
          </Text>
          <Text variant="body" muted>
            值符 {chart.zhiFu} @ {chart.zhiFuPalace} · 值使 {chart.zhiShi} @ {chart.zhiShiPalace}
          </Text>
          {chart.kongWang.length > 0 && (
            <Text variant="body" muted>空亡：{chart.kongWang.join("、")}</Text>
          )}

          <View style={styles.section}>
            <Text variant="label">九宫</Text>
            {chart.palaces.map((p) => (
              <Text key={p.palace} variant="body" muted>
                {p.palace}：{p.heavenStem}/{p.earthStem} · {p.door} · {p.star} · {p.god}
              </Text>
            ))}
          </View>

          {interpretation.matchedPatterns.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">格局</Text>
              {interpretation.matchedPatterns.map((p) => (
                <Text key={p.id} variant="body">
                  {p.name}：{p.meaning}
                </Text>
              ))}
            </View>
          )}

          {interpretation.relations.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">关系</Text>
              {interpretation.relations.map((r) => (
                <Text key={r.id} variant="body" muted>
                  {r.name}：{r.meaning}
                </Text>
              ))}
            </View>
          )}

          {interpretation.timingWindows.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">应期</Text>
              {interpretation.timingWindows.map((t) => (
                <Text key={t.label} variant="body" muted>
                  {t.label}（{t.range}）：{t.basis}
                </Text>
              ))}
            </View>
          )}

          {interpretation.directionAdvice && (
            <View style={styles.section}>
              <Text variant="label">方位</Text>
              <Text variant="body">
                {interpretation.directionAdvice.palace} · {interpretation.directionAdvice.direction} — {interpretation.directionAdvice.spatial}
              </Text>
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
});
