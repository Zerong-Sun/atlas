import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  drawTarotSpread,
  interpretTarot,
  toInterpretTarotCards,
  type TarotSpreadResult,
} from "@atlas/engines/tarot";
import { buildTarotReportSnapshot } from "@atlas/method-core";
import { MethodHero } from "@/components/MethodHero";
import { MethodResultActions } from "@/components/MethodResultActions";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { useCardDrawPhase } from "@/hooks/useCardDrawPhase";
import { useRegisterMethodCopilotReport } from "@/hooks/useRegisterMethodCopilotReport";
import { spacing, radius, colors } from "@/constants/theme";

export function TarotScreen() {
  const [question, setQuestion] = useState("");
  const [spreadResult, setSpreadResult] = useState<TarotSpreadResult | null>(null);
  const [interpretation, setInterpretation] = useState<ReturnType<typeof interpretTarot> | null>(null);
  const { phase, isBusy, runDraw } = useCardDrawPhase();

  const draw = () => {
    if (isBusy) return;
    setSpreadResult(null);
    setInterpretation(null);
    runDraw({
      shuffleMs: 1000,
      onShuffleComplete: () => {
        const seed = `${Date.now()}-${question}-three-timeline`;
        const result = drawTarotSpread({
          seed,
          spreadId: "three-timeline",
          includeMinor: false,
        });
        const interp = interpretTarot(toInterpretTarotCards(result.cards), { question });
        setSpreadResult(result);
        setInterpretation(interp);
      },
    });
  };

  const combo = useMemo(() => {
    if (!spreadResult) return "";
    return interpretation?.summary ?? spreadResult.summary;
  }, [spreadResult, interpretation]);

  const copilotReport = useMemo(() => {
    if (!spreadResult || phase !== "revealed") return null;
    const cards = spreadResult.cards.map((c) => ({
      position: c.position,
      name: c.name,
      reversed: c.reversed,
    }));
    return buildTarotReportSnapshot({
      question,
      spreadName: spreadResult.spread,
      cards,
      combo,
      interpretation,
    });
  }, [spreadResult, phase, question, combo, interpretation]);
  useRegisterMethodCopilotReport(copilotReport);

  const buttonTitle =
    phase === "shuffling" ? "洗牌中…" : phase === "revealed" ? "再抽一牌阵" : "抽三牌阵";

  return (
    <Screen scroll>
      <MethodHero
        methodId="tarot"
        kicker="TAROT"
        title="塔罗抽卡"
        description="三张牌阵（过去·现在·未来），大阿卡那牌组。问题宜具体，一事一占。"
      />

      <View style={styles.workbench}>
        <View style={styles.field}>
          <Text variant="label">所问事项</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholder="输入你要问的事项…"
          />
        </View>
        <Button title={buttonTitle} onPress={draw} disabled={isBusy} />
      </View>

      {spreadResult && phase === "revealed" && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{spreadResult.spread}</Text>
          {interpretation?.summary && (
            <Text variant="body" muted>{interpretation.summary}</Text>
          )}

          <View style={styles.section}>
            <Text variant="label">牌面</Text>
            {spreadResult.cards.map((card) => (
              <View key={card.position} style={styles.cardRow}>
                <Text variant="body">
                  {card.position}：{card.name}
                  {card.reversed ? "（逆位）" : "（正位）"}
                </Text>
                <Text variant="caption" muted>
                  {card.reversed ? card.reversedMeaning : card.upright}
                </Text>
                {card.keywords.length > 0 && (
                  <Text variant="caption" muted>
                    {card.keywords.join(" · ")}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {interpretation?.pairMatches && interpretation.pairMatches.length > 0 && (
            <View style={styles.section}>
              <Text variant="label">组合规则</Text>
              {interpretation.pairMatches.map((p) => (
                <Text key={p.id} variant="body" muted>
                  {p.name}：{p.meaning}
                </Text>
              ))}
            </View>
          )}

          {interpretation?.scenarioSections && (
            <View style={styles.section}>
              <Text variant="label">场景解读</Text>
              {interpretation.scenarioSections.map((s) => (
                <Text key={s.title} variant="body">
                  {s.title}：{s.content}
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
