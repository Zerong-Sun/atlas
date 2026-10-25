import { usePathname } from "expo-router";
import { getCultureSources, getMethod } from "@atlas/method-data";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DEFAULT_ANALYSIS_PROMPT,
  createRequestGate,
  getMethodCopilotConfig,
  getMethodCopilotPromptsWithReport,
} from "@atlas/method-core";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { useUiPrefs } from "@/hooks/useUiPrefs";
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
  const { prefs } = useUiPrefs();
  const pathname = usePathname();
  const routeMethod = pathname.startsWith("/methods/") ? pathname.split("/")[2] : pathname === "/dream" ? "dream" : null;
  const methodId = report?.methodId ?? (routeMethod && getMethod(routeMethod) ? routeMethod : null);
  const config = getMethodCopilotConfig(methodId);
  const quickPrompts = getMethodCopilotPromptsWithReport(methodId, Boolean(report));
  const [sourceError, setSourceError] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<MethodCopilotTurn[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const loadedEntryIdRef = useRef<string | null>(null);
  const requestGate = useRef(createRequestGate());
  const contextKey = `${pathname}:${report ? resolveArchiveEntryId(report) : "none"}`;
  useLayoutEffect(() => {
    requestGate.current.reset(); setLoading(false); setSourceError("");
    return () => requestGate.current.reset();
  }, [contextKey]);
  useEffect(() => { setTurns([]); setInput(""); }, [methodId]);

  useEffect(() => {
    if (!report) {
      loadedEntryIdRef.current = null;
      setTurns([]);
      return;
    }
    const entryId = resolveArchiveEntryId(report);
    if (loadedEntryIdRef.current === entryId) return;
    loadedEntryIdRef.current = entryId;
    let alive = true;
    void getArchiveEntry(entryId).then((entry) => { if (alive) setTurns(entry?.interpretation ?? []); }).catch(() => {});
    return () => { alive = false; };
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
      if (!question) return;
      const ticket = requestGate.current.begin();
      if (ticket === null) return;
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
        if (!requestGate.current.isCurrent(ticket)) return;
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
      } catch {
        if (requestGate.current.isCurrent(ticket)) setTurns([...turnsWithUser, {role:"assistant",content:"解说暂不可用，请阅读页面文化文库或稍后重试。",degraded:true}]);
      } finally {
        if (requestGate.current.isCurrent(ticket)) {
          requestGate.current.finish(ticket); setLoading(false);
          scrollRef.current?.scrollToEnd({ animated: true });
        }
      }
    },
    [turns, report, methodId, persistInterpretation],
  );

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
          {prefs.safeMode && (
            <Text variant="caption" style={styles.safeNote}>
              解读仅供反思，不构成医疗、法律或投资建议。涉及重大决策请咨询专业人士。
            </Text>
          )}

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
          >
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
            {getCultureSources(methodId).length > 0 && <View style={styles.section}><Text variant="label">解说参考文库与来源</Text><Text variant="caption" muted>回答中的 [资料id] 可在这里核查。</Text>{getCultureSources(methodId).map(source => <Pressable key={source.id} accessibilityRole="link" style={{minHeight:44,justifyContent:"center"}} onPress={() => { setSourceError(""); void Linking.openURL(source.url).catch(() => setSourceError("无法打开来源，请检查网络。")); }}><Text variant="caption" gold>[{source.id}] {source.title} ↗</Text></Pressable>)}{sourceError ? <Text accessibilityLiveRegion="polite">{sourceError}</Text> : null}</View>}
            {loading ? <ActivityIndicator color={colors.gold} style={styles.loader} /> : null}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.prompts}
          >
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink },
  container: { flex: 1, backgroundColor: colors.ink },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  close: { color: colors.gold },
  subtitle: { paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.md },
  safeNote: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.gold,
    lineHeight: 18,
  },
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
