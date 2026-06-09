import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { drawRunes, type RunesResult } from "@atlas/engines/runes";
import type { RuneSpread } from "@atlas/shared-types";
import { buildRunesReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

const SPREADS: Record<RuneSpread, string> = {
  single: "单符",
  three: "三符",
  nine: "九符阵",
};

const SPREAD_POSITIONS: Record<RuneSpread, string[]> = {
  single: ["核心"],
  three: ["过去", "现在", "未来"],
  nine: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

const SPREAD_COLUMNS: Record<RuneSpread, number> = {
  single: 1,
  three: 3,
  nine: 3,
};

type Phase = "idle" | "shuffling" | "drawing" | "revealed";

export function RunesScreen() {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<RuneSpread>("three");
  const [result, setResult] = useState<RunesResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const positions = SPREAD_POSITIONS[spread];

  const copilotReport = useMemo(() => {
    if (!result || phase !== "revealed") return null;
    return buildRunesReportSnapshot(question, SPREADS[spread], result);
  }, [result, question, spread, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const draw = () => {
    clearTimers();
    setPhase("shuffling");
    setResult(null);

    timerRef.current = setTimeout(() => {
      setResult(
        drawRunes({
          spread,
          question: question.trim() || undefined,
          seed: `${Date.now()}-${question}-${spread}`,
        }),
      );
      setPhase("drawing");
      timerRef.current = setTimeout(() => setPhase("revealed"), 600);
    }, 800);
  };

  const selectSpread = (s: RuneSpread) => {
    clearTimers();
    setSpread(s);
    setResult(null);
    setPhase("idle");
  };

  const visibleRunes = result
    ? result.runes
    : positions.map((position) => ({ position, placeholder: true as const }));

  const buttonTitle =
    phase === "shuffling"
      ? "取符中…"
      : phase === "drawing"
        ? "显符中…"
        : result
          ? "重新抽取"
          : "抽取符文";

  const columns = SPREAD_COLUMNS[spread];

  return (
    <Screen scroll>
      <MethodHero
        methodId="runes"
        kicker="RUNE CAST"
        title="卢恩符文占卜"
        description="抽取 Elder Futhark 符文，以石面刻痕显化能量。支持单符、三符与九符阵，含正逆位。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">问题</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholder="输入你要问的事项…"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.chipRow}>
          {(Object.keys(SPREADS) as RuneSpread[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, spread === s && styles.chipActive]}
              onPress={() => selectSpread(s)}
            >
              <Text variant="caption" style={spread === s ? styles.chipTextActive : undefined}>
                {SPREADS[s]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button
          title={buttonTitle}
          onPress={draw}
          disabled={phase === "shuffling" || phase === "drawing"}
        />
      </View>

      <View style={styles.table}>
        <View style={styles.grid}>
          {visibleRunes.map((rune, index) => {
            const revealed = phase === "revealed" && !("placeholder" in rune);
            return (
              <View
                key={"placeholder" in rune ? `${rune.position}-${index}` : `${rune.position}-${rune.id}`}
                style={[styles.runeCard, columns === 1 ? styles.runeCardSingle : styles.runeCardMulti]}
              >
                <View style={styles.runeFace}>
                  {revealed ? (
                    <>
                      <Text variant="heading" style={styles.glyph}>
                        {rune.glyph}
                      </Text>
                      <Text variant="caption" muted>
                        {rune.name}
                      </Text>
                    </>
                  ) : (
                    <Text variant="body" muted>
                      ?
                    </Text>
                  )}
                </View>
                <Text variant="caption" muted>
                  {rune.position}
                </Text>
                {revealed && (
                  <>
                    <Text variant="body">
                      {rune.nameZh} · {rune.name}
                    </Text>
                    <Text variant="caption" gold>
                      {rune.reversed ? "逆位" : "正位"}
                    </Text>
                    <Text variant="caption" muted>
                      {rune.keywords.join(" / ")}
                    </Text>
                  </>
                )}
                {!revealed && (
                  <Text variant="caption" muted>
                    等待取符
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {result && phase === "revealed" && (
        <View style={styles.result}>
          <MethodResultActions />
          <View style={styles.readingGrid}>
            {result.runes.map((rune) => (
              <View key={`${rune.id}-${rune.position}`} style={styles.readingCard}>
                <Text variant="label">
                  {rune.position} · {rune.reversed ? "逆位" : "正位"}
                </Text>
                <Text variant="heading">
                  {rune.glyph} {rune.nameZh}
                </Text>
                <Text variant="body" muted>
                  {rune.keywords.join(" · ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  workbench: { gap: spacing.md, marginTop: spacing.lg },
  field: { gap: spacing.xs },
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
  table: { marginTop: spacing.xl },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, justifyContent: "center" },
  runeCard: {
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  runeCardSingle: { flexGrow: 1, maxWidth: 160 },
  runeCardMulti: { width: "30%", minWidth: 96, maxWidth: 120 },
  runeFace: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: { fontSize: 32, lineHeight: 40 },
  result: { marginTop: spacing.xl, gap: spacing.md },
  readingGrid: { gap: spacing.md },
  readingCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
});
