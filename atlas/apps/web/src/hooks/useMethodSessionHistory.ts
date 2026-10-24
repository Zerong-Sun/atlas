import { useCallback, useEffect, useState } from "react";
import { arrayOf, isRecord, isString, readSnapshot, writeSnapshot, type Validator } from "@/lib/persistentStore";

const named = (v: unknown) => isRecord(v) && isString(v.name);
/** Validate fields consumed by the history UI, including nested symbols. */
function validItem(methodId: string, v: unknown): boolean {
  if (!isRecord(v)) return false;
  if (methodId === "numerology") return isString(v.name) && isString(v.birthDate)
    && typeof v.lifePath === "number" && typeof v.personalYear === "number" && isString(v.summary);
  if (!isString(v.seed)) return false;
  switch (methodId) {
    case "oracle": return Array.isArray(v.cards) && v.cards.every(named) && isString(v.summary);
    case "coffee": return Array.isArray(v.zones) && v.zones.every((z) => isRecord(z) && isString(z.zoneLabel) && named(z.symbol)) && isString(v.summary);
    case "scrying": return named(v.crystal) && named(v.color) && named(v.shape) && isString(v.summary);
    case "meihua": return [v.upper, v.lower, v.body, v.use].every(named) && isString(v.relation);
    case "geomancy": return named(v.judge) && isString(v.summary);
    default: return false;
  }
}
export function useMethodSessionHistory<T>(methodId: string, max = 6) {
  const key = `atlas:method_history:${methodId}`;
  const validate = useCallback<Validator<T[]>>(arrayOf((v: unknown): v is T => validItem(methodId, v)), [methodId]);
  const [history, setHistory] = useState<T[]>(() => readSnapshot(key, [], validate));
  useEffect(() => { setHistory(readSnapshot(key, [], validate)); }, [key, validate]);
  const push = useCallback((item: T) => {
    const prev = readSnapshot(key, [], validate);
    const next = [item, ...prev].slice(0, Math.max(1, max));
    writeSnapshot(key, next, validate);
    setHistory(next);
  }, [key, max, validate]);
  return { history, push };
}
