import { useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import {
  throwJiaobei,
  getJiaobeiOutcomeLabel,
  type JiaobeiThrow,
} from "@atlas/engines/jiaobei";
import { buildJiaobeiReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

const MAX_THROWS = 3;
type Phase = "idle" | "tossing" | "landed";

function cupLabel(face: "yin" | "yang") {
  return face === "yang" ? "阳" : "阴";
}

export function JiaobeiScreen() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [throws, setThrows] = useState<JiaobeiThrow[]>([]);
  const [current, setCurrent] = useState<JiaobeiThrow | null>(null);
  const [revisionMode, setRevisionMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastOutcome = throws[throws.length - 1]?.outcome;
  const canThrow = throws.length < MAX_THROWS && phase !== "tossing" && !revisionMode;
  const holyCount = throws.filter((t) => t.outcome === "holy").length;
  const threeHoly = holyCount === 3;
  const lastLaugh = lastOutcome === "laugh";
  const lastYin = lastOutcome === "yin";

  const copilotReport = useMemo(() => {
    if (!throws.length || phase !== "landed") return null;
    return buildJiaobeiReportSnapshot(question, throws);
  }, [throws, question, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const toss = () => {
    if (!canThrow) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("tossing");
    setCurrent(null);

    timerRef.current = setTimeout(() => {
      const next = throwJiaobei({
        seed: `${Date.now()}-${question}-${throws.length + 1}`,
        question: question.trim() || undefined,
        throwIndex: throws.length + 1,
      });
      setCurrent(next);
      setThrows((prev) => [...prev, next]);
      setPhase("landed");
      if (next.outcome === "laugh") setRevisionMode(true);
    }, 900);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setThrows([]);
    setCurrent(null);
    setRevisionMode(false);
    setPhase("idle");
  };

  const retryAfterLaugh = () => {
    if (!question.trim()) return;
    reset();
  };

  const tossTitle =
    phase === "tossing" ? "掷筊中…" : `掷筊（${throws.length}/${MAX_THROWS}）`;

  return (
    <Screen scroll>
      <MethodHero
        methodId="jiaobei"
        kicker="JIAOBEI"
        title="掷筊问卦"
        description="双筊抛掷，圣杯允准、笑杯重问、阴杯暂停。一事一问，同一问题最多三掷。"
      />

      <View style={styles.workbench}>
        <View style={[styles.questionWrap, revisionMode && styles.questionRevise]}>
          <Text variant="label">问句（宜是非明确）</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholder="例如：此事当前是否宜推进？"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {revisionMode && (
          <View style={styles.revisionPanel}>
            <Text variant="heading">笑杯：问句需要校准</Text>
            <Text variant="body" muted>
              神明示意问题尚未问准。请把问句改得更清楚、更具体（宜是非判断），然后重新掷筊。
            </Text>
            <Text variant="caption" muted>
              · 避免一次问多件不相干的事{"\n"}· 用「是否」「能否」等可回答的是非句{"\n"}·
              写明时间范围或具体情境
            </Text>
            <Button
              title="问句已修正，重新掷筊"
              onPress={retryAfterLaugh}
              disabled={!question.trim()}
            />
          </View>
        )}

        <View style={styles.actions}>
          {!revisionMode && (
            <Button title={tossTitle} onPress={toss} disabled={!canThrow || lastYin} />
          )}
          {throws.length > 0 && (
            <Button title="重新问事" variant="secondary" onPress={reset} />
          )}
        </View>
      </View>

      <View style={styles.cupsDisplay}>
        <Text variant="label">筊杯</Text>
        {phase === "tossing" ? (
          <Text variant="heading" style={styles.cupsGlyph}>
            ◐ ◑
          </Text>
        ) : current ? (
          <>
            <Text variant="heading" style={styles.cupsGlyph}>
              {current.cups[0] === "yang" ? "●" : "○"} {current.cups[1] === "yang" ? "●" : "○"}
            </Text>
            <Text variant="heading" gold>
              {getJiaobeiOutcomeLabel(current.outcome)}
            </Text>
            <Text variant="caption" muted>
              {cupLabel(current.cups[0])} / {cupLabel(current.cups[1])}
            </Text>
          </>
        ) : (
          <Text variant="body" muted>
            等待掷筊
          </Text>
        )}
      </View>

      {throws.length > 0 && phase === "landed" && (
        <View style={styles.history}>
          <MethodResultActions />
          <Text variant="heading">掷筊记录</Text>
          {throws.map((t) => (
            <View key={t.throwIndex} style={styles.historyItem}>
              <Text variant="caption" muted>
                第 {t.throwIndex} 掷
              </Text>
              <Text variant="body">{getJiaobeiOutcomeLabel(t.outcome)}</Text>
              <Text variant="caption" muted>
                {cupLabel(t.cups[0])} / {cupLabel(t.cups[1])}
              </Text>
            </View>
          ))}
          {threeHoly && (
            <Text variant="body" gold>
              三圣杯：强确认，可行动（仍须结合现实判断）。
            </Text>
          )}
          {lastLaugh && !revisionMode && (
            <Text variant="body" muted>
              笑杯：请修正问句后再掷，不宜连续强迫。
            </Text>
          )}
          {lastYin && (
            <Text variant="body" muted>
              阴杯：宜暂停，尊重否定的回应。
            </Text>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  workbench: { gap: spacing.md, marginTop: spacing.lg },
  questionWrap: { gap: spacing.xs },
  questionRevise: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    minHeight: 88,
    textAlignVertical: "top",
    fontSize: 16,
  },
  revisionPanel: { gap: spacing.sm },
  actions: { gap: spacing.sm },
  cupsDisplay: {
    marginTop: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cupsGlyph: { fontSize: 36, lineHeight: 44 },
  history: { marginTop: spacing.xl, gap: spacing.md },
  historyItem: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
});
