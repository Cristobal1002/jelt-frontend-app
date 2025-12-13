import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilters } from "@/contexts/FilterContext";

interface KPIData {
  totalStock: number;
  projectedDemand: number;
  averageCoverage: number;
  atRiskCount: number;
}

export function KPICards() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const { appliedFilters } = useFilters();

  useEffect(() => {
    async function fetchKPIData() {
      try {
        // Get current month inventory data
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        // Calculate month range from date range
        const startMonth = appliedFilters.dateRange.start.getMonth() + 1;
        const endMonth = appliedFilters.dateRange.end.getMonth() + 1;

        let query = supabase
          .from('monthly_inventory')
          .select('quantity, sales, forecast, product_id, products!inner(category, name, sku, site)')
          .eq('year', currentYear)
          .gte('month', startMonth)
          .lte('month', endMonth);

        // Apply site filter
        if (appliedFilters.site !== "all") {
          const siteMap: { [key: string]: string } = {
            main: "Clínica Principal",
            north: "Sucursal Norte",
            west: "Sucursal Oeste",
          };
          query = query.eq('products.site', siteMap[appliedFilters.site]);
        }

        const { data: inventoryData, error } = await query;

        if (error) throw error;

        // Apply search filter
        let filteredData = inventoryData || [];
        if (appliedFilters.search) {
          const searchLower = appliedFilters.search.toLowerCase();
          filteredData = filteredData.filter((item: any) => 
            item.products.sku.toLowerCase().includes(searchLower) || 
            item.products.name.toLowerCase().includes(searchLower)
          );
        }

        // Calculate KPIs
        const totalStock = filteredData.reduce((sum, item) => sum + item.quantity, 0);
        const projectedDemand = filteredData.reduce((sum, item) => sum + item.forecast, 0);
        
        // Calculate average coverage (stock / daily demand)
        const totalDemand = filteredData.reduce((sum, item) => sum + item.sales, 0) || 1;
        const averageCoverage = Math.round((totalStock / totalDemand) * 30);
        
        // Count products with low coverage (less than 15 days)
        const atRiskCount = filteredData.filter(item => {
          const coverage = item.sales > 0 ? (item.quantity / item.sales) * 30 : 999;
          return coverage < 15;
        }).length;

        setKpiData({
          totalStock,
          projectedDemand,
          averageCoverage,
          atRiskCount
        });
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIData();
  }, [appliedFilters]);

  const kpiCards = [
    {
      title: "Projected Demand (30d)",
      subtitle: "AI Prediction",
      value: loading ? "..." : kpiData?.projectedDemand.toLocaleString() || "0",
      unit: "units",
      change: "+8%",
      changeType: "positive" as const,
      insight: "Upward trend detected",
      icon: TrendingUp,
    },
    {
      title: "Current Stock",
      subtitle: "All Sites",
      value: loading ? "..." : kpiData?.totalStock.toLocaleString() || "0",
      unit: "units",
      change: null,
      changeType: "neutral" as const,
      insight: "Optimal level",
      icon: Package,
    },
    {
      title: "Average Coverage",
      subtitle: "Days of Stock",
      value: loading ? "..." : kpiData?.averageCoverage.toString() || "0",
      unit: "days",
      change: "-3 days",
      changeType: "negative" as const,
      insight: "Monitoring recommended",
      icon: TrendingDown,
    },
    {
      title: "Stockout Risk",
      subtitle: "AI Alert",
      value: loading ? "..." : kpiData?.atRiskCount.toString() || "0",
      unit: "SKUs at risk",
      change: null,
      changeType: "warning" as const,
      insight: "Requires attention",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="ai-panel group ai-hover-lift cursor-pointer">
              <div className="ai-panel-glow" />
              <div className="relative p-6 z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`relative p-3 rounded-xl ${
                    kpi.changeType === 'positive' ? 'bg-[hsl(var(--success-glow))]' :
                    kpi.changeType === 'negative' ? 'bg-[hsl(var(--danger-glow))]' :
                    kpi.changeType === 'warning' ? 'bg-[hsl(var(--warning-glow))]' :
                    'bg-muted/50'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      kpi.changeType === 'positive' ? 'text-[hsl(var(--success))]' :
                      kpi.changeType === 'negative' ? 'text-[hsl(var(--danger))]' :
                      kpi.changeType === 'warning' ? 'text-[hsl(var(--warning))]' :
                      'text-muted-foreground'
                    }`} />
                    {(kpi.changeType === 'positive' || kpi.changeType === 'warning') && (
                      <span className="ai-spark absolute -top-1 -right-1" />
                    )}
                  </div>
                  {kpi.change && (
                    <span className={`badge-ai-${
                      kpi.changeType === 'positive' ? 'success' :
                      kpi.changeType === 'negative' ? 'danger' :
                      'warning'
                    }`}>
                      {kpi.change}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <p className="text-xs text-muted-foreground/70">{kpi.subtitle}</p>
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-card-foreground tracking-tight">
                      {kpi.value}
                    </span>
                    <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                  </div>

                  {/* AI Insight */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[hsl(var(--border))]">
                    <div className="ai-spark scale-75" />
                    <p className="text-xs text-[hsl(var(--primary))] font-medium">
                      {kpi.insight}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}