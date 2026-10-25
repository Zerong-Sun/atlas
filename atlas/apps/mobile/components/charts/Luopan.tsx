import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import * as Location from 'expo-location';
import { SvgXml } from 'react-native-svg';
import { bearingDetails, bearingFromPoint, luopanSvg, normalizeBearing, sittingFromFacing } from '@atlas/method-core';
import { Text } from '@/components/ui/Text';
export function Luopan({degree,onChange,manualRevision=0}:{degree:number;onChange:(value:number)=>void;manualRevision?:number}) {
 const [width,setWidth]=useState(300);const d=bearingDetails(degree);
 const [measuring,setMeasuring]=useState(false);
 const [status,setStatus]=useState('手动转盘可按实测读数定位；也可启动手机磁罗盘。');
 const subscription=useRef<Location.LocationSubscription|null>(null);
 const watchdog=useRef<ReturnType<typeof setTimeout>|null>(null);
 const active=useRef(false);
 const lastManualRevision=useRef(manualRevision);
 const clearWatchdog=()=>{if(watchdog.current){clearTimeout(watchdog.current);watchdog.current=null;}};
 useEffect(()=>()=>{active.current=false;clearWatchdog();subscription.current?.remove();subscription.current=null;},[]);
 const stop=()=>{active.current=false;clearWatchdog();subscription.current?.remove();subscription.current=null;setMeasuring(false);setStatus('已停止测量，保留最后一次读数。');};
 const scheduleWatchdog=()=>{clearWatchdog();watchdog.current=setTimeout(()=>{if(!active.current)return;stop();setStatus('未收到可靠的磁北读数。请远离磁性物品后复测，或手动输入实体指南针读数。');},8000);};
 useEffect(()=>{if(lastManualRevision.current!==manualRevision){lastManualRevision.current=manualRevision;if(active.current)stop();}},[manualRevision]);
 const setManual=(value:number)=>{if(active.current)stop();onChange(value);};
 const measure=async()=>{
  if(active.current){stop();return;}
  active.current=true;setMeasuring(true);setStatus('请求前台权限以读取手机磁罗盘；不会上传位置。');
  try {
   const permission=await Location.requestForegroundPermissionsAsync();
   if(!active.current)return;
   if(!permission.granted){stop();setStatus('未获得前台权限。可以继续输入实体指南针或系统指南针读数。');return;}
   const watcher=await Location.watchHeadingAsync(heading=>{
    if(!active.current)return;
    if(heading.accuracy<1 || !Number.isFinite(heading.magHeading)){setStatus('磁罗盘精度不足。请远离金属，平放手机并缓慢移动校准。');return;}
    onChange(sittingFromFacing(heading.magHeading));
    scheduleWatchdog();
    setStatus(`磁北测量中 · 精度 ${heading.accuracy}/3。手机顶部朝房屋朝外方向；盘面显示相反的坐向。靠近分界请复测。`);
   },()=>{if(active.current){stop();setStatus('磁罗盘暂时不可用，请手动输入读数。');}});
   if(!active.current){watcher.remove();return;}
   subscription.current=watcher;
   setStatus('等待可靠的磁北读数：平放手机，顶部指向房屋朝外方向。');
   scheduleWatchdog();
  } catch {if(active.current){stop();setStatus('无法启动磁罗盘，请手动输入读数。');}}
 };
 return <View style={{gap:12}}>
  <Pressable accessibilityRole="adjustable" accessibilityLabel={`罗盘坐向${d.degree}度`} accessibilityValue={{min:0,max:359,now:Math.round(d.degree)}} accessibilityActions={[{name:'increment'},{name:'decrement'}]} onAccessibilityAction={e=>setManual(normalizeBearing(degree+(e.nativeEvent.actionName==='increment'?1:-1)))} onLayout={e=>setWidth(e.nativeEvent.layout.width)} onPress={e=>{const x=e.nativeEvent.locationX-width/2,y=e.nativeEvent.locationY-width/2;if(Math.hypot(x,y)>20)setManual(Math.round(bearingFromPoint(x,y)));}} style={{width:'100%',aspectRatio:1}}><View pointerEvents="none"><SvgXml xml={luopanSvg(degree)} width={width} height={width}/></View></Pressable>
  <Text gold>坐 {d.degree.toFixed(0)}° · {d.direction} · {d.mountain}山；向 {d.facing.toFixed(0)}° · {bearingDetails(d.facing).mountain}山</Text>
  <View style={{flexDirection:'row',gap:8}}>{[0,90,180,270].map((v,i)=><Pressable key={v} onPress={()=>setManual(v)} accessibilityRole="button" style={{flex:1,minHeight:44,justifyContent:'center',alignItems:'center',backgroundColor:'#263e3a',borderRadius:8}}><Text gold>{['北','东','南','西'][i]} {v}°</Text></Pressable>)}</View>
  <Pressable onPress={()=>void measure()} accessibilityRole="button" style={{minHeight:44,justifyContent:'center',alignItems:'center',backgroundColor:'#263e3a',borderRadius:8,borderWidth:1,borderColor:'#9e8656'}}><Text gold>{measuring?'停止手机测量':'用手机测朝向'}</Text></Pressable>
  <Text variant="caption" muted>{status}</Text>
  <Text>手动方位盘：点击盘面或输入指南针读数。站在房屋内朝外测量，若朝向为东 90°，坐向应填 270°。红针表示选定的坐向，每格 15°；靠近分界时多测几次。</Text>
  <Text variant="caption" muted>手动转盘不是实测。手机测量使用磁北与设备传感器；金属、磁场和校准状态会影响读数。精度不足时请使用实体罗盘复核。</Text>
 </View>;
}
