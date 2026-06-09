import * as AstronomyModule from "astronomy-engine";
import type { VedicInput } from "@atlas/shared-types";

const Astronomy = (
  (AstronomyModule as { default?: typeof AstronomyModule }).default ?? AstronomyModule
) as typeof AstronomyModule;

const LAHIRI_AYANAMSA = 24.1;

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const NAKSHATRA_ZH: Record<string, string> = {
  Ashwini: "白羊 Ashwini", Bharani: "白羊 Bharani", Krittika: "金牛 Krittika",
  Rohini: "金牛 Rohini", Mrigashira: "双子 Mrigashira", Ardra: "双子 Ardra",
  Punarvasu: "巨蟹 Punarvasu", Pushya: "巨蟹 Pushya", Ashlesha: "巨蟹 Ashlesha",
  Magha: "狮子 Magha", "Purva Phalguni": "狮子 Purva Phalguni", "Uttara Phalguni": "处女 Uttara Phalguni",
  Hasta: "处女 Hasta", Chitra: "天秤 Chitra", Swati: "天秤 Swati", Vishakha: "天蝎 Vishakha",
  Anuradha: "天蝎 Anuradha", Jyeshtha: "天蝎 Jyeshtha", Mula: "射手 Mula",
  "Purva Ashadha": "射手 Purva Ashadha", "Uttara Ashadha": "摩羯 Uttara Ashadha",
  Shravana: "摩羯 Shravana", Dhanishta: "水瓶 Dhanishta", Shatabhisha: "水瓶 Shatabhisha",
  "Purva Bhadrapada": "双鱼 Purva Bhadrapada", "Uttara Bhadrapada": "双鱼 Uttara Bhadrapada",
  Revati: "双鱼 Revati",
};

const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;
const DASHA_ZH: Record<string, string> = {
  Ketu: "计都", Venus: "金星", Sun: "太阳", Moon: "月亮", Mars: "火星",
  Rahu: "罗睺", Jupiter: "木星", Saturn: "土星", Mercury: "水星",
};

const SIGNS = [
  "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
  "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
];

function siderealLongitude(tropical: number): number {
  return ((tropical - LAHIRI_AYANAMSA) % 360 + 360) % 360;
}

function signFromLongitude(lon: number): string {
  return SIGNS[Math.floor(lon / 30) % 12]!;
}

function nakshatraFromLongitude(lon: number): { name: string; label: string; pada: number } {
  const index = Math.floor(lon / (360 / 27)) % 27;
  const name = NAKSHATRAS[index]!;
  const pada = Math.floor((lon % (360 / 27)) / (360 / 27 / 4)) + 1;
  return { name, label: NAKSHATRA_ZH[name] ?? name, pada };
}

function vimshottariLord(birthDate: string): string {
  const year = Number(birthDate.slice(0, 4)) || 2000;
  const index = year % DASHA_ORDER.length;
  return DASHA_ORDER[index]!;
}

export interface VedicResult {
  moonSign: string;
  moonNakshatra: { name: string; label: string; pada: number };
  ascendantSign: string;
  mahadashaLord: string;
  mahadashaLabel: string;
  summary: string;
  birthDate: string;
  birthTime: string;
  note: string;
}

export function computeVedic(input: VedicInput): VedicResult {
  const birthDate = input.birthDate?.trim() || "1990-06-15";
  const birthTime = input.birthTime?.trim() || "12:00";
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, hour ?? 12, minute ?? 0));

  const moon = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, date, true));
  const sun = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Sun, date, true));
  const moonSidereal = siderealLongitude(moon.elon);
  const sunSidereal = siderealLongitude(sun.elon);

  const moonSign = signFromLongitude(moonSidereal);
  const moonNakshatra = nakshatraFromLongitude(moonSidereal);
  const ascendantSign = signFromLongitude((sunSidereal + 90) % 360);

  const mahadashaLord = vimshottariLord(birthDate);
  const mahadashaLabel = DASHA_ZH[mahadashaLord] ?? mahadashaLord;

  const summary = `月亮 ${moonSign} · ${moonNakshatra.label} 第${moonNakshatra.pada}足；上升 ${ascendantSign}；当前大运主星 ${mahadashaLabel}。`;
  const note = "MVP：含月亮星宿、上升与简化大运，非完整吠陀宫位详盘。";

  return {
    moonSign,
    moonNakshatra,
    ascendantSign,
    mahadashaLord,
    mahadashaLabel,
    summary,
    birthDate,
    birthTime,
    note,
  };
}
