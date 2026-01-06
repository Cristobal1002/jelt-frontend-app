import { Button } from "@/components/ui/button";
import { FileText, Download, Plus, ChevronRight, LogOut, Package, PackagePlus, ShoppingCart, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useFilters } from "@/contexts/FilterContext";
import { useState } from "react";
import { CreatePurchaseOrderDialog } from "./CreatePurchaseOrderDialog";
import { AddProductDialog } from "./AddProductDialog";
import { CreateSaleDialog } from "./CreateSaleDialog";
import { CreateMovementDialog } from "./CreateMovementDialog";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { appliedFilters } = useFilters();
  const [showPODialog, setShowPODialog] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You've successfully signed out.",
    });
    navigate("/auth");
  };

  const handleExportCSV = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
      const currentYear = now.getFullYear();

      // TODO: Replace with backend API call when inventory endpoints are available
      // For now, this will show an error message
      toast({
        title: "Export feature",
        description: "This feature will be available once inventory endpoints are implemented in the backend.",
        variant: "default",
      });
      return;

      /* 
      // Example of how to call the backend API when endpoints are ready:
      const response = await apiClient.get('/inventory/products', {
        params: {
          month: currentMonth,
          year: currentYear,
          site: appliedFilters.site !== "all" ? appliedFilters.site : undefined,
        }
      });
      */

      /* Original Supabase code (commented out for reference):
      let query = supabase
        .from('products')
        .select(`
          sku,
          name,
          category,
          site,
          supplier,
          unit_cost,
          reorder_point,
          lead_time_days,
          monthly_inventory!inner(quantity, sales, forecast, month, year)
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

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No data",
          description: "No data to export with the applied filters.",
          variant: "destructive",
        });
        return;
      }

      // Apply search filter
      let filteredData = data;
      if (appliedFilters.search) {
        const searchLower = appliedFilters.search.toLowerCase();
        filteredData = data.filter((item: any) => 
          item.sku.toLowerCase().includes(searchLower) || 
          item.name.toLowerCase().includes(searchLower)
        );
      }

      // Prepare CSV data
      const csvData = filteredData.map((product: any) => {
        const inventory = product.monthly_inventory[0];
        const currentStock = inventory?.quantity || 0;
        const monthlyUsage = inventory?.sales || 0;
        const forecast = inventory?.forecast || 0;
        const daysOfCover = monthlyUsage > 0 ? Math.round((currentStock / monthlyUsage) * 30) : 0;
        const reorderQty = Math.max(0, product.reorder_point - currentStock);

        return {
          SKU: product.sku,
          Product: product.name,
          Category: product.category,
          Site: product.site,
          Supplier: product.supplier,
          'Current Stock': currentStock,
          'Monthly Usage': monthlyUsage,
          'Forecast': forecast,
          'Days of Coverage': daysOfCover,
          'Reorder Qty': reorderQty,
          'Unit Cost': product.unit_cost,
          'Reorder Point': product.reorder_point,
          'Lead Time (days)': product.lead_time_days,
        };
      });

      // Convert to CSV with UTF-8 BOM for proper Excel encoding
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
      ).join('\n');
      const csv = `\uFEFF${headers}\n${rows}`; // Add BOM for UTF-8

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `Exported ${csvData.length} products.`,
      });
      */
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export error",
        description: "There was a problem exporting the data.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(var(--card-glass))] border-b border-[hsl(var(--border))]">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - AI Platform Brand */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-gradient-ai flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <span className="ai-spark absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-card-foreground">Hospital Jelt</h1>
                </div>
              </div>

              {/* AI Status Indicator */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--success-glow))] border border-[hsl(var(--success))]/20">
                <span className="ai-spark" />
                <span className="text-xs font-medium text-[hsl(var(--success))]">
                  AI ACTIVE · real-time predictions
                </span>
              </div>
            </div>

            {/* Right side - Smart Actions */}
            <div className="flex items-center space-x-3">
              <Button 
                onClick={handleExportCSV}
                variant="ghost" 
                size="sm" 
                className="hover:bg-muted/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={() => setShowAddProductDialog(true)}
                variant="outline"
                size="sm" 
                className="border-[hsl(var(--border))] hover:bg-muted/50"
              >
                <PackagePlus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button 
                onClick={() => setShowPODialog(true)}
                size="sm" 
                className="bg-gradient-ai text-white hover:opacity-90 shadow-lg ai-hover-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
              <Button 
                onClick={handleLogout}
                variant="ghost" 
                size="sm"
                className="hover:bg-muted/50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <CreatePurchaseOrderDialog 
        open={showPODialog} 
        onOpenChange={setShowPODialog} 
      />
      
      <AddProductDialog 
        open={showAddProductDialog} 
        onOpenChange={setShowAddProductDialog} 
      />

      <CreateSaleDialog
        open={showSaleDialog}
        onOpenChange={setShowSaleDialog}
      />

      <CreateMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
      />
    </>
  );
}