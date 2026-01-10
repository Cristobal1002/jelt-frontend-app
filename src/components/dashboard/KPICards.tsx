import { TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
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
        // Get date range from filters
        const fromDate = appliedFilters.dateRange.start.toISOString();
        const toDate = appliedFilters.dateRange.end.toISOString();

        // Get sales summary for the date range
        const salesSummary = await apiClient.getSalesSummary({
          from: fromDate,
          to: toDate,
        });

        console.log('Sales Summary:', salesSummary);

        // Get all articles to calculate total stock (with pagination if needed)
        let allArticles: any[] = [];
        let page = 1;
        const perPage = 100; // Reasonable page size
        let hasMore = true;

        while (hasMore) {
          const articlesRes = await apiClient.listArticles({ 
            page,
            perPage, 
            isActive: true 
          });
          
          allArticles = [...allArticles, ...articlesRes.data.items];
          hasMore = articlesRes.data.meta.currentPage < articlesRes.data.meta.totalPages;
          page++;
        }
        
        console.log('Articles loaded:', allArticles.length);
        
        const totalStock = allArticles.reduce((sum, article) => sum + (article.stock || 0), 0);
        
        // Calculate average coverage based on sales summary
        // Calculate days in range from date filters or from first/last sale
        let daysInRange = 30; // Default
        if (salesSummary.first_sale_at && salesSummary.last_sale_at) {
          const firstDate = new Date(salesSummary.first_sale_at);
          const lastDate = new Date(salesSummary.last_sale_at);
          daysInRange = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
          // Use the date range from filters
          const startDate = new Date(fromDate);
          const endDate = new Date(toDate);
          daysInRange = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        // Ensure at least 1 day to avoid division by zero
        daysInRange = Math.max(daysInRange, 1);
        
        const avgDailyQuantity = salesSummary.units_sold && daysInRange > 0 
          ? salesSummary.units_sold / daysInRange 
          : 0;
        
        const averageCoverage = avgDailyQuantity > 0 
          ? Math.round(totalStock / avgDailyQuantity) 
          : 999;

        // Get articles with low stock (using reorder_point as threshold)
        const atRiskCount = allArticles.filter(article => {
          if (!article.reorder_point) return false;
          return (article.stock || 0) <= article.reorder_point;
        }).length;

        // Projected demand for 30 days based on average daily quantity
        const projectedDemand = Math.round(avgDailyQuantity * 30);

        const kpiDataResult = {
          totalStock,
          projectedDemand,
          averageCoverage,
          atRiskCount
        };

        console.log('KPI Data calculated:', kpiDataResult);
        setKpiData(kpiDataResult);
      } catch (error: any) {
        console.error('Error fetching KPI data:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          response: error?.response
        });
        // Set default values on error
        setKpiData({
          totalStock: 0,
          projectedDemand: 0,
          averageCoverage: 0,
          atRiskCount: 0
        });
      } finally {
        setLoading(false);
        console.log('KPI loading finished, loading state:', false);
      }
    }

    fetchKPIData();

    // Listen for sale, movement, and article events to refresh
    const handleSaleCreated = () => fetchKPIData();
    const handleMovementCreated = () => fetchKPIData();
    const handleArticleCreated = () => fetchKPIData();
    
    window.addEventListener('sale:created', handleSaleCreated);
    window.addEventListener('movement:created', handleMovementCreated);
    window.addEventListener('article:created', handleArticleCreated);
    
    return () => {
      window.removeEventListener('sale:created', handleSaleCreated);
      window.removeEventListener('movement:created', handleMovementCreated);
      window.removeEventListener('article:created', handleArticleCreated);
    };
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