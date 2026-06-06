export type DeepLibraryRaw = {
  title: string;
  cat: string;
  sym: string;
  rules: string;
  modes: string;
  axes: string;
  out: string;
};

export type DeepSymbolSpec = [name: string, group: string, meaning: string, use: string];

export function buildRaw(
  title: string,
  categories: string[],
  symbols: DeepSymbolSpec[],
  rules: string[],
  modes: string[],
  axes: string[],
  outputs: string[]
): DeepLibraryRaw {
  return {
    title,
    cat: categories.join("|"),
    sym: symbols.map(([name, group, meaning, use]) => `${name}/${group}/${meaning}/${use}`).join(";"),
    rules: rules.join("|"),
    modes: modes.join("|"),
    axes: axes.join("|"),
    out: outputs.join("|"),
  };
}
