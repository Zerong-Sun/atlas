import { SvgXml } from "react-native-svg";
import { coinSvg } from "@atlas/method-core";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { YAO_LABELS, type YaoValue } from "@atlas/engines/iching";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useMotionAllowed } from "@/components/culture/CultureExperience";
import { colors } from "@/constants/theme";

export function CoinCastPanel({lines,onCast}:{lines:number[];onCast:(value:number)=>void}){
 const [faces,setFaces]=useState([2,2,2]),[busy,setBusy]=useState(false);
 const [panelWidth,setPanelWidth]=useState(0);
 const coinSize=panelWidth>0?Math.max(40,Math.min(68,Math.floor((panelWidth-44)/3))):54;
 const locked=useRef(false),alive=useRef(true),progress=useRef(new Animated.Value(1)).current;
 const allowed=useMotionAllowed();
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;progress.stopAnimation();};},[progress]);
 useEffect(()=>{if(!allowed)progress.stopAnimation();},[allowed,progress]);
 const cast=()=>{
  if(locked.current||lines.length>=6)return;
  locked.current=true;setBusy(true);
  const coins=Array.from({length:3},()=>Math.random()<0.5?2:3);
  setFaces(coins);progress.setValue(allowed?0:1);
  const finish=(commit:boolean)=>{if(!alive.current)return;locked.current=false;setBusy(false);if(commit)onCast(coins.reduce((a,b)=>a+b,0));};
  if(!allowed){finish(true);return;}
  Animated.timing(progress,{toValue:1,duration:650,easing:Easing.out(Easing.cubic),useNativeDriver:true}).start(({finished})=>finish(finished));
 };
 return <View style={styles.panel} onLayout={e=>setPanelWidth(e.nativeEvent.layout.width)}>
  <View style={styles.coins} accessibilityLabel={busy?"三枚铜钱投掷中":`三钱示意 ${faces.join("、")}`}>
   {faces.map((face,i)=><Animated.View key={i} style={[styles.coin,{width:coinSize,height:coinSize+24,transform:[{translateY:progress.interpolate({inputRange:[0,.45,1],outputRange:[0,-22-i*3,0]})},{rotate:progress.interpolate({inputRange:[0,1],outputRange:[`${i%2?-220:220}deg`,"0deg"]})},{scale:progress.interpolate({inputRange:[0,.5,1],outputRange:[1,.8,1]})}]}]}><SvgXml xml={coinSvg(face)} width={coinSize} height={coinSize}/><Text variant="caption">{busy?"投掷中":face===2?"字 · 2":"背 · 3"}</Text></Animated.View>)}
  </View>
  <Text variant="caption" muted>字面记 2，背面记 3；三枚独立投掷。从初爻向上记录。</Text>
  <View style={styles.lines}>{Array.from({length:6},(_,j)=>5-j).map(i=>{const v=lines[i];const yang=v%2===1;return <View style={styles.lineRow} key={i}><Text variant="caption" style={styles.position}>{i===0?"初":i===5?"上":i+1}爻</Text><View style={styles.barRow}>{v?<><View style={styles.bar}/>{!yang&&<View style={{width:10}}/>}<View style={styles.bar}/></>:<View style={styles.empty}/>}</View><Text variant="caption" gold style={styles.label}>{v?`${v} ${YAO_LABELS[v as YaoValue]}`:"待掷"}</Text></View>;})}</View>
  <Button title={lines.length===6?"六爻已成":busy?"铜钱落定中…":`掷第 ${lines.length+1} 爻`} onPress={cast} disabled={busy||lines.length>=6}/>
  <Text variant="caption" muted>也可录入实体铜钱结果（用于核对）：</Text>
  <View style={styles.manual}>{([6,7,8,9] as const).map(v=><Pressable key={v} accessibilityRole="button" disabled={busy||lines.length>=6} accessibilityLabel={`录入${v}${YAO_LABELS[v]}`} style={[styles.choice,(busy||lines.length>=6)&&{opacity:.4}]} onPress={()=>onCast(v)}><Text variant="caption">{v} {YAO_LABELS[v]}</Text></Pressable>)}</View>
 </View>;
}
const styles=StyleSheet.create({panel:{gap:12,padding:14,borderWidth:1,borderColor:colors.border,borderRadius:14,backgroundColor:colors.surface},coins:{flexDirection:"row",justifyContent:"center",gap:8,paddingTop:24,paddingBottom:8},coin:{alignItems:"center",justifyContent:"center"},face:{fontSize:23},lines:{gap:9},lineRow:{flexDirection:"row",alignItems:"center",gap:12},position:{width:28},barRow:{flex:1,flexDirection:"row",height:7},bar:{flex:1,backgroundColor:colors.gold},empty:{flex:1,borderWidth:1,borderStyle:"dashed",borderColor:colors.border},label:{width:66},manual:{flexDirection:"row",flexWrap:"wrap",gap:6},choice:{flex:1,minWidth:55,minHeight:44,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.border,borderRadius:8}});
