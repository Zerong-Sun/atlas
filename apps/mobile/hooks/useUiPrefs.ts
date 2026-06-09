import { useCallback, useEffect, useState } from "react";
import { DEFAULT_UI_PREFS, getUiPrefs, saveUiPrefs, type UiPrefs } from "@/lib/uiPrefs";

export function useUiPrefs() {
  const [prefs, setPrefs] = useState<UiPrefs>(DEFAULT_UI_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void getUiPrefs().then((loaded) => {
      setPrefs(loaded);
      setReady(true);
    });
  }, []);

  const updatePrefs = useCallback(async (partial: Partial<UiPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      void saveUiPrefs(next);
      return next;
    });
  }, []);

  return { prefs, ready, updatePrefs };
}
