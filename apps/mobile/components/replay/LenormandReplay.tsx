import { StyleSheet, View } from "react-native";
import { CardDrawTable, FlipCard } from "@/components/charts/FlipCard";
import { Text } from "@/components/ui/Text";
import { getLenormandCardImageSource } from "@/lib/lenormandDeck";
import type { MethodReadingPayload } from "@/lib/methodReadings";
import { spacing } from "@/constants/theme";

type LenormandPayloadResult = {
  centerTheme?: string;
  cards?: Array<{ id: number; position: string; name: string; keywords?: string[] }>;
  pairs?: Array<{ cardA: string; cardB: string; reading: string }>;
};

export function LenormandReplay({ payload }: { payload: MethodReadingPayload }) {
  const data = payload.result as LenormandPayloadResult;
  const cards = data.cards ?? [];

  if (!cards.length) {
    return <Text variant="body" muted>无法还原牌面数据。</Text>;
  }

  return (
    <View style={styles.wrap}>
      {data.centerTheme ? <Text variant="heading">中心主题：{data.centerTheme}</Text> : null}
      {payload.question ? (
        <Text variant="body" muted>
          所问：{payload.question}
        </Text>
      ) : null}

      <CardDrawTable>
        {cards.map((card, index) => {
          const imageSource = getLenormandCardImageSource(card.id);
          return (
            <FlipCard
              key={card.position}
              position={card.position}
              revealed
              index={index}
              imageSource={imageSource}
              cardName={card.name}
              meta={
                <View style={styles.meta}>
                  <Text variant="caption" muted>
                    {card.position}
                  </Text>
                  <Text variant="body" numberOfLines={1}>
                    {card.name}
                  </Text>
                  {card.keywords?.length ? (
                    <Text variant="caption" muted numberOfLines={2}>
                      {card.keywords.join("、")}
                    </Text>
                  ) : null}
                </View>
              }
            />
          );
        })}
      </CardDrawTable>

      {data.pairs?.map((p) => (
        <Text key={`${p.cardA}-${p.cardB}`} variant="body" muted>
          {p.cardA}+{p.cardB}：{p.reading}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  meta: { alignItems: "center", gap: 2 },
});
