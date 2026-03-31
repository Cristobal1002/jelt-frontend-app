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
import { cn } from "@/lib/utils";

export default function AnalysisPage() {
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
        <div className="max-w-[1600px] mx-auto px-6 pt-6 pb-2">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Análisis</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Indicadores, pronósticos, historial y proveedores — mismos componentes que en el tablero, con filtros por sitio y fechas.
          </p>
        </div>

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
      </div>
    </FilterProvider>
  );
}
