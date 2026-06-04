import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { Tradition } from "@atlas/shared-types";
import { READING_TRADITIONS, TRADITION_LABELS } from "@/constants/traditions";
import { colors, radius, spacing } from "@/constants/theme";
import { TraditionBadge } from "@/components/design-system";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

type Props = {
  onSubmit: (question: string, traditions: Tradition[]) => void;
  loading?: boolean;
};

export function AskComposer({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<Tradition[]>([...READING_TRADITIONS]);

  const toggle = (t: Tradition) => {
    setSelected((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handleSubmit = () => {
    const q = text.trim();
    if (!q || selected.length === 0) return;
    onSubmit(q, selected);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="heading" style={styles.title}>
        同题多算
      </Text>
      <Text variant="caption" muted>
        选择任意体系组合，对照解读（全功能开放）
      </Text>

      <TextInput
        style={styles.input}
        placeholder="写下你的问题…"
        placeholderTextColor={colors.textMuted}
        multiline
        value={text}
        onChangeText={setText}
      />

      <Text variant="label" style={styles.sectionLabel}>
        选择体系
      </Text>
      <View style={styles.badges}>
        {READING_TRADITIONS.map((t) => (
          <Pressable key={t} onPress={() => toggle(t)}>
            <TraditionBadge tradition={t} selected={selected.includes(t)} />
          </Pressable>
        ))}
      </View>
      {selected.length > 0 && (
        <Text variant="caption" muted style={styles.hint}>
          已选 {selected.length} 个：{selected.map((t) => TRADITION_LABELS[t]).join("、")}
        </Text>
      )}

      <Button
        title="生成对照报告"
        onPress={handleSubmit}
        loading={loading}
        disabled={!text.trim() || selected.length === 0}
        containerStyle={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  title: { marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: "top",
    fontSize: 16,
  },
  sectionLabel: { marginTop: spacing.sm },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  hint: { marginTop: spacing.xs },
  submit: { marginTop: spacing.md },
});
