import { Outlet } from "react-router-dom";
import { LayoutModeProvider } from "@/contexts/LayoutModeContext";
import { DashboardDialogsProvider } from "@/contexts/DashboardDialogsContext";
import { AppShellLayout } from "./AppShellLayout";

export function ProtectedAppLayout() {
  return (
    <LayoutModeProvider>
      <DashboardDialogsProvider>
        <AppShellLayout />
      </DashboardDialogsProvider>
    </LayoutModeProvider>
  );
}
