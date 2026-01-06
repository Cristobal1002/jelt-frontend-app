import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, TrendingUp, TrendingDown, Package, AlertTriangle } from "lucide-react";
import type { ReplenishmentResponse } from "@/lib/api-client";

interface ReplenishmentMetricsProps {
  initialArticleId?: string;
  initialSku?: string;
  hideSearch?: boolean;
}

export function ReplenishmentMetrics({ 
  initialArticleId, 
  initialSku,
  hideSearch = false 
}: ReplenishmentMetricsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSku || "");
  const [searchBy, setSearchBy] = useState<"sku" | "id">(initialSku ? "sku" : "id");
  const [data, setData] = useState<ReplenishmentResponse | null>(null);

  useEffect(() => {
    if (initialArticleId || initialSku) {
      handleInitialLoad();
    }
  }, [initialArticleId, initialSku]);

  const handleInitialLoad = async () => {
    if (initialArticleId) {
      setLoading(true);
      try {
        const response = await apiClient.getReplenishmentByArticleId(initialArticleId);
        setData(response.data);
      } catch (error: any) {
        console.error("Error loading metrics:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load metrics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else if (initialSku) {
      setLoading(true);
      try {
        const response = await apiClient.getReplenishmentBySku(initialSku);
        setData(response.data);
      } catch (error: any) {
        console.error("Error loading metrics:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load metrics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a SKU or Article ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = searchBy === "sku"
        ? await apiClient.getReplenishmentBySku(searchValue.trim())
        : await apiClient.getReplenishmentByArticleId(searchValue.trim());
      
      setData(response.data);
    } catch (error: any) {
      console.error("Error fetching replenishment metrics:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch replenishment metrics.",
        variant: "destructive",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number | null | undefined, decimals: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStockStatus = (stock: number, reorderPoint: number | null, recommendedROP: number) => {
    const rop = reorderPoint || recommendedROP;
    if (stock <= rop * 0.5) return { label: "Critical", color: "destructive" };
    if (stock <= rop) return { label: "Low", color: "warning" };
    if (stock <= rop * 1.5) return { label: "Adequate", color: "default" };
    return { label: "Good", color: "success" };
  };

  const cardContent = (
    <>
      {/* Search */}
      {!hideSearch && (
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Label htmlFor="search" className="text-xs mb-2 block">Search by</Label>
            <div className="flex gap-2">
              <select
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value as "sku" | "id")}
                className="px-3 py-2 text-sm border rounded-md bg-background/50"
              >
                <option value="sku">SKU</option>
                <option value="id">Article ID</option>
              </select>
              <Input
                id="search"
                placeholder={searchBy === "sku" ? "Enter SKU" : "Enter Article ID"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 bg-background/50"
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-ai text-white hover:opacity-90"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && data && (
        <div className="space-y-6">
          {/* Article Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{data.article.name}</h3>
                <p className="text-sm text-muted-foreground font-mono">{data.article.sku}</p>
              </div>
              <Badge
                variant={
                  getStockStatus(
                    data.metrics.stock_actual,
                    data.metrics.reorder_point_actual,
                    data.metrics.reorder_point_recomendado
                  ).color as any
                }
              >
                {getStockStatus(
                  data.metrics.stock_actual,
                  data.metrics.reorder_point_actual,
                  data.metrics.reorder_point_recomendado
                ).label}
              </Badge>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Stock Metrics */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Current Stock</Label>
              </div>
              <p className="text-2xl font-bold">{data.metrics.stock_actual}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Reorder Point (Current)</Label>
              </div>
              <p className="text-2xl font-bold">
                {data.metrics.reorder_point_actual ?? "Not set"}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Reorder Point (Recommended)</Label>
              </div>
              <p className="text-2xl font-bold">{data.metrics.reorder_point_recomendado}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Suggested Reorder Quantity</Label>
              </div>
              <p className="text-2xl font-bold">{data.metrics.cantidad_reorden_sugerida}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground" />
                <Label className="text-xs text-muted-foreground">Safety Stock</Label>
              </div>
              <p className="text-2xl font-bold">{formatNumber(data.metrics.stock_seguridad, 0)}</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-xs text-muted-foreground">Service Level</Label>
              </div>
              <p className="text-2xl font-bold">{formatPercentage(data.metrics.nivel_servicio)}</p>
            </div>

            {/* Demand Metrics */}
            <div className="p-4 border rounded-lg">
              <Label className="text-xs text-muted-foreground mb-2 block">Avg Daily Demand</Label>
              <p className="text-xl font-semibold">{formatNumber(data.metrics.demanda_promedio_diaria)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Std Dev: {formatNumber(data.metrics.desviacion_demanda_diaria)}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="text-xs text-muted-foreground mb-2 block">Lead Time</Label>
              <p className="text-xl font-semibold">{data.metrics.lead_time_dias} days</p>
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="text-xs text-muted-foreground mb-2 block">Expected Demand (LT)</Label>
              <p className="text-xl font-semibold">{formatNumber(data.metrics.demanda_esperada_en_lead_time)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Std Dev: {formatNumber(data.metrics.desviacion_en_lead_time)}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="text-xs text-muted-foreground mb-2 block">Z-Score</Label>
              <p className="text-xl font-semibold">{formatNumber(data.metrics.z_score)}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !data && searchValue && (
        <div className="text-center py-8 text-muted-foreground">
          No data found. Try searching for an article.
        </div>
      )}

      {!loading && !data && !searchValue && !initialArticleId && !initialSku && (
        <div className="text-center py-8 text-muted-foreground">
          Enter a SKU or Article ID to view replenishment metrics
        </div>
      )}
    </>
  );

  if (hideSearch) {
    return <div>{cardContent}</div>;
  }

  return (
    <Card className="card-enterprise-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Replenishment Metrics</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Get detailed replenishment metrics for any article
        </p>
      </CardHeader>

      <CardContent>
        {/* Search */}
        {!hideSearch && (
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs mb-2 block">Search by</Label>
              <div className="flex gap-2">
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value as "sku" | "id")}
                  className="px-3 py-2 text-sm border rounded-md bg-background/50"
                >
                  <option value="sku">SKU</option>
                  <option value="id">Article ID</option>
                </select>
                <Input
                  id="search"
                  placeholder={searchBy === "sku" ? "Enter SKU" : "Enter Article ID"}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-background/50"
                />
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-gradient-ai text-white hover:opacity-90"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!loading && data && (
          <div className="space-y-6">
            {/* Article Info */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{data.article.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{data.article.sku}</p>
                </div>
                <Badge
                  variant={
                    getStockStatus(
                      data.metrics.stock_actual,
                      data.metrics.reorder_point_actual,
                      data.metrics.reorder_point_recomendado
                    ).color as any
                  }
                >
                  {getStockStatus(
                    data.metrics.stock_actual,
                    data.metrics.reorder_point_actual,
                    data.metrics.reorder_point_recomendado
                  ).label}
                </Badge>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Stock Metrics */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Current Stock</Label>
                </div>
                <p className="text-2xl font-bold">{data.metrics.stock_actual}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Reorder Point (Current)</Label>
                </div>
                <p className="text-2xl font-bold">
                  {data.metrics.reorder_point_actual ?? "Not set"}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Reorder Point (Recommended)</Label>
                </div>
                <p className="text-2xl font-bold">{data.metrics.reorder_point_recomendado}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Suggested Reorder Quantity</Label>
                </div>
                <p className="text-2xl font-bold">{data.metrics.cantidad_reorden_sugerida}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Safety Stock</Label>
                </div>
                <p className="text-2xl font-bold">{formatNumber(data.metrics.stock_seguridad, 0)}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-xs text-muted-foreground">Service Level</Label>
                </div>
                <p className="text-2xl font-bold">{formatPercentage(data.metrics.nivel_servicio)}</p>
              </div>

              {/* Demand Metrics */}
              <div className="p-4 border rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Avg Daily Demand</Label>
                <p className="text-xl font-semibold">{formatNumber(data.metrics.demanda_promedio_diaria)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Std Dev: {formatNumber(data.metrics.desviacion_demanda_diaria)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Lead Time</Label>
                <p className="text-xl font-semibold">{data.metrics.lead_time_dias} days</p>
              </div>

              <div className="p-4 border rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Expected Demand (LT)</Label>
                <p className="text-xl font-semibold">{formatNumber(data.metrics.demanda_esperada_en_lead_time)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Std Dev: {formatNumber(data.metrics.desviacion_en_lead_time)}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Z-Score</Label>
                <p className="text-xl font-semibold">{formatNumber(data.metrics.z_score)}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !data && searchValue && (
          <div className="text-center py-8 text-muted-foreground">
            No data found. Try searching for an article.
          </div>
        )}

        {!loading && !data && !searchValue && (
          <div className="text-center py-8 text-muted-foreground">
            Enter a SKU or Article ID to view replenishment metrics
          </div>
        )}
      </CardContent>
    </Card>
  );
}

