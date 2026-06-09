import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { getMethodExperience, getReadyMethods } from "@atlas/method-data";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

export default function MethodsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const methods = getReadyMethods();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return methods.filter((method) => {
      const searchable = [method.title, method.subtitle, method.tradition, ...method.tags]
        .join(" ")
        .toLowerCase();
      return !q || searchable.includes(q);
    });
  }, [methods, query]);

  return (
    <Screen scroll>
      <Text variant="title">占法</Text>
      <Text variant="caption" muted>
        {methods.length} 种可用占法 · 八字、塔罗、易经与更多
      </Text>

      <TextInput
        style={styles.search}
        placeholder="搜索占法…"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      {filtered.map((method) => {
        const exp = getMethodExperience(method.id);
        return (
          <Pressable
            key={method.id}
            style={[styles.card, { borderColor: exp.accentColor }]}
            onPress={() => router.push(`/methods/${method.id}`)}
          >
            <Text style={[styles.glyph, { color: exp.accentColor }]}>{exp.glyph}</Text>
            <View style={styles.cardBody}>
              <Text variant="heading">{method.title}</Text>
              <Text variant="caption" muted numberOfLines={2}>
                {method.subtitle}
              </Text>
              <View style={styles.tags}>
                {method.tags.slice(0, 3).map((tag) => (
                  <Text key={tag} variant="caption" style={styles.tag}>
                    {tag}
                  </Text>
                ))}
              </View>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  glyph: { fontSize: 28, lineHeight: 34 },
  cardBody: { flex: 1, gap: spacing.xs },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  tag: { color: colors.gold },
});
