import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useDashboardDialogs } from "@/contexts/DashboardDialogsContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, PackagePlus, Plus, LogOut, LayoutTemplate, PanelTop } from "lucide-react";

export function ClassicAppHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const { layoutMode, setLayoutMode } = useLayoutMode();
  const { openAddProduct, openCreateOrder } = useDashboardDialogs();

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4">
      <p className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:block">Panel de gestión</p>
      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate max-w-[200px]" title={user?.email}>
          {user?.name?.trim() || user?.email?.split("@")[0] || "Usuario"}
        </span>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 border-input-border" aria-label="Más opciones">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Vista</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => setLayoutMode("modern")}
              className={layoutMode === "modern" ? "bg-accent" : ""}
            >
              <PanelTop className="mr-2 h-4 w-4" />
              Vista moderna (actual)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLayoutMode("classic")}
              className={layoutMode === "classic" ? "bg-accent" : ""}
            >
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Vista clásica (menú lateral)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Accesos rápidos</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openAddProduct()}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Añadir producto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openCreateOrder()}>
              <Plus className="mr-2 h-4 w-4" />
              Crear orden
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
