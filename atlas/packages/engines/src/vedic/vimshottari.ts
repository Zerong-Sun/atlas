import { nakshatraLordIndex } from "./nakshatra.ts";
import { birthMomentUtc, type ResolvedVedicBirth } from "./birth.ts";

export const DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"] as const;

export const DASHA_YEARS: Record<(typeof DASHA_ORDER)[number], number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const DASHA_ZH: Record<string, string> = {
  Ketu: "计都", Venus: "金星", Sun: "太阳", Moon: "月亮", Mars: "火星",
  Rahu: "罗睺", Jupiter: "木星", Saturn: "土星", Mercury: "水星",
};

function lordAt(orderIndex: number): (typeof DASHA_ORDER)[number] {
  return DASHA_ORDER[((orderIndex % 9) + 9) % 9]!;
}

function antardashaYears(mahaLord: (typeof DASHA_ORDER)[number], subLord: (typeof DASHA_ORDER)[number]): number {
  return (DASHA_YEARS[subLord] / 120) * DASHA_YEARS[mahaLord];
}

export function vimshottariAtDate(
  moonLongitude: number,
  birth: Pick<ResolvedVedicBirth, "birthDate" | "birthTime" | "timezone" | "year" | "month" | "day" | "utcHour">,
  referenceDate: Date = new Date(),
): {
  mahadashaLord: string;
  mahadashaLabel: string;
  antardashaLord: string;
  antardashaLabel: string;
  mahadashaRemainingYears: number;
  antardashaRemainingYears: number;
} {
  const nakIndex = nakshatraLordIndex(moonLongitude);
  const startLordIndex = nakIndex % 9;
  const span = 360 / 27;
  const positionInNak = moonLongitude % span;
  const remainingFraction = 1 - positionInNak / span;
  const firstLord = lordAt(startLordIndex);
  const firstYears = DASHA_YEARS[firstLord] * remainingFraction;

  const birthDate = birthMomentUtc(birth);
  const ageYears = Math.max(0, (referenceDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  let cursor = 0;
  let orderIdx = startLordIndex;
  let mahadashaLord = firstLord;
  let mahadashaYears = firstYears;

  if (ageYears > firstYears) {
    cursor = firstYears;
    orderIdx = startLordIndex + 1;
    while (cursor + DASHA_YEARS[lordAt(orderIdx)]! < ageYears) {
      cursor += DASHA_YEARS[lordAt(orderIdx)]!;
      orderIdx += 1;
    }
    mahadashaLord = lordAt(orderIdx);
    mahadashaYears = DASHA_YEARS[mahadashaLord]!;
  }

  const mahadashaElapsed = ageYears - cursor;
  const mahadashaRemainingYears = Math.max(0, mahadashaYears - mahadashaElapsed);

  const mahaOrderIdx = DASHA_ORDER.indexOf(mahadashaLord);
  let antCursor = 0;
  let antardashaLord = mahadashaLord;
  let antardashaYearsTotal = antardashaYears(mahadashaLord, antardashaLord);

  for (let sub = 0; sub < 9; sub += 1) {
    const subLord = lordAt(mahaOrderIdx + sub);
    const years = antardashaYears(mahadashaLord, subLord);
    if (mahadashaElapsed < antCursor + years) {
      antardashaLord = subLord;
      antardashaYearsTotal = years;
      break;
    }
    antCursor += years;
  }

  const antardashaElapsed = mahadashaElapsed - antCursor;
  const antardashaRemainingYears = Math.max(0, antardashaYearsTotal - antardashaElapsed);

  return {
    mahadashaLord,
    mahadashaLabel: DASHA_ZH[mahadashaLord] ?? mahadashaLord,
    antardashaLord,
    antardashaLabel: DASHA_ZH[antardashaLord] ?? antardashaLord,
    mahadashaRemainingYears: Math.round(mahadashaRemainingYears * 10) / 10,
    antardashaRemainingYears: Math.round(antardashaRemainingYears * 10) / 10,
  };
}
