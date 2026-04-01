import { Button } from "@/components/ui/button";
import { JeltLogo } from "@/components/branding/JeltLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Plus, LogOut, PackagePlus, LayoutTemplate, MoreVertical, PanelTop } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useDashboardDialogs } from "@/contexts/DashboardDialogsContext";
import { NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { mainNavItems } from "@/components/layout/mainNavItems";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { layoutMode, setLayoutMode } = useLayoutMode();
  const { openAddProduct, openCreateOrder } = useDashboardDialogs();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You've successfully signed out.",
    });
    navigate("/auth");
  };

  const handleExportCSV = () => {
    toast({
      title: "Export feature",
      description: "This feature will be available once inventory endpoints are implemented in the backend.",
      variant: "default",
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 sm:py-2.5">
        <div className="flex items-center gap-3 min-h-0 min-w-0">
          <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
            <JeltLogo className="h-12 max-h-12 sm:h-14 sm:max-h-14 md:h-16 md:max-h-16 w-auto max-w-[160px] sm:max-w-[200px] md:max-w-[220px] shrink-0" />
            <div className="min-w-0 hidden flex-col justify-center gap-0 sm:flex sm:flex-col">
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-[hsl(var(--foreground))] tracking-tight leading-tight truncate">
                Hospital Jelt
              </h1>
              <p className="text-[10px] sm:text-[11px] md:text-xs text-[hsl(var(--muted-foreground))] leading-tight hidden md:block mt-0.5">
                Insumos médicos · inventario
              </p>
            </div>
          </div>

          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto overflow-y-hidden py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Navegación principal"
          >
            {mainNavItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1.5 text-[11px] font-medium transition-colors sm:gap-1.5 sm:px-2 sm:py-1.5 sm:text-xs md:text-sm whitespace-nowrap",
                    isActive
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                  )
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
                <span className="hidden min-[400px]:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 border-input-border"
                  aria-label="Más opciones"
                  title="Más opciones"
                >
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
                <DropdownMenuItem onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </DropdownMenuItem>
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
        </div>
      </div>
    </header>
  );
}
