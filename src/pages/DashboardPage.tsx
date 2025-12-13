import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlobalFilters } from "@/components/dashboard/GlobalFilters";
import { KPICards } from "@/components/dashboard/KPICards";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { ReorderTable } from "@/components/dashboard/ReorderTable";
import { StockChart } from "@/components/dashboard/StockChart";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { SupplierPerformance } from "@/components/dashboard/SupplierPerformance";
import { AIInsightsFeed } from "@/components/dashboard/AIInsightsFeed";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { Loader2 } from "lucide-react";
import { FilterProvider } from "@/contexts/FilterContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }
  return (
    <FilterProvider>
      <div className="min-h-screen bg-background ai-background">
        {/* Header */}
        <DashboardHeader />
        
        {/* Smart Filters */}
        <GlobalFilters />
        
        {/* AI KPI Panels */}
        <KPICards />
        
        {/* Main AI Dashboard Grid */}
        <div className="max-w-[1600px] mx-auto px-6 pb-6">
          {/* Top Section - AI Prediction (wider) & Jenny AI (narrower) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ForecastChart />
            </div>
            <AIAssistantCard />
          </div>

          {/* Full Width AI Insights Feed */}
          <div className="mb-6">
            <AIInsightsFeed />
          </div>

          {/* Middle Section - 3 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AlertsList />
            <ReorderTable />
            <StockChart />
          </div>
        </div>
        
        {/* Supplier Intelligence */}
        <SupplierPerformance />
        
        {/* Footer */}
        <footer className="border-t border-[hsl(var(--border))] bg-muted/10 backdrop-blur-sm mt-8">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gradient-ai flex items-center justify-center">
                  <span className="text-xs font-bold text-white">J</span>
                </div>
                <p>© 2025 Jelt Inventory — Intelligent Inventory Management</p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Privacy</a>
                <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Terms</a>
                <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}