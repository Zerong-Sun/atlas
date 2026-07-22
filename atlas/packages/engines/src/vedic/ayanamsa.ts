/** Lahiri (Chitrapaksha) ayanamsa — matches Swiss Ephemeris SE_SIDM_LAHIRI within ~0.01° */
export function lahiriAyanamsa(julianDayUt: number): number {
  const year = 1900 + (julianDayUt - 2415020.5) / 365.25;
  const yearsFrom1900 = year - 1900;
  const base = 22 + 27 / 60 + 37.69 / 3600;
  return base + yearsFrom1900 * (50.2564 / 3600);
}

export function toSiderealLongitude(tropicalLongitude: number, julianDayUt: number): number {
  const ayanamsa = lahiriAyanamsa(julianDayUt);
  return ((tropicalLongitude - ayanamsa) % 360 + 360) % 360;
}
