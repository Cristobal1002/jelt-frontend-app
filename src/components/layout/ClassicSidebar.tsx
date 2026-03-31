import { Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { JeltLogo } from "@/components/branding/JeltLogo";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  ClipboardList,
  FileSpreadsheet,
  Package,
  LineChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/orders", label: "Órdenes", icon: ClipboardList },
  { to: "/billing", label: "Facturación", icon: FileSpreadsheet },
  { to: "/inventory", label: "Inventario", icon: Package },
  { to: "/analysis", label: "Análisis", icon: LineChart },
] as const;

export function ClassicSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useLayoutMode();

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/auth");
  };

  return (
    <aside
      className={cn(
        "relative isolate z-10 flex h-full min-h-0 shrink-0 flex-col border-r border-[hsl(var(--border))]",
        "transition-[width] duration-200 ease-in-out motion-reduce:transition-none",
        sidebarCollapsed ? "w-[4.5rem]" : "w-56",
        /* Light: degradado (card → teal → muted) + brillo; dark: plano como el dashboard */
        "bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--primary))]/[0.14] to-[hsl(var(--muted))]/80",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-[hsl(var(--primary))]/25 before:via-[hsl(var(--primary))]/[0.06] before:to-transparent",
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-32 after:bg-gradient-to-t after:from-transparent after:to-[hsl(var(--primary))]/[0.08]",
        "dark:bg-[hsl(var(--background))] dark:[background-image:none] dark:before:hidden dark:after:hidden",
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "relative z-10 flex h-14 shrink-0 items-center justify-center bg-[hsl(var(--card))]/50 backdrop-blur-[1px] dark:bg-background dark:backdrop-blur-none",
          sidebarCollapsed ? "border-0 px-2" : "border-b border-[hsl(var(--border))]/60 px-4",
        )}
      >
        <JeltLogo
          className={cn(
            "object-contain object-center mx-auto transition-all duration-200",
            sidebarCollapsed
              ? "h-[44px] max-h-[44px] w-auto max-w-[56px] min-h-0 min-w-0"
              : "h-[55px] max-h-[55px] w-auto max-w-[220px]",
          )}
        />
      </div>
      <nav
        className={cn(
          "relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden",
          sidebarCollapsed ? "items-center gap-1 px-2 py-2" : "gap-0.5 p-3",
        )}
        aria-label="Navegación principal"
      >
        {items.map((item) => {
          const { to, label, icon: Icon } = item;
          const end = "end" in item ? item.end : undefined;
          const linkClass = ({ isActive }: { isActive: boolean }) =>
            cn(
              "text-sm font-medium transition-colors",
              sidebarCollapsed
                ? cn(
                    "mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isActive
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "text-[hsl(var(--foreground))]/85 hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                  )
                : cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5",
                    isActive
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
                  ),
            );

          const linkEl = (
            <NavLink to={to} end={end} className={linkClass} title={sidebarCollapsed ? label : undefined}>
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "shrink-0 transition-[width,height,filter] duration-150",
                      sidebarCollapsed
                        ? isActive
                          ? "h-[22px] w-[22px] drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]"
                          : "h-5 w-5"
                        : "h-4 w-4",
                    )}
                    strokeWidth={sidebarCollapsed ? (isActive ? 2.4 : 1.75) : 2}
                    aria-hidden
                  />
                  {!sidebarCollapsed ? <span className="truncate">{label}</span> : null}
                </>
              )}
            </NavLink>
          );

          if (sidebarCollapsed) {
            return (
              <Tooltip key={to} delayDuration={0}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="font-medium">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <Fragment key={to}>{linkEl}</Fragment>;
        })}
      </nav>

      <div className={cn("relative z-10 shrink-0", sidebarCollapsed ? "p-2" : "p-3")}>
        <div
          className={cn(
            "rounded-lg bg-[hsl(var(--muted))]/50 dark:bg-background",
            sidebarCollapsed ? "flex justify-center border-0 p-2 shadow-none" : "border border-[hsl(var(--border))] p-3 shadow-sm",
          )}
        >
          <div className={cn("flex gap-3", sidebarCollapsed ? "flex-col items-center" : "items-center justify-between")}>
            {!sidebarCollapsed ? (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-tight">Hospital Jelt</p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 leading-snug">
                  Insumos médicos · inventario
                </p>
              </div>
            ) : null}
            {sidebarCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl border-0 text-[hsl(var(--foreground))] shadow-none hover:bg-[hsl(var(--muted))]"
                    onClick={handleLogout}
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" strokeWidth={1.85} aria-hidden />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Cerrar sesión
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 border-input-border"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>

      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            aria-expanded={!sidebarCollapsed}
            aria-label={sidebarCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            className={cn(
              "absolute right-0 top-1/2 z-30 -translate-y-1/2 translate-x-1/2",
              "flex h-8 w-8 items-center justify-center rounded-full",
              "bg-background text-[hsl(var(--foreground))] shadow-md transition-colors",
              sidebarCollapsed ? "border-0" : "border border-[hsl(var(--border))]",
              "hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]",
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14} className="font-medium">
          {sidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        </TooltipContent>
      </Tooltip>
    </aside>
  );
}
