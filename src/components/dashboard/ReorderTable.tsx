import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFilters } from "@/contexts/FilterContext";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";

interface ReorderItem {
  id: string;
  sku: string;
  product: string;
  category: string;
  site: string;
  avgDailyUse: number;
  daysOfCover: number;
  reorderQty: number;
  suggestedPODate: string;
  supplier: string;
  landedCost: string;
  priority: "high" | "low";
}

export function ReorderTable() {
  const [reorderData, setReorderData] = useState<ReorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { appliedFilters } = useFilters();
  const [showPODialog, setShowPODialog] = useState(false);

  useEffect(() => {
    async function fetchReorderData() {
      try {
        // Check if Supabase is configured
        if (!supabase) {
          throw new Error('Supabase not configured');
        }

        const currentMonth = 10;
        const currentYear = 2025;

        let query = supabase
          .from('products')
          .select(`
            id,
            sku,
            name,
            category,
            site,
            supplier,
            unit_cost,
            reorder_point,
            lead_time_days,
            monthly_inventory!inner(quantity, sales, month, year)
          `)
          .eq('monthly_inventory.year', currentYear)
          .eq('monthly_inventory.month', currentMonth);

        // Apply site filter
        if (appliedFilters.site !== "all") {
          const siteMap: { [key: string]: string } = {
            main: "Clínica Principal",
            north: "Sucursal Norte",
            west: "Sucursal Oeste",
          };
          query = query.eq('site', siteMap[appliedFilters.site]);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        let reorderItems: ReorderItem[] = data?.map((product: any) => {
          const inventory = product.monthly_inventory[0];
          const currentStock = inventory?.quantity || 0;
          const monthlyUsage = inventory?.sales || 1;
          const avgDailyUse = Math.round(monthlyUsage / 30);
          const daysOfCover = monthlyUsage > 0 ? Math.round((currentStock / monthlyUsage) * 30) : 999;
          
          const reorderQty = Math.max(0, product.reorder_point - currentStock);
          
          const daysUntilReorder = Math.max(0, daysOfCover - product.lead_time_days - 5);
          const poDate = new Date();
          poDate.setDate(poDate.getDate() + daysUntilReorder);
          
          const suggestedPODate = daysUntilReorder === 0 ? "Today" : 
                                  daysUntilReorder === 1 ? "Tomorrow" :
                                  poDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
          
          return {
            id: product.id,
            sku: product.sku,
            product: product.name,
            category: product.category,
            site: product.site,
            avgDailyUse,
            daysOfCover,
            reorderQty,
            suggestedPODate,
            supplier: product.supplier,
            landedCost: (product.unit_cost * reorderQty).toLocaleString('es-CO'),
            priority: daysOfCover < 10 ? "high" as const : "low" as const,
          };
        }).sort((a, b) => a.daysOfCover - b.daysOfCover) || [];

        // Apply search filter
        if (appliedFilters.search) {
          const query = appliedFilters.search.toLowerCase();
          reorderItems = reorderItems.filter(item => 
            item.sku.toLowerCase().includes(query) || 
            item.product.toLowerCase().includes(query)
          );
        }

        // Apply alerts filter
        if (appliedFilters.alertsOnly) {
          reorderItems = reorderItems.filter(item => item.daysOfCover < 15);
        }

        setReorderData(reorderItems.slice(0, 5));
      } catch (error) {
        console.error('Error fetching reorder data:', error);
        // Fallback to mock data
        const mockReorderItems: ReorderItem[] = [
          {
            id: '1',
            sku: 'SKU-001',
            product: 'Sample Product',
            category: 'General',
            site: 'Main Site',
            avgDailyUse: 5,
            daysOfCover: 8,
            reorderQty: 100,
            suggestedPODate: 'Today',
            supplier: 'Sample Supplier',
            landedCost: '500',
            priority: 'high',
          }
        ];
        setReorderData(mockReorderItems);
      } finally {
        setLoading(false);
      }
    }

    fetchReorderData();

    // Subscribe to realtime updates for monthly_inventory changes
    if (supabase) {
      const channel = supabase
        .channel('monthly-inventory-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'monthly_inventory'
          },
          () => {
            fetchReorderData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [appliedFilters]);

  return (
    <>
      <div className="card-enterprise-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Reorder Suggestions</h3>
            <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Multi Select
            </Button>
            <Button 
              variant="gradient" 
              size="sm"
              onClick={() => setShowPODialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create PO
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th className="w-12">
                  <Checkbox />
                </th>
                <th>SKU</th>
                <th>Product</th>
                <th>Site</th>
                <th>Avg Daily Use</th>
                <th>Days of Coverage</th>
                <th>Reorder Qty</th>
                <th>Suggested Date</th>
                <th>Supplier</th>
                <th>Total Cost (COP)</th>
              </tr>
            </thead>
            <tbody>
              {reorderData.map((item, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td>
                    <Checkbox />
                  </td>
                  <td className="font-mono text-sm">{item.sku}</td>
                  <td className="font-medium">{item.product}</td>
                  <td>
                    <Badge variant="outline" className="text-xs">
                      {item.site}
                    </Badge>
                  </td>
                  <td className="text-right">{item.avgDailyUse}</td>
                  <td className="text-right">
                    <span className={`font-medium ${
                      item.daysOfCover <= 7 ? 'text-danger' : 
                      item.daysOfCover <= 12 ? 'text-warning' : 'text-card-foreground'
                    }`}>
                      {item.daysOfCover}
                    </span>
                  </td>
                  <td className="text-right font-medium">{item.reorderQty.toLocaleString()}</td>
                  <td>
                    <Badge className={
                      item.suggestedPODate === "Today" ? "badge-danger" :
                      item.suggestedPODate === "Tomorrow" ? "badge-warning" :
                      "badge-success"
                    }>
                      {item.suggestedPODate}
                    </Badge>
                  </td>
                  <td>{item.supplier}</td>
                  <td className="text-right font-medium">₲{item.landedCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePurchaseOrderDialog 
        open={showPODialog} 
        onOpenChange={setShowPODialog}
      />
    </>
  );
}