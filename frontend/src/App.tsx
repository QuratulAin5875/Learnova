import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AdminRoute, ProtectedRoute } from './components/RouteGuards';

// Code-split route modules to eliminate large initial JS bundle
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const SignupPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.SignupPage }))
);
const LoginPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.LoginPage }))
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/AuthPages').then((m) => ({ default: m.ForgotPasswordPage }))
);
const OnboardingPage = lazy(() =>
  import('./pages/OnboardingAndDiagnostic').then((m) => ({ default: m.OnboardingPage }))
);
const DiagnosticPage = lazy(() =>
  import('./pages/OnboardingAndDiagnostic').then((m) => ({ default: m.DiagnosticPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardAndRoadmap').then((m) => ({ default: m.DashboardPage }))
);
const RoadmapPage = lazy(() =>
  import('./pages/DashboardAndRoadmap').then((m) => ({ default: m.RoadmapPage }))
);
const RecommendationsPage = lazy(() =>
  import('./pages/LearnerPages').then((m) => ({ default: m.RecommendationsPage }))
);
const TopicStudyPage = lazy(() =>
  import('./pages/LearnerPages').then((m) => ({ default: m.TopicStudyPage }))
);
const PracticeAndMicroAssessmentPage = lazy(() =>
  import('./pages/LearnerPages').then((m) => ({ default: m.PracticeAndMicroAssessmentPage }))
);
const ProgressPage = lazy(() =>
  import('./pages/LearnerPages').then((m) => ({ default: m.ProgressPage }))
);
const AssessmentHistoryPage = lazy(() =>
  import('./pages/LearnerPages').then((m) => ({ default: m.AssessmentHistoryPage }))
);
const ProfileAndCertificatesPage = lazy(() =>
  import('./pages/LearnerPages').then((m) => ({ default: m.ProfileAndCertificatesPage }))
);
const PublicLearnerProfilePage = lazy(() =>
  import('./pages/PublicAndSettingsPages').then((m) => ({
    default: m.PublicLearnerProfilePage,
  }))
);
const LearnerSearchPage = lazy(() =>
  import('./pages/PublicAndSettingsPages').then((m) => ({ default: m.LearnerSearchPage }))
);
const SettingsAndCoursesPage = lazy(() =>
  import('./pages/PublicAndSettingsPages').then((m) => ({
    default: m.SettingsAndCoursesPage,
  }))
);
const HelpAndArchitecturePage = lazy(() =>
  import('./pages/PublicAndSettingsPages').then((m) => ({
    default: m.HelpAndArchitecturePage,
  }))
);
const VerifyCertificatePage = lazy(() =>
  import('./pages/PublicAndSettingsPages').then((m) => ({
    default: m.VerifyCertificatePage,
  }))
);
const AdminSubjectsAndGraphPage = lazy(() =>
  import('./pages/AdminAndGuardPages').then((m) => ({
    default: m.AdminSubjectsAndGraphPage,
  }))
);
const AdminQuestionsPage = lazy(() =>
  import('./pages/AdminAndGuardPages').then((m) => ({ default: m.AdminQuestionsPage }))
);
const AdminResourcesPage = lazy(() =>
  import('./pages/AdminAndGuardPages').then((m) => ({ default: m.AdminResourcesPage }))
);
const Forbidden403Page = lazy(() =>
  import('./pages/AdminAndGuardPages').then((m) => ({ default: m.Forbidden403Page }))
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-xs font-semibold text-slate-500">
      Loading Learnova module...
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public & Auth Flows (Figma p01–p15, p73–p74) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify" element={<VerifyCertificatePage />} />
            <Route path="/u/:username" element={<PublicLearnerProfilePage />} />

            {/* Authenticated Learner Flows (Protected by JWT Session Guard) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diagnostic"
              element={
                <ProtectedRoute>
                  <DiagnosticPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <RoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <RecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/topics/:id"
              element={
                <ProtectedRoute>
                  <TopicStudyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <PracticeAndMicroAssessmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <AssessmentHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileAndCertificatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learners"
              element={
                <ProtectedRoute>
                  <LearnerSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsAndCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpAndArchitecturePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/403"
              element={
                <ProtectedRoute>
                  <Forbidden403Page />
                </ProtectedRoute>
              }
            />

            {/* Role-Guarded Admin Console (Requires user.role === 'admin', else redirects to /403) */}
            <Route
              path="/admin/subjects"
              element={
                <AdminRoute>
                  <AdminSubjectsAndGraphPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <AdminRoute>
                  <AdminQuestionsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <AdminRoute>
                  <AdminResourcesPage />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
