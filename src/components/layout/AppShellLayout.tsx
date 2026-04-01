import { Outlet } from "react-router-dom";
import { useLayoutMode } from "@/contexts/LayoutModeContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClassicSidebar } from "./ClassicSidebar";
import { ClassicAppHeader } from "./ClassicAppHeader";

export function AppShellLayout() {
  const { layoutMode } = useLayoutMode();

  if (layoutMode === "classic") {
    return (
      <div className="flex h-[100dvh] min-h-0 w-full overflow-hidden bg-background">
        <ClassicSidebar />
        <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <ClassicAppHeader />
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-background">
      <DashboardHeader />
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain">
        <Outlet />
      </main>
    </div>
  );
}
