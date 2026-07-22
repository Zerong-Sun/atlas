import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, spacing } from "@/constants/theme";

type Planet = { name: string; sign: string; degree?: number };

type Props = {
  planets?: Planet[];
  size?: number;
};

export function NatalWheel({ planets = [], size = 220 }: Props) {
  const r = size / 2 - 12;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={colors.goldDim} strokeWidth={1} fill="none" />
        <Circle cx={cx} cy={cy} r={r * 0.65} stroke={colors.border} strokeWidth={1} fill="none" />
        {planets.slice(0, 8).map((p, i) => {
          const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * r * 0.82;
          const y = cy + Math.sin(angle) * r * 0.82;
          return (
            <SvgText key={p.name} x={x} y={y} fill={colors.gold} fontSize={10} textAnchor="middle">
              {p.name.slice(0, 2)}
            </SvgText>
          );
        })}
        <Line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={colors.border} strokeWidth={0.5} />
        <Line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={colors.border} strokeWidth={0.5} />
      </Svg>
      {planets.length === 0 ? (
        <Text variant="caption" muted>
          生成星盘后显示行星位置
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginVertical: spacing.md, gap: spacing.sm },
});
