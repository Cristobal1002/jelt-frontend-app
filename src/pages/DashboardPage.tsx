import { GlobalFilters } from "@/components/dashboard/GlobalFilters";
import { KPICards } from "@/components/dashboard/KPICards";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { ReorderTable } from "@/components/dashboard/ReorderTable";
import { StockChart } from "@/components/dashboard/StockChart";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { SupplierPerformance } from "@/components/dashboard/SupplierPerformance";
import { AIInsightsFeed } from "@/components/dashboard/AIInsightsFeed";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { SalesHistoryTable } from "@/components/dashboard/SalesHistoryTable";
import { MovementsHistoryTable } from "@/components/dashboard/MovementsHistoryTable";
import { ReplenishmentTable } from "@/components/dashboard/ReplenishmentTable";
import { ReplenishmentMetrics } from "@/components/dashboard/ReplenishmentMetrics";
import { FilterProvider } from "@/contexts/FilterContext";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { JeltLogo } from "@/components/branding/JeltLogo";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { layoutMode } = useLayoutMode();
  const isClassic = layoutMode === "classic";

  return (
    <FilterProvider>
      <div
        className={cn(
          "bg-background text-foreground",
          isClassic ? "min-h-full" : "min-h-screen ai-background",
        )}
      >
        <GlobalFilters />

        <KPICards />

        <div className="max-w-[1600px] mx-auto px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <ForecastChart />
            </div>
            <AIAssistantCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ReplenishmentMetrics />
            <ReplenishmentTable />
          </div>

          <div className="grid grid-cols-1 gap-6 mb-6">
            <SalesHistoryTable />
            <MovementsHistoryTable />
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 pb-6">
          <div className="mb-6">
            <AIInsightsFeed />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AlertsList />
            <ReorderTable />
            <StockChart />
          </div>
        </div>

        <SupplierPerformance />

        <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 mt-8">
          <div className="max-w-[1600px] mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <JeltLogo className="h-6 max-h-6 w-auto max-w-[72px] opacity-90" />
                <p>© 2026 Jelt — Inventario de insumos médicos</p>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-[hsl(var(--primary))] transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </FilterProvider>
  );
}
