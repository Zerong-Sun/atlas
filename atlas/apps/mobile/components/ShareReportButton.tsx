import { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useMethodCopilot } from "@/context/MethodCopilotContext";
import { getArchiveEntry, resolveArchiveEntryId } from "@/lib/archive";
import { formatReportForShare, shareReportText } from "@/lib/shareReport";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";

export function ShareReportButton() {
  const { report } = useMethodCopilot();
  const [status, setStatus] = useState("");

  const share = useCallback(async () => {
    if (!report) return;
    const entry = await getArchiveEntry(resolveArchiveEntryId(report));
    const text = formatReportForShare(report, { interpretation: entry?.interpretation });
    const result = await shareReportText(report.title, text);
    if (result === "cancelled") return;
    setStatus(result === "shared" ? "已分享" : result === "copied" ? "已复制" : "分享失败");
    setTimeout(() => setStatus(""), 1400);
  }, [report]);

  if (!report) return null;

  return (
    <>
      <Pressable style={styles.btn} onPress={() => void share()}>
        <Text variant="label">分享报告</Text>
      </Pressable>
      {status ? (
        <Text variant="caption" muted style={styles.status}>
          {status}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  status: { marginTop: spacing.xs },
});
