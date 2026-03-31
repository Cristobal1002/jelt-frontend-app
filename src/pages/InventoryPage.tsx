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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftRight, Download, PackagePlus, ShoppingCart } from "lucide-react";

type StockLevel = "ok" | "bajo" | "critico";

type MockProduct = {
  sku: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  almacen: string;
  nivel: StockLevel;
};

const MOCK_PRODUCTS: MockProduct[] = [
  {
    sku: "INS-8841",
    nombre: "Guantes nitrilo talla M (caja)",
    categoria: "Protección",
    stock: 420,
    minimo: 80,
    almacen: "Central A",
    nivel: "ok",
  },
  {
    sku: "MED-2204",
    nombre: "Jeringa estéril 10 ml",
    categoria: "Consumibles",
    stock: 95,
    minimo: 120,
    almacen: "Central A",
    nivel: "bajo",
  },
  {
    sku: "LAB-9910",
    nombre: "Tiras reactivas glucosa (50 u.)",
    categoria: "Laboratorio",
    stock: 12,
    minimo: 40,
    almacen: "Lab L2",
    nivel: "critico",
  },
  {
    sku: "INS-7720",
    nombre: "Mascarilla quirúrgica tipo IIR",
    categoria: "Protección",
    stock: 2100,
    minimo: 500,
    almacen: "Central B",
    nivel: "ok",
  },
  {
    sku: "MED-1102",
    nombre: "Suero fisiológico 500 ml",
    categoria: "Fluidos",
    stock: 180,
    minimo: 100,
    almacen: "Urgencias",
    nivel: "ok",
  },
  {
    sku: "ORT-3301",
    nombre: "Venda elástica 10 cm",
    categoria: "Ortopedia",
    stock: 28,
    minimo: 30,
    almacen: "Central A",
    nivel: "bajo",
  },
];

function StockBadge({ nivel }: { nivel: StockLevel }) {
  const label: Record<StockLevel, string> = {
    ok: "En rango",
    bajo: "Bajo mínimo",
    critico: "Crítico",
  };
  if (nivel === "ok") {
    return (
      <Badge variant="secondary" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100">
        {label.ok}
      </Badge>
    );
  }
  if (nivel === "bajo") {
    return (
      <Badge variant="secondary" className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100">
        {label.bajo}
      </Badge>
    );
  }
  return <Badge variant="destructive">{label.critico}</Badge>;
}

export default function InventoryPage() {
  const { openAddProduct, openSale, openMovement } = useDashboardDialogs();
  const { toast } = useToast();

  const handleExportCSV = () => {
    toast({
      title: "Exportar",
      description:
        "Esta función estará disponible cuando los endpoints de inventario estén implementados en el backend.",
      variant: "default",
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Inventario</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista simulada. Los botones abren los mismos diálogos que en el tablero (añadir producto, venta y movimiento).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hover:bg-[hsl(var(--muted))]"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            onClick={() => openAddProduct()}
          >
            <PackagePlus className="w-4 h-4 mr-2" />
            Añadir producto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            onClick={() => openSale()}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Registrar venta
          </Button>
          <Button type="button" variant="default" size="sm" className="shadow-sm" onClick={() => openMovement()}>
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Movimiento
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[110px]">SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Mín.</TableHead>
              <TableHead className="hidden lg:table-cell">Almacén</TableHead>
              <TableHead className="w-[140px]">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PRODUCTS.map((row) => (
              <TableRow key={row.sku}>
                <TableCell className="font-mono text-sm text-muted-foreground">{row.sku}</TableCell>
                <TableCell className="font-medium text-foreground">{row.nombre}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{row.categoria}</TableCell>
                <TableCell className="text-right tabular-nums">{row.stock}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                  {row.minimo}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{row.almacen}</TableCell>
                <TableCell>
                  <StockBadge nivel={row.nivel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
