import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { MainLayout } from "@/layouts/MainLayout";
import { colors } from "@/theme/tokens";

const TodayPage = lazy(() => import("@/pages/TodayPage").then((m) => ({ default: m.TodayPage })));
const AskPage = lazy(() => import("@/pages/AskPage").then((m) => ({ default: m.AskPage })));
const DreamPage = lazy(() => import("@/pages/DreamPage").then((m) => ({ default: m.DreamPage })));
const MethodsPage = lazy(() => import("@/pages/MethodsPage").then((m) => ({ default: m.MethodsPage })));
const BaziPage = lazy(() => import("@/pages/BaziPage").then((m) => ({ default: m.BaziPage })));
const TarotPage = lazy(() => import("@/pages/TarotPage").then((m) => ({ default: m.TarotPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const LibraryPage = lazy(() => import("@/pages/LibraryPage").then((m) => ({ default: m.LibraryPage })));
const ReadingPage = lazy(() => import("@/pages/ReadingPage").then((m) => ({ default: m.ReadingPage })));
const InterestsPage = lazy(() =>
  import("@/pages/onboarding/InterestsPage").then((m) => ({ default: m.InterestsPage }))
);
const ProfileOnboardingPage = lazy(() =>
  import("@/pages/onboarding/ProfileOnboardingPage").then((m) => ({ default: m.ProfileOnboardingPage }))
);
const PortraitPage = lazy(() =>
  import("@/pages/onboarding/PortraitPage").then((m) => ({ default: m.PortraitPage }))
);

function BootScreen() {
  return (
    <div className="boot" role="status" aria-live="polite">
      <span>诸象</span>
      <style>{`
        .boot {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, ${colors.mist}22 0%, ${colors.night} 45%);
          color: ${colors.gold};
          font-size: 24px;
          letter-spacing: 0.2em;
          animation: boot-fade 0.5s ease forwards;
        }
        @keyframes boot-fade {
          from { background: linear-gradient(180deg, ${colors.mist}55 0%, ${colors.nightElevated} 100%); }
          to { background: ${colors.night}; }
        }
        @media (prefers-reduced-motion: reduce) {
          .boot { animation: none; background: ${colors.night}; }
        }
      `}</style>
    </div>
  );
}

function OnboardingGuard({ children }: { children: ReactNode }) {
  const { ready, onboardingDone } = useApp();
  const location = useLocation();
  const inOnboarding = location.pathname.startsWith("/onboarding");

  if (!ready) return <BootScreen />;

  if (!onboardingDone && !inOnboarding) {
    return <Navigate to="/onboarding/interests" replace />;
  }

  if (onboardingDone && inOnboarding) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <OnboardingGuard>
      <Suspense fallback={<BootScreen />}>
        <Routes>
          <Route path="/onboarding/interests" element={<InterestsPage />} />
          <Route path="/onboarding/profile" element={<ProfileOnboardingPage />} />
          <Route path="/onboarding/portrait" element={<PortraitPage />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/methods" element={<MethodsPage />} />
            <Route path="/methods/bazi" element={<BaziPage />} />
            <Route path="/methods/tarot" element={<TarotPage />} />
            <Route path="/dream" element={<DreamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/library" element={<LibraryPage />} />
          </Route>

          <Route path="/reading/:id" element={<ReadingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </OnboardingGuard>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
