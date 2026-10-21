import type { VedicInput } from "@atlas/shared-types";
/** Portable offline astronomy; no WASM / Node native addon required by Hermes.
 * Mean lunar node and linear Lahiri approximation are explicitly disclosed.
 */
import { Astronomy, planetLongitude, ascendantMidheaven, normalizeDegrees, validateBirthInput } from "../astronomy.ts";
import { lahiriAyanamsa } from "./ayanamsa.ts";
import { buildVedicChart } from "./chart.ts";
import { resolveVedicBirth } from "./birth.ts";
import type { VedicEphemerisData, VedicGrahaKey } from "./types.ts";
export function mobileVedicEphemeris(input:VedicInput={}):VedicEphemerisData {
 const r=resolveVedicBirth(input);
 const date=validateBirthInput(r.birthDate,r.birthTime,r.birthLat,r.birthLng,r.timezone);
 const julianDay=date.getTime()/86400000+2440587.5;
 const ayanamsa=lahiriAyanamsa(julianDay);
 const T=(julianDay-2451545)/36525;
 const grahaLongitudes={} as Record<VedicGrahaKey,number>;
 for(const key of ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"] as const)
  grahaLongitudes[key]=normalizeDegrees(planetLongitude(Astronomy.Body[key],date)-ayanamsa);
 // Meeus, Astronomical Algorithms, mean ascending node of lunar orbit (degrees).
 const meanNode=125.04452-1934.136261*T+0.0020708*T*T+T*T*T/450000;
 grahaLongitudes.Rahu=normalizeDegrees(meanNode-ayanamsa);
 grahaLongitudes.Ketu=normalizeDegrees(grahaLongitudes.Rahu+180);
 const {asc,mc}=ascendantMidheaven(date,r.birthLat,r.birthLng);
 return {julianDay,ayanamsa,ascendantLongitude:normalizeDegrees(asc-ayanamsa),midheavenLongitude:normalizeDegrees(mc-ayanamsa),grahaLongitudes};
}
export function computeMobileVedic(input:VedicInput={}) {
 const result=buildVedicChart(mobileVedicEphemeris(input),resolveVedicBirth(input));
 return {...result,algorithmVersion:"vedic-astronomy-v1",note:"离线 Astronomy Engine 地心黄经；近似 Lahiri 岁差、平均月交点、整宫制。"+result.note};
}
