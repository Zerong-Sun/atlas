import { LENORMAND_CARDS } from "@atlas/engines/lenormand";

export const LENORMAND_CARD_SLUGS = [
  "rider",
  "clover",
  "ship",
  "house",
  "tree",
  "cloud",
  "snake",
  "coffin",
  "bouquet",
  "scythe",
  "whip",
  "birds",
  "child",
  "fox",
  "bear",
  "stars",
  "stork",
  "dog",
  "tower",
  "garden",
  "mountain",
  "crossroads",
  "mice",
  "heart",
  "ring",
  "book",
  "letter",
  "man",
  "woman",
  "lily",
  "sun",
  "moon",
  "key",
  "fish",
  "anchor",
  "cross",
] as const;

/**
 * Card face directory. Alternates: `bm-dondorf-308` (British Museum, NC license),
 * `game-of-hope-1799`, `didot-1890`. See public/assets/lenormand/ATTRIBUTION.md.
 */
const ASSET_BASE = "/assets/lenormand/classic-dondorf";

export function getLenormandCardImage(id: number): string {
  const slug = LENORMAND_CARD_SLUGS[id - 1] ?? "rider";
  return `${ASSET_BASE}/${String(id).padStart(2, "0")}-${slug}.jpg`;
}

export type LenormandDeckCard = (typeof LENORMAND_CARDS)[number] & {
  slug: string;
  image: string;
};

export const LENORMAND_DECK: LenormandDeckCard[] = LENORMAND_CARDS.map((card) => ({
  ...card,
  slug: LENORMAND_CARD_SLUGS[card.id - 1]!,
  image: getLenormandCardImage(card.id),
}));

export function getLenormandDeckCard(id: number): LenormandDeckCard | undefined {
  return LENORMAND_DECK.find((c) => c.id === id);
}

export function getLenormandDeckCardByName(name: string): LenormandDeckCard | undefined {
  return LENORMAND_DECK.find((c) => c.name === name);
}
