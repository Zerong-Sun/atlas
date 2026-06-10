import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Image, StyleSheet, View, type ImageSourcePropType } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

export type FlipCardProps = {
  position: string;
  revealed: boolean;
  reversed?: boolean;
  index?: number;
  placeholder?: boolean;
  backLabel?: string;
  placeholderHint?: string;
  imageUri?: string;
  imageSource?: ImageSourcePropType;
  cardName?: string;
  face?: ReactNode;
  meta?: ReactNode;
};

export function CardFacePlaceholder({ name, position }: { name?: string; position?: string }) {
  return (
    <View style={styles.placeholder}>
      <Text variant="caption" muted>
        {position}
      </Text>
      <Text variant="body" numberOfLines={2}>
        {name ?? "牌面"}
      </Text>
    </View>
  );
}

function CardFace({
  imageUri,
  imageSource,
  cardName,
  position,
  reversed,
}: {
  imageUri?: string;
  imageSource?: ImageSourcePropType;
  cardName?: string;
  position: string;
  reversed?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const source = imageSource ?? (imageUri ? { uri: imageUri } : undefined);

  if (!source || failed) {
    return <CardFacePlaceholder name={cardName} position={position} />;
  }

  return (
    <Image
      source={source}
      style={[styles.faceImage, reversed && styles.reversed]}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}

export function FlipCard({
  position,
  revealed,
  reversed = false,
  index = 0,
  placeholder = false,
  backLabel = "抽取中",
  placeholderHint = "等待洗牌",
  imageUri,
  imageSource,
  cardName,
  face,
  meta,
}: FlipCardProps) {
  const opacity = useRef(new Animated.Value(revealed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: revealed ? 1 : 0,
      duration: revealed ? 320 : 120,
      useNativeDriver: true,
    }).start();
  }, [revealed, opacity]);

  if (placeholder) {
    return (
      <View style={[styles.tile, { marginTop: index > 0 ? 0 : 0 }]}>
        <View style={[styles.card, styles.placeholderCard]}>
          <Text variant="caption" muted>
            {position}
          </Text>
          <Text variant="body">待抽取</Text>
          <Text variant="caption" muted>
            {placeholderHint}
          </Text>
        </View>
        {meta ?? (
          <View style={styles.meta}>
            <Text variant="caption" muted>
              {position}
            </Text>
            <Text variant="body">牌背</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.tile}>
      <View style={styles.cardStack}>
        <View style={[styles.card, styles.cardBack, revealed && styles.cardBackHidden]}>
          <Text variant="caption" muted>
            {position}
          </Text>
          <Text variant="heading">◆</Text>
          <Text variant="caption">{backLabel}</Text>
        </View>
        <Animated.View style={[styles.card, styles.cardFace, { opacity }, reversed && styles.reversedTile]}>
          {face ?? (
            <CardFace
              imageUri={imageUri}
              imageSource={imageSource}
              cardName={cardName}
              position={position}
              reversed={reversed}
            />
          )}
        </Animated.View>
      </View>
      {meta ?? (
        <View style={styles.meta}>
          <Text variant="caption" muted>
            {position}
          </Text>
          {cardName ? (
            <Text variant="body" numberOfLines={1}>
              {cardName}
              {reversed ? "（逆）" : ""}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

export function CardDrawTable({ children }: { children: ReactNode }) {
  return <View style={tableStyles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  tile: {
    width: "30%",
    minWidth: 96,
    gap: spacing.xs,
    alignItems: "center",
  },
  cardStack: {
    width: "100%",
    aspectRatio: 2 / 3,
    position: "relative",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.xs,
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  cardBackHidden: {
    opacity: 0,
  },
  cardFace: {
    position: "absolute",
    top: 0,
    left: 0,
    padding: 0,
  },
  placeholderCard: {
    aspectRatio: 2 / 3,
    opacity: 0.7,
  },
  faceImage: {
    width: "100%",
    height: "100%",
  },
  reversed: {
    transform: [{ rotate: "180deg" }],
  },
  reversedTile: {
    transform: [{ rotate: "180deg" }],
  },
  placeholder: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  meta: {
    alignItems: "center",
    gap: 2,
    width: "100%",
  },
});

const tableStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    justifyContent: "center",
  },
});
