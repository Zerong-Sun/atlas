import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { getCultureLesson, getMethodExperience } from "@atlas/method-data";
import { Text } from "@/components/ui/Text";
import { useMotionAllowed } from "./CultureExperience";
import { colors } from "@/constants/theme";
/** Bounded native-driver feedback, triggered by actual method action/result state. */
export function MethodActivity({methodId,activityKey,busy=false}:{methodId:string;activityKey?:string|number|null;busy?:boolean}) {
 const lesson=getCultureLesson(methodId),experience=getMethodExperience(methodId);
 const allowed=useMotionAllowed(),v=useRef(new Animated.Value(1)).current;
 useEffect(()=>{
  v.stopAnimation();if(!allowed||!activityKey){v.setValue(1);return;}
  v.setValue(0);const run=Animated.timing(v,{toValue:1,duration:650,easing:Easing.out(Easing.cubic),useNativeDriver:true});run.start();return()=>run.stop();
 },[activityKey,busy,allowed,v]);
 if(!activityKey&&!busy)return null;
 const symbols=lesson?.symbols.slice(0,4)??[experience.glyph];
 return <View style={styles.wrap} accessibilityLiveRegion="polite"><View style={styles.row}>{symbols.map((s,i)=><Animated.View key={i} style={[styles.token,{opacity:v.interpolate({inputRange:[0,1],outputRange:[.3,1]}),transform:[{translateY:v.interpolate({inputRange:[0,1],outputRange:[(i+1)*8,0]})},{rotate:v.interpolate({inputRange:[0,1],outputRange:[lesson?.kind==="orbit"?"80deg":lesson?.kind==="cards"?`${(i-1)*16}deg`:"0deg","0deg"]})}]}]}><Text gold>{s}</Text></Animated.View>)}</View><Text variant="caption" muted>{busy?"正在展开本次操作…":"本次操作已完成 · 具体数值见下方结果"}</Text></View>;
}
const styles=StyleSheet.create({wrap:{gap:10,padding:12,marginBottom:16,backgroundColor:colors.surface,borderRadius:12},row:{flexDirection:"row",gap:8,flexWrap:"wrap"},token:{minWidth:44,minHeight:44,paddingHorizontal:10,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.gold,borderRadius:9}});
