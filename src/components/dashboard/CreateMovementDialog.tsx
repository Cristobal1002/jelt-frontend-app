import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Article, Stockroom, StockMovementType } from "@/lib/api-client";

interface CreateMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleId?: string; // Pre-seleccionar artículo si viene desde otro componente
  movementType?: StockMovementType; // Pre-seleccionar tipo si viene desde otro componente
}

export function CreateMovementDialog({ 
  open, 
  onOpenChange, 
  articleId,
  movementType 
}: CreateMovementDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [stockrooms, setStockrooms] = useState<Stockroom[]>([]);
  const [formData, setFormData] = useState({
    id_article: articleId || "",
    id_stockroom: "", // Stockroom principal (origen para OUT, destino para IN)
    id_stockroom_destination: "", // Stockroom destino (solo para transferencias)
    type: (movementType || "OUT") as StockMovementType,
    quantity: "1",
    moved_at: new Date().toISOString().slice(0, 16), // Formato para datetime-local
    reference: "",
    metadata: "",
  });

  // Load articles and stockrooms when dialog opens
  useEffect(() => {
    if (open) {
      loadOptions();
      if (articleId) {
        setFormData(prev => ({ ...prev, id_article: articleId }));
      }
      if (movementType) {
        setFormData(prev => ({ ...prev, type: movementType }));
      }
    } else {
      // Reset form when dialog closes
      setFormData({
        id_article: "",
        id_stockroom: "",
        id_stockroom_destination: "",
        type: "OUT" as StockMovementType,
        quantity: "1",
        moved_at: new Date().toISOString().slice(0, 16),
        reference: "",
        metadata: "",
      });
    }
  }, [open, articleId, movementType]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.id_article || !formData.id_stockroom || !formData.type || !formData.quantity || !formData.moved_at) {
        toast({
          title: "Validation error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Build metadata object
      const metadata: Record<string, any> = {};
      
      // Add destination/source stockroom to metadata if provided (for transfers)
      if (formData.id_stockroom_destination && formData.id_stockroom_destination !== "all") {
        if (formData.type === "OUT") {
          metadata.destination_stockroom_id = formData.id_stockroom_destination;
        } else if (formData.type === "IN") {
          metadata.source_stockroom_id = formData.id_stockroom_destination;
        }
      }
      
      // Parse additional metadata if provided
      if (formData.metadata.trim()) {
        try {
          const parsedMetadata = JSON.parse(formData.metadata);
          Object.assign(metadata, parsedMetadata);
        } catch {
          // If not valid JSON, add as note
          metadata.note = formData.metadata;
        }
      }

      // Convert moved_at to ISO string
      const movedAtISO = new Date(formData.moved_at).toISOString();

      // Build payload, only including optional fields if they have values
      const payload: any = {
        id_article: formData.id_article,
        id_stockroom: formData.id_stockroom,
        type: formData.type,
        quantity: parseInt(formData.quantity),
        moved_at: movedAtISO,
      };

      if (formData.reference) {
        payload.reference = formData.reference;
      }

      // Only include metadata if it has any content
      if (Object.keys(metadata).length > 0) {
        payload.metadata = metadata;
      }

      await apiClient.createMovement(payload);

      toast({
        title: "Movement recorded",
        description: "The stock movement has been successfully recorded.",
      });

      onOpenChange(false);
      
      // Dispatch event to refresh data
      window.dispatchEvent(new CustomEvent('movement:created'));
    } catch (error: any) {
      console.error("Error creating movement:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record movement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeLabel = (type: StockMovementType) => {
    switch (type) {
      case "IN":
        return "Entry (Entrada)";
      case "OUT":
        return "Exit (Salida)";
      case "ADJUSTMENT":
        return "Adjustment (Ajuste)";
      default:
        return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-[hsl(var(--border))]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="ai-spark" />
            Record Stock Movement
          </DialogTitle>
          <DialogDescription>
            Register a stock movement (entry, exit, or adjustment).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="type">Movement Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as StockMovementType })}
              disabled={loadingOptions || !!movementType}
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entry (Entrada)</SelectItem>
                <SelectItem value="OUT">Exit (Salida)</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment (Ajuste)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="article">Article *</Label>
            <Select
              value={formData.id_article}
              onValueChange={(value) => setFormData({ ...formData, id_article: value })}
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
            <Label htmlFor="stockroom">
              {formData.type === "IN" 
                ? "Destination Stockroom *" 
                : formData.type === "OUT"
                ? "Source Stockroom *"
                : "Stockroom *"}
            </Label>
            <Select
              value={formData.id_stockroom}
              onValueChange={(value) => setFormData({ ...formData, id_stockroom: value })}
              disabled={loadingOptions}
              required
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder={
                  formData.type === "IN" 
                    ? "Select destination stockroom" 
                    : formData.type === "OUT"
                    ? "Select source stockroom"
                    : "Select stockroom"
                } />
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

          {/* Show destination stockroom for OUT movements (transfers) */}
          {formData.type === "OUT" && (
            <div className="space-y-2">
              <Label htmlFor="stockroom_destination">Destination Stockroom (Optional)</Label>
              <Select
                value={formData.id_stockroom_destination}
                onValueChange={(value) => setFormData({ ...formData, id_stockroom_destination: value })}
                disabled={loadingOptions}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select destination stockroom (for transfer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">None (External exit)</SelectItem>
                  {stockrooms
                    .filter(s => s.id !== formData.id_stockroom)
                    .map((stockroom) => (
                      <SelectItem key={stockroom.id} value={stockroom.id}>
                        {stockroom.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a destination stockroom if this is a transfer between stockrooms
              </p>
            </div>
          )}

          {/* Show source stockroom for IN movements (transfers) */}
          {formData.type === "IN" && (
            <div className="space-y-2">
              <Label htmlFor="stockroom_source">Source Stockroom (Optional)</Label>
              <Select
                value={formData.id_stockroom_destination}
                onValueChange={(value) => setFormData({ ...formData, id_stockroom_destination: value })}
                disabled={loadingOptions}
              >
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Select source stockroom (for transfer)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">None (External entry)</SelectItem>
                  {stockrooms
                    .filter(s => s.id !== formData.id_stockroom)
                    .map((stockroom) => (
                      <SelectItem key={stockroom.id} value={stockroom.id}>
                        {stockroom.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a source stockroom if this is a transfer from another stockroom
              </p>
            </div>
          )}

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
              <Label htmlFor="moved_at">Date & Time *</Label>
              <Input
                id="moved_at"
                type="datetime-local"
                value={formData.moved_at}
                onChange={(e) => setFormData({ ...formData, moved_at: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              placeholder="e.g., PO-7781, INV-001"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Reference number (PO, invoice, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metadata">Metadata (JSON or text)</Label>
            <Input
              id="metadata"
              placeholder='{"reason": "inventory_count"} or just text'
              value={formData.metadata}
              onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Add metadata like reason, notes, etc.
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
                `Record ${getMovementTypeLabel(formData.type)}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

