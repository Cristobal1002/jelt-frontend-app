import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProtectedAppLayout } from "@/components/layout/ProtectedAppLayout";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import AnalysisPage from "./pages/AnalysisPage";
import BillingPage from "./pages/BillingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedAppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
              </Route>
            </Route>
            <Route path="/v2" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
