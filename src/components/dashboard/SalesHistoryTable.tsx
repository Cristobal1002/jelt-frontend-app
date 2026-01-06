import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { CreateSaleDialog } from "./CreateSaleDialog";
import type { SalesHistory, Article, Stockroom } from "@/lib/api-client";

export function SalesHistoryTable() {
  const { toast } = useToast();
  const [sales, setSales] = useState<SalesHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stockrooms, setStockrooms] = useState<Stockroom[]>([]);
  const [filters, setFilters] = useState({
    articleId: "all",
    stockroomId: "all",
    from: "",
    to: "",
    limit: 50,
    offset: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    loadSales();
    loadOptions();
    
    // Listen for new sales
    const handleSaleCreated = () => {
      loadSales();
    };
    window.addEventListener('sale:created', handleSaleCreated);
    return () => window.removeEventListener('sale:created', handleSaleCreated);
  }, [filters]);

  const loadOptions = async () => {
    try {
      const [articlesRes, stockroomsRes] = await Promise.all([
        apiClient.listArticles({ perPage: 100, isActive: true }),
        apiClient.listStockrooms({ perPage: 100, isActive: true }),
      ]);
      setArticles(articlesRes.data.items);
      setStockrooms(stockroomsRes.data.items);
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  const loadSales = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: filters.limit,
        offset: filters.offset,
      };

      if (filters.articleId && filters.articleId !== "all") params.articleId = filters.articleId;
      if (filters.stockroomId && filters.stockroomId !== "all") params.stockroomId = filters.stockroomId;
      if (filters.from) params.from = new Date(filters.from).toISOString();
      if (filters.to) params.to = new Date(filters.to).toISOString();

      const response = await apiClient.listSales(params);
      setSales(response.rows);
      setPagination({
        total: response.count,
        limit: response.limit,
        offset: response.offset,
        hasMore: response.offset + response.limit < response.count,
      });
    } catch (error: any) {
      console.error("Error loading sales:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load sales history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  return (
    <>
      <Card className="card-enterprise-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Sales History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Historical sales records
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="bg-gradient-ai text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Sale
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-xs">Article</Label>
              <Select
                value={filters.articleId}
                onValueChange={(value) => handleFilterChange('articleId', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All articles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All articles</SelectItem>
                  {articles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.sku} - {article.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Stockroom</Label>
              <Select
                value={filters.stockroomId}
                onValueChange={(value) => handleFilterChange('stockroomId', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All stockrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stockrooms</SelectItem>
                  {stockrooms.map((stockroom) => (
                    <SelectItem key={stockroom.id} value={stockroom.id}>
                      {stockroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="bg-background/50"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-enterprise w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Article</th>
                    <th>Stockroom</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => {
                    const article = articles.find(a => a.id === sale.id_article);
                    const stockroom = stockrooms.find(s => s.id === sale.id_stockroom);
                    const total = sale.unit_price ? sale.unit_price * sale.quantity : null;

                    return (
                      <tr key={sale.id} className="hover:bg-muted/30">
                        <td className="text-sm">{formatDate(sale.sold_at)}</td>
                        <td>
                          {article ? (
                            <div>
                              <div className="font-medium text-sm">{article.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{article.sku}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </td>
                        <td>
                          {stockroom ? (
                            <Badge variant="outline" className="text-xs">
                              {stockroom.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </td>
                        <td className="text-right">{sale.quantity}</td>
                        <td className="text-right">{formatCurrency(sale.unit_price)}</td>
                        <td className="text-right font-medium">{formatCurrency(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && sales.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  disabled={filters.offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  disabled={!pagination.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateSaleDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}

