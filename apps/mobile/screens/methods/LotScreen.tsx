import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { drawLot, registerLotSigns } from "@atlas/engines/lot";
import type { LotTemple } from "@atlas/shared-types";
import { LOT_SIGNS, LOT_TEMPLE_LABELS } from "@atlas/method-data";
import { buildLotReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

registerLotSigns(LOT_SIGNS);

type Phase = "idle" | "shaking" | "revealed";

const TEMPLES: LotTemple[] = ["mixed", "guanyin", "guandi", "mazu"];

const CATEGORY_LABELS: Record<string, string> = {
  career: "事业",
  love: "感情",
  health: "健康",
  general: "一般",
};

export function LotScreen() {
  const [temple, setTemple] = useState<LotTemple>("mixed");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ReturnType<typeof drawLot> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draw = () => {
    if (phase === "shaking") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("shaking");
    setResult(null);
    timerRef.current = setTimeout(() => {
      setResult(drawLot({ temple, seed: `${Date.now()}-${temple}` }, LOT_SIGNS));
      setPhase("revealed");
    }, 1200);
  };

  const selectTemple = (t: LotTemple) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTemple(t);
    setPhase("idle");
    setResult(null);
  };

  const copilotReport = useMemo(
    () => (result && phase === "revealed" ? buildLotReportSnapshot(result) : null),
    [result, phase],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const categories = useMemo(() => {
    if (!result) return [];
    return result.sign.categories.map((c) => CATEGORY_LABELS[c] ?? c);
  }, [result]);

  const buttonTitle =
    phase === "shaking" ? "摇签中…" : phase === "revealed" ? "再摇一签" : "摇签";

  return (
    <Screen scroll>
      <MethodHero
        methodId="lot"
        kicker="TEMPLE LOTS"
        title="抽签签诗"
        description="观音、关帝、妈祖三庙签诗，摇签得号，读诗反思。签文为倾向提示，非必然预言。"
      />

      <View style={styles.workbench}>
        <View style={styles.chipRow}>
          {TEMPLES.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, temple === t && styles.chipActive]}
              onPress={() => selectTemple(t)}
            >
              <Text variant="caption" style={temple === t ? styles.chipTextActive : undefined}>
                {LOT_TEMPLE_LABELS[t]}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button title={buttonTitle} onPress={draw} disabled={phase === "shaking"} />
      </View>

      {result && phase === "revealed" && (
        <View style={styles.result}>
          <MethodResultActions />
          <View style={styles.resultHead}>
            <Text variant="label">{LOT_TEMPLE_LABELS[result.sign.temple]}</Text>
            <Text variant="heading">
              第 {result.sign.number} 签 · {result.sign.grade}
            </Text>
            <Text variant="serif">{result.sign.title}</Text>
          </View>
          <View style={styles.poem}>
            {result.sign.poem.map((line, i) => (
              <Text key={i} variant="serif" style={styles.poemLine}>
                {line}
              </Text>
            ))}
          </View>
          {result.sign.story && (
            <Text variant="body" muted style={styles.story}>
              {result.sign.story}
            </Text>
          )}
          <View style={styles.reading}>
            <Text variant="label">白话解曰</Text>
            <Text variant="body">{result.sign.plainReading}</Text>
          </View>
          <View style={styles.chipRow}>
            {categories.map((c) => (
              <View key={c} style={styles.chip}>
                <Text variant="caption">{c}</Text>
              </View>
            ))}
          </View>
          <View style={styles.advice}>
            {result.sign.advice.map((a) => (
              <Text key={a} variant="body" style={styles.adviceItem}>
                · {a}
              </Text>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  workbench: { gap: spacing.md, marginTop: spacing.lg },
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
  resultHead: { gap: spacing.xs },
  poem: { gap: spacing.xs, paddingVertical: spacing.sm },
  poemLine: { textAlign: "center" },
  story: { fontStyle: "italic" },
  reading: { gap: spacing.xs },
  advice: { gap: spacing.xs },
  adviceItem: { lineHeight: 22 },
});
