import { PrincipleScene } from "./PrincipleScene";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, Image, Linking, Pressable, StyleSheet, TextInput, View, type ImageSourcePropType } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCultureLesson, SPAIN_CULTURE, type CultureLesson } from "@atlas/method-data";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { colors, radius, spacing } from "@/constants/theme";

const ART: Record<string,ImageSourcePropType> = {
 study: require("../../../../packages/method-data/assets/culture/study.webp"),
 earth: require("../../../../packages/method-data/assets/culture/earth.webp"),
 courtyard: require("../../../../packages/method-data/assets/culture/courtyard.webp"),
 western: require("../../../../packages/method-data/assets/culture/western.webp"),
 vedic: require("../../../../packages/method-data/assets/culture/vedic.webp"),
 cards: require("../../../../packages/method-data/assets/culture/cards.webp"),
 runes: require("../../../../packages/method-data/assets/culture/runes.webp"),
 sand: require("../../../../packages/method-data/assets/culture/sand.webp"),
 ritual: require("../../../../packages/method-data/assets/culture/ritual.webp"),
 coffee: require("../../../../packages/method-data/assets/culture/coffee.webp"),
 reflection: require("../../../../packages/method-data/assets/culture/reflection.webp"),
 spain: require("../../../../packages/method-data/assets/culture/spain.webp"),
};
const TABS = ["看见", "读懂", "带走"];

export function useMotionAllowed() {
  const { prefs } = useUiPrefs();
  const focused = useIsFocused();
  const [reduced,setReduced] = useState(true);
  const [active,setActive] = useState(AppState.currentState === "active");
  useEffect(()=>{
    let alive=true;
    void AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(alive)setReduced(v);}).catch(()=>{});
    const a=AccessibilityInfo.addEventListener("reduceMotionChanged",setReduced);
    const b=AppState.addEventListener("change",s=>setActive(s==="active"));
    return()=>{alive=false;a.remove();b.remove();};
  },[]);
  return focused && active && prefs.mysticMotion && !reduced;
}

function RitualStage({lesson,step,tick}:{lesson:CultureLesson;step:number;tick:number}) {
  const progress=useRef(new Animated.Value(1)).current;
  const allowed=useMotionAllowed();
  useEffect(()=>{
    progress.stopAnimation();
    if(!allowed){progress.setValue(1);return;}
    progress.setValue(0);
    const run=Animated.timing(progress,{toValue:1,duration:850,easing:Easing.out(Easing.cubic),useNativeDriver:true});
    run.start();return()=>run.stop();
  },[allowed,tick,step,progress]);
  const kind=lesson.kind;
  return <View style={styles.stage} accessible accessibilityLabel={`操作示意：${lesson.stages[step]}`}>
    <View style={[styles.tokens,kind==="grid" && styles.grid]}>
      {lesson.symbols.map((symbol,index)=>{
        const start=index*0.04;
        const p=progress.interpolate({inputRange:[start,1],outputRange:[0,1],extrapolate:"clamp"});
        const turn=kind==="orbit"?100:kind==="coins"||kind==="cups"||kind==="stones"? (index%2?35:-35):kind==="cards"?(index-1)*12:0;
        return <Animated.View key={`${lesson.methodId}-${index}`} style={[styles.token,
          (kind==="cards"||kind==="pillars"||kind==="sticks")&&styles.tall,
          (kind==="coins"||kind==="orbit"||kind==="stones"||kind==="ripples")&&styles.round,
          kind==="trace"&&styles.trace,
          {opacity:p.interpolate({inputRange:[0,1],outputRange:[0.3,1]}),transform:[
            {translateY:p.interpolate({inputRange:[0,1],outputRange:[kind==="sticks"?-28:18,0]})},
            {rotate:p.interpolate({inputRange:[0,1],outputRange:[`${turn}deg`,"0deg"]})},
            {scale:p.interpolate({inputRange:[0,1],outputRange:[kind==="ripples"?0.65:0.9,1]})},
          ]}]}><Text gold style={styles.symbol}>{symbol}</Text></Animated.View>;
      })}
    </View>
    <Text variant="caption" gold>{lesson.stages[step]}</Text>
    <Text variant="caption" muted>文化操作示意 · 不生成或改变占卜结果</Text>
  </View>;
}

export function CultureExperience({methodId}:{methodId:string}) {
  const lesson=getCultureLesson(methodId);
  const motion=useMotionAllowed();
  const [expanded,setExpanded]=useState(false);
  const [step,setStep]=useState(0);
  const [tick,setTick]=useState(0);
  const [note,setNote]=useState("");
  const [saved,setSaved]=useState(false);
  const [message,setMessage]=useState("");
  useEffect(()=>{
    let alive=true;setExpanded(false);setStep(0);setNote("");setSaved(false);
    void AsyncStorage.getItem(`atlas.culture.v1.${methodId}`).then(raw=>{
      if(!alive||!raw)return;
      try{const p=JSON.parse(raw);setNote(typeof p.note==="string"?p.note:"");setSaved(p.completed===true);}catch{}
    }).catch(()=>{});
    return()=>{alive=false;};
  },[methodId]);
  if(!lesson)return null;
  const save=async()=>{
    try{await AsyncStorage.setItem(`atlas.culture.v1.${methodId}`,JSON.stringify({version:1,completed:true,note,updatedAt:new Date().toISOString()}));setSaved(true);setMessage("已保存在本机，重新打开仍可查看。");}
    catch{setMessage("本机保存失败，请重试。");}
  };
  return <View style={styles.card}>
    <Pressable onPress={()=>setExpanded(v=>!v)} accessibilityRole="button" accessibilityState={{expanded}} style={styles.header}>
      <Image source={ART[lesson.scene]} style={styles.thumb} resizeMode="cover" accessibilityLabel={`${lesson.concept}文化主题插画`} />
      <View style={styles.heading}><Text variant="caption" gold>文明小课 · {saved?"已学习":"约 1 分钟"}</Text><Text variant="body">{lesson.title}</Text><Text variant="caption" muted>{expanded?"收起课程 −":"看见 · 读懂 · 带走 ＋"}</Text></View>
    </Pressable>
    {expanded&&<View style={styles.body}>
      <View style={styles.tabs}>{TABS.map((title,i)=><Pressable key={title} accessibilityRole="tab" accessibilityState={{selected:step===i}} onPress={()=>setStep(i)} style={[styles.tab,step===i&&styles.selected]}><Text gold={step===i}>{i+1} {title}</Text></Pressable>)}</View>
      {methodId==="iching"&&step===1?<PrincipleScene motion={motion}/>:<RitualStage lesson={lesson} step={step} tick={tick}/>}
      <Text variant="body">{[lesson.observe,lesson.understand,lesson.practice][step]}</Text>
      {step===2&&<TextInput value={note} onChangeText={v=>{setNote(v);setSaved(false);}} placeholder="留下一句自己的理解（只保存在本机）" placeholderTextColor={colors.textMuted} multiline maxLength={1200} style={styles.input} accessibilityLabel="我的文化学习笔记"/>}
      <View style={styles.actions}><Button title="重播示意" variant="secondary" onPress={()=>setTick(v=>v+1)} containerStyle={styles.flex}/><Button title={step<2?"下一步":saved?"更新笔记":"完成并保存"} onPress={()=>step<2?setStep(step+1):void save()} containerStyle={styles.flex}/></View>
      <Text variant="caption" muted>{lesson.distinction}</Text>
      <Text variant="caption" muted>说明与练习：Atlas 编写。场景：AI 创作插画。</Text>
      {lesson.sourceUrl?<Pressable accessibilityRole="link" onPress={()=>void Linking.openURL(lesson.sourceUrl!).catch(()=>setMessage("暂时无法打开来源，请检查网络。"))}><Text variant="caption" gold>查看资料 · {lesson.sourceTitle} ↗</Text></Pressable>:<Text variant="caption" muted>{lesson.sourceTitle}</Text>}
      {message?<Text variant="caption" accessibilityLiveRegion="polite">{message}</Text>:null}
    </View>}
  </View>;
}

export function SpainCultureCard(){
 const [open,setOpen]=useState(false);
 return <View style={styles.card}><Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(!open)} style={styles.header}><Image source={ART.spain} style={styles.thumb}/><View style={styles.heading}><Text variant="caption" gold>文化探索 · 西班牙</Text><Text>{SPAIN_CULTURE.title}</Text><Text variant="caption">{open?"收起 −":"打开案例 ＋"}</Text></View></Pressable>{open&&<View style={styles.body}><Text>{SPAIN_CULTURE.body}</Text><Text gold>{SPAIN_CULTURE.prompt}</Text><Text variant="caption" muted>{SPAIN_CULTURE.boundary}</Text><Pressable accessibilityRole="link" onPress={()=>void Linking.openURL(SPAIN_CULTURE.sourceUrl).catch(()=>{})}><Text gold variant="caption">{SPAIN_CULTURE.sourceTitle} ↗</Text></Pressable></View>}</View>;
}
const styles=StyleSheet.create({
 card:{borderWidth:1,borderColor:colors.border,borderRadius:radius.lg,backgroundColor:colors.surface,marginBottom:spacing.lg,overflow:"hidden"},
 header:{flexDirection:"row",gap:12,padding:12,alignItems:"center",minHeight:108},thumb:{width:88,height:88,borderRadius:8},heading:{flex:1,gap:5},
 body:{padding:16,gap:16},tabs:{flexDirection:"row",gap:6},tab:{flex:1,minHeight:44,alignItems:"center",justifyContent:"center",borderRadius:8,borderWidth:1,borderColor:colors.border},selected:{backgroundColor:colors.surfaceElevated,borderColor:colors.gold},
 stage:{minHeight:170,padding:12,alignItems:"center",justifyContent:"center",gap:12,borderRadius:12,backgroundColor:colors.ink},tokens:{flexDirection:"row",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"center",maxWidth:292},grid:{maxWidth:180},
 token:{minWidth:38,height:44,paddingHorizontal:6,borderWidth:1,borderColor:colors.gold,borderRadius:8,alignItems:"center",justifyContent:"center",backgroundColor:colors.surface},tall:{height:70,minWidth:44},round:{borderRadius:32,minWidth:44},trace:{borderWidth:0,borderBottomWidth:2,borderRadius:0},symbol:{fontSize:16},
 actions:{flexDirection:"row",gap:8},flex:{flex:1,paddingHorizontal:8},input:{minHeight:96,padding:12,borderWidth:1,borderColor:colors.border,borderRadius:8,color:colors.text,fontSize:16,textAlignVertical:"top"},earth:{flexDirection:"row",gap:12,alignItems:"center"},
});
