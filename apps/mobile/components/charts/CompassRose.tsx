import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Polygon } from "react-native-svg";
import { Text } from "@/components/ui/Text";
import { colors, spacing } from "@/constants/theme";

type Props = {
  degree: number;
  onDegreeChange?: (deg: number) => void;
  size?: number;
};

export function CompassRose({ degree, size = 200 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 16;
  const rad = ((degree - 90) * Math.PI) / 180;
  const nx = cx + Math.cos(rad) * r;
  const ny = cy + Math.sin(rad) * r;

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={colors.goldDim} strokeWidth={1} fill="none" />
        <Line x1={cx} y1={cy} x2={nx} y2={ny} stroke={colors.gold} strokeWidth={2} />
        <Polygon
          points={`${nx},${ny} ${nx - 6},${ny + 10} ${nx + 6},${ny + 10}`}
          fill={colors.gold}
        />
      </Svg>
      <Text variant="caption" muted>
        坐向 {degree}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginVertical: spacing.md, gap: spacing.xs },
});
