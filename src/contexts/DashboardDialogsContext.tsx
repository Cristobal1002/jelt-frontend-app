import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { CreatePurchaseOrderDialog } from "@/components/dashboard/CreatePurchaseOrderDialog";
import { AddProductDialog } from "@/components/dashboard/AddProductDialog";
import { CreateSaleDialog } from "@/components/dashboard/CreateSaleDialog";
import { CreateMovementDialog } from "@/components/dashboard/CreateMovementDialog";

type DashboardDialogsContextValue = {
  openCreateOrder: () => void;
  openAddProduct: () => void;
  openSale: () => void;
  openMovement: () => void;
};

const DashboardDialogsContext = createContext<DashboardDialogsContextValue | null>(null);

export function DashboardDialogsProvider({ children }: { children: ReactNode }) {
  const [poOpen, setPoOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);

  const value = useMemo(
    () => ({
      openCreateOrder: () => setPoOpen(true),
      openAddProduct: () => setAddProductOpen(true),
      openSale: () => setSaleOpen(true),
      openMovement: () => setMovementOpen(true),
    }),
    [],
  );

  return (
    <DashboardDialogsContext.Provider value={value}>
      {children}
      <CreatePurchaseOrderDialog open={poOpen} onOpenChange={setPoOpen} />
      <AddProductDialog open={addProductOpen} onOpenChange={setAddProductOpen} />
      <CreateSaleDialog open={saleOpen} onOpenChange={setSaleOpen} />
      <CreateMovementDialog open={movementOpen} onOpenChange={setMovementOpen} />
    </DashboardDialogsContext.Provider>
  );
}

export function useDashboardDialogs() {
  const ctx = useContext(DashboardDialogsContext);
  if (!ctx) throw new Error("useDashboardDialogs must be used within DashboardDialogsProvider");
  return ctx;
}
