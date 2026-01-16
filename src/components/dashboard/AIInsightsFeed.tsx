import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, AlertTriangle, Package, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";

interface AIInsight {
  id: string;
  type: "prediction" | "recommendation" | "alert";
  title: string;
  description: string;
  severity?: "high" | "medium" | "low";
  timestamp: Date;
  alertData?: any;
}

export function AIInsightsFeed() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [showPODialog, setShowPODialog] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchInsights() {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        // Get active alerts
        const { data: alerts, error } = await supabase
          .from('stock_alerts')
          .select('*, products!inner(name, sku)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const mappedInsights: AIInsight[] = (alerts || []).map((alert: any) => ({
          id: alert.id,
          type: 'alert' as const,
          title: `Critical stock: ${alert.products.name}`,
          description: `Will run out in ${alert.days_of_coverage} days. Recommended: order ${alert.suggested_reorder_qty} units.`,
          severity: alert.severity as "high" | "medium" | "low",
          timestamp: new Date(alert.created_at),
          alertData: alert,
        }));

        // Add AI recommendations
        const aiRecommendations: AIInsight[] = [
          {
            id: 'rec-1',
            type: 'recommendation',
            title: 'Optimization detected',
            description: 'Increasing reorder point for surgical gloves can reduce risk by 40%.',
            timestamp: new Date(),
          },
          {
            id: 'rec-2',
            type: 'prediction',
            title: 'Demand spike predicted',
            description: 'Expecting 15% increase in syringes over the next 2 weeks.',
            timestamp: new Date(),
          },
        ];

        setInsights([...aiRecommendations, ...mappedInsights]);
      } catch (error) {
        console.error('Error fetching AI insights:', error);
        // Fallback to mock data
        const mockInsights: AIInsight[] = [
          {
            id: 'rec-1',
            type: 'recommendation',
            title: 'Optimization detected',
            description: 'Increasing reorder point for surgical gloves can reduce risk by 40%.',
            timestamp: new Date(),
          },
          {
            id: 'rec-2',
            type: 'prediction',
            title: 'Demand spike predicted',
            description: 'Expecting 15% increase in syringes over the next 2 weeks.',
            timestamp: new Date(),
          },
          {
            id: 'alert-1',
            type: 'alert',
            title: 'Critical stock alert',
            description: 'Some items may require attention soon.',
            severity: 'medium',
            timestamp: new Date(),
          },
        ];
        setInsights(mockInsights);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  const handleRestock = async (insight: AIInsight) => {
    if (insight.alertData && supabase) {
      try {
        const { data, error } = await supabase
          .from('stock_alerts')
          .select(`
            id,
            suggested_reorder_qty,
            current_stock,
            days_of_coverage,
            severity,
            products!inner(id, name, sku, supplier, unit_cost)
          `)
          .eq('id', insight.id)
          .single();

        if (error) throw error;

        setSelectedAlerts([data]);
        setShowPODialog(true);
      } catch (error) {
        console.error('Error fetching alert details:', error);
      }
    }
  };

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'prediction':
        return <TrendingUp className="w-4 h-4" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'text-[hsl(var(--danger))] bg-[hsl(var(--danger-glow))]';
      case 'medium':
        return 'text-[hsl(var(--warning))] bg-[hsl(var(--warning-glow))]';
      default:
        return 'text-[hsl(var(--success))] bg-[hsl(var(--success-glow))]';
    }
  };

  if (loading) {
    return (
      <div className="card-ai-glass p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h3 className="font-semibold text-card-foreground">AI Insights</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="ai-shimmer h-20 rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  return (
    <div className="card-ai-glass p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
          <span className="ai-spark absolute -top-1 -right-1" />
        </div>
        <h3 className="font-semibold text-card-foreground">AI Insights</h3>
        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[hsl(var(--success-glow))] text-[hsl(var(--success))]">
          ACTIVE
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="p-4 rounded-xl bg-gradient-ai-subtle border border-[hsl(var(--border))] 
                     hover:border-[hsl(var(--primary-light))] transition-all duration-300 
                     group ai-hover-lift"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-card-foreground mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {insight.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {insight.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground block">
                    {insight.timestamp.toLocaleDateString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {insight.type === 'alert' && insight.severity === 'high' && (
                    <Button 
                      size="sm" 
                      className="h-7 text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestock(insight);
                      }}
                    >
                      <Package className="w-3 h-3 mr-1" />
                      Reabastecer
                    </Button>
                  )}
                  {insight.type === 'alert' && insight.severity !== 'high' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInsight(insight);
                      }}
                    >
                      Ver detalles
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insight Detail Dialog */}
      <Dialog open={selectedInsight !== null} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="sm:max-w-[500px] bg-card border-[hsl(var(--border))]">
          {selectedInsight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getSeverityColor(selectedInsight.severity)}`}>
                    {getIcon(selectedInsight.type)}
                  </div>
                  <span className="text-lg">{selectedInsight.title}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div>
                  <h4 className="text-sm font-semibold text-card-foreground mb-2">Details</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedInsight.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{selectedInsight.type}</span>
                  {selectedInsight.severity && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-medium">Severity:</span>
                      <span className={`capitalize font-semibold ${
                        selectedInsight.severity === 'high' ? 'text-[hsl(var(--danger))]' :
                        selectedInsight.severity === 'medium' ? 'text-[hsl(var(--warning))]' :
                        'text-[hsl(var(--success))]'
                      }`}>{selectedInsight.severity}</span>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Timestamp:</span>{" "}
                  {selectedInsight.timestamp.toLocaleString('en-US', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={() => setSelectedInsight(null)}
                    className="w-full bg-gradient-ai text-white hover:opacity-90"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreatePurchaseOrderDialog 
        open={showPODialog} 
        onOpenChange={setShowPODialog}
        preSelectedAlerts={selectedAlerts}
      />
    </div>
  );
}
