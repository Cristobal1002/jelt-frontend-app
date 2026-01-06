import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
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
        // Get date range from filters
        const fromDate = appliedFilters.dateRange.start.toISOString();
        const toDate = appliedFilters.dateRange.end.toISOString();

        // Fetch sales history with pagination (max limit is 500)
        let allSales: any[] = [];
        let offset = 0;
        const limit = 500; // Max allowed by backend
        let hasMore = true;

        while (hasMore) {
          const salesResponse = await apiClient.listSales({
            from: fromDate,
            to: toDate,
            limit,
            offset,
          });

          console.log('Sales response:', salesResponse);
          allSales = [...allSales, ...salesResponse.rows];
          hasMore = salesResponse.offset + salesResponse.limit < salesResponse.count;
          offset += limit;
          
          // Safety break to avoid infinite loops
          if (offset > 10000) break;
        }

        console.log('Total sales loaded:', allSales.length);
        const sales = allSales;

        // Group sales by month
        const monthlyTotals: { [key: string]: { month: string; actual: number; forecast: number } } = {};
        
        sales.forEach((sale) => {
          const saleDate = new Date(sale.sold_at);
          const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = saleDate.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
          
          if (!monthlyTotals[monthKey]) {
            monthlyTotals[monthKey] = {
              month: monthName,
              actual: 0,
              forecast: 0, // Forecast would come from replenishment API if available
            };
          }
          
          monthlyTotals[monthKey].actual += sale.quantity;
        });

        // Try to get forecast data from replenishment API if available
        // For now, we'll calculate a simple forecast based on average
        const months = Object.keys(monthlyTotals).sort();
        if (months.length > 0) {
          // Calculate average monthly sales for forecast
          const totalActual = Object.values(monthlyTotals).reduce((sum, m) => sum + m.actual, 0);
          const avgMonthly = totalActual / months.length;
          
          // Add forecast as 10% increase from average (placeholder - should use actual forecast API)
          Object.keys(monthlyTotals).forEach((key) => {
            monthlyTotals[key].forecast = Math.round(avgMonthly * 1.1);
          });
        }

        const chartData = Object.values(monthlyTotals).sort((a, b) => {
          // Sort by month name (simple string comparison works for same year)
          return a.month.localeCompare(b.month);
        }) as MonthlyData[];

        console.log('Chart data set:', chartData);
        setChartData(chartData);
      } catch (error: any) {
        console.error('Error fetching forecast data:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          response: error?.response
        });
        setChartData([]);
      } finally {
        setLoading(false);
        console.log('Forecast loading finished');
      }
    }

    fetchForecastData();

    // Listen for sale events to refresh
    const handleSaleCreated = () => fetchForecastData();
    window.addEventListener('sale:created', handleSaleCreated);
    
    return () => {
      window.removeEventListener('sale:created', handleSaleCreated);
    };
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