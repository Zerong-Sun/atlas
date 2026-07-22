import type { VedicInput } from "@atlas/shared-types";

export type { VedicInput };

export const VEDIC_GRAHA_KEYS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

export type VedicGrahaKey = (typeof VEDIC_GRAHA_KEYS)[number];

export interface VedicGraha {
  key: VedicGrahaKey;
  label: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  houseName: string;
}

export interface VedicHouse {
  number: number;
  name: string;
  sign: string;
  occupants: string[];
}

export interface VedicNakshatra {
  name: string;
  label: string;
  pada: number;
}

export interface VedicDashaPeriod {
  lord: string;
  label: string;
  years: number;
}

export interface VedicEphemerisData {
  julianDay: number;
  ayanamsa: number;
  ascendantLongitude: number;
  midheavenLongitude: number;
  grahaLongitudes: Record<VedicGrahaKey, number>;
}

export interface VedicResult {
  moonSign: string;
  moonNakshatra: VedicNakshatra;
  ascendantSign: string;
  ascendantDegree: number;
  mahadashaLord: string;
  mahadashaLabel: string;
  antardashaLord: string;
  antardashaLabel: string;
  mahadashaRemainingYears: number;
  antardashaRemainingYears: number;
  grahas: VedicGraha[];
  houses: VedicHouse[];
  summary: string;
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  birthLat?: number;
  birthLng?: number;
  timezone: number;
  note: string;
}

export interface BuildVedicChartInput {
  birthDate: string;
  birthTime: string;
  birthPlace?: string;
  birthLat?: number;
  birthLng?: number;
  timezone?: number;
}
