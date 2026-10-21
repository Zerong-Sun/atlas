import {useState} from "react";
/** Modern visual interpretation of the two Image commentaries, not a divination. */
export function PrincipleScene(){
 const [earth,setEarth]=useState(false),[replay,setReplay]=useState(0);
 return <div className="principle-scene"><div className="culture-tabs"><button aria-pressed={!earth} onClick={()=>{setEarth(false);setReplay(replay+1);}}>乾 · 自强不息</button><button aria-pressed={earth} onClick={()=>{setEarth(true);setReplay(replay+1);}}>坤 · 厚德载物</button></div>
 <svg key={`${earth}-${replay}`} viewBox="0 0 320 160" role="img" aria-label={earth?"大地托住树木、房屋与人，表现承载与照料":"太阳从地平线升起再运行，表现持续的行动"}>
 <rect width="320" height="160" rx="12" fill="#152d35"/><path d="M20 110 Q160 -40 300 110" fill="none" stroke="#748784" strokeDasharray="3 6"/>
 <g className={earth?"":"principle-sun"}><circle cx="160" cy="36" r="16" fill="#e8c47e"/><circle cx="160" cy="36" r="24" fill="none" stroke="#e8c47e" opacity=".25"/></g>
 <path d="M0 128 L58 82 112 130 200 79 272 117 320 94V160H0Z" fill="#345454"/>
 <path d="M0 140 Q70 105 160 137 T320 130V160H0Z" fill={earth?"#947a51":"#52786b"}/>
 {earth&&<g className="principle-life"><path d="M53 127V96M40 105L53 81 67 105Z" stroke="#90b393" fill="#618a70" strokeWidth="4"/><path d="M135 130V108H161V130M129 108L148 91 168 108" stroke="#e3c89e" fill="#a28a64" strokeWidth="3"/><circle cx="243" cy="108" r="6" fill="#e8d7b4"/><path d="M243 115V137M232 122H254" stroke="#e8d7b4" strokeWidth="4"/></g>}
 </svg><p><strong>{earth?"地势坤，君子以厚德载物。":"天行健，君子以自强不息。"}</strong></p><p>{earth?"看：同一片大地容纳树木、房屋与人。懂：承载的比喻指向修养与容纳。做：今天为谁提供一次具体支持？":"看：天空持续运行，日光沿轨迹移动。懂：借天的运行谈持续修养，并非要求自己永不休息。做：选一件值得长期练习的小事。"}</p><small>《周易·象传》原句；动画与白话为现代教学表达。</small></div>;
}
