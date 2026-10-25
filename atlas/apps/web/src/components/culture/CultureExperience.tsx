import { CultureResearchPanel } from "./CultureResearchPanel";
import { PrincipleScene } from "./PrincipleScene";
import { useEffect, useState, type CSSProperties } from "react";
import { getCultureLesson, SPAIN_CULTURE } from "@atlas/method-data";
import "./culture.css";
const ART = Object.fromEntries(Object.entries(import.meta.glob("../../../../../packages/method-data/assets/culture/*.webp", {eager:true,query:"?url",import:"default"})).map(([path,url])=>[path.split("/").pop()!.split(".")[0],url as string]));
export function CultureExperience({methodId}:{methodId:string}) {
 const lesson=getCultureLesson(methodId);
 const [open,setOpen]=useState(false),[step,setStep]=useState(0),[tick,setTick]=useState(0),[note,setNote]=useState(""),[saved,setSaved]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{setOpen(false);setStep(0);setNote("");setSaved(false);setMessage("");try{const p=JSON.parse(localStorage.getItem(`atlas.culture.v1.${methodId}`)??"null");if(p){setNote(typeof p.note==="string"?p.note:"");setSaved(p.completed===true);}}catch{}},[methodId]);
 if(!lesson)return null;
 const save=()=>{try{localStorage.setItem(`atlas.culture.v1.${methodId}`,JSON.stringify({version:1,completed:true,note,updatedAt:new Date().toISOString()}));setSaved(true);setMessage("已保存在此浏览器。");}catch{setMessage("保存失败，请检查浏览器存储设置。");}};
 return <section className="culture-card" aria-label="文明小课">
  <button className="culture-card__toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><img src={ART[lesson.scene]} width="88" height="88" alt={`${lesson.concept}主题插画`} loading="lazy"/><span><small>文明小课 · {saved?"已学习":"约 3 分钟"}</small><strong>{lesson.title}</strong><span>{open?"收起课程 −":"看见 · 读懂 · 带走 ＋"}</span></span></button>
  {open&&<div className="culture-card__body"><div className="culture-tabs" role="group" aria-label="课程步骤">{["看见","读懂","带走"].map((label,i)=><button key={label} aria-pressed={step===i} onClick={()=>setStep(i)}>{i+1} {label}</button>)}</div>
  {!(methodId==="iching"&&step===1)&&<div className="culture-stage" role="img" aria-label={`操作示意：${lesson.stages[step]}`}><div className={`culture-tokens culture-tokens--${lesson.kind}`} key={`${step}-${tick}`}>{lesson.symbols.map((s,i)=><span key={i} style={{"--i":i} as CSSProperties}>{s}</span>)}</div><strong>{lesson.stages[step]}</strong><small>文化操作示意 · 不生成或改变占卜结果</small></div>}
  {methodId==="iching"&&step===1&&<PrincipleScene/>}
  <p>{[lesson.observe,lesson.understand,lesson.practice][step]}</p>
  {step===2&&<label>我的文化学习笔记<textarea value={note} maxLength={1200} rows={3} onChange={e=>{setNote(e.target.value);setSaved(false);}} placeholder="留下一句自己的理解（只保存在此浏览器）"/></label>}
  <div className="culture-actions"><button onClick={()=>setTick(tick+1)}>重播示意</button><button onClick={()=>step<2?setStep(step+1):save()}>{step<2?"下一步":saved?"更新笔记":"完成并保存"}</button></div>
  <small>{lesson.distinction}</small><small>说明与练习：Atlas 编写。场景：AI 创作插画。</small>
  {lesson.sourceUrl?<a href={lesson.sourceUrl} target="_blank" rel="noreferrer">查看资料 · {lesson.sourceTitle} ↗</a>:<small>{lesson.sourceTitle}</small>}
  <span role="status">{message}</span></div>}
  <CultureResearchPanel methodId={methodId}/>
 </section>;
}
export function SpainCultureCard(){return <details className="culture-card culture-spain"><summary><img src={ART.spain} width="88" height="88" alt="西班牙纸牌器物主题插画" loading="lazy"/><span><small>文化探索 · 西班牙</small><strong>{SPAIN_CULTURE.title}</strong></span></summary><div className="culture-card__body"><p>{SPAIN_CULTURE.body}</p><p>{SPAIN_CULTURE.prompt}</p><small>{SPAIN_CULTURE.boundary}</small><a href={SPAIN_CULTURE.sourceUrl} target="_blank" rel="noreferrer">{SPAIN_CULTURE.sourceTitle} ↗</a></div></details>;}
