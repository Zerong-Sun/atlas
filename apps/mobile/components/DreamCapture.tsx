import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { DreamInterpretation } from "@/lib/api/dreams";
import { colors, radius, spacing } from "@/constants/theme";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";

const EMOTIONS = ["平静", "焦虑", "喜悦", "恐惧", "困惑", "期待"];
const SYMBOLS = ["水", "门", "路", "飞行", "坠落", "动物", "亲人", "光"];

type Props = {
  onSubmit: (text: string, emotions: string[], symbols: string[]) => void;
  loading?: boolean;
  result?: DreamInterpretation | null;
};

export function DreamCapture({ onSubmit, loading, result }: Props) {
  const [text, setText] = useState("");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, item: string) => {
    set(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="heading">记录梦境</Text>
      <TextInput
        style={styles.input}
        placeholder="描述你的梦…"
        placeholderTextColor={colors.textMuted}
        multiline
        value={text}
        onChangeText={setText}
      />

      <ChipRow label="情绪" items={EMOTIONS} selected={emotions} onToggle={(i) => toggle(emotions, setEmotions, i)} />
      <ChipRow label="符号" items={SYMBOLS} selected={symbols} onToggle={(i) => toggle(symbols, setSymbols, i)} />

      <Button
        title="生成多视角解释"
        onPress={() => onSubmit(text.trim(), emotions, symbols)}
        loading={loading}
        disabled={!text.trim()}
      />

      {result && (
        <View style={styles.results}>
          {result.degraded && (
            <View style={styles.degraded}>
              <Text variant="caption" style={{ color: colors.textSecondary }}>
                当前显示基础模板解读；LLM 服务暂时不可用，请稍后重试。
              </Text>
            </View>
          )}
          <InterpretBlock title="中国梦占" body={result.chinese} />
          <InterpretBlock title="荣格简释" body={result.jungian} />
          <InterpretBlock title="精神反思" body={result.reflection} highlight />
        </View>
      )}
    </View>
  );
}

function ChipRow({
  label,
  items,
  selected,
  onToggle,
}: {
  label: string;
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <View style={styles.chipSection}>
      <Text variant="label">{label}</Text>
      <View style={styles.chips}>
        {items.map((item) => (
          <Pressable key={item} onPress={() => onToggle(item)}>
            <Text
              variant="caption"
              style={[styles.chip, selected.includes(item) && styles.chipSelected]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function InterpretBlock({ title, body, highlight }: { title: string; body: string; highlight?: boolean }) {
  return (
    <View style={[styles.interpret, highlight && styles.interpretHighlight]}>
      <Text variant="label">{title}</Text>
      <Text variant="body">{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipSection: { gap: spacing.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  chipSelected: { borderColor: colors.gold, color: colors.gold },
  results: { marginTop: spacing.lg, gap: spacing.md },
  degraded: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    borderRadius: radius.md,
  },
  interpret: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  interpretHighlight: { borderWidth: 1, borderColor: colors.goldDim },
});
