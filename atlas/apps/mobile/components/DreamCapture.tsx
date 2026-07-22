import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { DreamInterpretation } from "@/lib/api/dreams";
import { LlmSetupHint } from "@/components/LlmSetupHint";
import { useUiPrefs } from "@/hooks/useUiPrefs";
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
  const { prefs } = useUiPrefs();

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

      {prefs.safeMode && (
        <Text variant="caption" style={styles.safeNote}>
          梦境解读仅供自我反思，不构成诊断或预言；持续困扰请咨询专业人士。
        </Text>
      )}

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
                当前显示基础模板解读；配置 LLM 后可获得专业解析。
              </Text>
              <LlmSetupHint message="前往设置 → LLM 连接，填写 API Key 并测试连接。" />
            </View>
          )}
          <InterpretBlock title="中国梦占" body={result.chinese} />
          <InterpretBlock title="荣格简释" body={result.jungian} />
          <InterpretBlock title="民俗征兆" body={buildFolkDreamView(symbols, emotions)} />
          <InterpretBlock title="文化适配" body={buildCulturalDreamView(prefs.culturalLens, prefs.locale)} />
          <InterpretBlock title="精神反思" body={result.reflection} highlight />
        </View>
      )}
    </View>
  );
}

function buildCulturalDreamView(
  lens: ReturnType<typeof useUiPrefs>["prefs"]["culturalLens"],
  locale: ReturnType<typeof useUiPrefs>["prefs"]["locale"],
): string {
  const localeNote = locale === "en-US"
    ? "Keep the original symbol beside the translation so cultural meaning is not flattened."
    : locale === "ja-JP"
      ? "可把梦中征兆和日常礼俗、季节感并读，但避免把它说成唯一答案。"
      : locale === "ko-KR"
        ? "可结合家族、礼俗与日常关系阅读梦象，同时保留现实判断。"
        : "保留原文化术语，再用现代白话解释，避免把不同传统硬翻成同一种说法。";
  if (lens === "native") return `本土语境优先尊重梦占传统内部的说法；${localeNote}`;
  if (lens === "academic") return `研究注释把梦当作民俗、心理和叙事材料并读，并标出不确定性；${localeNote}`;
  if (lens === "diaspora") return `跨文化入门会先解释符号背景，再提示它在日常生活中的感受对应；${localeNote}`;
  return `文明对照会并列民俗征兆、心理投射与伦理行动，不急着合成单一结论；${localeNote}`;
}

function buildFolkDreamView(symbols: string[], emotions: string[]): string {
  const symbolText = symbols.length ? `「${symbols.slice(0, 4).join("、")}」` : "最醒目的场景";
  const emotionText = emotions.length ? `醒来后的${emotions.join("、")}` : "醒来后的身体感";
  return `${symbolText}可作为生活征兆来记录；${emotionText}说明重点也在你如何承接它。连续记录三天，但不要把它当成必然预言。`;
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
  safeNote: { color: colors.textSecondary, lineHeight: 18 },
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
