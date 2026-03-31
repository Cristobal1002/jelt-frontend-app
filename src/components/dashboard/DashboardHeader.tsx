import { Button } from "@/components/ui/button";
import { JeltLogo } from "@/components/branding/JeltLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Download, Plus, LogOut, PackagePlus, LayoutTemplate } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { useDashboardDialogs } from "@/contexts/DashboardDialogsContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
export function DashboardHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { setLayoutMode } = useLayoutMode();
  const { openAddProduct, openCreateOrder } = useDashboardDialogs();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed out",
      description: "You've successfully signed out.",
    });
    navigate("/auth");
  };

  const handleExportCSV = async () => {
    try {
      toast({
        title: "Export feature",
        description: "This feature will be available once inventory endpoints are implemented in the backend.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export error",
        description: "There was a problem exporting the data.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="max-w-[1600px] mx-auto px-6 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-4 min-h-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <JeltLogo className="h-14 max-h-14 sm:h-16 sm:max-h-16 w-auto max-w-[200px] sm:max-w-[220px] shrink-0" />
              <div className="min-w-0 flex flex-col justify-center gap-0">
                <h1 className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] tracking-tight leading-tight">
                  Hospital Jelt
                </h1>
                <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] leading-tight hidden sm:block mt-0.5">
                  Insumos médicos · inventario
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-input-border"
              onClick={() => setLayoutMode("classic")}
              title="Vista con menú lateral"
            >
              <LayoutTemplate className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Vista clásica</span>
            </Button>
            <ThemeToggle />
            <Button onClick={handleExportCSV} variant="ghost" size="sm" className="hover:bg-[hsl(var(--muted))]">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => openAddProduct()}
              variant="outline"
              size="sm"
              className="border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
            >
              <PackagePlus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button onClick={() => openCreateOrder()} size="sm" className="shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Order
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="hover:bg-[hsl(var(--muted))]">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
