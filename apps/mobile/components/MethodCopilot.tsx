import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  DEFAULT_ANALYSIS_PROMPT,
  getMethodCopilotConfig,
  getMethodCopilotPromptsWithReport,
} from "@atlas/method-core";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import {
  askMethodCopilot,
  askMethodCopilotAnalysis,
  isAnalysisQuestion,
  type MethodCopilotTurn,
} from "@/lib/api/methodCopilot";
import { getArchiveEntry, resolveArchiveEntryId, saveArchiveInterpretation } from "@/lib/archive";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { colors, radius, spacing } from "@/constants/theme";

export function MethodCopilot() {
  const { open, setOpen, report, pendingAction, clearPendingAction } = useMethodCopilot();
  const methodId = report?.methodId ?? null;
  const config = getMethodCopilotConfig(methodId);
  const quickPrompts = getMethodCopilotPromptsWithReport(methodId, Boolean(report));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<MethodCopilotTurn[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const loadedEntryIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!report) {
      loadedEntryIdRef.current = null;
      setTurns([]);
      return;
    }
    const entryId = resolveArchiveEntryId(report);
    if (loadedEntryIdRef.current === entryId) return;
    loadedEntryIdRef.current = entryId;
    void getArchiveEntry(entryId).then((entry) => setTurns(entry?.interpretation ?? []));
  }, [report]);

  useEffect(() => {
    if (!open || !pendingAction || pendingAction !== "analyze" || !report) return;
    clearPendingAction();
    void submit(DEFAULT_ANALYSIS_PROMPT);
  }, [open, pendingAction, report, clearPendingAction]);

  const persistInterpretation = useCallback(
    (nextTurns: MethodCopilotTurn[]) => {
      if (!report) return;
      void saveArchiveInterpretation(resolveArchiveEntryId(report), nextTurns);
    },
    [report],
  );

  const submit = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || loading) return;
      setInput("");
      setLoading(true);
      const userTurn: MethodCopilotTurn = { role: "user", content: question };
      const turnsWithUser = [...turns, userTurn];
      setTurns(turnsWithUser);
      persistInterpretation(turnsWithUser);
      const useAnalysis = report && isAnalysisQuestion(question, true);
      try {
        const reply = useAnalysis
          ? await askMethodCopilotAnalysis(methodId, question, turns, report)
          : await askMethodCopilot(methodId, question, turns);
        const turnsWithReply = [
          ...turnsWithUser,
          {
            role: "assistant" as const,
            content: reply.answer,
            diagram: reply.diagram || undefined,
            relatedTerms: reply.relatedTerms,
            sections: reply.sections,
            degraded: reply.degraded,
          },
        ];
        setTurns(turnsWithReply);
        persistInterpretation(turnsWithReply);
      } finally {
        setLoading(false);
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    },
    [loading, turns, report, methodId, persistInterpretation],
  );

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text variant="heading">{config.title}</Text>
          <Pressable onPress={() => setOpen(false)}>
            <Text variant="label" style={styles.close}>
              关闭
            </Text>
          </Pressable>
        </View>
        <Text variant="caption" muted style={styles.subtitle}>
          {config.subtitle}
        </Text>

        <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {turns.map((turn, i) => (
            <View
              key={`${turn.role}-${i}`}
              style={[styles.bubble, turn.role === "user" ? styles.userBubble : styles.assistantBubble]}
            >
              <Text variant="body">{turn.content}</Text>
              {turn.sections?.map((section) => (
                <View key={section.title} style={styles.section}>
                  <Text variant="label">{section.title}</Text>
                  <Text variant="body" muted>
                    {section.content}
                  </Text>
                </View>
              ))}
            </View>
          ))}
          {loading ? <ActivityIndicator color={colors.gold} style={styles.loader} /> : null}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prompts}>
          {quickPrompts.map((prompt) => (
            <Pressable key={prompt} style={styles.chip} onPress={() => void submit(prompt)}>
              <Text variant="caption">{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="提问…"
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Button title="发送" onPress={() => void submit(input)} disabled={loading || !input.trim()} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, paddingTop: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  close: { color: colors.gold },
  subtitle: { paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.md },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.sm },
  bubble: { padding: spacing.md, borderRadius: radius.md, maxWidth: "92%" },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.surfaceElevated },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  section: { marginTop: spacing.sm, gap: spacing.xs },
  loader: { marginVertical: spacing.md },
  prompts: { maxHeight: 44, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
