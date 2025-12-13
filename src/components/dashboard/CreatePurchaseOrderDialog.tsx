import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Alert {
  id: string;
  products: {
    id: string;
    name: string;
    sku: string;
    supplier: string;
    unit_cost: number;
  };
  suggested_reorder_qty: number;
  current_stock: number;
  days_of_coverage: number;
  severity: string;
}

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedAlerts?: Alert[];
}

export function CreatePurchaseOrderDialog({ 
  open, 
  onOpenChange,
  preSelectedAlerts = []
}: CreatePurchaseOrderDialogProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (preSelectedAlerts.length > 0) {
        setAlerts(preSelectedAlerts);
        const selected = new Set(preSelectedAlerts.map(a => a.id));
        setSelectedItems(selected);
        const qtys: { [key: string]: number } = {};
        preSelectedAlerts.forEach(alert => {
          qtys[alert.id] = alert.suggested_reorder_qty;
        });
        setQuantities(qtys);
      } else {
        fetchAlerts();
      }
    }
  }, [open, preSelectedAlerts]);

  async function fetchAlerts() {
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
        .eq('is_active', true)
        .order('severity', { ascending: true })
        .order('days_of_coverage', { ascending: true });

      if (error) throw error;

      setAlerts(data as Alert[]);
      
      // Pre-select alerts with low coverage (less than 15 days) or high severity
      const lowCoverage = data?.filter((a: Alert) => 
        a.severity === 'high' || a.severity === 'medium' || a.days_of_coverage < 15
      ).map((a: Alert) => a.id) || [];
      setSelectedItems(new Set(lowCoverage));
      
      // Set default quantities
      const qtys: { [key: string]: number } = {};
      data?.forEach((alert: Alert) => {
        qtys[alert.id] = alert.suggested_reorder_qty;
      });
      setQuantities(qtys);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Could not load alerts",
        variant: "destructive",
      });
    }
  }

  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const updateQuantity = (id: string, value: number) => {
    setQuantities({ ...quantities, [id]: value });
  };

  const calculateTotal = () => {
    return Array.from(selectedItems).reduce((total, alertId) => {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return total;
      const qty = quantities[alertId] || 0;
      return total + (alert.products.unit_cost * qty);
    }, 0);
  };

  const groupBySupplier = () => {
    const groups: { [key: string]: Alert[] } = {};
    alerts.forEach(alert => {
      if (selectedItems.has(alert.id)) {
        const supplier = alert.products.supplier;
        if (!groups[supplier]) {
          groups[supplier] = [];
        }
        groups[supplier].push(alert);
      }
    });
    return groups;
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const groups = groupBySupplier();
    
    let yPosition = 20;
    
    // Title
    doc.setFontSize(18);
    doc.text("Purchase Orders", 14, yPosition);
    yPosition += 10;
    
    // Date and notes
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, yPosition);
    yPosition += 5;
    if (deliveryDate) {
      doc.text(`Expected Delivery: ${new Date(deliveryDate).toLocaleDateString()}`, 14, yPosition);
      yPosition += 5;
    }
    if (notes) {
      doc.text(`Notes: ${notes}`, 14, yPosition);
      yPosition += 10;
    }
    yPosition += 5;
    
    // For each supplier
    Object.entries(groups).forEach(([supplier, supplierAlerts], index) => {
      if (index > 0) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Supplier: ${supplier}`, 14, yPosition);
      yPosition += 10;
      
      // Table data
      const tableData = supplierAlerts.map(alert => {
        const qty = quantities[alert.id] || alert.suggested_reorder_qty;
        const subtotal = qty * alert.products.unit_cost;
        return [
          alert.products.name,
          alert.products.sku,
          qty.toString(),
          `$${alert.products.unit_cost.toLocaleString()}`,
          `$${subtotal.toLocaleString()}`
        ];
      });
      
      // Calculate supplier total
      const supplierTotal = supplierAlerts.reduce((sum, alert) => {
        const qty = quantities[alert.id] || alert.suggested_reorder_qty;
        return sum + (alert.products.unit_cost * qty);
      }, 0);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Product', 'SKU', 'Quantity', 'Unit Cost', 'Subtotal']],
        body: tableData,
        foot: [['', '', '', 'Total:', `$${supplierTotal.toLocaleString()}`]],
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
    });
    
    doc.save(`purchase-order-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleCreatePO = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "Selection required",
        description: "Select at least one product",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const groups = groupBySupplier();
      
      for (const [supplier, supplierAlerts] of Object.entries(groups)) {
        // Get PO number
        const { data: poNumberData, error: poNumberError } = await supabase
          .rpc('generate_po_number');
        
        if (poNumberError) throw poNumberError;
        
        const po_number = poNumberData as string;
        
        // Calculate total for this supplier
        const total = supplierAlerts.reduce((sum, alert) => {
          const qty = quantities[alert.id] || 0;
          return sum + (alert.products.unit_cost * qty);
        }, 0);

        // Create purchase order
        const { data: po, error: poError } = await supabase
          .from('purchase_orders')
          .insert({
            po_number,
            supplier,
            total_amount: total,
            notes,
            expected_delivery_date: deliveryDate || null,
            created_by: user.id,
            status: 'draft'
          })
          .select()
          .single();

        if (poError) throw poError;

        // Create purchase order items
        const items = supplierAlerts.map(alert => ({
          purchase_order_id: po.id,
          product_id: alert.products.id,
          quantity: quantities[alert.id] || alert.suggested_reorder_qty,
          unit_cost: alert.products.unit_cost,
          subtotal: (quantities[alert.id] || alert.suggested_reorder_qty) * alert.products.unit_cost,
          alert_id: alert.id
        }));

        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      // Download PDF after successful creation
      downloadPDF();

      toast({
        title: "Purchase orders created",
        description: `Successfully created ${Object.keys(groups).length} purchase order(s)`,
      });

      onOpenChange(false);
      setSelectedItems(new Set());
      setQuantities({});
      setNotes("");
      setDeliveryDate("");
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: "Error",
        description: "Could not create purchase order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Create Purchase Order
          </DialogTitle>
          <DialogDescription>
            Select products to include in the purchase order. Separate orders will be created per supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Date and Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-date">Expected Delivery Date</Label>
              <Input
                id="delivery-date"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="h-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="w-12 p-2"></th>
                  <th className="text-left p-2 text-sm font-medium">Product</th>
                  <th className="text-left p-2 text-sm font-medium">Supplier</th>
                  <th className="text-right p-2 text-sm font-medium">Stock</th>
                  <th className="text-right p-2 text-sm font-medium">Coverage</th>
                  <th className="text-right p-2 text-sm font-medium">Quantity</th>
                  <th className="text-right p-2 text-sm font-medium">Unit Cost</th>
                  <th className="text-right p-2 text-sm font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const qty = quantities[alert.id] || alert.suggested_reorder_qty;
                  const subtotal = qty * alert.products.unit_cost;
                  const isSelected = selectedItems.has(alert.id);

                  return (
                    <tr key={alert.id} className={`border-t ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="p-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(alert.id)}
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <p className="font-medium text-sm">{alert.products.name}</p>
                          <p className="text-xs text-muted-foreground">{alert.products.sku}</p>
                        </div>
                      </td>
                      <td className="p-2 text-sm">{alert.products.supplier}</td>
                      <td className="p-2 text-right text-sm">{alert.current_stock}</td>
                      <td className="p-2 text-right">
                        <span className={`text-sm font-medium ${
                          alert.days_of_coverage < 10 ? 'text-danger' : 
                          alert.days_of_coverage < 15 ? 'text-warning' : 
                          'text-muted-foreground'
                        }`}>
                          {alert.days_of_coverage}d
                        </span>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={qty}
                          onChange={(e) => updateQuantity(alert.id, parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-20 text-right"
                          disabled={!isSelected}
                        />
                      </td>
                       <td className="p-2 text-right text-sm">
                        ${alert.products.unit_cost.toLocaleString()}
                      </td>
                      <td className="p-2 text-right text-sm font-medium">
                        ${subtotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted border-t-2">
                <tr>
                  <td colSpan={7} className="p-2 text-right font-medium">Total:</td>
                  <td className="p-2 text-right font-bold">
                    ${calculateTotal().toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary by Supplier */}
          {selectedItems.size > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Summary by Supplier:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(groupBySupplier()).map(([supplier, items]) => (
                  <div key={supplier} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">{supplier}</p>
                    <p className="text-xs text-muted-foreground">{items.length} products</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleCreatePO} disabled={loading || selectedItems.size === 0}>
              {loading ? "Creating..." : `Create ${Object.keys(groupBySupplier()).length} Order(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}