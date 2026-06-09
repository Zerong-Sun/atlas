import { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { castIChing } from "@atlas/engines";
import { buildIchingReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type IChingHex = {
  number: number;
  name: string;
  judgment: string;
  image: string;
  lines: Array<"yang" | "yin">;
};

type IChingResult = {
  primary: IChingHex;
  changing: IChingHex;
  summary: string;
  method: string;
};

type HexLine = {
  position: number;
  isYang: boolean;
  label?: string;
};

function lineGlyph(isYang: boolean) {
  return isYang ? "━━━" : "━ ━";
}

function HexagramDisplay({ lines, title }: { lines: HexLine[]; title: string }) {
  return (
    <View style={styles.hexagram}>
      <Text variant="label">{title}</Text>
      {[...lines].reverse().map((line) => (
        <View key={line.position} style={styles.hexLine}>
          <Text variant="body" style={styles.hexGlyph}>
            {lineGlyph(line.isYang)}
          </Text>
          {line.label && (
            <Text variant="caption" muted>
              {line.label}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function coinLabel(value: number) {
  if (value === 6) return "老阳";
  if (value === 7) return "少阳";
  if (value === 8) return "少阴";
  return "老阴";
}

export function IchingScreen() {
  const [question, setQuestion] = useState("");
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [result, setResult] = useState<IChingResult | null>(null);

  const castStep = coinLines.length;

  const throwCoins = () => {
    if (castStep >= 6) return;
    const sum = Math.floor(Math.random() * 4) + 6;
    const next = [...coinLines, sum];
    setCoinLines(next);
    if (next.length === 6) {
      const seed = `${Date.now()}-${question}-${next.join("")}`;
      const raw = castIChing(seed) as unknown as IChingResult;
      setResult(raw);
    }
  };

  const reset = () => {
    setCoinLines([]);
    setResult(null);
  };

  const copilotReport = useMemo(
    () => (result ? buildIchingReportSnapshot(question, result) : null),
    [result, question],
  );
  useRegisterMethodCopilotReport(copilotReport);

  const primaryLines = useMemo<HexLine[]>(() => {
    if (!result) return [];
    return result.primary.lines.map((line, index) => ({
      position: index + 1,
      isYang: line === "yang",
      label: result.primary.name,
    }));
  }, [result]);

  const changingLines = useMemo<HexLine[]>(() => {
    if (!result) return [];
    return result.changing.lines.map((line, index) => ({
      position: index + 1,
      isYang: line === "yang",
      label: result.changing.name,
    }));
  }, [result]);

  return (
    <Screen scroll>
      <MethodHero
        methodId="iching"
        kicker="I CHING"
        title="周易六十四卦"
        description="铜钱起卦，取本卦与变卦，对照卦辞、象辞理解事项趋势。问题宜具体，一事一占。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">所问事项</Text>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.coinCast}>
          <Text variant="body">
            第 {Math.min(castStep + 1, 6)} 爻 / 6
          </Text>
          {coinLines.length > 0 && (
            <Text variant="caption" muted>
              已得：{coinLines.map(coinLabel).join(" · ")}
            </Text>
          )}
          <Button title="🪙 掷铜钱" onPress={throwCoins} disabled={castStep >= 6} />
          {castStep > 0 && (
            <Button title="重置" variant="secondary" onPress={reset} />
          )}
        </View>
      </View>

      {result && (
        <View style={styles.result}>
          <MethodResultActions />
          <View style={styles.resultHead}>
            <Text variant="heading">
              本卦 {result.primary.name}（{result.primary.number}）→ 变卦 {result.changing.name}（
              {result.changing.number}）
            </Text>
            <Text variant="body" muted>
              {result.summary}
            </Text>
          </View>
          <View style={styles.dual}>
            <HexagramDisplay lines={primaryLines} title={`本卦 · ${result.primary.name}`} />
            <HexagramDisplay lines={changingLines} title={`变卦 · ${result.changing.name}`} />
          </View>
          <View style={styles.readingGrid}>
            <View style={styles.readingCard}>
              <Text variant="label">卦辞</Text>
              <Text variant="body">{result.primary.judgment}</Text>
            </View>
            <View style={styles.readingCard}>
              <Text variant="label">象辞</Text>
              <Text variant="body">{result.primary.image}</Text>
            </View>
            <View style={styles.readingCard}>
              <Text variant="label">变卦卦辞</Text>
              <Text variant="body">{result.changing.judgment}</Text>
            </View>
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
  coinCast: { gap: spacing.sm },
  result: { marginTop: spacing.xl, gap: spacing.md },
  resultHead: { gap: spacing.xs },
  dual: { flexDirection: "row", gap: spacing.md },
  hexagram: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  hexLine: { alignItems: "center", gap: 2 },
  hexGlyph: { fontFamily: "monospace", letterSpacing: 2 },
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
