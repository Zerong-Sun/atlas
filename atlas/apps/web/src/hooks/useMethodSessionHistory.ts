import { useCallback, useState } from "react";

const MAX_DEFAULT = 6;

function readHistory<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeHistory<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function useMethodSessionHistory<T>(methodId: string, max = MAX_DEFAULT) {
  const key = `atlas:method_history:${methodId}`;
  const [history, setHistory] = useState<T[]>(() => readHistory<T>(key));

  const push = useCallback(
    (item: T) => {
      setHistory((prev) => {
        const next = [item, ...prev].slice(0, max);
        writeHistory(key, next);
        return next;
      });
    },
    [key, max],
  );

  return { history, push };
}
