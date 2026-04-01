import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  Package,
  LineChart,
} from "lucide-react";

export type MainNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

/** Enlaces principales: tablero, órdenes, facturación, inventario, análisis */
export const mainNavItems: MainNavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Órdenes", icon: ClipboardList },
  { to: "/billing", label: "Facturación", icon: FileSpreadsheet },
  { to: "/inventory", label: "Inventario", icon: Package },
  { to: "/analysis", label: "Análisis", icon: LineChart },
];
