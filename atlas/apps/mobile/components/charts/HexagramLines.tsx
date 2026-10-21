import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { colors, radius, spacing } from "@/constants/theme";
type Line = { position: number; isYang: boolean; isMoving?: boolean; label?: string };
export function HexagramLines({ lines, title }: { lines: Line[]; title?: string }) {
  return <View style={styles.wrap}>{title ? <Text variant="label">{title}</Text> : null}
    {[...lines].sort((a,b)=>b.position-a.position).map(line=><View key={line.position} style={styles.row} accessibilityLabel={`第${line.position}爻，${line.isYang?"阳":"阴"}${line.isMoving?"，动爻":""}`}>
      <Text variant="caption" muted>{line.position}</Text><View style={styles.bar}>{line.isYang?<View style={styles.segment}/>:<><View style={styles.segment}/><View style={styles.gap}/><View style={styles.segment}/></>}</View>
      <Text variant="caption">{line.isYang?"阳":"阴"}{line.isMoving?" · 动":""}</Text>
    </View>)}
  </View>;
}
const styles=StyleSheet.create({wrap:{gap:spacing.sm,padding:spacing.md,backgroundColor:colors.surface,borderRadius:radius.md},row:{flexDirection:"row",alignItems:"center",gap:spacing.sm},bar:{flex:1,flexDirection:"row"},segment:{flex:1,height:6,borderRadius:2,backgroundColor:colors.gold},gap:{width:16}});
