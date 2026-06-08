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
import { ensureAuthSession, isSupabaseConfigured } from "@/lib/supabase";
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setDone] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refreshProfile = useCallback(async () => {
    const local = await getLocalProfile();
    const remote = await fetchProfile();
    setProfile({ ...remote, ...(local as Partial<UserProfile>) });
  }, []);

  useEffect(() => {
    track("app_open");
    (async () => {
      if (isSupabaseConfigured) {
        await ensureAuthSession();
      }
      const done = await getOnboardingDone();
      setDone(done);
      await refreshProfile();
      setReady(true);
    })();
  }, [refreshProfile]);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingDone(true);
    setDone(true);
    await updateProfile({ onboardingCompleted: true });
    track("onboarding_complete");
    await refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(async (partial: Partial<UserProfile>) => {
    await setLocalProfile(partial as Record<string, unknown>);
    setProfile((p) => (p ? { ...p, ...partial } : null));
    await updateProfile(partial);
  }, []);

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
