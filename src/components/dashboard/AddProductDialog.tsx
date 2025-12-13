import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import type { Category, Supplier, Stockroom } from "@/lib/api-client";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockrooms, setStockrooms] = useState<Stockroom[]>([]);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showCreateSupplier, setShowCreateSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierNit, setNewSupplierNit] = useState("");
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [showCreateStockroom, setShowCreateStockroom] = useState(false);
  const [newStockroomName, setNewStockroomName] = useState("");
  const [creatingStockroom, setCreatingStockroom] = useState(false);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    id_category: "",
    id_supplier: "",
    id_stockroom: "",
    unit_price: "",
    unit_cost: "",
    stock: "0",
    reorder_point: "",
    lead_time: "",
    description: "",
  });

  // Load categories, suppliers, and stockrooms when dialog opens
  useEffect(() => {
    if (open) {
      loadOptions();
    } else {
      // Reset create category, supplier and stockroom state when dialog closes
      setShowCreateCategory(false);
      setNewCategoryName("");
      setShowCreateSupplier(false);
      setNewSupplierName("");
      setNewSupplierNit("");
      setShowCreateStockroom(false);
      setNewStockroomName("");
    }
  }, [open]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      // Load all options in parallel
      const [categoriesRes, suppliersRes, stockroomsRes] = await Promise.all([
        apiClient.listCategories({ perPage: 100, isActive: true }),
        apiClient.listSuppliers({ perPage: 100, isActive: true }),
        apiClient.listStockrooms({ perPage: 100, isActive: true }),
      ]);

      setCategories(categoriesRes.data.items);
      setSuppliers(suppliersRes.data.items);
      setStockrooms(stockroomsRes.data.items);
    } catch (error: any) {
      console.error("Error loading options:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Validation error",
        description: "Category name is required.",
        variant: "destructive",
      });
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await apiClient.createCategory({
        name: newCategoryName.trim(),
        isActive: true,
      });

      const newCategory = response.data;
      
      // Add to categories list
      setCategories([...categories, newCategory]);
      
      // Select the newly created category
      setFormData({ ...formData, id_category: newCategory.id });
      
      // Reset create category form
      setNewCategoryName("");
      setShowCreateCategory(false);

      toast({
        title: "Category created",
        description: `${newCategory.name} has been created and selected.`,
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive",
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === "__create_new__") {
      setShowCreateCategory(true);
      setFormData({ ...formData, id_category: "" });
    } else {
      setShowCreateCategory(false);
      setFormData({ ...formData, id_category: value });
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim() || !newSupplierNit.trim()) {
      toast({
        title: "Validation error",
        description: "Supplier name and NIT are required.",
        variant: "destructive",
      });
      return;
    }

    setCreatingSupplier(true);
    try {
      const response = await apiClient.createSupplier({
        name: newSupplierName.trim(),
        nit: newSupplierNit.trim(),
      });

      const newSupplier = response.data;
      
      // Add to suppliers list
      setSuppliers([...suppliers, newSupplier]);
      
      // Select the newly created supplier
      setFormData({ ...formData, id_supplier: newSupplier.id });
      
      // Reset create supplier form
      setNewSupplierName("");
      setNewSupplierNit("");
      setShowCreateSupplier(false);

      toast({
        title: "Supplier created",
        description: `${newSupplier.name} has been created and selected.`,
      });
    } catch (error: any) {
      console.error("Error creating supplier:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create supplier.",
        variant: "destructive",
      });
    } finally {
      setCreatingSupplier(false);
    }
  };

  const handleSupplierChange = (value: string) => {
    if (value === "__create_new__") {
      setShowCreateSupplier(true);
      setFormData({ ...formData, id_supplier: "" });
    } else {
      setShowCreateSupplier(false);
      setFormData({ ...formData, id_supplier: value });
    }
  };

  const handleCreateStockroom = async () => {
    if (!newStockroomName.trim()) {
      toast({
        title: "Validation error",
        description: "Stockroom name is required.",
        variant: "destructive",
      });
      return;
    }

    setCreatingStockroom(true);
    try {
      const response = await apiClient.createStockroom({
        name: newStockroomName.trim(),
      });

      const newStockroom = response.data;
      
      // Add to stockrooms list
      setStockrooms([...stockrooms, newStockroom]);
      
      // Select the newly created stockroom
      setFormData({ ...formData, id_stockroom: newStockroom.id });
      
      // Reset create stockroom form
      setNewStockroomName("");
      setShowCreateStockroom(false);

      toast({
        title: "Stockroom created",
        description: `${newStockroom.name} has been created and selected.`,
      });
    } catch (error: any) {
      console.error("Error creating stockroom:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create stockroom.",
        variant: "destructive",
      });
    } finally {
      setCreatingStockroom(false);
    }
  };

  const handleStockroomChange = (value: string) => {
    if (value === "__create_new__") {
      setShowCreateStockroom(true);
      setFormData({ ...formData, id_stockroom: "" });
    } else {
      setShowCreateStockroom(false);
      setFormData({ ...formData, id_stockroom: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.sku || !formData.name || !formData.id_category || !formData.id_supplier || !formData.id_stockroom || !formData.unit_price || !formData.unit_cost) {
        toast({
          title: "Validation error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create article
      const response = await apiClient.createArticle({
        sku: formData.sku,
        name: formData.name,
        id_category: formData.id_category,
        id_supplier: formData.id_supplier,
        id_stockroom: formData.id_stockroom,
        unit_price: parseFloat(formData.unit_price),
        unit_cost: parseFloat(formData.unit_cost),
        stock: parseInt(formData.stock) || 0,
        reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : undefined,
        lead_time: formData.lead_time ? parseInt(formData.lead_time) : undefined,
        description: formData.description || undefined,
      });

      toast({
        title: "Product created",
        description: `${formData.name} has been added to inventory.`,
      });

      // Reset form and close dialog
      setFormData({
        sku: "",
        name: "",
        id_category: "",
        id_supplier: "",
        id_stockroom: "",
        unit_price: "",
        unit_cost: "",
        stock: "0",
        reorder_point: "",
        lead_time: "",
        description: "",
      });
      onOpenChange(false);
      
      // Dispatch custom event to refresh data in other components
      window.dispatchEvent(new CustomEvent('article:created'));
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-[hsl(var(--border))]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="ai-spark" />
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Create a new product in the inventory system. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                placeholder="e.g., MED-001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Surgical Gloves"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              {!showCreateCategory ? (
                <Select
                  value={formData.id_category}
                  onValueChange={handleCategoryChange}
                  disabled={loadingOptions}
                  required
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__create_new__" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create new category
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      disabled={creatingCategory}
                      className="bg-background/50"
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      size="sm"
                      className="bg-gradient-ai text-white hover:opacity-90"
                    >
                      {creatingCategory ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCreateCategory(false);
                        setNewCategoryName("");
                      }}
                      variant="outline"
                      size="sm"
                      disabled={creatingCategory}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              {!showCreateSupplier ? (
                <Select
                  value={formData.id_supplier}
                  onValueChange={handleSupplierChange}
                  disabled={loadingOptions}
                  required
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__create_new__" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create new supplier
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Supplier name"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        disabled={creatingSupplier}
                        className="bg-background/50"
                        autoFocus
                      />
                      <Input
                        placeholder="NIT (e.g., 900123456-7)"
                        value={newSupplierNit}
                        onChange={(e) => setNewSupplierNit(e.target.value)}
                        disabled={creatingSupplier}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        onClick={handleCreateSupplier}
                        disabled={creatingSupplier || !newSupplierName.trim() || !newSupplierNit.trim()}
                        size="sm"
                        className="bg-gradient-ai text-white hover:opacity-90"
                      >
                        {creatingSupplier ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setShowCreateSupplier(false);
                          setNewSupplierName("");
                          setNewSupplierNit("");
                        }}
                        variant="outline"
                        size="sm"
                        disabled={creatingSupplier}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockroom">Stockroom (Bodega) *</Label>
              {!showCreateStockroom ? (
                <Select
                  value={formData.id_stockroom}
                  onValueChange={handleStockroomChange}
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
                    <SelectItem value="__create_new__" className="text-primary font-medium">
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create new stockroom
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Stockroom name"
                      value={newStockroomName}
                      onChange={(e) => setNewStockroomName(e.target.value)}
                      disabled={creatingStockroom}
                      className="bg-background/50"
                      autoFocus
                    />
                    <Button
                      type="button"
                      onClick={handleCreateStockroom}
                      disabled={creatingStockroom || !newStockroomName.trim()}
                      size="sm"
                      className="bg-gradient-ai text-white hover:opacity-90"
                    >
                      {creatingStockroom ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setShowCreateStockroom(false);
                        setNewStockroomName("");
                      }}
                      variant="outline"
                      size="sm"
                      disabled={creatingStockroom}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price ($) *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost ($) *</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                required
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                min="0"
                placeholder="50"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead_time">Lead Time (days)</Label>
              <Input
                id="lead_time"
                type="number"
                min="0"
                placeholder="7"
                value={formData.lead_time}
                onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background/50"
              />
            </div>
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
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
