import { useMemo, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { hashDateSeed, isDayFieldLight, resolveDayColor, colors } from "@/theme/tokens";

type Props = {
  date: string;
  children: ReactNode;
};

export function DailyColorField({ date, children }: Props) {
  const day = resolveDayColor(date);
  const light = isDayFieldLight(day);
  const textOnDay = light ? colors.textOnLight : colors.mist;
  const slipBg = light ? "rgba(255,255,255,0.55)" : "rgba(11, 16, 32, 0.42)";

  const stars = useMemo(() => {
    let s = hashDateSeed(date);
    return Array.from({ length: 36 }, (_, i) => {
      s = Math.imul(s ^ (s >>> 13), 1597334677);
      const left = (s % 1000) / 10;
      s = Math.imul(s, 1597334677);
      const top = 55 + ((s % 1000) / 10) * 0.4;
      return { key: i, left: `${left}%` as const, top: `${top}%` as const, o: 0.15 + (s % 4) * 0.05 };
    });
  }, [date]);

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: day.b }]} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: day.a, opacity: 0.72 }]} />
      <View style={styles.mist} pointerEvents="none" />
      {stars.map((star) => (
        <View
          key={star.key}
          pointerEvents="none"
          style={[
            styles.star,
            { left: star.left, top: star.top, opacity: star.o },
          ]}
        />
      ))}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

/** Pass to child styles via context pattern — exported for DailyBriefView */
export function dayFieldPalette(date: string) {
  const day = resolveDayColor(date);
  const light = isDayFieldLight(day);
  return {
    day,
    textOnDay: light ? colors.textOnLight : colors.mist,
    textMuted: light ? "rgba(20, 27, 46, 0.65)" : colors.mistMuted,
    slipBg: light ? "rgba(255,255,255,0.55)" : "rgba(11, 16, 32, 0.42)",
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, position: "relative" },
  mist: {
    ...StyleSheet.absoluteFillObject,
    height: "28%",
    backgroundColor: "rgba(232, 237, 242, 0.12)",
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.mist,
  },
  content: { flex: 1, zIndex: 2 },
});
