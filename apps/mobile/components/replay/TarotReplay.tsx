import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { CardDrawTable, FlipCard } from "@/components/charts/FlipCard";
import { Text } from "@/components/ui/Text";
import type { MethodReadingPayload } from "@/lib/methodReadings";
import { resolveTarotCard } from "@/lib/tarotDeck";
import { spacing } from "@/constants/theme";

type TarotPayloadResult = {
  spreadResult?: { spread: string; summary?: string };
  interpretation?: {
    summary?: string;
    pairMatches?: Array<{ id: string; name: string; meaning: string }>;
    scenarioSections?: Array<{ title: string; content: string }>;
  };
  cards?: Array<{ position: string; name: string; reversed: boolean; id?: string }>;
};

export function TarotReplay({ payload }: { payload: MethodReadingPayload }) {
  const data = payload.result as TarotPayloadResult;
  const cards = useMemo(
    () =>
      (data.cards ?? []).map((card) => {
        const full = resolveTarotCard(card.name);
        return { ...full, position: card.position, reversed: card.reversed };
      }),
    [data.cards],
  );

  if (!cards.length) {
    return <Text variant="body" muted>无法还原牌面数据。</Text>;
  }

  return (
    <View style={styles.wrap}>
      {data.spreadResult?.spread ? <Text variant="heading">{data.spreadResult.spread}</Text> : null}
      {payload.question ? (
        <Text variant="body" muted>
          所问：{payload.question}
        </Text>
      ) : null}
      {data.interpretation?.summary ? (
        <Text variant="body" muted>
          {data.interpretation.summary}
        </Text>
      ) : null}

      <CardDrawTable>
        {cards.map((card, index) => (
          <FlipCard
            key={`${card.position}-${card.id}`}
            position={card.position}
            revealed
            reversed={card.reversed}
            index={index}
            imageUri={card.image}
            cardName={card.name}
            meta={
              <View style={styles.meta}>
                <Text variant="caption" muted>
                  {card.position}
                </Text>
                <Text variant="body" numberOfLines={1}>
                  {card.name}
                </Text>
                <Text variant="caption" muted>
                  {card.reversed ? "逆位" : "正位"}
                </Text>
              </View>
            }
          />
        ))}
      </CardDrawTable>

      <View style={styles.section}>
        <Text variant="label">单牌释义</Text>
        {cards.map((card) => (
          <Text key={card.position} variant="body" muted>
            {card.position}：{card.name}
            {card.reversed ? "（逆位）" : "（正位）"} — {card.reversed ? card.reversedMeaning : card.upright}
          </Text>
        ))}
      </View>

      {data.interpretation?.pairMatches?.map((p) => (
        <Text key={p.id} variant="body" muted>
          {p.name}：{p.meaning}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  meta: { alignItems: "center", gap: 2 },
  section: { gap: spacing.xs },
});
