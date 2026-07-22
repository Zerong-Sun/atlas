import { useCallback, useEffect, useRef, useState } from "react";
import { getMethodDraft, setMethodDraft } from "@/lib/methodWorkbenchPrefs";

export function useMethodDraft<T extends Record<string, unknown>>(
  methodId: string,
  initial: T,
): [T, (patch: Partial<T>) => void, boolean] {
  const [draft, setDraft] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    void getMethodDraft<T>(methodId).then((stored) => {
      if (!mounted) return;
      setDraft({ ...initial, ...(stored ?? {}) });
      hydratedRef.current = true;
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, [methodId]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const timer = setTimeout(() => {
      void setMethodDraft(methodId, draft);
    }, 250);
    return () => clearTimeout(timer);
  }, [methodId, draft]);

  const updateDraft = useCallback((patch: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  return [draft, updateDraft, hydrated];
}
