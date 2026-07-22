import { useMemo, useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { rollAstrodice, type AstrodiceResult } from "@atlas/engines/astrodice";
import { buildAstrodiceReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { usePersistMethodReading } from "@/hooks/usePersistMethodReading";
import { buildMethodReadingEntryId } from "@/lib/methodReadings";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Phase = "idle" | "rolling" | "settled";

export function AstrodiceScreen() {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<AstrodiceResult | null>(null);
  const [history, setHistory] = useState<AstrodiceResult[]>([]);
  const [entryId, setEntryId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copilotReport = useMemo(() => {
    if (!result || phase !== "settled") return null;
    return buildAstrodiceReportSnapshot(question, result);
  }, [result, question, phase]);
  const payload = useMemo(() => {
    if (!result || phase !== "settled") return null;
    return { methodId: "astrodice" as const, question: question.trim() || undefined, result };
  }, [result, question, phase]);

  usePersistMethodReading({
    snapshot: copilotReport,
    payload,
    ready: phase === "settled" && Boolean(result),
    entryId: entryId ?? undefined,
  });

  const roll = () => {
    if (phase === "rolling") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("rolling");
    setResult(null);
    setEntryId(buildMethodReadingEntryId("astrodice"));

    timerRef.current = setTimeout(() => {
      const next = rollAstrodice({
        seed: `${Date.now()}-${question}-${history.length}`,
        question: question.trim() || undefined,
      });
      setResult(next);
      setHistory((prev) => [next, ...prev].slice(0, 6));
      setPhase("settled");
    }, 1200);
  };

  const buttonTitle =
    phase === "rolling" ? "掷骰中…" : phase === "settled" ? "再掷一轮" : "投掷三骰";

  return (
    <Screen scroll>
      <MethodHero
        methodId="astrodice"
        kicker="ASTRO DICE"
        title="占星骰子"
        description="投掷行星、星座、宫位三枚骰子，组合成一句象征语法与行动提示。"
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
        <Button title={buttonTitle} onPress={roll} disabled={phase === "rolling"} />
      </View>

      <View style={styles.diceDisplay}>
        {phase === "rolling" ? (
          <Text variant="heading" style={styles.diceGlyph}>
            ☉ ♈ Ⅰ
          </Text>
        ) : result ? (
          <Text variant="heading" style={styles.diceGlyph}>
            {result.planet.symbol} {result.sign.symbol} {result.house.symbol}
          </Text>
        ) : (
          <Text variant="body" muted>
            三枚骰子待掷
          </Text>
        )}
      </View>

      {result && phase === "settled" && (
        <View style={styles.result}>
          <MethodResultActions />
          <View style={styles.syntax}>
            <Text variant="label">象征语法</Text>
            <Text variant="serif">{result.syntaxLine}</Text>
          </View>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text variant="label">
                行星 · {result.planet.symbol}
              </Text>
              <Text variant="heading">{result.planet.name}</Text>
              <Text variant="body" muted>
                {result.planet.meaning}
              </Text>
            </View>
            <View style={styles.card}>
              <Text variant="label">
                星座 · {result.sign.symbol}
              </Text>
              <Text variant="heading">{result.sign.name}</Text>
              <Text variant="body" muted>
                {result.sign.meaning}
              </Text>
            </View>
            <View style={styles.card}>
              <Text variant="label">
                宫位 · {result.house.symbol}
              </Text>
              <Text variant="heading">{result.house.name}</Text>
              <Text variant="body" muted>
                {result.house.meaning}
              </Text>
            </View>
          </View>
        </View>
      )}

      {history.length > 1 && (
        <View style={styles.history}>
          <Text variant="heading">追问记录</Text>
          {history.slice(1).map((item) => (
            <View key={item.seed} style={styles.historyItem}>
              <Text variant="body">
                {item.planet.name} · {item.sign.name} · {item.house.name}
              </Text>
              <Text variant="caption" muted>
                {item.syntaxLine}
              </Text>
            </View>
          ))}
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
  diceDisplay: {
    marginTop: spacing.xl,
    alignItems: "center",
    padding: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  diceGlyph: { fontSize: 32, letterSpacing: 8 },
  result: { marginTop: spacing.xl, gap: spacing.md },
  syntax: { gap: spacing.xs },
  grid: { gap: spacing.md },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
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
