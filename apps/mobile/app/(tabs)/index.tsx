import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { DailyBrief } from "@atlas/shared-types";
import { DailyBriefView } from "@/components/DailyBriefView";
import { DailyColorField } from "@/components/DailyColorField";
import { TodayQuickActions } from "@/components/TodayQuickActions";
import { Screen } from "@/components/ui/Screen";
import { fetchDailyBrief } from "@/lib/api/daily";
import { track } from "@/lib/analytics";
import { colors } from "@/constants/theme";

export default function TodayScreen() {
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    track("daily_brief_view");
    fetchDailyBrief().then(setBrief).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </Screen>
    );
  }

  if (!brief) {
    return <Screen scroll />;
  }

  return (
    <DailyColorField date={brief.date}>
      <Screen scroll transparent>
        <DailyBriefView brief={brief} />
        <TodayQuickActions />
      </Screen>
    </DailyColorField>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, paddingTop: 80, alignItems: "center" },
});
