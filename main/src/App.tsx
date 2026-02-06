import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FinanceProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/loading" element={<LoadingAnalysis />} />
            <Route path="/breakdown" element={<FinanceBreakdown />} />
            <Route element={<DashboardLayout />}>
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
        </BrowserRouter>
      </TooltipProvider>
    </FinanceProvider>
  </QueryClientProvider>
);

export default App;
