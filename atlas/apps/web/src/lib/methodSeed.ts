/** Stable seed from user inputs (same inputs → same engine output). */
export function buildMethodSeed(methodId: string, parts: Array<string | number | undefined | null>): string {
  const body = parts
    .filter((part) => part != null && part !== "")
    .map(String)
    .join("|");
  return `${methodId}:${body || "default"}`;
}
