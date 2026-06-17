import {
  calculateHouses,
  calculatePosition,
  getAyanamsa,
  julianDay,
  setSiderealMode,
} from "@swisseph/node";
import {
  CalculationFlag,
  HouseSystem,
  LunarPoint,
  Planet,
  SiderealMode,
} from "@swisseph/node";
import type { VedicInput } from "@atlas/shared-types";
import type { VedicEphemerisData, VedicGrahaKey } from "./types.ts";
import { buildVedicChart } from "./chart.ts";
import { resolveVedicBirth } from "./birth.ts";
import { toSiderealLongitude } from "./ayanamsa.ts";

export function getVedicEphemerisData(input: VedicInput = {}): VedicEphemerisData {
  setSiderealMode(SiderealMode.Lahiri);

  const birth = resolveVedicBirth(input);
  const jd = julianDay(birth.year, birth.month, birth.day, birth.utcHour);

  const siderealFlags = CalculationFlag.MoshierEphemeris | CalculationFlag.Sidereal;
  const houses = calculateHouses(jd, birth.birthLat, birth.birthLng, HouseSystem.WholeSign);

  const rahu = calculatePosition(jd, LunarPoint.MeanNode, siderealFlags);

  const grahaLongitudes: Record<VedicGrahaKey, number> = {
    Sun: calculatePosition(jd, Planet.Sun, siderealFlags).longitude,
    Moon: calculatePosition(jd, Planet.Moon, siderealFlags).longitude,
    Mars: calculatePosition(jd, Planet.Mars, siderealFlags).longitude,
    Mercury: calculatePosition(jd, Planet.Mercury, siderealFlags).longitude,
    Jupiter: calculatePosition(jd, Planet.Jupiter, siderealFlags).longitude,
    Venus: calculatePosition(jd, Planet.Venus, siderealFlags).longitude,
    Saturn: calculatePosition(jd, Planet.Saturn, siderealFlags).longitude,
    Rahu: rahu.longitude,
    Ketu: (rahu.longitude + 180) % 360,
  };

  return {
    julianDay: jd,
    ayanamsa: getAyanamsa(jd),
    ascendantLongitude: toSiderealLongitude(houses.ascendant, jd),
    midheavenLongitude: toSiderealLongitude(houses.mc, jd),
    grahaLongitudes,
  };
}

export function computeVedic(input: VedicInput = {}) {
  const birth = resolveVedicBirth(input);
  const ephemeris = getVedicEphemerisData(input);
  return buildVedicChart(ephemeris, {
    birthDate: birth.birthDate,
    birthTime: birth.birthTime,
    birthPlace: birth.birthPlace,
    birthLat: birth.birthLat,
    birthLng: birth.birthLng,
    timezone: birth.timezone,
  });
}
