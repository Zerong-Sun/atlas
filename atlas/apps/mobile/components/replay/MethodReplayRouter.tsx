import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import type { ArchiveEntry } from "@/lib/archive";
import { LenormandReplay } from "./LenormandReplay";
import { TarotReplay } from "./TarotReplay";
import { spacing } from "@/constants/theme";

export function MethodReplayRouter({ entry }: { entry: ArchiveEntry }) {
  const payload = entry.payload;
  if (!payload) return null;

  switch (payload.methodId) {
    case "tarot":
      return <TarotReplay payload={payload} />;
    case "lenormand":
      return <LenormandReplay payload={payload} />;
    default:
      return (
        <View style={styles.fallback}>
          <Text variant="label">结构化结果</Text>
          {payload.question ? (
            <Text variant="body" muted>
              所问：{payload.question}
            </Text>
          ) : null}
          <Text variant="body">{entry.body}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  fallback: { gap: spacing.sm },
});
