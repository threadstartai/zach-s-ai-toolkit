import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Stack from "./pages/Stack.tsx";
import WorkWithMe from "./pages/WorkWithMe.tsx";
import NotFound from "./pages/NotFound.tsx";
import ResultLayout from "./pages/result/ResultLayout.tsx";
import MyStack from "./pages/result/surfaces/MyStack.tsx";
import Login from "./pages/auth/Login.tsx";
import Signup from "./pages/auth/Signup.tsx";
import ForgotPassword from "./pages/auth/ForgotPassword.tsx";
import ResetPassword from "./pages/auth/ResetPassword.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import DashboardShell from "./pages/dashboard/DashboardShell.tsx";
import DashboardIndex from "./pages/dashboard/DashboardIndex.tsx";
import Tonight from "./pages/result/surfaces/Tonight.tsx";
import Saved from "./pages/result/surfaces/Saved.tsx";
import AllTools from "./pages/result/surfaces/AllTools.tsx";
import Foundations from "./pages/result/surfaces/Foundations.tsx";
import WorkWithZach from "./pages/result/surfaces/WorkWithZach.tsx";
import BriefingMethod from "./pages/result/surfaces/BriefingMethod.tsx";
import CheckBeforeTrust from "./pages/result/surfaces/CheckBeforeTrust.tsx";
import Settings from "./pages/dashboard/Settings.tsx";
import StepFocus from "./pages/dashboard/StepFocus.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public marketing */}
            <Route path="/" element={<Index />} />
            <Route path="/stack" element={<Stack />} />
            <Route path="/work-with-me" element={<WorkWithMe />} />

            {/* Public anonymous result (legacy share links) */}
            <Route path="/stack/result/:sessionId" element={<ResultLayout />}>
              <Route index element={<Navigate to="my-stack" replace />} />
              <Route path="my-stack" element={<MyStack />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Protected step focus (full-bleed, no dashboard chrome) */}
            <Route
              path="/dashboard/stacks/:sessionId/step"
              element={
                <ProtectedRoute>
                  <StepFocus />
                </ProtectedRoute>
              }
            />

            {/* Protected dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardIndex />} />
              <Route path="settings" element={<Settings />} />
              <Route path="stacks/:sessionId" element={<ResultLayout chrome="dashboard" />}>
                <Route index element={<Navigate to="my-stack" replace />} />
                <Route path="my-stack" element={<MyStack />} />
                <Route path="tonight" element={<Tonight />} />
                <Route path="saved" element={<Saved />} />
                <Route path="all-tools" element={<AllTools />} />
                <Route path="briefing-method" element={<BriefingMethod />} />
                <Route path="check-before-trust" element={<CheckBeforeTrust />} />
                <Route path="foundations" element={<Foundations />} />
                <Route path="work-with-zach" element={<WorkWithZach />} />
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
