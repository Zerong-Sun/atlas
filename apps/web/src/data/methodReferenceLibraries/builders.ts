import type { DeepSymbol } from "../methodDeepLibraries";
import type { ReferenceEntry, ReferencePattern } from "./types";

export function toEntry(name: string, nature: string, meaning: string, usage: string): ReferenceEntry {
  return { name, nature, meaning, usage };
}

export function symbolsToEntries(symbols: DeepSymbol[], natureFn?: (symbol: DeepSymbol) => string): ReferenceEntry[] {
  return symbols.map((symbol) => ({
    name: symbol.name,
    nature: natureFn?.(symbol) ?? symbol.group,
    meaning: symbol.meaning,
    usage: symbol.use,
  }));
}

export function groupDeepSymbols(
  symbols: DeepSymbol[],
  groups: Array<{ id: string; label: string; groups: string[] }>
): Array<{ id: string; label: string; items: ReferenceEntry[] }> {
  return groups
    .map(({ id, label, groups: groupNames }) => ({
      id,
      label,
      items: symbolsToEntries(symbols.filter((symbol) => groupNames.includes(symbol.group))),
    }))
    .filter((group) => group.items.length > 0);
}

export function pattern(
  id: string,
  name: string,
  category: string,
  level: ReferencePattern["level"],
  formation: string,
  meaning: string,
  applications: string,
  cautions: string,
  actionHint: string
): ReferencePattern {
  return { id, name, category, level, formation, meaning, applications, cautions, actionHint };
}
