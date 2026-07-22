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
const BaziRelationshipPage = lazy(() =>
  import("@/pages/BaziRelationshipPage").then((m) => ({ default: m.BaziRelationshipPage }))
);
const TarotPage = lazy(() => import("@/pages/TarotPage").then((m) => ({ default: m.TarotPage })));
const LenormandPage = lazy(() => import("@/pages/LenormandPage").then((m) => ({ default: m.LenormandPage })));
const JiaobeiPage = lazy(() => import("@/pages/JiaobeiPage").then((m) => ({ default: m.JiaobeiPage })));
const RunesPage = lazy(() => import("@/pages/RunesPage").then((m) => ({ default: m.RunesPage })));
const AstrodicePage = lazy(() => import("@/pages/AstrodicePage").then((m) => ({ default: m.AstrodicePage })));
const LotPage = lazy(() => import("@/pages/LotPage").then((m) => ({ default: m.LotPage })));
const LiuyaoPage = lazy(() => import("@/pages/LiuyaoPage").then((m) => ({ default: m.LiuyaoPage })));
const IchingPage = lazy(() => import("@/pages/IchingPage").then((m) => ({ default: m.IchingPage })));
const WesternPage = lazy(() => import("@/pages/WesternPage").then((m) => ({ default: m.WesternPage })));
const FengshuiPage = lazy(() => import("@/pages/FengshuiPage").then((m) => ({ default: m.FengshuiPage })));
const ZiweiPage = lazy(() => import("@/pages/ZiweiPage").then((m) => ({ default: m.ZiweiPage })));
const MethodModulePage = lazy(() =>
  import("@/pages/MethodModulePage").then((m) => ({ default: m.MethodModulePage }))
);
const QimenPage = lazy(() => import("@/pages/QimenPage").then((m) => ({ default: m.QimenPage })));
const MeihuaPage = lazy(() => import("@/pages/MeihuaPage").then((m) => ({ default: m.MeihuaPage })));
const VedicPage = lazy(() => import("@/pages/VedicPage").then((m) => ({ default: m.VedicPage })));
const NumerologyPage = lazy(() => import("@/pages/NumerologyPage").then((m) => ({ default: m.NumerologyPage })));
const GeomancyPage = lazy(() => import("@/pages/GeomancyPage").then((m) => ({ default: m.GeomancyPage })));
const XiangmianPage = lazy(() => import("@/pages/XiangmianPage").then((m) => ({ default: m.XiangmianPage })));
const PalmistryPage = lazy(() => import("@/pages/PalmistryPage").then((m) => ({ default: m.PalmistryPage })));
const OraclePage = lazy(() => import("@/pages/OraclePage").then((m) => ({ default: m.OraclePage })));
const CoffeePage = lazy(() => import("@/pages/CoffeePage").then((m) => ({ default: m.CoffeePage })));
const ScryingPage = lazy(() => import("@/pages/ScryingPage").then((m) => ({ default: m.ScryingPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const LibraryPage = lazy(() => import("@/pages/LibraryPage").then((m) => ({ default: m.LibraryPage })));
const ReadingPage = lazy(() => import("@/pages/ReadingPage").then((m) => ({ default: m.ReadingPage })));
const ArchiveEntryPage = lazy(() =>
  import("@/pages/ArchiveEntryPage").then((m) => ({ default: m.ArchiveEntryPage }))
);
const WelcomePage = lazy(() =>
  import("@/pages/onboarding/WelcomePage").then((m) => ({ default: m.WelcomePage }))
);
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
    return <Navigate to="/onboarding/welcome" replace />;
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
          <Route path="/onboarding/welcome" element={<WelcomePage />} />
          <Route path="/onboarding/interests" element={<InterestsPage />} />
          <Route path="/onboarding/profile" element={<ProfileOnboardingPage />} />
          <Route path="/onboarding/portrait" element={<PortraitPage />} />
          <Route path="/onboarding/*" element={<Navigate to="/onboarding/welcome" replace />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/methods" element={<MethodsPage />} />
            <Route path="/methods/bazi" element={<BaziPage />} />
            <Route path="/methods/bazi-relationship" element={<BaziRelationshipPage />} />
            <Route path="/methods/tarot" element={<TarotPage />} />
            <Route path="/methods/lenormand" element={<LenormandPage />} />
            <Route path="/methods/jiaobei" element={<JiaobeiPage />} />
            <Route path="/methods/runes" element={<RunesPage />} />
            <Route path="/methods/astrodice" element={<AstrodicePage />} />
            <Route path="/methods/lot" element={<LotPage />} />
            <Route path="/methods/liuyao" element={<LiuyaoPage />} />
            <Route path="/methods/iching" element={<IchingPage />} />
            <Route path="/methods/iching/workbench" element={<MethodModulePage methodId="iching" />} />
            <Route path="/methods/western" element={<WesternPage />} />
            <Route path="/methods/fengshui" element={<FengshuiPage />} />
            <Route path="/methods/ziwei" element={<ZiweiPage />} />
            <Route path="/methods/qimen" element={<QimenPage />} />
            <Route path="/methods/meihua" element={<MeihuaPage />} />
            <Route path="/methods/vedic" element={<VedicPage />} />
            <Route path="/methods/numerology" element={<NumerologyPage />} />
            <Route path="/methods/geomancy" element={<GeomancyPage />} />
            <Route path="/methods/xiangmian" element={<XiangmianPage />} />
            <Route path="/methods/palmistry" element={<PalmistryPage />} />
            <Route path="/methods/oracle" element={<OraclePage />} />
            <Route path="/methods/coffee" element={<CoffeePage />} />
            <Route path="/methods/scrying" element={<ScryingPage />} />
            <Route path="/methods/:methodId" element={<MethodModulePage />} />
            <Route path="/dream" element={<DreamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/reading/:id" element={<ReadingPage />} />
            <Route path="/archive/:id" element={<ArchiveEntryPage />} />
          </Route>
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
