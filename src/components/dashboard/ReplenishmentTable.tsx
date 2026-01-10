import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReplenishmentMetrics } from "./ReplenishmentMetrics";
import type { Article, ReplenishmentResponse } from "@/lib/api-client";

interface ArticleWithMetrics extends Article {
  metrics?: ReplenishmentResponse['metrics'];
  loading?: boolean;
}

export function ReplenishmentTable() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<ArticleWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState<Set<string>>(new Set());
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadArticles();

    // Listen for article creation events
    const handleArticleCreated = () => {
      loadArticles();
    };

    window.addEventListener('article:created', handleArticleCreated);

    return () => {
      window.removeEventListener('article:created', handleArticleCreated);
    };
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let allArticles: Article[] = [];
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore) {
        const response = await apiClient.listArticles({
          page,
          perPage,
          isActive: true,
        });

        allArticles = [...allArticles, ...response.data.items];
        hasMore = response.data.meta.currentPage < response.data.meta.totalPages;
        page++;
      }

      setArticles(allArticles.map(a => ({ ...a, metrics: undefined, loading: false })));
    } catch (error: any) {
      console.error("Error loading articles:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load articles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetricsForArticle = async (articleId: string) => {
    if (loadingMetrics.has(articleId)) return;

    setLoadingMetrics(prev => new Set(prev).add(articleId));
    setArticles(prev =>
      prev.map(a => (a.id === articleId ? { ...a, loading: true } : a))
    );

    try {
      const response = await apiClient.getReplenishmentByArticleId(articleId);
      setArticles(prev =>
        prev.map(a =>
          a.id === articleId
            ? { ...a, metrics: response.data.metrics, loading: false }
            : a
        )
      );
    } catch (error: any) {
      console.error("Error loading metrics:", error);
      setArticles(prev =>
        prev.map(a => (a.id === articleId ? { ...a, loading: false } : a))
      );
    } finally {
      setLoadingMetrics(prev => {
        const next = new Set(prev);
        next.delete(articleId);
        return next;
      });
    }
  };

  const handleViewDetails = (article: Article) => {
    setSelectedArticle(article);
    setShowMetricsDialog(true);
  };

  const getStockStatus = (stock: number, reorderPoint: number | null, recommendedROP: number) => {
    const rop = reorderPoint || recommendedROP;
    if (stock <= rop * 0.5) return { label: "Critical", color: "destructive" };
    if (stock <= rop) return { label: "Low", color: "warning" };
    if (stock <= rop * 1.5) return { label: "Adequate", color: "default" };
    return { label: "Good", color: "success" };
  };

  const filteredArticles = articles.filter(article => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      article.sku.toLowerCase().includes(query) ||
      article.name.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Card className="card-enterprise-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Replenishment Analysis</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View replenishment metrics for all articles
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Label htmlFor="search" className="text-xs mb-2 block">Search articles</Label>
            <Input
              id="search"
              placeholder="Search by SKU or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/50"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No articles found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-enterprise w-full">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Article</th>
                    <th>Current Stock</th>
                    <th>Reorder Point</th>
                    <th>Recommended ROP</th>
                    <th>Suggested Qty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => {
                    const metrics = article.metrics;
                    const hasMetrics = !!metrics;
                    const status = metrics
                      ? getStockStatus(
                          metrics.stock_actual,
                          metrics.reorder_point_actual,
                          metrics.reorder_point_recomendado
                        )
                      : null;

                    return (
                      <tr key={article.id} className="hover:bg-muted/30">
                        <td className="font-mono text-sm">{article.sku}</td>
                        <td>
                          <div className="font-medium text-sm">{article.name}</div>
                        </td>
                        <td className="text-right">
                          {metrics ? (
                            <span className="font-medium">{metrics.stock_actual}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right">
                          {metrics ? (
                            <span>{metrics.reorder_point_actual ?? "Not set"}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right">
                          {metrics ? (
                            <span className="font-medium">{metrics.reorder_point_recomendado}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-right">
                          {metrics ? (
                            <span className="font-medium">{metrics.cantidad_reorden_sugerida}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td>
                          {status ? (
                            <Badge variant={status.color as any}>{status.label}</Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadMetricsForArticle(article.id)}
                              disabled={article.loading}
                              className="text-xs"
                            >
                              {article.loading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Load"
                              )}
                            </Button>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(article)}
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Replenishment Metrics</DialogTitle>
            <DialogDescription>
              Detailed metrics for {selectedArticle?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="mt-4">
              <ReplenishmentMetrics
                initialArticleId={selectedArticle.id}
                initialSku={selectedArticle.sku}
                hideSearch={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

