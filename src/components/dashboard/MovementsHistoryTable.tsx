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
import { CreateMovementDialog } from "./CreateMovementDialog";
import type { StockMovement, Article, Stockroom, StockMovementType } from "@/lib/api-client";

export function MovementsHistoryTable() {
  const { toast } = useToast();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stockrooms, setStockrooms] = useState<Stockroom[]>([]);
  const [filters, setFilters] = useState({
    articleId: "all",
    stockroomId: "all",
    type: "all" as StockMovementType | "all",
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
    loadMovements();
    loadOptions();
    
    // Listen for new movements
    const handleMovementCreated = () => {
      loadMovements();
    };
    window.addEventListener('movement:created', handleMovementCreated);
    return () => window.removeEventListener('movement:created', handleMovementCreated);
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

  const loadMovements = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: filters.limit,
        offset: filters.offset,
      };

      if (filters.articleId && filters.articleId !== "all") params.articleId = filters.articleId;
      if (filters.stockroomId && filters.stockroomId !== "all") params.stockroomId = filters.stockroomId;
      if (filters.type && filters.type !== "all") params.type = filters.type;
      if (filters.from) params.from = new Date(filters.from).toISOString();
      if (filters.to) params.to = new Date(filters.to).toISOString();

      const response = await apiClient.listMovements(params);
      setMovements(response.rows);
      setPagination({
        total: response.count,
        limit: response.limit,
        offset: response.offset,
        hasMore: response.offset + response.limit < response.count,
      });
    } catch (error: any) {
      console.error("Error loading movements:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load movements history.",
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

  const getMovementTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case "IN":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">IN</Badge>;
      case "OUT":
        return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">OUT</Badge>;
      case "ADJUSTMENT":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">ADJ</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <>
      <Card className="card-enterprise-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Stock Movements History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Historical stock movements (entries, exits, adjustments)
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="bg-gradient-ai text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Movement
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="space-y-2">
              <Label className="text-xs">Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="IN">Entry (IN)</SelectItem>
                  <SelectItem value="OUT">Exit (OUT)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          ) : movements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No movements records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-enterprise w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Article</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Quantity</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => {
                    const article = articles.find(a => a.id === movement.id_article);
                    const stockroom = stockrooms.find(s => s.id === movement.id_stockroom);
                    
                    // Extract source/destination from metadata
                    const metadata = movement.metadata as any;
                    let sourceStockroom: Stockroom | undefined;
                    let destinationStockroom: Stockroom | undefined;
                    
                    if (metadata) {
                      if (metadata.source_stockroom_id) {
                        sourceStockroom = stockrooms.find(s => s.id === metadata.source_stockroom_id);
                      }
                      if (metadata.destination_stockroom_id) {
                        destinationStockroom = stockrooms.find(s => s.id === metadata.destination_stockroom_id);
                      }
                    }
                    
                    // Determine source and destination based on movement type
                    let fromStockroom: Stockroom | undefined;
                    let toStockroom: Stockroom | undefined;
                    
                    if (movement.type === "OUT") {
                      fromStockroom = stockroom;
                      toStockroom = destinationStockroom; // Can be undefined if external exit
                    } else if (movement.type === "IN") {
                      fromStockroom = sourceStockroom; // Can be undefined if external entry
                      toStockroom = stockroom;
                    } else {
                      // ADJUSTMENT - only one stockroom
                      fromStockroom = stockroom;
                      toStockroom = stockroom;
                    }

                    return (
                      <tr key={movement.id} className="hover:bg-muted/30">
                        <td className="text-sm">{formatDate(movement.moved_at)}</td>
                        <td>{getMovementTypeBadge(movement.type)}</td>
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
                          {fromStockroom ? (
                            <Badge variant="outline" className="text-xs">
                              {fromStockroom.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">External</span>
                          )}
                        </td>
                        <td>
                          {toStockroom ? (
                            <Badge variant="outline" className="text-xs">
                              {toStockroom.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">External</span>
                          )}
                        </td>
                        <td className="text-right font-medium">{movement.quantity}</td>
                        <td className="text-sm text-muted-foreground">
                          {movement.reference || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && movements.length > 0 && (
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

      <CreateMovementDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}

