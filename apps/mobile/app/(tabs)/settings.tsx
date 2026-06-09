import { useEffect, useState } from "react";
import { StyleSheet, Switch, TextInput, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { useMockApi } from "@/lib/api/client";
import { testLlmConnection } from "@/lib/llm";
import {
  clearLlmSettings,
  DEFAULT_LLM_BASE_URL,
  DEFAULT_LLM_MODEL,
  getLlmSettingsForForm,
  isLlmConfigured,
  saveLlmSettings,
  validateLlmSettings,
} from "@/lib/llmSettings";
import { colors, radius, spacing } from "@/constants/theme";

const MODEL_RULES = [
  "不把占卜输出包装成确定事实。",
  "涉及健康、法律、投资时必须提示寻求专业意见。",
  "允许保留古籍和民俗口吻，但结论要落到反思和行动。",
  "多流派结论冲突时并列显示，不强行合并。",
];

export default function SettingsScreen() {
  const supabaseNotConfigured = useMockApi();
  const { prefs, updatePrefs } = useUiPrefs();
  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmBaseUrl, setLlmBaseUrl] = useState(DEFAULT_LLM_BASE_URL);
  const [llmModel, setLlmModel] = useState(DEFAULT_LLM_MODEL);
  const [llmConfigured, setLlmConfigured] = useState(false);
  const [llmMessage, setLlmMessage] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getLlmSettingsForForm().then((stored) => {
      setLlmApiKey(stored.apiKey);
      setLlmBaseUrl(stored.baseUrl);
      setLlmModel(stored.model);
    });
    void isLlmConfigured().then(setLlmConfigured);
  }, []);

  const handleSaveLlm = async () => {
    const error = validateLlmSettings({ apiKey: llmApiKey, baseUrl: llmBaseUrl, model: llmModel });
    if (error) {
      setLlmMessage(error);
      return;
    }
    setSaving(true);
    try {
      await saveLlmSettings({ apiKey: llmApiKey, baseUrl: llmBaseUrl, model: llmModel });
      setLlmConfigured(true);
      setLlmMessage("已保存到本设备。");
    } catch (e) {
      setLlmMessage(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleTestLlm = async () => {
    setTesting(true);
    const result = await testLlmConnection({ apiKey: llmApiKey, baseUrl: llmBaseUrl, model: llmModel });
    if (result.ok) {
      await saveLlmSettings({ apiKey: llmApiKey, baseUrl: llmBaseUrl, model: llmModel });
      setLlmConfigured(true);
    }
    setLlmMessage(result.message);
    setTesting(false);
  };

  const handleClearLlm = async () => {
    await clearLlmSettings();
    setLlmApiKey("");
    setLlmBaseUrl(DEFAULT_LLM_BASE_URL);
    setLlmModel(DEFAULT_LLM_MODEL);
    setLlmConfigured(false);
    setLlmMessage("已清除本机 LLM 配置。");
  };

  return (
    <Screen scroll>
      <Text variant="title">设置</Text>
      <Text variant="caption" muted>
        体验偏好、LLM 连接与输出边界
      </Text>

      <View style={styles.panel}>
        <Text variant="heading">体验偏好</Text>
        <ToggleRow
          label="神秘动效"
          value={prefs.mysticMotion}
          onChange={(v) => void updatePrefs({ mysticMotion: v })}
        />
        <ToggleRow
          label="优先显示古文解释"
          value={prefs.classicMode}
          onChange={(v) => void updatePrefs({ classicMode: v })}
        />
        <ToggleRow
          label="启用安全边界提示"
          value={prefs.safeMode}
          onChange={(v) => void updatePrefs({ safeMode: v })}
        />
      </View>

      <View style={styles.panel}>
        <Text variant="heading">数据同步</Text>
        <Text variant="body" muted>
          {supabaseNotConfigured
            ? "当前为仅本地模式，报告保存在本设备。"
            : "已配置 Supabase，报告与档案可云端同步。"}
        </Text>
      </View>

      <View style={styles.panel}>
        <Text variant="heading">LLM 连接</Text>
        <Text variant="caption" muted>
          {llmConfigured ? "已配置 API Key，占梦与解说可用。" : "未配置 API Key 时将显示降级模板。"}
        </Text>
        <Field label="API Key" value={llmApiKey} onChangeText={setLlmApiKey} secure />
        <Field label="Base URL" value={llmBaseUrl} onChangeText={setLlmBaseUrl} />
        <Field label="Model" value={llmModel} onChangeText={setLlmModel} />
        <View style={styles.actions}>
          <Button title="保存" onPress={() => void handleSaveLlm()} loading={saving} />
          <Button title={testing ? "测试中…" : "测试连接"} onPress={() => void handleTestLlm()} disabled={testing} />
          <Button title="清除" variant="ghost" onPress={() => void handleClearLlm()} />
        </View>
        {llmMessage ? (
          <Text variant="caption" style={styles.msg}>
            {llmMessage}
          </Text>
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text variant="heading">模型输出规则</Text>
        {MODEL_RULES.map((rule) => (
          <Text key={rule} variant="body" muted style={styles.rule}>
            · {rule}
          </Text>
        ))}
      </View>
    </Screen>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text variant="body">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.goldDim }}
        thumbColor={colors.parchment}
      />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  secure,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.xs },
  field: { gap: spacing.xs, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    color: colors.text,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.md },
  msg: { color: colors.gold, marginTop: spacing.sm },
  rule: { marginTop: spacing.xs },
});
