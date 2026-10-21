import {useEffect,useRef,useState} from "react";
import {Animated,Pressable,StyleSheet,View} from "react-native";
import Svg,{Path,Rect,Circle} from "react-native-svg";
import {Text} from "@/components/ui/Text";
import {colors} from "@/constants/theme";
export function PrincipleScene({motion}:{motion:boolean}){
 const [earth,setEarth]=useState(false),[replay,setReplay]=useState(0),v=useRef(new Animated.Value(1)).current;
 useEffect(()=>{v.stopAnimation();v.setValue(motion?0:1);if(!motion)return;const a=Animated.timing(v,{toValue:1,duration:earth?1200:3000,useNativeDriver:true});a.start();return()=>a.stop();},[earth,replay,motion,v]);
 return <View style={styles.wrap}><View style={styles.tabs}>{["乾 · 自强不息","坤 · 厚德载物"].map((s,i)=><Pressable key={s} accessibilityRole="button" accessibilityState={{selected:earth===(i===1)}} style={[styles.tab,earth===(i===1)&&styles.selected]} onPress={()=>{setEarth(i===1);setReplay(replay+1);}}><Text variant="caption" gold>{s}</Text></Pressable>)}</View>
 <View style={styles.scene} accessible accessibilityLabel={earth?"大地承载树木、房屋与人":"太阳持续运行的现代教学示意"}>
 <Svg width="100%" height="160" viewBox="0 0 320 160" preserveAspectRatio="none"><Rect width="320" height="160" rx="12" fill="#152d35"/><Path d="M20 110 Q160 -40 300 110" fill="none" stroke="#748784" strokeDasharray="3 6"/><Path d="M0 128 L58 82 112 130 200 79 272 117 320 94V160H0Z" fill="#345454"/><Path d="M0 140 Q70 105 160 137 T320 130V160H0Z" fill={earth?"#947a51":"#52786b"}/></Svg>
 <Animated.View style={[styles.sun,{opacity:v.interpolate({inputRange:[0,1],outputRange:[.3,1]}),transform:[{translateX:v.interpolate({inputRange:[0,1],outputRange:[earth?0:-95,0]})},{translateY:v.interpolate({inputRange:[0,1],outputRange:[earth?0:70,0]})}]}]}/>
 {earth&&<Animated.View style={[StyleSheet.absoluteFill,{opacity:v,transform:[{translateY:v.interpolate({inputRange:[0,1],outputRange:[12,0]})}]}]}><Svg width="100%" height="160" viewBox="0 0 320 160"><Path d="M53 127V96M40 105L53 81 67 105Z" stroke="#90b393" fill="#618a70" strokeWidth="4"/><Path d="M135 130V108H161V130M129 108L148 91 168 108" stroke="#e3c89e" fill="#a28a64" strokeWidth="3"/><Circle cx="243" cy="108" r="6" fill="#e8d7b4"/><Path d="M243 115V137M232 122H254" stroke="#e8d7b4" strokeWidth="4"/></Svg></Animated.View>}
 </View><Text gold>{earth?"地势坤，君子以厚德载物。":"天行健，君子以自强不息。"}</Text><Text>{earth?"看：同一片大地容纳树木、房屋与人。懂：承载的比喻指向修养与容纳。做：今天为谁提供一次具体支持？":"看：天空持续运行，日光沿轨迹移动。懂：借天的运行谈持续修养，并非要求自己永不休息。做：选一件值得长期练习的小事。"}</Text><Text variant="caption" muted>《周易·象传》原句；动画与白话为现代教学表达。</Text></View>;
}
const styles=StyleSheet.create({wrap:{gap:12},tabs:{flexDirection:"row",gap:8},tab:{flex:1,minHeight:44,borderWidth:1,borderColor:colors.border,borderRadius:8,alignItems:"center",justifyContent:"center"},selected:{borderColor:colors.gold},scene:{height:160,overflow:"hidden",borderRadius:12},sun:{position:"absolute",left:"50%",marginLeft:-16,top:20,width:32,height:32,borderRadius:16,backgroundColor:"#e8c47e"}});
