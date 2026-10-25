import { coinSvg } from "@atlas/method-core";
import { useEffect, useRef, useState } from "react";
import { YAO_LABELS, type YaoValue } from "@atlas/engines/iching";
import "./coin-cast.css";
export function CoinCastPanel({lines,onCast}:{lines:number[];onCast:(value:number)=>void}){
 const [faces,setFaces]=useState([2,2,2]),[busy,setBusy]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>>(),locked=useRef(false);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{const stop=()=>{if(document.hidden){clearTimeout(timer.current);locked.current=false;setBusy(false);}};document.addEventListener("visibilitychange",stop);return()=>document.removeEventListener("visibilitychange",stop);},[]);
 const cast=()=>{
  if(locked.current||lines.length>=6)return;
  locked.current=true;setBusy(true);const coins=Array.from({length:3},()=>Math.random()<.5?2:3);setFaces(coins);
  const finish=()=>{locked.current=false;setBusy(false);onCast(coins.reduce((a,b)=>a+b,0));};
  const reduced=matchMedia("(prefers-reduced-motion:reduce)").matches||document.documentElement.dataset.atlasMotion==="off";
  if(reduced)finish();else timer.current=setTimeout(finish,650);
 };
 return <div className="coin-panel"><div className={`coin-panel__coins ${busy?"is-rolling":""}`} aria-label={busy?"三枚铜钱投掷中":`三钱示意 ${faces.join("、")}`}>{faces.map((v,i)=><figure key={i}><img src={`data:image/svg+xml,${encodeURIComponent(coinSvg(v))}`} alt={v===2?"铜钱字面，计2":"铜钱背面，计3"}/><figcaption>{busy?"投掷中":v===2?"字 · 2":"背 · 3"}</figcaption></figure>)}</div><small>铜钱为绘制的器物示意。字面记 2，背面记 3；三枚独立投掷。从初爻向上记录。</small><div className="coin-panel__lines">{Array.from({length:6},(_,j)=>5-j).map(i=>{const v=lines[i];return <div key={i}><small>{i===0?"初":i===5?"上":i+1}爻</small><span className={`coin-panel__bar ${!v?"is-empty":v%2?"is-yang":"is-yin"}`}><i/><i/></span><small>{v?`${v} ${YAO_LABELS[v as YaoValue]}`:"待掷"}</small></div>;})}</div><button className="primary-btn" disabled={busy||lines.length>=6} onClick={cast}>{lines.length===6?"六爻已成":busy?"铜钱落定中…":`掷第 ${lines.length+1} 爻`}</button><small>也可录入实体铜钱结果（用于核对）：</small><div className="coin-panel__manual">{([6,7,8,9] as const).map(v=><button key={v} disabled={busy||lines.length>=6} onClick={()=>onCast(v)}>{v} {YAO_LABELS[v]}</button>)}</div></div>;
}
