import * as AstronomyModule from "astronomy-engine";
import type { Body } from "astronomy-engine";
export const Astronomy = ("MakeTime" in AstronomyModule ? AstronomyModule : Object.values(AstronomyModule)[0]) as typeof AstronomyModule;
export const normalizeDegrees=(value:number)=>((value%360)+360)%360;
/** Geocentric apparent ecliptic longitude of date. Right ascension is NOT longitude. */
export function planetLongitude(body:Body,date:Date):number {
 return normalizeDegrees(Astronomy.Ecliptic(Astronomy.GeoVector(body,date,true)).elon);
}
export function ascendantMidheaven(date:Date,lat:number,lng:number) {
 const time=Astronomy.MakeTime(date);
 const theta=(Astronomy.SiderealTime(time)*15+lng)*Math.PI/180;
 const eps=Astronomy.e_tilt(time).tobl*Math.PI/180;
 const phi=lat*Math.PI/180;
 return {
  asc:normalizeDegrees(Math.atan2(Math.cos(theta),-(Math.sin(theta)*Math.cos(eps)+Math.tan(phi)*Math.sin(eps)))*180/Math.PI),
  mc:normalizeDegrees(Math.atan2(Math.sin(theta),Math.cos(theta)*Math.cos(eps))*180/Math.PI),
 };
}
export function validateBirthInput(birthDate:string,birthTime:string,lat:number,lng:number,timezone:number) {
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate), t=/^(\d{2}):(\d{2})$/.exec(birthTime);
 if(!m||!t)throw new Error("请填写有效的出生日期 YYYY-MM-DD 与时间 HH:mm");
 const [y,mo,d]=m.slice(1).map(Number),[h,mi]=t.slice(1).map(Number);
 const probe=new Date(Date.UTC(y,mo-1,d));
 if(y<1800||y>2200||probe.getUTCFullYear()!==y||probe.getUTCMonth()!==mo-1||probe.getUTCDate()!==d||h>23||mi>59)throw new Error("出生日期或时间无效（支持 1800–2200 年）");
 if(!Number.isFinite(lat)||Math.abs(lat)>66||!Number.isFinite(lng)||Math.abs(lng)>180)throw new Error("请填写有效经纬度；当前宫位计算支持南北纬 66° 以内");
 if(!Number.isFinite(timezone)||timezone < -12||timezone >14)throw new Error("请填写出生当时的 UTC 时差（-12 至 +14）");
 return new Date(Date.UTC(y,mo-1,d,h,mi)-timezone*3600000);
}
