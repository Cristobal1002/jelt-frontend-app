import { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, FileText, Receipt } from "lucide-react";

type PendingOrder = {
  id: string;
  fecha: string;
  proveedor: string;
  total: string;
  recepcion: "recibida" | "enviada";
};

type IssuedInvoice = {
  folio: string;
  ocOrigen: string;
  fechaEmision: string;
  proveedor: string;
  total: string;
  estadoPago: "pendiente" | "pagada";
};

const INITIAL_PENDING: PendingOrder[] = [
  {
    id: "OC-2026-0142",
    fecha: "28 mar 2026",
    proveedor: "MedSupply MX",
    total: "$ 42,180.00",
    recepcion: "recibida",
  },
  {
    id: "OC-2026-0141",
    fecha: "26 mar 2026",
    proveedor: "Distribuidora Norte",
    total: "$ 67,400.50",
    recepcion: "recibida",
  },
  {
    id: "OC-2026-0138",
    fecha: "20 mar 2026",
    proveedor: "Laboratorio Central",
    total: "$ 124,300.00",
    recepcion: "enviada",
  },
];

const INITIAL_INVOICES: IssuedInvoice[] = [
  {
    folio: "F-2026-0088",
    ocOrigen: "OC-2026-0137",
    fechaEmision: "19 mar 2026",
    proveedor: "Distribuidora Norte",
    total: "$ 31,005.20",
    estadoPago: "pagada",
  },
  {
    folio: "F-2026-0087",
    ocOrigen: "OC-2026-0135",
    fechaEmision: "15 mar 2026",
    proveedor: "MedSupply MX",
    total: "$ 12,450.00",
    estadoPago: "pendiente",
  },
];

function nextFolio(existing: IssuedInvoice[]): string {
  const nums = existing.map((inv) => {
    const m = inv.folio.match(/F-2026-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const max = nums.length ? Math.max(...nums) : 87;
  return `F-2026-${String(max + 1).padStart(4, "0")}`;
}

export default function BillingPage() {
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingOrder[]>(INITIAL_PENDING);
  const [invoices, setInvoices] = useState<IssuedInvoice[]>(INITIAL_INVOICES);
  const [convertOpen, setConvertOpen] = useState(false);
  const [selected, setSelected] = useState<PendingOrder | null>(null);

  const previewFolio = useMemo(() => nextFolio(invoices), [invoices]);

  const openConvert = (row: PendingOrder) => {
    setSelected(row);
    setConvertOpen(true);
  };

  const emitInvoice = () => {
    if (!selected) return;
    const folio = nextFolio(invoices);
    const hoy = new Date().toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    setInvoices((prev) => [
      {
        folio,
        ocOrigen: selected.id,
        fechaEmision: hoy,
        proveedor: selected.proveedor,
        total: selected.total,
        estadoPago: "pendiente",
      },
      ...prev,
    ]);
    setPending((prev) => prev.filter((p) => p.id !== selected.id));
    toast({
      title: "Factura emitida",
      description: `La orden ${selected.id} pasó a factura ${folio} (simulación de demo).`,
    });
    setConvertOpen(false);
    setSelected(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Facturación</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Simulación: convierte una orden de compra recibida o enviada en una factura de proveedor. El flujo queda registrado con folio y vínculo a la OC.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Órdenes de compra → factura</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Órdenes elegibles para facturación. Pulsa <span className="font-medium text-foreground">Pasar a factura</span> para generar el documento.
        </p>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-card shadow-sm overflow-hidden">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center text-muted-foreground text-sm">
              <FileText className="h-10 w-10 mb-3 opacity-30" />
              <p>No hay órdenes pendientes de facturar.</p>
              <p className="mt-1 text-xs">Cuando recibas nuevas OC en el sistema, aparecerán aquí.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[140px]">Orden de compra</TableHead>
                  <TableHead>Fecha OC</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="w-[120px]">Recepción</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[180px] text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-foreground">{row.id}</TableCell>
                    <TableCell className="text-muted-foreground">{row.fecha}</TableCell>
                    <TableCell>{row.proveedor}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          row.recepcion === "recibida"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100"
                        }
                      >
                        {row.recepcion === "recibida" ? "Recibida" : "Enviada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{row.total}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="shadow-sm" onClick={() => openConvert(row)}>
                        Pasar a factura
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[hsl(var(--primary))]" aria-hidden />
          <h2 className="text-lg font-semibold text-foreground">Facturas emitidas</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Facturas generadas desde órdenes de compra (historial simulado).
        </p>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[130px]">Folio</TableHead>
                <TableHead className="w-[140px]">OC origen</TableHead>
                <TableHead>Fecha emisión</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[120px]">Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.folio}>
                  <TableCell className="font-mono font-medium text-foreground">{inv.folio}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{inv.ocOrigen}</TableCell>
                  <TableCell className="text-muted-foreground">{inv.fechaEmision}</TableCell>
                  <TableCell>{inv.proveedor}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{inv.total}</TableCell>
                  <TableCell>
                    <Badge variant={inv.estadoPago === "pagada" ? "default" : "secondary"}>
                      {inv.estadoPago === "pagada" ? "Pagada" : "Pendiente"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog
        open={convertOpen}
        onOpenChange={(open) => {
          setConvertOpen(open);
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Orden de compra → factura</DialogTitle>
            <DialogDescription>
              Confirmación de simulación: se creará una factura de proveedor vinculada a esta OC.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 py-2">
              <div className="flex items-center justify-center gap-3 flex-wrap text-sm">
                <div className="rounded-lg border border-[hsl(var(--border))] bg-muted/40 px-4 py-3 text-center min-w-[140px]">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Orden de compra</p>
                  <p className="font-semibold text-foreground mt-1">{selected.id}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[hsl(var(--primary))] shrink-0" />
                <div className="rounded-lg border border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/5 px-4 py-3 text-center min-w-[140px]">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Factura</p>
                  <p className="font-semibold text-[hsl(var(--primary))] mt-1">{previewFolio}</p>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-3 text-sm border-t border-[hsl(var(--border))] pt-4">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Proveedor</dt>
                  <dd className="font-medium text-foreground text-right">{selected.proveedor}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Importe</dt>
                  <dd className="font-semibold text-foreground tabular-nums">{selected.total}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Tipo</dt>
                  <dd className="text-foreground">Factura de proveedor (CXP)</dd>
                </div>
              </dl>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConvertOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={emitInvoice}>
              Emitir factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
