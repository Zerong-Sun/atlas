import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { CitationSnapshot } from "@atlas/shared-types";
import { colors, radius, spacing } from "@/constants/theme";
import { track } from "@/lib/analytics";
import { Text } from "@/components/ui/Text";

type Props = {
  citation: CitationSnapshot;
  defaultExpanded?: boolean;
};

export function CitationBlock({ citation, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) track("citation_expand", { chunkId: citation.chunkId });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggle} style={styles.header}>
        <Text variant="label">古籍依据</Text>
        <Text variant="caption" muted>
          {expanded ? "收起" : "展开"}
        </Text>
      </Pressable>

      <View style={styles.originalBox}>
        <Text variant="serif" style={styles.original}>
          {citation.original}
        </Text>
      </View>

      {expanded && (
        <View style={styles.sections}>
          <Section title="白话" content={citation.translationZh} />
          {citation.annotationZh ? (
            <Section title="注释" content={citation.annotationZh} muted />
          ) : null}
          {citation.application ? (
            <Section title="本次应用" content={citation.application} highlight />
          ) : null}
        </View>
      )}
    </View>
  );
}

function Section({
  title,
  content,
  muted,
  highlight,
}: {
  title: string;
  content: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.section, highlight && styles.sectionHighlight]}>
      <Text variant="label">{title}</Text>
      <Text variant="body" muted={muted} style={highlight && styles.highlightText}>
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  originalBox: {
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
  },
  original: { fontFamily: "Courier", fontSize: 15 },
  sections: { padding: spacing.md, gap: spacing.md },
  section: { gap: spacing.xs },
  sectionHighlight: {
    padding: spacing.sm,
    backgroundColor: colors.consensusBg,
    borderRadius: radius.sm,
  },
  highlightText: { color: colors.parchment },
});
