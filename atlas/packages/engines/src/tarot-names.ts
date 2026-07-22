/** Canonical RWS Chinese names aligned with web tarotDeck.ts */
export const TAROT_NAME_ALIASES: Record<string, string> = {
  塔: "高塔",
};

export function normalizeTarotCardName(name: string): string {
  return TAROT_NAME_ALIASES[name] ?? name;
}

export function tarotNamesMatch(a: string, b: string): boolean {
  return normalizeTarotCardName(a) === normalizeTarotCardName(b);
}
