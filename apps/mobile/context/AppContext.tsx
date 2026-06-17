import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "@atlas/shared-types";
import { fetchProfile, updateProfile } from "@/lib/api/profile";
import { getLocalProfile, getOnboardingDone, setLocalProfile, setOnboardingDone } from "@/lib/storage";
import { track } from "@/lib/analytics";

type AppState = {
  ready: boolean;
  onboardingDone: boolean;
  profile: UserProfile | null;
  completeOnboarding: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  saveProfile: (partial: Partial<UserProfile>) => Promise<void>;
};

const AppContext = createContext<AppState | null>(null);

const STARTUP_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setDone] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = useCallback(async () => {
    const local = await getLocalProfile();
    const remote = await fetchProfile();
    setProfile({ ...remote, ...local });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        track("app_open");
        const done = await getOnboardingDone();
        setDone(done);
        const local = await getLocalProfile();
        if (local) setProfile((prev) => ({ ...prev, ...local }) as UserProfile);
        await withTimeout(refreshProfile(), STARTUP_TIMEOUT_MS);
      } catch (e) {
        console.warn("[app] startup failed:", e);
      } finally {
        setReady(true);
      }
    })();
  }, [refreshProfile]);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingDone(true);
    setDone(true);
    try {
      await updateProfile({ onboardingCompleted: true });
    } catch (e) {
      console.warn("[app] onboarding sync failed:", e);
    }
    track("onboarding_complete");
    await withTimeout(refreshProfile(), STARTUP_TIMEOUT_MS);
  }, [refreshProfile]);

  const saveProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      await setLocalProfile(partial);
      setProfile((p) => ({ ...(p ?? {}), ...partial }) as UserProfile);
      try {
        await updateProfile(partial);
      } catch (e) {
        console.warn("[app] profile sync failed:", e);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      ready,
      onboardingDone,
      profile,
      completeOnboarding,
      refreshProfile,
      saveProfile,
    }),
    [ready, onboardingDone, profile, completeOnboarding, refreshProfile, saveProfile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
