import {
  buildVedicChart,
  normalizeBrowserEphemeris,
  toSiderealLongitude,
  type VedicGrahaKey,
  type VedicResult,
} from "@atlas/engines/vedic";
import type { VedicInput } from "@atlas/shared-types";
import { SwissEphemeris } from "@swisseph/browser";

const PLANET = {
  Sun: 0,
  Moon: 1,
  Mercury: 2,
  Venus: 3,
  Mars: 4,
  Jupiter: 5,
  Saturn: 6,
  MeanNode: 10,
} as const;

const MOSHIER_EPHEMERIS_FLAG = 4;
type SwissHouseSystem = Parameters<SwissEphemeris["calculateHouses"]>[3];

const WHOLE_SIGN_HOUSE_SYSTEM = "W" as SwissHouseSystem;

const GRAHA_PLANETS: Array<{ key: VedicGrahaKey; body: number }> = [
  { key: "Sun", body: PLANET.Sun },
  { key: "Moon", body: PLANET.Moon },
  { key: "Mars", body: PLANET.Mars },
  { key: "Mercury", body: PLANET.Mercury },
  { key: "Jupiter", body: PLANET.Jupiter },
  { key: "Venus", body: PLANET.Venus },
  { key: "Saturn", body: PLANET.Saturn },
];

let swePromise: Promise<SwissEphemeris> | null = null;
let sweInitError: Error | null = null;

async function getSwe(): Promise<SwissEphemeris> {
  if (sweInitError) throw sweInitError;
  if (!swePromise) {
    swePromise = (async () => {
      try {
        const swe = new SwissEphemeris();
        await swe.init();
        return swe;
      } catch (error) {
        sweInitError = error instanceof Error ? error : new Error("Swiss Ephemeris init failed");
        swePromise = null;
        throw sweInitError;
      }
    })();
  }
  return swePromise;
}

function resolveBirth(input: VedicInput) {
  const birthDate = input.birthDate?.trim() || "1990-06-15";
  const birthTime = input.birthTime?.trim() || "12:00";
  const timezone = input.timezone ?? 8;
  const birthLat = input.birthLat ?? 39.9042;
  const birthLng = input.birthLng ?? 116.4074;
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const utcHour = (hour ?? 12) - timezone + (minute ?? 0) / 60;
  return { birthDate, birthTime, timezone, birthLat, birthLng, year, month, day, utcHour };
}

export async function computeVedicAsync(input: VedicInput = {}): Promise<VedicResult> {
  const swe = await getSwe();
  const birth = resolveBirth(input);

  const jd = swe.julianDay(birth.year, birth.month ?? 1, birth.day ?? 1, birth.utcHour);
  const flags = MOSHIER_EPHEMERIS_FLAG;
  const houses = swe.calculateHouses(jd, birth.birthLat, birth.birthLng, WHOLE_SIGN_HOUSE_SYSTEM);

  const siderealGrahas = {} as Record<VedicGrahaKey, number>;
  for (const { key, body } of GRAHA_PLANETS) {
    const pos = swe.calculatePosition(jd, body, flags);
    siderealGrahas[key] = toSiderealLongitude(pos.longitude, jd);
  }

  const rahu = swe.calculatePosition(jd, PLANET.MeanNode, flags);
  siderealGrahas.Rahu = toSiderealLongitude(rahu.longitude, jd);
  siderealGrahas.Ketu = (siderealGrahas.Rahu + 180) % 360;

  const ephemeris = normalizeBrowserEphemeris(jd, houses.ascendant, houses.mc, siderealGrahas);

  return buildVedicChart(ephemeris, {
    birthDate: birth.birthDate,
    birthTime: birth.birthTime,
    birthPlace: input.birthPlace,
    birthLat: birth.birthLat,
    birthLng: birth.birthLng,
    timezone: birth.timezone,
  });
}

/** Reset cached WASM instance (e.g. after hot reload failures in dev). */
export function resetVedicEphemerisCache(): void {
  swePromise = null;
  sweInitError = null;
}
