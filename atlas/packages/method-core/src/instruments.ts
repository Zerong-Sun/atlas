export const COMPASS_MOUNTAINS = ['子','癸','丑','艮','寅','甲','卯','乙','辰','巽','巳','丙','午','丁','未','坤','申','庚','酉','辛','戌','乾','亥','壬'];
export function normalizeBearing(value: number) { return Number.isFinite(value) ? ((value % 360) + 360) % 360 : 0; }
/** Round a measured facing to a whole-degree sitting direction without returning 360. */
export function sittingFromFacing(facing: number) { return normalizeBearing(Math.round(facing + 180)); }
export function bearingFromPoint(x: number, y: number) { return normalizeBearing(Math.atan2(x, -y) * 180 / Math.PI); }
export function bearingDetails(value: number) {
  const degree = normalizeBearing(value);
  return {degree, mountain:COMPASS_MOUNTAINS[Math.floor((degree + 7.5) / 15) % 24], facing:normalizeBearing(degree + 180), direction:['北','东北','东','东南','南','西南','西','西北'][Math.floor((degree+22.5)/45)%8]};
}
/** Only absolute compass data is accepted; relative alpha must never masquerade as north. */
export function absoluteHeading(event: {webkitCompassHeading?:number;webkitCompassAccuracy?:number;absolute?:boolean;alpha:number|null;beta?:number|null;gamma?:number|null}) {
  if ((event.beta != null && Math.abs(event.beta)>25) || (event.gamma != null && Math.abs(event.gamma)>25)) return null;
  if (Number.isFinite(event.webkitCompassHeading) && (event.webkitCompassAccuracy == null || event.webkitCompassAccuracy >= 0)) return normalizeBearing(event.webkitCompassHeading!);
  return event.absolute && event.alpha != null && Number.isFinite(event.alpha) ? normalizeBearing(360-event.alpha) : null;
}
const point = (r:number,a:number) => `${200+r*Math.sin(a*Math.PI/180)},${200-r*Math.cos(a*Math.PI/180)}`;
const text = (r:number,a:number,label:string,color='#f4e1b3',size=13) => `<text x="0" y="0" transform="translate(${point(r,a)})" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="${size}" font-family="serif">${label}</text>`;
/** A deterministic instrument, not an illustration: north=0, east=90, clockwise bearings. */
export function luopanSvg(value:number) {
  const d=normalizeBearing(value);
  const sectors=['#345e64','#716a42','#37655a','#416c60','#923e32','#796b43','#e2d2a8','#d0c29b'];
  const ring=COMPASS_MOUNTAINS.map((name,i)=>{
    const a=i*15-7.5,b=a+15,c=sectors[Math.floor((i+1)/3)%8];
    return `<path d="M${point(172,a)} A172 172 0 0 1 ${point(172,b)} L${point(126,b)} A126 126 0 0 0 ${point(126,a)}Z" fill="${c}" stroke="#b29a65"/>${text(151,i*15,name,i>=17&&i<=22?'#292c2a':'#fff1d2',17)}`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><radialGradient id="wood"><stop stop-color="#80583c"/><stop offset="1" stop-color="#3e2d24"/></radialGradient><radialGradient id="brass"><stop stop-color="#d4bb7a"/><stop offset="1" stop-color="#8d713d"/></radialGradient><pattern id="grain" width="30" height="20" patternUnits="userSpaceOnUse"><path d="M0 4 Q15 0 30 5 M0 15 Q20 9 30 16" fill="none" stroke="#d7a66c" stroke-opacity=".16"/></pattern></defs><rect x="3" y="3" width="394" height="394" rx="28" fill="url(#wood)"/><rect x="3" y="3" width="394" height="394" rx="28" fill="url(#grain)"/><circle cx="200" cy="200" r="191" fill="url(#brass)" stroke="#d6c08a" stroke-width="3"/><circle cx="200" cy="200" r="181" fill="#223635"/>${Array.from({length:72},(_,i)=>`<path d="M${point(i%6===0?174:179,i*5)} L${point(186,i*5)}" stroke="#e9d8a9"/>`).join('')}${ring}<circle cx="200" cy="200" r="124" fill="#b49961"/><circle cx="200" cy="200" r="115" fill="#1e3635"/>${['坎 ☵','艮 ☶','震 ☳','巽 ☴','离 ☲','坤 ☷','兑 ☱','乾 ☰'].map((s,i)=>text(101,i*45,s)).join('')}${['北','东','南','西'].map((s,i)=>text(64,i*90,s,'#e5ca8e',14)).join('')}<circle cx="200" cy="200" r="45" fill="#ded3b8" stroke="#8e7545" stroke-width="3"/><g transform="rotate(${d} 200 200)"><path d="M200 37 L194 53 L206 53Z" fill="#ffded4"/><path d="M200 155 L190 200 L200 206 L210 200Z" fill="#a3382f"/><path d="M200 245 L190 200 L200 194 L210 200Z" fill="#344d51"/></g><circle cx="200" cy="200" r="6" fill="#bc9951" stroke="#533f27"/></svg>`;
}
export function coinSvg(face:number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="c"><stop stop-color="#b9954c"/><stop offset=".7" stop-color="#95733c"/><stop offset="1" stop-color="#594b2d"/></radialGradient><mask id="hole"><rect width="100" height="100" fill="white"/><rect x="39" y="39" width="22" height="22" fill="black"/></mask></defs><g mask="url(#hole)"><circle cx="50" cy="50" r="46" fill="url(#c)" stroke="#ceb075" stroke-width="2"/><circle cx="50" cy="50" r="40" fill="none" stroke="#4e573c" stroke-width="2"/><path d="M12 29 Q27 20 24 13 M72 84 Q88 76 86 62 M13 62 Q18 74 24 77" stroke="#556b4b" stroke-width="5" opacity=".6" fill="none"/><rect x="35" y="35" width="30" height="30" fill="none" stroke="#d1af67" stroke-width="3"/>${face===2?textCoin():`<path d="M28 32 Q16 50 28 68 M72 32 Q84 50 72 68" stroke="#d4b575" stroke-width="3" fill="none"/>`}</g></svg>`;
}
function textCoin(){return [['乾',50,27],['隆',50,79],['通',76,53],['寶',24,53]].map(([s,x,y])=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" fill="#342f22" font-family="serif" font-size="17" font-weight="bold">${s}</text>`).join('');}
