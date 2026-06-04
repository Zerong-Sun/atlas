import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { Tradition } from "@atlas/shared-types";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/constants/traditions";
import { TraditionBadge } from "@/components/design-system";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { browseLibrary, type LibraryEntry } from "@/lib/api/library";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

export default function LibraryScreen() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [filter, setFilter] = useState<Tradition | undefined>();
  const [query, setQuery] = useState("");

  useEffect(() => {
    track("library_browse");
    browseLibrary({ tradition: filter, query: query || undefined }).then(setEntries);
  }, [filter, query]);

  return (
    <Screen scroll>
      <Text variant="title">书库</Text>
      <Text variant="caption" muted>
        术语 · 卦义 · 牌义 · 宫位短语（最小浏览）
      </Text>

      <TextInput
        style={styles.search}
        placeholder="搜索术语…"
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.filters}>
        <Pressable onPress={() => setFilter(undefined)}>
          <Text variant="caption" style={!filter ? styles.filterActive : undefined}>
            全部
          </Text>
        </Pressable>
        {READING_TRADITIONS.map((t) => (
          <Pressable key={t} onPress={() => setFilter(t)}>
            <TraditionBadge tradition={t} selected={filter === t} />
          </Pressable>
        ))}
      </View>

      {entries.map((e) => (
        <View key={e.id} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text variant="heading">{e.labelZh}</Text>
            <Text variant="caption" muted>
              {TRADITION_LABELS[e.tradition]}
            </Text>
          </View>
          <Text variant="body">{e.definitionZh}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
  },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginVertical: spacing.md },
  filterActive: { color: colors.gold },
  entry: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
