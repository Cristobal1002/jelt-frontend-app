import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Article, Stockroom } from "@/lib/api-client";

interface CreateSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId?: string; // Pre-seleccionar artículo si viene desde otro componente
}

export function CreateSaleDialog({ open, onOpenChange, articleId }: CreateSaleDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stockrooms, setStockrooms] = useState<Stockroom[]>([]);
  const [formData, setFormData] = useState({
    id_article: articleId || "",
    id_stockroom: "",
    quantity: "1",
    unit_price: "",
    sold_at: new Date().toISOString().slice(0, 16), // Formato para datetime-local
    metadata: "",
  });

  // Load articles and stockrooms when dialog opens
  useEffect(() => {
    if (open) {
      loadOptions();
      if (articleId) {
        setFormData(prev => ({ ...prev, id_article: articleId }));
      }
    } else {
      // Reset form when dialog closes
      setFormData({
        id_article: "",
        id_stockroom: "",
        quantity: "1",
        unit_price: "",
        sold_at: new Date().toISOString().slice(0, 16),
        metadata: "",
      });
    }
  }, [open, articleId]);

  // Listen for article creation events to refresh options
  useEffect(() => {
    const handleArticleCreated = () => {
      if (open) {
        loadOptions();
      }
    };

    window.addEventListener('article:created', handleArticleCreated);

    return () => {
      window.removeEventListener('article:created', handleArticleCreated);
    };
  }, [open]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [articlesRes, stockroomsRes] = await Promise.all([
        apiClient.listArticles({ perPage: 100, isActive: true }),
        apiClient.listStockrooms({ perPage: 100, isActive: true }),
      ]);

      setArticles(articlesRes.data.items);
      setStockrooms(stockroomsRes.data.items);
    } catch (error: any) {
      console.error("Error loading options:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load options.",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  // Update unit_price when article changes
  useEffect(() => {
    if (formData.id_article) {
      const article = articles.find(a => a.id === formData.id_article);
      if (article && !formData.unit_price) {
        setFormData(prev => ({ ...prev, unit_price: article.unit_price.toString() }));
      }
    }
  }, [formData.id_article, articles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.id_article || !formData.id_stockroom || !formData.quantity || !formData.sold_at) {
        toast({
          title: "Validation error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Parse metadata if provided
      let metadata: Record<string, any> | undefined = undefined;
      if (formData.metadata.trim()) {
        try {
          metadata = JSON.parse(formData.metadata);
        } catch {
          // If not valid JSON, create a simple object
          metadata = { note: formData.metadata };
        }
      }

      // Convert sold_at to ISO string
      const soldAtISO = new Date(formData.sold_at).toISOString();

      // Build payload, only including metadata if it has a value
      const payload: any = {
        id_article: formData.id_article,
        id_stockroom: formData.id_stockroom,
        quantity: parseInt(formData.quantity),
        sold_at: soldAtISO,
      };

      if (formData.unit_price) {
        payload.unit_price = parseFloat(formData.unit_price);
      }

      if (metadata) {
        payload.metadata = metadata;
      }

      await apiClient.createSale(payload);

      toast({
        title: "Sale recorded",
        description: "The sale has been successfully recorded.",
      });

      onOpenChange(false);
      
      // Dispatch event to refresh data
      window.dispatchEvent(new CustomEvent('sale:created'));
    } catch (error: any) {
      console.error("Error creating sale:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record sale.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-[hsl(var(--border))]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="ai-spark" />
            Record Sale
          </DialogTitle>
          <DialogDescription>
            Register a new sale in the inventory history.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="article">Article *</Label>
            <Select
              value={formData.id_article}
              onValueChange={(value) => setFormData({ ...formData, id_article: value, unit_price: "" })}
              disabled={loadingOptions || !!articleId}
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select article" />
              </SelectTrigger>
              <SelectContent>
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.sku} - {article.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stockroom">Stockroom *</Label>
            <Select
              value={formData.id_stockroom}
              onValueChange={(value) => setFormData({ ...formData, id_stockroom: value })}
              disabled={loadingOptions}
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select stockroom" />
              </SelectTrigger>
              <SelectContent>
                {stockrooms.map((stockroom) => (
                  <SelectItem key={stockroom.id} value={stockroom.id}>
                    {stockroom.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Auto from article"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sold_at">Sale Date & Time *</Label>
            <Input
              id="sold_at"
              type="datetime-local"
              value={formData.sold_at}
              onChange={(e) => setFormData({ ...formData, sold_at: e.target.value })}
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON or text)</Label>
            <Input
              id="metadata"
              placeholder='{"channel": "pos", "order_id": "ORD-1001"} or just text'
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Add metadata like channel, order_id, etc.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingOptions}
              className="bg-gradient-ai text-white hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Sale"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

