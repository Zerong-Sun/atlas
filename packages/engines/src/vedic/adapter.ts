import { lahiriAyanamsa, toSiderealLongitude } from "./ayanamsa.ts";
import type { VedicEphemerisData, VedicGrahaKey } from "./types.ts";

/** Build ephemeris payload from browser Swiss Ephemeris (tropical asc, sidereal grahas) */
export function normalizeBrowserEphemeris(
  jd: number,
  tropicalAsc: number,
  tropicalMc: number,
  siderealGrahas: Record<VedicGrahaKey, number>,
): VedicEphemerisData {
  return {
    julianDay: jd,
    ayanamsa: lahiriAyanamsa(jd),
    ascendantLongitude: toSiderealLongitude(tropicalAsc, jd),
    midheavenLongitude: toSiderealLongitude(tropicalMc, jd),
    grahaLongitudes: siderealGrahas,
  };
}
