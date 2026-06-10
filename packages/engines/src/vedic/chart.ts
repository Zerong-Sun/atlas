import type {
  BuildVedicChartInput,
  VedicEphemerisData,
  VedicGraha,
  VedicGrahaKey,
  VedicHouse,
  VedicResult,
} from "./types.ts";
import { VEDIC_GRAHA_KEYS } from "./types.ts";
import { resolveVedicBirth } from "./birth.ts";
import { nakshatraFromLongitude } from "./nakshatra.ts";
import { vimshottariAtDate } from "./vimshottari.ts";

const SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
];

const HOUSE_NAMES = [
  "第一宫", "第二宫", "第三宫", "第四宫", "第五宫", "第六宫",
  "第七宫", "第八宫", "第九宫", "第十宫", "第十一宫", "第十二宫",
];

const GRAHA_LABELS: Record<VedicGrahaKey, string> = {
  Sun: "太阳", Moon: "月亮", Mars: "火星", Mercury: "水星",
  Jupiter: "木星", Venus: "金星", Saturn: "土星", Rahu: "罗睺", Ketu: "计都",
};

function signFromLongitude(lon: number): { sign: string; degree: number } {
  const index = Math.floor(lon / 30) % 12;
  return { sign: SIGNS[index]!, degree: Math.round((lon % 30) * 10) / 10 };
}

function wholeSignHouse(planetLon: number, ascLon: number): number {
  const ascSign = Math.floor(ascLon / 30);
  const planetSign = Math.floor(planetLon / 30);
  return ((planetSign - ascSign + 12) % 12) + 1;
}

function buildHouses(ascLon: number, grahas: VedicGraha[]): VedicHouse[] {
  const ascSign = Math.floor(ascLon / 30);
  return HOUSE_NAMES.map((name, i) => {
    const signIndex = (ascSign + i) % 12;
    const occupants = grahas
      .filter((g) => g.house === i + 1)
      .map((g) => g.label);
    return {
      number: i + 1,
      name,
      sign: SIGNS[signIndex]!,
      occupants,
    };
  });
}

export function buildVedicChart(
  ephemeris: VedicEphemerisData,
  input: BuildVedicChartInput,
): VedicResult {
  const birthDate = input.birthDate.trim() || "1990-06-15";
  const birthTime = input.birthTime.trim() || "12:00";
  const timezone = input.timezone ?? 8;

  const ascSidereal = ephemeris.ascendantLongitude;
  const asc = signFromLongitude(ascSidereal);

  const grahas: VedicGraha[] = VEDIC_GRAHA_KEYS.map((key) => {
    const longitude = ephemeris.grahaLongitudes[key];
    const { sign, degree } = signFromLongitude(longitude);
    const house = wholeSignHouse(longitude, ascSidereal);
    return {
      key,
      label: GRAHA_LABELS[key],
      longitude,
      sign,
      degree,
      house,
      houseName: HOUSE_NAMES[house - 1]!,
    };
  });

  const moon = grahas.find((g) => g.key === "Moon")!;
  const moonNakshatra = nakshatraFromLongitude(moon.longitude);
  const dasha = vimshottariAtDate(moon.longitude, resolveVedicBirth({
    birthDate,
    birthTime,
    timezone,
    birthPlace: input.birthPlace,
    birthLat: input.birthLat,
    birthLng: input.birthLng,
  }));

  const houses = buildHouses(ascSidereal, grahas);

  const summary = [
    `月亮 ${moon.sign} · ${moonNakshatra.label} 第${moonNakshatra.pada}足`,
    `上升 ${asc.sign} ${asc.degree}°`,
    `大运 ${dasha.mahadashaLabel}（余约 ${dasha.mahadashaRemainingYears} 年）`,
    `小运 ${dasha.antardashaLabel}（余约 ${dasha.antardashaRemainingYears} 年）`,
  ].join("；");

  return {
    moonSign: moon.sign,
    moonNakshatra,
    ascendantSign: asc.sign,
    ascendantDegree: asc.degree,
    mahadashaLord: dasha.mahadashaLord,
    mahadashaLabel: dasha.mahadashaLabel,
    antardashaLord: dasha.antardashaLord,
    antardashaLabel: dasha.antardashaLabel,
    mahadashaRemainingYears: dasha.mahadashaRemainingYears,
    antardashaRemainingYears: dasha.antardashaRemainingYears,
    grahas,
    houses,
    summary,
    birthDate,
    birthTime,
    birthPlace: input.birthPlace,
    birthLat: input.birthLat,
    birthLng: input.birthLng,
    timezone,
    note: "含 Whole Sign 宫位与 Vimshottari 大运；不含分盘 Navamsa、Drishti 与行运。",
  };
}
