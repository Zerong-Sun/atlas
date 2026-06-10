import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  drawTarotSpread,
  interpretTarot,
  TAROT_SPREADS,
  toInterpretTarotCards,
  type TarotSpreadResult,
} from "@atlas/engines/tarot";
import { buildTarotReportSnapshot } from "@atlas/method-core";
import { CardDrawTable, FlipCard } from "@/components/charts/FlipCard";
import { MethodHero } from "@/components/MethodHero";
import { MethodReadingHistory } from "@/components/MethodReadingHistory";
import { MethodResultActions } from "@/components/MethodResultActions";
import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { TextInput } from "@/components/ui/TextInput";
import { useCardDrawPhase } from "@/hooks/useCardDrawPhase";
import { usePersistMethodReading } from "@/hooks/usePersistMethodReading";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { buildMethodReadingEntryId } from "@/lib/methodReadings";
import { buildTarotCombination, resolveTarotCard, type TarotCard } from "@/lib/tarotDeck";
import { colors, radius, spacing } from "@/constants/theme";

type DeckMode = "major" | "full";

type DrawnCard = TarotCard & {
  position: string;
  reversed: boolean;
};

type PlaceholderCard = {
  position: string;
  placeholder: true;
};

export function TarotScreen() {
  const [question, setQuestion] = useState("");
  const [deckMode, setDeckMode] = useState<DeckMode>("major");
  const [spreadId, setSpreadId] = useState("three-timeline");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [spreadResult, setSpreadResult] = useState<TarotSpreadResult | null>(null);
  const [interpretation, setInterpretation] = useState<ReturnType<typeof interpretTarot> | null>(null);
  const [drawId, setDrawId] = useState<string | null>(null);
  const { phase, isBusy, runDraw, resetPhase } = useCardDrawPhase();
  const { prefs } = useUiPrefs();

  const spread = TAROT_SPREADS.find((s) => s.id === spreadId) ?? TAROT_SPREADS[1]!;

  const draw = () => {
    if (isBusy) return;
    setCards([]);
    setSpreadResult(null);
    setInterpretation(null);
    setDrawId(null);
    runDraw({
      shuffleMs: prefs.mysticMotion ? 1000 : 0,
      revealMs: prefs.mysticMotion ? 400 : 0,
      onShuffleComplete: () => {
        const seed = `${Date.now()}-${question}-${spreadId}`;
        const result = drawTarotSpread({
          seed,
          spreadId,
          includeMinor: deckMode === "full",
        });
        const next: DrawnCard[] = result.cards.map((drawn) => {
          const full = resolveTarotCard(drawn.name);
          return { ...full, position: drawn.position, reversed: drawn.reversed };
        });
        const interp = interpretTarot(toInterpretTarotCards(result.cards), { question });
        const id = buildMethodReadingEntryId("tarot");
        setCards(next);
        setSpreadResult(result);
        setInterpretation(interp);
        setDrawId(id);
      },
    });
  };

  const resetSpread = (nextSpreadId: string) => {
    setSpreadId(nextSpreadId);
    setCards([]);
    setSpreadResult(null);
    setInterpretation(null);
    setDrawId(null);
    resetPhase();
  };

  const combo = useMemo(() => buildTarotCombination(cards), [cards]);

  const visibleCards: Array<DrawnCard | PlaceholderCard> = cards.length
    ? cards
    : spread.positions.map((position) => ({ position, placeholder: true }));

  const copilotReport = useMemo(() => {
    if (!spreadResult || phase !== "revealed" || !cards.length) return null;
    return buildTarotReportSnapshot({
      question,
      spreadName: spreadResult.spread,
      cards: cards.map((c) => ({ position: c.position, name: c.name, reversed: c.reversed })),
      combo,
      interpretation,
      drawId: drawId ?? undefined,
    });
  }, [spreadResult, phase, cards, question, combo, interpretation, drawId]);

  const payload = useMemo(() => {
    if (!spreadResult || phase !== "revealed") return null;
    return {
      methodId: "tarot" as const,
      question: question.trim() || undefined,
      inputs: { spreadId, deckMode },
      result: { spreadResult, interpretation, cards: cards.map((c) => ({ position: c.position, name: c.name, reversed: c.reversed, id: c.id })) },
    };
  }, [spreadResult, phase, question, spreadId, deckMode, interpretation, cards]);

  usePersistMethodReading({
    snapshot: copilotReport,
    payload,
    ready: phase === "revealed" && Boolean(spreadResult),
    entryId: drawId ?? undefined,
  });

  const buttonTitle =
    phase === "shuffling"
      ? "洗牌中…"
      : phase === "revealed"
        ? "再抽一牌阵"
        : cards.length
          ? "重新洗牌抽取"
          : "洗牌并抽牌";

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

        <Text variant="label">牌组</Text>
        <View style={styles.chipRow}>
          <Pressable
            style={[styles.chip, deckMode === "major" && styles.chipActive]}
            onPress={() => {
              setDeckMode("major");
              setCards([]);
              setSpreadResult(null);
              setInterpretation(null);
              resetPhase();
            }}
          >
            <Text variant="caption" style={deckMode === "major" ? styles.chipTextActive : undefined}>
              大阿卡那
            </Text>
          </Pressable>
          <Pressable
            style={[styles.chip, deckMode === "full" && styles.chipActive]}
            onPress={() => {
              setDeckMode("full");
              setCards([]);
              setSpreadResult(null);
              setInterpretation(null);
              resetPhase();
            }}
          >
            <Text variant="caption" style={deckMode === "full" ? styles.chipTextActive : undefined}>
              全牌组 78
            </Text>
          </Pressable>
        </View>

        <Text variant="label">牌阵</Text>
        <View style={styles.chipRow}>
          {TAROT_SPREADS.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.chip, spreadId === item.id && styles.chipActive]}
              onPress={() => resetSpread(item.id)}
            >
              <Text variant="caption" style={spreadId === item.id ? styles.chipTextActive : undefined}>
                {item.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button title={buttonTitle} onPress={draw} disabled={isBusy} />
      </View>

      <View style={styles.spreadSection}>
        <Text variant="label">牌面</Text>
        <CardDrawTable>
          {visibleCards.map((card, index) =>
            !("placeholder" in card) ? (
              <FlipCard
                key={`${card.position}-${card.id}`}
                position={card.position}
                revealed={phase === "revealed"}
                reversed={card.reversed}
                index={index}
                imageUri={card.image}
                cardName={card.name}
                meta={
                  <View style={styles.cardMeta}>
                    <Text variant="caption" muted>
                      {card.position}
                    </Text>
                    <Text variant="body" numberOfLines={1}>
                      {card.name}
                    </Text>
                    <Text variant="caption" muted>
                      {card.reversed ? "逆位" : "正位"} · {(card.reversed ? card.reversedKeywords : card.keywords).slice(0, 2).join(" / ")}
                    </Text>
                  </View>
                }
              />
            ) : (
              <FlipCard
                key={`${card.position}-${index}`}
                position={card.position}
                revealed={false}
                index={index}
                placeholder
                placeholderHint="等待洗牌"
              />
            ),
          )}
        </CardDrawTable>
      </View>

      {spreadResult && phase === "revealed" && (
        <View style={styles.result}>
          <MethodResultActions />
          <Text variant="heading">{spreadResult.spread}</Text>
          {interpretation?.summary && (
            <Text variant="body" muted>
              {interpretation.summary}
            </Text>
          )}
          <Text variant="body" muted>
            {combo}
          </Text>

          <View style={styles.section}>
            <Text variant="label">单牌释义</Text>
            {cards.map((card) => (
              <View key={card.position} style={styles.cardRow}>
                <Text variant="body">
                  {card.position}：{card.name}
                  {card.reversed ? "（逆位）" : "（正位）"}
                </Text>
                <Text variant="caption" muted>
                  {card.reversed ? card.reversedMeaning : card.upright}
                </Text>
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

      <MethodReadingHistory methodId="tarot" />
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
  spreadSection: { marginTop: spacing.lg, gap: spacing.xs },
  cardMeta: { alignItems: "center", gap: 2, width: "100%" },
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
