import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { CULTURE_EVIDENCE_LABELS, getCultureResearch, getCultureSources } from "@atlas/method-data";
import { Text } from "@/components/ui/Text";
import { colors } from "@/constants/theme";

export function CultureResearchPanel({ methodId }: { methodId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setOpen(false); setError(""); }, [methodId]);
  const item = getCultureResearch(methodId);
  if (!item) return null;
  const paragraphs = [
    [item.history.title, item.history.text],
    ["人物与证据", item.people], ["从这里理解文化", item.lens],
    ["体验前想一想", item.before], ["体验后再比较", item.after], ["阅读边界", item.boundary],
  ];
  return <View style={styles.panel}>
    <Text variant="caption" gold>为什么人们会用它？</Text><Text>{item.why}</Text>
    <Pressable style={styles.toggle} accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(value => !value)}>
      <Text gold>{open ? "收起文化背景 −" : "读历史、人物与文化背景 ＋"}</Text>
      <Text variant="caption" muted>离线文库</Text>
    </Pressable>
    {open && <View style={styles.content}>
      <Text variant="caption" muted>{item.period}</Text>
      <Text variant="caption" gold>{CULTURE_EVIDENCE_LABELS[item.history.evidence]}</Text>
      {paragraphs.map(([title, body]) => <View key={title} style={styles.content}><Text gold>{title}</Text><Text>{body}</Text></View>)}
      <Text gold>资料与阅读范围</Text>
      {getCultureSources(methodId).map(source => <View key={source.id}>
        <Pressable style={styles.toggle} accessibilityRole="link" onPress={() => {
          setError(""); void Linking.openURL(source.url).catch(() => setError("无法打开外部资料，请检查网络；文库正文仍可离线阅读。"));
        }}><Text gold>{source.title} ↗</Text></Pressable>
        <Text variant="caption" muted>{source.institution} · {source.scope}</Text>
      </View>)}
      <Text variant="caption" muted>文化摘要与问题由 Atlas 编写。历史记录不证明占卜的预测效果；本页正文可离线阅读。</Text>
      {error ? <Text accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  panel: { padding: 16, gap: 10, borderTopWidth: 1, borderTopColor: colors.border },
  toggle: { minHeight: 44, justifyContent: "center", gap: 4 },
  content: { gap: 8 },
});
