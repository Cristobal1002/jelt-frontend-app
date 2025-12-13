import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilters } from "@/contexts/FilterContext";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";

interface Alert {
  id: string;
  type: string;
  product: string;
  sku: string;
  site: string;
  currentStock: number;
  threshold: number;
  details: string;
  severity: "high" | "medium" | "low";
  icon: any;
  coverage: number;
  suggestedQty: number;
  suggestedDate: string;
}

export function AlertsList() {
  const [alertsData, setAlertsData] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { appliedFilters } = useFilters();
  const [showPODialog, setShowPODialog] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        let query = supabase
          .from('stock_alerts')
          .select(`
            id,
            alert_type,
            severity,
            message,
            days_of_coverage,
            current_stock,
            suggested_reorder_qty,
            suggested_po_date,
            is_active,
            products!inner(id, sku, name, site, reorder_point)
          `)
          .eq('is_active', true);

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

        let alerts: Alert[] = data?.map((alert: any) => {
          const product = alert.products;
          const severityMap: { [key: string]: "high" | "medium" | "low" } = {
            high: "high",
            medium: "medium",
            low: "low"
          };
          
          return {
            id: alert.id,
            type: "Low Stock",
            product: product.name,
            sku: product.sku,
            site: product.site,
            currentStock: alert.current_stock,
            threshold: product.reorder_point,
            details: `${alert.message} - Coverage: ${alert.days_of_coverage} days`,
            severity: severityMap[alert.severity] || "medium",
            icon: alert.severity === "high" ? AlertTriangle : Package,
            coverage: alert.days_of_coverage,
            suggestedQty: alert.suggested_reorder_qty,
            suggestedDate: alert.suggested_po_date || new Date().toISOString().split('T')[0],
          };
        }) || [];

        // Apply search filter
        if (appliedFilters.search) {
          const searchLower = appliedFilters.search.toLowerCase();
          alerts = alerts.filter(alert => 
            alert.sku.toLowerCase().includes(searchLower) || 
            alert.product.toLowerCase().includes(searchLower)
          );
        }

        // Apply alerts only filter
        if (appliedFilters.alertsOnly) {
          alerts = alerts.filter(alert => alert.coverage < 15);
        }

        // Sort by severity
        alerts.sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });

        setAlertsData(alerts.slice(0, 5));
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('stock-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_alerts'
        },
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appliedFilters]);

  const handleAddToPO = async (alert: Alert) => {
    try {
      // Fetch full alert data with product info
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
        .eq('id', alert.id)
        .single();

      if (error) throw error;

      setSelectedAlerts([data]);
      setShowPODialog(true);
    } catch (error) {
      console.error('Error fetching alert details:', error);
    }
  };

  const groupedAlerts = {
    "Low Stock": alertsData.filter(alert => alert.type === "Low Stock"),
  };

  const highAlerts = alertsData.filter(a => a.severity === "high").length;
  const mediumAlerts = alertsData.filter(a => a.severity === "medium").length;

  if (loading) {
    return (
      <div className="card-enterprise-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-enterprise-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Low Stock / Expiration Alerts</h3>
            <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
          </div>
          <div className="flex space-x-2">
            <Badge className="badge-danger">High: {highAlerts}</Badge>
            <Badge className="badge-warning">Medium: {mediumAlerts}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedAlerts).map(([category, alerts]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">({alerts.length})</span>
              </div>
              
              <div className="space-y-2">
                {alerts.map((alert, index) => {
                  const Icon = alert.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`p-1.5 rounded ${
                          alert.severity === 'high' ? 'bg-danger/10' : 'bg-warning/10'
                        }`}>
                          <Icon className={`w-3 h-3 ${
                            alert.severity === 'high' ? 'text-danger' : 'text-warning'
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-card-foreground">{alert.product}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{alert.site}</span>
                            <span>•</span>
                            <span>Stock: {alert.currentStock}</span>
                            {alert.threshold && (
                              <>
                                <span>•</span>
                                <span>Min: {alert.threshold}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{alert.details}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {alert.severity === 'high' ? (
                          <Button 
                            size="sm" 
                            className="text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white" 
                            onClick={() => handleAddToPO(alert)}
                          >
                            <Package className="w-3 h-3 mr-1" />
                            Reabastecer Ahora
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" className="text-xs">
                              Snooze 7d
                            </Button>
                            <Button 
                              size="sm" 
                              className="text-xs" 
                              variant="gradient"
                              onClick={() => handleAddToPO(alert)}
                            >
                              Add to PO
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreatePurchaseOrderDialog 
        open={showPODialog} 
        onOpenChange={setShowPODialog}
        preSelectedAlerts={selectedAlerts}
      />
    </>
  );
}