import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { DailyBriefView } from "@/components/DailyBriefView";
import { Screen } from "@/components/ui/Screen";
import { fetchDailyBrief } from "@/lib/api/daily";
import { track } from "@/lib/analytics";
import type { DailyBrief } from "@atlas/shared-types";
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

  return (
    <Screen scroll>
      {brief && <DailyBriefView brief={brief} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, paddingTop: 80, alignItems: "center" },
});
