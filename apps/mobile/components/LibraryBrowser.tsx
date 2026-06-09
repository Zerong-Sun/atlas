import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { Tradition } from "@atlas/shared-types";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/constants/traditions";
import { TraditionBadge } from "@/components/design-system";
import { Text } from "@/components/ui/Text";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { browseLibrary, type LibraryEntry } from "@/lib/api/library";
import { track } from "@/lib/analytics";
import { colors, radius, spacing } from "@/constants/theme";

type Props = {
  showTitle?: boolean;
};

export function LibraryBrowser({ showTitle = false }: Props) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [filter, setFilter] = useState<Tradition | undefined>();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    track("library_browse");
    browseLibrary({ tradition: filter, query: debouncedQuery || undefined }).then(setEntries);
  }, [filter, debouncedQuery]);

  return (
    <View style={styles.wrap}>
      {showTitle ? <Text variant="title">书库</Text> : null}
      <Text variant="caption" muted style={showTitle ? styles.subtitle : undefined}>
        术语 · 卦义 · 牌义 · 宫位短语
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

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item: e }) => (
          <View style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text variant="heading">{e.labelZh}</Text>
              <Text variant="caption" muted>
                {TRADITION_LABELS[e.tradition]}
              </Text>
            </View>
            <Text variant="body">{e.definitionZh}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text variant="body" muted style={styles.empty}>
            未找到匹配术语
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  subtitle: { marginBottom: spacing.sm },
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
  empty: { paddingVertical: spacing.lg, textAlign: "center" },
});
