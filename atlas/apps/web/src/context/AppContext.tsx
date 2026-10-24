import { MOCK_PROFILE } from "@/lib/mock/data";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { UserProfile } from "@atlas/shared-types";
import { fetchProfile, updateProfile } from "@/lib/api/profile";
import { ensureAuthSession, isSupabaseConfigured } from "@/lib/supabase";
import {
  getInterests,
  getLocalProfile,
  getOnboardingDone,
  setLocalProfile,
  setOnboardingDone,
} from "@/lib/storage";
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

  const [syncError, setSyncError] = useState<string | null>(null);
  const active = useRef(false);
  const refreshGeneration = useRef(0);
  const syncTail = useRef(Promise.resolve());
  const pendingSync = useRef<Partial<UserProfile>>({});

  const mergeProfile = useCallback(async (remote: UserProfile) => {
    const [local, interests] = await Promise.all([getLocalProfile(), getInterests()]);
    return {
      ...remote, ...local,
      interests: (local.interests as string[] | undefined)
        ?? (interests.length ? interests : remote.interests),
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const generation = ++refreshGeneration.current;
    try {
      if (isSupabaseConfigured) await ensureAuthSession();
      const remote = isSupabaseConfigured ? await fetchProfile(true) : MOCK_PROFILE;
      // Re-read after the network request: the user may have edited while it was pending.
      const merged = await mergeProfile(remote);
      if (active.current && generation === refreshGeneration.current) setProfile(merged);
    } catch {
      if (active.current && generation === refreshGeneration.current) {
        setSyncError("云端资料暂时不可用，当前继续使用本机资料。");
      }
    }
  }, [mergeProfile]);

  const syncProfile = useCallback((partial: Partial<UserProfile>) => {
    if (!isSupabaseConfigured) return;
    pendingSync.current = { ...pendingSync.current, ...partial };
    // Preserve update order without making local interaction wait for the network.
    syncTail.current = syncTail.current.then(async () => {
      const patch = pendingSync.current;
      if (!Object.keys(patch).length) return;
      await ensureAuthSession();
      await updateProfile(patch, true);
      pendingSync.current = Object.fromEntries(Object.entries(pendingSync.current)
        .filter(([key, value]) => !Object.is(patch[key as keyof UserProfile], value)));
      if (active.current) setSyncError(null);
    }).catch(() => {
      if (active.current) setSyncError("资料暂未同步到云端，当前修改已在本机保留。请稍后重试保存。");
    });
  }, []);

  useEffect(() => {
    active.current = true;
    let cancelled = false;
    track("app_open");
    void (async () => {
      try {
        const [done, local] = await Promise.all([getOnboardingDone(), mergeProfile(MOCK_PROFILE)]);
        if (cancelled) return;
        setDone(done);
        setProfile(local);
      } finally {
        if (!cancelled) setReady(true);
      }
      if (!cancelled && isSupabaseConfigured) void refreshProfile();
    })().catch(() => { if (!cancelled) setReady(true); });
    return () => {
      cancelled = true;
      active.current = false;
      refreshGeneration.current += 1;
    };
  }, [mergeProfile, refreshProfile]);

  const saveProfile = useCallback(async (partial: Partial<UserProfile>) => {
    refreshGeneration.current += 1;
    await setLocalProfile(partial as Record<string, unknown>);
    if (active.current) setProfile((previous) => {
      const base = previous ?? MOCK_PROFILE;
      if (Object.entries(partial).every(([key, value]) => Object.is(base[key as keyof UserProfile], value))) return previous;
      return { ...base, ...partial };
    });
    syncProfile(partial);
  }, [syncProfile]);

  const completeOnboarding = useCallback(async () => {
    await setOnboardingDone(true);
    await saveProfile({ onboardingCompleted: true });
    if (active.current) setDone(true);
    track("onboarding_complete");
  }, [saveProfile]);

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

  return <AppContext.Provider value={value}>
    {syncError && <div className="storage-notice" role="status">{syncError}</div>}
    {children}
  </AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
