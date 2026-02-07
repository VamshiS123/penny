import React, { useState } from 'react';
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Routes, Route, Navigate } from "react-router-dom";
import { FinanceProvider, useFinance } from "@/contexts/FinanceContext";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import LoadingAnalysis from "./pages/LoadingAnalysis";
import FinanceBreakdown from "./pages/FinanceBreakdown";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Shop from "./pages/Shop";
import Transactions from "./pages/Transactions";
import TimeCalendar from "./pages/TimeCalendar";
import FinancialTwin from "./pages/FinancialTwin";
import Budgets from "./pages/Budgets";
import Accounts from "./pages/Accounts";
import FutureYou from "./pages/FutureYou";
import Subscriptions from "./pages/Subscriptions";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { IntroVideo } from "./components/IntroVideo";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useFinance();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
};

const App = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <FinanceProvider>
      <TooltipProvider>
        <Toaster theme="light" />
        {showIntro && <IntroVideo onComplete={() => setShowIntro(false)} />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/loading" element={<ProtectedRoute><LoadingAnalysis /></ProtectedRoute>} />
          <Route path="/breakdown" element={<ProtectedRoute><FinanceBreakdown /></ProtectedRoute>} />

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/time-calendar" element={<TimeCalendar />} />
            <Route path="/future-you" element={<FutureYou />} />
            <Route path="/financial-twin" element={<FinancialTwin />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </FinanceProvider>
  );
};

export default App;
