import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFilters } from "@/contexts/FilterContext";

interface MonthlyData {
  month: string;
  actual: number;
  forecast: number;
}

export function ForecastChart() {
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { appliedFilters } = useFilters();

  useEffect(() => {
    async function fetchForecastData() {
      try {
        const currentYear = 2025;
        
        // Calculate month range from date range
        const startMonth = appliedFilters.dateRange.start.getMonth() + 1;
        const endMonth = appliedFilters.dateRange.end.getMonth() + 1;
        
        let query = supabase
          .from('monthly_inventory')
          .select('month, sales, forecast, products!inner(category, name, sku, site)')
          .eq('year', currentYear)
          .gte('month', startMonth)
          .lte('month', endMonth)
          .order('month');

        // Apply site filter
        if (appliedFilters.site !== "all") {
          const siteMap: { [key: string]: string } = {
            main: "Clínica Principal",
            north: "Sucursal Norte",
            west: "Sucursal Oeste",
          };
          query = query.eq('products.site', siteMap[appliedFilters.site]);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Apply search filter
        let filteredData = data || [];
        if (appliedFilters.search) {
          const searchLower = appliedFilters.search.toLowerCase();
          filteredData = filteredData.filter((item: any) => 
            item.products.sku.toLowerCase().includes(searchLower) || 
            item.products.name.toLowerCase().includes(searchLower)
          );
        }

        const monthlyTotals = filteredData.reduce((acc: any, item: any) => {
          const monthName = new Date(2025, item.month - 1).toLocaleDateString('es-CO', { month: 'short' });
          if (!acc[item.month]) {
            acc[item.month] = {
              month: monthName,
              actual: 0,
              forecast: 0
            };
          }
          acc[item.month].actual += item.sales;
          acc[item.month].forecast += item.forecast;
          return acc;
        }, {});

        const chartData = Object.values(monthlyTotals || {}) as MonthlyData[];
        setChartData(chartData);
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchForecastData();
  }, [appliedFilters]);

  return (
    <div className="ai-panel ai-hover-lift h-[450px]">
      <div className="ai-panel-glow" />
      <div className="relative p-6 h-full z-10 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-card-foreground">
                AI Prediction vs Actual
              </h3>
              <span className="ai-spark" />
            </div>
            <p className="text-sm text-muted-foreground">Trend analysis · Top 10 SKUs</p>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-muted/50">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="ai-shimmer w-full h-full rounded-xl bg-muted/30" />
          </div>
        ) : (
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-forecast))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-forecast))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-actual))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-actual))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="hsl(var(--chart-forecast))" 
                  strokeWidth={3}
                  name="AI Prediction"
                  dot={{ fill: 'hsl(var(--chart-forecast))', r: 5 }}
                  fill="url(#forecastGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--chart-actual))" 
                  strokeWidth={3}
                  name="Actual Data"
                  dot={{ fill: 'hsl(var(--chart-actual))', r: 5 }}
                  fill="url(#actualGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}