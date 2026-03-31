import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardDialogs } from "@/contexts/DashboardDialogsContext";
import { Plus } from "lucide-react";

type OrderStatus = "borrador" | "enviada" | "recibida" | "pendiente";

type MockOrder = {
  id: string;
  fecha: string;
  proveedor: string;
  lineas: number;
  total: string;
  estado: OrderStatus;
};

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "OC-2026-0142",
    fecha: "28 mar 2026",
    proveedor: "MedSupply MX",
    lineas: 8,
    total: "$ 42,180.00",
    estado: "enviada",
  },
  {
    id: "OC-2026-0141",
    fecha: "26 mar 2026",
    proveedor: "Distribuidora Norte",
    lineas: 12,
    total: "$ 67,400.50",
    estado: "recibida",
  },
  {
    id: "OC-2026-0140",
    fecha: "25 mar 2026",
    proveedor: "Insumos Clínicos SA",
    lineas: 5,
    total: "$ 18,920.00",
    estado: "pendiente",
  },
  {
    id: "OC-2026-0139",
    fecha: "22 mar 2026",
    proveedor: "MedSupply MX",
    lineas: 3,
    total: "$ 9,150.75",
    estado: "borrador",
  },
  {
    id: "OC-2026-0138",
    fecha: "20 mar 2026",
    proveedor: "Laboratorio Central",
    lineas: 20,
    total: "$ 124,300.00",
    estado: "enviada",
  },
  {
    id: "OC-2026-0137",
    fecha: "18 mar 2026",
    proveedor: "Distribuidora Norte",
    lineas: 6,
    total: "$ 31,005.20",
    estado: "recibida",
  },
];

function StatusBadge({ estado }: { estado: OrderStatus }) {
  const label: Record<OrderStatus, string> = {
    borrador: "Borrador",
    enviada: "Enviada",
    recibida: "Recibida",
    pendiente: "Pendiente",
  };
  const variant =
    estado === "enviada"
      ? "default"
      : estado === "recibida"
        ? "secondary"
        : estado === "borrador"
          ? "outline"
          : "secondary";

  return (
    <Badge variant={variant} className={estado === "pendiente" ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100" : undefined}>
      {label[estado]}
    </Badge>
  );
}

export default function OrdersPage() {
  const { openCreateOrder } = useDashboardDialogs();

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Órdenes de compra</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Listado simulado para la demo — el botón crea una orden con el mismo flujo que en el tablero.
          </p>
        </div>
        <Button variant="default" size="default" className="shadow-sm shrink-0" onClick={() => openCreateOrder()}>
          <Plus className="h-4 w-4 mr-2" />
          Crear orden
        </Button>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Líneas</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[140px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ORDERS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">{row.id}</TableCell>
                <TableCell className="text-muted-foreground">{row.fecha}</TableCell>
                <TableCell>{row.proveedor}</TableCell>
                <TableCell className="text-right tabular-nums">{row.lineas}</TableCell>
                <TableCell className="text-right tabular-nums font-medium">{row.total}</TableCell>
                <TableCell>
                  <StatusBadge estado={row.estado} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
