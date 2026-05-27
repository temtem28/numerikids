import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Chargement immédiat — pages publiques critiques
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Chargement différé — toutes les pages protégées
const LoginStudent        = lazy(() => import("./pages/LoginStudent"));
const ResetPassword       = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail         = lazy(() => import("./pages/VerifyEmail"));
const Dashboard           = lazy(() => import("./pages/Dashboard"));
const SagasHubPage        = lazy(() => import("./pages/SagasHubPage"));
const SagaMapPage         = lazy(() => import("./pages/SagaMapPage"));
const SagaLearningInterface = lazy(() => import("./components/SagaLearningInterface"));
const LearningInterface   = lazy(() => import("./components/LearningInterface"));
const AchievementsPage    = lazy(() => import("./pages/AchievementsPage"));
const StorePage           = lazy(() => import("./pages/StorePage"));
const InventoryPage       = lazy(() => import("./pages/InventoryPage"));
const ShowcasePage        = lazy(() => import("./pages/ShowcasePage"));
const PixelKingdomPage    = lazy(() => import("./pages/PixelKingdomPage"));
const PixelKingdomLeaderboard = lazy(() => import("./pages/PixelKingdomLeaderboard"));
const AdminPanel          = lazy(() => import("./pages/AdminPanel"));
const SecuritySettings    = lazy(() => import("./pages/SecuritySettings"));
const AccountDeletion     = lazy(() => import("./pages/AccountDeletion"));
const BillingDashboard    = lazy(() => import("./pages/BillingDashboard"));
const ReferralDashboard   = lazy(() => import("./pages/ReferralDashboard"));
const HouseholdSettings   = lazy(() => import("./components/HouseholdSettings"));
const ComparisonDashboard = lazy(() => import("./pages/ComparisonDashboard"));
const AnalyticsDashboard  = lazy(() => import("./pages/AnalyticsDashboard"));
const GoalsPage           = lazy(() => import("./pages/GoalsPage"));
const MyGoalsPage         = lazy(() => import("./pages/MyGoalsPage"));
const ChildDashboard      = lazy(() => import("./pages/ChildDashboard"));
const ParentalReportsPage = lazy(() => import("./pages/ParentalReportsPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 text-sm">Chargement…</span>
      </div>
    </div>
  );
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AppProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Public */}
                      <Route path="/" element={<Landing />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/login-student" element={<LoginStudent />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/verify-email" element={<VerifyEmail />} />
                      <Route path="/reset-password" element={<ResetPassword />} />

                      {/* Parent — protégé */}
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/sagas" element={<ProtectedRoute><SagasHubPage /></ProtectedRoute>} />
                      <Route path="/saga/:sagaId" element={<ProtectedRoute allowChildSession><SagaMapPage /></ProtectedRoute>} />
                      <Route path="/saga/:sagaId/lesson/:lessonId" element={<ProtectedRoute allowChildSession><SagaLearningInterface /></ProtectedRoute>} />
                      <Route path="/learn/:childId" element={<ProtectedRoute><LearningInterface /></ProtectedRoute>} />
                      <Route path="/achievements" element={<ProtectedRoute allowChildSession><AchievementsPage /></ProtectedRoute>} />
                      <Route path="/store" element={<ProtectedRoute allowChildSession><StorePage /></ProtectedRoute>} />
                      <Route path="/inventory" element={<ProtectedRoute allowChildSession><InventoryPage /></ProtectedRoute>} />
                      <Route path="/showcase" element={<ProtectedRoute allowChildSession><ShowcasePage /></ProtectedRoute>} />
                      <Route path="/pixel-kingdom" element={<ProtectedRoute allowChildSession><PixelKingdomPage /></ProtectedRoute>} />
                      <Route path="/pixel-kingdom/leaderboard" element={<ProtectedRoute allowChildSession><PixelKingdomLeaderboard /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                      <Route path="/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                      <Route path="/delete-account" element={<ProtectedRoute><AccountDeletion /></ProtectedRoute>} />
                      <Route path="/billing" element={<ProtectedRoute><BillingDashboard /></ProtectedRoute>} />
                      <Route path="/referrals" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
                      <Route path="/household" element={<ProtectedRoute><HouseholdSettings /></ProtectedRoute>} />
                      <Route path="/comparison" element={<ProtectedRoute><ComparisonDashboard /></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                      <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
                      <Route path="/my-goals" element={<ProtectedRoute><MyGoalsPage /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute><ParentalReportsPage /></ProtectedRoute>} />

                      {/* Espace enfant */}
                      <Route path="/child-dashboard" element={<ChildDashboard />} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </BrowserRouter>
            </AppProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
