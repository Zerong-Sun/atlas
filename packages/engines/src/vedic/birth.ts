import type { VedicInput } from "@atlas/shared-types";

export const VEDIC_DEFAULT_LAT = 39.9042;
export const VEDIC_DEFAULT_LNG = 116.4074;
export const VEDIC_DEFAULT_TZ = 8;

export interface ResolvedVedicBirth {
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  birthLat: number;
  birthLng: number;
  timezone: number;
  year: number;
  month: number;
  day: number;
  utcHour: number;
}

export function parseUtcHour(birthTime: string, timezone: number): number {
  const [hour, minute] = birthTime.split(":").map(Number);
  return (hour ?? 12) - timezone + (minute ?? 0) / 60;
}

export function resolveVedicBirth(input: VedicInput = {}): ResolvedVedicBirth {
  const birthDate = input.birthDate?.trim() || "1990-06-15";
  const birthTime = input.birthTime?.trim() || "12:00";
  const timezone = input.timezone ?? VEDIC_DEFAULT_TZ;
  const [year, month, day] = birthDate.split("-").map(Number);

  return {
    birthDate,
    birthTime,
    birthPlace: input.birthPlace,
    birthLat: input.birthLat ?? VEDIC_DEFAULT_LAT,
    birthLng: input.birthLng ?? VEDIC_DEFAULT_LNG,
    timezone,
    year: year ?? 1990,
    month: month ?? 6,
    day: day ?? 15,
    utcHour: parseUtcHour(birthTime, timezone),
  };
}

export function birthMomentUtc(resolved: Pick<ResolvedVedicBirth, "year" | "month" | "day" | "utcHour">): Date {
  const hour = Math.floor(resolved.utcHour);
  const minute = Math.round((resolved.utcHour - hour) * 60);
  return new Date(Date.UTC(resolved.year, resolved.month - 1, resolved.day, hour, minute));
}
