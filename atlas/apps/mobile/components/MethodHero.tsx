import { MethodActivity } from "./culture/MethodActivity";
import { CultureExperience } from "./culture/CultureExperience";
import { StyleSheet, View } from "react-native";
import type { ReactNode } from "react";
import { getMethodExperience } from "@atlas/method-data";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  methodId: string;
  activityKey?: string | number | null;
  kicker?: string;
  title: string;
  description?: ReactNode;
};

export function MethodHero({ methodId, kicker, title, description, activityKey }: Props) {
  const experience = getMethodExperience(methodId);

  return (
    <>
    <View style={[styles.wrap, { borderColor: experience.accentColor }]}>
      <Text style={[styles.glyph, { color: experience.accentColor }]}>{experience.glyph}</Text>
      <View style={styles.content}>
        {kicker ? (
          <Text variant="caption" muted style={styles.kicker}>
            {kicker}
          </Text>
        ) : null}
        <Text variant="title">{title}</Text>
        {description ? (
          <Text variant="body" muted style={styles.desc}>
            {description}
          </Text>
        ) : null}
      </View>
    </View>
    <CultureExperience methodId={methodId} />
    <MethodActivity methodId={methodId} activityKey={activityKey} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  glyph: { fontSize: 36, lineHeight: 42 },
  content: { flex: 1, gap: spacing.xs },
  kicker: { letterSpacing: 1 },
  desc: { marginTop: spacing.xs },
});
