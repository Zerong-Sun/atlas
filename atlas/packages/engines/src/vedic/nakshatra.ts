const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

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

export function nakshatraFromLongitude(lon: number): { name: string; label: string; pada: number } {
  const span = 360 / 27;
  const index = Math.floor(lon / span) % 27;
  const name = NAKSHATRAS[index]!;
  const pada = Math.floor((lon % span) / (span / 4)) + 1;
  return { name, label: NAKSHATRA_ZH[name] ?? name, pada };
}

export function nakshatraLordIndex(moonLongitude: number): number {
  const span = 360 / 27;
  return Math.floor(moonLongitude / span) % 27;
}
