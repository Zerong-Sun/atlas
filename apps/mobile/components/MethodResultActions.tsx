import { StyleSheet, View } from "react-native";
import { MethodCopilotTrigger } from "@/components/MethodCopilotTrigger";
import { ShareReportButton } from "@/components/ShareReportButton";
import { spacing } from "@/constants/theme";

type Props = {
  variant?: "open" | "analyze";
  label?: string;
  methodId?: string;
  showShare?: boolean;
};

export function MethodResultActions({
  variant = "analyze",
  label,
  methodId,
  showShare = true,
}: Props) {
  return (
    <View style={styles.row}>
      {showShare ? <ShareReportButton /> : null}
      <MethodCopilotTrigger variant={variant} label={label} methodId={methodId} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
});
