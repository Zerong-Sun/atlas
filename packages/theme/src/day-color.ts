/** 24 atmospheric day pigments — client-only, keyed by ISO date */
export type DayColor = {
  id: string;
  nameEn: string;
  a: string;
  b: string;
};

export const DAY_COLORS: readonly DayColor[] = [
  { id: "celadon-dawn", nameEn: "Celadon Dawn", a: "#B8D4C8", b: "#7A9E8E" },
  { id: "mist-rose", nameEn: "Mist Rose", a: "#E8D0D4", b: "#C4A0A8" },
  { id: "nautical-grey", nameEn: "Nautical Grey", a: "#A8B8C8", b: "#6A7A8E" },
  { id: "apricot-haze", nameEn: "Apricot Haze", a: "#F0D8C0", b: "#D4A878" },
  { id: "horizon-blue", nameEn: "Horizon Blue", a: "#B0C8E0", b: "#6888B0" },
  { id: "lichen-mist", nameEn: "Lichen Mist", a: "#C8D8C0", b: "#8AA878" },
  { id: "dusk-lilac", nameEn: "Dusk Lilac", a: "#D0C8E0", b: "#9888B8" },
  { id: "sand-fog", nameEn: "Sand Fog", a: "#E8E0D0", b: "#C0B090" },
  { id: "steel-dawn", nameEn: "Steel Dawn", a: "#C0C8D0", b: "#8898A8" },
  { id: "peach-glow", nameEn: "Peach Glow", a: "#F0D4C8", b: "#D09888" },
  { id: "fjord-green", nameEn: "Fjord Green", a: "#A8C8B8", b: "#5A8878" },
  { id: "cloud-amber", nameEn: "Cloud Amber", a: "#E8D8B0", b: "#C8A868" },
  { id: "polar-sky", nameEn: "Polar Sky", a: "#C8E0F0", b: "#78A8C8" },
  { id: "heather-dew", nameEn: "Heather Dew", a: "#D8C8E0", b: "#A088B8" },
  { id: "clay-morning", nameEn: "Clay Morning", a: "#E0C8B8", b: "#B08878" },
  { id: "sage-breath", nameEn: "Sage Breath", a: "#C0D4C8", b: "#88A898" },
  { id: "twilight-teal", nameEn: "Twilight Teal", a: "#98C8C0", b: "#4A8880" },
  { id: "blush-fog", nameEn: "Blush Fog", a: "#F0D0D8", b: "#D0A0B0" },
  { id: "slate-dawn", nameEn: "Slate Dawn", a: "#B8C0C8", b: "#788898" },
  { id: "honey-mist", nameEn: "Honey Mist", a: "#F0E0C0", b: "#D0B878" },
  { id: "reef-azure", nameEn: "Reef Azure", a: "#A0D0E0", b: "#5898B8" },
  { id: "moss-haze", nameEn: "Moss Haze", a: "#C0D0B0", b: "#88A070" },
  { id: "wine-dusk", nameEn: "Wine Dusk", a: "#D0B8C0", b: "#987088" },
  { id: "moon-silver", nameEn: "Moon Silver", a: "#D8E0E8", b: "#A0A8B8" },
] as const;

export function hashDateSeed(date: string): number {
  let h = 2166136261;
  for (let i = 0; i < date.length; i++) {
    h ^= date.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function resolveDayColor(date: string): DayColor {
  const idx = hashDateSeed(date) % DAY_COLORS.length;
  return DAY_COLORS[idx]!;
}

/** Resolve by any arbitrary seed string (e.g. `${userId}-${date}` for server-side) */
export function resolveDayColorBySeed(seed: string): DayColor {
  const idx = hashDateSeed(seed) % DAY_COLORS.length;
  return DAY_COLORS[idx]!;
}

export function buildEntryIdBySeed(dateCompact: string, seed: string): string {
  const tag = (hashDateSeed(seed) % 65536).toString(16).toUpperCase().padStart(4, "0");
  return `ATLAS-${dateCompact}-${tag}`;
}

export function buildEntryId(date: string): string {
  const compact = date.replace(/-/g, "");
  const tag = (hashDateSeed(date) % 65536).toString(16).toUpperCase().padStart(4, "0");
  return `ATLAS-${compact}-${tag}`;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

export function formatEntryLabel(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return `ENTRY · ${date}`;
  const mon = MONTHS[d.getMonth()] ?? "---";
  const day = String(d.getDate()).padStart(2, "0");
  return `ENTRY · ${mon} ${day}`;
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** True when day gradient reads as light — use dark text on slip */
export function isDayFieldLight(day: DayColor): boolean {
  const mid = (relativeLuminance(day.a) + relativeLuminance(day.b)) / 2;
  return mid > 0.45;
}
