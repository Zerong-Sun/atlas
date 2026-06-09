import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { drawLenormand, type LenormandResult } from "@atlas/engines/lenormand";
import type { LenormandSpread } from "@atlas/shared-types";
import { buildLenormandReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { colors, radius, spacing } from "@/constants/theme";

const SPREADS: Record<LenormandSpread, string> = {
  three: "三牌阵",
  five: "五牌阵",
  nine: "九宫格",
};

type Phase = "idle" | "shuffling" | "revealed";

export function LenormandScreen() {
  const [question, setQuestion] = useState("");
  const [spread, setSpread] = useState<LenormandSpread>("three");
  const [result, setResult] = useState<LenormandResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readings = useMemo(() => {
    if (!result) return [];
    return result.cards.map((card) => ({
      card,
      meaning: card.keywords.join("、") || card.name,
    }));
  }, [result]);

  const copilotReport = useMemo(() => {
    if (!result || phase !== "revealed") return null;
    return buildLenormandReportSnapshot(question, SPREADS[spread], result, readings);
  }, [result, question, spread, readings, phase]);
  useRegisterMethodCopilotReport(copilotReport);

  const draw = () => {
    if (phase === "shuffling") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("shuffling");
    setResult(null);

    timerRef.current = setTimeout(() => {
      setResult(
        drawLenormand({
          spread,
          question: question.trim() || undefined,
          seed: `${Date.now()}-${question}-${spread}`,
        }),
      );
      setPhase("revealed");
    }, 1000);
  };

  const buttonTitle =
    phase === "shuffling" ? "洗牌中…" : phase === "revealed" ? "再抽一牌阵" : "抽牌";

  return (
    <Screen scroll>
      <MethodHero
        methodId="lenormand"
        kicker="LENORMAND"
        title="雷诺曼牌"
        description="三十六张符号牌，以名词与相邻组合说话。中心牌定主题，旁牌定修饰。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">问题</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholder="输入你要问的事项…"
          />
        </View>

        <Text variant="label">牌阵</Text>
        <View style={styles.chipRow}>
          {(Object.keys(SPREADS) as LenormandSpread[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.chip, spread === s && styles.chipActive]}
              onPress={() => { setSpread(s); setResult(null); setPhase("idle"); }}
            >
              <Text variant="caption" style={spread === s ? styles.chipTextActive : undefined}>
                {SPREADS[s]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title={buttonTitle} onPress={draw} disabled={phase === "shuffling"} />
      </View>

      {result && phase === "revealed" && (
        <View style={styles.result}>
          <MethodResultActions />
          {result.centerTheme && (
            <Text variant="heading">中心主题：{result.centerTheme}</Text>
          )}

          <View style={styles.section}>
            <Text variant="label">牌面</Text>
            {readings.map(({ card, meaning }) => (
              <View key={card.position} style={styles.cardRow}>
                <Text variant="body">
                  {card.position}：{card.name}
                </Text>
                <Text variant="caption" muted>{meaning}</Text>
              </View>
            ))}
          </View>

          {result.pairs.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">组合</Text>
              {result.pairs.map((p) => (
                <Text key={`${p.cardA}-${p.cardB}`} variant="body" muted>
                  {p.cardA}+{p.cardB}：{p.reading}
                </Text>
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
  cardRow: { gap: 2, paddingVertical: spacing.xs },
});
